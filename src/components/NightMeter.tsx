import { useEffect, useState } from 'react'
import {
  formatCountdown,
  formatMinutes,
  nightPercent,
  statusOfAll,
  toNightMinutes,
  type ServiceStatus,
} from '../lib/hours'

/**
 * O medidor da noite — o elemento assinatura da página.
 * A noite da casa vai do primeiro pedido, às 17h30, ao fim do atendimento
 * presencial, às 2h. Esse intervalo é a régua; cada janela é desenhada sobre ela
 * como uma faixa de brasa, e um ponto marca a hora atual na janela que está
 * valendo agora.
 */

/** As marcas de hora cheia que cabem na régua sem virar ruído. */
const MARKS = [18, 20, 22, 24, 26]

export function NightMeter() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const [pedido, salao] = statusOfAll(now)
  const position = nightPercent(toNightMinutes(now))

  return (
    <div className="w-full max-w-xl">
      <div className="flex items-baseline justify-between gap-4">
        <span className="eyebrow">A noite de hoje</span>
        <span
          className={`font-mono text-xs font-bold tracking-widest uppercase ${
            pedido.open || salao.open ? 'text-gold' : 'text-smoke'
          }`}
        >
          {statusLabel(pedido, salao)}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {[pedido, salao].map((status) => (
          <Track key={status.service.id} status={status} position={position} />
        ))}
      </div>

      {/* As marcas ficam na posição real que ocupam na régua, não distribuídas
          por igual: a régua começa às 17h30, então as 18h não são o zero. */}
      <div className="relative mt-2 h-4" aria-hidden>
        {MARKS.map((hour) => {
          const percent = nightPercent(hour * 60)
          return (
            <span
              key={hour}
              className="absolute font-mono text-[10px] tabular-nums text-smoke"
              style={
                percent > 96
                  ? { right: 0 }
                  : { left: `${percent}%`, transform: 'translateX(-50%)' }
              }
            >
              {String(hour % 24).padStart(2, '0')}
            </span>
          )
        })}
      </div>

      {/* Frase de leitura, não leitura de instrumento: vai em Archivo. */}
      <p className="mt-6 text-sm leading-relaxed text-smoke">
        {salao.open ? (
          <>
            Grelha acesa até as{' '}
            <strong className="font-bold text-cream">
              {formatMinutes(salao.service.close)}
            </strong>
            {' — '}
            faltam {formatCountdown(salao.minutesLeft)}.{' '}
            {pedido.open
              ? `Ainda dá para pedir por mais ${formatCountdown(pedido.minutesLeft)}.`
              : 'O último pedido já entrou.'}
          </>
        ) : pedido.open ? (
          <>
            A cozinha já está pegando pedido. O salão abre às{' '}
            <strong className="font-bold text-cream">
              {formatMinutes(salao.service.open)}
            </strong>
            .
          </>
        ) : (
          <>
            A brasa volta{' '}
            <strong className="font-bold text-cream">{pedido.opensLabel}</strong> para
            pedido, e o salão abre às {formatMinutes(salao.service.open)}.
          </>
        )}
      </p>
    </div>
  )
}

function statusLabel(pedido: ServiceStatus, salao: ServiceStatus): string {
  if (pedido.open && salao.open) return '● Aberto agora'
  if (pedido.open) return '● Só para pedido'
  if (salao.open) return '● Só no salão'
  return '○ Fechado'
}

function Track({ status, position }: { status: ServiceStatus; position: number }) {
  const { service, open } = status
  const from = nightPercent(service.open)
  const to = nightPercent(service.close)

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] font-bold tracking-widest text-cream uppercase">
          {service.name}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-smoke">
          {formatMinutes(service.open)} — {formatMinutes(service.close)}
        </span>
      </div>

      <div className="relative mt-2 h-4">
        <div className="absolute inset-x-0 top-1 h-2 rounded-full bg-char/70" />
        <div
          className={`absolute top-1 h-2 rounded-full ${
            open ? 'bg-gradient-to-r from-ember to-gold' : 'bg-char'
          }`}
          style={{ left: `${from}%`, right: `${100 - to}%` }}
        />
        {open && (
          <div
            className="marker absolute top-0 -ml-2 transition-[left] duration-1000 ease-out"
            style={{ left: `${position}%` }}
          >
            <span className="block size-4 rounded-full bg-cream ring-4 ring-ember/40" />
          </div>
        )}
      </div>

      <span className="sr-only">
        {service.scope}, das {formatMinutes(service.open)} às{' '}
        {formatMinutes(service.close)}.{' '}
        {open ? 'Valendo agora.' : `Recomeça ${status.opensLabel}.`}
      </span>
    </div>
  )
}
