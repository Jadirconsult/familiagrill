import { AtSign, MapPin, MessageCircle } from 'lucide-react'
import { brand, dineInService } from '../data/site'
import { formatMinutes } from '../lib/hours'
import { useReveal } from '../hooks/useReveal'
import { LinkExterno } from './LinkExterno'

const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.address.mapsQuery)}`
const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(brand.address.mapsQuery)}&z=16&output=embed`
const whatsapp = `https://wa.me/${brand.whatsapp}`

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
              <LinkExterno
                href={mapsLink}
                evento="rota_mapa"
                className="inline-flex min-h-11 items-center gap-2 border border-char px-5 py-3.5 font-mono text-xs font-bold tracking-widest text-cream uppercase transition-colors hover:border-gold hover:text-gold"
              >
                <MapPin className="size-3.5" aria-hidden />
                Abrir no mapa
              </LinkExterno>
              <LinkExterno
                href={whatsapp}
                evento="whatsapp"
                className="inline-flex min-h-11 items-center gap-2 border border-char px-5 py-3.5 font-mono text-xs font-bold tracking-widest text-cream uppercase transition-colors hover:border-gold hover:text-gold"
              >
                <MessageCircle className="size-3.5" aria-hidden />
                WhatsApp
              </LinkExterno>
              <LinkExterno
                href={brand.instagram}
                evento="instagram"
                className="inline-flex min-h-11 items-center gap-2 border border-char px-5 py-3.5 font-mono text-xs font-bold tracking-widest text-cream uppercase transition-colors hover:border-gold hover:text-gold"
              >
                <AtSign className="size-3.5" aria-hidden />
                Instagram
              </LinkExterno>
            </div>
          </div>

          <MesaPeloSalao />
        </div>
      </div>
    </section>
  )
}

/**
 * A mesa continua sendo reservada — só não por formulário.
 *
 * O formulário público que ficava aqui gravava nome e telefone numa tabela do
 * Supabase, e a equipe confirmava por telefone depois. A confirmação por
 * telefone sempre foi o passo real; o formulário era um intermediário que
 * cobrava caro: dado pessoal guardado, política de privacidade obrigatória,
 * um banco que precisava ficar acordado, e um painel só para a equipe ler o
 * que chegou.
 *
 * Falando direto com o salão, a casa responde na hora e não guarda nada.
 */
function MesaPeloSalao() {
  return (
    <div className="flex flex-col justify-center border border-char bg-coal p-8 sm:p-10">
      <p className="eyebrow">Reserva de mesa</p>
      <h3 className="display mt-3 text-3xl text-cream">Guarde seu lugar</h3>

      <p className="mt-5 leading-relaxed text-smoke">
        A mesa é combinada direto com o salão, pelo WhatsApp. Diga o dia, o
        horário e quantas pessoas — a casa confirma na hora, com a agenda do
        dia na frente.
      </p>

      <p className="mt-4 text-sm leading-relaxed text-smoke">
        Atendemos todos os dias, das{' '}
        <strong className="font-bold text-cream">
          {formatMinutes(dineInService.open)}
        </strong>{' '}
        às{' '}
        <strong className="font-bold text-cream">
          {formatMinutes(dineInService.close)}
        </strong>
        .
      </p>

      <div className="mt-8">
        <LinkExterno
          href={whatsapp}
          evento="whatsapp"
          className="inline-flex min-h-11 items-center gap-2 bg-gold px-6 py-3.5 font-mono text-xs font-bold tracking-widest text-coal uppercase transition-colors hover:bg-cream"
        >
          <MessageCircle className="size-3.5" aria-hidden />
          Reservar pelo WhatsApp
        </LinkExterno>
      </div>

      {/* Dizer que nada é guardado é informação de verdade para quem hesita em
          deixar telefone num site — e, sem formulário, é literalmente o caso. */}
      <p className="mt-6 font-mono text-[11px] leading-relaxed tracking-wide text-smoke">
        Este site não guarda nenhum dado seu.
      </p>
    </div>
  )
}
