'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Rocket,
  Heart,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { JobApplicationForm } from '@/components/career/job-application-form'

interface Job {
  id: string
  title: string
  slug: string
  category: string
  location: string
  type: string
  description: string
  requirements: string
  benefits: string | null
}

export default function JobDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showApplicationForm, setShowApplicationForm] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchJob()
    }
  }, [slug])

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/jobs/${slug}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setJob(data)
    } catch (error) {
      console.error('Error fetching job:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center h-96">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Job nicht gefunden</h1>
          <Button asChild>
            <Link href="/karriere">Zurück zu allen Jobs</Link>
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 pt-32 pb-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Button variant="ghost" asChild className="mb-6">
              <Link href="/karriere">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zu allen Jobs
              </Link>
            </Button>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary" className="text-sm">
                {job.category}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <MapPin className="h-3 w-3 mr-1" />
                {job.location}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Clock className="h-3 w-3 mr-1" />
                {job.type}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {job.title}
            </h1>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>München, Remote-First</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Coole Kultur</span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                <span>Wachsendes Startup</span>
              </div>
            </div>

            <Button size="lg" onClick={() => setShowApplicationForm(true)}>
              Jetzt bewerben
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold mb-4">Über die Position</h2>
                <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground">
                  {job.description.split('\n').map((line, idx) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <h3 key={idx} className="text-xl font-semibold mt-6 mb-3 text-foreground">
                          {line.replace(/\*\*/g, '')}
                        </h3>
                      )
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <li key={idx} className="ml-4 mb-2">
                          {line.substring(2)}
                        </li>
                      )
                    }
                    if (line.trim() === '') {
                      return <br key={idx} />
                    }
                    return (
                      <p key={idx} className="mb-4">
                        {line}
                      </p>
                    )
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold mb-4">Anforderungen</h2>
                <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2">
                    {job.requirements.split('\n').map((line, idx) => {
                      if (line.startsWith('- ')) {
                        return (
                          <li key={idx} className="ml-4">
                            {line.substring(2)}
                          </li>
                        )
                      }
                      if (line.trim() && !line.startsWith('- ')) {
                        return (
                          <p key={idx} className="mb-2">
                            {line}
                          </p>
                        )
                      }
                      return null
                    })}
                  </ul>
                </div>
              </motion.div>

              {job.benefits && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold mb-4">Benefits</h2>
                  <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground">
                    <ul className="list-disc list-inside space-y-2">
                      {job.benefits.split('\n').map((line, idx) => {
                        if (line.startsWith('- ')) {
                          return (
                            <li key={idx} className="ml-4">
                              {line.substring(2)}
                            </li>
                          )
                        }
                        if (line.trim() && !line.startsWith('- ')) {
                          return (
                            <p key={idx} className="mb-2">
                              {line}
                            </p>
                          )
                        }
                        return null
                      })}
                    </ul>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Quick Facts</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{job.category}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Interessiert?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Wir freuen uns auf deine Bewerbung!
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => setShowApplicationForm(true)}
                    >
                      Jetzt bewerben
                      <Sparkles className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <JobApplicationForm
          jobId={job.id}
          jobTitle={job.title}
          onClose={() => setShowApplicationForm(false)}
        />
      )}

      <Footer />
    </div>
  )
}

