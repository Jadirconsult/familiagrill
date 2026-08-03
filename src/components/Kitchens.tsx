import { kitchens } from '../data/site'
import { useReveal } from '../hooks/useReveal'

const accent = {
  ember: { text: 'text-ember', rule: 'bg-ember', hover: 'hover:border-ember/60' },
  flare: { text: 'text-gold', rule: 'bg-gold', hover: 'hover:border-gold/60' },
  cold: { text: 'text-sage', rule: 'bg-sage', hover: 'hover:border-sage/60' },
} as const

export function Kitchens() {
  return (
    <section id="cozinhas" className="border-t border-char py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="eyebrow">Três cozinhas, um salão</p>
        <h2 className="display mt-4 max-w-3xl text-[clamp(1.75rem,4.5vw,3.25rem)] text-cream">
          Duas trabalham com fogo. Uma trabalha contra ele.
        </h2>

        <div className="mt-14 grid gap-px bg-char md:grid-cols-3">
          {kitchens.map((kitchen, index) => (
            <KitchenCard key={kitchen.id} kitchen={kitchen} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function KitchenCard({
  kitchen,
  index,
}: {
  kitchen: (typeof kitchens)[number]
  index: number
}) {
  const ref = useReveal<HTMLDivElement>(index * 110)
  const tone = accent[kitchen.heat]

  return (
    <div
      ref={ref}
      className={`reveal group border border-transparent bg-coal p-8 transition-colors sm:p-10 ${tone.hover}`}
    >
      <span className={`block h-1 w-12 ${tone.rule}`} aria-hidden />
      <h3 className="display mt-6 text-4xl text-cream">{kitchen.name}</h3>
      <p className={`mt-3 font-mono text-[11px] tracking-widest uppercase ${tone.text}`}>
        {kitchen.temperature}
      </p>
      <p className="mt-6 text-lg leading-snug text-cream">{kitchen.lede}</p>
      <p className="mt-3 text-sm leading-relaxed text-smoke">{kitchen.detail}</p>
    </div>
  )
}
