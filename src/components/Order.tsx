import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import {
  deliveryApps,
  directChannels,
  orderService,
  primaryChannel,
  type OrderChannel,
} from '../data/site'
import { formatCountdown, formatMinutes, statusOf } from '../lib/hours'
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

        <OrderWindow />

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

/**
 * A página inteira sabe que horas são, mas era justamente aqui — no momento da
 * compra — que ela não consultava o relógio: os dois cartões acendiam iguais à
 * 1h50, quinze minutos depois de a cozinha parar de aceitar pedido.
 */
function OrderWindow() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const status = statusOf(now, orderService)

  return (
    <p
      role="status"
      className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-xs leading-relaxed"
    >
      <span
        className={`font-bold tracking-widest uppercase ${
          status.open ? 'text-gold' : 'text-smoke'
        }`}
      >
        {status.open ? '● Aceitando pedido' : '○ Fora do horário de pedido'}
      </span>
      <span className="text-smoke">
        {status.open
          ? `O último entra às ${formatMinutes(orderService.close)} — faltam ${formatCountdown(status.minutesLeft)}.`
          : `A cozinha volta a aceitar ${status.opensLabel}.`}
      </span>
    </p>
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
        {/* Sem opacidade: carvão a 70% sobre o ouro dava 4,0:1 e reprovava em AA
            justamente no cartão de conversão. Em opacidade cheia dá 6,52:1, e a
            hierarquia já está garantida pelos 11px contra os 48px do nome. */}
        <span
          className={`font-mono text-[11px] font-bold tracking-[0.3em] uppercase ${
            featured ? 'text-coal' : 'text-gold'
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
