export interface SystemStatus {
  id: string
  name: string
  status: 'operational' | 'degraded' | 'outage'
  last_updated: string
  description: string | null
}

export interface StatusIncident {
  id: string
  title: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  created_at: string
  updated_at: string
  resolved_at: string | null
  impact: 'none' | 'minor' | 'major' | 'critical'
  description: string
}

export interface StatusMetric {
  id: string
  name: string
  value: number
  unit: string
  timestamp: string
} 