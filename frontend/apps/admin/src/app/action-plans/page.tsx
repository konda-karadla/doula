'use client'

import { useState, useMemo } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Search, Plus, Edit, Trash2, Eye, Filter, Target, Users, Calendar, Loader2 } from 'lucide-react'
import { useActionPlans, useDeleteActionPlan, useActionItems } from '@/hooks/use-admin-api'
import { format } from 'date-fns'

export default function ActionPlansPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSystem, setFilterSystem] = useState('all')
  const { toast } = useToast()

  const { data: actionPlans, isLoading, error } = useActionPlans()
  const deleteActionPlanMutation = useDeleteActionPlan()

  const filteredPlans = useMemo(() => {
    if (!actionPlans) return []
    
    return actionPlans.filter(plan => {
      const matchesSearch = plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
      // Note: Status and system filtering would need additional data
      const matchesStatus = filterStatus === 'all' // TODO: Add status when available
      const matchesSystem = filterSystem === 'all' // TODO: Add system filtering when user data available
      
      return matchesSearch && matchesStatus && matchesSystem
    })
  }, [actionPlans, searchTerm, filterStatus, filterSystem])

  const handleViewPlan = (planId: string) => {
    // TODO: Navigate to action plan detail page
    toast({
      title: 'View action plan',
      description: 'Action plan details will be displayed',
    })
  }

  const handleEditPlan = (planId: string) => {
    // TODO: Navigate to action plan editor
    toast({
      title: 'Edit action plan',
      description: 'Action plan editor will be opened',
    })
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
        toast({
          title: 'Delete failed',
          description: 'Failed to delete action plan',
          variant: 'destructive',
        })
      }
    }
  }

  const handleCreatePlan = () => {
    // TODO: Open action plan creation modal/page
    toast({
      title: 'Create action plan',
      description: 'Action plan creation form will be opened',
    })
  }

  const getProgressPercentage = (completedCount: number, totalCount: number) => {
    if (totalCount === 0) return 0
    return Math.round((completedCount / totalCount) * 100)
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'completed':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getSystemBadge = (system: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    switch (system) {
      case 'doula':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'functional_health':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'elderly_care':
        return `${baseClasses} bg-orange-100 text-orange-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  // Action Plan Item component to encapsulate each card
  const ActionPlanCard = ({ plan }: { plan: any }) => {
    // Count items for this plan (would need useActionItems hook)
    const totalItems = plan.items?.length || 0
    const completedItems = plan.items?.filter((item: any) => item.status === 'completed').length || 0

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
                onClick={() => handleViewPlan(plan.id)}
                title="View plan"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditPlan(plan.id)}
                title="Edit plan"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeletePlan(plan.id, plan.title)}
                title="Delete plan"
                className="text-red-600 hover:text-red-700"
                disabled={deleteActionPlanMutation.isPending}
              >
                {deleteActionPlanMutation.isPending ? (
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
            {/* Progress */}
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

            {/* Dates */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System
                </label>
                <select
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
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-600">Failed to load action plans</p>
            </CardContent>
          </Card>
        ) : filteredPlans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No action plans found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <ActionPlanCard key={plan.id} plan={plan} />
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
                    {actionPlans?.filter(p => p.items && p.items.length > 0).length || 0}
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
                    {actionPlans?.reduce((sum, p) => sum + (p.items?.length || 0), 0) || 0}
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
                      sum + (p.items?.filter((item: any) => item.status === 'completed').length || 0), 0
                    ) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
