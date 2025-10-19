'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Search, Plus, Edit, Trash2, Eye, Filter, Target, Calendar, Loader2 } from 'lucide-react'
import { useAdminActionPlans, useDeleteActionPlan, useCreateActionPlan, useUpdateActionPlan, useUsers } from '@/hooks/use-admin-api'
import { format } from 'date-fns'
import type { ActionPlan, ActionItem } from '@health-platform/types'
import { ActionPlanModal } from '@/components/modals/action-plan-modal'

// Action Plan Card Component
interface ActionPlanCardProps {
  readonly plan: ActionPlan
  readonly onView: (planId: string) => void
  readonly onEdit: (plan: ActionPlan) => void
  readonly onDelete: (planId: string, planTitle: string) => void
  readonly isDeleting: boolean
}

function ActionPlanCard({ plan, onView, onEdit, onDelete, isDeleting }: ActionPlanCardProps) {
  const totalItems = plan.actionItems?.length || 0
  const completedItems = plan.actionItems?.filter((item: ActionItem) => item.completedAt !== null && item.completedAt !== undefined).length || 0
  
  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{plan.title}</CardTitle>
            <CardDescription className="mt-1">
              {plan.description || 'No description'}
            </CardDescription>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(plan.id)}
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(plan)}
              title="Edit plan"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(plan.id, plan.title)}
              title="Delete plan"
              className="text-red-600 hover:text-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900">
                {completedItems}/{totalItems} items
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${getProgressPercentage(completedItems, totalItems)}%`,
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {getProgressPercentage(completedItems, totalItems)}% complete
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Created: {format(new Date(plan.createdAt), 'MMM d, yyyy')}
            </div>
            <div>
              Updated: {format(new Date(plan.updatedAt), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ActionPlansPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSystem, setFilterSystem] = useState('all')
  const [isActionPlanModalOpen, setIsActionPlanModalOpen] = useState(false)
  const [selectedActionPlan, setSelectedActionPlan] = useState<ActionPlan | undefined>(undefined)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const { toast } = useToast()
  const router = useRouter()

  const { data: actionPlans, isLoading, error } = useAdminActionPlans()
  const { data: users } = useUsers()
  const deleteActionPlanMutation = useDeleteActionPlan()
  const createActionPlanMutation = useCreateActionPlan()
  const updateActionPlanMutation = useUpdateActionPlan()

  // Client-side filtering for search and status (since we're using admin endpoint now)
  const filteredPlans = useMemo(() => {
    if (!actionPlans) return []
    
    return actionPlans.filter(plan => {
      const matchesSearch = !searchTerm || 
        plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || plan.status === filterStatus
      const matchesSystem = filterSystem === 'all' // System filtering available but not used in admin view
      
      return matchesSearch && matchesStatus && matchesSystem
    })
  }, [actionPlans, searchTerm, filterStatus, filterSystem])

  const handleViewPlan = (planId: string) => {
    router.push(`/action-plans/${planId}`)
  }

  const handleEditPlan = (plan: ActionPlan) => {
    setSelectedActionPlan(plan)
    setModalMode('edit')
    setIsActionPlanModalOpen(true)
  }

  const handleDeletePlan = async (planId: string, planTitle: string) => {
    if (confirm(`Are you sure you want to delete "${planTitle}"?`)) {
      try {
        await deleteActionPlanMutation.mutateAsync(planId)
        toast({
          title: 'Action plan deleted',
          description: `${planTitle} has been deleted successfully`,
        })
      } catch (error) {
        console.error('Failed to delete action plan:', error)
        toast({
          title: 'Delete failed',
          description: 'Failed to delete action plan',
          variant: 'destructive',
        })
      }
    }
  }

  const handleCreatePlan = () => {
    setSelectedActionPlan(undefined)
    setModalMode('create')
    setIsActionPlanModalOpen(true)
  }
  
  const handleActionPlanSubmit = async (data: any) => {
    if (modalMode === 'create') {
      await createActionPlanMutation.mutateAsync(data)
    } else if (selectedActionPlan) {
      await updateActionPlanMutation.mutateAsync({
        id: selectedActionPlan.id,
        data,
      })
    }
  }


  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Action Plans Management</h1>
            <p className="text-gray-600">Create and manage personalized action plans</p>
          </div>
          <Button onClick={handleCreatePlan}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="system" className="block text-sm font-medium text-gray-700 mb-1">
                  System
                </label>
                <select
                  id="system"
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
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setFilterStatus('all')
                    setFilterSystem('all')
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Plans Grid */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
        
        {!isLoading && error && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-600">Failed to load action plans</p>
            </CardContent>
          </Card>
        )}
        
        {!isLoading && !error && filteredPlans.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No action plans found matching your criteria</p>
            </CardContent>
          </Card>
        )}
        
        {!isLoading && !error && filteredPlans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <ActionPlanCard 
                key={plan.id} 
                plan={plan}
                onView={handleViewPlan}
                onEdit={handleEditPlan}
                onDelete={handleDeletePlan}
                isDeleting={deleteActionPlanMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Plans</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {actionPlans?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">With Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {actionPlans?.filter(p => p.actionItems && p.actionItems.length > 0).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {actionPlans?.reduce((sum, p) => sum + (p.actionItems?.length || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-purple-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {actionPlans?.reduce((sum, p) => 
                      sum + (p.actionItems?.filter((item: ActionItem) => item.completedAt !== null && item.completedAt !== undefined).length || 0), 0
                    ) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Plan Modal */}
      <ActionPlanModal
        open={isActionPlanModalOpen}
        onOpenChange={setIsActionPlanModalOpen}
        actionPlan={selectedActionPlan}
        mode={modalMode}
        onSubmit={handleActionPlanSubmit}
        users={users || []}
      />
    </AdminLayout>
  )
}
