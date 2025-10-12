'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import type { ActionPlan } from '@health-platform/types'

const actionPlanSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'archived']),
})

type ActionPlanFormData = {
  userId: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'archived'
}

interface ActionPlanModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly actionPlan?: ActionPlan
  readonly mode?: 'create' | 'edit'
  readonly onSubmit: (data: ActionPlanFormData) => Promise<void>
  readonly users?: any[]
}

export function ActionPlanModal({ 
  open, 
  onOpenChange, 
  actionPlan, 
  mode = 'create',
  onSubmit: onSubmitProp,
  users = []
}: ActionPlanModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ActionPlanFormData>({
    resolver: zodResolver(actionPlanSchema),
    defaultValues: actionPlan ? {
      userId: actionPlan.userId || '',
      title: actionPlan.title,
      description: actionPlan.description || '',
      status: actionPlan.status as 'active' | 'completed' | 'archived',
    } : {
      userId: users[0]?.id || '',
      title: '',
      description: '',
      status: 'active',
    },
  })

  const onSubmit = async (data: ActionPlanFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmitProp(data)
      toast({
        title: mode === 'create' ? 'Action plan created' : 'Action plan updated',
        description: `${data.title} has been ${mode === 'create' ? 'created' : 'updated'} successfully`,
      })
      reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save action plan:', error)
      toast({
        title: 'Error',
        description: mode === 'create' ? 'Failed to create action plan' : 'Failed to update action plan',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Action Plan' : 'Edit Action Plan'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new action plan with goals and tasks.'
              : 'Update the action plan details.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="userId">Assign to User *</Label>
            <select
              id="userId"
              {...register('userId')}
              className={`w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.userId ? 'border-red-500' : ''}`}
              disabled={mode === 'edit'}
            >
              <option value="">Select a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username || user.email} - {user.email}
                </option>
              ))}
            </select>
            {errors.userId && (
              <p className="text-sm text-red-600 mt-1">{errors.userId.message}</p>
            )}
            {mode === 'edit' && (
              <p className="text-xs text-gray-500 mt-1">User assignment cannot be changed after creation</p>
            )}
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Weight Management Plan"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register('description')}
              rows={4}
              placeholder="Describe the goals and objectives of this action plan..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              {...register('status')}
              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {(() => {
                if (isSubmitting) return 'Saving...'
                return mode === 'create' ? 'Create Plan' : 'Update Plan'
              })()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

