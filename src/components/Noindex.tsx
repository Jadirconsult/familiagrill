import { useEffect } from 'react'

/**
 * Marca a rota atual como não indexável enquanto ela estiver na tela.
 *
 * Serve a dois casos, por motivos diferentes:
 *
 * - `/reservas`, o painel da equipe. O `.htaccess` já manda
 *   `X-Robots-Tag: noindex` para esse caminho, e o cabeçalho é a defesa
 *   principal — chega antes de qualquer JavaScript. Isto aqui é a segunda
 *   camada, para o dia em que o site for servido por outro servidor, ou em
 *   que o `mod_setenvif` não estiver ligado: o Googlebot executa JavaScript
 *   e lê esta tag.
 *
 * - O catch-all `*`. A landing responde por qualquer endereço inventado com
 *   status 200, porque o fallback de SPA devolve o index.html para tudo. Sem
 *   esta marca, `familiagrill.com.br/qualquer-coisa` é uma página duplicada
 *   indexável, e existem infinitas delas.
 *
 * Por que não deixar isto no robots.txt: `Disallow` impede o rastreio, não a
 * indexação. Uma URL bloqueada que alguém linkar pode aparecer na busca sem
 * descrição, e o robô nunca chegará a ler o `noindex` que está dentro dela.
 */
export function Noindex() {
  useEffect(() => {
    const tag = document.createElement('meta')
    tag.name = 'robots'
    tag.content = 'noindex, nofollow'
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [])

  return null
}
