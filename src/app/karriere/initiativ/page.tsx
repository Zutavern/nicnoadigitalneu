'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  Sparkles,
  Mail,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRef } from 'react'

export default function InitiativbewerbungPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    coverLetter: '',
  })
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.includes('pdf') && !file.type.includes('doc') && !file.type.includes('docx')) {
        toast.error('Bitte lade eine PDF oder Word-Datei hoch')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Datei ist zu groß. Maximal 10MB erlaubt.')
        return
      }
      setCvFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName || !formData.lastName || !formData.email || !cvFile) {
      toast.error('Bitte fülle alle Pflichtfelder aus')
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('jobId', 'initiativ') // Spezieller Wert für Initiativbewerbungen
      formDataToSend.append('firstName', formData.firstName)
      formDataToSend.append('lastName', formData.lastName)
      formDataToSend.append('email', formData.email)
      if (formData.phone) {
        formDataToSend.append('phone', formData.phone)
      }
      if (formData.position) {
        formDataToSend.append('coverLetter', `Position: ${formData.position}\n\n${formData.coverLetter || ''}`)
      } else if (formData.coverLetter) {
        formDataToSend.append('coverLetter', formData.coverLetter)
      }
      formDataToSend.append('cv', cvFile)

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/jobs/apply', {
        method: 'POST',
        body: formDataToSend,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Fehler beim Einreichen der Bewerbung')
      }

      setIsSuccess(true)
      toast.success('Initiativbewerbung erfolgreich eingereicht!')
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Fehler beim Einreichen der Bewerbung'
      )
      setUploadProgress(0)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 pt-32 pb-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button variant="ghost" asChild className="mb-6">
              <Link href="/karriere">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zu allen Jobs
              </Link>
            </Button>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Initiativbewerbung
            </h1>
            <p className="text-xl text-muted-foreground">
              Du siehst keine passende Stelle? Kein Problem! Schick uns einfach deine Initiativbewerbung.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20">
        <div className="container max-w-2xl">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                Initiativbewerbung erfolgreich eingereicht!
              </h2>
              <p className="text-muted-foreground mb-6">
                Wir haben deine Bewerbung erhalten und melden uns bald bei dir.
              </p>
              <Button asChild>
                <Link href="/karriere">Zurück zu allen Jobs</Link>
              </Button>
            </motion.div>
          ) : (
            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        Vorname <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Nachname <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        E-Mail <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Interessierte Position (optional)</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      placeholder="z.B. Frontend Developer, Marketing Manager..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Lebenslauf (CV) <span className="text-destructive">*</span>
                    </Label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/30"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {cvFile ? (
                        <div className="space-y-2">
                          <FileText className="h-8 w-8 mx-auto text-primary" />
                          <p className="font-medium">{cvFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCvFile(null)
                              if (fileInputRef.current) {
                                fileInputRef.current.value = ''
                              }
                            }}
                          >
                            Datei ändern
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="font-medium">CV hochladen</p>
                          <p className="text-sm text-muted-foreground">
                            PDF oder Word-Datei (max. 10MB)
                          </p>
                        </div>
                      )}
                    </div>

                    {isSubmitting && uploadProgress > 0 && (
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Upload läuft...</span>
                          <span className="text-muted-foreground">{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Anschreiben (optional)</Label>
                    <Textarea
                      id="coverLetter"
                      value={formData.coverLetter}
                      onChange={(e) =>
                        setFormData({ ...formData, coverLetter: e.target.value })
                      }
                      placeholder="Erzähl uns, warum du zu NICNOA passt und welche Position dich interessiert..."
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting || !cvFile}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Wird eingereicht...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Initiativbewerbung absenden
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}



