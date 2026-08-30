# Família Grill & Sushi

Landing page da casa de churrasco, hambúrguer e sushi da Av. Tamandaré, 389 — Niterói/RJ.

Stack: Vite + React 19 + TypeScript + Tailwind v4. Sem back-end: o site é
estático e não guarda dado de ninguém.

## Rodar

```bash
npm install
npm run dev
```

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Type-check, build, pré-renderização e a verificação de publicação |
| `npm run preview` | Serve o build |
| `npm run seo:check` | Só a verificação, contra o `dist/` que já existe |
| `npm run lint` | oxlint |

### O que o build faz além de empacotar

1. `vite build` gera o `dist/` de sempre.
2. [scripts/seo-build.mjs](scripts/seo-build.mjs) **pré-renderiza a landing**
   dentro do `#root` do `index.html` e reescreve, a partir de
   [src/data/site.ts](src/data/site.ts), tudo que os buscadores leem: título,
   descrição, canonical, Open Graph, JSON-LD e o `sitemap.xml`. Sem esse passo o
   arquivo publicado sobe com a div vazia, e quem não executa JavaScript — Bing,
   DuckDuckGo, os robôs de IA — não vê cardápio, endereço nem horário.
3. [scripts/seo-check.mjs](scripts/seo-check.mjs) confere as invariantes e
   **falha o build** se alguma quebrou: página vazia, cardápio pela metade,
   título fora do tamanho que a busca mostra, canonical errado, alias de preview
   vazando para produção, imagem acima do orçamento de peso, link externo sem
   medição. Como o CI publica rodando `npm run build`, uma falha aqui impede o
   deploy em vez de publicar o erro. As regras e o porquê de cada uma estão em
   [CLAUDE.md](CLAUDE.md).

## Onde editar o conteúdo

Todo o texto, cardápio e horários vivem em [src/data/site.ts](src/data/site.ts). Nenhum
componente tem conteúdo fixo — mudar o site é mudar esse arquivo.

- `brand` — nome, endereço, WhatsApp, Instagram, cardápio digital
- `orderChannels` — canais de pedido **em ordem de prioridade**; o primeiro vira o
  botão principal do header e do hero (hoje o 99Food)
- `kitchens` — as três cozinhas e a temperatura de cada uma
- `menu` — destaques por cozinha (sem preço, de propósito: os valores oficiais
  ficam no cardápio digital e mudam sem aviso)
- `services` — os **dois expedientes**, em minutos desde 00:00; fechamentos
  depois da meia-noite passam de 1440 (2h da manhã = `26 * 60`):
  - **Pedido** (delivery e retirada), 17h30 às 1h45
  - **Salão** (atendimento presencial), 18h às 2h
- `hours` — a semana, **derivada do salão**. Alimenta a faixa de dias da
  seção de horários e a frase de atendimento da seção de visita.

## Deploy

**Produção é a hospedagem própria** (cPanel, Apache, `38.58.181.243`), servindo
`https://www.familiagrill.com.br`. **A Vercel é preview de branch**, não
produção — o alias `familiagrillbr.vercel.app` serve para ver o trabalho em
andamento, e nenhuma URL do site aponta para ele.

Publicar é dar push na `main`:
[.github/workflows/deploy-hospedagem.yml](.github/workflows/deploy-hospedagem.yml)
builda no CI e envia `dist/` por FTPS. Precisa de três secrets no repositório: `FTP_SERVER`, `FTP_USERNAME` e
`FTP_PASSWORD`.

[public/.htaccess](public/.htaccess) é obrigatório e vive em `public/` para o
Vite copiá-lo ao `dist/` a cada build. É o equivalente Apache do `vercel.json`:
sem o rewrite dele, abrir qualquer rota que não seja a raiz responde 404,
porque o Apache procura uma pasta com esse nome. Ele também
força HTTPS e o `www`, faz a compressão e separa o cache — `/assets/` é eterno
porque leva hash no nome; imagem dura um dia, porque a logo é feita para ser
trocada mantendo o mesmo arquivo.

Duas coisas que confundem quem olha o servidor depois de um deploy:

- **Assets antigos se acumulam em `public_html/assets/`.** O envio é
  incremental (`dangerous-clean-slate: false`) para que um deploy interrompido
  não derrube o site. O preço é que hashes órfãos ficam lá para sempre — vale
  uma limpeza manual de vez em quando.
- **Deploy que não altera o front-end não envia asset nenhum.** O build gera os
  mesmos hashes, e o FTP só manda o que mudou. A pasta parecer intocada é o
  comportamento correto, não falha do envio.



## A confirmar com o restaurante

Dados levantados do perfil público [@churrascofamiliagrill](https://www.instagram.com/churrascofamiliagrill/).
Antes de publicar, confirme:

- **Links de 99Food e iFood** — em `orderChannels` apontam para a home de cada app,
  não para a página da loja. Trocar pelas URLs diretas.
- **Bairro e CEP** do endereço
- **Itens do cardápio** — os destaques em `menu` são plausíveis, não copiados do
  cardápio digital (que é renderizado por JavaScript e não pôde ser lido)

## Identidade visual

A paleta sai da própria logo da casa, guardada em
[public/logo-familia-grill.png](public/logo-familia-grill.png):

| Token | Hex | De onde veio |
| --- | --- | --- |
| `cream` | `#f5f5eb` | fundo da logo |
| `gold` | `#cb8b26` | cor de ação — escolha de tela, lê como brasa sobre o carvão |
| `coal` | `#121110` | fundo da página |
| `soot` | `#1c1a18` | seções alternadas |
| `ember` | `#d4551d` | brasa do churrasco |
| `sage` | `#8fae9b` | o único tom frio, reservado ao sushi |

As três cozinhas seguem uma escala de temperatura: `ember` no churras, `gold`
no burger, `sage` no sushi. O tom frio nunca aparece nas seções de fogo.

O display é Cinzel — romana em caixa alta com serifas em cunha.

> A logo atual tem 204×204 px. Quando chegar uma versão em alta resolução,
> substitua o arquivo mantendo o mesmo nome — nenhum código muda.
