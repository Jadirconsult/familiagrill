-- Defesa em profundidade no insert de reservas.
--
-- A página já valida expediente e freio de reenvio antes de enviar, mas a
-- chave publicável está no navegador de qualquer visitante: quem chamar a API
-- direto ignora a interface por completo. As regras abaixo vivem no banco, onde
-- não há como desviar delas.

-- 1. Expediente ------------------------------------------------------------------
-- Repete os turnos de src/data/site.ts. São duas fontes da mesma verdade, e isso
-- é deliberado: a interface precisa dos horários para desenhar a página, o banco
-- precisa deles para recusar o que não passou pela página. Mudou um, mude o outro.
--
-- Todos os dias abrem às 18h. O fim varia, e a madrugada pertence ao turno do
-- dia anterior: 1h de quarta ainda é a noite de terça.

create or replace function public.dentro_do_expediente(p_quando timestamptz)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with momento as (
    select
      extract(dow from p_quando at time zone 'America/Sao_Paulo')::int as dia,
      extract(hour from p_quando at time zone 'America/Sao_Paulo')::int * 60
        + extract(minute from p_quando at time zone 'America/Sao_Paulo')::int as minutos
  )
  select case
    when minutos >= 1080 then true          -- 18h em diante: aberto todo dia
    when dia = 0 then minutos < 300         -- madrugada de domingo = sábado, fecha 5h
    when dia = 1 then minutos < 240         -- madrugada de segunda = domingo, fecha 4h
    when dia = 6 then minutos < 300         -- madrugada de sábado = sexta, fecha 5h
    else minutos < 60                       -- demais madrugadas fecham 1h
  end
  from momento;
$$;

revoke all on function public.dentro_do_expediente(timestamptz) from public;
grant execute on function public.dentro_do_expediente(timestamptz) to anon, authenticated;

-- 2. Freio por telefone -----------------------------------------------------------
-- Precisa ser SECURITY DEFINER: quem envia é anônimo e não pode ler a tabela,
-- então uma subconsulta comum na política enxergaria zero linhas e nunca barraria.
--
-- Isto eleva a barreira, não a fecha: quem variar o telefone continua conseguindo
-- inserir. Rate limit de verdade depende do IP, que o Postgres não enxerga — para
-- isso seria preciso uma Edge Function com CAPTCHA na frente do insert.

create or replace function public.limite_reservas_ok(p_telefone text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) < 3
  from public.reservas
  where telefone = p_telefone
    and criado_em > now() - interval '1 hour';
$$;

revoke all on function public.limite_reservas_ok(text) from public;
grant execute on function public.limite_reservas_ok(text) to anon, authenticated;

-- 3. Política de insert -----------------------------------------------------------

drop policy if exists "visitante cria reserva" on public.reservas;
create policy "visitante cria reserva"
  on public.reservas for insert
  to anon, authenticated
  with check (
    data_hora > now()
    and data_hora < now() + interval '90 days'
    and status = 'pendente'
    and public.dentro_do_expediente(data_hora)
    and public.limite_reservas_ok(telefone)
  );
