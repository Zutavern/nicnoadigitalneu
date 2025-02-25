import { LucideIcon } from 'lucide-react'

export interface Endpoint {
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  request: {
    method: string
    headers: Record<string, string>
    body?: Record<string, unknown>
    query?: Record<string, string>
  }
  response: Record<string, unknown>
}

export interface EndpointCategory {
  category: string
  icon: LucideIcon
  items: Endpoint[]
} 