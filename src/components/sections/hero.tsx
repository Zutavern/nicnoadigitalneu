'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Star } from 'lucide-react'

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
    <>
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

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Was unsere Kunden über uns sagen
            </h2>
            <p className="text-lg text-muted-foreground">
              Erfahren Sie aus erster Hand, wie NICNOA & CO. DIGITAL das Beauty-Business revolutioniert.
            </p>
          </div>

          <Tabs defaultValue="spaces" className="w-full">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2 mx-auto mb-12">
              <TabsTrigger value="spaces">Coworking Spaces</TabsTrigger>
              <TabsTrigger value="mieter">Stuhlmieter</TabsTrigger>
            </TabsList>
            
            <TabsContent value="spaces" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Testimonial 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col h-full rounded-xl border bg-card p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent('Sarah Müller')}&background=27272a&color=fff`}
                      alt="Sarah Müller"
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">Sarah Müller</h3>
                      <p className="text-sm text-muted-foreground">Beauty Lounge München</p>
                      <div className="flex gap-0.5 mt-1">
                        {Array(5).fill(null).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <blockquote className="flex-grow text-muted-foreground">
                    "Dank NICNOA konnten wir unsere Auslastung um 40% steigern. Die digitale Verwaltung spart uns täglich wertvolle Zeit, die wir in unsere Kunden investieren können."
                  </blockquote>
                </motion.div>

                {/* Testimonial 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col h-full rounded-xl border bg-card p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent('Markus Weber')}&background=27272a&color=fff`}
                      alt="Markus Weber"
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">Markus Weber</h3>
                      <p className="text-sm text-muted-foreground">Style Factory Hamburg</p>
                      <div className="flex gap-0.5 mt-1">
                        {Array(5).fill(null).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <blockquote className="flex-grow text-muted-foreground">
                    "Die Plattform ist genial einfach zu bedienen. Unsere Stuhlmieter sind begeistert von der professionellen Darstellung und dem reibungslosen Ablauf."
                  </blockquote>
                </motion.div>

                {/* Testimonial 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col h-full rounded-xl border bg-card p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent('Julia Wagner')}&background=27272a&color=fff`}
                      alt="Julia Wagner"
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">Julia Wagner</h3>
                      <p className="text-sm text-muted-foreground">Beautytime Berlin</p>
                      <div className="flex gap-0.5 mt-1">
                        {Array(5).fill(null).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <blockquote className="flex-grow text-muted-foreground">
                    "Mit NICNOA haben wir endlich den Überblick über alle Abläufe. Die automatische Abrechnung mit den Stuhlmietern ist Gold wert und spart uns viel Verwaltungsaufwand."
                  </blockquote>
                </motion.div>

                {/* Testimonial 4 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col h-full rounded-xl border bg-card p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent('Thomas Klein')}&background=27272a&color=fff`}
                      alt="Thomas Klein"
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">Thomas Klein</h3>
                      <p className="text-sm text-muted-foreground">Hairstyle Deluxe Frankfurt</p>
                      <div className="flex gap-0.5 mt-1">
                        {Array(5).fill(null).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <blockquote className="flex-grow text-muted-foreground">
                    "Die Integration von NICNOA war die beste Entscheidung für unseren Salon. Die Kommunikation zwischen uns und den Stuhlmietern läuft jetzt viel effizienter."
                  </blockquote>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="mieter" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Testimonial 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col h-full rounded-xl border bg-card p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent('Lisa Schmidt')}&background=27272a&color=fff`}
                      alt="Lisa Schmidt"
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">Lisa Schmidt</h3>
                      <p className="text-sm text-muted-foreground">Selbstständige Stylistin</p>
                      <div className="flex gap-0.5 mt-1">
                        {Array(5).fill(null).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <blockquote className="flex-grow text-muted-foreground">
                    "Als Stylistin kann ich mich endlich voll auf meine Kunden konzentrieren. Die digitale Terminverwaltung und Kundenkommunikation läuft wie von selbst."
                  </blockquote>
                </motion.div>

                {/* Testimonial 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col h-full rounded-xl border bg-card p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent('Nina Bauer')}&background=27272a&color=fff`}
                      alt="Nina Bauer"
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">Nina Bauer</h3>
                      <p className="text-sm text-muted-foreground">Kosmetikerin</p>
                      <div className="flex gap-0.5 mt-1">
                        {Array(5).fill(null).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <blockquote className="flex-grow text-muted-foreground">
                    "Mein Geschäft ist seit der Nutzung von NICNOA deutlich professioneller geworden. Die Kunden schätzen besonders die einfache Online-Buchung."
                  </blockquote>
                </motion.div>

                {/* Testimonial 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col h-full rounded-xl border bg-card p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent('Michael Fischer')}&background=27272a&color=fff`}
                      alt="Michael Fischer"
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">Michael Fischer</h3>
                      <p className="text-sm text-muted-foreground">Barbier</p>
                      <div className="flex gap-0.5 mt-1">
                        {Array(5).fill(null).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <blockquote className="flex-grow text-muted-foreground">
                    "Die Flexibilität, die mir NICNOA bietet, ist unschlagbar. Ich kann meine Termine von überall aus verwalten und habe alle wichtigen Geschäftszahlen immer im Blick."
                  </blockquote>
                </motion.div>

                {/* Testimonial 4 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col h-full rounded-xl border bg-card p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent('Sophia Berg')}&background=27272a&color=fff`}
                      alt="Sophia Berg"
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">Sophia Berg</h3>
                      <p className="text-sm text-muted-foreground">Nageldesignerin</p>
                      <div className="flex gap-0.5 mt-1">
                        {Array(5).fill(null).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <blockquote className="flex-grow text-muted-foreground">
                    "Seit ich NICNOA nutze, habe ich mehr Zeit für meine Kunst. Die automatischen Erinnerungen an meine Kunden sind Gold wert und die Stornierungsrate ist deutlich gesunken."
                  </blockquote>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  )
} 