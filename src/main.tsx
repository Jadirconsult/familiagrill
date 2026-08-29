import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Marca que o JS assumiu. Só então as seções podem começar invisíveis para a
// animação de entrada — sem isso, uma falha de script deixaria a página vazia.
//
// Quem aplica a classe agora é o script em linha do index.html, que roda antes
// da primeira pintura; a linha abaixo continua aqui só para o caso de aquele
// script não existir (um index.html servido de outro lugar, por exemplo). Ela é
// idempotente. O `montado` é o que desarma o timer de segurança de lá: ele
// diz "o módulo chegou, pode manter as seções escondidas até a revelação".
document.documentElement.classList.add('js')
document.documentElement.dataset.montado = '1'

// createRoot, e não hydrateRoot, mesmo com o #root já preenchido pela
// pré-renderização. Três componentes desta página leem o relógio na primeira
// renderização — NightMeter, o aviso de janela de pedido em Order e o dia em
// destaque em Hours. O HTML é gerado no build e visitado horas depois, então a
// hidratação acusaria divergência em todos eles a cada visita. O React
// descarta a marcação pré-renderizada e monta do zero: o robô lê o HTML, o
// visitante vê o mesmo que sempre viu, e não há divergência para reconciliar.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
