import { MapPin, MessageCircle } from 'lucide-react'
import { brand, primaryChannel } from '../data/site'
import { NightMeter } from './NightMeter'

export function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* O carvão sob o texto: dois focos de calor, sem imagem, sem gradiente de banner. */}
      <div
        aria-hidden
        className="coals pointer-events-none absolute -top-24 -left-32 size-[34rem] rounded-full bg-ember/25 blur-[130px]"
      />
      <div
        aria-hidden
        className="coals pointer-events-none absolute top-40 -right-24 size-[26rem] rounded-full bg-coral/15 blur-[120px]"
        style={{ animationDelay: '-3.5s' }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* A página abre assinando com o nome da casa. */}
        <p className="brand-mark">✳ {brand.name} ✳</p>
        <p className="eyebrow mt-3">
          {brand.address.street} · {brand.address.city}/{brand.address.state}
        </p>

        <h1 className="display mt-6 text-[clamp(2.5rem,8.5vw,6.5rem)] text-cream">
          A brasa não apaga
          <br />
          à <span className="text-coral">meia-noite</span>
        </h1>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-end">
          <div>
            <p className="max-w-md text-lg leading-relaxed text-smoke">
              Churrasco no carvão, hambúrguer na chapa e sushi artesanal no mesmo
              salão. Abrimos às 18h — e nas sextas e sábados a cozinha só descansa
              às 5h.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={primaryChannel.url}
                target="_blank"
                rel="noreferrer"
                className="bg-cream px-6 py-3.5 font-mono text-xs font-bold tracking-widest text-coal uppercase transition-colors hover:bg-coral"
              >
                Pedir no {primaryChannel.name}
              </a>
              <a
                href={`https://wa.me/${brand.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-char px-6 py-3.5 font-mono text-xs font-bold tracking-widest text-cream uppercase transition-colors hover:border-coral hover:text-coral"
              >
                <MessageCircle className="size-3.5" aria-hidden />
                WhatsApp
              </a>
              <a
                href="#visita"
                className="inline-flex items-center gap-2 border border-char px-6 py-3.5 font-mono text-xs font-bold tracking-widest text-cream uppercase transition-colors hover:border-coral hover:text-coral"
              >
                <MapPin className="size-3.5" aria-hidden />
                Como chegar
              </a>
            </div>
          </div>

          <NightMeter />
        </div>
      </div>
    </section>
  )
}
