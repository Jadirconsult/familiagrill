import { ArrowUpRight } from 'lucide-react'
import { deliveryApps, directChannels, primaryChannel, type OrderChannel } from '../data/site'
import { useReveal } from '../hooks/useReveal'

export function Order() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section id="pedir" className="border-t border-char py-20 sm:py-28">
      <div ref={ref} className="reveal shell">
        <p className="eyebrow">Peça de casa</p>
        <h2 className="display mt-4 max-w-3xl text-[clamp(1.75rem,4.5vw,3.25rem)] text-cream">
          A brasa também sai para entrega
        </h2>

        {/* Os dois apps dividem a largura: mesmo tamanho, tratamentos diferentes.
            O preferido da casa é o único preenchido; o outro vem em contorno. */}
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {deliveryApps.map((app) => (
            <AppCard key={app.id} channel={app} featured={app.id === primaryChannel.id} />
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {directChannels.map((channel) => (
            <a
              key={channel.id}
              href={channel.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-4 border border-char px-5 py-5 transition-colors hover:border-gold sm:gap-6 sm:px-8"
            >
              <span>
                <span className="display block text-xl text-cream">{channel.name}</span>
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
    </section>
  )
}

function AppCard({ channel, featured }: { channel: OrderChannel; featured: boolean }) {
  return (
    <a
      href={channel.url}
      target="_blank"
      rel="noreferrer"
      className={`group flex min-h-56 flex-col justify-between gap-8 p-8 transition-colors sm:min-h-64 sm:gap-10 sm:p-10 md:p-8 lg:p-10 ${
        featured
          ? 'bg-gold text-coal hover:bg-cream'
          : 'border border-gold/40 text-cream hover:border-gold hover:bg-soot'
      }`}
    >
      <div>
        <span
          className={`font-mono text-[11px] font-bold tracking-[0.3em] uppercase ${
            featured ? 'opacity-70' : 'text-gold'
          }`}
        >
          {featured ? 'Nosso app preferido' : 'Também entregamos por aqui'}
        </span>
        <p className="display mt-4 text-4xl sm:text-5xl">{channel.name}</p>
        <p className="mt-4 max-w-xs text-base leading-snug">{channel.note}</p>
      </div>

      <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase">
        Abrir o {channel.name}
        <ArrowUpRight
          className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </span>
    </a>
  )
}
