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

Canal de pedido novo declara o próprio `evento` em `site.ts` — o TypeScript
cobra no momento em que ele é acrescentado.

## Este site não coleta dado nenhum de quem visita

Não há formulário, não há banco de dados, não há login. A mesa é combinada
pelo WhatsApp e a casa confirma na hora — foi essa remoção que desobrigou a
página de política de privacidade e liberou a medição.

`VITE_GA_ID` e `VITE_ADS_ID` continuam vazios por padrão: vazios significam
nenhum script de terceiro baixado. **No dia em que forem preenchidos**, o site
passa a carregar o gtag e aí precisa de um aviso de privacidade — cookie de
medição é dado pessoal, mesmo sem formulário. Ligar a medição e escrever esse
aviso é a mesma tarefa, não duas.

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
- **`public/.htaccess` é obrigatório.** Sem o rewrite dele, qualquer rota que
  não seja a raiz responde 404 no Apache.
- **Para conferir DNS recém-alterado, pergunte ao autoritativo**
  (`nslookup familiagrill.com.br ns9.srvif.com`). Resolver público devolve cache
  e faz virada concluída parecer pendente por horas.
