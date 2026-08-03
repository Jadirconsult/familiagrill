-- Reservas de mesa enviadas pela landing page.
-- Visitante anônimo só pode inserir; leitura fica restrita a quem estiver
-- autenticado (equipe do restaurante).

create table if not exists public.reservas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) between 2 and 120),
  telefone text not null check (char_length(trim(telefone)) between 8 and 20),
  data_hora timestamptz not null,
  pessoas smallint not null check (pessoas between 1 and 20),
  observacao text check (char_length(observacao) <= 500),
  status text not null default 'pendente'
    check (status in ('pendente', 'confirmada', 'cancelada')),
  criado_em timestamptz not null default now()
);

create index if not exists reservas_data_hora_idx on public.reservas (data_hora);

alter table public.reservas enable row level security;

drop policy if exists "visitante cria reserva" on public.reservas;
create policy "visitante cria reserva"
  on public.reservas for insert
  to anon, authenticated
  with check (
    data_hora > now()
    and data_hora < now() + interval '90 days'
  );

drop policy if exists "equipe le reservas" on public.reservas;
create policy "equipe le reservas"
  on public.reservas for select
  to authenticated
  using (true);

drop policy if exists "equipe atualiza reservas" on public.reservas;
create policy "equipe atualiza reservas"
  on public.reservas for update
  to authenticated
  using (true)
  with check (true);
