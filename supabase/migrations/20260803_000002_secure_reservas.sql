-- A página pública só pode criar reservas por esta função. Ela controla os
-- campos gravados, converte o horário do restaurante e reduz abuso repetido.

drop policy if exists "visitante cria reserva" on public.reservas;

drop policy if exists "equipe le reservas" on public.reservas;
create policy "equipe le reservas"
  on public.reservas for select
  to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'staff');

drop policy if exists "equipe atualiza reservas" on public.reservas;
create policy "equipe atualiza reservas"
  on public.reservas for update
  to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'staff')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'staff');

revoke all on public.reservas from anon, authenticated;

create or replace function public.criar_reserva(
  p_nome text,
  p_telefone text,
  p_data_hora timestamp without time zone,
  p_pessoas smallint,
  p_observacao text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_now_local timestamp without time zone := now() at time zone 'America/Sao_Paulo';
  v_weekday integer;
  v_minutes integer;
begin
  if char_length(trim(p_nome)) not between 2 and 120
    or char_length(trim(p_telefone)) not between 8 and 20
    or p_pessoas not between 1 and 20
    or char_length(coalesce(trim(p_observacao), '')) > 500 then
    raise exception 'Dados da reserva inválidos';
  end if;

  if p_data_hora <= v_now_local or p_data_hora >= v_now_local + interval '90 days' then
    raise exception 'A reserva deve estar entre agora e os próximos 90 dias';
  end if;

  v_weekday := extract(dow from p_data_hora);
  v_minutes := extract(hour from p_data_hora) * 60 + extract(minute from p_data_hora);

  if not (
    (v_weekday = 0 and (v_minutes < 300 or v_minutes >= 1080)) or
    (v_weekday = 1 and (v_minutes < 240 or v_minutes >= 1080)) or
    (v_weekday = 2 and v_minutes < 60) or
    (v_weekday = 3 and v_minutes >= 1080) or
    (v_weekday in (4, 5) and (v_minutes < 60 or v_minutes >= 1080)) or
    (v_weekday = 6 and (v_minutes < 300 or v_minutes >= 1080))
  ) then
    raise exception 'A casa não funciona nesse horário';
  end if;

  if (
    select count(*)
    from public.reservas
    where telefone = trim(p_telefone)
      and criado_em > now() - interval '10 minutes'
  ) >= 2 then
    raise exception 'Aguarde alguns minutos antes de enviar outra reserva';
  end if;

  insert into public.reservas (nome, telefone, data_hora, pessoas, observacao, status)
  values (
    trim(p_nome),
    trim(p_telefone),
    p_data_hora at time zone 'America/Sao_Paulo',
    p_pessoas,
    nullif(trim(p_observacao), ''),
    'pendente'
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.criar_reserva(text, text, timestamp without time zone, smallint, text)
  from public;
grant execute on function public.criar_reserva(text, text, timestamp without time zone, smallint, text)
  to anon, authenticated;
