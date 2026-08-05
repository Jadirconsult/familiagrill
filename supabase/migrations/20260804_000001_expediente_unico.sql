-- Expediente único: todos os dias, das 18h às 2h.
--
-- Substitui a escada por dia de semana de 20260803_000003, onde seg–qui fechavam
-- 1h, sex/sáb 5h e domingo 4h. A casa passou a ter um turno só, e a regra fica
-- proporcionalmente mais simples: ou é 18h em diante, ou é madrugada até as 2h.
--
-- A madrugada continua pertencendo ao turno do dia anterior — 1h de quarta ainda
-- é a noite de terça. Como agora todo dia abre e todo dia fecha no mesmo horário,
-- não é mais preciso olhar o dia da semana para saber a que turno a madrugada
-- pertence: qualquer hora antes das 2h está dentro de um expediente.
--
-- Espelha src/data/site.ts. Mudou um, mude o outro.

create or replace function public.dentro_do_expediente(p_quando timestamptz)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    with_minutos.minutos >= 1080   -- 18h em diante, abertura do dia
    or with_minutos.minutos < 120  -- até 1h59, madrugada do turno anterior
  from (
    select
      extract(hour from p_quando at time zone 'America/Sao_Paulo')::int * 60
        + extract(minute from p_quando at time zone 'America/Sao_Paulo')::int as minutos
  ) as with_minutos;
$$;

revoke all on function public.dentro_do_expediente(timestamptz) from public;
grant execute on function public.dentro_do_expediente(timestamptz) to anon, authenticated;
