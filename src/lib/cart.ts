import { useEffect, useReducer } from 'react'
import { HOURS, PRODUCTS, STORE, brl, type Product } from '../data'

/** groupId -> ids das opções escolhidas */
export type Choices = Record<string, string[]>

export type CartItem = {
  key: string
  productId: string
  qty: number
  choices: Choices
  note: string
}

export type CartAction =
  | { type: 'add'; item: Omit<CartItem, 'key'> }
  | { type: 'qty'; key: string; delta: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' }

const STORAGE_KEY = 'sabor:cart'

/** Mesmo produto + mesmas opções + mesma observação = mesma linha do carrinho */
const itemKey = (i: Omit<CartItem, 'key' | 'qty'>) =>
  `${i.productId}|${Object.keys(i.choices).sort().map((g) => `${g}:${[...i.choices[g]].sort().join(',')}`).join(';')}|${i.note.trim()}`

function reducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const key = itemKey(action.item)
      const found = state.find((i) => i.key === key)
      if (found) return state.map((i) => (i.key === key ? { ...i, qty: i.qty + action.item.qty } : i))
      return [...state, { ...action.item, key }]
    }
    case 'qty':
      return state.map((i) => (i.key === action.key ? { ...i, qty: i.qty + action.delta } : i)).filter((i) => i.qty > 0)
    case 'remove':
      return state.filter((i) => i.key !== action.key)
    case 'clear':
      return []
  }
}

function load(): CartItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CartItem[]
    return raw.filter((i) => PRODUCTS.some((p) => p.id === i.productId))
  } catch {
    return []
  }
}

export function useCart() {
  const [items, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* sem storage: o carrinho vive só na sessão */
    }
  }, [items])
  return { items, dispatch }
}

// ---------- preços ----------
export const productOf = (id: string) => PRODUCTS.find((p) => p.id === id)!

export function unitPrice(p: Product, choices: Choices) {
  let total = p.price
  for (const g of p.groups ?? []) {
    for (const optId of choices[g.id] ?? []) total += g.options.find((o) => o.id === optId)?.price ?? 0
  }
  return total
}

export const lineTotal = (i: CartItem) => unitPrice(productOf(i.productId), i.choices) * i.qty

export function choicesLabel(p: Product, choices: Choices) {
  return (p.groups ?? [])
    .flatMap((g) => (choices[g.id] ?? []).map((id) => g.options.find((o) => o.id === id)?.name))
    .filter(Boolean)
    .join(', ')
}

// ---------- horário ----------
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h === 0 && m === 0 ? 24 * 60 : h * 60 + m
}

export function storeStatus(now = new Date()): { open: boolean; label: string } {
  const day = now.getDay()
  const min = now.getHours() * 60 + now.getMinutes()
  const today = HOURS[day]
  const current = today.find(([a, b]) => min >= toMin(a) && min < toMin(b))
  if (current) return { open: true, label: `Aberto até ${current[1]}` }

  const later = today.find(([a]) => toMin(a) > min)
  if (later) return { open: false, label: `Fechado · abre hoje às ${later[0]}` }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7
    if (HOURS[d].length) {
      const name = i === 1 ? 'amanhã' : ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][d]
      return { open: false, label: `Fechado · abre ${name} às ${HOURS[d][0][0]}` }
    }
  }
  return { open: false, label: 'Fechado' }
}

// ---------- pedido ----------
export type Checkout = {
  name: string
  mode: 'delivery' | 'pickup'
  street: string
  number: string
  district: string
  complement: string
  payment: 'pix' | 'cartao' | 'dinheiro'
  change: string
}

export function deliveryFee(subtotal: number, mode: Checkout['mode']) {
  if (mode === 'pickup' || subtotal >= STORE.freeDeliveryFrom) return 0
  return STORE.deliveryFee
}

const PAYMENT_LABEL = { pix: 'Pix', cartao: 'Cartão na entrega', dinheiro: 'Dinheiro' }

export function orderMessage(items: CartItem[], c: Checkout) {
  const subtotal = items.reduce((s, i) => s + lineTotal(i), 0)
  const fee = deliveryFee(subtotal, c.mode)
  const lines = [`*Novo pedido — ${STORE.name}*`, '']

  for (const i of items) {
    const p = productOf(i.productId)
    lines.push(`*${i.qty}x ${p.name}* — ${brl(lineTotal(i))}`)
    const opts = choicesLabel(p, i.choices)
    if (opts) lines.push(`   ↳ ${opts}`)
    if (i.note.trim()) lines.push(`   ↳ Obs: ${i.note.trim()}`)
  }

  lines.push('', `Subtotal: ${brl(subtotal)}`)
  if (c.mode === 'delivery') lines.push(`Entrega: ${fee === 0 ? 'grátis' : brl(fee)}`)
  lines.push(`*Total: ${brl(subtotal + fee)}*`, '')
  lines.push(`👤 ${c.name.trim()}`)

  if (c.mode === 'delivery') {
    lines.push(`🛵 Entrega: ${c.street.trim()}, ${c.number.trim()} — ${c.district.trim()}`)
    if (c.complement.trim()) lines.push(`   ${c.complement.trim()}`)
  } else {
    lines.push('🏃 Retirada no balcão')
  }

  let pay = `💳 Pagamento: ${PAYMENT_LABEL[c.payment]}`
  if (c.payment === 'dinheiro' && c.change.trim()) pay += ` (troco para R$ ${c.change.trim()})`
  lines.push(pay)
  return lines.join('\n')
}

export const whatsappLink = (text: string) => `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`
