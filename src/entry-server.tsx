import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { Landing } from './pages/Landing'

/**
 * Ponto de entrada da pré-renderização. Roda no Node, durante o build, e
 * devolve a landing inteira já em HTML — ver scripts/seo-build.mjs.
 *
 * Por que a landing e não o App: o App monta um BrowserRouter, que precisa de
 * `window`. Aqui a rota é sempre `/`, então um MemoryRouter dá o contexto de
 * que o `<Link to="/reservas">` do formulário precisa sem tocar em nenhuma API
 * de navegador. O painel da equipe não é pré-renderizado de propósito: é
 * privado, carrega sob demanda e não deve ser indexado.
 *
 * O que roda aqui: só a primeira renderização. Nenhum `useEffect` é executado
 * no servidor, então o IntersectionObserver do useReveal, o relógio do
 * NightMeter e o vídeo da hero ficam de fora — o HTML sai com o estado inicial
 * de cada componente, que é exatamente o que o robô precisa ler.
 */
export function render(): string {
  return renderToString(
    <StrictMode>
      <MemoryRouter initialEntries={['/']}>
        <Landing />
      </MemoryRouter>
    </StrictMode>,
  )
}
