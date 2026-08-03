import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { brand, primaryChannel } from '../data/site'

const links = [
  { href: '#cozinhas', label: 'As três cozinhas' },
  { href: '#cardapio', label: 'Cardápio' },
  { href: '#pedir', label: 'Delivery' },
  { href: '#horarios', label: 'Horários' },
  { href: '#visita', label: 'Onde estamos' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'border-b border-char bg-coal/90 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:gap-6 sm:px-8">
        <a href="#topo" className="flex items-center gap-3" aria-label={`${brand.fullName} — início`}>
          <img
            src="/logo-familia-grill.webp"
            alt=""
            width={48}
            height={48}
            className="size-12 rounded-full ring-1 ring-char"
          />
          <span className="display hidden text-lg leading-tight text-cream sm:block">
            {brand.name}
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-xs tracking-widest text-smoke uppercase transition-colors hover:text-cream"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuOpen((open) => !open)}
          className="grid size-11 place-items-center border border-char text-cream transition-colors hover:border-gold hover:text-gold lg:hidden"
        >
          {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>

        <a
          href={primaryChannel.url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 bg-gold px-4 py-2.5 font-mono text-xs font-bold tracking-widest text-coal uppercase transition-colors hover:bg-cream"
        >
          Pedir no {primaryChannel.name}
        </a>

        {menuOpen && (
          <nav
            id="menu-mobile"
            aria-label="Navegação principal"
            className="absolute top-full right-5 left-5 grid border border-char bg-coal p-3 shadow-2xl sm:right-8 sm:left-8 lg:hidden"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 font-mono text-xs tracking-widest text-smoke uppercase transition-colors hover:bg-soot hover:text-cream"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
