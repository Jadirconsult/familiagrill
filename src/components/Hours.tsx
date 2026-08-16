import { useEffect, useState } from 'react'
import { hours, services } from '../data/site'
import { formatMinutes } from '../lib/hours'
import { useReveal } from '../hooks/useReveal'

export function Hours() {
  const [today, setToday] = useState(() => new Date().getDay())
  const ref = useReveal<HTMLDivElement>()

  useEffect(() => {
    const id = setInterval(() => setToday(new Date().getDay()), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <section id="horarios" className="border-t border-char py-20 sm:py-28">
      <div ref={ref} className="reveal shell">
        <p className="eyebrow">Quando a grelha acende</p>
        <h2 className="display mt-4 max-w-3xl text-[clamp(1.75rem,4.5vw,3.25rem)] text-cream">
          Todo dia. O pedido às 17h30, a mesa às 18h.
        </h2>

        {/* Duas janelas, não sete linhas iguais: o que muda na semana não é o
            dia, é o que a casa está fazendo em cada faixa da noite. */}
        <dl className="mt-12 grid gap-px bg-char sm:mt-14 md:grid-cols-2">
          {services.map((service) => (
            <div key={service.id} className="bg-coal p-8 sm:p-10">
              <dt>
                <span className="brand-mark">{service.name}</span>
                <span className="eyebrow mt-2 block">{service.scope}</span>
              </dt>
              <dd className="mt-5">
                <span className="display block text-[clamp(2rem,7vw,3rem)] tabular-nums text-cream">
                  {formatMinutes(service.open)}
                  <span className="mx-2 text-smoke">—</span>
                  {formatMinutes(service.close)}
                </span>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-smoke">
                  {service.note}
                </p>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-4">
          <p className="eyebrow">Todos os dias</p>
          <ul className="flex flex-wrap gap-2">
            {hours.map((day) => {
              const isToday = day.day === today
              return (
                <li
                  key={day.day}
                  aria-current={isToday ? 'date' : undefined}
                  className={`border px-3 py-2 font-mono text-[11px] font-bold tracking-widest uppercase ${
                    isToday ? 'border-gold text-gold' : 'border-char text-smoke'
                  }`}
                >
                  {day.short}
                  {isToday && <span className="sr-only"> (hoje)</span>}
                </li>
              )
            })}
          </ul>
        </div>

        <p className="mt-8 max-w-md font-mono text-xs leading-relaxed text-smoke">
          Sem folga na semana: a casa abre todo dia, e a madrugada pertence à noite
          anterior — 1h de quarta ainda é a terça-feira à mesa.
        </p>
      </div>
    </section>
  )
}
