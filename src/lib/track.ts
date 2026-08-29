/**
 * Medição de conversão.
 *
 * O problema que isto resolve: todo pedido sai da página. O visitante clica e
 * vai para o 99Food, o iFood, o WhatsApp ou o cardápio digital, e o site nunca
 * soube quantos pedidos gerou nem qual canal funciona. Sem esse número não dá
 * para decidir nada — nem se vale anunciar, nem onde.
 *
 * Fica desligado até existir um identificador configurado. Sem
 * VITE_GA_ID nem VITE_ADS_ID no ambiente, nenhum script de terceiro é baixado
 * e nenhum dado sai do navegador: `registra` vira uma função vazia. Isso é
 * deliberado — ligar a medição sem a política de privacidade publicada seria
 * coletar dado sem aviso, o que a LGPD não permite e o Google Ads recusa.
 *
 * Para ligar: preencha as variáveis no ambiente de build (e nos secrets do
 * GitHub, porque o Vite embute o valor no bundle) DEPOIS de publicar a página
 * de privacidade.
 */

const identificadores = [
  import.meta.env.VITE_GA_ID,
  import.meta.env.VITE_ADS_ID,
].filter((id): id is string => Boolean(id))

/** Há algum medidor configurado? Falso em desenvolvimento, por padrão. */
export const medicaoLigada = identificadores.length > 0

/** Os eventos que contam como conversão. Nomes fixos: o painel do Google os agrupa por nome. */
export type Evento =
  | 'pedido_99food'
  | 'pedido_ifood'
  | 'whatsapp'
  | 'cardapio_digital'
  | 'rota_mapa'
  | 'instagram'
  | 'reserva_enviada'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let iniciado = false

/**
 * Baixa o gtag na primeira vez que algo precisa ser registrado, e não na
 * abertura da página. O script do Google custa uma conexão e ~50 kB; a maioria
 * das visitas termina sem nenhum clique de conversão, e essas não deviam pagar
 * por ele. Quem clica já está de saída — o custo cai onde não atrapalha.
 */
function inicia() {
  if (iniciado || !medicaoLigada) return
  iniciado = true

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }

  window.gtag('js', new Date())
  for (const id of identificadores) window.gtag('config', id)

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${identificadores[0]}`
  document.head.appendChild(script)
}

/**
 * Registra uma conversão.
 *
 * `valor` existe para o lance automático do Google Ads ter o que otimizar: sem
 * ele, um clique no mapa vale o mesmo que um pedido fechado. O número certo é
 * o ticket médio multiplicado pela taxa de conclusão estimada no app — e ainda
 * não foi confirmado com a casa, por isso é opcional.
 */
export function registra(evento: Evento, dados: Record<string, unknown> = {}) {
  if (!medicaoLigada) return
  inicia()
  window.gtag?.('event', evento, dados)
}
