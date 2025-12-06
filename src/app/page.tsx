import { MainNav } from '@/components/layout/main-nav'
import { Hero } from '@/components/sections/hero'
import { Footer } from '@/components/layout/footer'

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <MainNav />
      <Hero />
      <Footer />
    </main>
  )
}
