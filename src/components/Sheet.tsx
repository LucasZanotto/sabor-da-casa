import { useEffect, useRef } from 'react'

/** Painel que sobe de baixo no celular e vira modal centralizado no desktop. */
export function Sheet({ label, onClose, children }: { label: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex animate-fade items-end justify-center bg-black/50 sm:items-center sm:p-6" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[94svh] w-full max-w-lg animate-sheet flex-col overflow-hidden rounded-t-3xl bg-card outline-none sm:rounded-3xl"
      >
        {children}
      </div>
    </div>
  )
}
