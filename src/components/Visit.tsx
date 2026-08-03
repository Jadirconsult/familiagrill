import { useState, type FormEvent } from 'react'
import { AtSign, MapPin, MessageCircle } from 'lucide-react'
import { brand } from '../data/site'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useReveal } from '../hooks/useReveal'

type State = 'idle' | 'sending' | 'sent' | 'error'

const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.address.mapsQuery)}`
const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(brand.address.mapsQuery)}&z=16&output=embed`

export function Visit() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section id="visita" className="border-t border-char bg-soot py-20 sm:py-28">
      <div ref={ref} className="reveal mx-auto max-w-6xl px-5 sm:px-8">
        <p className="eyebrow">Onde estamos</p>
        <h2 className="display mt-4 max-w-2xl text-[clamp(2.25rem,6vw,4.5rem)] text-ash">
          Av. Tamandaré, 389
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
                className="inline-flex items-center gap-2 border border-char px-5 py-3 font-mono text-xs font-bold tracking-widest text-ash uppercase transition-colors hover:border-ember hover:text-ember"
              >
                <MapPin className="size-3.5" aria-hidden />
                Abrir no mapa
              </a>
              <a
                href={brand.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-char px-5 py-3 font-mono text-xs font-bold tracking-widest text-ash uppercase transition-colors hover:border-ember hover:text-ember"
              >
                <AtSign className="size-3.5" aria-hidden />
                {brand.instagramHandle}
              </a>
              {brand.whatsapp && (
                <a
                  href={`https://wa.me/${brand.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-char px-5 py-3 font-mono text-xs font-bold tracking-widest text-ash uppercase transition-colors hover:border-ember hover:text-ember"
                >
                  <MessageCircle className="size-3.5" aria-hidden />
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          <ReservationForm />
        </div>
      </div>
    </section>
  )
}

function ReservationForm() {
  const [state, setState] = useState<State>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return

    const form = event.currentTarget
    const data = new FormData(form)

    setState('sending')
    const { error } = await supabase.from('reservas').insert({
      nome: String(data.get('nome')).trim(),
      telefone: String(data.get('telefone')).trim(),
      data_hora: `${data.get('data')}T${data.get('hora')}`,
      pessoas: Number(data.get('pessoas')),
      observacao: String(data.get('observacao') ?? '').trim() || null,
    })

    if (error) {
      setState('error')
      setMessage('A mesa não foi registrada. Tente de novo ou fale com a gente pelo Instagram.')
      return
    }

    form.reset()
    setState('sent')
    setMessage('Mesa registrada. Confirmamos por telefone antes do horário.')
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col justify-center border border-char p-8 sm:p-10">
        <p className="eyebrow">Reservar mesa</p>
        <p className="mt-4 text-lg leading-snug text-ash">
          A reserva online entra no ar assim que o Supabase for configurado.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-smoke">
          Preencha <code className="font-mono text-flare">VITE_SUPABASE_URL</code> e{' '}
          <code className="font-mono text-flare">VITE_SUPABASE_PUBLISHABLE_KEY</code> no
          arquivo <code className="font-mono text-flare">.env.local</code> e rode a migration
          em <code className="font-mono text-flare">supabase/migrations</code>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border border-char p-8 sm:p-10">
      <p className="eyebrow">Reservar mesa</p>
      <h3 className="display mt-4 text-4xl text-ash">Guarde seu lugar</h3>

      <div className="mt-8 space-y-5">
        <Field label="Nome" name="nome" autoComplete="name" required />
        <Field label="Telefone" name="telefone" type="tel" autoComplete="tel" required />

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Data" name="data" type="date" required />
          <Field label="Hora" name="hora" type="time" required defaultValue="20:00" />
          <Field label="Pessoas" name="pessoas" type="number" min={1} max={20} defaultValue={2} required />
        </div>

        <Field label="Alguma observação" name="observacao" placeholder="Aniversário, restrição alimentar, mesa na varanda…" />
      </div>

      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-8 w-full bg-ember px-6 py-4 font-mono text-xs font-bold tracking-widest text-coal uppercase transition-colors hover:bg-flare disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === 'sending' ? 'Enviando…' : 'Reservar mesa'}
      </button>

      {message && (
        <p
          role="status"
          className={`mt-4 font-mono text-xs leading-relaxed ${
            state === 'error' ? 'text-ember' : 'text-jade'
          }`}
        >
          {message}
        </p>
      )}
    </form>
  )
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input
        {...props}
        name={name}
        className="mt-2 w-full border-b border-char bg-transparent py-2.5 text-ash outline-none transition-colors placeholder:text-smoke/60 focus:border-ember"
      />
    </label>
  )
}
