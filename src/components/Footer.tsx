import { brand, primaryChannel } from '../data/site'

export function Footer() {
  return (
    <footer className="border-t border-char py-14 pb-[max(3.5rem,env(safe-area-inset-bottom))]">
      {/* A última coisa que um visitante convencido via era o copyright. A regra
          do pico-fim diz que esse é o momento mais lembrado da visita — ele
          estava sendo gasto em administração. */}
      <div className="shell flex flex-col items-start gap-6 border-b border-char pb-12 sm:flex-row sm:items-center sm:justify-between">
        <p className="display max-w-md text-[clamp(1.5rem,3.5vw,2.25rem)] text-cream">
          A grelha está acesa. Vai encarar?
        </p>
        <a
          href={primaryChannel.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 shrink-0 items-center bg-gold px-6 py-3.5 font-mono text-xs font-bold tracking-widest text-coal uppercase transition-colors hover:bg-cream"
        >
          Pedir no {primaryChannel.name}
        </a>
      </div>

      <div className="shell mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <img
            src="/logo-familia-grill.png"
            alt={brand.fullName}
            width={96}
            height={96}
            className="size-24 rounded-full bg-white sm:size-28"
          />
          <p className="mt-4 font-mono text-xs tracking-widest text-smoke uppercase">
            {brand.tagline}
          </p>
        </div>

        <div className="font-mono text-xs leading-relaxed text-smoke">
          <p>
            {brand.address.street} — {brand.address.city}/{brand.address.state}
          </p>
          <p className="mt-1">
            <a
              href={brand.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center transition-colors hover:text-cream"
            >
              {brand.instagramHandle}
            </a>
          </p>
          {/* smoke/60 sobre carvão dava 3,0:1. O smoke cheio dá 6,21:1. */}
          <p className="mt-4 text-smoke">
            © {new Date().getFullYear()} {brand.fullName}
          </p>
        </div>
      </div>
    </footer>
  )
}
