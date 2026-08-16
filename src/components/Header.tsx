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

  // No celular o menu cobre o conteúdo: Esc precisa fechá-lo, como qualquer
  // camada sobreposta.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'border-b border-char bg-coal/90 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      {/* Os vãos abrem só quando há largura para eles: em 1024px a navegação
          completa, a marca e o CTA somam quase o contêiner inteiro, e o
          overflow-x: hidden do body esconderia o estouro em vez de denunciá-lo. */}
      <div className="shell relative flex items-center justify-between gap-2 py-3 sm:gap-4 xl:gap-6">
        <a
          href="#topo"
          className="flex min-h-11 items-center gap-3"
          aria-label={`${brand.fullName} — início`}
        >
          <img
            src="/logo-familia-grill.png"
            alt=""
            width={48}
            height={48}
            className="size-10 rounded-full bg-white sm:size-12"
          />
          <span className="display hidden text-lg leading-tight text-cream sm:block">
            {brand.name}
          </span>
        </a>

        <nav className="hidden items-center gap-4 lg:flex xl:gap-7">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center font-mono text-xs tracking-widest text-smoke uppercase transition-colors hover:text-cream"
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

        {/* O rótulo carrega o destino em toda largura: um CTA persistente que diz
            só o verbo não vende nada. Cabe em 320px — Space Mono tem avanço de
            0,6em, então o rótulo inteiro mede ~143px contra ~172px disponíveis. */}
        <a
          href={primaryChannel.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 shrink-0 items-center bg-gold px-3.5 font-mono text-[11px] font-bold tracking-widest text-coal uppercase transition-colors hover:bg-cream sm:px-4 sm:text-xs"
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
                className="flex min-h-11 items-center px-4 py-3 font-mono text-xs tracking-widest text-smoke uppercase transition-colors hover:bg-soot hover:text-cream"
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
