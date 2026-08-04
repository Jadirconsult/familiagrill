import { useEffect, useState } from 'react'
import { hours, isOpenDay } from '../data/site'
import { formatMinutes } from '../lib/hours'
import { useReveal } from '../hooks/useReveal'

const SPAN_START = 18 * 60
const SPAN_END = 29 * 60

export function Hours() {
  const [today, setToday] = useState(() => new Date().getDay())
  const ref = useReveal<HTMLDivElement>()

  useEffect(() => {
    const id = setInterval(() => setToday(new Date().getDay()), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <section id="horarios" className="border-t border-char py-20 sm:py-28">
      <div ref={ref} className="reveal mx-auto max-w-6xl px-5 sm:px-8">
        <p className="eyebrow">Quando a grelha acende</p>
        <h2 className="display mt-4 max-w-3xl text-[clamp(1.75rem,4.5vw,3.25rem)] text-cream">
          Toda noite começa às 18h. O fim depende do dia.
        </h2>

        <div className="mt-14 space-y-1">
          {hours.map((day) => {
            const isToday = day.day === today
            const shift = isOpenDay(day) ? day : null

            return (
              <div
                key={day.day}
                className={`grid grid-cols-[3.5rem_1fr] items-center gap-4 py-3 sm:grid-cols-[5rem_1fr_7rem] ${
                  isToday ? 'text-cream' : 'text-smoke'
                }`}
              >
                <span className="font-mono text-xs font-bold tracking-widest">
                  {day.short}
                </span>

                <div className="relative h-2.5">
                  <div className="absolute inset-0 rounded-full bg-char/70" />
                  {shift && (
                    <div
                      className={`absolute inset-y-0 rounded-full ${
                        isToday ? 'bg-gradient-to-r from-ember to-gold' : 'bg-char'
                      }`}
                      style={{
                        left: `${((shift.open - SPAN_START) / (SPAN_END - SPAN_START)) * 100}%`,
                        right: `${100 - ((shift.close - SPAN_START) / (SPAN_END - SPAN_START)) * 100}%`,
                      }}
                    />
                  )}
                </div>

                <span className="col-span-2 font-mono text-xs sm:col-span-1 sm:text-right">
                  {shift
                    ? `${formatMinutes(shift.open)} — ${formatMinutes(shift.close)}`
                    : 'Fechado'}
                </span>
              </div>
            )
          })}
        </div>

        <p className="mt-10 max-w-md font-mono text-xs leading-relaxed text-smoke">
          A barra representa a noite inteira, das 18h às 5h. O dia de hoje aparece
          aceso.
        </p>
      </div>
    </section>
  )
}
