import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AtSign, MapPin, MessageCircle } from 'lucide-react'
import { brand, dineInService } from '../data/site'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import { formatMinutes, isWithinOpeningHours } from '../lib/hours'
import {
  formatWhen,
  isPhoneComplete,
  maskDate,
  maskPhone,
  maskTime,
  parseDateTime,
  toRestaurantTimestamp,
} from '../lib/form'
import { useReveal } from '../hooks/useReveal'

const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.address.mapsQuery)}`
const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(brand.address.mapsQuery)}&z=16&output=embed`

export function Visit() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section id="visita" className="border-t border-char bg-soot py-20 sm:py-28">
      <div ref={ref} className="reveal shell">
        <p className="eyebrow">Onde estamos</p>
        <h2 className="display mt-4 max-w-3xl text-[clamp(1.75rem,4.5vw,3.25rem)] text-cream">
          {brand.address.street}
        </h2>
        <p className="mt-4 text-lg text-smoke">
          {brand.address.city}/{brand.address.state} — mesa para dividir, balcão
          para esperar.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="aspect-[4/3] w-full overflow-hidden border border-char sm:aspect-[16/10] lg:aspect-[4/3]">
              <iframe
                title={`Mapa de ${brand.fullName}`}
                src={mapsEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="size-full grayscale-[0.6] contrast-125"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={mapsLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 border border-char px-5 py-3.5 font-mono text-xs font-bold tracking-widest text-cream uppercase transition-colors hover:border-gold hover:text-gold"
              >
                <MapPin className="size-3.5" aria-hidden />
                Abrir no mapa
              </a>
              <a
                href={`https://wa.me/${brand.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 border border-char px-5 py-3.5 font-mono text-xs font-bold tracking-widest text-cream uppercase transition-colors hover:border-gold hover:text-gold"
              >
                <MessageCircle className="size-3.5" aria-hidden />
                WhatsApp
              </a>
              <a
                href={brand.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 border border-char px-5 py-3.5 font-mono text-xs font-bold tracking-widest text-cream uppercase transition-colors hover:border-gold hover:text-gold"
              >
                <AtSign className="size-3.5" aria-hidden />
                Instagram
              </a>
            </div>
          </div>

          <ReservationForm />
        </div>
      </div>
    </section>
  )
}

const EMPTY = { nome: '', telefone: '', data: '', hora: '', pessoas: '2', observacao: '' }

function ReservationForm() {
  const [form, setForm] = useState(EMPTY)
  const [sending, setSending] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [failure, setFailure] = useState('')
  const nomeRef = useRef<HTMLInputElement>(null)

  const set = (field: keyof typeof EMPTY) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }))

  /**
   * O que ainda impede o envio. Vazio significa formulário pronto.
   *
   * `missing` e `reason` são acumulados, nunca alternativos: a versão anterior
   * retornava cedo com o motivo e engolia a lista de campos em falta, então
   * quem digitava uma data passada com o nome vazio via só o erro da data — e o
   * formulário parecia inventar exigências novas quando a data era corrigida.
   */
  const blockers = useMemo(() => {
    const missing: string[] = []
    if (form.nome.trim().length < 2) missing.push('nome')
    if (!isPhoneComplete(form.telefone)) missing.push('telefone')

    const pessoas = Number(form.pessoas)
    if (!Number.isInteger(pessoas) || pessoas < 1 || pessoas > 20) missing.push('pessoas')

    const when = parseDateTime(form.data, form.hora)
    let reason = ''

    if (!when) {
      if (form.data.length !== 10) missing.push('data')
      if (form.hora.length !== 5) missing.push('hora')
      if (form.data.length === 10 && form.hora.length === 5) {
        reason = 'Essa data ou hora não existe. Confira os números.'
      }
    } else if (when.getTime() <= Date.now()) {
      reason = 'A reserva precisa ser para um horário futuro.'
    } else if (when.getTime() > Date.now() + 90 * 24 * 60 * 60 * 1000) {
      reason = 'Aceitamos reservas com até 90 dias de antecedência.'
    } else if (!isWithinOpeningHours(when)) {
      reason = `O salão atende das ${formatMinutes(dineInService.open)} às ${formatMinutes(
        dineInService.close,
      )}. Escolha um horário dentro dessa faixa.`
    }

    return { missing, reason }
  }, [form])

  const isReady = blockers.missing.length === 0 && blockers.reason === ''

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isReady) return

    const when = parseDateTime(form.data, form.hora)!
    const nome = form.nome.trim()

    setSending(true)
    setFailure('')
    setConfirmation('')

    // A biblioteca do banco chega agora, no envio — não no carregamento da
    // página, que é quando quase ninguém vai reservar.
    const client = await getSupabase()
    if (!client) {
      setSending(false)
      setFailure('A reserva online está indisponível agora. Chame a gente no WhatsApp.')
      return
    }

    const { error } = await client.from('reservas').insert({
      nome,
      telefone: form.telefone.replace(/\D/g, ''),
      data_hora: toRestaurantTimestamp(when),
      pessoas: Number(form.pessoas),
      observacao: form.observacao.trim() || null,
    })

    setSending(false)

    if (error) {
      // Sem isto, todo erro do banco vira a mesma frase na tela e a causa se
      // perde. Foi o que aconteceu quando dois aparelhos enviaram a mesma mesa:
      // o motivo estava na resposta e ninguém conseguia vê-lo.
      console.error('[reserva] insert recusado', error)

      // 23505 — o índice reservas_sem_duplicata barrou telefone e horário
      // repetidos. Isso não é falha: é o segundo envio da mesma mesa, e a
      // primeira passou. Acontece com duplo toque, com reenvio de formulário e
      // com a mesma pessoa em dois aparelhos. Chamar de erro e mandar "tente de
      // novo" empurra o cliente a insistir no que nunca vai passar, e ele acaba
      // ligando para pedir uma mesa que já tem — aí a casa cria a segunda, e a
      // duplicata que o índice evitou acontece pelo telefone.
      if (error.code === '23505') {
        setConfirmation(
          `Essa mesa já estava reservada para ${formatWhen(when)} nesse telefone. ` +
            'Não precisa reservar de novo — confirmamos por telefone antes do horário.',
        )
        setForm(EMPTY)
        nomeRef.current?.focus()
        return
      }

      // 42501 é a política de RLS recusando; 23514, um check da tabela. Chega
      // aqui o que a página deixou passar mas o banco não aceita — horário fora
      // do expediente, data vencida entre o preenchimento e o envio, ou volume
      // de tentativas. Nenhum desses melhora repetindo o mesmo envio, então a
      // saída oferecida é conferir o horário ou falar com o salão.
      if (error.code === '42501' || error.code === '23514') {
        setFailure(
          'Não conseguimos registrar essa mesa. Confira o horário ou chame a gente no WhatsApp.',
        )
        return
      }

      // O que sobra é rede ou indisponibilidade — aí tentar de novo é a atitude
      // certa, e a frase só vale para esses casos.
      setFailure('A mesa não foi registrada. Tente de novo ou chame a gente no WhatsApp.')
      return
    }

    setConfirmation(
      `Mesa reservada para ${nome} — ${formatWhen(when)}, ${form.pessoas} ${
        Number(form.pessoas) === 1 ? 'pessoa' : 'pessoas'
      }. Confirmamos por telefone antes do horário.`,
    )
    setForm(EMPTY)
    nomeRef.current?.focus()
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col justify-center border border-char p-6 sm:p-8 lg:p-10">
        <Link to="/reservas" className="eyebrow transition-colors hover:text-gold">
          Reserve sua Mesa
        </Link>
        <p className="mt-4 text-lg leading-snug text-cream">
          A reserva online entra no ar assim que o Supabase for configurado.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-smoke">
          Preencha <code className="font-mono text-gold">VITE_SUPABASE_URL</code> e{' '}
          <code className="font-mono text-gold">VITE_SUPABASE_PUBLISHABLE_KEY</code> no
          arquivo <code className="font-mono text-gold">.env.local</code>.
        </p>
        <a
          href={`https://wa.me/${brand.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center justify-center gap-2 bg-gold px-6 py-3.5 font-mono text-xs font-bold tracking-widest text-coal uppercase transition-colors hover:bg-cream"
        >
          <MessageCircle className="size-3.5" aria-hidden />
          Reservar pelo WhatsApp
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="border border-char p-6 sm:p-8 lg:p-10">
      {/* O rótulo visível dizia "Reserve sua Mesa" e levava ao login da equipe:
          o cliente clicava na própria intenção e caía num muro. Agora a porta da
          equipe diz que é da equipe — e o texto visível bate com o nome
          acessível, como exige a WCAG 2.5.3. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="eyebrow">Reserva de mesa</p>
        <Link
          to="/reservas"
          className="inline-flex min-h-11 items-center font-mono text-[11px] tracking-widest text-smoke uppercase transition-colors hover:text-gold"
        >
          Equipe
        </Link>
      </div>
      <h3 className="display mt-2 text-3xl text-cream">Guarde seu lugar</h3>

      <div className="mt-8 space-y-5">
        <Field
          ref={nomeRef}
          label="Nome"
          name="nome"
          autoComplete="name"
          aria-required
          value={form.nome}
          onValue={set('nome')}
        />
        <Field
          label="Telefone"
          name="telefone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="(21) 99999-9999"
          maxLength={15}
          aria-required
          value={form.telefone}
          onValue={(v) => set('telefone')(maskPhone(v))}
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Data"
            name="data"
            inputMode="numeric"
            placeholder="dd/mm/aaaa"
            hint="dia/mês/ano"
            maxLength={10}
            aria-required
            value={form.data}
            onValue={(v) => set('data')(maskDate(v))}
          />
          <Field
            label="Hora"
            name="hora"
            inputMode="numeric"
            placeholder="20:00"
            hint={`${formatMinutes(dineInService.open)} às ${formatMinutes(dineInService.close)}`}
            maxLength={5}
            aria-required
            value={form.hora}
            onValue={(v) => set('hora')(maskTime(v))}
          />
          <Field
            label="Pessoas"
            name="pessoas"
            type="number"
            min={1}
            max={20}
            aria-required
            value={form.pessoas}
            onValue={set('pessoas')}
          />
        </div>

        <Field
          label="Alguma observação (opcional)"
          name="observacao"
          placeholder="Aniversário, restrição alimentar, mesa na varanda…"
          maxLength={500}
          value={form.observacao}
          onValue={set('observacao')}
        />
      </div>

      {/* O botão continua no DOM mesmo incompleto, apenas desabilitado: some-lo
          fazia quem usa leitor de tela sair do último campo para o nada, sem
          nenhum controle anunciado, e concluir que o formulário estava quebrado. */}
      <button
        type="submit"
        disabled={!isReady || sending}
        aria-describedby={isReady ? undefined : 'reserva-pendencias'}
        className="mt-8 w-full bg-gold px-6 py-4 font-mono text-xs font-bold tracking-widest text-coal uppercase transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:bg-char disabled:text-smoke"
      >
        {sending ? 'Enviando…' : 'Reservar mesa'}
      </button>

      {!isReady && (
        <p
          id="reserva-pendencias"
          role="status"
          aria-live="polite"
          className="mt-4 border border-char px-6 py-4 font-mono text-[11px] leading-relaxed tracking-widest text-smoke uppercase"
        >
          {[
            blockers.missing.length ? `Falta preencher: ${blockers.missing.join(', ')}` : '',
            blockers.reason,
          ]
            .filter(Boolean)
            .join(' ')}
        </p>
      )}

      {/* A garantia que faz alguém entregar o telefone aparecia só depois do
          envio, quando o número já tinha ido. */}
      <p className="mt-4 text-sm leading-relaxed text-smoke">
        Confirmamos por telefone antes do horário. Não usamos seu número para mais nada.
      </p>

      {(confirmation || failure) && (
        <p
          role="status"
          aria-live="polite"
          className={`mt-4 border-l pl-4 text-sm leading-relaxed ${
            // text-ember sobre soot dava 4,23:1 e reprovava em AA a 12px. O texto
            // vai em creme (16,2:1) e o ember vira o filete — que é o papel que o
            // DESIGN.md dá a ele: brasa é luz emitida, não corpo de texto.
            failure ? 'border-ember text-cream' : 'border-sage text-cream'
          }`}
        >
          {failure || confirmation}
        </p>
      )}
    </form>
  )
}

function Field({
  label,
  name,
  hint,
  onValue,
  ref,
  ...props
}: {
  label: string
  name: string
  /** Dica persistente. O placeholder some na primeira tecla; o formato, não. */
  hint?: string
  onValue: (value: string) => void
  ref?: React.Ref<HTMLInputElement>
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const hintId = hint ? `${name}-hint` : undefined

  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input
        {...props}
        ref={ref}
        name={name}
        aria-describedby={hintId}
        onChange={(event) => onValue(event.target.value)}
        // placeholder:text-smoke/50 dava 2,43:1 — reprovava até para texto
        // grande. O smoke cheio dá 6,21:1.
        className="mt-2 min-h-11 w-full border-b border-char bg-transparent py-2.5 text-cream outline-none transition-colors placeholder:text-smoke focus:border-gold"
      />
      {hint && (
        <span id={hintId} className="mt-1.5 block font-mono text-[11px] text-smoke">
          {hint}
        </span>
      )}
    </label>
  )
}
