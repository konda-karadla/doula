'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import type { ColumnDef } from '@tanstack/react-table'
import { Edit, Clock, Power, Trash2 } from 'lucide-react'
import type { AdminDoctor } from './mock-data'

export type DoctorsDataTableProps = {
  doctors: ReadonlyArray<AdminDoctor>
  onEdit: (doctor: AdminDoctor) => void
  onSetAvailability: (doctor: AdminDoctor) => void
  onToggle: (doctor: AdminDoctor) => void
  onDelete: (doctor: AdminDoctor) => void
  isDeleting?: boolean
  isToggling?: boolean
  onSelectionChange?: (selected: AdminDoctor[]) => void
}

export function DoctorsDataTable(props: DoctorsDataTableProps) {
  const { doctors, onEdit, onSetAvailability, onToggle, onDelete, isDeleting, isToggling, onSelectionChange } = props

  const columns: ColumnDef<AdminDoctor>[] = [
    {
      accessorKey: 'name',
      header: 'Doctor',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.imageUrl ? (
            <img
              src={row.original.imageUrl}
              alt={row.original.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-semibold text-sm">
                {row.original.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{row.original.name}</div>
            <div className="text-sm text-gray-500">{row.original.qualifications.join(', ')}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'specialization',
      header: 'Specialization',
      cell: ({ row }) => <span className="text-gray-900">{row.original.specialization}</span>,
    },
    {
      accessorKey: 'experience',
      header: 'Experience',
      cell: ({ row }) => <span className="text-gray-600">{row.original.experience} years</span>,
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'consultationFee',
      header: 'Fee',
      cell: ({ row }) => <span className="font-medium text-gray-900">₹{row.original.consultationFee}</span>,
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'consultationsCount',
      header: 'Consultations',
      cell: ({ row }) => <span className="text-gray-600">{row.original.consultationsCount}</span>,
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="text-gray-900 font-medium">{row.original.rating.toFixed(1)}</span>
        </div>
      ),
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge variant={row.original.isActive ? 'success' : 'default'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            title="Edit doctor"
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSetAvailability(row.original)}
            title="Set availability"
            className="h-8 w-8"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggle(row.original)}
            title={row.original.isActive ? 'Deactivate' : 'Activate'}
            disabled={isToggling}
            className="h-8 w-8"
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original)}
            title="Delete doctor"
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={[...doctors]}
      enableRowSelection
      initialVisibility={{}}
      searchPlaceholder="Search doctors by name or specialization…"
      onSelectionChange={onSelectionChange}
    />
  )
}

