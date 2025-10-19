'use client'

import { useState, useEffect } from 'react'
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
import { useCreateUser, useUpdateUser } from '@/hooks/use-admin-api'
import { useToast } from '@/hooks/use-toast'

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.enum(['user', 'admin']),
  profileType: z.enum(['patient', 'provider', 'admin']),
  journeyType: z.enum(['general', 'prenatal', 'postnatal']),
  systemId: z.string().min(1, 'System is required'),
})

type UserFormData = {
  email: string
  username: string
  role: 'user' | 'admin'
  profileType: 'patient' | 'provider' | 'admin'
  journeyType: 'general' | 'prenatal' | 'postnatal'
  systemId: string
  password?: string
}

interface UserModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly user?: any
  readonly mode?: 'create' | 'edit'
}

export function UserModal({ open, onOpenChange, user, mode = 'create' }: UserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'user',
      profileType: 'patient',
      journeyType: 'general',
      systemId: 'doula-system-id',
    },
  })

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          email: user.email,
          username: user.username,
          role: user.role,
          profileType: user.profileType,
          journeyType: user.journeyType,
          systemId: user.systemId,
        })
      } else {
        reset({
          email: '',
          username: '',
          role: 'user',
          profileType: 'patient',
          journeyType: 'general',
          systemId: 'doula-system-id',
        })
      }
    }
  }, [user, open, reset])

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true)
    try {
      if (mode === 'create') {
        await createUser.mutateAsync(data)
        toast({
          title: 'User created',
          description: `${data.username} has been created successfully`,
        })
      } else {
        await updateUser.mutateAsync({ id: user.id, data })
        toast({
          title: 'User updated',
          description: `${data.username} has been updated successfully`,
        })
      }
      reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save user:', error)
      toast({
        title: 'Error',
        description: mode === 'create' ? 'Failed to create user' : 'Failed to update user',
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
          <DialogTitle>{mode === 'create' ? 'Create New User' : 'Edit User'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new user to the system. All fields are required.' 
              : 'Update user information. Leave password empty to keep current password.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                {...register('username')}
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && (
                <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>
              )}
            </div>
          </div>

          {mode === 'create' && (
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                {...register('role')}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="profileType">Profile Type *</Label>
              <select
                id="profileType"
                {...register('profileType')}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="patient">Patient</option>
                <option value="provider">Provider</option>
                <option value="admin">Admin</option>
              </select>
              {errors.profileType && (
                <p className="text-sm text-red-600 mt-1">{errors.profileType.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="journeyType">Journey Type *</Label>
              <select
                id="journeyType"
                {...register('journeyType')}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="prenatal">Prenatal</option>
                <option value="postnatal">Postnatal</option>
              </select>
              {errors.journeyType && (
                <p className="text-sm text-red-600 mt-1">{errors.journeyType.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="systemId">System *</Label>
              <select
                id="systemId"
                {...register('systemId')}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="doula-system-id">Doula Care</option>
                <option value="functional-health-system-id">Functional Health</option>
                <option value="elderly-care-system-id">Elderly Care</option>
              </select>
              {errors.systemId && (
                <p className="text-sm text-red-600 mt-1">{errors.systemId.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {(() => {
                if (isSubmitting) return 'Saving...'
                return mode === 'create' ? 'Create User' : 'Update User'
              })()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

