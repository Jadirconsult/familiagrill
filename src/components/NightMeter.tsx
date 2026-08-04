import { useEffect, useState } from 'react'
import { formatCountdown, formatMinutes, getStatus } from '../lib/hours'

/**
 * O medidor da noite — o elemento assinatura da página.
 * A casa abre às 18h e fecha às 2h. Esse intervalo é desenhado como
 * uma faixa de brasa: quanto mais tarde, mais quente. Quando estamos abertos,
 * um ponto marca a hora atual e conta quanto ainda resta.
 */
export function NightMeter() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const status = getStatus(now)
  const marks = [18, 20, 22, 24, 26]
  const span = { start: 18 * 60, end: 26 * 60 }
  const toPercent = (minutes: number) =>
    ((minutes - span.start) / (span.end - span.start)) * 100

  const currentMinutes = status.open
    ? now.getHours() * 60 + now.getMinutes() + (now.getHours() < 12 ? 24 * 60 : 0)
    : null

  return (
    <div className="w-full max-w-xl">
      <div className="flex items-baseline justify-between gap-4">
        <span className="eyebrow">A noite de hoje</span>
        <span
          className={`font-mono text-xs font-bold tracking-widest uppercase ${
            status.open ? 'text-gold' : 'text-smoke'
          }`}
        >
          {status.open ? '● Aberto agora' : '○ Fechado'}
        </span>
      </div>

      <div className="relative mt-3 h-11">
        {/* Trilho: frio às 18h, brasa alta de madrugada. */}
        <div
          className={`absolute inset-x-0 top-3 h-2 rounded-full ${
            status.open
              ? 'bg-gradient-to-r from-char via-ember to-gold'
              : 'bg-char'
          }`}
        />

        {currentMinutes !== null && (
          <div
            className="absolute top-0 -ml-2 transition-[left] duration-1000 ease-out"
            style={{ left: `${Math.min(Math.max(toPercent(currentMinutes), 0), 100)}%` }}
          >
            <span className="block size-4 rounded-full bg-cream ring-4 ring-ember/40" />
          </div>
        )}

        <div className="absolute inset-x-0 top-7 flex justify-between">
          {marks.map((hour) => (
            <span key={hour} className="font-mono text-[10px] text-smoke">
              {String(hour % 24).padStart(2, '0')}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-6 font-mono text-sm text-smoke">
        {status.open ? (
          <>
            Grelha acesa até as{' '}
            <strong className="font-bold text-cream">{formatMinutes(status.closesAt)}</strong>
            {' — '}
            faltam {formatCountdown(status.minutesLeft)}.
          </>
        ) : (
          <>
            A brasa volta{' '}
            <strong className="font-bold text-cream">{status.nextOpenLabel}</strong>.
          </>
        )}
      </p>
    </div>
  )
}
