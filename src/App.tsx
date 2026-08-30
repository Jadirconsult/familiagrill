import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Privacidade } from './pages/Privacidade'
import { Noindex } from './components/Noindex'

/**
 * Duas rotas: a landing e o aviso de privacidade.
 *
 * Havia uma terceira, o painel da equipe em /reservas, carregada sob demanda
 * porque trazia o cliente do Supabase junto. Ela existia para a equipe ler as
 * reservas que chegavam pelo formulário; sem o formulário, não há o que ler —
 * a mesa é combinada pelo WhatsApp e confirmada na hora.
 *
 * As duas rotas são pré-renderizadas no build, cada uma no seu arquivo. Ver
 * scripts/seo-build.mjs.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Indexável de propósito: o Google Ads verifica a existência da
            política na revisão da conta, e para isso o robô precisa alcançá-la. */}
        <Route path="/privacidade" element={<Privacidade />} />
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
