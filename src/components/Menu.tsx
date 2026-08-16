import { useState, type KeyboardEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { brand, kitchens, menu } from '../data/site'
import { useReveal } from '../hooks/useReveal'

const accent = {
  ember: 'text-ember',
  flare: 'text-gold',
  cold: 'text-sage',
} as const

export function Menu() {
  const [active, setActive] = useState(kitchens[0].id)
  const ref = useReveal<HTMLDivElement>()

  const kitchen = kitchens.find((k) => k.id === active)!
  const items = menu.find((m) => m.kitchen === active)?.items ?? []

  function selectByOffset(offset: number) {
    const current = kitchens.findIndex((k) => k.id === active)
    const next = kitchens[(current + offset + kitchens.length) % kitchens.length]
    setActive(next.id)
    requestAnimationFrame(() => document.getElementById(`aba-${next.id}`)?.focus())
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      selectByOffset(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      selectByOffset(-1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActive(kitchens[0].id)
      requestAnimationFrame(() => document.getElementById(`aba-${kitchens[0].id}`)?.focus())
    } else if (event.key === 'End') {
      event.preventDefault()
      setActive(kitchens[kitchens.length - 1].id)
      requestAnimationFrame(() =>
        document.getElementById(`aba-${kitchens[kitchens.length - 1].id}`)?.focus(),
      )
    }
  }

  return (
    <section id="cardapio" className="border-t border-char bg-soot py-20 sm:py-28">
      <div ref={ref} className="reveal shell">
        <div className="flex flex-wrap items-end justify-between gap-6 sm:gap-8">
          <div>
            <p className="eyebrow">O que sai da cozinha</p>
            <h2 className="display mt-4 text-[clamp(1.75rem,4.5vw,3.25rem)] text-cream">
              Alguns destaques
            </h2>
          </div>

          <a
            href={brand.menuUrl}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex min-h-11 items-center gap-2 font-mono text-xs font-bold tracking-widest text-gold uppercase"
          >
            <span>Cardápio completo e preços</span>
            <ArrowUpRight
              className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </a>
        </div>

        <div className="mt-12 flex flex-wrap gap-2" role="tablist" aria-label="Cozinhas">
          {kitchens.map((k) => (
            <button
              key={k.id}
              id={`aba-${k.id}`}
              role="tab"
              type="button"
              aria-selected={active === k.id}
              aria-controls={`painel-${k.id}`}
              tabIndex={active === k.id ? 0 : -1}
              onClick={() => setActive(k.id)}
              onKeyDown={handleTabKeyDown}
              className={`min-h-11 px-5 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-colors ${
                active === k.id
                  ? 'bg-cream text-coal'
                  : 'border border-char text-smoke hover:border-smoke hover:text-cream'
              }`}
            >
              {k.name}
            </button>
          ))}
        </div>

        <div
          id={`painel-${kitchen.id}`}
          role="tabpanel"
          aria-labelledby={`aba-${kitchen.id}`}
          tabIndex={0}
          className="mt-10"
        >
          <p className={`font-mono text-[11px] tracking-widest uppercase ${accent[kitchen.heat]}`}>
            {kitchen.temperature}
          </p>

          <ul className="mt-6 divide-y divide-char border-y border-char">
            {items.map((item) => (
              // Nome e descrição só se dividem em duas colunas quando cabem lado
              // a lado: abaixo de 1024px o nome longo era espremido em três linhas.
              <li
                key={item.name}
                className="flex flex-col gap-1.5 py-5 lg:flex-row lg:items-baseline lg:justify-between lg:gap-8"
              >
                <span className="display text-xl text-cream sm:text-2xl">{item.name}</span>
                <span className="text-sm leading-relaxed text-smoke lg:max-w-sm lg:text-right">
                  {item.note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
