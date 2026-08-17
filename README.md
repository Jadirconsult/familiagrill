# Família Grill & Sushi

Landing page da casa de churrasco, hambúrguer e sushi da Av. Tamandaré, 389 — Niterói/RJ.

Stack: Vite + React 19 + TypeScript + Tailwind v4 + Supabase.

## Rodar

```bash
npm install
cp .env.example .env.local   # preencha a publishable key
npm run dev
```

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Type-check e build de produção em `dist/` |
| `npm run preview` | Serve o build |
| `npm run lint` | oxlint |

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
- `hours` — a semana, **derivada do salão**. É ela que valida a reserva de mesa,
  então espelha o SQL em `supabase/migrations`. Mudou o salão, mude os dois.

## Deploy

**Produção é a hospedagem própria** (cPanel, Apache, `38.58.181.243`), servindo
`https://www.familiagrill.com.br`. **A Vercel é preview de branch**, não
produção — o alias `familiagrillbr.vercel.app` serve para ver o trabalho em
andamento, e nenhuma URL do site aponta para ele.

Publicar é dar push na `main`:
[.github/workflows/deploy-hospedagem.yml](.github/workflows/deploy-hospedagem.yml)
builda no CI e envia `dist/` por FTPS. Precisa de cinco secrets no repositório:
`FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `VITE_SUPABASE_URL` e
`VITE_SUPABASE_PUBLISHABLE_KEY` — as duas últimas porque o Vite embute as
variáveis no bundle em tempo de build.

[public/.htaccess](public/.htaccess) é obrigatório e vive em `public/` para o
Vite copiá-lo ao `dist/` a cada build. É o equivalente Apache do `vercel.json`:
sem o rewrite dele, abrir `/reservas` direto responde 404, porque o Apache
procura uma pasta com esse nome antes de o React Router existir. Ele também
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

O Supabase gratuito pausa o projeto após sete dias sem atividade, o que derruba
a reserva e o painel.
[.github/workflows/manter-supabase-acordado.yml](.github/workflows/manter-supabase-acordado.yml)
faz um ping segundas e quintas. Atenção: o GitHub desativa workflows agendados
em repositório parado por 60 dias.

## Supabase

O formulário de reserva grava na tabela `reservas`. Aplique a migration em
[supabase/migrations](supabase/migrations) no projeto e preencha `.env.local`:

```
VITE_SUPABASE_URL=https://lpnrupxeicyhafqjzyvs.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Sem essas variáveis a página continua funcionando: a seção de reserva mostra um
aviso no lugar do formulário.

A RLS permite `insert` anônimo e restringe `select`, `update` e `delete` a quem
está na tabela `staff` — não basta estar autenticado. A equipe lê as reservas
em `/reservas`, rota fora do menu e protegida por login.

Reserva com mais de um mês de passada é apagada sozinha: um gatilho de `after
insert` faz a faxina a cada nova reserva. Não apaga mesa futura, e não roda se
ninguém reservar — o que também significa que nada novo se acumula nesse tempo.

O `insert` público passa por cinco condições, todas no banco, porque a chave
publicável fica no navegador de qualquer visitante e quem chama a API direto
ignora o formulário: data futura, teto de 90 dias, `status` inicial obrigatório,
horário dentro do expediente e os freios de volume. Os freios valem sobre o
telefone **normalizado em dígitos** — a coluna gerada `telefone_digitos` —
porque comparar a string crua deixava `(21) 99999-9999` e `21999999999` passarem
como pessoas diferentes.

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
