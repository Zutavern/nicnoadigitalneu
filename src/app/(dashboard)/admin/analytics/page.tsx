'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  ExternalLink,
  Settings,
  AlertTriangle,
  Users,
  Eye,
  UserPlus,
  LogIn,
  Activity,
  Video,
  Flame,
  Target,
  Route,
  Share2,
  Radio,
  RefreshCw,
  Loader2,
  DollarSign,
  TrendingUp,
  MousePointer,
  Clock,
  Percent,
  ArrowUpRight,
  LayoutDashboard,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

// ============== TYPES ==============

interface PostHogConfig {
  enabled: boolean
  apiKey: string
  host: string
  projectId?: string
}

interface QuickStats {
  pageviews: number
  uniqueUsers: number
  signups: number
  logins: number
  avgSessionDuration: number
  bounceRate: number
}

// ============== COMPONENT ==============

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [config, setConfig] = useState<PostHogConfig | null>(null)
  const [stats, setStats] = useState<QuickStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch PostHog config and quick stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch config
        const configRes = await fetch('/api/platform/posthog-config')
        const configData = await configRes.json()
        setConfig(configData)

        if (configData.enabled && configData.apiKey) {
          // Fetch quick stats from PostHog
          const statsRes = await fetch('/api/admin/analytics/posthog?type=overview&dateFrom=-7d')
          const statsData = await statsRes.json()
          if (statsData.configured && statsData.data) {
            setStats(statsData.data)
          }
        }
      } catch (err) {
        console.error('Error fetching analytics data:', err)
        setError('Fehler beim Laden der Analytics-Daten')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Build PostHog URLs
  const posthogHost = config?.host || 'https://eu.posthog.com'
  const baseUrl = posthogHost.replace('.i.posthog.com', '.posthog.com')
  
  const dashboardLinks = [
    {
      title: 'Dashboard',
      description: 'Übersicht aller wichtigen Metriken',
      icon: LayoutDashboard,
      href: `${baseUrl}/home`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Events',
      description: 'Alle getrackte Events in Echtzeit',
      icon: Zap,
      href: `${baseUrl}/events`,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Insights',
      description: 'Trends, Funnels & Retention analysieren',
      icon: TrendingUp,
      href: `${baseUrl}/insights`,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Session Recordings',
      description: 'Nutzer-Sessions ansehen & analysieren',
      icon: Video,
      href: `${baseUrl}/replay/recent`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Heatmaps',
      description: 'Klick-Heatmaps & Scroll-Analyse',
      icon: Flame,
      href: `${baseUrl}/heatmaps`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'User Paths',
      description: 'Wie navigieren Nutzer durch die App?',
      icon: Route,
      href: `${baseUrl}/web-analytics`,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Cohorts',
      description: 'Nutzer-Gruppen erstellen & analysieren',
      icon: Users,
      href: `${baseUrl}/cohorts`,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      title: 'Feature Flags',
      description: 'A/B Tests & Feature Rollouts',
      icon: Sparkles,
      href: `${baseUrl}/feature_flags`,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
  ]

  // Not configured state
  if (!isLoading && (!config?.enabled || !config?.apiKey)) {
    return (
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-amber-500/30 bg-amber-500/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-amber-500/20">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <CardTitle>PostHog nicht konfiguriert</CardTitle>
                  <CardDescription>
                    Bitte konfiguriere PostHog in den Plattform-Einstellungen, um Analytics zu aktivieren.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Link href="/admin/settings">
                  <Button>
                    <Settings className="mr-2 h-4 w-4" />
                    Zu den Einstellungen
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://posthog.com/signup', '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  PostHog Account erstellen
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Setup Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>PostHog Einrichten</CardTitle>
              <CardDescription>So aktivierst du Analytics für deine Plattform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>1</Badge>
                    <span className="font-medium">Account erstellen</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Erstelle einen kostenlosen PostHog Account unter posthog.com
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>2</Badge>
                    <span className="font-medium">API Key kopieren</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Kopiere den Project API Key aus den Projekteinstellungen
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>3</Badge>
                    <span className="font-medium">Einstellungen</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Trage den API Key in den Plattform-Einstellungen ein
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <BarChart3 className="h-4 w-4" />
            Powered by PostHog
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => window.open(`${baseUrl}/home`, '_blank')}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            PostHog Dashboard öffnen
          </Button>
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-red-500/30 bg-red-500/10">
            <CardContent className="pt-6">
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Schnellübersicht (7 Tage)</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`${baseUrl}/web-analytics`, '_blank')}
                className="gap-2"
              >
                Details in PostHog
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : stats ? (
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Eye className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{stats.pageviews.toLocaleString('de-DE')}</div>
                  <div className="text-xs text-muted-foreground">Pageviews</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Users className="h-5 w-5 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{stats.uniqueUsers.toLocaleString('de-DE')}</div>
                  <div className="text-xs text-muted-foreground">Unique Users</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <UserPlus className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">{stats.signups.toLocaleString('de-DE')}</div>
                  <div className="text-xs text-muted-foreground">Signups</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <LogIn className="h-5 w-5 mx-auto mb-2 text-cyan-500" />
                  <div className="text-2xl font-bold">{stats.logins.toLocaleString('de-DE')}</div>
                  <div className="text-xs text-muted-foreground">Logins</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold">
                    {stats.avgSessionDuration ? `${Math.round(stats.avgSessionDuration / 60)}min` : '-'}
                  </div>
                  <div className="text-xs text-muted-foreground">Ø Session</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Percent className="h-5 w-5 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold">{stats.bounceRate || 0}%</div>
                  <div className="text-xs text-muted-foreground">Bounce Rate</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Noch keine Daten verfügbar. Events werden automatisch erfasst, sobald Nutzer die Seite besuchen.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dashboard Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>PostHog Tools</CardTitle>
            <CardDescription>
              Direkte Links zu den wichtigsten Analytics-Funktionen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {dashboardLinks.map((link, index) => (
                <motion.a
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="group p-4 rounded-lg border bg-card hover:border-primary/50 hover:bg-muted/50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${link.bgColor}`}>
                      <link.icon className={`h-5 w-5 ${link.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{link.title}</h3>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tracked Events Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Getrackte Events</CardTitle>
            <CardDescription>
              Diese Events werden automatisch zu PostHog gepusht
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Auth Events */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <LogIn className="h-4 w-4 text-blue-500" />
                  Authentication
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><code className="text-xs bg-muted px-1 rounded">signup_started</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">signup_completed</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">login_started</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">login_completed</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">2fa_challenge_shown</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">magic_link_requested</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">password_reset_*</code></li>
                </ul>
              </div>

              {/* Page Events */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-green-500" />
                  Page Views
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><code className="text-xs bg-muted px-1 rounded">$pageview</code> (automatisch)</li>
                  <li><code className="text-xs bg-muted px-1 rounded">homepage_viewed</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">blog_article_viewed</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">pricing_viewed</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">features_viewed</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">job_viewed</code></li>
                </ul>
              </div>

              {/* CTA Events */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <MousePointer className="h-4 w-4 text-purple-500" />
                  Interactions
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><code className="text-xs bg-muted px-1 rounded">$autocapture</code> (Klicks)</li>
                  <li><code className="text-xs bg-muted px-1 rounded">cta_clicked</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">demo_requested</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">trial_started</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">newsletter_subscribed</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">contact_form_submitted</code></li>
                </ul>
              </div>

              {/* Subscription Events */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <DollarSign className="h-4 w-4 text-yellow-500" />
                  Subscriptions
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><code className="text-xs bg-muted px-1 rounded">subscription_created</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">subscription_upgraded</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">subscription_cancelled</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">payment_succeeded</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">payment_failed</code></li>
                </ul>
              </div>

              {/* Business Events */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-orange-500" />
                  Business
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><code className="text-xs bg-muted px-1 rounded">salon_created</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">booking_created</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">booking_completed</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">stylist_invited</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">onboarding_completed</code></li>
                </ul>
              </div>

              {/* Error Events */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Errors
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><code className="text-xs bg-muted px-1 rounded">$exception</code> (automatisch)</li>
                  <li><code className="text-xs bg-muted px-1 rounded">page_not_found</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">api_error</code></li>
                  <li><code className="text-xs bg-muted px-1 rounded">client_error</code></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              PostHog Pro-Tipps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Insights erstellen</h4>
                <p className="text-sm text-muted-foreground">
                  Erstelle in PostHog eigene Dashboards mit den Events, die für dich wichtig sind. 
                  Kombiniere Trends, Funnels und Retention für eine vollständige Analyse.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Session Recordings nutzen</h4>
                <p className="text-sm text-muted-foreground">
                  Schau dir echte Nutzer-Sessions an, um UX-Probleme zu finden. 
                  Filtere nach Events wie &quot;api_error&quot; um problematische Sessions zu identifizieren.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Feature Flags für A/B Tests</h4>
                <p className="text-sm text-muted-foreground">
                  Nutze PostHog Feature Flags, um neue Features zu testen, bevor du sie für alle ausrollst.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Cohorts für Targeting</h4>
                <p className="text-sm text-muted-foreground">
                  Erstelle Cohorts für verschiedene Nutzergruppen (z.B. &quot;Power User&quot;, &quot;Churning&quot;) 
                  und analysiere deren Verhalten separat.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
