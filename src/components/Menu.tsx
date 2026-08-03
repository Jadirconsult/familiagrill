import { useState } from 'react'
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

  return (
    <section id="cardapio" className="border-t border-char bg-soot py-20 sm:py-28">
      <div ref={ref} className="reveal mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
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
            className="group inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-gold uppercase"
          >
            Cardápio completo e preços
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
              role="tab"
              type="button"
              aria-selected={active === k.id}
              aria-controls={`painel-${k.id}`}
              onClick={() => setActive(k.id)}
              className={`px-5 py-2.5 font-mono text-xs font-bold tracking-widest uppercase transition-colors ${
                active === k.id
                  ? 'bg-cream text-coal'
                  : 'border border-char text-smoke hover:border-smoke hover:text-cream'
              }`}
            >
              {k.name}
            </button>
          ))}
        </div>

        <div id={`painel-${kitchen.id}`} role="tabpanel" className="mt-10">
          <p className={`font-mono text-[11px] tracking-widest uppercase ${accent[kitchen.heat]}`}>
            {kitchen.temperature}
          </p>

          <ul className="mt-6 divide-y divide-char border-y border-char">
            {items.map((item) => (
              <li
                key={item.name}
                className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <span className="display text-2xl text-cream">{item.name}</span>
                <span className="text-sm text-smoke sm:max-w-sm sm:text-right">{item.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
