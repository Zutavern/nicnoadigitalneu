'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export function Hero() {
  const supabase = createClient()
  const imageUrl = supabase
    .storage
    .from('hereo')
    .getPublicUrl('ine_stilvolle_frau_sitzt_entspannt_in_einem_modernen_luxurisen_friseursalon_whrend_ein_charismatisch_0f3cdd9e-3c75-47f6-a902-8f2b7aa78dda.png')

  return (
    <section className="relative w-full">
      {/* Background Image */}
      <div className="relative h-[calc(100vh-40px)] max-h-[800px]">
        <Image
          src={imageUrl.data.publicUrl}
          alt="Stilvolle Frau im Friseursalon"
          fill
          className="object-cover object-center"
          priority
          quality={80}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />

        {/* Content */}
        <div className="container relative h-full">
          <div className="flex h-full items-center">
            <div className="max-w-2xl py-20">
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
        </div>
      </div>
    </section>
  )
} 