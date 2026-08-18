import { useEffect, useRef, useState } from 'react'

/**
 * A mídia da cozinha escolhida no cardápio: o filme, quando existe, e a foto
 * quando não existe.
 *
 * Churras e burger já têm filme. O sushi continua mostrando a foto, sem
 * buraco e sem placeholder — quando os arquivos chegarem em public/videos/,
 * basta acrescentar a linha no mapa `filmes` abaixo e nada mais muda.
 *
 * Quatro decisões que não são óbvias:
 *
 * 1. O poster é o ÚLTIMO quadro do filme, não o primeiro. O filme abre com a
 *    travessa vazia; usar o primeiro quadro faria quem está em conexão ruim
 *    olhar para um prato vazio, que é o oposto de dar fome.
 *
 * 2. O filme toca uma vez e para no prato montado. Repetir do prato cheio para
 *    a travessa vazia a cada 8 segundos chamaria atenção pelo motivo errado.
 *    Trocar de aba e voltar toca de novo — a troca é o gatilho.
 *
 * 3. Nada é baixado antes da aba ser escolhida. Quem entra no cardápio e vai
 *    direto para o sushi nunca paga os 616 KB do churrasco.
 *
 * 4. Com "reduzir movimento" ligado no sistema, fica só a foto. É acessibilidade
 *    e é banda: 616 KB que não se baixa à toa.
 */

type Foto = { src: string; alt: string; width: number; height: number }

const filmes: Record<string, { src: string; poster: string }> = {
  churras: {
    src: '/videos/churrasco-quadrado.mp4',
    poster: '/videos/churrasco-quadrado.jpg',
  },
  burger: {
    src: '/videos/hamburguer-quadrado.mp4',
    poster: '/videos/hamburguer-quadrado.jpg',
  },
  // sushi: { src: '/videos/sushi-quadrado.mp4', poster: '/videos/sushi-quadrado.jpg' },
}

const classes =
  'mb-8 aspect-square w-full border border-char object-cover lg:mb-0 lg:sticky lg:top-24'

export function KitchenMedia({ kitchenId, photo }: { kitchenId: string; photo: Foto }) {
  const filme = filmes[kitchenId]
  const [semMovimento, setSemMovimento] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const aplica = () => setSemMovimento(mq.matches)
    aplica()
    mq.addEventListener('change', aplica)
    return () => mq.removeEventListener('change', aplica)
  }, [])

  // Trocar de aba recomeça o filme do zero, senão a segunda visita mostraria
  // só o quadro congelado do fim.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    void v.play().catch(() => {})
  }, [kitchenId])

  if (!filme || semMovimento) {
    return (
      <img
        key={photo.src}
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading="lazy"
        decoding="async"
        className={classes}
      />
    )
  }

  return (
    <video
      ref={videoRef}
      key={filme.src}
      src={filme.src}
      poster={filme.poster}
      // O alt da foto vira a descrição do filme: é a mesma cena, e quem usa
      // leitor de tela merece a mesma frase que já foi escrita com cuidado.
      aria-label={photo.alt}
      autoPlay
      muted
      playsInline
      preload="none"
      className={classes}
    />
  )
}
