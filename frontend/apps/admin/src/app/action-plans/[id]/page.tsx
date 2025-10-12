'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus, 
  CheckCircle, 
  Circle, 
  Calendar,
  Target,
  User,
  Loader2
} from 'lucide-react'
import { useActionPlan, useActionItems } from '@/hooks/use-admin-api'
import { format } from 'date-fns'
import type { ActionItem } from '@health-platform/types'

export default function ActionPlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const planId = params.id as string

  const { data: actionPlan, isLoading: planLoading } = useActionPlan(planId)
  const { data: actionItems, isLoading: itemsLoading } = useActionItems(planId)

  const [isEditingPlan, setIsEditingPlan] = useState(false)

  const isLoading = planLoading || itemsLoading

  const completedCount = actionItems?.filter(item => item.completedAt)?.length || 0
  const totalCount = actionItems?.length || 0
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleBack = () => {
    router.push('/action-plans')
  }

  const handleEditPlan = () => {
    setIsEditingPlan(true)
  }

  const handleAddItem = () => {
    toast({
      title: 'Add Action Item',
      description: 'Action item creation will be implemented',
    })
  }

  const handleEditItem = (item: ActionItem) => {
    toast({
      title: 'Edit Action Item',
      description: `Editing ${item.title}`,
    })
  }

  const handleDeleteItem = (item: ActionItem) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      toast({
        title: 'Item deleted',
        description: `${item.title} has been deleted`,
      })
    }
  }

  const handleToggleComplete = (item: ActionItem) => {
    toast({
      title: item.completedAt ? 'Marked incomplete' : 'Marked complete',
      description: item.title,
    })
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'completed':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'archived':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getPriorityBadge = (priority: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    switch (priority) {
      case 'urgent':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    )
  }

  if (!actionPlan) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-600">Action plan not found</p>
          <Button onClick={handleBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{actionPlan.title}</h1>
              <p className="text-sm text-gray-600">
                Created {format(new Date(actionPlan.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleEditPlan}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Plan
            </Button>
          </div>
        </div>

        {/* Plan Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-2">
                    <span className={getStatusBadge(actionPlan.status)}>
                      {actionPlan.status}
                    </span>
                  </div>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{progressPercentage}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {completedCount} of {totalCount} items
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assigned User</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">
                    {actionPlan.user?.username || actionPlan.user?.email || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">{actionPlan.user?.email}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {actionPlan.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{actionPlan.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">Overall Progress</span>
                <span className="text-gray-600">
                  {completedCount}/{totalCount} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Action Items</CardTitle>
                <CardDescription>Tasks and activities for this plan</CardDescription>
              </div>
              <Button onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!actionItems || actionItems.length === 0 ? (
              <div className="text-center py-8">
                <Circle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No action items yet</p>
                <Button onClick={handleAddItem} variant="outline" className="mt-4">
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <button
                      onClick={() => handleToggleComplete(item)}
                      className="mt-1 flex-shrink-0"
                      type="button"
                    >
                      {item.completedAt ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-medium ${item.completedAt ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={getPriorityBadge(item.priority)}>
                              {item.priority}
                            </span>
                            {item.dueDate && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Due: {format(new Date(item.dueDate), 'MMM d, yyyy')}
                              </span>
                            )}
                            {item.completedAt && (
                              <span className="text-xs text-green-600">
                                Completed: {format(new Date(item.completedAt), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-1 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditItem(item)}
                            title="Edit item"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteItem(item)}
                            title="Delete item"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Plan Created</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(actionPlan.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Last Updated</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(actionPlan.updatedAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

