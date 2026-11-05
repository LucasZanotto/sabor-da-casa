import { useState } from 'react'
import { Check, Minus, Plus, X } from 'lucide-react'
import { brl, type OptionGroup, type Product } from '../data'
import { unitPrice, type CartItem, type Choices } from '../lib/cart'
import { Sheet } from './Sheet'

const groupHint = (g: OptionGroup) =>
  g.min > 0 ? (g.max === 1 ? 'Escolha 1' : `Escolha de ${g.min} a ${g.max}`) : g.max === 1 ? 'Opcional' : `Até ${g.max} opções`

export function ProductSheet({
  product,
  onClose,
  onAdd,
}: {
  product: Product
  onClose: () => void
  onAdd: (item: Omit<CartItem, 'key'>) => void
}) {
  const groups = product.groups ?? []
  const [choices, setChoices] = useState<Choices>({})
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const [showErrors, setShowErrors] = useState(false)

  const toggle = (g: OptionGroup, optId: string) => {
    setChoices((prev) => {
      const cur = prev[g.id] ?? []
      if (g.max === 1) return { ...prev, [g.id]: cur[0] === optId && g.min === 0 ? [] : [optId] }
      if (cur.includes(optId)) return { ...prev, [g.id]: cur.filter((x) => x !== optId) }
      if (cur.length >= g.max) return prev
      return { ...prev, [g.id]: [...cur, optId] }
    })
  }

  const missing = groups.filter((g) => (choices[g.id]?.length ?? 0) < g.min)
  const total = unitPrice(product, choices) * qty

  const submit = () => {
    if (missing.length) {
      setShowErrors(true)
      document.getElementById(`group-${missing[0].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    onAdd({ productId: product.id, qty, choices, note })
  }

  return (
    <Sheet label={product.name} onClose={onClose}>
      <div className="flex-1 overflow-y-auto">
        <div className="relative">
          <img src={product.image} alt={product.name} className="aspect-[16/10] w-full object-cover" />
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow hover:bg-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <h2 className="font-display text-2xl">{product.name}</h2>
          <p className="mt-1.5 text-muted">{product.description}</p>
          <p className="mt-3 text-lg font-semibold">{brl(product.price)}</p>
        </div>

        {groups.map((g) => {
          const selected = choices[g.id] ?? []
          const error = showErrors && selected.length < g.min
          return (
            <fieldset key={g.id} id={`group-${g.id}`} className="scroll-mt-2">
              <legend className="contents" />
              <div className={`flex items-center justify-between px-5 py-3 ${error ? 'bg-tomato/10' : 'bg-paper'}`}>
                <div>
                  <p className="font-semibold">{g.name}</p>
                  <p className={`text-xs ${error ? 'font-semibold text-tomato-dark' : 'text-muted'}`}>{groupHint(g)}</p>
                </div>
                {g.min > 0 && (
                  <span
                    className={`rounded-md px-2 py-1 text-[11px] font-bold uppercase ${
                      selected.length >= g.min ? 'bg-basil/10 text-basil' : 'bg-ink text-white'
                    }`}
                  >
                    {selected.length >= g.min ? <Check size={12} /> : 'Obrigatório'}
                  </span>
                )}
              </div>
              <ul className="divide-y divide-line px-5">
                {g.options.map((o) => {
                  const on = selected.includes(o.id)
                  const disabled = !on && g.max > 1 && selected.length >= g.max
                  return (
                    <li key={o.id}>
                      <button
                        type="button"
                        onClick={() => toggle(g, o.id)}
                        disabled={disabled}
                        aria-pressed={on}
                        className="flex w-full items-center gap-3 py-3.5 text-left disabled:opacity-40"
                      >
                        <span className="flex-1">
                          <span className="block">{o.name}</span>
                          {o.price > 0 && <span className="text-sm text-muted">+ {brl(o.price)}</span>}
                        </span>
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center border-2 transition ${g.max === 1 ? 'rounded-full' : 'rounded-md'} ${
                            on ? 'border-tomato bg-tomato text-white' : 'border-line'
                          }`}
                        >
                          {on && <Check size={14} strokeWidth={3} />}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </fieldset>
          )
        })}

        <div className="p-5">
          <label className="block text-sm font-semibold" htmlFor="note">
            Alguma observação?
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 140))}
            rows={2}
            placeholder="Ex.: sem cebola, molho à parte…"
            className="mt-2 w-full resize-none rounded-xl border border-line bg-paper px-3.5 py-2.5 text-base outline-none focus:border-tomato"
          />
          <p className="text-right text-xs text-muted">{note.length}/140</p>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center rounded-xl border border-line">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty === 1} aria-label="Diminuir" className="grid h-12 w-11 place-items-center text-tomato disabled:text-line">
            <Minus size={18} />
          </button>
          <span className="w-6 text-center font-semibold" aria-live="polite">
            {qty}
          </span>
          <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Aumentar" className="grid h-12 w-11 place-items-center text-tomato">
            <Plus size={18} />
          </button>
        </div>
        <button
          onClick={submit}
          className={`flex h-12 flex-1 items-center justify-between rounded-xl px-5 font-semibold text-white transition ${
            missing.length ? 'bg-ink/40' : 'bg-tomato hover:bg-tomato-dark'
          }`}
        >
          <span>Adicionar</span>
          <span>{brl(total)}</span>
        </button>
      </div>
    </Sheet>
  )
}
