/**
 * Máscaras e validações do formulário de reserva, em formato brasileiro.
 * Os campos de data e hora são de texto — os nativos do navegador seguem o
 * idioma do sistema operacional e acabam mostrando mm/dd/aaaa e AM/PM.
 */

export function maskPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function maskDate(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

export function maskTime(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 4)
  if (d.length <= 2) return d
  return `${d.slice(0, 2)}:${d.slice(2)}`
}

/** Telefone brasileiro: 10 dígitos (fixo) ou 11 (celular). */
export function isPhoneComplete(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length === 10 || digits.length === 11
}

/**
 * Converte "31/12/2026" + "23:30" em Date, ou null se a combinação não existe.
 * Rejeita 31/02 e afins — o Date do JavaScript "conserta" sozinho para 03/03,
 * então comparamos o resultado com o que foi digitado.
 */
export function parseDateTime(date: string, time: string): Date | null {
  const d = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date)
  const t = /^(\d{2}):(\d{2})$/.exec(time)
  if (!d || !t) return null

  const [, day, month, year] = d.map(Number) as unknown as number[]
  const [, hours, minutes] = t.map(Number) as unknown as number[]
  if (hours > 23 || minutes > 59) return null

  const parsed = new Date(year, month - 1, day, hours, minutes)
  const survivedRoundTrip =
    parsed.getDate() === day &&
    parsed.getMonth() === month - 1 &&
    parsed.getFullYear() === year
  return survivedRoundTrip ? parsed : null
}

/**
 * Monta o timestamp com o fuso do restaurante fixo em -03:00.
 * A reserva é para o horário de Niterói, mesmo que o visitante esteja em
 * outro fuso — sem o offset, o Postgres assumiria UTC e deslocaria 3 horas.
 */
export function toRestaurantTimestamp(when: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}` +
    `T${pad(when.getHours())}:${pad(when.getMinutes())}:00-03:00`
  )
}

export function formatWhen(when: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(when.getDate())}/${pad(when.getMonth() + 1)}/${when.getFullYear()} às ${pad(when.getHours())}:${pad(when.getMinutes())}`
}
