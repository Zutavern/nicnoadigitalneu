'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  Brain,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Users,
  Zap,
  RefreshCw,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Layers,
} from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AnalyticsData {
  period: {
    startDate: string
    endDate: string
    days: number
  }
  summary: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    totalTokens: number
    totalCostUsd: number
    avgResponseTimeMs: number
    successRate: number
    avgCostPerRequest: number
  }
  byModel: Array<{
    model: string
    requests: number
    tokens: number
    costUsd: number
  }>
  byUser: Array<{
    userId: string | null
    userType: string
    requests: number
    tokens: number
    costUsd: number
    user?: {
      name: string | null
      email: string
      role: string
    }
  }>
  byFeature: Array<{
    feature: string | null
    requests: number
    tokens: number
    costUsd: number
    creditsUsed: number
  }>
  byProvider: Array<{
    provider: string
    requests: number
    costUsd: number
    creditsUsed: number
  }>
  dailyUsage: Array<{
    date: string
    requests: number
    tokens: number
    costUsd: number
  }>
  recentLogs: Array<{
    id: string
    userId: string | null
    userType: string
    requestType: string
    model: string
    provider: string
    totalTokens: number
    costUsd: number
    responseTimeMs: number | null
    success: boolean
    errorMessage: string | null
    createdAt: string
  }>
}

export default function AIAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/ai-analytics?days=${period}`)
      if (!res.ok) throw new Error('Fehler beim Laden')
      const json = await res.json()
      setData(json)
    } catch (error) {
      toast.error('Analytics konnten nicht geladen werden')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [period])

  const exportCSV = () => {
    if (!data) return

    const headers = ['Datum', 'Anfragen', 'Tokens', 'Kosten (USD)']
    const rows = data.dailyUsage.map(d => [
      d.date,
      d.requests.toString(),
      d.tokens.toString(),
      d.costUsd.toFixed(4),
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exportiert')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('de-DE').format(value)
  }

  const getFeatureLabel = (feature: string | null) => {
    const labels: Record<string, string> = {
      social_post: 'Social Media Posts',
      video_gen: 'Video-Generierung',
      image_gen: 'Bild-Generierung',
      translation: 'Übersetzungen',
      chat: 'Chat / Allgemein',
      hashtags: 'Hashtag-Vorschläge',
      content_improvement: 'Content-Optimierung',
    }
    return feature ? labels[feature] || feature : 'Sonstige'
  }

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      openrouter: 'bg-purple-100 text-purple-800',
      replicate: 'bg-blue-100 text-blue-800',
      openai: 'bg-green-100 text-green-800',
      deepl: 'bg-orange-100 text-orange-800',
    }
    return colors[provider] || 'bg-gray-100 text-gray-800'
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Analytics
          </h1>
          <p className="text-muted-foreground">
            Übersicht über die AI-Nutzung und Kosten
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Letzte 7 Tage</SelectItem>
              <SelectItem value="14">Letzte 14 Tage</SelectItem>
              <SelectItem value="30">Letzte 30 Tage</SelectItem>
              <SelectItem value="90">Letzte 90 Tage</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          <Button variant="outline" onClick={exportCSV} disabled={!data}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Anfragen</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data.summary.totalRequests)}</div>
                <p className="text-xs text-muted-foreground">
                  {data.summary.successRate}% Erfolgsrate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data.summary.totalTokens)}</div>
                <p className="text-xs text-muted-foreground">
                  Ø {formatNumber(Math.round(data.summary.totalTokens / Math.max(1, data.summary.totalRequests)))} pro Anfrage
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kosten</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.summary.totalCostUsd)}</div>
                <p className="text-xs text-muted-foreground">
                  Ø {formatCurrency(data.summary.avgCostPerRequest)} pro Anfrage
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Antwortzeit</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data.summary.avgResponseTimeMs)} ms</div>
                <p className="text-xs text-muted-foreground">
                  Durchschnittliche Latenz
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts / Tables */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Übersicht
              </TabsTrigger>
              <TabsTrigger value="models">
                <Layers className="h-4 w-4 mr-2" />
                Modelle
              </TabsTrigger>
              <TabsTrigger value="features">
                <PieChart className="h-4 w-4 mr-2" />
                Features
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Nutzer
              </TabsTrigger>
              <TabsTrigger value="logs">
                <Activity className="h-4 w-4 mr-2" />
                Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Daily Usage Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tägliche Nutzung</CardTitle>
                    <CardDescription>Anfragen und Kosten pro Tag</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.dailyUsage.slice(-14).map((day) => (
                        <div key={day.date} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-20">
                            {format(new Date(day.date), 'dd.MM', { locale: de })}
                          </span>
                          <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${Math.min(100, (day.requests / Math.max(...data.dailyUsage.map(d => d.requests))) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium w-12 text-right">
                            {day.requests}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Provider Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Provider-Verteilung</CardTitle>
                    <CardDescription>Anfragen nach Provider</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.byProvider.map((provider) => (
                        <div key={provider.provider} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge className={getProviderColor(provider.provider)}>
                              {provider.provider}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatNumber(provider.requests)} Anfragen
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${(provider.requests / data.summary.totalRequests) * 100}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Kosten: {formatCurrency(provider.costUsd)} • 
                            Credits: {formatNumber(provider.creditsUsed)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="models">
              <Card>
                <CardHeader>
                  <CardTitle>Modell-Nutzung</CardTitle>
                  <CardDescription>Statistiken nach AI-Modell</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Modell</TableHead>
                        <TableHead className="text-right">Anfragen</TableHead>
                        <TableHead className="text-right">Tokens</TableHead>
                        <TableHead className="text-right">Kosten (USD)</TableHead>
                        <TableHead className="text-right">Ø Tokens</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.byModel.map((model) => (
                        <TableRow key={model.model}>
                          <TableCell className="font-mono text-sm">
                            {model.model}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(model.requests)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(model.tokens)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(model.costUsd)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(Math.round(model.tokens / Math.max(1, model.requests)))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features">
              <Card>
                <CardHeader>
                  <CardTitle>Feature-Nutzung</CardTitle>
                  <CardDescription>Statistiken nach Funktionsbereich</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.byFeature.map((feature) => (
                      <div key={feature.feature || 'other'} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {getFeatureLabel(feature.feature)}
                          </span>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatNumber(feature.requests)} Anfragen</span>
                            <span>{formatCurrency(feature.costUsd)}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(feature.requests / Math.max(1, data.summary.totalRequests)) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatNumber(feature.tokens)} Tokens</span>
                          <span>{formatNumber(feature.creditsUsed)} Credits</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Top-Nutzer</CardTitle>
                  <CardDescription>Nutzer mit der höchsten AI-Nutzung</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nutzer</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead className="text-right">Anfragen</TableHead>
                        <TableHead className="text-right">Tokens</TableHead>
                        <TableHead className="text-right">Kosten (USD)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.byUser.map((user) => (
                        <TableRow key={user.userId || 'system'}>
                          <TableCell>
                            {user.user ? (
                              <div>
                                <p className="font-medium">{user.user.name || 'Unbekannt'}</p>
                                <p className="text-xs text-muted-foreground">{user.user.email}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">System</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.userType}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(user.requests)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(user.tokens)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(user.costUsd)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>Letzte Anfragen</CardTitle>
                  <CardDescription>Die letzten 50 AI-Anfragen</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Zeitpunkt</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Modell</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead className="text-right">Tokens</TableHead>
                        <TableHead className="text-right">Kosten</TableHead>
                        <TableHead className="text-right">Zeit</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {format(new Date(log.createdAt), 'dd.MM HH:mm', { locale: de })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {log.requestType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs max-w-[200px] truncate">
                            {log.model}
                          </TableCell>
                          <TableCell>
                            <Badge className={getProviderColor(log.provider)}>
                              {log.provider}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(log.totalTokens)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(log.costUsd)}
                          </TableCell>
                          <TableCell className="text-right">
                            {log.responseTimeMs ? `${log.responseTimeMs}ms` : '-'}
                          </TableCell>
                          <TableCell>
                            {log.success ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

