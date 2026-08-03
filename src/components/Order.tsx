import { ArrowUpRight } from 'lucide-react'
import { orderChannels, primaryChannel } from '../data/site'
import { useReveal } from '../hooks/useReveal'

export function Order() {
  const ref = useReveal<HTMLDivElement>()
  const others = orderChannels.filter((channel) => channel.id !== primaryChannel.id)

  return (
    <section id="pedir" className="border-t border-char py-20 sm:py-28">
      <div ref={ref} className="reveal mx-auto max-w-6xl px-5 sm:px-8">
        <p className="eyebrow">Peça de casa</p>
        <h2 className="display mt-4 max-w-3xl text-[clamp(1.75rem,4.5vw,3.25rem)] text-cream">
          A brasa também sai para entrega
        </h2>

        <div className="mt-12 grid gap-px bg-char lg:grid-cols-[1.4fr_1fr]">
          {/* O canal prioritário ganha o bloco maior e o único fundo cheio. */}
          <a
            href={primaryChannel.url}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col justify-between gap-10 bg-gold p-8 text-coal transition-colors hover:bg-cream sm:p-10"
          >
            <div>
              <span className="font-mono text-[11px] font-bold tracking-[0.3em] uppercase opacity-70">
                Nosso app preferido
              </span>
              <p className="display mt-4 text-5xl">{primaryChannel.name}</p>
              <p className="mt-4 max-w-xs text-base leading-snug">{primaryChannel.note}</p>
            </div>

            <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase">
              Abrir o {primaryChannel.name}
              <ArrowUpRight
                className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </span>
          </a>

          <div className="grid gap-px bg-char">
            {others.map((channel) => (
              <a
                key={channel.id}
                href={channel.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-6 bg-coal p-6 transition-colors hover:bg-soot sm:px-8"
              >
                <span>
                  <span className="display block text-2xl text-cream">{channel.name}</span>
                  <span className="mt-1 block text-sm text-smoke">{channel.note}</span>
                </span>
                <ArrowUpRight
                  className="size-5 shrink-0 text-smoke transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold"
                  aria-hidden
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
