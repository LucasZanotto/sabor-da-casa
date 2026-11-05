import { useEffect, useState, type Dispatch } from 'react'
import { ArrowLeft, Bike, Check, MessageCircle, Minus, Plus, Store, Trash2, X } from 'lucide-react'
import { STORE, brl } from '../data'
import {
  choicesLabel,
  deliveryFee,
  lineTotal,
  orderMessage,
  productOf,
  whatsappLink,
  type CartAction,
  type CartItem,
  type Checkout,
} from '../lib/cart'
import { Sheet } from './Sheet'


const CHECKOUT_KEY = 'sabor:checkout'
const EMPTY: Checkout = { name: '', mode: 'delivery', street: '', number: '', district: '', complement: '', payment: 'pix', change: '' }

function loadCheckout(): Checkout {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(CHECKOUT_KEY) || '{}') }
  } catch {
    return EMPTY
  }
}

export function CartSheet({ items, dispatch, onClose }: { items: CartItem[]; dispatch: Dispatch<CartAction>; onClose: () => void }) {
  const [step, setStep] = useState<'cart' | 'checkout' | 'sent'>('cart')
  const [form, setForm] = useState<Checkout>(loadCheckout)
  const [touched, setTouched] = useState(false)

  const subtotal = items.reduce((s, i) => s + lineTotal(i), 0)
  const fee = deliveryFee(subtotal, form.mode)
  const total = subtotal + fee
  const belowMin = subtotal < STORE.minOrder
  const toFree = STORE.freeDeliveryFrom - subtotal

  useEffect(() => {
    if (items.length === 0 && step === 'cart') onClose()
  }, [items.length, step, onClose])

  const set = <K extends keyof Checkout>(k: K, v: Checkout[K]) => setForm((f) => ({ ...f, [k]: v }))

  const errors = {
    name: form.name.trim().length < 2,
    street: form.mode === 'delivery' && !form.street.trim(),
    number: form.mode === 'delivery' && !form.number.trim(),
    district: form.mode === 'delivery' && !form.district.trim(),
  }
  const valid = !Object.values(errors).some(Boolean)

  const send = () => {
    setTouched(true)
    if (!valid) return
    try {
      const { name, mode, street, number, district, complement, payment } = form
      localStorage.setItem(CHECKOUT_KEY, JSON.stringify({ name, mode, street, number, district, complement, payment }))
    } catch {
      /* ok */
    }
    window.open(whatsappLink(orderMessage(items, form)), '_blank', 'noopener')
    dispatch({ type: 'clear' })
    setStep('sent')
  }

  const input = (k: keyof Checkout, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => {
    const err = touched && (errors as Record<string, boolean>)[k]
    return (
      <label className="grid gap-1 text-sm font-medium">
        {label}
        <input
          value={form[k] as string}
          onChange={(e) => set(k, e.target.value as never)}
          className={`rounded-xl border bg-paper px-3.5 py-2.5 text-base font-normal outline-none focus:border-tomato ${err ? 'border-tomato' : 'border-line'}`}
          aria-invalid={err || undefined}
          {...props}
        />
      </label>
    )
  }

  return (
    <Sheet label="Sacola" onClose={onClose}>
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        {step === 'checkout' ? (
          <button onClick={() => setStep('cart')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper">
            <ArrowLeft size={18} />
          </button>
        ) : (
          <span className="w-9" />
        )}
        <h2 className="flex-1 text-center font-display text-xl">
          {step === 'cart' ? 'Sua sacola' : step === 'checkout' ? 'Finalizar pedido' : 'Pedido enviado'}
        </h2>
        <button onClick={onClose} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {step === 'sent' && (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-basil/10 text-basil">
              <Check size={32} />
            </div>
            <h3 className="mt-4 font-display text-2xl">Pedido pronto no WhatsApp!</h3>
            <p className="mx-auto mt-2 max-w-xs text-muted">
              É só tocar em <b>enviar</b> na conversa que abriu. A loja confirma o pedido e o tempo de {form.mode === 'delivery' ? 'entrega' : 'retirada'} por lá.
            </p>
            <button onClick={onClose} className="mt-8 w-full rounded-xl bg-ink py-3.5 font-semibold text-white">
              Voltar ao cardápio
            </button>
          </div>
        )}

        {step === 'cart' && (
          <>
            {form.mode === 'delivery' && (
              <div className="mx-4 mt-4 rounded-xl bg-paper p-3 text-sm">
                {toFree > 0 ? (
                  <>
                    Faltam <b>{brl(toFree)}</b> para a <b className="text-basil">entrega grátis</b>
                  </>
                ) : (
                  <b className="text-basil">🎉 Você ganhou entrega grátis!</b>
                )}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-basil transition-all" style={{ width: `${Math.min(100, (subtotal / STORE.freeDeliveryFrom) * 100)}%` }} />
                </div>
              </div>
            )}
            <ul className="divide-y divide-line px-4">
              {items.map((i) => {
                const p = productOf(i.productId)
                const opts = choicesLabel(p, i.choices)
                return (
                  <li key={i.key} className="flex gap-3 py-4">
                    <img src={p.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-snug">{p.name}</p>
                      {opts && <p className="text-sm text-muted">{opts}</p>}
                      {i.note && <p className="text-sm italic text-muted">“{i.note}”</p>}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-semibold">{brl(lineTotal(i))}</span>
                        <div className="flex items-center rounded-lg border border-line">
                          <button
                            onClick={() => dispatch(i.qty === 1 ? { type: 'remove', key: i.key } : { type: 'qty', key: i.key, delta: -1 })}
                            aria-label={i.qty === 1 ? 'Remover' : 'Diminuir'}
                            className="grid h-8 w-8 place-items-center text-tomato"
                          >
                            {i.qty === 1 ? <Trash2 size={15} /> : <Minus size={15} />}
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                          <button onClick={() => dispatch({ type: 'qty', key: i.key, delta: 1 })} aria-label="Aumentar" className="grid h-8 w-8 place-items-center text-tomato">
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {step === 'checkout' && (
          <div className="grid gap-5 p-4">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-paper p-1.5">
              {(
                [
                  ['delivery', 'Entrega', <Bike key="b" size={16} />, STORE.deliveryTime],
                  ['pickup', 'Retirada', <Store key="s" size={16} />, STORE.pickupTime],
                ] as const
              ).map(([id, label, icon, time]) => (
                <button
                  key={id}
                  onClick={() => set('mode', id)}
                  className={`rounded-xl px-3 py-2.5 text-sm transition ${form.mode === id ? 'bg-card font-semibold shadow-sm' : 'text-muted'}`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {icon} {label}
                  </span>
                  <span className="block text-xs font-normal text-muted">{time}</span>
                </button>
              ))}
            </div>

            {input('name', 'Seu nome', { autoComplete: 'name', placeholder: 'Quem vai receber?' })}

            {form.mode === 'delivery' ? (
              <div className="grid gap-3">
                <div className="grid grid-cols-[1fr_96px] gap-3">
                  {input('street', 'Rua', { autoComplete: 'address-line1' })}
                  {input('number', 'Número', { inputMode: 'numeric' })}
                </div>
                {input('district', 'Bairro')}
                {input('complement', 'Complemento (opcional)', { placeholder: 'Apto, bloco, referência…' })}
              </div>
            ) : (
              <p className="rounded-xl bg-paper p-3 text-sm text-muted">
                📍 Retire em: <b className="text-ink">{STORE.address}</b>
              </p>
            )}

            <div>
              <p className="mb-2 text-sm font-medium">Pagamento</p>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ['pix', 'Pix'],
                    ['cartao', 'Cartão'],
                    ['dinheiro', 'Dinheiro'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => set('payment', id)}
                    className={`rounded-xl border py-2.5 text-sm font-medium transition ${
                      form.payment === id ? 'border-tomato bg-tomato/5 text-tomato-dark' : 'border-line'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {form.payment === 'dinheiro' && (
                <div className="mt-3">{input('change', 'Troco para quanto? (opcional)', { inputMode: 'decimal', placeholder: 'Ex.: 100' })}</div>
              )}
              {form.payment === 'cartao' && <p className="mt-2 text-xs text-muted">A maquininha vai até você.</p>}
              {form.payment === 'pix' && <p className="mt-2 text-xs text-muted">A chave Pix é enviada na confirmação pelo WhatsApp.</p>}
            </div>
          </div>
        )}
      </div>

      {step !== 'sent' && (
        <div className="border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <dl className="mb-3 grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-muted">Subtotal</dt>
            <dd className="text-right">{brl(subtotal)}</dd>
            {form.mode === 'delivery' && (
              <>
                <dt className="text-muted">Entrega</dt>
                <dd className={`text-right ${fee === 0 ? 'font-semibold text-basil' : ''}`}>{fee === 0 ? 'Grátis' : brl(fee)}</dd>
              </>
            )}
            <dt className="text-base font-semibold">Total</dt>
            <dd className="text-right text-base font-semibold">{brl(total)}</dd>
          </dl>
          {belowMin ? (
            <p className="rounded-xl bg-paper py-3.5 text-center text-sm text-muted">
              Pedido mínimo de {brl(STORE.minOrder)} · faltam <b className="text-ink">{brl(STORE.minOrder - subtotal)}</b>
            </p>
          ) : step === 'cart' ? (
            <button onClick={() => setStep('checkout')} className="w-full rounded-xl bg-tomato py-3.5 font-semibold text-white transition hover:bg-tomato-dark">
              Continuar
            </button>
          ) : (
            <button
              onClick={send}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] py-3.5 font-semibold text-ink transition hover:brightness-105"
            >
              <MessageCircle size={18} /> Enviar pedido pelo WhatsApp
            </button>
          )}
          {step === 'checkout' && touched && !valid && <p className="mt-2 text-center text-sm text-tomato-dark">Preencha os campos destacados.</p>}
        </div>
      )}
    </Sheet>
  )
}
