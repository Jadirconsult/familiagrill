# Regras deste repositório

Landing page do Família Grill & Sushi. Stack em [README.md](README.md), conteúdo
em [src/data/site.ts](src/data/site.ts), decisões de produto em
[PRODUCT.md](PRODUCT.md), decisões visuais em [DESIGN.md](DESIGN.md).

Este arquivo existe para uma coisa só: as regras abaixo custaram trabalho para
serem descobertas e são fáceis de desfazer sem perceber. `npm run build` roda
[scripts/seo-check.mjs](scripts/seo-check.mjs), que reprova a publicação quando
alguma delas quebra — mas o script protege o build, não a decisão. Se você for
remover uma regra, leia primeiro por que ela existe.

## O design está pronto

Não redesenhe nada sem pedido explícito. Paleta, tipografia, espaçamento e as
animações de entrada estão fechados. Mudança de SEO, de medição ou de
performance tem que ser **visualmente neutra**: se o pixel mudou, saiu do
escopo.

## Conteúdo tem uma fonte só

Todo texto, cardápio, horário e endereço vivem em
[src/data/site.ts](src/data/site.ts). Nenhum componente tem texto fixo.

O que o robô lê — título, descrição, canonical, Open Graph, JSON-LD e o
`sitemap.xml` — é **gerado** a partir desse arquivo por
[scripts/seo-build.mjs](scripts/seo-build.mjs), dentro dos marcadores
`<!-- seo:inicio -->` / `<!-- seo:fim -->` do `index.html`. Não escreva esses
valores à mão: já houve três cópias do expediente da casa no repositório, e elas
divergiram.

A migration do Supabase ainda espelha o horário do salão. Mudou `services` em
`site.ts`, mude o SQL também — essa é a única duplicação que sobrou, e é
proposital: quem valida a reserva é o banco.

**Rode `npm run db:check` depois de mexer em `services`/`hours` ou de aplicar
migration.** Ele pergunta ao Postgres o que ele acha dos quatro instantes de
fronteira de cada dia e acusa a divergência. Ficou fora do `npm run build` de
propósito: depende de rede e credencial, e build não pode quebrar porque o
Wi-Fi caiu. Em 29/08/2026 esse script encontrou 7 horários em desacordo — a
migration `20260804_000001_expediente_unico.sql` nunca tinha sido aplicada, e o
site aceitava mesa para 1h30 de uma quarta que o banco recusava calado.

## A página precisa existir no HTML

O `index.html` publicado sai com a landing inteira escrita dentro do `#root`,
pré-renderizada por [src/entry-server.tsx](src/entry-server.tsx). Sem isso, o
arquivo sobe com a div vazia e Bing, DuckDuckGo e os robôs de IA não veem
cardápio, endereço nem horário.

Duas armadilhas em volta disso:

- **A classe `js` é aplicada pelo script em linha do `<head>`**, não por
  `main.tsx`, e não pode estar gravada no arquivo publicado. `html.js .reveal`
  tem `opacity: 0`; se a classe viesse no HTML, quatro seções seriam entregues
  invisíveis a quem não executa JavaScript. O `setTimeout` daquele script é a
  rede de segurança: se o módulo não montar, a classe cai e o conteúdo aparece.
- **É `createRoot`, não `hydrateRoot`.** `NightMeter`, `Order` e `Hours` leem o
  relógio na primeira renderização; o HTML é gerado no build e visitado horas
  depois, então hidratar acusaria divergência em toda visita.

## Todo link que sai do site passa pelo LinkExterno

[src/components/LinkExterno.tsx](src/components/LinkExterno.tsx) é onde a
conversão é registrada. Como todo pedido termina fora do domínio — 99Food,
iFood, WhatsApp, cardápio digital —, um `<a target="_blank">` solto é um pedido
que ninguém consegue contar. O `seo-check` reprova o build se encontrar um.

A exceção é [src/pages/Reservas.tsx](src/pages/Reservas.tsx): ali quem clica no
WhatsApp é a equipe, confirmando mesa por telefone. Contar isso como conversão
sujaria o número.

Canal de pedido novo declara o próprio `evento` em `site.ts` — o TypeScript
cobra no momento em que ele é acrescentado.

## A medição fica desligada até a privacidade estar publicada

`VITE_GA_ID` e `VITE_ADS_ID` vazios significam nenhum script de terceiro
baixado e nenhum dado saindo do navegador. **Não preencha antes de a página de
política de privacidade estar no ar**: o formulário de reserva grava nome e
telefone, e ligar a medição sem aviso é coleta sem base legal — além de motivo
de reprovação da conta no Google Ads.

## O painel da equipe fica fora da busca por cabeçalho, não por robots.txt

`Disallow` impede o rastreio, não a indexação: a URL pode aparecer na busca sem
descrição, e o robô nunca chega a ler o `noindex` de dentro dela. Por isso
`/reservas` **não** está no `robots.txt` — quem barra é o `X-Robots-Tag` do
[public/.htaccess](public/.htaccess), em duas linhas (`NOINDEX` e
`REDIRECT_NOINDEX`, porque o fallback de SPA é um redirecionamento interno e o
Apache renomeia a variável ao atravessá-lo), reforçado pelo componente
[Noindex](src/components/Noindex.tsx) no cliente.

## Endereço incompleto é melhor que endereço errado

Bairro, CEP, coordenadas e faixa de preço continuam fora do JSON-LD porque
nunca foram confirmados com a casa. Não preencha por dedução: dado estruturado
errado é pior do que ausente. Quando forem confirmados, entram em `site.ts` e o
gerador leva ao resto sozinho.

## Orçamento de peso

Teto no `seo-check`: imagem 200 kB, vídeo 800 kB, JavaScript inicial 300 kB.
Estourar reprova o build. Foi assim que uma logo de 410 kB que nenhum
componente usava parou de viajar para o servidor a cada deploy.

## Infraestrutura

- **Produção é a hospedagem própria** (cPanel/Apache). A Vercel é preview de
  branch — o alias `.vercel.app` não pode aparecer em canonical, `og:` nem
  JSON-LD, e o `seo-check` reprova se aparecer.
- **`public/.htaccess` é obrigatório.** Sem o rewrite dele, `/reservas` responde
  404 no Apache.
- **Para conferir DNS recém-alterado, pergunte ao autoritativo**
  (`nslookup familiagrill.com.br ns9.srvif.com`). Resolver público devolve cache
  e faz virada concluída parecer pendente por horas.
