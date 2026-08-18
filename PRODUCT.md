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
- **E-mail.** `contato@familiagrill.com.br`, criado em 17/08/2026 e lido pelo
  webmail da hospedagem. **Ainda não aparece em nenhuma superfície do site** —
  publicar é decisão em aberto, não esquecimento.
- **Produção é a hospedagem própria; a Vercel é preview.** Desde 17/08/2026 a
  zona autoritativa aponta site e e-mail para o mesmo servidor cPanel
  (`38.58.181.243`): apex em registro A, `www` em CNAME para o apex, e `MX`,
  `mail`, SPF, DKIM e DMARC onde sempre estiveram. O DNS fica no cPanel
  (nameservers `ns9`/`ns10.srvif.com`).
- **A Vercel continua servindo, de propósito.** Os domínios seguem anexados ao
  projeto lá enquanto houver resolver com o IP antigo em cache — o TTL da zona
  é de 4 horas. Removê-los antes da propagação faria essas pessoas caírem em
  erro; com eles no lugar, a troca é invisível. Depois disso a Vercel fica só
  como preview de branch.
- **Ao verificar DNS recém-alterado, pergunte ao autoritativo.** `nslookup
  familiagrill.com.br ns9.srvif.com`. Resolver público (`8.8.8.8`, o do
  provedor, o do sistema) devolve o valor em cache e faz uma virada concluída
  parecer pendente durante horas.
- **O `MX` nunca pode apontar para o apex.** Hoje o apex é a hospedagem e isso
  seria inofensivo, mas a regra é durável: no dia em que o apex voltar a
  responder por um serviço que não entrega correio, e-mail para o domínio some
  em silêncio. Por isso o `MX` aponta para `mail.familiagrill.com.br`, que tem
  registro A próprio e fixo, e o SPF não usa mais `+a`.
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
- **Reserva não fica guardada para sempre.** Um gatilho apaga toda reserva cuja
  data passou há mais de um mês, e ele dispara a cada nova reserva — sem
  agendador, sem depender de nada fora do banco. São nome e telefone de gente
  real, e a confirmação é feita por telefone, fora do sistema: passada a mesa,
  o dado não tem mais uso e só representa risco. O prazo vive num único
  intervalo em `20260817_000002_limpeza_de_reservas.sql`.
- RLS: `insert` anônimo permitido; `select`, `update` e `delete` exigem estar na
  tabela `staff` — estar autenticado não basta. Quem loga fora da `staff` entra
  e vê uma lista vazia, o que parece defeito e é a política trabalhando.
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
- Domínio oficial: `familiagrill.com.br`, no ar desde 17/08/2026. O **`www` é o
  host canônico**; o apex redireciona 301 para ele, e quem faz esse
  redirecionamento é o `.htaccess`, não mais a Vercel. Toda URL absoluta do
  projeto — canonical, Open Graph, JSON-LD, sitemap e `brand.site` — leva `www`.
  Mudar o host canônico exige mudar os três: as URLs do `index.html`,
  `brand.site` e a regra do `public/.htaccess`.
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
  - `churrasco.jpg`, `hamburguer.jpg` e `sushi.jpg` — as três cozinhas
    ilustradas. A do sushi é inequivocamente da casa (luz ambiente, ardósia,
    madeira gasta). As de churrasco e hambúrguer têm características de estúdio;
    **a casa autorizou o uso explicitamente** em 16/08/2026, e essa decisão não
    deve ser reaberta.
  - Uma primeira foto de hambúrguer (`hamburger-01.png`) foi **recusada**: exibia
    a marca de outro estabelecimento no prato e não correspondia a nenhum item
    do cardápio. A casa enviou uma substituta, que é a publicada hoje — sem
    marca de terceiros e compatível com a composição do Piratininga. A recusada
    fica em `assets-originais/` e não vai ao ar.
  - **Limite técnico:** todas têm no máximo 863px, em recorte quadrado ou 4:5 do
    Instagram. Servem para cartões — e é o que fazem no cardápio.
- **Filmes curtos das três cozinhas** (`public/videos/`), em recorte quadrado,
  usados nas abas do cardápio. Cada aba só baixa o seu quando é escolhida, e
  com "reduzir movimento" ligado nenhuma baixa: fica a foto.
- **O hero tem fundo em movimento** desde 17/08/2026: `hero-churrasco.mp4`,
  850x720 depois de cortadas as tarjas do original. Não é o formato largo de
  ~2000px que um hero de desktop pediria — quem resolve o recorte é o
  `object-cover`, e dois véus em gradiente seguram o contraste do texto. Uma
  peça larga de verdade continua sendo bem-vinda; esta não a torna dispensável.
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
