'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TestimonialsColumn } from '@/components/ui/testimonials-column'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Quote, Scissors, Building2 } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  role: 'STYLIST' | 'SALON_OWNER'
  text: string
  imageUrl: string | null
  company: string | null
}

interface SectionConfig {
  testimonialsBadgeText: string
  testimonialsTitle: string
  testimonialsDescription: string
  testimonialsStylistTab: string
  testimonialsSalonTab: string
}

const defaultSectionConfig: SectionConfig = {
  testimonialsBadgeText: 'Testimonials',
  testimonialsTitle: 'Was unsere Nutzer sagen',
  testimonialsDescription: 'Erfahren Sie, wie NICNOA&CO.online das Leben von Stuhlmietern und Salonbesitzern verändert',
  testimonialsStylistTab: 'Stuhlmietern',
  testimonialsSalonTab: 'Salonbesitzer',
}

interface TestimonialsSectionProps {
  testimonials: {
    STYLIST: Testimonial[]
    SALON_OWNER: Testimonial[]
  }
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [activeTab, setActiveTab] = useState<'STYLIST' | 'SALON_OWNER'>('STYLIST')
  const [config, setConfig] = useState<SectionConfig>(defaultSectionConfig)

  const hasAnyTestimonials = testimonials.STYLIST.length > 0 || testimonials.SALON_OWNER.length > 0
  const currentTestimonials = testimonials[activeTab]

  // Load config from API
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/global-ui-config')
        if (res.ok) {
          const data = await res.json()
          setConfig({ ...defaultSectionConfig, ...data })
        }
      } catch (error) {
        console.error('Failed to load section config:', error)
      }
    }
    loadConfig()
  }, [])

  // Auto-switch to tab with content if current tab is empty
  useEffect(() => {
    if (currentTestimonials.length === 0 && hasAnyTestimonials) {
      const alternativeTab = testimonials.STYLIST.length > 0 ? 'STYLIST' : 'SALON_OWNER'
      if (activeTab !== alternativeTab) {
        setActiveTab(alternativeTab)
      }
    }
  }, [currentTestimonials.length, hasAnyTestimonials, activeTab, testimonials.STYLIST.length])

  if (!hasAnyTestimonials) {
    return null
  }

  // Teile Testimonials in 3 Spalten auf
  const splitIntoColumns = (items: Testimonial[]) => {
    if (items.length === 0) return [[], [], []]
    
    const columnSize = Math.ceil(items.length / 3)
    return [
      items.slice(0, columnSize),
      items.slice(columnSize, columnSize * 2),
      items.slice(columnSize * 2),
    ]
  }

  const columns = splitIntoColumns(currentTestimonials)

  return (
    <section id="testimonials" className="bg-background my-20 relative overflow-hidden scroll-mt-20">
      <div className="container z-10 mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="border border-primary/20 py-1 px-4 rounded-lg bg-primary/10">
              <div className="flex items-center gap-2">
                <Quote className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{config.testimonialsBadgeText}</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter text-center">
            {config.testimonialsTitle}
          </h2>
          
          <p className="text-center mt-5 text-muted-foreground opacity-75">
            {config.testimonialsDescription}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'STYLIST' | 'SALON_OWNER')}>
            <TabsList className="grid grid-cols-2 bg-muted/50">
              <TabsTrigger 
                value="STYLIST" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Scissors className="h-4 w-4" />
                {config.testimonialsStylistTab}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium">
                  {testimonials.STYLIST.length}
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="SALON_OWNER"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Building2 className="h-4 w-4" />
                {config.testimonialsSalonTab}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium">
                  {testimonials.SALON_OWNER.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Animated Columns */}
        {currentTestimonials.length > 0 && (
          <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
            {columns[0] && columns[0].length > 0 && (
              <TestimonialsColumn 
                testimonials={columns[0]} 
                duration={15} 
              />
            )}
            {columns[1] && columns[1].length > 0 && (
              <TestimonialsColumn 
                testimonials={columns[1]} 
                className="hidden md:block" 
                duration={19} 
              />
            )}
            {columns[2] && columns[2].length > 0 && (
              <TestimonialsColumn 
                testimonials={columns[2]} 
                className="hidden lg:block" 
                duration={17} 
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
