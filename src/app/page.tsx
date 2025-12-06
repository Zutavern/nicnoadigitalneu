import { MainNav } from '@/components/layout/main-nav'
import { Hero } from '@/components/sections/hero'

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <MainNav />
      <Hero />
    </main>
  )
}
