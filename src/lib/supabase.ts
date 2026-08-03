import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/**
 * O cliente é null quando as variáveis não estão configuradas.
 * A landing continua funcionando; só o formulário de reserva fica indisponível
 * e avisa o visitante em vez de quebrar.
 */
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null

export const isSupabaseConfigured = supabase !== null
