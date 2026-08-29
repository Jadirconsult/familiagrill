/**
 * Confere se o banco e o site concordam sobre o expediente da casa.
 *
 * Esta é a única duplicação que sobrou no repositório, e é proposital: o site
 * mostra o horário a partir de src/data/site.ts, mas quem VALIDA a reserva é o
 * Postgres, pela função `dentro_do_expediente`. São duas cópias da mesma regra
 * em lugares que não conversam — e em 29/08/2026 elas estavam divergindo:
 * a migration 20260804_000001_expediente_unico.sql nunca havia sido aplicada,
 * então o site aceitava mesa para 1h30 de uma quarta e o banco recusava, sem
 * ninguém saber.
 *
 * O que este script faz: deriva de `hours` os quatro instantes que importam em
 * cada dia — um minuto antes de abrir, um depois, um antes de fechar, um
 * depois — e pergunta ao banco o que ele acha de cada um. Divergiu, ele diz
 * qual dia, qual horário e o que cada lado respondeu.
 *
 * Fica FORA do `npm run build` de propósito: depende de rede e de credencial, e
 * build não pode quebrar porque o Wi-Fi caiu. Rode com `npm run db:check`
 * depois de mexer em `services`/`hours` ou de aplicar migration.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Credenciais: do ambiente (é assim que o CI as tem) ou do .env.local.
function credenciais() {
  let { VITE_SUPABASE_URL: url, VITE_SUPABASE_PUBLISHABLE_KEY: chave } = process.env
  const local = path.join(raiz, '.env.local')
  if ((!url || !chave) && fs.existsSync(local)) {
    for (const linha of fs.readFileSync(local, 'utf8').split(/\r?\n/)) {
      const m = linha.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
      if (!m) continue
      if (m[1] === 'VITE_SUPABASE_URL') url ||= m[2]
      if (m[1] === 'VITE_SUPABASE_PUBLISHABLE_KEY') chave ||= m[2]
    }
  }
  return { url: url?.replace(/\/$/, ''), chave }
}

const { url, chave } = credenciais()
if (!url || !chave) {
  console.error('db-check: faltam VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.')
  process.exit(1)
}

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'warn' })
const { hours, isOpenDay } = await vite.ssrLoadModule('/src/data/site.ts')
await vite.close()

/**
 * Um instante concreto no fuso da casa. `dia` é o dia da semana em que o turno
 * ABRE; minutos acima de 1440 caem no dia seguinte, que é como o fechamento às
 * 2h é representado em site.ts.
 *
 * O Brasil não tem horário de verão desde 2019, então -03:00 é constante.
 */
function instante(dia, minutos) {
  // Uma segunda-feira qualquer como âncora; o dia da semana é o que importa.
  const base = new Date('2026-09-07T00:00:00-03:00')
  base.setUTCDate(base.getUTCDate() + ((dia - 1 + 7) % 7))
  const t = new Date(base.getTime() + minutos * 60_000)
  const p = (n) => String(n).padStart(2, '0')
  // Formata no fuso -03:00 sem depender do fuso da máquina que roda o script.
  const local = new Date(t.getTime() - 3 * 3_600_000)
  return `${local.getUTCFullYear()}-${p(local.getUTCMonth() + 1)}-${p(local.getUTCDate())}T${p(local.getUTCHours())}:${p(local.getUTCMinutes())}:00-03:00`
}

async function pergunta(quando) {
  const resposta = await fetch(`${url}/rest/v1/rpc/dentro_do_expediente`, {
    method: 'POST',
    headers: {
      apikey: chave,
      Authorization: `Bearer ${chave}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_quando: quando }),
  })
  if (!resposta.ok) {
    throw new Error(`o banco respondeu HTTP ${resposta.status}: ${(await resposta.text()).slice(0, 200)}`)
  }
  return resposta.json()
}

const NOMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const hhmm = (minutos) => {
  const m = ((minutos % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}h${String(m % 60).padStart(2, '0')}`
}

const divergencias = []
let checadas = 0

for (const dia of hours) {
  if (!isOpenDay(dia)) continue
  const pontos = [
    { minutos: dia.open - 1, esperado: false, rotulo: 'um minuto antes de abrir' },
    { minutos: dia.open + 1, esperado: true, rotulo: 'um minuto depois de abrir' },
    { minutos: dia.close - 1, esperado: true, rotulo: 'um minuto antes de fechar' },
    { minutos: dia.close + 1, esperado: false, rotulo: 'um minuto depois de fechar' },
  ]

  for (const ponto of pontos) {
    const quando = instante(dia.day, ponto.minutos)
    const banco = await pergunta(quando)
    checadas++
    if (banco !== ponto.esperado) {
      divergencias.push(
        `${NOMES[dia.day]} ${hhmm(ponto.minutos)} (${ponto.rotulo}): ` +
          `o site diz ${ponto.esperado ? 'ABERTO' : 'FECHADO'}, o banco diz ${banco ? 'ABERTO' : 'FECHADO'}`,
      )
    }
  }
}

if (divergencias.length) {
  console.error(`\ndb-check: o banco e o site discordam em ${divergencias.length} de ${checadas} horários:\n`)
  divergencias.forEach((d) => console.error(`  · ${d}`))
  console.error(
    '\n  O site mostra o horário de src/data/site.ts, mas quem aceita ou recusa a\n' +
      '  reserva é a função dentro_do_expediente, no Postgres. Divergiram porque\n' +
      '  alguma migration de supabase/migrations/ não foi aplicada, ou porque\n' +
      '  site.ts mudou e o SQL não acompanhou. Alinhe os dois e rode de novo.\n',
  )
  process.exit(1)
}

console.log(`db-check: ok — banco e site concordam nos ${checadas} horários de fronteira.`)
