'use client'

import { Table } from '@tanstack/react-table'
import { Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Settings2 className="mr-2 h-4 w-4" />
          Spalten
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>Spalten anzeigen</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {/* Salons */}
                {column.id === 'salonName' ? 'Salon' :
                 column.id === 'city' ? 'Stadt' :
                 column.id === 'capacity' ? 'Kapazität' :
                 column.id === 'phone' ? 'Telefon' :
                 column.id === 'website' ? 'Website' :
                 column.id === 'address' ? 'Adresse' :
                 column.id === 'zipCode' ? 'PLZ' :
                 column.id === 'salonSize' ? 'Fläche' :
                 /* Stylists */
                 column.id === 'userName' ? 'Name' :
                 column.id === 'experience' ? 'Erfahrung' :
                 column.id === 'specialties' ? 'Spezialisierungen' :
                 column.id === 'certifications' ? 'Zertifizierungen' :
                 column.id === 'bio' ? 'Bio' :
                 column.id === 'availability' ? 'Verfügbarkeit' :
                 column.id === 'registeredAt' ? 'Registriert' :
                 /* Users */
                 column.id === 'role' ? 'Rolle' :
                 column.id === 'emailVerified' ? 'E-Mail verifiziert' :
                 /* Common */
                 column.id === 'status' ? 'Status' :
                 column.id === 'subscription' ? 'Abo' :
                 column.id === 'email' ? 'E-Mail' :
                 column.id === 'createdAt' ? 'Erstellt am' :
                 column.id === 'updatedAt' ? 'Aktualisiert am' :
                 column.id === 'id' ? 'ID' :
                 column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

