import { brand } from '../data/site'

export function Footer() {
  return (
    <footer className="border-t border-char py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <img
            src="/logo-familia-grill.png"
            alt={brand.fullName}
            width={112}
            height={112}
            className="size-28 rounded-full"
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
            <a href={brand.instagram} target="_blank" rel="noreferrer" className="hover:text-cream">
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
