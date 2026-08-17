import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { Menu } from '../components/Menu'
import { Order } from '../components/Order'
import { Hours } from '../components/Hours'
import { Visit } from '../components/Visit'
import { Footer } from '../components/Footer'

export function Landing() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        {/* Menu absorveu a antiga Kitchens: as duas eram vizinhas e diziam a
            mesma coisa duas vezes. */}
        <Menu />
        <Order />
        <Hours />
        <Visit />
      </main>
      <Footer />
    </>
  )
}
