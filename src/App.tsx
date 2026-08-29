import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Noindex } from './components/Noindex'

/**
 * O painel da equipe carrega sob demanda, e leva o cliente do Supabase junto.
 * Ele não tem nada a ver com a visita de quem vem pedir comida — não faz sentido
 * cobrar esse download de todo mundo que abre a landing no celular.
 */
const Reservas = lazy(() =>
  import('./pages/Reservas').then((m) => ({ default: m.Reservas })),
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Fora do menu do site: quem trabalha no salão acessa pelo endereço. */}
        <Route
          path="/reservas"
          element={
            <Suspense
              fallback={
                <div className="grid min-h-dvh place-items-center px-5">
                  <p className="font-mono text-xs tracking-widest text-smoke uppercase">
                    Carregando o painel…
                  </p>
                </div>
              }
            >
              <Noindex />
              <Reservas />
            </Suspense>
          }
        />
        {/* Endereço inventado devolve a landing, porque o fallback de SPA manda
            o index.html para tudo. Continua devolvendo — trocar por uma página
            de erro seria desenhar tela nova. O `Noindex` resolve o que doía:
            sem ele, cada URL errada era uma cópia indexável desta página. */}
        <Route
          path="*"
          element={
            <>
              <Noindex />
              <Landing />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
