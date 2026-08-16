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
  /** A promessa da casa, nas palavras da casa. Abre o hero. */
  promise:
    'Comida boa, porção generosa, preço acessível e lugar para reunir a família e os amigos.',
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
      'Travessa para dividir de quatro a seis, ou a jantinha no prato. Carne, linguiça, frango, suíno e coração — com arroz, feijão tropeiro, farofa e banana frita.',
  },
  {
    id: 'burger',
    name: 'Burger',
    heat: 'flare',
    temperature: 'Chapa · selado na hora',
    lede: 'Cada um leva o nome de uma praia daqui.',
    detail:
      'Itacoatiara, Camboinhas, Piratininga, Itaipu — blend bovino selado na chapa, montado no pedido. O mesmo açougue que abastece a grelha abastece a chapa.',
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
    // Itens conferidos no cardápio digital da casa, do maior para o individual.
    items: [
      {
        name: 'Churrascão família',
        note: 'Carne, linguiça, frango, salsichão, suíno e coração, com molho, farofa e batata frita — serve de 4 a 6',
      },
      {
        name: 'Churrascão',
        note: 'Carne, linguiça, frango, suíno, salsichão e coração, com molho, farofa e batata frita — serve de 2 a 4',
      },
      {
        name: 'Individual',
        note: 'Carne, linguiça e frango, com molho e farofa',
      },
      {
        name: 'Jantinha',
        note: 'Arroz, feijão tropeiro, batata, banana frita, molho, farofa e a proteína que você escolher',
      },
      {
        name: 'Jantinha de espetinho de picanha',
        note: 'A mesma travessa, com picanha na brasa',
      },
    ],
  },
  {
    kitchen: 'burger',
    // Itens conferidos no cardápio digital da casa. Os nomes são bairros e
    // praias de Niterói — vale manter a grafia exata.
    items: [
      {
        name: 'Família Grill',
        note: 'Blend bovino, molho especial, cebola caramelizada, queijo, alface e picles',
      },
      {
        name: 'Itacoatiara',
        note: 'Blend bovino 200g, queijo cheddar e cebola caramelizada',
      },
      {
        name: 'Camboinhas',
        note: 'Blend bovino 200g, gorgonzola, muçarela, cream cheese e farofa de bacon',
      },
      {
        name: 'Piratininga',
        note: 'Blend bovino 200g, tomate confitado, gruyère, cream cheese, molho especial e alface americano',
      },
      {
        name: 'Itaipu',
        note: 'Dois blends de 120g, quatro fatias de queijo prato, bacon assado na brasa, rúcula, cebola e tomate italiano',
      },
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
 * Os dois expedientes da casa, ambos todos os dias. Não são dois canais: são
 * duas coisas diferentes — a janela em que a casa aceita pedido e a janela em
 * que ela atende presencialmente.
 *
 * Tudo em minutos desde 00:00 do dia de abertura; fechamentos após a meia-noite
 * passam de 1440 (1h45 da manhã = 25 * 60 + 45; 2h = 26 * 60).
 *
 * O pedido abre meia hora antes e encerra quinze minutos antes do salão: a
 * cozinha precisa da folga para dar conta do último pedido e ainda fechar a casa.
 */
export type Service = {
  id: string
  name: string
  /** O que essa janela significa, em uma linha. */
  scope: string
  open: number
  close: number
  note: string
}

export const services: Service[] = [
  {
    id: 'pedido',
    name: 'Pedido',
    scope: 'Delivery e retirada',
    open: 17 * 60 + 30,
    close: 25 * 60 + 45,
    note: 'A cozinha começa meia hora antes de o salão abrir. O último pedido entra 1h45.',
  },
  {
    id: 'salao',
    name: 'Salão',
    scope: 'Atendimento presencial',
    open: 18 * 60,
    close: 26 * 60,
    note: 'A mesa é sua das 18h até as 2h — a reserva segue este horário.',
  },
]

export const orderService = services[0]
export const dineInService = services[1]

/**
 * Segunda = 1 … Domingo = 0. `open: null` marca dia fechado — hoje nenhum.
 *
 * A tabela é derivada do turno do salão, e não copiada dele: é ela que valida a
 * reserva de mesa. Mudou o salão? O SQL em
 * supabase/migrations/20260804_000001 repete a mesma janela para barrar reserva
 * fora do expediente vinda de fora do site. Atualize os dois.
 *
 * A janela de pedido não entra aqui de propósito — ninguém reserva mesa para
 * receber em casa.
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

const week = [
  { day: 1, label: 'Segunda', short: 'SEG' },
  { day: 2, label: 'Terça', short: 'TER' },
  { day: 3, label: 'Quarta', short: 'QUA' },
  { day: 4, label: 'Quinta', short: 'QUI' },
  { day: 5, label: 'Sexta', short: 'SEX' },
  { day: 6, label: 'Sábado', short: 'SÁB' },
  { day: 0, label: 'Domingo', short: 'DOM' },
]

export const hours: DayHours[] = week.map((day) => ({
  ...day,
  open: dineInService.open,
  close: dineInService.close,
}))
