---
name: Família Grill & Sushi
description: Carvão, brasa e aço — a casa de churrasco que atravessa a madrugada em Niterói.
colors:
  coal: "#121110"
  soot: "#1c1a18"
  char: "#35312e"
  ember: "#d4551d"
  gold: "#cb8b26"
  cream: "#f5f5eb"
  smoke: "#9a938a"
  sage: "#8fae9b"
typography:
  display:
    fontFamily: "Cinzel, 'Times New Roman', serif"
    fontSize: "clamp(2.5rem, 8.5vw, 6.5rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Cinzel, 'Times New Roman', serif"
    fontSize: "clamp(1.75rem, 4.5vw, 3.25rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.005em"
  title:
    fontFamily: "Cinzel, 'Times New Roman', serif"
    fontSize: "2.25rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.005em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "'Space Mono', ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.1em"
  eyebrow:
    fontFamily: "'Space Mono', ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.22em"
  mark:
    fontFamily: "'Space Mono', ui-monospace, monospace"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  none: "0px"
  full: "9999px"
spacing:
  gutter: "20px"
  gutter-lg: "32px"
  stack: "16px"
  card: "32px"
  card-lg: "40px"
  section: "80px"
  section-lg: "112px"
components:
  button-opening:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.coal}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  button-opening-hover:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.coal}"
  button-action:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.coal}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  button-action-hover:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.coal}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  button-outline-hover:
    textColor: "{colors.gold}"
  tab-active:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.coal}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "10px 20px"
  tab-idle:
    backgroundColor: "transparent"
    textColor: "{colors.smoke}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "10px 20px"
  card-kitchen:
    backgroundColor: "{colors.coal}"
    textColor: "{colors.cream}"
    rounded: "{rounded.none}"
    padding: "{spacing.card}"
  card-channel-featured:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.coal}"
    rounded: "{rounded.none}"
    padding: "{spacing.card}"
    height: "16rem"
  card-channel-outline:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.none}"
    padding: "{spacing.card}"
    height: "16rem"
  input-field:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.none}"
    padding: "10px 0"
---

# Design System: Família Grill & Sushi

## Overview

**Creative North Star: "A Brasa que Não Apaga"**

A página é um carvão em brasa visto no escuro. O fundo é carvão apagado (`coal`),
e todo o calor da interface vem de dois discos de brasa desfocados que respiram
sob o hero em ciclos de sete segundos — não há foto de comida, não há gradiente de
banner, não há fumaça decorativa. O calor é luz, não ilustração. A tipografia de
display é uma romana em caixa alta que grava o nome da casa como se estivesse
cravado em placa, e o corpo é uma grotesca neutra que sai da frente do conteúdo.

O sistema é organizado por uma escala de temperatura, e essa escala é estrutura,
não enfeite: brasa de carvão (`ember`) no churrasco, ouro de chapa (`gold`) no
hambúrguer, sálvia dessaturada (`sage`) no balcão de sushi. O único tom frio da
paleta existe para marcar a única cozinha que trabalha contra o fogo, e por isso
nunca aparece em contexto de brasa. O ouro é decisão de tela, não da marca: o
coral da logo puxava para vermelho de alerta sobre o carvão, então a cor de ação
foi deslocada para o ouro, que lê como brasa quente no escuro.

A estrutura por baixo do calor é fria e reta. Nada tem canto arredondado, nada
projeta sombra, nada flutua: as seções são placas retangulares separadas por fios
de 1px em `char`, e a profundidade vem de um único degrau tonal entre `coal` e
`soot`. A página inteira encosta na margem esquerda — não há um bloco de texto
centralizado em lugar nenhum. A única coisa que se move por conta própria é o
calor.

**Key Characteristics:**

- Fundo de carvão permanente; não existe modo claro nem inversão de tema
- Escala de temperatura ember → gold → sage como sistema de significado
- Zero raio de canto e zero sombra ambiente; profundidade só tonal e por fio de 1px
- Três vozes tipográficas com funções que não se cruzam: Cinzel nomeia, Archivo explica, Space Mono mede
- Alinhamento à esquerda em toda a página, sem exceção
- Movimento reservado ao calor e à revelação de entrada; o resto é imóvel

## Colors

Uma paleta de fogueira: seis tons quentes tirados do carvão e da chama, mais um
único verde frio que existe só para marcar o que não vai ao fogo.

### Primary

- **Ouro de Chapa** (`#cb8b26`): a cor da ação. Preenche o botão do header, o
  botão de envio do formulário e o cartão do app de delivery preferido; marca o
  link do cardápio completo, a borda de hover de qualquer superfície interativa,
  o anel de foco e o estado "Aberto agora" do medidor. Também é o acento da
  cozinha de hambúrguer, a temperatura do meio da escala.

### Secondary

- **Brasa de Carvão** (`#d4551d`): calor puro. Aparece como luz (o disco
  desfocado sob o hero, o início do gradiente das barras de horário, o anel de
  40% de opacidade em volta do ponto do medidor) e como acento da cozinha de
  churrasco. Serve ainda ao único estado de falha da página — o aviso de reserva
  não registrada. Nunca é usada como fundo de superfície nem como cor de botão.

### Tertiary

- **Sálvia de Balcão** (`#8fae9b`): o único tom frio da paleta. Reservado ao
  sushi — sua barra de acento, seu rótulo de temperatura — e à mensagem de
  confirmação de reserva bem-sucedida. Fora desses dois usos, não existe.

### Neutral

- **Carvão Apagado** (`#121110`): fundo permanente da página e cor do texto sobre
  qualquer superfície clara (botão ouro, botão creme, aba ativa).
- **Fuligem** (`#1c1a18`): o único degrau tonal do sistema. Marca as seções
  alternadas (Cardápio e Onde estamos) e o hover dos itens do menu mobile.
- **Carvão Frio** (`#35312e`): a cor de toda linha do sistema — bordas de seção,
  divisórias de lista, contorno de botão secundário, sublinhado de campo, e o
  trilho apagado das barras de horário.
- **Creme de Cinza** (`#f5f5eb`): o creme do fundo da logo. Cor de todo texto de
  leitura sobre o carvão e fundo do CTA de abertura da página.
- **Fumaça** (`#9a938a`): texto secundário, rótulos em repouso, notas de apoio e
  itens de navegação não ativos. É o cinza que carrega quase toda a página.

### Named Rules

**A Regra do Canto Frio.** `sage` nunca encosta em contexto de fogo. Ele marca o
sushi e a confirmação de reserva; qualquer outro uso quebra a escala de
temperatura que organiza o conteúdo.

**A Regra da Abertura.** O creme abre, o ouro repete. O CTA de maior peso da
página — o primeiro da dobra — é creme sobre carvão, o par de maior contraste do
sistema, e vira ouro no hover. Toda ação recorrente depois dele é ouro. Duas
superfícies creme nunca disputam a mesma dobra.

**A Regra da Brasa como Luz.** `ember` é emitido, não pintado: blur, gradiente,
anel, filete. Nunca preenche um bloco nem vira fundo de botão.

## Typography

**Display Font:** Cinzel (recuo para Times New Roman, serif)
**Body Font:** Archivo (recuo para system-ui, sans-serif)
**Label/Mono Font:** Space Mono (recuo para ui-monospace, monospace)

**Character:** Cinzel é uma romana de inscrição, toda em caixa alta e com serifas
em cunha — o mesmo registro do lettering desenhado da logo, sem tentar imitá-lo.
Contra ela, Archivo não tem opinião: é a grotesca que deixa o texto ser lido. E
Space Mono, com sua largura fixa e seu tracking aberto, dá a toda etiqueta,
horário e botão o ar de mostrador de instrumento.

### Hierarquia

- **Display** (900, `clamp(2.5rem, 8.5vw, 6.5rem)`, altura de linha 1): só o
  título do hero. Um por página.
- **Headline** (900, `clamp(1.75rem, 4.5vw, 3.25rem)`, altura de linha 1): título
  de seção, sempre limitado a `max-w-3xl` para quebrar em duas ou três linhas.
- **Title** (900, `2.25rem` nos cartões de cozinha, `3rem` no nome do app de
  delivery, `1.5rem` no item de cardápio, `1.25rem` no canal direto): nome
  próprio de coisa — cozinha, prato, aplicativo.
- **Body** (400, `1.125rem` no texto de abertura e `0.875rem` na nota de apoio,
  altura de linha 1.625 no corrido e 1.375 no compacto): a única voz que pode
  quebrar em parágrafo. Larguras contidas por `max-w-md`/`max-w-xs`.
- **Label** (700, `0.75rem`, tracking `0.1em`, caixa alta): botão, aba, navegação,
  horário, contagem regressiva, rodapé.
- **Eyebrow** (400, `0.6875rem`, tracking `0.22em`, caixa alta, cor `smoke`):
  o rótulo que abre cada seção e cada campo de formulário.
- **Mark** (400, `0.625rem`, sem tracking, numerais tabulares): o menor degrau do
  sistema, exclusivo das marcas de hora sob o medidor da noite. Só instrumento
  usa esse tamanho — nunca texto de leitura.

### Named Rules

**A Regra das Três Vozes.** Cinzel nomeia, Archivo explica, Space Mono mede.
Nenhuma faz o trabalho da outra: um parágrafo nunca é mono, um botão nunca é
serifado, um número de horário nunca é Archivo.

**A Regra da Caixa Alta.** Cinzel e Space Mono são sempre maiúsculas. Archivo
nunca é — se um texto em Archivo precisa de caixa alta, ele estava na voz errada.

**A Regra da Marca em Arco.** A assinatura `✳ FAMÍLIA GRILL ✳`, em mono com
tracking `0.3em` e cor ouro, cita o arco "NA BRASA" da logo. É o único lugar onde
um ornamento tipográfico aparece.

## Layout

Um contêiner único de `72rem` (1152px) centralizado, com gutter de 20px no
celular e 32px a partir de 640px. Ele existe como uma classe só — `.shell` — e
não como utilitários repetidos por seção: o gutter é `max()` entre o valor base e
`env(safe-area-inset-*)`, porque o header é fixo e não herda padding do body, e
sem isso o conteúdo desliza sob o notch em paisagem. Todo conteúdo se alinha à
esquerda desse contêiner — títulos, textos, listas e rodapé. Não existe bloco
centralizado.

Âncoras de seção descontam a altura do header fixo por `scroll-padding-top`
(5rem, 5.5rem a partir de 640px). Alvos de toque têm no mínimo 44px em qualquer
tela.

O ritmo vertical é constante: cada seção respira 80px acima e abaixo, 112px a
partir de 640px, e começa com um fio de 1px em `char` na borda superior. A
alternância de fundo é de um degrau só — `coal` por padrão, `soot` no Cardápio e
no Onde estamos.

Grades por seção, todas colapsando para uma coluna no celular: duas colunas para
os apps de delivery e para os canais diretos, o par `20rem / 1fr` do cardápio a
partir de 1024px — foto à esquerda, itens à direita — e um par assimétrico
`1.05fr / 1fr` no hero a partir de 1024px, alinhado pela base: o texto e o
medidor da noite terminam na mesma linha.

As três cozinhas já tiveram grade própria, de três colunas, numa seção logo
acima do cardápio. Ela saiu: repetia o que as abas do cardápio já diziam, com o
mesmo rótulo de temperatura na tela duas vezes. A tese das três cozinhas agora
abre o próprio cardápio, e as abas respondem por uma cozinha de cada vez.

O header é fixo, transparente no topo, e ao passar de 24px de rolagem ganha fundo
`coal` a 90% com desfoque de 12px e um fio inferior. O hero compensa com 128px de
respiro superior (160px a partir de 640px).

Breakpoints herdados do Tailwind: 640px, 768px, 1024px.

### Named Rules

**A Regra da Costura.** Seções vizinhas são separadas por um fio de 1px em
`char`, nunca por espaço em branco sozinho. O corte precisa ser visível.

**A Regra da Margem Esquerda.** Nada de texto centralizado. A página inteira é
lida a partir de uma única aresta vertical.

## Elevation & Depth

O sistema é plano por doutrina. Não há sombra ambiente, não há camada elevada, não
há cartão que pareça descolado da página. A profundidade é obtida por dois meios
apenas: o degrau tonal entre `coal` e `soot`, e o fio de 1px em `char` que
delimita cada superfície. Um cartão de cozinha é literalmente o mesmo preto do
fundo — o que o separa é a borda e o vão.

A única exceção é o elemento genuinamente sobreposto: o menu de navegação do
celular, que abre por cima do conteúdo e usa uma sombra profunda para provar que
está flutuando. Essa é a licença do sistema — sobreposição real pode projetar
sombra; superfície assentada, nunca.

Os discos de brasa do hero e o anel em volta do ponto do medidor não são sombra:
são luz emitida, e seguem a Regra da Brasa como Luz.

### Shadow Vocabulary

- **Sobreposição** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)`): exclusiva
  de elementos que abrem por cima do conteúdo — hoje só o menu mobile.
- **Anel de brasa** (`box-shadow: 0 0 0 4px rgb(212 85 29 / 0.4)`): o halo em
  volta do marcador de hora atual no medidor da noite. É calor, não elevação.

### Named Rules

**A Regra do Plano.** Toda superfície assentada é plana. Se algo precisa de
sombra para se destacar, ou ele está realmente sobreposto, ou o problema é de
contraste tonal e se resolve em `soot`, `char` ou tipografia.

## Shapes

A forma padrão é o retângulo puro. Botão, aba, cartão, campo, contorno, painel de
menu: raio zero em toda parte. A geometria é de placa cortada, não de pastilha.

O raio total (`9999px`) é reservado ao que é redondo por natureza física: o
avatar circular da logo (sempre sobre fundo branco, porque o arquivo é PNG com
fundo claro), o ponto que marca a hora atual, e os trilhos-pílula das barras de
horário e do medidor da noite — que representam um intervalo contínuo de tempo e
por isso têm ponta arredondada.

Toda linha do sistema tem 1px e a cor `char`: bordas de seção, contorno de botão
secundário, divisória de lista, sublinhado de campo de formulário. No hover, a
linha muda de cor — para `gold` no caso geral, ou para o acento da própria
cozinha a 60% de opacidade nos cartões de cozinha — e nunca muda de espessura.

O acento de cozinha aparece como um filete sólido de 4px de altura por 48px de
largura no topo do cartão, na cor da temperatura daquela cozinha.

### Named Rules

**A Regra do Raio Físico.** Raio de canto só existe onde a coisa é redonda de
verdade. Um retângulo com canto arredondado é a única forma que o sistema não
aceita.

## Components

### Buttons

- **Shape:** retângulo puro, sem raio (0px). Rótulo em mono 700, `0.75rem`,
  tracking `0.1em`, caixa alta.
- **Abertura (creme):** fundo `cream`, texto `coal`, padding 14px 24px. Hover
  vira fundo `gold`. Usado uma vez por página, no CTA de maior peso.
- **Ação (ouro):** fundo `gold`, texto `coal`. Padding 10px 16px no header (mais
  compacto pela barra fixa), 14px 24px no corpo, 16px 24px em largura total no
  envio do formulário. Hover vira fundo `cream`.
- **Contorno:** fundo transparente, borda 1px `char`, texto `cream`, padding
  14px 24px, ícone de 14px à esquerda do rótulo. Hover leva borda e texto a
  `gold` simultaneamente.
- **Ícone quadrado:** o botão de menu do celular é uma caixa de 44px com borda
  `char`; hover leva borda e ícone a `gold`.
- **Transição:** só cor, 150ms. Botão do sistema não translada, não escala e não
  ganha sombra no hover.
- **Foco:** contorno de 2px em `gold` com 3px de deslocamento, herdado do
  `:focus-visible` global. Nunca é removido.

### Tabs

Filtro das três cozinhas no cardápio, com navegação completa por teclado (setas,
Home, End) e `tabIndex` móvel.

- **Ativa:** fundo `cream`, texto `coal`, sem borda.
- **Inativa:** transparente, borda 1px `char`, texto `smoke`; hover leva borda a
  `smoke` e texto a `cream`.
- **Padding:** 10px 20px. Sem raio.

### Cards / Containers

- **Cartão de cozinha:** fundo `coal` sobre grade de `gap-px` em `char` — o vão
  da grade é a borda. Borda própria transparente que ganha o acento da cozinha a
  60% no hover. Padding 32px (40px a partir de 640px). Abre com o filete de
  temperatura, depois nome em Cinzel 2.25rem, rótulo de temperatura em mono na
  cor do acento, chamada em `cream` 1.125rem e detalhe em `smoke` 0.875rem.
- **Cartão de canal de entrega:** altura mínima de 16rem, padding 32px (40px a
  partir de 640px), conteúdo empurrado para as extremidades. O app preferido da
  casa é o único preenchido (fundo `gold`, texto `coal`, hover `cream`); o outro
  vem em contorno `gold/40` com hover que acende a borda e escurece o fundo para
  `soot`. Nome do app em Cinzel 3rem.
- **Faixa de canal direto:** linha horizontal com borda 1px `char`, padding 20px
  24px, nome em Cinzel 1.25rem, nota em `smoke`, e uma seta diagonal à direita
  que desliza 2px para cima e para a direita no hover, virando ouro.

### Inputs / Fields

- **Estilo:** sem caixa. Rótulo em eyebrow acima, campo com fundo transparente e
  apenas um sublinhado de 1px em `char`, padding vertical de 10px, texto `cream`.
- **Foco:** o sublinhado vira `gold`; o `outline` nativo é suprimido no campo
  porque a borda inferior assume o papel — mas o anel global de foco continua
  valendo em todo o resto.
- **Placeholder:** `smoke` a 50%.
- **Validação:** o formulário não mostra botão até estar completo. No lugar dele,
  um bloco com borda `char` em mono `11px` diz exatamente o que falta. Falha vem
  em `ember`, sucesso em `sage`, ambos em região `aria-live`.

### Navigation

- **Desktop (≥1024px):** links em mono `0.75rem`, tracking `0.1em`, caixa alta,
  cor `smoke`, hover `cream`, espaçados 28px. Sem sublinhado, sem indicador de
  seção ativa.
- **Header:** fixo, transparente no topo; passados 24px de rolagem, ganha fundo
  `coal/90`, desfoque de 12px e fio inferior `char`, em transição de cor de 300ms.
  A logo (48px, circular, sobre branco) fica à esquerda com o nome da casa em
  Cinzel ao lado a partir de 640px; o CTA ouro fica sempre à direita, inclusive no
  celular.
- **Mobile:** painel absoluto abaixo do header, fundo `coal` sólido, borda `char`,
  sombra de sobreposição, links empilhados com hover em fundo `soot`.

### Medidor da Noite (componente assinatura)

O elemento que define a página. A noite inteira da casa — do primeiro pedido, às
17h30, ao fim do atendimento presencial, às 2h — vira uma régua, e cada uma das
duas janelas é desenhada sobre ela como uma faixa de brasa: trilho `char/70` ao
fundo, segmento em gradiente `ember → gold` quando a janela está valendo, `char`
chapado quando não está. Um ponto creme de 16px com anel de brasa marca a hora
atual na janela aberta e desliza em transição de 1000ms.

As marcas de hora (18, 20, 22, 00, 02) ficam na posição **real** que ocupam na
régua, não distribuídas por igual: a régua começa às 17h30, então as 18h não são
o zero. Um medidor que mente sobre a escala não é um medidor.

Cada faixa carrega seu próprio rótulo e intervalo em mono, e o bloco fecha com
uma frase que muda de estado: quanto resta de grelha acesa, se ainda dá tempo de
pedir, ou quando a brasa volta. Atualiza a cada 30 segundos, e cada faixa expõe
sua leitura completa em texto para leitor de tela.

## Do's and Don'ts

### Do:

- **Do** manter o fundo de carvão (`#121110`) em qualquer superfície nova. O
  sistema não tem tema claro.
- **Do** usar o ouro para toda ação recorrente e reservar o creme ao CTA de
  abertura, um por página.
- **Do** aplicar o acento da cozinha certa a cada contexto: `ember` no churrasco,
  `gold` no hambúrguer, `sage` no sushi.
- **Do** separar seções com fio de 1px em `char` e alternar o fundo no máximo um
  degrau, para `soot`.
- **Do** alinhar tudo à esquerda dentro do contêiner de 72rem.
- **Do** escrever rótulo, botão e horário em Space Mono maiúsculo com tracking de
  `0.1em`.
- **Do** revelar blocos na entrada com o `rise` de 700ms e escalonamento de 110ms
  entre irmãos, e desligar todo movimento em `prefers-reduced-motion`.
- **Do** manter o anel de foco em ouro com 3px de deslocamento em qualquer
  elemento interativo novo.
- **Do** usar `.shell` para todo contêiner de seção, em vez de repetir largura e
  gutter — é ele que carrega a área segura do notch.
- **Do** dar no mínimo 44px de altura a qualquer alvo de toque, inclusive links
  de texto em mono.

### Don't:

- **Don't** arredondar cantos de retângulo. Raio só onde a forma é redonda de
  verdade.
- **Don't** aplicar sombra a superfície assentada. Sombra é privilégio do que
  realmente sobrepõe o conteúdo.
- **Don't** usar `sage` em contexto de fogo, nem `ember` como fundo de bloco ou
  de botão.
- **Don't** centralizar texto.
- **Don't** colocar Archivo em caixa alta, nem escrever parágrafo em mono.
- **Don't** introduzir foto de comida de banco de imagens ou textura de fumaça: o
  calor da página é luz desfocada, e as únicas imagens legítimas são as da casa.
- **Don't** animar botão com translação, escala ou sombra no hover — só cor.
- **Don't** ampliar a paleta. Oito tokens cobrem o sistema inteiro; uma cor nova
  precisa justificar por que a escala de temperatura não dava conta.
