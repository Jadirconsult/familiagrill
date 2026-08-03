import { hours, isOpenDay, type DayHours } from '../data/site'

/** Horários passam da meia-noite, então tudo vive em minutos desde as 00:00 do dia de abertura. */
const DAY = 24 * 60

export function formatMinutes(minutes: number): string {
  const m = ((minutes % DAY) + DAY) % DAY
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${String(h).padStart(2, '0')}h${mm ? String(mm).padStart(2, '0') : ''}`
}

export function findDay(day: number): DayHours {
  return hours.find((h) => h.day === day)!
}

export type Status =
  | { open: true; closesAt: number; minutesLeft: number; today: DayHours }
  | { open: false; nextDay: DayHours; nextOpenLabel: string }

/**
 * Aberto agora? Considera tanto o turno que começou hoje quanto o de ontem
 * que ainda não terminou — a madrugada de sábado pertence à sexta.
 */
export function getStatus(now: Date): Status {
  const minutes = now.getHours() * 60 + now.getMinutes()
  const todayIndex = now.getDay()

  const yesterday = findDay((todayIndex + 6) % 7)
  if (isOpenDay(yesterday) && yesterday.close > DAY && minutes < yesterday.close - DAY) {
    const closesAt = yesterday.close - DAY
    return { open: true, closesAt, minutesLeft: closesAt - minutes, today: yesterday }
  }

  const today = findDay(todayIndex)
  if (isOpenDay(today) && minutes >= today.open && minutes < today.close) {
    return {
      open: true,
      closesAt: today.close,
      minutesLeft: today.close - minutes,
      today,
    }
  }

  // Fechado: procura o próximo turno, começando por hoje se ainda não abriu.
  for (let i = 0; i < 7; i++) {
    const candidate = findDay((todayIndex + i) % 7)
    if (!isOpenDay(candidate)) continue
    if (i === 0 && minutes >= candidate.open) continue
    const when = i === 0 ? 'hoje' : i === 1 ? 'amanhã' : candidate.label.toLowerCase()
    return {
      open: false,
      nextDay: candidate,
      nextOpenLabel: `${when} às ${formatMinutes(candidate.open)}`,
    }
  }

  return { open: false, nextDay: findDay(5), nextOpenLabel: 'sexta às 18h' }
}

/**
 * A casa está aberta no momento escolhido para a reserva?
 * Usa a mesma tabela de horários exibida na página — uma fonte de verdade só.
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
