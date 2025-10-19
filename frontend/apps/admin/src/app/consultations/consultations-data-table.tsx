'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge, type BadgeVariant } from '@/components/ui/status-badge'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { format } from 'date-fns'
import type { AdminConsultation, ConsultationStatus } from './mock-data'

export type ConsultationsDataTableProps = {
  consultations: ReadonlyArray<AdminConsultation>
  onView: (consultation: AdminConsultation) => void
  onSelectionChange?: (selected: AdminConsultation[]) => void
}

const statusVariantMap: Record<ConsultationStatus, BadgeVariant> = {
  SCHEDULED: 'info',
  CONFIRMED: 'primary',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'default',
  NO_SHOW: 'error',
}

const statusLabelMap: Record<ConsultationStatus, string> = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
}

export function ConsultationsDataTable(props: ConsultationsDataTableProps) {
  const { consultations, onView, onSelectionChange } = props

  const columns: ColumnDef<AdminConsultation>[] = [
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.patientName}</div>
          <div className="text-sm text-gray-500">{row.original.patientEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: 'doctorName',
      header: 'Doctor',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.doctorImageUrl ? (
            <img
              src={row.original.doctorImageUrl}
              alt={row.original.doctorName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-semibold text-xs">
                {row.original.doctorName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{row.original.doctorName}</div>
            <div className="text-xs text-gray-500">{row.original.doctorSpecialization}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'scheduledAt',
      header: 'Scheduled',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">
            {format(new Date(row.original.scheduledAt), 'MMM d, yyyy')}
          </div>
          <div className="text-sm text-gray-500">
            {format(new Date(row.original.scheduledAt), 'h:mm a')} ({row.original.duration} min)
          </div>
        </div>
      ),
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <span className="text-gray-600">{row.original.type}</span>,
    },
    {
      accessorKey: 'fee',
      header: 'Fee',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-gray-900">₹{row.original.fee}</span>
          {row.original.isPaid && (
            <StatusBadge variant="success" className="ml-2 text-xs">
              Paid
            </StatusBadge>
          )}
        </div>
      ),
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge variant={statusVariantMap[row.original.status]}>
          {statusLabelMap[row.original.status]}
        </StatusBadge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row.original)}
            title="View details"
            className="h-8"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
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
      data={[...consultations]}
      enableRowSelection
      initialVisibility={{}}
      searchPlaceholder="Search by patient, doctor, or email…"
      onSelectionChange={onSelectionChange}
    />
  )
}

