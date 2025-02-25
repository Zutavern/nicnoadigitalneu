'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { SystemStatus, StatusIncident, StatusMetric } from '@/lib/supabase/schema'
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Activity,
  Clock,
  ArrowUpRight,
  BarChart3
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from '@/lib/utils'

export default function StatusPage() {
  const [systems, setSystems] = useState<SystemStatus[]>([])
  const [incidents, setIncidents] = useState<StatusIncident[]>([])
  const [metrics, setMetrics] = useState<StatusMetric[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
    const channel = supabase.channel('status-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'system_status' 
      }, () => fetchData())
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'status_incidents' 
      }, () => fetchData())
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'status_metrics' 
      }, () => fetchData())
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const fetchData = async () => {
    try {
      const [
        { data: systemsData }, 
        { data: incidentsData },
        { data: metricsData }
      ] = await Promise.all([
        supabase.from('system_status').select('*').order('name'),
        supabase.from('status_incidents').select('*').order('created_at.desc'),
        supabase.from('status_metrics').select('*').order('timestamp.desc')
      ])

      setSystems(systemsData || [])
      setIncidents(incidentsData || [])
      setMetrics(metricsData || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching status data:', error)
      setLoading(false)
    }
  }

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500/10 text-green-500'
      case 'degraded':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'outage':
        return 'bg-red-500/10 text-red-500'
    }
  }

  const getIncidentStatusColor = (status: StatusIncident['status']) => {
    switch (status) {
      case 'investigating':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'identified':
        return 'bg-blue-500/10 text-blue-500'
      case 'monitoring':
        return 'bg-purple-500/10 text-purple-500'
      case 'resolved':
        return 'bg-green-500/10 text-green-500'
    }
  }

  const getIncidentImpactColor = (impact: StatusIncident['impact']) => {
    switch (impact) {
      case 'none':
        return 'bg-gray-500/10 text-gray-500'
      case 'minor':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'major':
        return 'bg-orange-500/10 text-orange-500'
      case 'critical':
        return 'bg-red-500/10 text-red-500'
    }
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
              <Activity className="mr-1 h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Live System Status</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              System Status & Performance
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Echtzeitüberwachung unserer Systeme und Services. 
              Hier finden Sie aktuelle Informationen über die Verfügbarkeit und Performance 
              unserer Plattform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Status Overview */}
      <section className="container pb-16">
        <div className="grid gap-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Aktuelle Verfügbarkeit aller Systemkomponenten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : systems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Keine Systemkomponenten gefunden
                  </p>
                ) : (
                  systems.map((system) => (
                    <div
                      key={system.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(system.status)}
                        <div>
                          <p className="font-medium">{system.name}</p>
                          {system.description && (
                            <p className="text-sm text-muted-foreground">
                              {system.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "rounded-full px-2 py-1 text-xs font-medium",
                          getStatusColor(system.status)
                        )}>
                          {system.status}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3 inline" />
                          {new Date(system.last_updated).toLocaleString('de-DE')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Incidents */}
          <Card>
            <CardHeader>
              <CardTitle>Aktuelle Vorfälle</CardTitle>
              <CardDescription>
                Übersicht über kürzlich aufgetretene Störungen und deren Status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : incidents.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <p className="text-muted-foreground">
                      Keine aktiven Vorfälle
                    </p>
                  </div>
                ) : (
                  incidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="space-y-4 rounded-lg border p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{incident.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {incident.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={cn(
                            "rounded-full px-2 py-1 text-xs font-medium",
                            getIncidentStatusColor(incident.status)
                          )}>
                            {incident.status}
                          </span>
                          <span className={cn(
                            "rounded-full px-2 py-1 text-xs font-medium",
                            getIncidentImpactColor(incident.impact)
                          )}>
                            {incident.impact} impact
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          <Clock className="mr-1 h-3 w-3 inline" />
                          Gemeldet: {new Date(incident.created_at).toLocaleString('de-DE')}
                        </span>
                        {incident.resolved_at && (
                          <span>
                            <CheckCircle2 className="mr-1 h-3 w-3 inline text-green-500" />
                            Gelöst: {new Date(incident.resolved_at).toLocaleString('de-DE')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metriken</CardTitle>
              <CardDescription>
                Aktuelle Performance-Indikatoren unserer Systeme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                  <div className="col-span-full flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : metrics.length === 0 ? (
                  <p className="col-span-full text-center text-muted-foreground py-8">
                    Keine Metriken verfügbar
                  </p>
                ) : (
                  metrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-2xl font-bold">
                        {metric.value}
                        <span className="ml-1 text-sm font-normal text-muted-foreground">
                          {metric.unit}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Zuletzt aktualisiert: {new Date(metric.timestamp).toLocaleString('de-DE')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
} 