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
import { MoreHorizontal, Edit, Eye, Trash2, MapPin, Armchair, Users, Mail, Phone, Globe, Ruler, Calendar } from 'lucide-react'

// Salon Type
export interface Salon {
  id: string
  userId: string
  salonName: string | null
  street: string | null
  city: string | null
  zipCode: string | null
  country: string | null
  phone: string | null
  website: string | null
  employeeCount: number | null
  chairCount: number | null
  salonSize: number | null
  description: string | null
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    name: string | null
    email: string
    image: string | null
    onboardingCompleted: boolean
    subscriptionStatus: string | null
    priceId: string | null
  } | null
}

// Helper function for subscription badge
const getSubscriptionBadge = (status: string | null | undefined, priceId: string | null | undefined) => {
  if (!status || status === 'canceled' || status === 'incomplete_expired') {
    return <Badge variant="outline" className="text-xs">Kostenlos</Badge>
  }
  
  let planName = 'Starter'
  if (priceId?.includes('professional') || priceId?.includes('pro')) planName = 'Pro'
  if (priceId?.includes('enterprise')) planName = 'Enterprise'
  
  const variants: Record<string, string> = {
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    trialing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    past_due: 'bg-red-500/10 text-red-500 border-red-500/20',
  }
  
  return (
    <Badge className={variants[status] || 'bg-gray-500/10 text-gray-500'}>
      {planName}
    </Badge>
  )
}

interface ColumnOptions {
  onView?: (salon: Salon) => void
  onEdit?: (salon: Salon) => void
  onDelete?: (salon: Salon) => void
}

export const createColumns = (options: ColumnOptions = {}): ColumnDef<Salon>[] => [
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
    accessorKey: 'salonName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Salon" />
    ),
    cell: ({ row }) => {
      const salon = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={salon.owner?.image || ''} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-purple-500/40">
              {salon.salonName?.substring(0, 2).toUpperCase() || '??'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{salon.salonName || 'Unbenannt'}</p>
            <p className="text-sm text-muted-foreground">
              {salon.owner?.name || salon.owner?.email || 'Unbekannt'}
            </p>
          </div>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const salonName = row.getValue(id) as string | null
      const ownerName = row.original.owner?.name || ''
      const ownerEmail = row.original.owner?.email || ''
      const searchValue = value.toLowerCase()
      return (
        (salonName?.toLowerCase().includes(searchValue) || false) ||
        ownerName.toLowerCase().includes(searchValue) ||
        ownerEmail.toLowerCase().includes(searchValue)
      )
    },
  },
  {
    accessorKey: 'city',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Standort" />
    ),
    cell: ({ row }) => {
      const city = row.getValue('city') as string | null
      return city ? (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          {city}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'capacity',
    accessorFn: (row) => `${row.chairCount || 0}-${row.employeeCount || 0}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kapazität" />
    ),
    cell: ({ row }) => {
      const salon = row.original
      return (
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1" title="Stühle">
            <Armchair className="h-3 w-3" />
            {salon.chairCount || '-'}
          </span>
          <span className="flex items-center gap-1" title="Mitarbeiter">
            <Users className="h-3 w-3" />
            {salon.employeeCount || '-'}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: 'status',
    accessorFn: (row) => row.owner?.onboardingCompleted ? 'active' : 'pending',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const salon = row.original
      return salon.owner?.onboardingCompleted ? (
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
    accessorFn: (row) => row.owner?.subscriptionStatus || 'free',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Abo" />
    ),
    cell: ({ row }) => {
      const salon = row.original
      return getSubscriptionBadge(salon.owner?.subscriptionStatus, salon.owner?.priceId)
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
    accessorFn: (row) => row.owner?.email || '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="E-Mail" />
    ),
    cell: ({ row }) => {
      const email = row.original.owner?.email
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
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Telefon" />
    ),
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string | null
      return phone ? (
        <div className="flex items-center gap-1.5 text-sm">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <a href={`tel:${phone}`} className="hover:underline">
            {phone}
          </a>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: 'website',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Website" />
    ),
    cell: ({ row }) => {
      const website = row.getValue('website') as string | null
      return website ? (
        <div className="flex items-center gap-1.5 text-sm">
          <Globe className="h-3 w-3 text-muted-foreground" />
          <a 
            href={website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline text-blue-600 max-w-[150px] truncate"
          >
            {website.replace(/^https?:\/\//, '')}
          </a>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    id: 'address',
    accessorFn: (row) => `${row.street || ''} ${row.zipCode || ''}`.trim(),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Adresse" />
    ),
    cell: ({ row }) => {
      const salon = row.original
      const address = [salon.street, salon.zipCode, salon.city].filter(Boolean).join(', ')
      return address ? (
        <span className="text-sm max-w-[200px] truncate block" title={address}>
          {address}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: 'zipCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PLZ" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue('zipCode') || '-'}</span>
    ),
  },
  {
    accessorKey: 'salonSize',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fläche" />
    ),
    cell: ({ row }) => {
      const size = row.getValue('salonSize') as number | null
      return size ? (
        <div className="flex items-center gap-1.5 text-sm">
          <Ruler className="h-3 w-3 text-muted-foreground" />
          {size} m²
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
      const salon = row.original
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
            <DropdownMenuItem onClick={() => options.onView?.(salon)}>
              <Eye className="mr-2 h-4 w-4" />
              Details anzeigen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => options.onEdit?.(salon)}>
              <Edit className="mr-2 h-4 w-4" />
              Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => options.onDelete?.(salon)}
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

