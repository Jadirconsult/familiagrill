/**
 * O portão. Roda contra dist/ no fim do build e falha se alguma invariante
 * quebrou — no CI, antes do envio por FTP, para o site não subir errado.
 *
 * A ideia não é checar "boas práticas de SEO" em geral. Cada regra aqui existe
 * porque o problema correspondente já esteve no repositório, ou porque voltaria
 * calado num refactor futuro: página que o robô lê em branco, cardápio pela
 * metade, horário divergindo entre o site e o dado estruturado, alias de
 * preview vazando para produção, arquivo esquecido pesando no 4G da rua.
 *
 * Regra de ouro para quem for mexer: uma checagem que falha sem dizer o que
 * fazer é pior do que checagem nenhuma. Toda falha abaixo diz o arquivo e o
 * caminho de volta.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(raiz, 'dist')
const src = path.join(raiz, 'src')

const HOST = 'https://www.familiagrill.com.br'

/** Orçamentos de peso. Estourar não é aviso: é build reprovado. */
const LIMITES = {
  jsInicialKb: 300,
  imagemKb: 200,
  videoKb: 800,
}

/**
 * Desfaz as entidades HTML antes de medir tamanho de texto. Sem isto, o "&" de
 * "Família Grill & Sushi" viaja como "&amp;" e conta cinco caracteres em vez de
 * um — o título de 58 caracteres era reprovado como se tivesse 62.
 */
const decodifica = (texto) =>
  texto
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

const falhas = []
const avisos = []
const falha = (o, comoResolver) => falhas.push(`${o}\n    → ${comoResolver}`)
const aviso = (o) => avisos.push(o)

// --- o documento publicado ---------------------------------------------------

const indexPath = path.join(dist, 'index.html')
if (!fs.existsSync(indexPath)) {
  console.error('seo-check: dist/index.html não existe.')
  process.exit(1)
}
const html = fs.readFileSync(indexPath, 'utf8')

// 1. A pré-renderização rodou?
if (/<div id="root">\s*<\/div>/.test(html)) {
  falha(
    'O #root do index.html publicado está vazio.',
    'A pré-renderização não rodou. O robô receberia a página em branco. Confira scripts/seo-build.mjs no build.',
  )
}

// 2. A classe `js` não pode estar gravada no arquivo. Ela é aplicada em tempo
//    de execução pelo script do head; se estivesse no HTML, `html.js .reveal`
//    entregaria o conteúdo pré-renderizado com opacity: 0 para quem não executa
//    JavaScript — conteúdo oculto, que o buscador desconta.
if (/<html[^>]*class="[^"]*\bjs\b/.test(html)) {
  falha(
    'O <html> publicado já vem com a classe "js".',
    'Metade da página sairia invisível para quem não roda JavaScript. A classe deve ser aplicada só pelo script em linha do index.html.',
  )
}

// 3. Um h1, nem zero nem dois.
const h1s = html.match(/<h1[\s>]/g) ?? []
if (h1s.length !== 1) {
  falha(
    `A página tem ${h1s.length} elementos <h1>.`,
    'Deve haver exatamente um. Verifique src/components/Hero.tsx.',
  )
}

// 4 e 5. Título e descrição dentro do que a busca mostra sem cortar.
const titulo = decodifica(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? '')
if (!titulo) {
  falha('Não há <title>.', 'Ele é gerado por scripts/seo-build.mjs a partir de src/data/site.ts.')
} else if (titulo.length < 30 || titulo.length > 60) {
  falha(
    `O <title> tem ${titulo.length} caracteres: "${titulo}".`,
    'Fora da faixa de 30 a 60, o Google corta ou reescreve. Ajuste em scripts/seo-build.mjs.',
  )
}

const descricaoBruta = html.match(/<meta name="description" content="([^"]*)"/)?.[1]
const descricao = descricaoBruta === undefined ? undefined : decodifica(descricaoBruta)
if (!descricao) {
  falha('Não há meta description.', 'Ela é gerada por scripts/seo-build.mjs.')
} else if (descricao.length < 120 || descricao.length > 160) {
  falha(
    `A meta description tem ${descricao.length} caracteres.`,
    'Fora da faixa de 120 a 160 ela aparece truncada ou reescrita. Ajuste em scripts/seo-build.mjs.',
  )
}

// 6. Canonical absoluto e no host certo.
const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1]
if (canonical !== `${HOST}/`) {
  falha(
    `O canonical é "${canonical}".`,
    `Tem que ser exatamente ${HOST}/ — o apex responde 301 para cá, então apontar para ele seria apontar para um redirecionamento.`,
  )
}

// 7. O alias de preview não pode vazar para produção.
if (html.includes('vercel.app')) {
  falha(
    'O index.html publicado cita um endereço .vercel.app.',
    'Esse alias é preview de branch, não endereço público. Não pode aparecer em canonical, og: nem JSON-LD.',
  )
}

// 8. O dado estruturado.
const ldRaw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
let ld = null
if (!ldRaw) {
  falha('Não há bloco JSON-LD.', 'Ele é gerado por scripts/seo-build.mjs.')
} else {
  try {
    ld = JSON.parse(ldRaw)
  } catch (erro) {
    falha(`O JSON-LD não faz parse: ${erro.message}`, 'Confira a montagem em scripts/seo-build.mjs.')
  }
}

if (ld) {
  if (ld['@type'] !== 'Restaurant') {
    falha(`O JSON-LD é do tipo "${ld['@type']}".`, 'Tem que ser Restaurant.')
  }

  const expediente = ld.openingHoursSpecification ?? []
  if (expediente.length !== 7) {
    falha(
      `O expediente no JSON-LD tem ${expediente.length} dias.`,
      'A casa abre todo dia; a lista é derivada de `hours` em src/data/site.ts.',
    )
  }
  for (const dia of expediente) {
    if (!/^\d{2}:\d{2}$/.test(dia.opens ?? '') || !/^\d{2}:\d{2}$/.test(dia.closes ?? '')) {
      falha(
        `Horário malformado no JSON-LD: ${dia.dayOfWeek} ${dia.opens}–${dia.closes}.`,
        'O formato tem que ser HH:MM.',
      )
      break
    }
  }

  // O cardápio do dado estruturado tem que bater com o da página. Se alguém
  // voltar a montar só a aba ativa, esta conta acusa antes de o site subir.
  const secoes = ld.hasMenu?.hasMenuSection ?? []
  const paineis = (html.match(/role="tabpanel"/g) ?? []).length
  if (secoes.length !== paineis) {
    falha(
      `O JSON-LD descreve ${secoes.length} cozinhas, mas o HTML publicado traz ${paineis} painéis.`,
      'Os três painéis precisam existir no documento, com `hidden` nos inativos. Ver src/components/Menu.tsx.',
    )
  }
  for (const secao of secoes) {
    if (!html.includes(secao.name)) {
      falha(
        `A cozinha "${secao.name}" está no JSON-LD mas não no HTML publicado.`,
        'O texto da aba precisa estar no documento, escondido ou não.',
      )
    }
  }
}

// 9. A imagem do preview de link precisa existir de verdade.
const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/)?.[1]
if (!ogImage || !ogImage.startsWith('http')) {
  falha(`og:image é "${ogImage}".`, 'Tem que ser URL absoluta — o WhatsApp não resolve caminho relativo.')
} else {
  const arquivo = path.join(dist, ogImage.replace(`${HOST}/`, ''))
  if (!fs.existsSync(arquivo)) {
    falha(
      `og:image aponta para ${ogImage}, que não existe no dist.`,
      'Preview quebrado é invisível para quem publica e evidente para quem recebe.',
    )
  }
}

// --- robots e sitemap --------------------------------------------------------

const robotsPath = path.join(dist, 'robots.txt')
const sitemapPath = path.join(dist, 'sitemap.xml')

if (!fs.existsSync(robotsPath)) {
  falha('Não há dist/robots.txt.', 'Ele vive em public/robots.txt e é copiado pelo Vite.')
}
if (!fs.existsSync(sitemapPath)) {
  falha('Não há dist/sitemap.xml.', 'Ele é gerado por scripts/seo-build.mjs.')
}

if (fs.existsSync(robotsPath) && fs.existsSync(sitemapPath)) {
  const robots = fs.readFileSync(robotsPath, 'utf8')
  const sitemap = fs.readFileSync(sitemapPath, 'utf8')

  if (!robots.includes(`Sitemap: ${HOST}/sitemap.xml`)) {
    falha('O robots.txt não aponta para o sitemap.', `Acrescente "Sitemap: ${HOST}/sitemap.xml".`)
  }

  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  if (locs.length === 0) {
    falha('O sitemap não lista nenhuma URL.', 'Confira scripts/seo-build.mjs.')
  }

  const bloqueios = [...robots.matchAll(/^Disallow:\s*(\S+)/gm)].map((m) => m[1])
  for (const loc of locs) {
    if (!loc.startsWith(HOST)) {
      falha(`O sitemap lista "${loc}".`, `Toda URL tem que estar no host canônico ${HOST}.`)
    }
    const caminho = loc.replace(HOST, '') || '/'
    for (const bloqueio of bloqueios) {
      if (bloqueio !== '/' && caminho.startsWith(bloqueio)) {
        falha(
          `"${caminho}" está no sitemap e bloqueado no robots.txt ("Disallow: ${bloqueio}").`,
          'Listar e barrar a mesma URL é instrução contraditória. Escolha uma.',
        )
      }
    }
  }

  if (locs.length && !/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(sitemap)) {
    falha('O sitemap não tem lastmod em formato de data.', 'Ele vem do último commit, em scripts/seo-build.mjs.')
  }
}

// --- acessibilidade mínima nas imagens --------------------------------------

const imgs = html.match(/<img\b[^>]*>/g) ?? []
for (const img of imgs) {
  if (!/\balt=/.test(img)) {
    falha(
      `Uma <img> sem alt no HTML publicado: ${img.slice(0, 90)}…`,
      'Alt vazio (alt="") é resposta válida para imagem decorativa; ausente, não.',
    )
  }
  if (!/\bwidth=/.test(img) || !/\bheight=/.test(img)) {
    aviso(`<img> sem width/height (pode causar deslocamento de layout): ${img.slice(0, 70)}…`)
  }
}

// --- orçamento de peso -------------------------------------------------------

const kb = (bytes) => Math.round(bytes / 102.4) / 10

// O que o index.html manda baixar de saída — não os pedaços sob demanda.
for (const [, caminho] of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
  const arquivo = path.join(dist, caminho.replace(/^\//, ''))
  if (!fs.existsSync(arquivo)) continue
  const tamanho = kb(fs.statSync(arquivo).size)
  if (tamanho > LIMITES.jsInicialKb) {
    falha(
      `O JavaScript inicial ${caminho} tem ${tamanho} kB.`,
      `O teto é ${LIMITES.jsInicialKb} kB. Mova o que não é da primeira visita para import dinâmico, como já se fez com o Supabase.`,
    )
  }
}

const percorre = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entrada) => {
    const completo = path.join(dir, entrada.name)
    return entrada.isDirectory() ? percorre(completo) : [completo]
  })

for (const arquivo of percorre(dist)) {
  const ext = path.extname(arquivo).toLowerCase()
  const tamanho = kb(fs.statSync(arquivo).size)
  const relativo = path.relative(dist, arquivo).replace(/\\/g, '/')

  if (['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'].includes(ext) && tamanho > LIMITES.imagemKb) {
    falha(
      `A imagem ${relativo} tem ${tamanho} kB.`,
      `O teto é ${LIMITES.imagemKb} kB. Comprima, converta para WebP/AVIF, ou apague se ninguém usa.`,
    )
  }
  if (['.mp4', '.webm'].includes(ext) && tamanho > LIMITES.videoKb) {
    falha(`O vídeo ${relativo} tem ${tamanho} kB.`, `O teto é ${LIMITES.videoKb} kB.`)
  }
}

// --- o que se vigia no código-fonte -----------------------------------------

// Todo link que sai do site tem que passar pelo LinkExterno, que é onde mora a
// medição. Sem esta regra, o próximo botão de pedido nasce sem evento de
// conversão e ninguém percebe até o relatório vir vazio.
//
// Duas exceções, ambas deliberadas: o próprio LinkExterno, que é onde o
// target="_blank" mora; e o painel da equipe, cujo único link externo é o
// WhatsApp do cliente que reservou. Ali quem clica é quem trabalha no salão,
// confirmando a mesa por telefone — contar isso como conversão sujaria
// justamente o número que a medição existe para produzir. O painel também é
// noindex e fica fora do menu, então não há nada de SEO a vigiar nele.
const fontes = percorre(src).filter((f) => f.endsWith('.tsx'))
for (const arquivo of fontes) {
  const nome = path.basename(arquivo)
  if (nome === 'LinkExterno.tsx' || nome === 'Reservas.tsx') continue
  const codigo = fs.readFileSync(arquivo, 'utf8')
  if (codigo.includes('target="_blank"')) {
    falha(
      `${path.relative(raiz, arquivo).replace(/\\/g, '/')} abre link externo direto com target="_blank".`,
      'Use <LinkExterno>, que é onde o evento de conversão é disparado. Ver src/components/LinkExterno.tsx.',
    )
  }
}

// --- veredito ----------------------------------------------------------------

for (const a of avisos) console.warn(`seo-check: aviso — ${a}`)

if (falhas.length) {
  console.error(`\nseo-check: ${falhas.length} problema(s) impedem a publicação:\n`)
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`))
  process.exit(1)
}

console.log(`seo-check: ok — ${imgs.length} imagens, orçamento de peso dentro do teto.`)
