'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  FileText, 
  Download,
  Search,
  Loader2,
  Euro,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface Invoice {
  id: string
  invoiceNumber: string
  type: 'RENT' | 'COMMISSION' | 'FEE' | 'OTHER'
  amount: number
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  issuedDate: string
  dueDate: string
  paidDate: string | null
  description: string
  stylist: {
    name: string
    email: string
  } | null
}

const statusConfig = {
  DRAFT: { label: 'Entwurf', color: 'bg-gray-500', icon: Clock },
  SENT: { label: 'Gesendet', color: 'bg-blue-500', icon: FileText },
  PAID: { label: 'Bezahlt', color: 'bg-green-500', icon: CheckCircle2 },
  OVERDUE: { label: 'Überfällig', color: 'bg-red-500', icon: AlertCircle },
  CANCELLED: { label: 'Storniert', color: 'bg-gray-400', icon: AlertCircle },
}

const typeConfig = {
  RENT: { label: 'Stuhlmiete', color: 'text-blue-500' },
  COMMISSION: { label: 'Provision', color: 'text-purple-500' },
  FEE: { label: 'Gebühren', color: 'text-orange-500' },
  OTHER: { label: 'Sonstiges', color: 'text-gray-500' },
}

export default function SalonInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [filterType, setFilterType] = useState<string>('ALL')

  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (filterStatus !== 'ALL') params.append('status', filterStatus)
        if (filterType !== 'ALL') params.append('type', filterType)

        const response = await fetch(`/api/salon/invoices?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          // Handle both formats: direct array or { invoices: [...] }
          setInvoices(Array.isArray(data) ? data : (data.invoices || []))
        }
      } catch (error) {
        console.error('Error fetching invoices:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoices()
  }, [searchTerm, filterStatus, filterType])

  const stats = {
    total: invoices.reduce((sum, i) => sum + i.amount, 0),
    paid: invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0),
    pending: invoices.filter(i => ['DRAFT', 'SENT'].includes(i.status)).reduce((sum, i) => sum + i.amount, 0),
    overdue: invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Rechnungen</h1>
          <p className="text-muted-foreground">
            Verwalte Einnahmen von Stuhlmieten und Provisionen
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
          <FileText className="mr-2 h-4 w-4" />
          Neue Rechnung
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">
                  €{stats.total.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Euro className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bezahlt</p>
                <p className="text-2xl font-bold text-green-500">
                  €{stats.paid.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ausstehend</p>
                <p className="text-2xl font-bold text-blue-500">
                  €{stats.pending.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Überfällig</p>
                <p className="text-2xl font-bold text-red-500">
                  €{stats.overdue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechnung suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Alle Status</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Alle Typen</SelectItem>
                  {Object.entries(typeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Invoices Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rechnungsnr.</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Stylist</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Fällig</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice, index) => {
                    const status = statusConfig[invoice.status]
                    const type = typeConfig[invoice.type]
                    const StatusIcon = status.icon
                    
                    return (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="group"
                      >
                        <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                          <span className={cn('font-medium', type.color)}>{type.label}</span>
                        </TableCell>
                        <TableCell>{invoice.stylist?.name || '-'}</TableCell>
                        <TableCell>
                          {format(parseISO(invoice.issuedDate), 'dd.MM.yyyy', { locale: de })}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(invoice.dueDate), 'dd.MM.yyyy', { locale: de })}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          €{invoice.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(status.color, 'text-white')}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold">Keine Rechnungen</h3>
                <p className="text-muted-foreground">
                  Es wurden noch keine Rechnungen gefunden.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

