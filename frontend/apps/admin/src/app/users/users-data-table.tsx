'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { ColumnDef } from '@tanstack/react-table'
import { Edit, Eye, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import type { AdminUser } from './mock-data'

export type UsersDataTableProps = {
  users: ReadonlyArray<AdminUser>
  onView: (u: AdminUser) => void
  onEdit: (u: AdminUser) => void
  onDelete: (u: AdminUser) => void
  isDeleting?: boolean
  onSelectionChange?: (selected: AdminUser[]) => void
}

const systemVariantMap: Record<AdminUser['system'], 'info' | 'primary' | 'secondary'> = {
  doula: 'info',
  functional_health: 'primary',
  elderly_care: 'secondary',
}

export function UsersDataTable(props: UsersDataTableProps) {
  const { users, onView, onEdit, onDelete, isDeleting, onSelectionChange } = props

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{row.original.name}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyToClipboard
                text={row.original.id}
                label="User ID copied"
                variant="inline"
                showSuccessToast={false}
                className="text-xs"
              />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{row.original.email}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyToClipboard
                text={row.original.email}
                label="Email copied"
                showSuccessToast={false}
                variant="inline"
                className="text-xs"
              />
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'system',
      header: 'System',
      cell: ({ row }) => (
        <StatusBadge variant={systemVariantMap[row.original.system]}>
          {row.original.system.replace('_', ' ')}
        </StatusBadge>
      ),
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge variant={row.original.status === 'active' ? 'success' : 'default'}>
          {row.original.status}
        </StatusBadge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM d, yyyy'),
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'lastLogin',
      header: 'Last Login',
      cell: ({ row }) => format(new Date(row.original.lastLogin), 'MMM d, yyyy'),
      sortingFn: 'datetime',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onView(row.original)} 
                className="h-8 w-8"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View user details</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onEdit(row.original)} 
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit user</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(row.original)}
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete user</TooltipContent>
          </Tooltip>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]

  return (
    <TooltipProvider delayDuration={300}>
      <DataTable
        columns={columns}
        data={[...users]}
        enableRowSelection
        initialVisibility={{}}
        searchPlaceholder="Search users…"
        onSelectionChange={onSelectionChange}
      />
    </TooltipProvider>
  )
}


