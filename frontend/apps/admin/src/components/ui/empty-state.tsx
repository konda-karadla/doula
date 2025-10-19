import * as React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {Icon && (
        <div className="mb-4 rounded-full bg-gray-100 p-6">
          <Icon className="h-12 w-12 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600 mb-6 max-w-md">{description}</p>}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Predefined empty states for common scenarios
export function EmptyStateNoResults({ searchTerm }: { searchTerm?: string }) {
  return (
    <EmptyState
      title={searchTerm ? 'No results found' : 'No items yet'}
      description={
        searchTerm
          ? 'Try adjusting your search or filters'
          : 'Items will appear here once they are created'
      }
    />
  )
}

export function EmptyStateNoData({ 
  entityName = 'items',
  onCreateClick 
}: { 
  entityName?: string
  onCreateClick?: () => void 
}) {
  return (
    <EmptyState
      title={`No ${entityName} yet`}
      description={`Get started by creating your first ${entityName.toLowerCase()}`}
      action={
        onCreateClick
          ? {
              label: `Add ${entityName}`,
              onClick: onCreateClick,
            }
          : undefined
      }
    />
  )
}

