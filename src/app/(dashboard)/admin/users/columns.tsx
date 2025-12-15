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
import { 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  Key, 
  LogIn, 
  Building2, 
  Scissors, 
  Shield,
  Calendar,
  Hash,
  Coins,
} from 'lucide-react'

// User Type
export interface User {
  id: string
  name: string | null
  email: string
  role: 'ADMIN' | 'SALON_OWNER' | 'STYLIST'
  emailVerified: string | null
  onboardingCompleted: boolean
  createdAt: string
  image: string | null
}

// Role icon component
const RoleIcon = ({ role }: { role: string }) => {
  switch (role) {
    case 'ADMIN':
      return <Shield className="h-4 w-4 text-red-500" />
    case 'SALON_OWNER':
      return <Building2 className="h-4 w-4 text-purple-500" />
    case 'STYLIST':
      return <Scissors className="h-4 w-4 text-pink-500" />
    default:
      return null
  }
}

// Role badge component
const RoleBadge = ({ role }: { role: string }) => {
  const variants: Record<string, string> = {
    ADMIN: 'bg-red-500/10 text-red-500 border-red-500/20',
    SALON_OWNER: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    STYLIST: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  }
  const labels: Record<string, string> = {
    ADMIN: 'Admin',
    SALON_OWNER: 'Salonbesitzer',
    STYLIST: 'Stylist',
  }
  return (
    <Badge className={variants[role] || 'bg-gray-500/10 text-gray-500'}>
      <RoleIcon role={role} />
      <span className="ml-1">{labels[role] || role}</span>
    </Badge>
  )
}

interface ColumnOptions {
  onView?: (user: User) => void
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  onResetPassword?: (user: User) => void
  onLoginAs?: (user: User) => void
  onAdjustCredits?: (user: User) => void
}

export const createColumns = (options: ColumnOptions = {}): ColumnDef<User>[] => [
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
    accessorFn: (row) => row.name || row.email,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Benutzer" />
    ),
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.image || ''} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              {user.name?.split(' ').map(n => n[0]).join('') || user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name || 'Kein Name'}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const userName = row.getValue(id) as string
      const userEmail = row.original.email
      const searchValue = value.toLowerCase()
      return (
        userName.toLowerCase().includes(searchValue) ||
        userEmail.toLowerCase().includes(searchValue)
      )
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rolle" />
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as string
      return <RoleBadge role={role} />
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'status',
    accessorFn: (row) => row.onboardingCompleted ? 'active' : 'pending',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const user = row.original
      return user.onboardingCompleted ? (
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
    id: 'emailVerified',
    accessorFn: (row) => row.emailVerified ? 'verified' : 'unverified',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="E-Mail" />
    ),
    cell: ({ row }) => {
      const user = row.original
      return user.emailVerified ? (
        <Badge variant="outline" className="text-green-500 border-green-500/20">
          Verifiziert
        </Badge>
      ) : (
        <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">
          Nicht verifiziert
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registriert" />
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
  // ========================================
  // AUSGEBLENDETE SPALTEN (Standard: hidden)
  // ========================================
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => {
      const id = row.getValue('id') as string
      return (
        <div className="flex items-center gap-1.5 text-sm font-mono">
          <Hash className="h-3 w-3 text-muted-foreground" />
          <span className="max-w-[100px] truncate" title={id}>
            {id.substring(0, 8)}...
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="E-Mail (separat)" />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string
      return (
        <span className="text-sm">{email}</span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original
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
            <DropdownMenuItem onClick={() => options.onView?.(user)}>
              <Eye className="mr-2 h-4 w-4" />
              Details anzeigen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => options.onEdit?.(user)}>
              <Edit className="mr-2 h-4 w-4" />
              Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => options.onResetPassword?.(user)}>
              <Key className="mr-2 h-4 w-4" />
              Passwort zurücksetzen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => options.onAdjustCredits?.(user)}>
              <Coins className="mr-2 h-4 w-4" />
              Credits anpassen
            </DropdownMenuItem>
            {user.role !== 'ADMIN' && (
              <DropdownMenuItem onClick={() => options.onLoginAs?.(user)}>
                <LogIn className="mr-2 h-4 w-4" />
                Als Benutzer einloggen
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => options.onDelete?.(user)}
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

