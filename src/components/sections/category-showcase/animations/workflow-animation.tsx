'use client'

import { motion } from 'framer-motion'
import { Zap, Calendar, Bell, FileText, Mail, Check, ArrowRight, Sparkles, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

interface WorkflowAnimationProps {
  speed?: number
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}

export function WorkflowAnimation({
  speed = 1,
  primaryColor = 'hsl(var(--primary))',
  secondaryColor = 'hsl(var(--secondary))',
  accentColor = 'hsl(var(--accent))',
}: WorkflowAnimationProps) {
  const [activeStep, setActiveStep] = useState(0)

  const workflowSteps = [
    { icon: Calendar, label: 'Buchung', desc: 'Kunde bucht online' },
    { icon: Bell, label: 'Bestätigung', desc: 'Automatische E-Mail' },
    { icon: Clock, label: 'Erinnerung', desc: '24h vor Termin' },
    { icon: FileText, label: 'Rechnung', desc: 'Nach dem Termin' },
    { icon: Mail, label: 'Feedback', desc: 'Bewertungsanfrage' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % workflowSteps.length)
    }, 2000 / speed)
    
    return () => clearInterval(interval)
  }, [speed, workflowSteps.length])

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow Effect */}
      <motion.div
        className="absolute -inset-4 rounded-3xl blur-2xl opacity-25"
        style={{ backgroundColor: primaryColor }}
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 3 / speed, repeat: Infinity }}
      />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 / speed }}
        className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div 
          className="px-4 py-3 border-b border-border/30 flex items-center justify-between"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2 / speed, repeat: Infinity }}
            >
              <Zap className="h-4 w-4 text-white" />
            </motion.div>
            <div>
              <p className="font-semibold text-sm">Automatisierungen</p>
              <p className="text-xs text-muted-foreground">5 aktive Workflows</p>
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5 / speed, repeat: Infinity }}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            <Sparkles className="h-3 w-3" />
            Aktiv
          </motion.div>
        </div>

        {/* Workflow Visualization */}
        <div className="p-6">
          {/* Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-8 left-8 right-8 h-0.5 bg-border/30" />
            <motion.div
              className="absolute top-8 left-8 h-0.5"
              style={{ backgroundColor: primaryColor }}
              animate={{ width: `${(activeStep / (workflowSteps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 / speed }}
            />

            {/* Step Nodes */}
            <div className="relative flex justify-between">
              {workflowSteps.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (0.2 + i * 0.1) / speed }}
                  className="flex flex-col items-center"
                >
                  {/* Node */}
                  <motion.div
                    className="relative w-16 h-16 rounded-xl flex items-center justify-center z-10"
                    style={{
                      backgroundColor: i <= activeStep ? `${primaryColor}20` : `${secondaryColor}30`,
                      border: `2px solid ${i <= activeStep ? primaryColor : 'transparent'}`,
                    }}
                    animate={i === activeStep ? {
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        `0 0 0 0 ${primaryColor}40`,
                        `0 0 0 10px ${primaryColor}00`,
                        `0 0 0 0 ${primaryColor}40`,
                      ],
                    } : {}}
                    transition={{ duration: 1 / speed, repeat: i === activeStep ? Infinity : 0 }}
                  >
                    <step.icon 
                      className="h-6 w-6" 
                      style={{ color: i <= activeStep ? primaryColor : 'hsl(var(--muted-foreground))' }}
                    />
                    
                    {/* Check Badge */}
                    {i < activeStep && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'hsl(142 76% 36%)' }}
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Label */}
                  <p className={`text-xs font-medium mt-2 ${i <= activeStep ? '' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground text-center max-w-[70px]">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Current Action */}
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-8 p-4 rounded-xl border border-border/30"
            style={{ backgroundColor: `${secondaryColor}20` }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2 / speed, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <Zap className="h-5 w-5" style={{ color: accentColor }} />
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {workflowSteps[activeStep].label} wird ausgeführt...
                </p>
                <p className="text-xs text-muted-foreground">
                  {workflowSteps[activeStep].desc}
                </p>
              </div>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1 / speed, repeat: Infinity }}
              >
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 / speed }}
          className="grid grid-cols-3 gap-3 p-4 border-t border-border/20"
          style={{ backgroundColor: `${secondaryColor}20` }}
        >
          {[
            { label: 'Ausgeführt', value: '1,247', period: 'Diese Woche' },
            { label: 'Zeitersparnis', value: '18h', period: 'Geschätzt' },
            { label: 'Erfolgsrate', value: '99.8%', period: 'Durchschnitt' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (1.2 + i * 0.1) / speed }}
              className="text-center"
            >
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              <p className="text-[9px] text-muted-foreground/70">{stat.period}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 / speed }}
        className="absolute -right-3 top-1/4 bg-card/95 backdrop-blur-xl rounded-xl p-3 border border-border/50 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'hsl(142 76% 36% / 0.2)' }}
          >
            <Check className="h-3 w-3 text-green-500" />
          </div>
          <div>
            <p className="text-[10px] font-medium">E-Mail gesendet</p>
            <p className="text-[9px] text-muted-foreground">Vor 2 Min.</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8 / speed }}
        className="absolute -left-3 top-16 bg-card/95 backdrop-blur-xl rounded-xl p-3 border border-border/50 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <Bell className="h-3 w-3" style={{ color: primaryColor }} />
          </div>
          <div>
            <p className="text-[10px] font-medium">Erinnerung</p>
            <p className="text-[9px] text-muted-foreground">Geplant: 14:00</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}





