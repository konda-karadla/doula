'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  Calendar, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Star,
  MoreHorizontal,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'

interface ActionItem {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
}

interface ActionPlan {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'paused' | 'draft'
  priority: 'low' | 'medium' | 'high'
  createdDate: Date
  targetDate?: Date
  progress: number
  totalItems: number
  completedItems: number
  category: 'nutrition' | 'exercise' | 'lifestyle' | 'medical' | 'wellness'
  aiInsights?: string
  expertRecommendations?: string[]
}

// Mock data
const mockActionPlans: ActionPlan[] = [
  {
    id: '1',
    title: 'Nutrition Optimization Plan',
    description: 'Improve your dietary habits and nutrient intake for better health outcomes',
    status: 'active',
    priority: 'high',
    createdDate: new Date('2024-01-10'),
    targetDate: new Date('2024-03-10'),
    progress: 65,
    totalItems: 12,
    completedItems: 8,
    category: 'nutrition',
    aiInsights: 'Based on your lab results, focus on increasing iron-rich foods and reducing processed sugars.',
    expertRecommendations: [
      'Increase leafy green vegetables',
      'Reduce processed foods',
      'Monitor blood sugar levels'
    ]
  },
  {
    id: '2',
    title: 'Exercise Routine Development',
    description: 'Build a sustainable exercise routine to improve cardiovascular health',
    status: 'active',
    priority: 'medium',
    createdDate: new Date('2024-01-15'),
    targetDate: new Date('2024-04-15'),
    progress: 40,
    totalItems: 8,
    completedItems: 3,
    category: 'exercise',
    aiInsights: 'Your current activity level suggests starting with low-impact exercises and gradually increasing intensity.',
    expertRecommendations: [
      'Start with 20 minutes daily walks',
      'Include strength training 2x per week',
      'Track heart rate during exercise'
    ]
  },
  {
    id: '3',
    title: 'Sleep Optimization',
    description: 'Improve sleep quality and establish healthy sleep patterns',
    status: 'paused',
    priority: 'medium',
    createdDate: new Date('2024-01-05'),
    targetDate: new Date('2024-02-05'),
    progress: 25,
    totalItems: 6,
    completedItems: 1,
    category: 'lifestyle',
    aiInsights: 'Poor sleep quality may be affecting your energy levels and recovery.',
    expertRecommendations: [
      'Establish consistent bedtime routine',
      'Limit screen time before bed',
      'Create optimal sleep environment'
    ]
  },
  {
    id: '4',
    title: 'Stress Management Techniques',
    description: 'Learn and practice effective stress reduction methods',
    status: 'completed',
    priority: 'low',
    createdDate: new Date('2023-12-01'),
    targetDate: new Date('2024-01-01'),
    progress: 100,
    totalItems: 5,
    completedItems: 5,
    category: 'wellness',
    aiInsights: 'Excellent progress on stress management! Continue practicing these techniques.',
    expertRecommendations: [
      'Continue daily meditation',
      'Practice deep breathing exercises',
      'Maintain work-life balance'
    ]
  }
]

export function ActionPlansList() {
  const router = useRouter()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<'bottom' | 'top'>('bottom')

  const getStatusBadge = (status: ActionPlan['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Completed</Badge>
      case 'paused':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Paused</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      default:
        return null
    }
  }

  const getPriorityIcon = (priority: ActionPlan['priority']) => {
    switch (priority) {
      case 'high':
        return <Star className="w-4 h-4 text-red-500 fill-current" />
      case 'medium':
        return <Star className="w-4 h-4 text-yellow-500 fill-current" />
      case 'low':
        return <Star className="w-4 h-4 text-gray-400 fill-current" />
      default:
        return null
    }
  }

  const getCategoryIcon = (category: ActionPlan['category']) => {
    switch (category) {
      case 'nutrition':
        return '🥗'
      case 'exercise':
        return '🏃'
      case 'lifestyle':
        return '🏠'
      case 'medical':
        return '🏥'
      case 'wellness':
        return '🧘'
      default:
        return '📋'
    }
  }

  const calculateMenuPosition = (buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const menuHeight = 280 // Approximate height of the menu with all options
    
    // Check if there's enough space below the button
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top
    
    // If not enough space below but enough space above, position menu above
    if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
      return 'top'
    }
    
    return 'bottom'
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Plans</p>
                <p className="text-2xl font-bold">{mockActionPlans.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockActionPlans.filter(p => p.status === 'active').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockActionPlans.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(mockActionPlans.filter(p => p.status === 'active').reduce((sum, p) => sum + p.progress, 0) / mockActionPlans.filter(p => p.status === 'active').length) || 0}%
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockActionPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`transition-all duration-200 hover:shadow-md`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getCategoryIcon(plan.category)}</span>
                  <div>
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      {getPriorityIcon(plan.priority)}
                      <span className="text-xs text-muted-foreground capitalize">{plan.priority}</span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(plan.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {plan.description}
              </p>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{plan.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{plan.completedItems} of {plan.totalItems} items</span>
                  <span>{plan.totalItems - plan.completedItems} remaining</span>
                </div>
              </div>
              
              {/* AI Insights */}
              {plan.aiInsights && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-xs text-blue-800 dark:text-blue-400 line-clamp-2">
                      {plan.aiInsights}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Date Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Created {format(plan.createdDate, 'MMM dd')}
                </div>
                {plan.targetDate && (
                  <div className="flex items-center">
                    <Target className="w-3 h-3 mr-1" />
                    Due {format(plan.targetDate, 'MMM dd')}
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2 relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/action-plans/${plan.id}`)
                  }}
                >
                  View Details
                </Button>
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (openMenuId === plan.id) {
                        setOpenMenuId(null)
                      } else {
                        const position = calculateMenuPosition(e.currentTarget)
                        setMenuPosition(position)
                        setOpenMenuId(plan.id)
                      }
                    }}
                    aria-haspopup="menu"
                    aria-expanded={openMenuId === plan.id}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                  {openMenuId === plan.id && (
                    <div
                      role="menu"
                      className={`absolute right-0 z-10 w-44 rounded-md border bg-white dark:bg-gray-800 shadow-lg py-1 text-sm ${
                        menuPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                      }`}
                    >
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('Edit plan:', plan.id)
                          setOpenMenuId(null)
                        }}
                      >
                        Edit
                      </button>
                      <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400">Change status</div>
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('Mark active:', plan.id)
                          setOpenMenuId(null)
                        }}
                      >
                        Mark Active
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('Pause plan:', plan.id)
                          setOpenMenuId(null)
                        }}
                      >
                        Pause
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('Complete plan:', plan.id)
                          setOpenMenuId(null)
                        }}
                      >
                        Mark Completed
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('Duplicate plan:', plan.id)
                          setOpenMenuId(null)
                        }}
                      >
                        Duplicate
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={async (e) => {
                          e.stopPropagation()
                          try {
                            const link = `${window.location.origin}/action-plans/${plan.id}`
                            await navigator.clipboard.writeText(link)
                            console.log('Copied link to clipboard:', link)
                          } catch (err) {
                            console.warn('Clipboard not available')
                          }
                          setOpenMenuId(null)
                        }}
                      >
                        Share link
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Confirm only; no deletion implemented yet
                          const yes = window.confirm('Are you sure you want to delete this action plan?')
                          if (yes) {
                            console.log('Delete plan:', plan.id)
                          }
                          setOpenMenuId(null)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {mockActionPlans.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Action Plans Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first action plan to start improving your health with personalized recommendations.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Action Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
