-- Acesso à tabela de reservas.
--
-- O site público grava direto na tabela (insert), e a RLS é quem define o que
-- pode entrar. A leitura é da equipe: quem estiver na tabela `staff`.
--
-- Uma versão anterior deste arquivo criava a função `criar_reserva` e revogava
-- os privilégios de anon/authenticated. Essa combinação derrubava o formulário
-- do site, que faz insert direto — os comandos abaixo desfazem aquele estado
-- caso ele tenha chegado a ser aplicado.

-- 1. Desfaz a tentativa anterior ------------------------------------------------

drop function if exists public.criar_reserva(
  text, text, timestamp without time zone, smallint, text
);

grant usage on schema public to anon, authenticated;
grant insert on public.reservas to anon, authenticated;
grant select, update, delete on public.reservas to authenticated;

-- 2. Quem é a equipe ------------------------------------------------------------

create table if not exists public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  criado_em timestamptz not null default now()
);

alter table public.staff enable row level security;
grant select on public.staff to authenticated;

drop policy if exists "staff le o proprio registro" on public.staff;
create policy "staff le o proprio registro"
  on public.staff for select
  to authenticated
  using (user_id = (select auth.uid()));

-- search_path vazio e nomes qualificados: a função não pode ser desviada por
-- um schema plantado no caminho de busca de quem a chama.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff s where s.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

-- 3. Políticas da tabela de reservas --------------------------------------------

alter table public.reservas enable row level security;

drop policy if exists "visitante cria reserva" on public.reservas;
create policy "visitante cria reserva"
  on public.reservas for insert
  to anon, authenticated
  with check (
    data_hora > now()
    and data_hora < now() + interval '90 days'
    and status = 'pendente'
  );

drop policy if exists "equipe le reservas" on public.reservas;
create policy "equipe le reservas"
  on public.reservas for select
  to authenticated
  using (public.is_staff());

drop policy if exists "equipe atualiza reservas" on public.reservas;
create policy "equipe atualiza reservas"
  on public.reservas for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "equipe apaga reservas" on public.reservas;
create policy "equipe apaga reservas"
  on public.reservas for delete
  to authenticated
  using (public.is_staff());

-- 4. Freio contra reenvio ---------------------------------------------------------
-- Barra a duplicata exata (mesmo telefone, mesmo horário), que é o caso real:
-- duplo clique e reenvio de formulário. Não substitui um rate limit de verdade
-- contra abuso deliberado — para isso é preciso CAPTCHA ou Edge Function, já que
-- o Postgres não enxerga o IP de quem chamou.

create unique index if not exists reservas_sem_duplicata
  on public.reservas (telefone, data_hora);
