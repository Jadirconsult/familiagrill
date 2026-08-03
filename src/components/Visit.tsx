import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AtSign, MapPin, MessageCircle } from 'lucide-react'
import { brand } from '../data/site'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { isWithinOpeningHours } from '../lib/hours'
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
      <div ref={ref} className="reveal mx-auto max-w-6xl px-5 sm:px-8">
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
            <div className="aspect-[4/3] w-full overflow-hidden border border-char">
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
                className="inline-flex items-center gap-2 border border-char px-5 py-3 font-mono text-xs font-bold tracking-widest text-cream uppercase transition-colors hover:border-gold hover:text-gold"
              >
                <MapPin className="size-3.5" aria-hidden />
                Abrir no mapa
              </a>
              <a
                href={`https://wa.me/${brand.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-char px-5 py-3 font-mono text-xs font-bold tracking-widest text-cream uppercase transition-colors hover:border-gold hover:text-gold"
              >
                <MessageCircle className="size-3.5" aria-hidden />
                WhatsApp
              </a>
              <a
                href={brand.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-char px-5 py-3 font-mono text-xs font-bold tracking-widest text-cream uppercase transition-colors hover:border-gold hover:text-gold"
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

  /** O que ainda impede o envio. Vazio significa formulário pronto. */
  const blockers = useMemo(() => {
    const missing: string[] = []
    if (form.nome.trim().length < 2) missing.push('nome')
    if (!isPhoneComplete(form.telefone)) missing.push('telefone')

    const pessoas = Number(form.pessoas)
    if (!Number.isInteger(pessoas) || pessoas < 1 || pessoas > 20) missing.push('pessoas')

    const when = parseDateTime(form.data, form.hora)
    if (!when) {
      if (form.data.length !== 10) missing.push('data')
      if (form.hora.length !== 5) missing.push('hora')
      if (form.data.length === 10 && form.hora.length === 5) {
        return { missing, reason: 'Essa data ou hora não existe. Confira os números.' }
      }
      return { missing, reason: '' }
    }

    if (when.getTime() <= Date.now()) {
      return { missing, reason: 'A reserva precisa ser para um horário futuro.' }
    }
    if (when.getTime() > Date.now() + 90 * 24 * 60 * 60 * 1000) {
      return { missing, reason: 'Aceitamos reservas com até 90 dias de antecedência.' }
    }
    if (!isWithinOpeningHours(when)) {
      return { missing, reason: 'A casa está fechada nesse horário. Confira os horários acima.' }
    }

    return { missing, reason: '' }
  }, [form])

  const isReady = blockers.missing.length === 0 && blockers.reason === ''

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !isReady) return

    const when = parseDateTime(form.data, form.hora)!
    const nome = form.nome.trim()

    setSending(true)
    setFailure('')
    setConfirmation('')

    const { error } = await supabase.from('reservas').insert({
      nome,
      telefone: form.telefone.replace(/\D/g, ''),
      data_hora: toRestaurantTimestamp(when),
      pessoas: Number(form.pessoas),
      observacao: form.observacao.trim() || null,
    })

    setSending(false)

    if (error) {
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
      <div className="flex flex-col justify-center border border-char p-8 sm:p-10">
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
    <form onSubmit={handleSubmit} noValidate className="border border-char p-8 sm:p-10">
      {/* O mesmo rótulo leva a equipe ao painel — discreto para o visitante,
          e protegido por login de qualquer forma. */}
      <Link
        to="/reservas"
        title="Painel da equipe — consultar reservas"
        aria-label="Painel da equipe: consultar reservas (acesso restrito)"
        className="eyebrow transition-colors hover:text-gold"
      >
        Reserve sua Mesa
      </Link>
      <h3 className="display mt-4 text-3xl text-cream">Guarde seu lugar</h3>

      <div className="mt-8 space-y-5">
        <Field
          ref={nomeRef}
          label="Nome"
          name="nome"
          autoComplete="name"
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
          value={form.telefone}
          onValue={(v) => set('telefone')(maskPhone(v))}
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Data"
            name="data"
            inputMode="numeric"
            placeholder="dd/mm/aaaa"
            maxLength={10}
            value={form.data}
            onValue={(v) => set('data')(maskDate(v))}
          />
          <Field
            label="Hora"
            name="hora"
            inputMode="numeric"
            placeholder="20:00"
            maxLength={5}
            value={form.hora}
            onValue={(v) => set('hora')(maskTime(v))}
          />
          <Field
            label="Pessoas"
            name="pessoas"
            type="number"
            min={1}
            max={20}
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

      {/* O botão só existe quando a reserva está completa. Enquanto isso, o
          formulário diz o que falta — senão o visitante fica procurando o botão. */}
      {isReady ? (
        <button
          type="submit"
          disabled={sending}
          className="mt-8 w-full bg-gold px-6 py-4 font-mono text-xs font-bold tracking-widest text-coal uppercase transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? 'Enviando…' : 'Reservar mesa'}
        </button>
      ) : (
        <p className="mt-8 border border-char px-6 py-4 text-center font-mono text-[11px] leading-relaxed tracking-widest text-smoke uppercase">
          {blockers.reason || `Falta preencher: ${blockers.missing.join(', ')}`}
        </p>
      )}

      {(confirmation || failure) && (
        <p
          role="status"
          aria-live="polite"
          className={`mt-4 font-mono text-xs leading-relaxed ${
            failure ? 'text-ember' : 'text-sage'
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
  onValue,
  ref,
  ...props
}: {
  label: string
  name: string
  onValue: (value: string) => void
  ref?: React.Ref<HTMLInputElement>
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input
        {...props}
        ref={ref}
        name={name}
        onChange={(event) => onValue(event.target.value)}
        className="mt-2 w-full border-b border-char bg-transparent py-2.5 text-cream outline-none transition-colors placeholder:text-smoke/50 focus:border-gold"
      />
    </label>
  )
}
