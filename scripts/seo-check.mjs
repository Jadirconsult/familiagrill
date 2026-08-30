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

// 6b. As fontes são servidas por este domínio, e voltar ao Google Fonts é uma
//     regressão fácil de cometer — basta alguém colar um <link> de exemplo. A
//     folha de estilo de lá bloqueia a renderização e traz dois handshakes,
//     num elemento que é o próprio LCP da página.
if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html)) {
  falha(
    'O index.html publicado carrega fontes do Google.',
    'As fontes vivem em src/fontes.css e são servidas por este domínio. Folha externa bloqueia a renderização e piora o LCP.',
  )
}

// 6c. As duas faces da primeira dobra têm que estar pré-carregadas, e o
//     crossorigin não é opcional: sem ele o navegador baixa a fonte duas vezes.
// Comentários fora antes de contar: este arquivo tem um comentário que
// CITA um <link rel="preload"> para explicar de onde ele vem, e sem esta
// limpeza a citação seria contada como se fosse a tag.
const semComentarios = html.replace(/<!--[\s\S]*?-->/g, '')
const preloads = [...semComentarios.matchAll(/<link[^>]+rel="preload"[^>]*>/g)].map((m) => m[0])

// Todo preload tem que apontar para arquivo existente — inclusive os que o
// React 19 emite sozinho para as imagens da primeira dobra. Preload solto é
// uma ida ao servidor gasta para receber 404.
for (const tag of preloads) {
  const alvo = tag.match(/href="([^"]+)"/)?.[1]
  if (alvo && alvo.startsWith('/') && !fs.existsSync(path.join(dist, alvo.replace(/^\//, '')))) {
    falha(`Preload aponta para ${alvo}, que não existe no dist.`, 'Corrija ou remova o preload.')
  }
}
const fontesPreload = preloads.filter((p) => p.includes('as="font"'))
if (fontesPreload.length < 2) {
  falha(
    `Só ${fontesPreload.length} fonte(s) pré-carregada(s).`,
    'Cinzel (o h1) e Archivo (o corpo) devem ser pré-carregados. Ver montaPreloadDeFontes em scripts/seo-build.mjs.',
  )
}
for (const tag of fontesPreload) {
  if (!tag.includes('crossorigin')) {
    falha(
      `Preload de fonte sem crossorigin: ${tag}`,
      'Fonte é buscada em modo CORS. Sem o atributo, o preload não casa com o pedido real e o arquivo desce duas vezes.',
    )
  }
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

// --- o aviso de privacidade -------------------------------------------------

// Ele existe por duas razões que se somam: a LGPD, e a revisão de conta do
// Google Ads, que verifica se o site declara o que coleta. Precisa existir no
// HTML como a landing — não adianta ser rota que só nasce depois do JavaScript.
const privacidadePath = path.join(dist, 'privacidade', 'index.html')
if (!fs.existsSync(privacidadePath)) {
  falha(
    'Não há dist/privacidade/index.html.',
    'O aviso de privacidade precisa ser pré-renderizado. Ver a lista de rotas em scripts/seo-build.mjs.',
  )
} else {
  const privacidade = fs.readFileSync(privacidadePath, 'utf8')

  if (/<div id="root">\s*<\/div>/.test(privacidade)) {
    falha('O aviso de privacidade tem o #root vazio.', 'Ele precisa sair pré-renderizado, como a landing.')
  }

  if (!html.includes('href="/privacidade"')) {
    falha(
      'A landing não linka para o aviso de privacidade.',
      'Sem um link alcançável, o robô do Google Ads não encontra a política na revisão da conta. O link vive no rodapé.',
    )
  }

  // A guarda que importa: o texto do aviso não pode contradizer o que o site
  // realmente carrega. Se alguém preencher VITE_GA_ID e a página continuar
  // dizendo que não há rastreamento, o site passa a afirmar algo falso sobre
  // dado pessoal — que é exatamente o tipo de coisa que a LGPD pune e que
  // ninguém percebe olhando a tela.
  const medindo = /googletagmanager|gtag\/js/.test(html)
  const dizQueNaoMede = privacidade.includes('não carrega nenhum script')
  if (medindo && dizQueNaoMede) {
    falha(
      'O site carrega scripts de medição, mas o aviso de privacidade diz que não.',
      'A seção de medição é derivada de `medicaoLigada` em src/lib/track.ts — se ela divergiu, o build está usando uma versão antiga da página.',
    )
  }
  if (!medindo && !dizQueNaoMede) {
    aviso(
      'O aviso de privacidade não afirma a ausência de rastreamento, e o site não carrega nenhum. Confira se o texto continua verdadeiro.',
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
      `O teto é ${LIMITES.jsInicialKb} kB. Mova o que não é da primeira visita para import dinâmico.`,
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
// Uma exceção só: o próprio LinkExterno, que é onde o target="_blank" mora.
const fontes = percorre(src).filter((f) => f.endsWith('.tsx'))
for (const arquivo of fontes) {
  const nome = path.basename(arquivo)
  if (nome === 'LinkExterno.tsx') continue
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
