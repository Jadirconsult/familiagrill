import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Kitchens } from './components/Kitchens'
import { Menu } from './components/Menu'
import { Hours } from './components/Hours'
import { Visit } from './components/Visit'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Kitchens />
        <Menu />
        <Hours />
        <Visit />
      </main>
      <Footer />
    </>
  )
}
