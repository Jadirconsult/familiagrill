-- Endurece o insert público de reservas.
--
-- A superfície: a chave publicável vive no navegador de todo visitante, então
-- qualquer pessoa chama a API direto e a interface deixa de existir. O que
-- sobra de defesa é o que está escrito aqui. Três achados, do pior para o menor.
--
-- ACHADO 1 — o freio por telefone não freava.
-- `limite_reservas_ok` comparava `telefone = p_telefone`, e o índice de
-- duplicata era sobre a mesma string crua. Só que o formulário grava o número
-- mascarado, "(21) 99999-9999", e quem chama a API escolhe o que manda. Para o
-- Postgres, "(21) 99999-9999", "21999999999", "21 99999 9999" e
-- " (21) 99999-9999" são quatro telefones distintos. O mesmo número passava
-- quantas vezes quisesse sem trocar um dígito sequer — bastava reformatar.
-- O check `char_length(trim(telefone))` piorava o disfarce: valida o texto sem
-- espaços, mas grava o texto com eles.
--
-- ACHADO 2 — não havia teto global.
-- Variando o telefone, o limite de 3 por hora não impede nada. A tabela de
-- reservas vira depósito, e o painel da equipe fica inutilizável na noite em
-- que mais importa.
--
-- ACHADO 3 — telefone era texto livre.
-- Oito a vinte caracteres, qualquer um. "PROMO GRATIS!" passava, e a equipe
-- lia aquilo no painel como se fosse um contato.

-- 1. O telefone normalizado -------------------------------------------------
-- Coluna gerada: o Postgres a mantém sozinho, e o front-end não muda uma linha.
-- É sobre ela que passam a valer o freio e a duplicata — a formatação deixa de
-- ser um jeito de virar outra pessoa.

alter table public.reservas
  add column if not exists telefone_digitos text
  generated always as (regexp_replace(telefone, '[^0-9]', '', 'g')) stored;

-- O índice de duplicata muda de base junto. Se esta linha falhar, é porque já
-- existem reservas que só eram distintas pela formatação: elas são exatamente
-- o que este arquivo veio impedir. Apague as repetidas antes de repetir.
drop index if exists public.reservas_sem_duplicata;
create unique index if not exists reservas_sem_duplicata
  on public.reservas (telefone_digitos, data_hora);

-- Sustenta o count por telefone na última hora sem varrer a tabela.
create index if not exists reservas_telefone_recente_idx
  on public.reservas (telefone_digitos, criado_em);

-- Sustenta o teto global.
create index if not exists reservas_criado_em_idx
  on public.reservas (criado_em);

-- 2. Formato do telefone ----------------------------------------------------
-- Dez ou onze dígitos, que é o que `isPhoneComplete` em src/lib/form.ts já
-- exige na página — aqui a mesma regra passa a valer para quem pula a página.
-- NOT VALID de propósito: vale para o que entrar de agora em diante e não
-- rejeita retroativamente uma reserva antiga que a equipe ainda vai atender.

alter table public.reservas
  drop constraint if exists reservas_telefone_formato;

-- O hífen fica por último na classe, sem barra: dentro de colchetes o POSIX do
-- Postgres trata `\` como caractere comum, então "\-" não escaparia nada e
-- ainda aceitaria barra invertida no telefone.
alter table public.reservas
  add constraint reservas_telefone_formato check (
    telefone ~ '^[0-9()+. -]+$'
    and char_length(regexp_replace(telefone, '[^0-9]', '', 'g')) between 10 and 11
  ) not valid;

-- 3. Freio por telefone, agora sobre os dígitos ------------------------------
-- Continua SECURITY DEFINER pelo mesmo motivo de antes: quem envia é anônimo e
-- não pode ler a tabela, então uma subconsulta comum enxergaria zero linhas e
-- nunca barraria nada.

create or replace function public.limite_reservas_ok(p_telefone text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) < 3
  from public.reservas
  where telefone_digitos = regexp_replace(p_telefone, '[^0-9]', '', 'g')
    and criado_em > now() - interval '1 hour';
$$;

revoke all on function public.limite_reservas_ok(text) from public;
grant execute on function public.limite_reservas_ok(text) to anon, authenticated;

-- 4. Teto global -------------------------------------------------------------
-- O freio por telefone só encarece o abuso; quem troca de número passa por ele
-- à vontade. Este é o teto que não depende de identificar ninguém.
--
-- Sessenta por hora é folgado de propósito: a casa tem vinte lugares por
-- reserva e nunca viu esse volume pelo site. O número existe para separar uso
-- de máquina de uso de gente, não para racionar reserva.
--
-- O custo assumido: quem quiser pode gastar o teto e travar a reserva pelo site
-- por uma hora. É bem menos grave que a alternativa — cem mil linhas na tabela
-- não se desfazem sozinhas, enquanto isto se dissolve na hora seguinte — e o
-- WhatsApp continua no ar na mesma seção, que é para onde a página manda quando
-- o formulário não está disponível.

create or replace function public.fluxo_de_reservas_ok()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) < 60
  from public.reservas
  where criado_em > now() - interval '1 hour';
$$;

revoke all on function public.fluxo_de_reservas_ok() from public;
grant execute on function public.fluxo_de_reservas_ok() to anon, authenticated;

-- 5. A política de insert -----------------------------------------------------
-- As regras anteriores continuam todas: futuro, teto de 90 dias, status inicial
-- e expediente. Entram o freio corrigido e o teto global.

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
    and public.fluxo_de_reservas_ok()
  );

-- O que este arquivo deliberadamente NÃO resolve:
--
-- Nada aqui enxerga o IP de quem chamou — o Postgres não o recebe. Rate limit
-- por origem continua dependendo de uma Edge Function com CAPTCHA na frente do
-- insert, e isso segue valendo a pena no dia em que houver abuso real.
--
-- O índice único ainda funciona como oráculo: um insert que falhe por violação
-- de unicidade revela que existe reserva para aquele telefone naquele horário.
-- Explorar isso exige adivinhar telefone e horário exatos, o retorno é uma
-- informação de baixo valor, e fechá-lo custaria trocar o índice por uma função
-- e devolver erro genérico ao formulário. Fica registrado como risco aceito.
--
-- Não há limite de reservas por horário. Seria a defesa mais elegante, porque é
-- regra de negócio de verdade, mas depende da capacidade do salão — número que
-- a casa nunca informou. Não se inventa capacidade: fica pendente de confirmar.
