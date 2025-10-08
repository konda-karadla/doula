'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Star,
  Brain,
  TrendingUp,
  AlertCircle,
  Plus,
  Edit
} from 'lucide-react'
import { format } from 'date-fns'

interface ActionItem {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
  completedDate?: Date
}

interface ActionPlanDetailProps {
  actionPlanId: string
}

// Mock data
const mockActionPlan = {
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
  goal: 'Improve blood sugar levels and overall nutritional status',
  aiInsights: 'Based on your lab results, focus on increasing iron-rich foods and reducing processed sugars. Your current progress shows good adherence to dietary changes.',
  expertRecommendations: [
    'Increase leafy green vegetables to 3+ servings daily',
    'Reduce processed foods and added sugars',
    'Monitor blood sugar levels weekly',
    'Include omega-3 rich foods 2-3 times per week'
  ],
  actionItems: [
    {
      id: '1',
      title: 'Drink 8 glasses of water daily',
      description: 'Maintain proper hydration for optimal health',
      completed: true,
      priority: 'high',
      completedDate: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Eat 5 servings of vegetables daily',
      description: 'Focus on leafy greens and colorful vegetables',
      completed: true,
      priority: 'high',
      completedDate: new Date('2024-01-20')
    },
    {
      id: '3',
      title: 'Reduce processed sugar intake',
      description: 'Limit added sugars to less than 25g per day',
      completed: false,
      priority: 'high'
    },
    {
      id: '4',
      title: 'Include lean protein in every meal',
      description: 'Aim for 20-30g protein per meal',
      completed: true,
      priority: 'medium',
      completedDate: new Date('2024-01-18')
    },
    {
      id: '5',
      title: 'Plan weekly meal prep',
      description: 'Prepare healthy meals in advance',
      completed: false,
      priority: 'medium'
    },
    {
      id: '6',
      title: 'Track daily food intake',
      description: 'Use food diary or app to monitor nutrition',
      completed: true,
      priority: 'low',
      completedDate: new Date('2024-01-12')
    }
  ] as ActionItem[]
}

export function ActionPlanDetail({ actionPlanId }: ActionPlanDetailProps) {
  const [newItem, setNewItem] = useState({ title: '', description: '', priority: 'medium' as const })
  
  // Differentiate mock content per id so pages are visibly different
  const titleById: Record<string, string> = {
    '1': 'Nutrition Optimization Plan',
    '2': 'Exercise Routine Plan',
  }
  const effectiveTitle = titleById[actionPlanId] || `${mockActionPlan.title} (ID: ${actionPlanId})`

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Completed</Badge>
      case 'paused':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Paused</Badge>
      default:
        return <Badge variant="outline">Draft</Badge>
    }
  }

  const getPriorityIcon = (priority: string) => {
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

  const getCategoryIcon = (category: string) => {
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

  const toggleItemCompletion = (itemId: string) => {
    // In a real app, this would update the backend
    console.log('Toggling completion for item:', itemId)
  }

  const addNewItem = () => {
    if (newItem.title.trim()) {
      console.log('Adding new item:', newItem)
      setNewItem({ title: '', description: '', priority: 'medium' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{getCategoryIcon(mockActionPlan.category)}</span>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{effectiveTitle}</span>
                  {getPriorityIcon(mockActionPlan.priority)}
                </CardTitle>
                <div className="flex items-center space-x-4 mt-2">
                  {getStatusBadge(mockActionPlan.status)}
                  <span className="text-sm text-muted-foreground capitalize">
                    {mockActionPlan.category} • {mockActionPlan.priority} priority
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{mockActionPlan.progress}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{mockActionPlan.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Goal</p>
                <p className="text-sm text-muted-foreground">{mockActionPlan.goal}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {format(mockActionPlan.createdDate, 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Target Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(mockActionPlan.targetDate, 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{mockActionPlan.totalItems}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{mockActionPlan.completedItems}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mockActionPlan.totalItems - mockActionPlan.completedItems}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold text-purple-600">{mockActionPlan.progress}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-500" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-blue-800 dark:text-blue-400">
              {mockActionPlan.aiInsights}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Expert Recommendations</h4>
            <div className="space-y-2">
              {mockActionPlan.expertRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Action Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Item */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <input
                type="text"
                placeholder="New action item..."
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                value={newItem.title}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Description (optional)"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex space-x-2">
              <select
                className="flex-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                value={newItem.priority}
                onChange={(e) => setNewItem(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <Button size="sm" onClick={addNewItem}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Items List */}
          <div className="space-y-3">
            {mockActionPlan.actionItems.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleItemCompletion(item.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      item.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {item.completed && <CheckCircle className="w-3 h-3" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <h4 className={`font-medium ${item.completed ? 'line-through text-gray-500' : ''}`}>
                        {item.title}
                      </h4>
                      {getPriorityIcon(item.priority)}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                    {item.completedDate && (
                      <p className="text-xs text-green-600 mt-1">
                        Completed on {format(item.completedDate, 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="capitalize">
                    {item.priority}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
