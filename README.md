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

- `brand` — nome, endereço, links, WhatsApp
- `kitchens` — as três cozinhas e a temperatura de cada uma
- `menu` — destaques por cozinha (sem preço, de propósito: os valores oficiais
  ficam no cardápio digital e mudam sem aviso)
- `hours` — turnos da semana, em minutos desde 00:00; fechamentos depois da
  meia-noite passam de 1440 (5h da manhã = `29 * 60`)

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

- **Terça-feira** — o perfil não lista horário; está marcada como fechada
- **Bairro e CEP** do endereço
- **WhatsApp** — `brand.whatsapp` está `null`, o botão fica oculto até ser preenchido
- **Itens do cardápio** — os destaques em `menu` são plausíveis, não copiados do
  cardápio digital (que é renderizado por JavaScript e não pôde ser lido)
