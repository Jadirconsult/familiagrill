import { brand, desenvolvedor, primaryChannel } from '../data/site'
import { LinkExterno } from './LinkExterno'

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
        <LinkExterno
          href={primaryChannel.url}
          evento={primaryChannel.evento}
          className="inline-flex min-h-11 shrink-0 items-center bg-gold px-6 py-3.5 font-mono text-xs font-bold tracking-widest text-coal uppercase transition-colors hover:bg-cream"
        >
          Pedir no {primaryChannel.name}
        </LinkExterno>
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
            <LinkExterno
              href={brand.instagram}
              evento="instagram"
              className="inline-flex min-h-11 items-center transition-colors hover:text-cream"
            >
              {brand.instagramHandle}
            </LinkExterno>
          </p>
          {/* smoke/60 sobre carvão dava 3,0:1. O smoke cheio dá 6,21:1. */}
          <p className="mt-4 text-smoke">
            © {new Date().getFullYear()} {brand.fullName}
          </p>
        </div>
      </div>

      {/* A assinatura de quem fez, abaixo de tudo e centralizada — separada do
          bloco da casa por um fio, para não competir com o endereço nem com o
          copyright. Em mono e no tom mais apagado da paleta: presente para quem
          procura, invisível para quem não. */}
      <div className="shell mt-12 border-t border-char pt-8">
        {/* Flex com quebra, e não texto corrido: em 390px a linha inteira não
            cabe, e no texto corrido o telefone partia no meio — "(21)" numa
            linha e "98878-5170" na outra. Cada parte é indivisível, a quebra
            acontece entre elas, e a barra some quando isso ocorre, para não
            sobrar um separador pendurado no fim da primeira linha. */}
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[11px] leading-relaxed tracking-wider text-smoke">
          <span className="whitespace-nowrap">
            Desenvolvido por{' '}
            <LinkExterno
              href={desenvolvedor.site}
              evento="credito_desenvolvedor"
              className="underline decoration-char underline-offset-4 transition-colors hover:text-gold hover:decoration-gold"
            >
              {desenvolvedor.siteLabel}
            </LinkExterno>
          </span>
          <span className="hidden text-char sm:inline" aria-hidden>
            |
          </span>
          <a
            href={desenvolvedor.telefone}
            className="whitespace-nowrap underline decoration-char underline-offset-4 transition-colors hover:text-gold hover:decoration-gold"
          >
            {desenvolvedor.telefoneLabel}
          </a>
        </p>
      </div>
    </footer>
  )
}
