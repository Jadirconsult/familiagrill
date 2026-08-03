import { MapPin } from 'lucide-react'
import { brand } from '../data/site'
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
        className="coals pointer-events-none absolute top-40 -right-24 size-[26rem] rounded-full bg-flare/15 blur-[120px]"
        style={{ animationDelay: '-3.5s' }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <p className="eyebrow">
          {brand.address.street} · {brand.address.city}/{brand.address.state}
        </p>

        <h1 className="display mt-5 text-[clamp(3.25rem,13vw,9.5rem)] text-ash">
          A brasa não
          <br />
          apaga à
          <span className="text-ember"> meia-noite</span>
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
                href={brand.orderUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-ash px-6 py-3.5 font-mono text-xs font-bold tracking-widest text-coal uppercase transition-colors hover:bg-flare"
              >
                Ver cardápio e pedir
              </a>
              <a
                href="#visita"
                className="inline-flex items-center gap-2 border border-char px-6 py-3.5 font-mono text-xs font-bold tracking-widest text-ash uppercase transition-colors hover:border-ember hover:text-ember"
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
