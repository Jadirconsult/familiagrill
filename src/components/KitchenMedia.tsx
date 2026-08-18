import { useEffect, useRef } from 'react'

/**
 * A mídia da cozinha escolhida no cardápio: o filme, quando existe, e a foto
 * quando não existe.
 *
 * As três cozinhas têm filme. A foto continua sendo o caminho de volta: se um
 * filme for removido do mapa `filmes`, aquela cozinha volta a mostrar a foto
 * sozinha, sem buraco e sem placeholder.
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
 * 4. Este componente NÃO respeita `prefers-reduced-motion`, e a hero respeita.
 *    A distinção é deliberada: a hero é fundo de tela cheia com movimento
 *    periférico e contínuo — exatamente o que causa desconforto em quem liga
 *    essa preferência. Aqui é um quadrado de 320px que toca uma vez, por oito
 *    segundos, e congela. Some-se a isso que boa parte de quem tem a preferência
 *    ligada no Windows a ligou para deixar a interface rápida, sem intenção de
 *    recusar vídeo de comida. Se um dia chegar reclamação de enjoo, o caminho de
 *    volta é uma linha: devolver a checagem de mídia e cair na foto.
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
  sushi: {
    src: '/videos/sushi-quadrado.mp4',
    poster: '/videos/sushi-quadrado.jpg',
  },
}

const classes =
  'mb-8 aspect-square w-full border border-char object-cover lg:mb-0 lg:sticky lg:top-24'

export function KitchenMedia({ kitchenId, photo }: { kitchenId: string; photo: Foto }) {
  const filme = filmes[kitchenId]
  const videoRef = useRef<HTMLVideoElement>(null)

  // Trocar de aba recomeça o filme do zero, senão a segunda visita mostraria
  // só o quadro congelado do fim.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    void v.play().catch(() => {})
  }, [kitchenId])

  if (!filme) {
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
