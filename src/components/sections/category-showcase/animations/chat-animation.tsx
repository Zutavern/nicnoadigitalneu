'use client'

import { motion } from 'framer-motion'
import { Check, CheckCheck, Bell, Send, Smile } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ChatAnimationProps {
  speed?: number
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}

export function ChatAnimation({
  speed = 1,
  primaryColor = 'hsl(var(--primary))',
  secondaryColor = 'hsl(var(--secondary))',
  accentColor = 'hsl(var(--accent))',
}: ChatAnimationProps) {
  const [showTyping, setShowTyping] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)

  const messages = [
    { from: 'salon', text: 'Hallo! Ihr Termin ist für morgen um 14:00 Uhr bestätigt. 💇‍♀️', time: '09:30' },
    { from: 'customer', text: 'Perfekt, danke für die Erinnerung!', time: '09:32' },
    { from: 'salon', text: 'Gerne! Falls Sie umbuchen möchten, nutzen Sie einfach unsere Online-Buchung.', time: '09:33' },
    { from: 'customer', text: 'Super Service! Bis morgen 👋', time: '09:35' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setShowTyping(true)
      setTimeout(() => {
        setShowTyping(false)
        setMessageIndex(prev => (prev + 1) % messages.length)
      }, 1500 / speed)
    }, 4000 / speed)

    return () => clearInterval(interval)
  }, [speed, messages.length])

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Glow Effect */}
      <motion.div
        className="absolute -inset-4 rounded-3xl blur-2xl opacity-30"
        style={{ backgroundColor: primaryColor }}
        animate={{ opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 3 / speed, repeat: Infinity }}
      />

      {/* Phone Frame */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 / speed }}
        className="relative bg-card/90 backdrop-blur-xl rounded-[2rem] border border-border/50 overflow-hidden shadow-2xl"
      >
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-10" />

        {/* Status Bar */}
        <div className="flex items-center justify-between px-6 pt-2 pb-1">
          <span className="text-[10px] font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 rounded-sm border border-current" style={{ borderColor: primaryColor }}>
              <div className="w-3 h-1.5 rounded-sm m-0.5" style={{ backgroundColor: primaryColor }} />
            </div>
          </div>
        </div>

        {/* Chat Header */}
        <div 
          className="px-4 py-3 border-b border-border/30 flex items-center gap-3"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <motion.div
            className="relative"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2 / speed, repeat: Infinity }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: primaryColor }}
            >
              NS
            </div>
            <span 
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card"
              style={{ backgroundColor: 'hsl(142 76% 36%)' }}
            />
          </motion.div>
          <div className="flex-1">
            <p className="font-semibold text-sm">NICNOA Salon</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Online
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-3 min-h-[280px] max-h-[280px] overflow-hidden">
          {messages.slice(0, messageIndex + 1).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 / speed }}
              className={`flex ${msg.from === 'salon' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                  msg.from === 'salon' 
                    ? 'rounded-bl-md' 
                    : 'rounded-br-md'
                }`}
                style={{
                  backgroundColor: msg.from === 'salon' 
                    ? `${secondaryColor}50` 
                    : primaryColor,
                  color: msg.from === 'salon' ? 'inherit' : 'white',
                }}
              >
                <p className="text-sm">{msg.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${msg.from === 'salon' ? '' : 'justify-end'}`}>
                  <span className={`text-[10px] ${msg.from === 'salon' ? 'text-muted-foreground' : 'text-white/70'}`}>
                    {msg.time}
                  </span>
                  {msg.from === 'customer' && (
                    <CheckCheck className="h-3 w-3 text-white/70" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {showTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div 
                className="rounded-2xl rounded-bl-md px-4 py-3"
                style={{ backgroundColor: `${secondaryColor}50` }}
              >
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                      animate={{ y: [-2, 2, -2] }}
                      transition={{ 
                        duration: 0.6 / speed, 
                        repeat: Infinity, 
                        delay: i * 0.1 / speed,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-border/30">
          <div className="flex items-center gap-2">
            <div 
              className="flex-1 rounded-full px-4 py-2 text-sm text-muted-foreground flex items-center justify-between"
              style={{ backgroundColor: `${secondaryColor}30` }}
            >
              <span>Nachricht schreiben...</span>
              <Smile className="h-4 w-4" />
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Send className="h-4 w-4 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Floating Notification Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 / speed, type: 'spring' }}
        className="absolute -right-2 -top-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
        style={{ backgroundColor: accentColor }}
      >
        3
      </motion.div>

      {/* SMS/Email Indicator */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2 / speed }}
        className="absolute -left-4 bottom-1/4 bg-card/95 backdrop-blur-xl rounded-xl p-3 border border-border/50 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Check className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-xs font-medium">SMS gesendet</p>
            <p className="text-[10px] text-muted-foreground">Termin-Erinnerung</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}





