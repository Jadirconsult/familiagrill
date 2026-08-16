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

## Supabase

O formulário de reserva grava na tabela `reservas`. Aplique a migration em
[supabase/migrations](supabase/migrations) no projeto e preencha `.env.local`:

```
VITE_SUPABASE_URL=https://lpnrupxeicyhafqjzyvs.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Sem essas variáveis a página continua funcionando: a seção de reserva mostra um
aviso no lugar do formulário.

A RLS permite `insert` anônimo (só para datas futuras, até 90 dias) e restringe
`select`/`update` a usuários autenticados — a equipe lê as reservas pelo painel
do Supabase ou por um app autenticado.

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
