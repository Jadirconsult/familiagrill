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
              id={`aba-${k.id}`}
              role="tab"
              type="button"
              aria-selected={active === k.id}
              aria-controls={`painel-${k.id}`}
              tabIndex={active === k.id ? 0 : -1}
              onClick={() => setActive(k.id)}
              onKeyDown={handleTabKeyDown}
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

          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.name}
                className="group border border-char bg-coal transition-colors hover:border-smoke"
              >
                <div className="aspect-[4/3] overflow-hidden bg-soot">
                  {item.image ? (
                    /* Sem alt descritivo de propósito: o nome do prato vem logo
                       abaixo, e repeti-lo aqui só duplicaria a leitura em tela. */
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  ) : (
                    /* Sem foto: a inicial do prato na cor da cozinha. Marca o
                       lugar sem fingir que é uma imagem do prato. */
                    <span
                      aria-hidden
                      className={`display flex size-full items-center justify-center text-[clamp(3rem,8vw,5rem)] opacity-25 ${accent[kitchen.heat]}`}
                    >
                      {item.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="display text-xl text-cream">{item.name}</h3>
                  <p className="mt-2 text-sm text-smoke">{item.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
