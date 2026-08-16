import type { SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/**
 * Há credenciais para falar com o banco?
 *
 * Só um booleano, calculado a partir das variáveis de ambiente — de propósito.
 * A landing precisa saber isso na primeira renderização para decidir se mostra
 * o formulário ou o aviso, e essa pergunta não deve custar o download da
 * biblioteca inteira.
 */
export const isSupabaseConfigured = Boolean(url && key)

let client: Promise<SupabaseClient | null> | null = null

/**
 * O cliente, carregado sob demanda e uma vez só.
 *
 * O `@supabase/supabase-js` é a maior dependência do projeto e a esmagadora
 * maioria das visitas nunca reserva mesa: ele viajava no bundle principal para
 * todo mundo que abria a página no celular. Agora chega junto com o envio da
 * reserva ou com a abertura do painel da equipe.
 *
 * Devolve `null` quando não há credenciais, espelhando o contrato anterior.
 */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null)

  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(url as string, key as string),
  )

  return client
}
