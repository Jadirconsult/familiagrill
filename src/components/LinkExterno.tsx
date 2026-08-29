import type { AnchorHTMLAttributes } from 'react'
import { registra, type Evento } from '../lib/track'

/**
 * O único jeito de sair deste site.
 *
 * Todos os destinos que importam ficam fora do domínio — 99Food, iFood,
 * WhatsApp, cardápio digital, mapa, Instagram — e é exatamente neles que a
 * conversão acontece. Concentrar as saídas num componente só significa que a
 * medição não pode ser esquecida: não existe caminho para fora que não passe
 * por aqui.
 *
 * O scripts/seo-check.mjs reprova o build se encontrar `target="_blank"` em
 * qualquer outro arquivo. Não é zelo estético: é o que impede o próximo botão
 * de pedido de nascer sem evento de conversão e ninguém notar até o relatório
 * vir vazio.
 *
 * Visualmente é um `<a>` e nada mais — recebe `className` e o resto dos
 * atributos e os repassa inteiros, para nenhuma tela mudar por causa disto.
 */
type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  /** Qual conversão este clique representa. */
  evento: Evento
}

export function LinkExterno({ href, evento, onClick, children, ...resto }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => {
        registra(evento, { destino: href })
        onClick?.(e)
      }}
      {...resto}
    >
      {children}
    </a>
  )
}
