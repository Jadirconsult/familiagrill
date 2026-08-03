import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Reservas } from './pages/Reservas'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Fora do menu do site: quem trabalha no salão acessa pelo endereço. */}
        <Route path="/reservas" element={<Reservas />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  )
}
