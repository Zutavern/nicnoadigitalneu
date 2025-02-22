'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const supabase = createClient()

  const images = [
    {
      url: 'ine_stilvolle_frau_sitzt_entspannt_in_einem_modernen_luxurisen_friseursalon_whrend_ein_charismatisch_0f3cdd9e-3c75-47f6-a902-8f2b7aa78dda.png',
      alt: 'Stilvolle Frau im Friseursalon'
    },
    {
      url: 'eine_elegante_stilvolle_frau_sitzt_entspannt_in_einem_modernen_luxurisen_kosmetiksalon_whrend_eine_c_7b405fea-2784-48fe-ae70-2d3bdfaaeaff.png',
      alt: 'Elegante Frau im Kosmetiksalon'
    }
  ]

  const imageUrls = images.map(image => {
    const { data } = supabase.storage
      .from('hereo')
      .getPublicUrl(image.url)
    return data.publicUrl
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      )
    }, 10000) // Wechsel alle 10 Sekunden

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative w-full">
      {/* Background Image */}
      <div className="relative h-[calc(100vh-40px)] max-h-[800px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <Image
              src={imageUrls[currentImageIndex]}
              alt={images[currentImageIndex].alt}
              fill
              className="object-cover object-center"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </motion.div>
        </AnimatePresence>

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
              <Link href="/registrieren">
                <Button size="lg" className="text-lg">
                  Jetzt Coworking anbieten
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 