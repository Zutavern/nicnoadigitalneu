'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Save,
  Loader2,
  Palette,
  Building2,
  Mail,
  Link as LinkIcon,
  Eye,
  Monitor,
  Smartphone,
  ExternalLink,
} from 'lucide-react'
import { LogoUploader } from '@/components/branding/logo-uploader'

interface BrandingSettings {
  // Basis
  companyName: string | null
  
  // E-Mail Branding
  emailLogoUrl: string | null
  emailPrimaryColor: string | null
  emailFooterText: string | null
  emailFromName: string | null
  emailReplyTo: string | null
}

const BASE_URL = 'https://www.nicnoa.online'

const footerLinks = [
  { label: 'Datenschutz', href: `${BASE_URL}/datenschutz` },
  { label: 'Impressum', href: `${BASE_URL}/impressum` },
  { label: 'AGB', href: `${BASE_URL}/agb` },
  { label: 'Login', href: `${BASE_URL}/login` },
]

export default function AdminBrandingPage() {
  const [settings, setSettings] = useState<BrandingSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  
  // Editierbare Felder
  const [companyName, setCompanyName] = useState('')
  const [emailPrimaryColor, setEmailPrimaryColor] = useState('#10b981')
  const [emailFooterText, setEmailFooterText] = useState('')
  const [emailFromName, setEmailFromName] = useState('')
  const [emailReplyTo, setEmailReplyTo] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  // Einstellungen laden
  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      
      setSettings(data)
      setCompanyName(data.companyName || 'NICNOA')
      setEmailPrimaryColor(data.emailPrimaryColor || '#10b981')
      setEmailFooterText(data.emailFooterText || `© ${new Date().getFullYear()} NICNOA & CO. DIGITAL. Alle Rechte vorbehalten.`)
      setEmailFromName(data.emailFromName || 'NICNOA')
      setEmailReplyTo(data.emailReplyTo || '')
      setLogoUrl(data.emailLogoUrl)
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Fehler beim Laden der Einstellungen')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Speichern
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          emailPrimaryColor,
          emailFooterText,
          emailFromName,
          emailReplyTo: emailReplyTo || null,
          emailLogoUrl: logoUrl,
        }),
      })

      if (!res.ok) throw new Error('Failed to save')
      
      toast.success('Branding-Einstellungen gespeichert')
      loadSettings()
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  // E-Mail Preview HTML generieren
  const generatePreviewHtml = () => {
    const primaryColor = emailPrimaryColor || '#10b981'
    const company = companyName || 'NICNOA'
    const footer = emailFooterText || `© ${new Date().getFullYear()} ${company}. Alle Rechte vorbehalten.`
    
    // Farbe abdunkeln für Gradient
    const darkerColor = adjustColor(primaryColor, -20)
    
    return `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background-color: #f4f4f5;
            color: #18181b;
          }
          .wrapper {
            width: 100%;
            background-color: #f4f4f5;
            padding: 32px 16px;
          }
          .container {
            max-width: 560px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%);
            padding: 28px;
            text-align: center;
          }
          .header img {
            max-height: 44px;
            width: auto;
          }
          .header h1 {
            color: #ffffff;
            margin: 14px 0 0 0;
            font-size: 22px;
            font-weight: 600;
          }
          .content {
            padding: 28px;
            line-height: 1.6;
          }
          .content h2 {
            color: #18181b;
            margin-top: 0;
            font-size: 18px;
          }
          .content p {
            color: #52525b;
            margin: 14px 0;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background-color: ${primaryColor};
            color: #ffffff !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
          }
          .footer {
            background-color: #f9fafb;
            padding: 20px 28px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            color: #71717a;
            font-size: 11px;
            margin: 0 0 12px 0;
          }
          .footer-links {
            display: flex;
            justify-content: center;
            gap: 16px;
            flex-wrap: wrap;
          }
          .footer-links a {
            color: ${primaryColor};
            text-decoration: none;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              ${logoUrl 
                ? `<img src="${logoUrl}" alt="${company}" />`
                : company.toUpperCase().includes('NICNOA')
                  ? `<div style="display: inline-block; text-align: center;">
                      <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 32px; font-weight: 700; letter-spacing: -0.025em; color: #ffffff;">NICNOA</span><span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 32px; font-weight: 700; letter-spacing: -0.025em; color: ${primaryColor};">&amp;CO.online</span>
                    </div>`
                  : `<span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 28px; font-weight: 700; letter-spacing: -0.025em; color: #ffffff;">${company.toUpperCase()}</span>`
              }
            </div>
            <div class="content">
              <h2>Willkommen bei ${company}!</h2>
              <p>
                Dies ist eine Vorschau-E-Mail, die zeigt, wie Ihre E-Mails mit dem aktuellen Branding aussehen werden.
              </p>
              <p>
                Hallo Max Mustermann,<br><br>
                vielen Dank für Ihre Registrierung. Klicken Sie auf den Button unten, um Ihr Konto zu bestätigen.
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="#" class="button">Konto bestätigen</a>
              </div>
              <p style="font-size: 12px; color: #71717a;">
                Falls Sie diese E-Mail nicht angefordert haben, können Sie sie ignorieren.
              </p>
            </div>
            <div class="footer">
              <p>${footer}</p>
              <div class="footer-links">
                ${footerLinks.map(link => `<a href="${link.href}">${link.label}</a>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Branding
          </h1>
          <p className="text-muted-foreground mt-1">
            Logo, Farben und E-Mail-Branding verwalten
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Speichern
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Linke Seite - Editor */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Plattform-Logo
              </CardTitle>
              <CardDescription>
                Das Logo wird in E-Mails und an anderen Stellen der Plattform verwendet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogoUploader
                type="platform"
                currentLogoUrl={logoUrl}
                onUploadComplete={(url) => setLogoUrl(url)}
                onDeleteComplete={() => setLogoUrl(null)}
                label=""
                description="PNG, JPG, SVG oder WebP (max. 2MB, empfohlen: 400x100px)"
              />
            </CardContent>
          </Card>

          {/* Grundeinstellungen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Grundeinstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Firmenname</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="NICNOA"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Primärfarbe
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={emailPrimaryColor}
                    onChange={(e) => setEmailPrimaryColor(e.target.value)}
                    className="h-10 w-14 rounded cursor-pointer border"
                  />
                  <Input
                    value={emailPrimaryColor}
                    onChange={(e) => setEmailPrimaryColor(e.target.value)}
                    className="w-28 font-mono text-sm"
                    placeholder="#10b981"
                  />
                  <div className="flex gap-1">
                    {['#10b981', '#ec4899', '#3b82f6', '#f59e0b', '#8b5cf6'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setEmailPrimaryColor(color)}
                        className="h-8 w-8 rounded-md border-2 transition-all hover:scale-110"
                        style={{ 
                          backgroundColor: color,
                          borderColor: emailPrimaryColor === color ? '#18181b' : 'transparent'
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* E-Mail Einstellungen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                E-Mail Branding
              </CardTitle>
              <CardDescription>
                Diese Einstellungen werden für alle E-Mails verwendet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailFromName">Absendername</Label>
                  <Input
                    id="emailFromName"
                    value={emailFromName}
                    onChange={(e) => setEmailFromName(e.target.value)}
                    placeholder="NICNOA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailReplyTo">Antwort-Adresse</Label>
                  <Input
                    id="emailReplyTo"
                    type="email"
                    value={emailReplyTo}
                    onChange={(e) => setEmailReplyTo(e.target.value)}
                    placeholder="support@nicnoa.online"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailFooterText">Footer-Text</Label>
                <Textarea
                  id="emailFooterText"
                  value={emailFooterText}
                  onChange={(e) => setEmailFooterText(e.target.value)}
                  placeholder="© 2025 NICNOA. Alle Rechte vorbehalten."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Footer-Links Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Footer-Links
              </CardTitle>
              <CardDescription>
                Diese Links werden automatisch im Footer jeder E-Mail angezeigt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {footerLinks.map((link) => (
                  <div
                    key={link.href}
                    className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg"
                  >
                    <span className="text-sm font-medium">{link.label}</span>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Basis-URL: {BASE_URL}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rechte Seite - Preview */}
        <div className="lg:sticky lg:top-6 space-y-4">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  E-Mail Vorschau
                </CardTitle>
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-2 rounded ${previewDevice === 'desktop' ? 'bg-background shadow' : ''}`}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-2 rounded ${previewDevice === 'mobile' ? 'bg-background shadow' : ''}`}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 bg-muted/30">
              <div className="flex justify-center">
                <motion.div
                  key={previewDevice}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                  style={{ width: previewDevice === 'desktop' ? 560 : 375 }}
                >
                  <iframe
                    srcDoc={generatePreviewHtml()}
                    className="w-full border-0"
                    style={{ height: previewDevice === 'desktop' ? 580 : 650 }}
                    title="E-Mail Preview"
                  />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Hilfsfunktion: Farbe abdunkeln/aufhellen
function adjustColor(hex: string, percent: number): string {
  hex = hex.replace('#', '')
  
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)

  r = Math.min(255, Math.max(0, r + (r * percent) / 100))
  g = Math.min(255, Math.max(0, g + (g * percent) / 100))
  b = Math.min(255, Math.max(0, b + (b * percent) / 100))

  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}

