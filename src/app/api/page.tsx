'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Button } from '@/components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { 
  Code2,
  Key,
  Lock,
  Server,
  Webhook,
  Database,
  Users,
  Calendar,
  ArrowRight,
  Copy,
  CheckCheck
} from 'lucide-react'
import { useState } from 'react'
import { Endpoint, EndpointCategory } from './types'

const endpoints: EndpointCategory[] = [
  {
    category: 'Authentifizierung',
    icon: Lock,
    items: [
      {
        name: 'Token generieren',
        method: 'POST',
        path: '/api/v1/auth/token',
        description: 'Generiert einen API-Token für die Authentifizierung',
        request: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            client_id: 'IHR_CLIENT_ID',
            client_secret: 'IHR_CLIENT_SECRET'
          }
        },
        response: {
          access_token: 'eyJhbGciOiJIUzI1NiIs...',
          token_type: 'Bearer',
          expires_in: 3600
        }
      }
    ]
  },
  {
    category: 'Salon Management',
    icon: Users,
    items: [
      {
        name: 'Salon Details abrufen',
        method: 'GET',
        path: '/api/v1/salons/{salon_id}',
        description: 'Ruft detaillierte Informationen zu einem Salon ab',
        request: {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer {IHR_TOKEN}'
          }
        },
        response: {
          id: '123',
          name: 'Beauty Salon Example',
          address: {
            street: 'Musterstraße 1',
            city: 'München',
            zip: '80331'
          },
          contact: {
            email: 'kontakt@example.com',
            phone: '+49 89 123456'
          },
          services: ['Haircut', 'Coloring', 'Styling']
        }
      }
    ]
  },
  {
    category: 'Terminbuchung',
    icon: Calendar,
    items: [
      {
        name: 'Verfügbare Termine',
        method: 'GET',
        path: '/api/v1/appointments/available',
        description: 'Listet alle verfügbaren Termine für einen bestimmten Zeitraum',
        request: {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer {IHR_TOKEN}'
          },
          query: {
            salon_id: '123',
            start_date: '2024-03-01',
            end_date: '2024-03-31'
          }
        },
        response: {
          dates: [
            {
              date: '2024-03-01',
              slots: [
                {
                  time: '09:00',
                  duration: 60,
                  service_id: '456'
                }
              ]
            }
          ]
        }
      }
    ]
  }
]

export default function ApiPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)

  const copyToClipboard = (text: string, categoryName: string, endpointName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(`${categoryName}-${endpointName}`)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  return (
    <main className="min-h-screen bg-background">
      <MainNav />
      
      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="container py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm mb-6">
              <Code2 className="mr-1 h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">API Dokumentation</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Integrieren Sie unsere <br />
              <span className="text-primary">API-Lösungen</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Unsere RESTful API ermöglicht es Ihnen, die Funktionen unserer Plattform 
              nahtlos in Ihre eigenen Anwendungen zu integrieren.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Server,
              title: 'RESTful API',
              description: 'Moderne REST-Architektur für einfache Integration'
            },
            {
              icon: Key,
              title: 'Sichere Auth',
              description: 'OAuth 2.0 und API-Key Authentifizierung'
            },
            {
              icon: Webhook,
              title: 'Webhooks',
              description: 'Echtzeit-Updates durch Webhook-Integration'
            },
            {
              icon: Database,
              title: 'JSON Format',
              description: 'Standardisierte JSON-Responses'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-xl border bg-card p-6 shadow-lg"
            >
              <div className="flex flex-col items-start">
                <div className="rounded-lg bg-primary/10 p-3 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* API Documentation */}
      <section className="border-t bg-muted/30">
        <div className="container py-16">
          <div className="mx-auto max-w-5xl">
            {/* Authentication Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Erste Schritte
              </h2>
              <p className="text-muted-foreground mb-6">
                Um unsere API nutzen zu können, benötigen Sie einen API-Schlüssel. 
                Diesen können Sie in Ihrem Dashboard generieren.
              </p>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium mb-2">Beispiel-Request mit Authentication</p>
                <pre className="bg-muted rounded-md p-4 overflow-x-auto">
                  <code className="text-sm">
                    {`curl -X GET \\
  'https://api.nicnoa.de/v1/salons' \\
  -H 'Authorization: Bearer IHR_API_TOKEN'`}
                  </code>
                </pre>
              </div>
            </motion.div>

            {/* Endpoints */}
            <div className="space-y-12">
              {endpoints.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {category.category}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {category.items.map((endpoint, endpointIndex) => (
                      <div
                        key={endpointIndex}
                        className="rounded-xl border bg-card overflow-hidden"
                      >
                        <div className="border-b p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{endpoint.name}</h3>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "rounded-full px-2 py-1 text-xs font-medium",
                                endpoint.method === 'GET' 
                                  ? "bg-green-500/10 text-green-500"
                                  : endpoint.method === 'POST'
                                  ? "bg-blue-500/10 text-blue-500"
                                  : "bg-yellow-500/10 text-yellow-500"
                              )}>
                                {endpoint.method}
                              </span>
                              <code className="text-sm bg-muted rounded px-2 py-1">
                                {endpoint.path}
                              </code>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {endpoint.description}
                          </p>
                        </div>

                        <div className="p-4">
                          <Tabs defaultValue="request">
                            <TabsList>
                              <TabsTrigger value="request">Request</TabsTrigger>
                              <TabsTrigger value="response">Response</TabsTrigger>
                            </TabsList>
                            <TabsContent value="request" className="mt-4">
                              <div className="relative">
                                <pre className="bg-muted rounded-md p-4 overflow-x-auto">
                                  <code className="text-sm">
                                    {JSON.stringify(endpoint.request, null, 2)}
                                  </code>
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2"
                                  onClick={() => copyToClipboard(
                                    JSON.stringify(endpoint.request, null, 2),
                                    category.category,
                                    endpoint.name
                                  )}
                                >
                                  {copiedEndpoint === `${category.category}-${endpoint.name}-request` ? (
                                    <CheckCheck className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TabsContent>
                            <TabsContent value="response" className="mt-4">
                              <div className="relative">
                                <pre className="bg-muted rounded-md p-4 overflow-x-auto">
                                  <code className="text-sm">
                                    {JSON.stringify(endpoint.response, null, 2)}
                                  </code>
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2"
                                  onClick={() => copyToClipboard(
                                    JSON.stringify(endpoint.response, null, 2),
                                    category.category,
                                    endpoint.name
                                  )}
                                >
                                  {copiedEndpoint === `${category.category}-${endpoint.name}-response` ? (
                                    <CheckCheck className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t">
        <div className="container py-16">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-4 text-3xl font-bold">
                Bereit zum Integrieren?
              </h2>
              <p className="mb-8 text-muted-foreground">
                Registrieren Sie sich jetzt und erhalten Sie Zugang zu unserer API-Dokumentation 
                und Ihren persönlichen API-Schlüsseln.
              </p>
              <Button size="lg" className="group">
                Jetzt API-Zugang anfordern
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
} 