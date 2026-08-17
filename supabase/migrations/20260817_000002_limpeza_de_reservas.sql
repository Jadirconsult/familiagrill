-- Descarta reserva velha sozinho, a cada nova reserva.
--
-- Mesa que já passou não serve para nada e não deve continuar guardada: são
-- nome e telefone de gente real, e o PRODUCT.md registra que a confirmação é
-- feita por telefone, fora do sistema. Guardar além do útil é só risco.
--
-- Por que preso ao insert, e não agendado: assim a limpeza não depende de
-- nenhuma peça fora do banco. pg_cron precisa de extensão habilitada, e um
-- workflow do GitHub morre calado depois de sessenta dias de repositório
-- parado. Enquanto houver reserva entrando, a faxina acontece; e quando não
-- houver, também não há nada novo se acumulando.

-- 1. A faxina ---------------------------------------------------------------
-- SECURITY DEFINER porque quem dispara é visitante anônimo, que não tem delete
-- na tabela — e não deve ter. O critério é `data_hora`, a data da mesa, nunca
-- `criado_em`: o que importa é a mesa ter passado, não quando foi pedida.
--
-- Um mês inteiro depois da data. É folgado de propósito — a casa ainda pode
-- querer olhar o movimento das últimas semanas, e apagar é irreversível. Para
-- mudar o prazo, é este intervalo e só ele.

create or replace function public.limpa_reservas_antigas()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.reservas
  where data_hora < now() - interval '1 month';
  return null;
end;
$$;

revoke all on function public.limpa_reservas_antigas() from public;

-- Sustenta o delete. O índice de data_hora já existe desde a primeira
-- migration, então a varredura é por faixa e não pesa no insert.

-- 2. O gatilho ---------------------------------------------------------------
-- FOR EACH STATEMENT, não FOR EACH ROW: uma faxina por comando basta, e o
-- formulário insere uma linha de cada vez de qualquer forma.
--
-- AFTER INSERT disparando DELETE não volta a disparar AFTER INSERT, então não
-- há recursão a temer aqui.

drop trigger if exists reservas_limpeza on public.reservas;
create trigger reservas_limpeza
  after insert on public.reservas
  for each statement
  execute function public.limpa_reservas_antigas();

-- O que isto NÃO faz: não apaga reserva futura, por mais antiga que seja a
-- linha, e não apaga nada se ninguém reservar. Reserva cancelada com data
-- futura também fica — quem cancela é a equipe, e apagar por baixo dela
-- esconderia o cancelamento em vez de registrá-lo.
