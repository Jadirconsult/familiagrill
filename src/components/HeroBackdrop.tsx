import { useEffect, useState } from 'react'

/**
 * O fundo animado da hero: a travessa de churrasco atrás do texto de abertura.
 *
 * Cinco decisões que não são óbvias e que alguém vai querer "simplificar":
 *
 * 1. O arquivo é 850x720, não 16:9. O original vinha com 215px de tarja preta
 *    de cada lado; cortá-las deixou um quadro quase quadrado. Fixar 16:9 aqui
 *    custaria 34% da altura para sempre — deixar `object-cover` decidir faz o
 *    recorte se adaptar à largura da tela.
 *
 * 2. O poster é o ÚLTIMO quadro. O filme abre com pouca coisa no prato; quem
 *    está em conexão ruim precisa ver a travessa cheia, que é o que dá fome.
 *
 * 3. O vídeo só começa a baixar 400ms depois da página montar. O texto da hero
 *    é o que importa para quem acabou de chegar, e 440 KB competindo com ele no
 *    4G da rua atrasa justamente a primeira impressão.
 *
 * 4. Dois véus, não um. O horizontal protege o texto, que vive à esquerda; o
 *    vertical funde a hero com a seção seguinte, que é coal chapado. Um véu só,
 *    forte o bastante para os dois trabalhos, apagaria o vídeo.
 *
 * 5. Com "reduzir movimento" ligado no sistema, o vídeo não é sequer baixado:
 *    fica o poster. É acessibilidade e é banda.
 */

const filme = {
  src: '/videos/hero-churrasco.mp4',
  poster: '/videos/hero-churrasco.jpg',
}

export function HeroBackdrop() {
  const [semMovimento, setSemMovimento] = useState(true)
  const [liberado, setLiberado] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const aplica = () => setSemMovimento(mq.matches)
    aplica()
    mq.addEventListener('change', aplica)
    return () => mq.removeEventListener('change', aplica)
  }, [])

  useEffect(() => {
    if (semMovimento) return
    const id = window.setTimeout(() => setLiberado(true), 400)
    return () => window.clearTimeout(id)
  }, [semMovimento])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {liberado && !semMovimento ? (
        <video
          src={filme.src}
          poster={filme.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="size-full object-cover opacity-60"
        />
      ) : (
        <img
          src={filme.poster}
          alt=""
          className="size-full object-cover opacity-60"
          decoding="async"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-coal via-coal/85 to-coal/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-coal via-coal/25 to-coal/55" />
    </div>
  )
}
