import { hours, isOpenDay, services, type DayHours, type Service } from '../data/site'

/** Horários passam da meia-noite, então tudo vive em minutos desde as 00:00 do dia de abertura. */
const DAY = 24 * 60

/**
 * A noite inteira da casa, do primeiro pedido ao fim do atendimento presencial.
 * É a régua compartilhada pelo medidor: toda janela é desenhada sobre ela.
 */
export const NIGHT = {
  start: Math.min(...services.map((s) => s.open)),
  end: Math.max(...services.map((s) => s.close)),
}

/** Onde um instante cai na régua da noite, de 0 a 100. */
export function nightPercent(minutes: number): number {
  const raw = ((minutes - NIGHT.start) / (NIGHT.end - NIGHT.start)) * 100
  return Math.min(Math.max(raw, 0), 100)
}

/**
 * Põe um relógio na régua da noite. Antes do meio-dia a madrugada ainda pertence
 * ao turno da véspera, então ela continua a contagem em vez de voltar a zero.
 */
export function toNightMinutes(now: Date): number {
  const minutes = now.getHours() * 60 + now.getMinutes()
  return minutes < 12 * 60 ? minutes + DAY : minutes
}

export function formatMinutes(minutes: number): string {
  const m = ((minutes % DAY) + DAY) % DAY
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${String(h).padStart(2, '0')}h${mm ? String(mm).padStart(2, '0') : ''}`
}

export function findDay(day: number): DayHours {
  return hours.find((h) => h.day === day)!
}

export type ServiceStatus = {
  service: Service
  open: boolean
  /** Quanto falta para fechar, em minutos. Só faz sentido com `open`. */
  minutesLeft: number
  /** Quando essa janela abre de novo, ex.: "hoje às 17h30". */
  opensLabel: string
}

/**
 * A janela está valendo agora? Considera tanto o turno que começou hoje quanto
 * o de ontem que ainda não terminou — a madrugada de sábado pertence à sexta.
 */
export function statusOf(now: Date, service: Service): ServiceStatus {
  const onTheRuler = toNightMinutes(now)
  const open = onTheRuler >= service.open && onTheRuler < service.close

  // A abertura de hoje ainda não chegou enquanto o relógio de parede não passar
  // dela; depois disso, a próxima é a de amanhã.
  const minutes = now.getHours() * 60 + now.getMinutes()
  const when = minutes < service.open ? 'hoje' : 'amanhã'

  return {
    service,
    open,
    minutesLeft: open ? service.close - onTheRuler : 0,
    opensLabel: `${when} às ${formatMinutes(service.open)}`,
  }
}

/** As duas janelas de uma vez, na ordem em que a casa as anuncia. */
export function statusOfAll(now: Date): ServiceStatus[] {
  return services.map((service) => statusOf(now, service))
}

/**
 * A casa atende presencialmente no momento escolhido para a reserva?
 * Usa a tabela de dias derivada do salão — a mesma janela que o SQL aplica no
 * banco. A janela de pedido não vale aqui: reserva é mesa, não entrega.
 */
export function isWithinOpeningHours(when: Date): boolean {
  const minutes = when.getHours() * 60 + when.getMinutes()
  const dayIndex = when.getDay()

  // Turno que começou no dia anterior e atravessou a meia-noite.
  const yesterday = findDay((dayIndex + 6) % 7)
  if (isOpenDay(yesterday) && yesterday.close > DAY && minutes < yesterday.close - DAY) {
    return true
  }

  const today = findDay(dayIndex)
  return isOpenDay(today) && minutes >= today.open && minutes < today.close
}

export function formatCountdown(minutesLeft: number): string {
  const h = Math.floor(minutesLeft / 60)
  const m = minutesLeft % 60
  if (h <= 0) return `${m} min`
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}
