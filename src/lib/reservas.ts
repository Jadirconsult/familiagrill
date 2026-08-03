import { supabase } from './supabase'

const TZ = 'America/Sao_Paulo'

export type Reserva = {
  id: string
  nome: string
  telefone: string
  data_hora: string
  pessoas: number
  observacao: string | null
  status: 'pendente' | 'confirmada' | 'cancelada'
  criado_em: string
}

/** Data-calendário do restaurante, independente do fuso do aparelho da equipe. */
function restaurantDateParts(day: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(day)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '01'
  return `${get('year')}-${get('month')}-${get('day')}`
}

/**
 * A "noite" da casa não coincide com o dia do calendário: o serviço começa às
 * 18h e termina de madrugada. Uma mesa de 1h da manhã de sábado pertence à
 * noite de sexta, então a janela vai do início do dia até as 6h do dia seguinte.
 *
 * Os limites são fixados no horário de Niterói, não no do navegador — a equipe
 * viajando ou um celular com fuso errado veriam o dia trocado.
 */
export function nightWindow(day: Date) {
  const start = new Date(`${restaurantDateParts(day)}T00:00:00-03:00`)
  const end = new Date(start.getTime() + 30 * 60 * 60 * 1000) // 6h do dia seguinte
  return { start, end }
}

/** Avança ou volta um dia sem depender do fuso local. */
export function addDays(day: Date, offset: number): Date {
  return new Date(day.getTime() + offset * 24 * 60 * 60 * 1000)
}

export async function fetchReservas(day: Date): Promise<Reserva[]> {
  if (!supabase) return []
  const { start, end } = nightWindow(day)

  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .gte('data_hora', start.toISOString())
    .lt('data_hora', end.toISOString())
    .order('data_hora', { ascending: true })

  if (error) throw error
  return (data ?? []) as Reserva[]
}

export async function setStatus(id: string, status: Reserva['status']) {
  if (!supabase) return
  const { error } = await supabase.from('reservas').update({ status }).eq('id', id)
  if (error) throw error
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
  }).format(new Date(iso))
}

export function formatDay(day: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    timeZone: TZ,
  }).format(day)
}

export function phoneHref(telefone: string): string {
  const digits = telefone.replace(/\D/g, '')
  return `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}`
}

export function formatPhone(telefone: string): string {
  const d = telefone.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return telefone
}
