import { useEffect, useState } from 'react'
import { brand } from '../data/site'

const links = [
  { href: '#cozinhas', label: 'As três cozinhas' },
  { href: '#cardapio', label: 'Cardápio' },
  { href: '#horarios', label: 'Horários' },
  { href: '#visita', label: 'Onde estamos' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)

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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <a href="#topo" className="display text-2xl leading-none text-ash">
          Família<span className="text-ember">·</span>Grill
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-xs tracking-widest text-smoke uppercase transition-colors hover:text-ash"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href={brand.orderUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 bg-ember px-4 py-2.5 font-mono text-xs font-bold tracking-widest text-coal uppercase transition-colors hover:bg-flare"
        >
          Pedir agora
        </a>
      </div>
    </header>
  )
}
