import { useEffect, useMemo, useRef, useState } from 'react'
import { Bike, Clock, MapPin, Search, ShoppingBag, X } from 'lucide-react'
import { CATEGORIES, PRODUCTS, STORE, brl, startingPrice, type Product } from './data'
import { lineTotal, storeStatus, useCart } from './lib/cart'
import { ProductSheet } from './components/ProductSheet'
import { CartSheet } from './components/CartSheet'

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function App() {
  const { items, dispatch } = useCart()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(CATEGORIES[0].id)
  const [product, setProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [bump, setBump] = useState(0)
  const navRef = useRef<HTMLDivElement>(null)
  const status = useMemo(() => storeStatus(), [])

  const count = items.reduce((s, i) => s + i.qty, 0)
  const subtotal = items.reduce((s, i) => s + lineTotal(i), 0)

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return PRODUCTS
    return PRODUCTS.filter((p) => normalize(`${p.name} ${p.description}`).includes(q))
  }, [query])

  const sections = CATEGORIES.map((c) => ({ ...c, products: filtered.filter((p) => p.category === c.id) })).filter(
    (c) => c.products.length > 0,
  )

  // destaca a categoria visível na barra (scrollspy)
  useEffect(() => {
    const els = CATEGORIES.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-130px 0px -60% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [sections.length])

  // mantém a aba ativa visível na barra horizontal
  useEffect(() => {
    navRef.current?.querySelector<HTMLElement>(`[data-cat="${active}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [active])

  const goTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 118, behavior: 'smooth' })
  }

  return (
    <div className="pb-28">
      {/* CAPA */}
      <header className="relative">
        <div className="h-44 overflow-hidden sm:h-64">
          <img src="/img/capa.webp" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 h-44 bg-gradient-to-b from-black/10 to-black/50 sm:h-64" />
        </div>
        <div className="mx-auto max-w-5xl px-4">
          <div className="relative -mt-14 rounded-3xl border border-line bg-card p-5 shadow-[0_20px_50px_-25px_rgba(0,0,0,.35)] sm:p-7">
            <div className="flex items-start gap-4">
              <img src="/favicon.svg" alt="" className="h-16 w-16 shrink-0 rounded-2xl shadow-md sm:h-20 sm:w-20" />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-3xl leading-tight sm:text-4xl">{STORE.name}</h1>
                <p className="text-muted">{STORE.tagline}</p>
                <span
                  className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    status.open ? 'bg-basil/10 text-basil' : 'bg-tomato/10 text-tomato-dark'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${status.open ? 'bg-basil' : 'bg-tomato'}`} />
                  {status.label}
                </span>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line text-center text-sm">
              <Info icon={<Bike size={16} />} top={STORE.deliveryTime} bottom="entrega" />
              <Info icon={<span className="text-xs font-bold">R$</span>} top={brl(STORE.deliveryFee)} bottom={`grátis acima de ${brl(STORE.freeDeliveryFrom).replace(',00', '')}`} />
              <Info icon={<ShoppingBag size={16} />} top={brl(STORE.minOrder)} bottom="pedido mínimo" />
            </div>
            <p className="mt-4 flex items-start gap-2 text-sm text-muted">
              <MapPin size={16} className="mt-0.5 shrink-0" /> {STORE.address}
            </p>
          </div>
        </div>
      </header>

      {/* BUSCA + CATEGORIAS */}
      <div className="sticky top-0 z-30 mt-6 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 pt-3">
          <label className="flex items-center gap-2 rounded-2xl border border-line bg-card px-4 py-2.5 focus-within:border-tomato">
            <Search size={18} className="text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar no cardápio"
              className="w-full bg-transparent text-base outline-none placeholder:text-muted"
              aria-label="Buscar no cardápio"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Limpar busca" className="text-muted hover:text-ink">
                <X size={18} />
              </button>
            )}
          </label>
          <nav ref={navRef} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-3" aria-label="Categorias">
            {sections.map((c) => (
              <button
                key={c.id}
                data-cat={c.id}
                onClick={() => goTo(c.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active === c.id ? 'bg-ink text-white' : 'bg-card text-ink ring-1 ring-line hover:ring-ink/30'
                }`}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* PRODUTOS */}
      <main className="mx-auto max-w-5xl px-4">
        {sections.length === 0 && (
          <div className="py-20 text-center text-muted">
            <p className="text-4xl">🔎</p>
            <p className="mt-3">Nenhum item encontrado para “{query}”.</p>
          </div>
        )}
        {sections.map((c) => (
          <section key={c.id} id={c.id} className="pt-8">
            <h2 className="mb-4 font-display text-2xl">
              {c.emoji} {c.name}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {c.products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProduct(p)}
                  className="group flex gap-4 rounded-2xl border border-line bg-card p-3 text-left transition hover:border-ink/20 hover:shadow-[0_10px_30px_-18px_rgba(0,0,0,.4)]"
                >
                  <div className="flex min-w-0 flex-1 flex-col py-1 pl-1">
                    {p.badge && (
                      <span
                        className={`mb-1.5 w-fit rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                          p.badge === 'Vegetariano' ? 'bg-basil/10 text-basil' : 'bg-tomato/10 text-tomato-dark'
                        }`}
                      >
                        {p.badge}
                      </span>
                    )}
                    <h3 className="font-semibold leading-snug">{p.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{p.description}</p>
                    <p className="mt-auto pt-2 font-semibold">
                      {(p.groups ?? []).some((g) => g.min > 0 && g.options.some((o) => o.price > 0)) && (
                        <span className="text-xs font-normal text-muted">a partir de </span>
                      )}
                      {brl(startingPrice(p))}
                    </p>
                  </div>
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-32">
                    <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    <span className="absolute bottom-1.5 right-1.5 grid h-8 w-8 place-items-center rounded-full bg-white text-lg font-semibold text-tomato shadow-md">
                      +
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}

        <footer className="mt-16 border-t border-line pt-6 text-center text-sm text-muted">
          <p className="flex items-center justify-center gap-1.5">
            <Clock size={14} /> Ter a qui 18h–23h30 · Sex a dom almoço e jantar · Seg fechado
          </p>
          <p className="mt-2">
            Projeto demonstrativo · desenvolvido por{' '}
            <a href="https://github.com/LucasZanotto" target="_blank" rel="noopener" className="font-medium text-tomato hover:underline">
              Lucas Zanotto
            </a>
          </p>
        </footer>
      </main>

      {/* BARRA DO CARRINHO */}
      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={() => setCartOpen(true)}
            className="mx-auto flex w-full max-w-xl items-center justify-between rounded-2xl bg-tomato px-5 py-4 font-semibold text-white shadow-[0_15px_40px_-10px_rgba(226,85,45,.7)] transition hover:bg-tomato-dark"
          >
            <span key={bump} className="grid h-7 min-w-7 animate-pop place-items-center rounded-full bg-white/20 px-2 text-sm">
              {count}
            </span>
            <span>Ver sacola</span>
            <span>{brl(subtotal)}</span>
          </button>
        </div>
      )}

      {product && (
        <ProductSheet
          product={product}
          onClose={() => setProduct(null)}
          onAdd={(item) => {
            dispatch({ type: 'add', item })
            setProduct(null)
            setBump((b) => b + 1)
          }}
        />
      )}
      {cartOpen && <CartSheet items={items} dispatch={dispatch} onClose={() => setCartOpen(false)} />}
    </div>
  )
}

function Info({ icon, top, bottom }: { icon: React.ReactNode; top: string; bottom: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2 py-3">
      <span className="text-tomato">{icon}</span>
      <span className="font-semibold">{top}</span>
      <span className="text-[11px] leading-tight text-muted">{bottom}</span>
    </div>
  )
}
