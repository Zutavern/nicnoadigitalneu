'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { MoreHorizontal, Edit, Eye, Trash2, Mail, Calendar, Award, FileText, CalendarDays } from 'lucide-react'

// Stylist Type
export interface Stylist {
  id: string
  userId: string
  yearsExperience: number | null
  specialties: string[]
  certifications: string[]
  portfolio: string[]
  availability: Record<string, unknown> | null
  bio: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    onboardingCompleted: boolean
    registeredAt: string
    subscriptionStatus: string | null
    priceId: string | null
  } | null
}

// Helper function for subscription badge
const getSubscriptionBadge = (status: string | null | undefined) => {
  if (!status || status === 'canceled' || status === 'incomplete_expired') {
    return <Badge variant="outline" className="text-xs">Kostenlos</Badge>
  }
  
  const variants: Record<string, string> = {
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    trialing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    past_due: 'bg-red-500/10 text-red-500 border-red-500/20',
  }
  
  const labels: Record<string, string> = {
    active: 'Aktiv',
    trialing: 'Testphase',
    past_due: 'Überfällig',
  }
  
  return (
    <Badge className={variants[status] || 'bg-gray-500/10 text-gray-500'}>
      {labels[status] || status}
    </Badge>
  )
}

interface ColumnOptions {
  onView?: (stylist: Stylist) => void
  onEdit?: (stylist: Stylist) => void
  onDelete?: (stylist: Stylist) => void
}

export const createColumns = (options: ColumnOptions = {}): ColumnDef<Stylist>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Alle auswählen"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Zeile auswählen"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'userName',
    accessorFn: (row) => row.user?.name || row.user?.email || '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stuhlmieter" />
    ),
    cell: ({ row }) => {
      const stylist = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={stylist.user?.image || ''} />
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
              {stylist.user?.name?.split(' ').map(n => n[0]).join('') || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{stylist.user?.name || 'Unbekannt'}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {stylist.user?.email || '-'}
            </p>
          </div>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const userName = row.getValue(id) as string
      const userEmail = row.original.user?.email || ''
      const searchValue = value.toLowerCase()
      return (
        userName.toLowerCase().includes(searchValue) ||
        userEmail.toLowerCase().includes(searchValue)
      )
    },
  },
  {
    id: 'experience',
    accessorFn: (row) => row.yearsExperience || 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Erfahrung" />
    ),
    cell: ({ row }) => {
      const years = row.original.yearsExperience
      return years ? (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span>{years} {years === 1 ? 'Jahr' : 'Jahre'}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    id: 'specialties',
    accessorFn: (row) => (row.specialties || []).join(', '),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Spezialisierungen" />
    ),
    cell: ({ row }) => {
      const specialties = row.original.specialties || []
      if (specialties.length === 0) {
        return <span className="text-muted-foreground text-sm">-</span>
      }
      return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {specialties.slice(0, 2).map((spec, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {spec}
            </Badge>
          ))}
          {specialties.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{specialties.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'status',
    accessorFn: (row) => row.user?.onboardingCompleted ? 'active' : 'pending',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const stylist = row.original
      return stylist.user?.onboardingCompleted ? (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          Aktiv
        </Badge>
      ) : (
        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          Ausstehend
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'subscription',
    accessorFn: (row) => row.user?.subscriptionStatus || 'free',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Abo" />
    ),
    cell: ({ row }) => {
      const stylist = row.original
      return getSubscriptionBadge(stylist.user?.subscriptionStatus)
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  // ========================================
  // AUSGEBLENDETE SPALTEN (Standard: hidden)
  // ========================================
  {
    id: 'email',
    accessorFn: (row) => row.user?.email || '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="E-Mail" />
    ),
    cell: ({ row }) => {
      const email = row.original.user?.email
      return email ? (
        <div className="flex items-center gap-1.5 text-sm">
          <Mail className="h-3 w-3 text-muted-foreground" />
          <a href={`mailto:${email}`} className="hover:underline text-blue-600">
            {email}
          </a>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    id: 'certifications',
    accessorFn: (row) => (row.certifications || []).join(', '),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Zertifizierungen" />
    ),
    cell: ({ row }) => {
      const certifications = row.original.certifications || []
      if (certifications.length === 0) {
        return <span className="text-muted-foreground text-sm">-</span>
      }
      return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {certifications.slice(0, 2).map((cert, i) => (
            <Badge key={i} variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
              <Award className="h-2.5 w-2.5 mr-1" />
              {cert}
            </Badge>
          ))}
          {certifications.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{certifications.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'bio',
    accessorFn: (row) => row.bio || '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bio" />
    ),
    cell: ({ row }) => {
      const bio = row.original.bio
      return bio ? (
        <div className="flex items-start gap-1.5 text-sm max-w-[250px]">
          <FileText className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2" title={bio}>{bio}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    id: 'availability',
    accessorFn: (row) => {
      const avail = row.availability as Record<string, boolean> | null
      if (!avail) return ''
      return Object.entries(avail)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(', ')
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Verfügbarkeit" />
    ),
    cell: ({ row }) => {
      const avail = row.original.availability as Record<string, boolean> | null
      if (!avail) return <span className="text-muted-foreground">-</span>
      
      const days = ['mo', 'di', 'mi', 'do', 'fr', 'sa']
      const dayLabels: Record<string, string> = { mo: 'Mo', di: 'Di', mi: 'Mi', do: 'Do', fr: 'Fr', sa: 'Sa' }
      
      return (
        <div className="flex gap-0.5">
          {days.map(day => (
            <span 
              key={day} 
              className={`text-xs px-1.5 py-0.5 rounded ${
                avail[day] 
                  ? 'bg-green-500/10 text-green-600' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {dayLabels[day]}
            </span>
          ))}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'registeredAt',
    accessorFn: (row) => row.user?.registeredAt || '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registriert am" />
    ),
    cell: ({ row }) => {
      const date = row.original.user?.registeredAt
      return date ? (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-3 w-3" />
          {new Date(date).toLocaleDateString('de-DE')}
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Erstellt am" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(date).toLocaleDateString('de-DE')}
        </div>
      )
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aktualisiert am" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('updatedAt') as string
      return (
        <span className="text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString('de-DE')}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const stylist = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menü öffnen</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => options.onView?.(stylist)}>
              <Eye className="mr-2 h-4 w-4" />
              Details anzeigen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => options.onEdit?.(stylist)}>
              <Edit className="mr-2 h-4 w-4" />
              Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => options.onDelete?.(stylist)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

