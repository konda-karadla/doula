'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Plus, Filter, Trash2 } from 'lucide-react'
import { UserModal } from '@/components/modals/user-modal'
import { UsersDataTable } from './users-data-table'
import { mockUsers, type AdminUser } from './mock-data'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSystem, setFilterSystem] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([])
  const { toast } = useToast()
  const router = useRouter()

  // Using mock data per request. Replace with hook when backend is ready.
  const users = mockUsers
  const isLoading = false
  const error = null
  const deleteUserMutation = { isPending: false, mutateAsync: async (_id: string) => {} }

  const filteredUsers = useMemo(() => {
    if (!users) return []
    
    return users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSystem = filterSystem === 'all' || user.system === filterSystem
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus
      
      return matchesSearch && matchesSystem && matchesStatus
    })
  }, [users, searchTerm, filterSystem, filterStatus])

  const handleDeleteUser = (user: AdminUser) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return
    try {
      await deleteUserMutation.mutateAsync(userToDelete.id)
      toast({
        title: 'User deleted',
        description: `${userToDelete.name} has been deleted successfully`,
      })
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast({
        title: 'Delete failed',
        description: 'Failed to delete user',
        variant: 'destructive',
      })
    }
  }

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) return
    setBulkDeleteDialogOpen(true)
  }

  const confirmBulkDelete = async () => {
    try {
      // In real app, call bulk delete API
      await Promise.all(selectedUsers.map((u) => deleteUserMutation.mutateAsync(u.id)))
      toast({
        title: 'Users deleted',
        description: `${selectedUsers.length} user(s) have been deleted successfully`,
      })
      setSelectedUsers([])
    } catch (error) {
      console.error('Failed to delete users:', error)
      toast({
        title: 'Delete failed',
        description: 'Failed to delete users',
        variant: 'destructive',
      })
    }
  }

  const handleCreateUser = () => {
    setSelectedUser(null)
    setModalMode('create')
    setIsUserModalOpen(true)
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setModalMode('edit')
    setIsUserModalOpen(true)
  }

  const handleViewUser = (user: any) => {
    router.push(`/users/${user.id}`)
  }


  

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage platform users and their access</p>
          </div>
          <Button onClick={handleCreateUser}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Filters - basic quick filter retained for demo but DataTable handles actual filtering */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
            <CardDescription>Client-side filters with mock data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="filter-system" className="block text-sm font-medium text-gray-700 mb-1">System</label>
                <select
                  id="filter-system"
                  value={filterSystem}
                  onChange={(e) => setFilterSystem(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Systems</option>
                  <option value="doula">Doula</option>
                  <option value="functional_health">Functional Health</option>
                  <option value="elderly_care">Elderly Care</option>
                </select>
              </div>
              <div>
                <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setFilterSystem('all')
                    setFilterStatus('all')
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </div>
              {selectedUsers.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {selectedUsers.length} selected
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <UsersDataTable
              users={filteredUsers}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onSelectionChange={setSelectedUsers}
            />
          </CardContent>
        </Card>
      </div>

      {/* User Modal */}
      <UserModal
        open={isUserModalOpen}
        onOpenChange={setIsUserModalOpen}
        user={selectedUser}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description={
          userToDelete
            ? `Are you sure you want to delete ${userToDelete.name} (${userToDelete.email})? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDeleteUser}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Multiple Users"
        description={`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`}
        confirmText={`Delete ${selectedUsers.length} user(s)`}
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmBulkDelete}
      />
    </AdminLayout>
  )
}
