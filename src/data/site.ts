/**
 * Fonte única de conteúdo da landing page.
 * Edite este arquivo para atualizar o site — nenhum componente tem texto fixo.
 *
 * Dados confirmados no perfil @churrascofamiliagrill (Instagram, ago/2026)
 * e no cardápio digital da casa. Itens marcados com TODO precisam de confirmação.
 */

export const brand = {
  name: 'Família Grill',
  fullName: 'Família Grill & Sushi',
  tagline: 'Churras, Burger & Sushi artesanal',
  site: 'https://familiagrill.com.br',
  instagram: 'https://www.instagram.com/churrascofamiliagrill/',
  instagramHandle: '@churrascofamiliagrill',
  /** Cardápio digital com os preços oficiais. */
  menuUrl: 'https://shop.beetech.com.br/churrascofamiliagrill',
  whatsapp: '5521997447808',
  address: {
    street: 'Av. Tamandaré, 389',
    city: 'Niterói',
    state: 'RJ',
    // TODO: confirmar bairro e CEP com o restaurante.
    mapsQuery: 'Av. Tamandaré, 389, Niterói, RJ',
  },
} as const

/**
 * Canais de pedido, em ordem de prioridade. O primeiro vira o botão principal
 * do site — hoje o 99Food, por decisão da casa.
 *
 * TODO: trocar os links de 99Food e iFood pelas URLs diretas da loja. Os
 * endereços abaixo levam à home de cada app, não à página do restaurante.
 */
export type OrderChannel = {
  id: string
  name: string
  url: string
  note: string
  /** 'app' = entrega por aplicativo; 'direto' = fala direto com a casa. */
  kind: 'app' | 'direto'
}

export const orderChannels: OrderChannel[] = [
  {
    id: '99food',
    name: '99Food',
    url: 'https://99food.com/',
    note: 'O caminho mais rápido até a nossa cozinha',
    kind: 'app',
  },
  {
    id: 'ifood',
    name: 'iFood',
    url: 'https://www.ifood.com.br/',
    note: 'A brasa entregue por quem você já usa',
    kind: 'app',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    url: `https://wa.me/${brand.whatsapp}`,
    note: 'Pedido, reserva ou dúvida — direto com o salão',
    kind: 'direto',
  },
  {
    id: 'cardapio',
    name: 'Cardápio digital',
    url: brand.menuUrl,
    note: 'Todos os itens e os preços atualizados',
    kind: 'direto',
  },
]

/** Apps de entrega, na ordem em que aparecem lado a lado na seção Delivery. */
export const deliveryApps = orderChannels.filter((c) => c.kind === 'app')

/** Canais que falam direto com a casa, na faixa abaixo dos apps. */
export const directChannels = orderChannels.filter((c) => c.kind === 'direto')

/** Onde o CTA principal do header e do hero aponta. */
export const primaryChannel = orderChannels[0]

/** Escala de temperatura que organiza a página: brasa → chapa → frio. */
export type Heat = 'ember' | 'flare' | 'cold'

export const kitchens: {
  id: string
  name: string
  heat: Heat
  temperature: string
  lede: string
  detail: string
}[] = [
  {
    id: 'churras',
    name: 'Churras',
    heat: 'ember',
    temperature: 'Carvão · brasa viva',
    lede: 'A carne encosta na grelha e ninguém tem pressa.',
    detail:
      'Cortes na brasa de carvão, no ponto que você pedir. Espeto, na travessa ou no prato — é o mesmo fogo.',
  },
  {
    id: 'burger',
    name: 'Burger',
    heat: 'flare',
    temperature: 'Chapa · selado na hora',
    lede: 'Blend próprio, pão macio, queijo que escorre.',
    detail:
      'Smash e artesanal, montados no pedido. O mesmo açougue que abastece a grelha abastece a chapa.',
  },
  {
    id: 'sushi',
    name: 'Sushi',
    heat: 'cold',
    temperature: 'Balcão frio · faca afiada',
    lede: 'O contraponto: peixe cru, arroz temperado, nada de fumaça.',
    detail:
      'Sushi artesanal montado no balcão. Combinados, temakis e hots para dividir na mesa — ou para segurar a madrugada.',
  },
]

/**
 * Destaques do cardápio.
 * Sem preços de propósito: os valores oficiais vivem no cardápio digital
 * (brand.menuUrl) e mudam sem aviso. Não duplique preço aqui.
 */
export const menu: { kitchen: string; items: { name: string; note: string }[] }[] = [
  {
    kitchen: 'churras',
    items: [
      { name: 'Picanha na brasa', note: 'Fatiada na hora, sal grosso, ponto a pedido' },
      { name: 'Costela de chão', note: 'Horas de carvão até desfiar no garfo' },
      { name: 'Fraldinha', note: 'Corte largo, gordura selada, pra dividir' },
      { name: 'Linguiça artesanal', note: 'Grelhada com cebola e pão na tábua' },
      { name: 'Coração de frango', note: 'No espeto, o clássico da madrugada' },
    ],
  },
  {
    kitchen: 'burger',
    items: [
      { name: 'Família Grill', note: 'Blend da casa, cheddar, bacon e molho da casa' },
      { name: 'Smash duplo', note: 'Duas carnes prensadas, queijo derretido, picles' },
      { name: 'Costela burger', note: 'A costela da grelha, agora no pão' },
      { name: 'Frango crocante', note: 'Empanado na hora, maionese defumada' },
    ],
  },
  {
    kitchen: 'sushi',
    items: [
      { name: 'Combinado da casa', note: 'Sashimi, niguiri e uramaki na mesma tábua' },
      { name: 'Temaki salmão', note: 'Cone fechado no momento do pedido' },
      { name: 'Hot roll', note: 'Empanado, quente por fora, cru por dentro' },
      { name: 'Salmão maçaricado', note: 'A única peça do balcão que vê fogo' },
    ],
  },
]

/**
 * Segunda = 1 … Domingo = 0. Terça fechada.
 * Minutos desde 00:00 do dia de abertura — fechamentos após a meia-noite
 * passam de 1440 (ex.: 5h da manhã = 29 * 60).
 */
export type DayHours = {
  day: number
  label: string
  short: string
  open: number | null
  close: number | null
}

/** Estreita um dia da semana para um turno com horário definido. */
export function isOpenDay(
  day: DayHours,
): day is DayHours & { open: number; close: number } {
  return day.open !== null && day.close !== null
}

export const hours: DayHours[] = [
  { day: 1, label: 'Segunda', short: 'SEG', open: 18 * 60, close: 25 * 60 },
  { day: 2, label: 'Terça', short: 'TER', open: 18 * 60, close: 25 * 60 },
  { day: 3, label: 'Quarta', short: 'QUA', open: 18 * 60, close: 25 * 60 },
  { day: 4, label: 'Quinta', short: 'QUI', open: 18 * 60, close: 25 * 60 },
  { day: 5, label: 'Sexta', short: 'SEX', open: 18 * 60, close: 29 * 60 },
  { day: 6, label: 'Sábado', short: 'SÁB', open: 18 * 60, close: 29 * 60 },
  { day: 0, label: 'Domingo', short: 'DOM', open: 18 * 60, close: 28 * 60 },
]
