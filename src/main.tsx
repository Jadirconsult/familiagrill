import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Marca que o JS assumiu. Só então as seções podem começar invisíveis para a
// animação de entrada — sem isso, uma falha de script deixaria a página vazia.
document.documentElement.classList.add('js')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
