# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

O visitante principal é o **vizinho de Niterói decidindo o jantar** — no celular, à
noite, dentro do próprio expediente da casa (18h–2h), escolhendo onde pedir ou
onde ir agora.

Três audiências confirmadas dividem a mesma página:

- **Grupo planejando a mesa** — família ou turma organizando com antecedência
  uma mesa para dividir o churrascão no fim de semana.
- **Cliente que já conhece** — volta para repetir o pedido e quer o caminho mais
  curto até o app ou o WhatsApp, sem reapresentação.
- **Quem vem de fora** — turista ou visitante da região que achou a casa pelo
  Instagram ou pelo Maps e nunca comeu lá.

## Product Purpose

Landing page do Família Grill & Sushi, casa de churrasco, hambúrguer e sushi da
Av. Tamandaré, 389 — Niterói/RJ.

**Sucesso é o pedido no delivery.** O visitante sai da página pelo 99Food ou pelo
iFood. Reserva de mesa, WhatsApp e cardápio digital são destinos legítimos, mas
secundários: existem para quem o delivery não atende.

## Positioning

Três cozinhas sob o mesmo teto, abastecidas pela mesma casa: churrasco na brasa
de carvão, hambúrguer selado na chapa e sushi artesanal montado no balcão. O
mesmo açougue que abastece a grelha abastece a chapa. Turno único todo dia das
18h às 2h — a casa cobre a madrugada, inclusive em dia de semana.

Os hambúrgueres levam nomes de praias e bairros de Niterói (Itacoatiara,
Camboinhas, Piratininga, Itaipu): a casa é local e diz isso pelo cardápio.

## Operating Context

- **Pedido por app.** 99Food é o canal prioritário por decisão da casa; iFood
  vem em seguida. A ordem vive em `orderChannels`, em [src/data/site.ts](src/data/site.ts),
  e o primeiro item vira automaticamente o CTA principal do header e do hero.
- **Contato direto.** WhatsApp (`5521997447808`) atende pedido, reserva e dúvida
  falando com o salão.
- **Cardápio digital externo.** Os preços oficiais vivem em
  `shop.beetech.com.br/churrascofamiliagrill` e mudam sem aviso.
- **Reserva de mesa.** O formulário público grava na tabela `reservas` do
  Supabase. A equipe consulta em `/reservas` — rota fora do menu, protegida por
  login Supabase, alcançável pelo rótulo discreto "Reserve sua Mesa" no
  formulário. A confirmação com o cliente é feita por telefone, fora do sistema.
- **Edição de conteúdo.** Todo texto, cardápio e horário vivem em
  [src/data/site.ts](src/data/site.ts). Nenhum componente tem conteúdo fixo.

## Capabilities and Constraints

**Regra durável confirmada pela casa:**

- **Preço nunca aparece no site.** Os valores oficiais ficam só no cardápio
  digital. Nenhuma superfície futura duplica preço, nem "a partir de", nem faixa.

**Fatos do sistema hoje:**

- **Dois expedientes, todo dia, sem exceção.** Não são dois canais — são duas
  coisas diferentes:
  - **Pedido** (delivery e retirada): 17h30 às 1h45.
  - **Salão** (atendimento presencial): 18h às 2h.

  A cozinha começa meia hora antes de o salão abrir e para de aceitar pedido
  quinze minutos antes de fechar as portas. Ambos vivem em `services` em
  [src/data/site.ts](src/data/site.ts).
- A **reserva segue o salão**, nunca a janela de pedido. A tabela `hours` é
  derivada de `services` e é ela que valida a reserva; a migration
  [20260804_000001_expediente_unico.sql](supabase/migrations/20260804_000001_expediente_unico.sql)
  repete a mesma janela (18h–2h) para barrar reserva vinda de fora do site.
  Mudou o horário do salão, mude os dois.
- Reserva aceita de 1 a 20 pessoas, só para horário futuro, até 90 dias de
  antecedência, e só dentro do expediente. As mesmas regras são aplicadas no
  banco, não apenas no formulário.
- RLS: `insert` anônimo permitido; `select`/`update` restritos a usuários
  autenticados.
- Sem `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` a página continua
  funcionando — a seção de reserva mostra um aviso e o botão de WhatsApp no
  lugar do formulário. Esse estado degradado é intencional e deve sobreviver.
- A escala de temperatura organiza o conteúdo: `ember` (churras) → `flare`
  (burger) → `cold` (sushi). É estrutura de produto, não só cor.

**Explicitamente indecidido — não invente:**

- Bairro e CEP do endereço nunca foram confirmados com o restaurante.
- Os links de 99Food e iFood apontam para a home de cada app, não para a página
  da loja. As URLs diretas ainda não foram fornecidas.

## Brand Commitments

- Nome: **Família Grill & Sushi** (curto: Família Grill). Tagline confirmada:
  "Churras, Burger & Sushi artesanal".
- **A promessa da casa**, nas palavras da casa e aprovada por ela: "Comida boa,
  porção generosa, preço acessível e lugar para reunir a família e os amigos."
  Abre o hero, guardada em `brand.promise`. É a única afirmação qualitativa
  autorizada sobre porção e preço — e não abre exceção à regra de nunca publicar
  valores.
- Domínio oficial: `familiagrill.com.br`.
- Instagram: [@churrascofamiliagrill](https://www.instagram.com/churrascofamiliagrill/) — única
  presença social confirmada.
- Logo em [public/logo-familia-grill.png](public/logo-familia-grill.png) e a
  versão transparente ao lado. **Restrição real: o arquivo tem 204×204 px.**
  Nenhum uso pode depender de logo grande até chegar uma versão em alta
  resolução; a substituição deve manter o mesmo nome de arquivo.
- Voz: português do Brasil, primeira pessoa do plural, informal e curta ("mesa
  para dividir, balcão para esperar"). Sem superlativo publicitário.

## Evidence on Hand

- **Confirmado no cardápio digital da casa:** os itens de churras (Churrascão
  família, Churrascão, Individual, Jantinha, Jantinha de espetinho de picanha) e
  os hambúrgueres com nome de praia, com suas composições.
- **Não confirmado:** os itens de sushi listados em `menu` são plausíveis, não
  copiados do cardápio oficial.
- **Fotos disponíveis** (entregues pela casa em 16/08/2026, em
  [public/fotos/](public/fotos/), originais PNG guardados fora do deploy em
  `assets-originais/`):
  - `churrasco.jpg` e `sushi.jpg` — publicadas. A do sushi é inequivocamente da
    casa (luz ambiente, ardósia, madeira gasta). A do churrasco tem
    características de estúdio; **a casa autorizou o uso explicitamente** em
    16/08/2026, e essa decisão não deve ser reaberta.
  - Uma foto de hambúrguer foi recebida e **recusada**: exibe a marca de outro
    estabelecimento no prato e não corresponde a nenhum item do cardápio. Fica
    em `assets-originais/` e não vai ao ar.
  - **Limite técnico:** todas têm no máximo 863px, em recorte quadrado ou 4:5 do
    Instagram. Servem para cartões; **nenhuma sustenta um hero de desktop**, que
    precisa de ~2000px em formato largo. O hero segue sem foto até isso chegar.
- **Ainda não existe:** foto do salão, da equipe, e uma imagem de hambúrguer da
  própria casa. Não substitua por banco de imagens.
- **Não existe e não pode ser fabricado:** depoimento, avaliação, nota, número de
  clientes, tempo de casa, prêmio ou selo.
- **Não existe e não pode ser fabricado:** depoimento, avaliação, nota, número de
  clientes, tempo de casa, prêmio, selo ou qualquer prova social. Nada disso foi
  levantado.
- Os dados públicos vieram do perfil do Instagram (ago/2026), não de uma
  entrevista com o restaurante.

## Product Principles

1. **O caminho até o pedido é o produto.** O primeiro canal de `orderChannels`
   manda; a página inteira existe para encurtar a distância até ele.
2. **Preço mora no cardápio digital.** O site descreve, não precifica.
3. **Três cozinhas, uma casa.** Churras, burger e sushi são temperaturas do mesmo
   lugar — nunca três marcas costuradas.
4. **Nada de dado inventado.** Endereço incompleto, link genérico e item não
   conferido ficam marcados como pendência, jamais preenchidos por suposição.
5. **A cena é a noite, no celular.** Todo visitante chega depois das 18h, com
   fome, com uma mão só.
