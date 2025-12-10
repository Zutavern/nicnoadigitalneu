'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] flex items-center overflow-hidden">
      {/* Animated Background - nutzt CSS Variablen */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, 
            hsl(224 71% 4%), 
            hsl(224 50% 8%), 
            hsl(var(--gradient-from) / 0.3)
          )`
        }}
      >
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--brand-primary) / 0.15) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--brand-primary) / 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Gradient Orbs - nutzen CSS Variablen */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: 'hsl(var(--glow-primary) / 0.3)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: 'hsl(var(--glow-secondary) / 0.2)', animationDelay: '1s' }}
        />
        <div 
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: 'hsl(var(--gradient-via) / 0.2)', animationDelay: '2s' }}
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
              style={{
                backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                borderWidth: '1px',
                borderColor: 'hsl(var(--brand-primary) / 0.2)',
                color: 'hsl(var(--brand-primary))',
              }}
            >
              <Sparkles className="h-4 w-4" />
              <span>Jetzt im Beta-Programm verfügbar</span>
            </motion.div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              Revolutionieren <br />
              Sie Ihren{' '}
              <span className="relative">
                <span 
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, 
                      hsl(var(--gradient-from)), 
                      hsl(var(--gradient-via)), 
                      hsl(var(--gradient-to))
                    )`
                  }}
                >
                  Salon-Space
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1 rounded-full"
                  style={{
                    backgroundImage: `linear-gradient(to right, 
                      hsl(var(--gradient-from)), 
                      hsl(var(--gradient-to))
                    )`
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>
            </h1>
            
            <p className="text-lg text-slate-300 sm:text-xl mb-8 max-w-xl">
              Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces.
              Maximieren Sie Ihre Auslastung, minimieren Sie den
              Verwaltungsaufwand und schaffen Sie ein professionelles
              Arbeitsumfeld für selbstständige Stylisten.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/registrieren">
                <Button 
                  size="lg" 
                  className="text-lg w-full sm:w-auto group border-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                >
                  Jetzt kostenlos starten
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/produkt">
                <Button size="lg" variant="outline" className="text-lg w-full sm:w-auto border-slate-700 text-white hover:bg-slate-800">
                  Produkt entdecken
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              {[
                '14 Tage kostenlos testen',
                'Keine Kreditkarte erforderlich',
                'DSGVO-konform',
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative hidden lg:block"
          >
            {/* Dashboard Preview */}
            <div className="relative">
              {/* Main Card */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundImage: `linear-gradient(to bottom right, 
                          hsl(var(--gradient-from)), 
                          hsl(var(--gradient-to))
                        )`
                      }}
                    >
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">NICNOA Dashboard</h3>
                      <p className="text-slate-400 text-sm">Salon Overview</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Buchungen', value: '247', change: '+12%' },
                    { label: 'Auslastung', value: '87%', change: '+5%' },
                    { label: 'Umsatz', value: '€8.4k', change: '+18%' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50"
                    >
                      <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
                      <p className="text-white text-xl font-bold">{stat.value}</p>
                      <span className="text-green-400 text-xs">{stat.change}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Chart Placeholder */}
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                  <div className="flex items-end gap-2 h-24">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 1 + i * 0.05, duration: 0.5 }}
                        className="flex-1 rounded-t-sm"
                        style={{
                          backgroundImage: `linear-gradient(to top, 
                            hsl(var(--gradient-from)), 
                            hsl(var(--gradient-to))
                          )`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute -left-8 top-1/4 bg-slate-800/90 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Neue Buchung</p>
                    <p className="text-slate-400 text-xs">Maria S. • 14:30</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
                className="absolute -right-4 bottom-1/4 bg-slate-800/90 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'hsl(var(--brand-primary) / 0.2)' }}
                  >
                    <Sparkles className="h-4 w-4" style={{ color: 'hsl(var(--brand-primary))' }} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">+3 Stylisten</p>
                    <p className="text-slate-400 text-xs">Diese Woche</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.a
          href="#testimonials"
          className="flex flex-col items-center gap-3 group cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Maus-Icon mit animiertem Scroll-Rad */}
          <div className="relative">
            <div className="w-7 h-11 rounded-full border-2 border-slate-500/50 flex justify-center pt-2 group-hover:border-primary/70 transition-colors duration-300">
              <motion.div
                className="w-1.5 h-2.5 rounded-full"
                style={{
                  backgroundImage: `linear-gradient(to bottom, 
                    hsl(var(--gradient-from)), 
                    hsl(var(--gradient-to))
                  )`
                }}
                animate={{
                  y: [0, 8, 0],
                  opacity: [1, 0.3, 1],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            
            {/* Glühender Ring-Effekt */}
            <motion.div
              className="absolute -inset-1 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ backgroundColor: 'hsl(var(--glow-primary) / 0.3)' }}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Chevron-Pfeile */}
          <div className="flex flex-col items-center -space-y-1">
            <motion.div
              animate={{
                y: [0, 4, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, 4, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.15,
              }}
            >
              <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-primary/70 transition-colors" />
            </motion.div>
          </div>

          {/* Text */}
          <motion.span
            className="text-xs text-slate-500 font-medium tracking-wider uppercase group-hover:text-primary/80 transition-colors"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Scroll
          </motion.span>
        </motion.a>
      </motion.div>
    </section>
  )
}
