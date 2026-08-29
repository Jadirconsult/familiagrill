/**
 * Pré-renderização e geração do que os buscadores leem.
 *
 * Roda depois do `vite build` e faz três coisas em cima de dist/:
 *
 *   1. Escreve a landing inteira dentro do #root do index.html. Sem isso, o
 *      arquivo publicado sobe com a div vazia: o Googlebot renderiza JavaScript,
 *      mas numa segunda passada e sem prazo, e Bing, DuckDuckGo e os robôs de
 *      IA leem HTML cru e não veem cardápio, endereço nem horário.
 *
 *   2. Reescreve o bloco entre <!-- seo:inicio --> e <!-- seo:fim --> a partir
 *      de src/data/site.ts — título, descrição, canonical, Open Graph e o
 *      JSON-LD. Antes o expediente da casa existia em três cópias no
 *      repositório; agora site.ts manda, e este arquivo obedece.
 *
 *   3. Gera o sitemap.xml com o lastmod do último commit.
 *
 * O host canônico é o www, e é o mesmo `brand.site` de site.ts. O apex responde
 * 301 para cá pelo public/.htaccess, então apontar o canonical para o apex
 * seria apontar para um redirecionamento. O alias familiagrillbr.vercel.app
 * continua servindo o preview de branch, mas não é endereço público: não pode
 * aparecer em canonical, og: nem JSON-LD — e o scripts/seo-check.mjs falha o
 * build se aparecer.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(raiz, 'dist')

/**
 * A imagem que aparece quando alguém manda o link no WhatsApp ou no story.
 * O ideal é 1200x630: enquanto esse arquivo não existir, cai na logo, que é
 * quadrada e pequena e vira um selo perdido no meio do cartão de preview.
 * Basta colocar o arquivo em public/ para o build passar a usá-lo.
 */
const OG_PREFERIDA = { arquivo: 'og-familia-grill.jpg', largura: 1200, altura: 630 }
const OG_RESERVA = { arquivo: 'logo-familia-grill.png', largura: null, altura: null }

const escapaHtml = (texto) =>
  String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Minutos desde 00:00 para "HH:MM". Fechamento depois da meia-noite passa de 1440. */
const paraHora = (minutos) => {
  const doDia = ((minutos % 1440) + 1440) % 1440
  return `${String(Math.floor(doDia / 60)).padStart(2, '0')}:${String(doDia % 60).padStart(2, '0')}`
}

const DIAS_SCHEMA = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function dataDoUltimoCommit() {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs'], { cwd: raiz, encoding: 'utf8' }).trim()
  } catch {
    // Sem git disponível (um tarball baixado, por exemplo): a data de hoje é
    // uma aproximação honesta e melhor do que a data fixa que estava no arquivo.
    return new Date().toISOString().slice(0, 10)
  }
}

async function carregaDados() {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'warn',
  })
  try {
    const site = await vite.ssrLoadModule('/src/data/site.ts')
    const servidor = await vite.ssrLoadModule('/src/entry-server.tsx')
    return { site, html: servidor.render() }
  } finally {
    await vite.close()
  }
}

function montaJsonLd(site, ogUrl) {
  const { brand, kitchens, menu, hours, deliveryApps } = site
  const base = brand.site.replace(/\/$/, '')

  const secoes = kitchens.map((cozinha) => ({
    '@type': 'MenuSection',
    name: cozinha.name,
    description: cozinha.lede,
    hasMenuItem: (menu.find((m) => m.kitchen === cozinha.id)?.items ?? []).map((item) => ({
      '@type': 'MenuItem',
      name: item.name,
      description: item.note,
    })),
  }))

  // Todos os dias têm o mesmo turno hoje, mas a especificação é derivada de
  // `hours` e não escrita à mão: no dia em que a casa fechar às segundas, o
  // schema acompanha sozinho.
  const expediente = hours
    .filter((dia) => dia.open !== null && dia.close !== null)
    .map((dia) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: DIAS_SCHEMA[dia.day],
      opens: paraHora(dia.open),
      closes: paraHora(dia.close),
    }))

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${base}/#restaurante`,
    name: brand.fullName,
    description:
      'Churrasco na brasa, hambúrguer na chapa e sushi artesanal em Niterói.',
    slogan: brand.tagline,
    url: `${base}/`,
    logo: `${base}/logo-familia-grill.png`,
    image: [ogUrl, ...kitchens.filter((k) => k.photo).map((k) => `${base}${k.photo.src}`)],
    telephone: `+${brand.whatsapp}`,
    servesCuisine: ['Churrasco', 'Hambúrguer', 'Sushi'],
    menu: brand.menuUrl,
    hasMenu: { '@type': 'Menu', hasMenuSection: secoes },
    acceptsReservations: true,
    sameAs: [brand.instagram],
    // Sem bairro, sem CEP, sem geo e sem priceRange de propósito: nada disso
    // foi confirmado com a casa, e endereço errado em dado estruturado é pior
    // do que endereço incompleto. Confirme e acrescente em site.ts.
    address: {
      '@type': 'PostalAddress',
      streetAddress: brand.address.street,
      addressLocality: brand.address.city,
      addressRegion: brand.address.state,
      addressCountry: 'BR',
    },
    openingHoursSpecification: expediente,
    potentialAction: [
      ...deliveryApps.map((app) => ({
        '@type': 'OrderAction',
        name: `Pedir no ${app.name}`,
        target: { '@type': 'EntryPoint', urlTemplate: app.url },
      })),
      {
        '@type': 'ReserveAction',
        name: 'Reservar mesa',
        target: { '@type': 'EntryPoint', urlTemplate: `${base}/#visita` },
        result: {
          '@type': 'FoodEstablishmentReservation',
          name: `Mesa no ${brand.fullName}`,
        },
      },
    ],
  }
}

function montaBlocoSeo(site, og) {
  const { brand } = site
  const base = brand.site.replace(/\/$/, '')
  const titulo = `${brand.fullName} — Churras, Burger e Sushi em Niterói`
  const descricao = `Churrasco na brasa, hambúrguer na chapa e sushi artesanal na ${brand.address.street}, ${brand.address.city}. Todo dia: pedido a partir das 17h30, salão das 18h às 2h.`
  const ogDescricao = `${brand.tagline} — ${brand.address.city}. Todo dia até as 2h da manhã.`
  const ogUrl = `${base}/${og.arquivo}`

  const linhas = [
    '<!-- seo:inicio -->',
    '<!-- Bloco gerado por scripts/seo-build.mjs a partir de src/data/site.ts. Não edite aqui. -->',
    `<title>${escapaHtml(titulo)}</title>`,
    `<meta name="description" content="${escapaHtml(descricao)}" />`,
    `<link rel="canonical" href="${base}/" />`,
    `<meta property="og:site_name" content="${escapaHtml(brand.fullName)}" />`,
    `<meta property="og:title" content="${escapaHtml(brand.fullName)}" />`,
    `<meta property="og:description" content="${escapaHtml(ogDescricao)}" />`,
    `<meta property="og:image" content="${ogUrl}" />`,
    `<meta property="og:image:alt" content="${escapaHtml('Churrasco na brasa do ' + brand.fullName)}" />`,
    ...(og.largura
      ? [
          `<meta property="og:image:width" content="${og.largura}" />`,
          `<meta property="og:image:height" content="${og.altura}" />`,
        ]
      : []),
    `<meta property="og:url" content="${base}/" />`,
    // "restaurant" não é tipo válido de Open Graph; os scrapers caíam para o
    // padrão de qualquer jeito. O tipo do lugar é dito no JSON-LD abaixo.
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="pt_BR" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapaHtml(brand.fullName)}" />`,
    `<meta name="twitter:description" content="${escapaHtml(ogDescricao)}" />`,
    `<meta name="twitter:image" content="${ogUrl}" />`,
    '<script type="application/ld+json">',
    JSON.stringify(montaJsonLd(site, ogUrl)),
    '</script>',
    '<!-- seo:fim -->',
  ]

  return linhas.map((linha) => `    ${linha}`).join('\n')
}

function montaSitemap(site, lastmod) {
  const base = site.brand.site.replace(/\/$/, '')
  // Uma URL só, e é de propósito: a landing é página única, e /reservas é o
  // painel da equipe, marcado com X-Robots-Tag: noindex no public/.htaccess.
  // Sempre com www, nunca o apex nem o alias .vercel.app — o sitemap tem que
  // concordar com o canonical.
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Gerado por scripts/seo-build.mjs. Não edite à mão. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
}

// --- execução ---------------------------------------------------------------

const indexPath = path.join(dist, 'index.html')
if (!fs.existsSync(indexPath)) {
  console.error('seo-build: dist/index.html não existe. Rode o vite build antes.')
  process.exit(1)
}

const og = fs.existsSync(path.join(dist, OG_PREFERIDA.arquivo)) ? OG_PREFERIDA : OG_RESERVA
if (og === OG_RESERVA) {
  console.warn(
    `seo-build: public/${OG_PREFERIDA.arquivo} não existe — o preview de link vai usar a logo.\n` +
      '           Coloque uma foto de 1200x630 com esse nome em public/ para corrigir.',
  )
}

const { site, html } = await carregaDados()

let documento = fs.readFileSync(indexPath, 'utf8')

const blocoSeo = /[ ]*<!-- seo:inicio -->[\s\S]*?<!-- seo:fim -->/
if (!blocoSeo.test(documento)) {
  console.error('seo-build: marcadores <!-- seo:inicio --> / <!-- seo:fim --> sumiram do index.html.')
  process.exit(1)
}
documento = documento.replace(blocoSeo, () => montaBlocoSeo(site, og))

const rootVazio = /<div id="root">\s*<\/div>/
if (!rootVazio.test(documento)) {
  console.error('seo-build: não achei <div id="root"></div> para preencher.')
  process.exit(1)
}
documento = documento.replace(rootVazio, () => `<div id="root">${html}</div>`)

fs.writeFileSync(indexPath, documento, 'utf8')
fs.writeFileSync(path.join(dist, 'sitemap.xml'), montaSitemap(site, dataDoUltimoCommit()), 'utf8')

const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1)
console.log(`seo-build: landing pré-renderizada (${kb} kB de HTML) e sitemap gerado.`)
