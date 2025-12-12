'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Check, Key, FileCheck, Eye, Server, ShieldCheck } from 'lucide-react'

interface ShieldAnimationProps {
  speed?: number
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}

export function ShieldAnimation({
  speed = 1,
  primaryColor = 'hsl(var(--primary))',
  secondaryColor = 'hsl(var(--secondary))',
  accentColor = 'hsl(var(--accent))',
}: ShieldAnimationProps) {
  const securityFeatures = [
    { icon: Lock, label: 'SSL-Verschlüsselung', status: 'Aktiv' },
    { icon: FileCheck, label: 'DSGVO-konform', status: 'Verifiziert' },
    { icon: Server, label: 'Deutsche Server', status: 'Frankfurt' },
    { icon: Key, label: '2FA aktiviert', status: 'Geschützt' },
  ]

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Multi-layer Glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: primaryColor }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 4 / speed, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-10 rounded-full blur-2xl opacity-30"
        style={{ backgroundColor: accentColor }}
        animate={{ 
          scale: [1.1, 1, 1.1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 3 / speed, repeat: Infinity, delay: 0.5 / speed }}
      />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 / speed }}
        className="relative"
      >
        {/* Central Shield */}
        <div className="flex flex-col items-center mb-6">
          {/* Orbiting Elements */}
          <div className="relative w-40 h-40">
            {/* Orbit Rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-dashed opacity-30"
              style={{ borderColor: primaryColor }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20 / speed, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border border-dashed opacity-20"
              style={{ borderColor: accentColor }}
              animate={{ rotate: -360 }}
              transition={{ duration: 15 / speed, repeat: Infinity, ease: 'linear' }}
            />

            {/* Orbiting Icons */}
            {[0, 90, 180, 270].map((angle, i) => (
              <motion.div
                key={angle}
                className="absolute w-8 h-8"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  rotate: [angle, angle + 360],
                }}
                transition={{ duration: 12 / speed, repeat: Infinity, ease: 'linear' }}
              >
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: i % 2 === 0 ? `${primaryColor}20` : `${accentColor}20`,
                    transform: `translateX(${60}px) rotate(-${angle}deg)`,
                  }}
                  animate={{ rotate: [-angle, -(angle + 360)] }}
                  transition={{ duration: 12 / speed, repeat: Infinity, ease: 'linear' }}
                >
                  {i === 0 && <Lock className="h-3 w-3" style={{ color: primaryColor }} />}
                  {i === 1 && <Key className="h-3 w-3" style={{ color: accentColor }} />}
                  {i === 2 && <Eye className="h-3 w-3" style={{ color: primaryColor }} />}
                  {i === 3 && <FileCheck className="h-3 w-3" style={{ color: accentColor }} />}
                </motion.div>
              </motion.div>
            ))}

            {/* Central Shield Icon */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 / speed, type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                }}
                animate={{ 
                  boxShadow: [
                    `0 0 20px ${primaryColor}40`,
                    `0 0 40px ${primaryColor}60`,
                    `0 0 20px ${primaryColor}40`,
                  ],
                }}
                transition={{ duration: 2 / speed, repeat: Infinity }}
              >
                <ShieldCheck className="h-10 w-10 text-white" />
              </motion.div>
            </motion.div>
          </div>

          {/* Status Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 / speed }}
            className="text-center mt-4"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <motion.span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'hsl(142 76% 36%)' }}
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5 / speed, repeat: Infinity }}
              />
              <span className="text-sm font-medium" style={{ color: 'hsl(142 76% 36%)' }}>
                Vollständig geschützt
              </span>
            </div>
            <p className="text-xs text-muted-foreground">256-bit Verschlüsselung aktiv</p>
          </motion.div>
        </div>

        {/* Security Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 / speed }}
          className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 p-4 shadow-xl"
        >
          <div className="grid grid-cols-2 gap-3">
            {securityFeatures.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (1 + i * 0.1) / speed }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: `${secondaryColor}30` }}
              >
                <motion.div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${primaryColor}20` }}
                  whileHover={{ scale: 1.1 }}
                >
                  <feature.icon className="h-5 w-5" style={{ color: primaryColor }} />
                </motion.div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{feature.label}</p>
                  <div className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-[10px] text-muted-foreground">{feature.status}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Security Score */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 / speed }}
            className="mt-4 pt-4 border-t border-border/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Sicherheits-Score</span>
              <span className="text-sm font-bold" style={{ color: 'hsl(142 76% 36%)' }}>98/100</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(to right, ${primaryColor}, hsl(142 76% 36%))` }}
                initial={{ width: 0 }}
                animate={{ width: '98%' }}
                transition={{ delay: 1.7 / speed, duration: 1 / speed }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating Badges */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 / speed, type: 'spring' }}
        className="absolute -right-2 top-10 bg-card/95 backdrop-blur-xl rounded-lg px-3 py-2 border border-border/50 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-500" />
          <span className="text-xs font-medium">DSGVO</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.2 / speed, type: 'spring' }}
        className="absolute -left-2 bottom-20 bg-card/95 backdrop-blur-xl rounded-lg px-3 py-2 border border-border/50 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4" style={{ color: primaryColor }} />
          <span className="text-xs font-medium">GoBD</span>
        </div>
      </motion.div>
    </div>
  )
}



