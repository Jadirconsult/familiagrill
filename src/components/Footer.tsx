import { brand } from '../data/site'

export function Footer() {
  return (
    <footer className="border-t border-char py-14 pb-[max(3.5rem,env(safe-area-inset-bottom))]">
      <div className="shell flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <img
            src="/logo-familia-grill.png"
            alt={brand.fullName}
            width={112}
            height={112}
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
          <p className="mt-4 text-smoke/60">
            © {new Date().getFullYear()} {brand.fullName}
          </p>
        </div>
      </div>
    </footer>
  )
}
