'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge, type BadgeVariant } from '@/components/ui/status-badge'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Download, Trash2, FileText } from 'lucide-react'
import { format } from 'date-fns'
import type { AdminLabResult, LabResultStatus } from './mock-data'

export type LabResultsDataTableProps = {
  labResults: ReadonlyArray<AdminLabResult>
  onView: (result: AdminLabResult) => void
  onDownload: (result: AdminLabResult) => void
  onDelete: (result: AdminLabResult) => void
  isDeleting?: boolean
  onSelectionChange?: (selected: AdminLabResult[]) => void
}

const statusVariantMap: Record<LabResultStatus, BadgeVariant> = {
  pending: 'info',
  processing: 'warning',
  completed: 'success',
  failed: 'error',
  error: 'error',
}

const statusLabelMap: Record<LabResultStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Processed',
  failed: 'Error',
  error: 'Error',
}

export function LabResultsDataTable(props: LabResultsDataTableProps) {
  const { labResults, onView, onDownload, onDelete, isDeleting, onSelectionChange } = props

  const columns: ColumnDef<AdminLabResult>[] = [
    {
      accessorKey: 'fileName',
      header: 'File',
      cell: ({ row }) => (
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-gray-400 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-900">{row.original.fileName}</div>
            {row.original.userName && (
              <div className="text-xs text-gray-500">{row.original.userName}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'fileSize',
      header: 'Size',
      cell: ({ row }) => {
        const sizeInKB = (row.original.fileSize / 1024).toFixed(0)
        return <span className="text-gray-600">{sizeInKB} KB</span>
      },
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'processingStatus',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge variant={statusVariantMap[row.original.processingStatus]}>
          {statusLabelMap[row.original.processingStatus]}
        </StatusBadge>
      ),
    },
    {
      accessorKey: 'uploadedAt',
      header: 'Uploaded',
      cell: ({ row }) => (
        <div>
          <div className="text-sm text-gray-900">
            {format(new Date(row.original.uploadedAt), 'MMM d, yyyy')}
          </div>
          <div className="text-xs text-gray-500">
            {format(new Date(row.original.uploadedAt), 'h:mm a')}
          </div>
        </div>
      ),
      sortingFn: 'datetime',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(row.original)}
            title="View result"
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDownload(row.original)}
            title="Download result"
            className="h-8 w-8"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original)}
            title="Delete result"
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
      data={[...labResults]}
      enableRowSelection
      initialVisibility={{}}
      searchPlaceholder="Search by file name…"
      onSelectionChange={onSelectionChange}
    />
  )
}

