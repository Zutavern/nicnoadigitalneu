'use client'

import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative min-h-screen w-full">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/50 to-background" />
      
      {/* Background Image */}
      <div className="absolute inset-0 z-[-1]">
        {/* Hier kommt das Hintergrundbild hin */}
      </div>

      {/* Content */}
      <div className="container relative pt-32 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Revolutionieren <br />
            Sie Ihren <br />
            <span className="text-primary">Salon-Space.</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces.
            Maximieren Sie Ihre Auslastung, minimieren Sie den
            Verwaltungsaufwand und schaffen Sie ein professionelles
            Arbeitsumfeld für selbstständige Stylisten.
          </p>
          <Button size="lg" className="text-lg">
            Jetzt Coworking anbieten
          </Button>
        </div>
      </div>
    </section>
  )
} 