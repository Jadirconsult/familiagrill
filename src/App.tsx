import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Noindex } from './components/Noindex'

/**
 * Uma rota só.
 *
 * Havia um painel da equipe em /reservas, carregado sob demanda porque trazia
 * o cliente do Supabase junto. Ele existia para a equipe ler as reservas que
 * chegavam pelo formulário; sem o formulário, não há o que ler — a mesa é
 * combinada pelo WhatsApp e confirmada na hora.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
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
