'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Euro, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ChartAnimationProps {
  speed?: number
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}

export function ChartAnimation({
  speed = 1,
  primaryColor = 'hsl(var(--primary))',
  secondaryColor = 'hsl(var(--secondary))',
  accentColor = 'hsl(var(--accent))',
}: ChartAnimationProps) {
  const [countValues, setCountValues] = useState({ revenue: 0, bookings: 0, customers: 0 })
  
  const targetValues = { revenue: 24580, bookings: 247, customers: 156 }
  const barHeights = [35, 55, 40, 70, 50, 85, 65, 90, 75, 95, 80, 88]
  
  useEffect(() => {
    const duration = 2000 / speed
    const steps = 60
    const interval = duration / steps
    
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      
      setCountValues({
        revenue: Math.round(targetValues.revenue * progress),
        bookings: Math.round(targetValues.bookings * progress),
        customers: Math.round(targetValues.customers * progress),
      })
      
      if (step >= steps) clearInterval(timer)
    }, interval)
    
    return () => clearInterval(timer)
  }, [speed])

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow Effect */}
      <motion.div
        className="absolute -inset-4 rounded-3xl blur-2xl opacity-25"
        style={{ backgroundColor: primaryColor }}
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 4 / speed, repeat: Infinity }}
      />

      {/* Dashboard Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 / speed }}
        className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <PieChart className="h-4 w-4" style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="font-semibold text-sm">Analytics Dashboard</p>
              <p className="text-xs text-muted-foreground">Dezember 2024</p>
            </div>
          </div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 / speed }}
            className="text-xs px-2 py-1 rounded-full"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            Live
          </motion.span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 p-4">
          {[
            { icon: Euro, label: 'Umsatz', value: `€${countValues.revenue.toLocaleString()}`, change: '+18%', positive: true },
            { icon: Users, label: 'Buchungen', value: countValues.bookings.toString(), change: '+12%', positive: true },
            { icon: TrendingUp, label: 'Kunden', value: countValues.customers.toString(), change: '+8%', positive: true },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (0.3 + i * 0.1) / speed }}
              className="rounded-xl p-3 border border-border/30"
              style={{ backgroundColor: `${secondaryColor}20` }}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span 
                  className="text-[10px] font-medium flex items-center gap-0.5"
                  style={{ color: stat.positive ? 'hsl(142 76% 36%)' : 'hsl(0 84% 60%)' }}
                >
                  {stat.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="px-4 pb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 / speed }}
            className="rounded-xl p-4 border border-border/30"
            style={{ backgroundColor: `${secondaryColor}10` }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium">Monatliche Performance</p>
              <div className="flex items-center gap-3 text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                  Buchungen
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                  Umsatz
                </div>
              </div>
            </div>
            
            {/* Chart */}
            <div className="flex items-end gap-1.5 h-32">
              {barHeights.map((height, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-sm relative group"
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ 
                    delay: (0.8 + i * 0.05) / speed, 
                    duration: 0.5 / speed,
                    ease: 'easeOut',
                  }}
                  style={{ 
                    background: `linear-gradient(to top, ${primaryColor}, ${accentColor})`,
                  }}
                >
                  {/* Tooltip */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border rounded px-2 py-1 text-[10px] whitespace-nowrap shadow-lg z-10"
                  >
                    €{Math.round(height * 30)}
                  </motion.div>
                </motion.div>
              ))}
            </div>
            
            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>Jan</span>
              <span>Apr</span>
              <span>Jul</span>
              <span>Okt</span>
              <span>Dez</span>
            </div>
          </motion.div>
        </div>

        {/* Mini Donut Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 / speed }}
          className="px-4 pb-4"
        >
          <div className="flex items-center gap-4 p-3 rounded-xl border border-border/30" style={{ backgroundColor: `${secondaryColor}10` }}>
            {/* Donut */}
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="24"
                  fill="none"
                  stroke={`${secondaryColor}50`}
                  strokeWidth="6"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="24"
                  fill="none"
                  stroke={primaryColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={150.8}
                  initial={{ strokeDashoffset: 150.8 }}
                  animate={{ strokeDashoffset: 150.8 * 0.13 }}
                  transition={{ delay: 1.8 / speed, duration: 1 / speed }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">87%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Auslastung</p>
              <p className="text-xs text-muted-foreground">Durchschnitt diese Woche</p>
              <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: 'hsl(142 76% 36%)' }}>
                <ArrowUpRight className="h-3 w-3" />
                <span>+5% vs. letzte Woche</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Trend Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 / speed }}
        className="absolute -right-3 top-1/3 bg-card/95 backdrop-blur-xl rounded-xl p-2 border border-border/50 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'hsl(142 76% 36% / 0.2)' }}
          >
            <TrendingUp className="h-3 w-3 text-green-500" />
          </div>
          <div className="text-[10px]">
            <p className="font-medium">+24%</p>
            <p className="text-muted-foreground">MoM</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}




