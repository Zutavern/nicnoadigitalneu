'use client'

import { motion } from 'framer-motion'
import { Settings, Plug } from 'lucide-react'
import { GoogleBusinessConnection } from '@/components/settings/google-business-connection'

export default function SalonIntegrationsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Plug className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Integrationen</h1>
            <p className="text-muted-foreground">
              Verbinde externe Dienste mit deinem Salon
            </p>
          </div>
        </div>
      </motion.div>

      {/* Google Business Connection */}
      <GoogleBusinessConnection basePath="/salon" />

      {/* Future Integrations Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="border-2 border-dashed rounded-lg p-8 text-center"
      >
        <Settings className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-medium text-muted-foreground mb-2">
          Weitere Integrationen
        </h3>
        <p className="text-sm text-muted-foreground">
          Bald verfügbar: Instagram, Facebook, Terminbuchungssysteme und mehr
        </p>
      </motion.div>
    </div>
  )
}

