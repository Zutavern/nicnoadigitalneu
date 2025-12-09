'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2,
  Save,
  Eye,
  Upload,
  X,
  Users,
  Lightbulb,
  Target,
  ArrowRight,
  Linkedin,
  ShieldCheck,
  Scaling,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'

interface AboutUsPageConfig {
  id?: string
  heroBadgeText: string
  heroTitle: string
  heroDescription: string
  team1Name: string
  team1Role: string
  team1Description: string
  team1ImageUrl: string | null
  team1LinkedInUrl: string
  team2Name: string
  team2Role: string
  team2Description: string
  team2ImageUrl: string | null
  team2LinkedInUrl: string
  visionBadgeText: string
  visionTitle: string
  visionDescription: string
  missionBadgeText: string
  missionTitle: string
  missionDescription: string
  approachTitle: string
  approachDescription: string
  approach1Title: string
  approach1Description: string
  approach2Title: string
  approach2Description: string
  approach3Title: string
  approach3Description: string
  approach4Title: string
  approach4Description: string
  whyTitle: string
  whyDescription: string
  whyButtonText: string
  whyButtonLink: string
}

const approachIcons = [Target, ShieldCheck, Scaling, Sparkles]

export default function AboutUsAdminPage() {
  const [pageConfig, setPageConfig] = useState<AboutUsPageConfig>({
    heroBadgeText: '',
    heroTitle: '',
    heroDescription: '',
    team1Name: '',
    team1Role: '',
    team1Description: '',
    team1ImageUrl: null,
    team1LinkedInUrl: '',
    team2Name: '',
    team2Role: '',
    team2Description: '',
    team2ImageUrl: null,
    team2LinkedInUrl: '',
    visionBadgeText: '',
    visionTitle: '',
    visionDescription: '',
    missionBadgeText: '',
    missionTitle: '',
    missionDescription: '',
    approachTitle: '',
    approachDescription: '',
    approach1Title: '',
    approach1Description: '',
    approach2Title: '',
    approach2Description: '',
    approach3Title: '',
    approach3Description: '',
    approach4Title: '',
    approach4Description: '',
    whyTitle: '',
    whyDescription: '',
    whyButtonText: 'Jetzt durchstarten',
    whyButtonLink: '/registrieren',
  })
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [uploadingImage1, setUploadingImage1] = useState(false)
  const [uploadingImage2, setUploadingImage2] = useState(false)

  useEffect(() => {
    fetchPageConfig()
  }, [])

  const fetchPageConfig = async () => {
    try {
      setIsLoadingConfig(true)
      const res = await fetch('/api/admin/about-us-page-config')
      if (res.ok) {
        const data = await res.json()
        setPageConfig(data)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
      toast.error('Fehler beim Laden der Konfiguration')
    } finally {
      setIsLoadingConfig(false)
    }
  }

  const handleSavePageConfig = async () => {
    try {
      setIsSavingConfig(true)
      const res = await fetch('/api/admin/about-us-page-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageConfig),
      })

      if (res.ok) {
        toast.success('Konfiguration erfolgreich gespeichert')
        await fetchPageConfig()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Fehler beim Speichern der Konfiguration')
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleImageUpload = async (file: File, teamNumber: 1 | 2) => {
    const setUploading = teamNumber === 1 ? setUploadingImage1 : setUploadingImage2
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/about-us-page-config/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const { url } = await res.json()
        if (teamNumber === 1) {
          setPageConfig((prev) => ({ ...prev, team1ImageUrl: url }))
        } else {
          setPageConfig((prev) => ({ ...prev, team2ImageUrl: url }))
        }
        toast.success('Bild erfolgreich hochgeladen')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Fehler beim Hochladen')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Fehler beim Hochladen des Bildes')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (teamNumber: 1 | 2) => {
    if (teamNumber === 1) {
      setPageConfig((prev) => ({ ...prev, team1ImageUrl: null }))
    } else {
      setPageConfig((prev) => ({ ...prev, team2ImageUrl: null }))
    }
  }

  const approaches = [
    {
      icon: approachIcons[0],
      title: pageConfig.approach1Title,
      description: pageConfig.approach1Description,
    },
    {
      icon: approachIcons[1],
      title: pageConfig.approach2Title,
      description: pageConfig.approach2Description,
    },
    {
      icon: approachIcons[2],
      title: pageConfig.approach3Title,
      description: pageConfig.approach3Description,
    },
    {
      icon: approachIcons[3],
      title: pageConfig.approach4Title,
      description: pageConfig.approach4Description,
    },
  ].filter((a) => a.title && a.description)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Über uns - Seiten-Konfiguration</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie alle Inhalte der Über-uns-Seite
          </p>
        </div>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList>
          <TabsTrigger value="config">Konfiguration</TabsTrigger>
          <TabsTrigger value="preview">Vorschau</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero-Bereich</CardTitle>
              <CardDescription>Hauptbereich am Anfang der Seite</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroBadgeText">Badge-Text</Label>
                <Input
                  id="heroBadgeText"
                  value={pageConfig.heroBadgeText}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, heroBadgeText: e.target.value }))
                  }
                  placeholder="z.B. Das Team hinter NICNOA&CO.online"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroTitle">Titel</Label>
                <Input
                  id="heroTitle"
                  value={pageConfig.heroTitle}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, heroTitle: e.target.value }))
                  }
                  placeholder="z.B. Experten für moderne Salon-Spaces"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroDescription">Beschreibung</Label>
                <Textarea
                  id="heroDescription"
                  value={pageConfig.heroDescription}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, heroDescription: e.target.value }))
                  }
                  placeholder="Beschreibung des Teams..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Team Member 1 */}
          <Card>
            <CardHeader>
              <CardTitle>Team-Mitglied 1</CardTitle>
              <CardDescription>Erstes Team-Mitglied (z.B. Daniel)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team1Name">Name</Label>
                <Input
                  id="team1Name"
                  value={pageConfig.team1Name}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, team1Name: e.target.value }))
                  }
                  placeholder="z.B. Daniel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team1Role">Rolle</Label>
                <Input
                  id="team1Role"
                  value={pageConfig.team1Role}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, team1Role: e.target.value }))
                  }
                  placeholder="z.B. Co-Founder"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team1Description">Beschreibung</Label>
                <Textarea
                  id="team1Description"
                  value={pageConfig.team1Description}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, team1Description: e.target.value }))
                  }
                  placeholder="Beschreibung des Team-Mitglieds..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team1LinkedInUrl">LinkedIn URL</Label>
                <Input
                  id="team1LinkedInUrl"
                  value={pageConfig.team1LinkedInUrl}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, team1LinkedInUrl: e.target.value }))
                  }
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Bild</Label>
                {pageConfig.team1ImageUrl ? (
                  <div className="relative">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <Image
                        src={pageConfig.team1ImageUrl}
                        alt={pageConfig.team1Name || 'Team Member 1'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleRemoveImage(1)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Bild entfernen
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 1)
                      }}
                      className="hidden"
                      id="team1ImageUpload"
                      disabled={uploadingImage1}
                    />
                    <label
                      htmlFor="team1ImageUpload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      {uploadingImage1 ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {uploadingImage1 ? 'Wird hochgeladen...' : 'Bild hochladen (JPG, PNG, WebP)'}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Member 2 */}
          <Card>
            <CardHeader>
              <CardTitle>Team-Mitglied 2</CardTitle>
              <CardDescription>Zweites Team-Mitglied (z.B. Nico)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team2Name">Name</Label>
                <Input
                  id="team2Name"
                  value={pageConfig.team2Name}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, team2Name: e.target.value }))
                  }
                  placeholder="z.B. Nico"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team2Role">Rolle</Label>
                <Input
                  id="team2Role"
                  value={pageConfig.team2Role}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, team2Role: e.target.value }))
                  }
                  placeholder="z.B. Co-Founder"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team2Description">Beschreibung</Label>
                <Textarea
                  id="team2Description"
                  value={pageConfig.team2Description}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, team2Description: e.target.value }))
                  }
                  placeholder="Beschreibung des Team-Mitglieds..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team2LinkedInUrl">LinkedIn URL</Label>
                <Input
                  id="team2LinkedInUrl"
                  value={pageConfig.team2LinkedInUrl}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, team2LinkedInUrl: e.target.value }))
                  }
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Bild</Label>
                {pageConfig.team2ImageUrl ? (
                  <div className="relative">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <Image
                        src={pageConfig.team2ImageUrl}
                        alt={pageConfig.team2Name || 'Team Member 2'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleRemoveImage(2)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Bild entfernen
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 2)
                      }}
                      className="hidden"
                      id="team2ImageUpload"
                      disabled={uploadingImage2}
                    />
                    <label
                      htmlFor="team2ImageUpload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      {uploadingImage2 ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {uploadingImage2 ? 'Wird hochgeladen...' : 'Bild hochladen (JPG, PNG, WebP)'}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vision & Mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visionBadgeText">Badge-Text</Label>
                  <Input
                    id="visionBadgeText"
                    value={pageConfig.visionBadgeText}
                    onChange={(e) =>
                      setPageConfig((prev) => ({ ...prev, visionBadgeText: e.target.value }))
                    }
                    placeholder="z.B. Unsere Vision"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visionTitle">Titel</Label>
                  <Input
                    id="visionTitle"
                    value={pageConfig.visionTitle}
                    onChange={(e) =>
                      setPageConfig((prev) => ({ ...prev, visionTitle: e.target.value }))
                    }
                    placeholder="z.B. Die Zukunft der Salon-Branche gestalten"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visionDescription">Beschreibung</Label>
                  <Textarea
                    id="visionDescription"
                    value={pageConfig.visionDescription}
                    onChange={(e) =>
                      setPageConfig((prev) => ({ ...prev, visionDescription: e.target.value }))
                    }
                    placeholder="Beschreibung der Vision..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="missionBadgeText">Badge-Text</Label>
                  <Input
                    id="missionBadgeText"
                    value={pageConfig.missionBadgeText}
                    onChange={(e) =>
                      setPageConfig((prev) => ({ ...prev, missionBadgeText: e.target.value }))
                    }
                    placeholder="z.B. Unsere Mission"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="missionTitle">Titel</Label>
                  <Input
                    id="missionTitle"
                    value={pageConfig.missionTitle}
                    onChange={(e) =>
                      setPageConfig((prev) => ({ ...prev, missionTitle: e.target.value }))
                    }
                    placeholder="z.B. Innovativ & Effizient"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="missionDescription">Beschreibung</Label>
                  <Textarea
                    id="missionDescription"
                    value={pageConfig.missionDescription}
                    onChange={(e) =>
                      setPageConfig((prev) => ({ ...prev, missionDescription: e.target.value }))
                    }
                    placeholder="Beschreibung der Mission..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Approach Section */}
          <Card>
            <CardHeader>
              <CardTitle>Ansatz-Bereich</CardTitle>
              <CardDescription>Vier Ansätze/Features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="approachTitle">Titel</Label>
                <Input
                  id="approachTitle"
                  value={pageConfig.approachTitle}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, approachTitle: e.target.value }))
                  }
                  placeholder="z.B. Unser Ansatz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approachDescription">Beschreibung</Label>
                <Textarea
                  id="approachDescription"
                  value={pageConfig.approachDescription}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, approachDescription: e.target.value }))
                  }
                  placeholder="z.B. Wie wir arbeiten und was uns auszeichnet"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="space-y-2 p-4 border rounded-lg">
                    <Label>Ansatz {num}</Label>
                    <Input
                      value={pageConfig[`approach${num}Title` as keyof AboutUsPageConfig] as string}
                      onChange={(e) =>
                        setPageConfig((prev) => ({
                          ...prev,
                          [`approach${num}Title`]: e.target.value,
                        }))
                      }
                      placeholder={`Titel ${num}`}
                    />
                    <Textarea
                      value={
                        pageConfig[`approach${num}Description` as keyof AboutUsPageConfig] as string
                      }
                      onChange={(e) =>
                        setPageConfig((prev) => ({
                          ...prev,
                          [`approach${num}Description`]: e.target.value,
                        }))
                      }
                      placeholder={`Beschreibung ${num}`}
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Why Section */}
          <Card>
            <CardHeader>
              <CardTitle>Warum-Bereich</CardTitle>
              <CardDescription>Abschlussbereich mit CTA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whyTitle">Titel</Label>
                <Input
                  id="whyTitle"
                  value={pageConfig.whyTitle}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, whyTitle: e.target.value }))
                  }
                  placeholder="z.B. Warum wir tun, was wir tun"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whyDescription">Beschreibung</Label>
                <Textarea
                  id="whyDescription"
                  value={pageConfig.whyDescription}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, whyDescription: e.target.value }))
                  }
                  placeholder="Beschreibung..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whyButtonText">Button-Text</Label>
                  <Input
                    id="whyButtonText"
                    value={pageConfig.whyButtonText}
                    onChange={(e) =>
                      setPageConfig((prev) => ({ ...prev, whyButtonText: e.target.value }))
                    }
                    placeholder="z.B. Jetzt durchstarten"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whyButtonLink">Button-Link</Label>
                  <Input
                    id="whyButtonLink"
                    value={pageConfig.whyButtonLink}
                    onChange={(e) =>
                      setPageConfig((prev) => ({ ...prev, whyButtonLink: e.target.value }))
                    }
                    placeholder="z.B. /registrieren"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSavePageConfig} disabled={isSavingConfig}>
              {isSavingConfig ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Konfiguration speichern
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live-Vorschau</CardTitle>
              <CardDescription>
                So wird die Über-uns-Seite für Besucher angezeigt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-background max-h-[800px] overflow-y-auto">
                {/* Hero Section */}
                <section className="relative pt-20">
                  <div className="container py-16">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-center"
                    >
                      {pageConfig.heroBadgeText && (
                        <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm">
                          <Users className="mr-1 h-3.5 w-3.5 text-primary" />
                          <span className="text-muted-foreground">{pageConfig.heroBadgeText}</span>
                        </span>
                      )}
                      <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                        {pageConfig.heroTitle}
                      </h1>
                      {pageConfig.heroDescription && (
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                          {pageConfig.heroDescription}
                        </p>
                      )}
                    </motion.div>
                  </div>
                </section>

                {/* Team Section */}
                <section className="container py-16">
                  <div className="grid gap-16 md:grid-cols-2">
                    {/* Team Member 1 */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                        {pageConfig.team1ImageUrl ? (
                          <Image
                            src={pageConfig.team1ImageUrl}
                            alt={pageConfig.team1Name || 'Team Member 1'}
                            width={400}
                            height={300}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Users className="h-16 w-16 text-primary/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      </div>
                      <div className="flex flex-col flex-1 mt-6">
                        {pageConfig.team1Name && (
                          <h2 className="text-2xl font-bold">{pageConfig.team1Name}</h2>
                        )}
                        {pageConfig.team1Role && (
                          <span className="text-primary font-medium">{pageConfig.team1Role}</span>
                        )}
                        {pageConfig.team1Description && (
                          <p className="mt-2 text-muted-foreground min-h-[100px]">
                            {pageConfig.team1Description}
                          </p>
                        )}
                        {pageConfig.team1LinkedInUrl && (
                          <Button variant="ghost" size="sm" className="self-start mt-auto" asChild>
                            <a href={pageConfig.team1LinkedInUrl} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="mr-2 h-4 w-4" />
                              {pageConfig.team1Name} auf LinkedIn
                            </a>
                          </Button>
                        )}
                      </div>
                    </motion.div>

                    {/* Team Member 2 */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                        {pageConfig.team2ImageUrl ? (
                          <Image
                            src={pageConfig.team2ImageUrl}
                            alt={pageConfig.team2Name || 'Team Member 2'}
                            width={400}
                            height={300}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Users className="h-16 w-16 text-primary/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      </div>
                      <div className="flex flex-col flex-1 mt-6">
                        {pageConfig.team2Name && (
                          <h2 className="text-2xl font-bold">{pageConfig.team2Name}</h2>
                        )}
                        {pageConfig.team2Role && (
                          <span className="text-primary font-medium">{pageConfig.team2Role}</span>
                        )}
                        {pageConfig.team2Description && (
                          <p className="mt-2 text-muted-foreground min-h-[100px]">
                            {pageConfig.team2Description}
                          </p>
                        )}
                        {pageConfig.team2LinkedInUrl && (
                          <Button variant="ghost" size="sm" className="self-start mt-auto" asChild>
                            <a href={pageConfig.team2LinkedInUrl} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="mr-2 h-4 w-4" />
                              {pageConfig.team2Name} auf LinkedIn
                            </a>
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </section>

                {/* Vision & Mission */}
                <section className="border-t bg-muted/50">
                  <div className="container py-16">
                    <div className="grid gap-16 md:grid-cols-2">
                      {/* Vision */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                      >
                        {pageConfig.visionBadgeText && (
                          <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1">
                            <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{pageConfig.visionBadgeText}</span>
                          </div>
                        )}
                        {pageConfig.visionTitle && (
                          <h2 className="text-3xl font-bold">{pageConfig.visionTitle}</h2>
                        )}
                        {pageConfig.visionDescription && (
                          <p className="text-muted-foreground">{pageConfig.visionDescription}</p>
                        )}
                      </motion.div>

                      {/* Mission */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-4"
                      >
                        {pageConfig.missionBadgeText && (
                          <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1">
                            <Target className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{pageConfig.missionBadgeText}</span>
                          </div>
                        )}
                        {pageConfig.missionTitle && (
                          <h2 className="text-3xl font-bold">{pageConfig.missionTitle}</h2>
                        )}
                        {pageConfig.missionDescription && (
                          <p className="text-muted-foreground">{pageConfig.missionDescription}</p>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </section>

                {/* Approach Section */}
                {pageConfig.approachTitle && (
                  <section className="container py-16">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-center mb-12"
                    >
                      <h2 className="text-3xl font-bold">{pageConfig.approachTitle}</h2>
                      {pageConfig.approachDescription && (
                        <p className="mt-4 text-muted-foreground">{pageConfig.approachDescription}</p>
                      )}
                    </motion.div>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                      {approaches.map((approach, index) => {
                        const Icon = approach.icon
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div className="rounded-lg bg-primary/10 p-2.5 flex-shrink-0">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-lg font-semibold leading-tight">{approach.title}</h3>
                                <p className="text-sm text-muted-foreground">{approach.description}</p>
                              </div>
                            </div>
                            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
                          </motion.div>
                        )
                      })}
                    </div>
                  </section>
                )}

                {/* Why Section */}
                <section className="border-t bg-muted/50">
                  <div className="container py-16">
                    <div className="mx-auto max-w-3xl text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {pageConfig.whyTitle && (
                          <h2 className="text-3xl font-bold mb-4">{pageConfig.whyTitle}</h2>
                        )}
                        {pageConfig.whyDescription && (
                          <p className="text-muted-foreground mb-8">{pageConfig.whyDescription}</p>
                        )}
                        {pageConfig.whyButtonText && (
                          <Button size="lg" className="group" asChild>
                            <Link href={pageConfig.whyButtonLink || '/registrieren'}>
                              {pageConfig.whyButtonText}
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </Button>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

