'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Sparkles,
  Users,
  MessageSquare,
  Rocket,
  Star,
  ArrowRight,
  Zap,
  Instagram
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const benefits = [
  {
    icon: Sparkles,
    title: 'Exklusiver Zugang',
    description: 'Seien Sie unter den Ersten, die unsere innovative Plattform nutzen und gestalten.',
  },
  {
    icon: Users,
    title: 'Direkter Draht',
    description: 'Enger Austausch mit unserem Entwicklungsteam und persönliche Betreuung.',
  },
  {
    icon: MessageSquare,
    title: 'Aktive Mitgestaltung',
    description: 'Ihr Feedback fließt direkt in die Entwicklung ein und prägt die Zukunft der Plattform.',
  },
  {
    icon: Rocket,
    title: 'Vorzugskonditionen',
    description: 'Profitieren Sie von exklusiven Konditionen als Beta-Partner.',
  },
]

export default function BetaProgrammPage() {
  return (
    <main className="min-h-screen bg-background">
      <MainNav />
      
      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="container py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm">
              <Star className="mr-1 h-3.5 w-3.5 fill-primary text-primary" />
              <span className="text-muted-foreground">Limitierte Plätze</span>
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Werden Sie Teil unseres exklusiven <br />
              <span className="text-primary">Beta-Programms</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Wir suchen 5 innovative, digital affine Salon-Spaces, die die Chancen der 
              Digitalisierung erkennen und gemeinsam mit uns die Zukunft des Beauty-Coworkings 
              gestalten möchten. Zeigen Sie uns Ihre Vision für einen modernen Salon-Space!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-8 md:grid-cols-2"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="group relative rounded-xl border bg-card p-6 shadow-lg transition-shadow hover:shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{benefit.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Application Form */}
      <section className="border-t bg-muted/50">
        <div className="container py-16">
          <div className="mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="rounded-xl border bg-card p-8 shadow-lg"
            >
              <div className="mb-8 text-center">
                <Zap className="mx-auto h-8 w-8 text-primary" />
                <h2 className="mt-4 text-2xl font-bold">
                  Jetzt für das Beta-Programm bewerben
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Füllen Sie das Formular aus und werden Sie Teil unserer Vision.
                </p>
              </div>

              <form className="space-y-6">
                <div className="space-y-2">
                  <Input placeholder="Name des Salon-Space" />
                </div>
                <div className="space-y-2">
                  <Input placeholder="Ihr Name" />
                </div>
                <div className="space-y-2">
                  <Input placeholder="Ihre Telefonnummer" type="tel" />
                </div>
                <div className="space-y-2">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Art des Salons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friseur">Friseursalon</SelectItem>
                      <SelectItem value="kosmetik">Kosmetiksalon</SelectItem>
                      <SelectItem value="andere">Andere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Input type="email" placeholder="E-Mail-Adresse" />
                </div>
                <div className="space-y-2">
                  <Input placeholder="Website (optional)" />
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Instagram Profil (optional)" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Textarea 
                    placeholder="Erzählen Sie uns von Ihrem Salon-Space und Ihrer Vision für die digitale Zukunft"
                    className="min-h-[120px]"
                  />
                </div>
                <Button className="w-full group">
                  Bewerbung absenden
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
} 