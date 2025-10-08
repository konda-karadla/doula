'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Plus, 
  Target, 
  Calendar,
  Star,
  Sparkles,
  Brain
} from 'lucide-react'

const actionPlanSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['nutrition', 'exercise', 'lifestyle', 'medical', 'wellness']),
  priority: z.enum(['low', 'medium', 'high']),
  targetDate: z.string().optional(),
  goal: z.string().min(1, 'Goal is required'),
})

type ActionPlanFormData = z.infer<typeof actionPlanSchema>

interface ActionItem {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
}

interface ActionPlanCreatorProps {
  onClose: () => void
}

export function ActionPlanCreator({ onClose }: ActionPlanCreatorProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [currentItem, setCurrentItem] = useState({ title: '', description: '', priority: 'medium' as const })
  const [showAIInsights, setShowAIInsights] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ActionPlanFormData>({
    resolver: zodResolver(actionPlanSchema),
  })

  const watchedCategory = watch('category')

  const addActionItem = () => {
    if (currentItem.title.trim()) {
      const newItem: ActionItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...currentItem,
      }
      setActionItems(prev => [...prev, newItem])
      setCurrentItem({ title: '', description: '', priority: 'medium' })
    }
  }

  const removeActionItem = (id: string) => {
    setActionItems(prev => prev.filter(item => item.id !== id))
  }

  const generateAIInsights = () => {
    setShowAIInsights(true)
    
    // Show loading state
    setAiRecommendations(['Loading AI recommendations...'])
    
    // Simulate real-time AI processing
    setTimeout(() => {
      const recommendations = {
        nutrition: [
          'Increase daily water intake to 8-10 glasses',
          'Add more leafy green vegetables to your diet',
          'Reduce processed sugar consumption',
          'Include omega-3 rich foods like fish or flaxseeds',
          'Plan weekly meal prep for consistency',
          'Track macronutrient intake daily'
        ],
        exercise: [
          'Start with 20-30 minutes of moderate activity daily',
          'Include both cardio and strength training',
          'Track your heart rate during workouts',
          'Allow rest days for muscle recovery',
          'Set progressive goals for strength gains',
          'Warm up properly before each session'
        ],
        lifestyle: [
          'Establish a consistent sleep schedule',
          'Practice stress-reduction techniques daily',
          'Limit screen time before bed',
          'Create a relaxing bedtime routine',
          'Maintain regular meal times',
          'Create a dedicated workspace for focus'
        ],
        medical: [
          'Follow prescribed medication schedule',
          'Monitor vital signs regularly',
          'Attend all scheduled medical appointments',
          'Keep a symptom diary',
          'Track medication side effects',
          'Maintain emergency contact information'
        ],
        wellness: [
          'Practice mindfulness meditation daily',
          'Engage in activities that bring joy',
          'Maintain social connections',
          'Set aside time for self-care',
          'Practice gratitude journaling',
          'Engage in creative hobbies weekly'
        ]
      }
      
      const categoryRecs = recommendations[watchedCategory as keyof typeof recommendations] || []
      // Randomly select 4-6 recommendations for variety
      const shuffled = categoryRecs.sort(() => 0.5 - Math.random())
      setAiRecommendations(shuffled.slice(0, Math.floor(Math.random() * 3) + 4))
    }, 1500) // Simulate AI processing time
  }

  const onSubmit = (data: ActionPlanFormData) => {
    // Show confirmation dialog
    const confirmed = confirm(`📋 Create Action Plan: "${data.title}"?

🎯 Category: ${data.category}
📊 Action Items: ${actionItems.length}
⏰ Target Date: ${data.targetDate || 'Not set'}
⭐ Priority: ${data.priority}

Click OK to create your action plan.`)
    
    if (!confirmed) return
    
    const actionPlan = {
      ...data,
      actionItems,
      aiRecommendations,
      createdAt: new Date(),
      id: Math.random().toString(36).substr(2, 9),
    }
    
    console.log('Creating action plan:', actionPlan)
    
    // Show success message with more details
    alert(`✅ Action Plan Created Successfully!

📋 Plan: ${data.title}
🎯 Category: ${data.category}
📊 Action Items: ${actionItems.length}
⏰ Target Date: ${data.targetDate || 'Not set'}

Your action plan is now active and ready to track!`)
    
    onClose()
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Create Action Plan
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Plan Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Nutrition Optimization Plan"
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe what this action plan aims to achieve..."
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Primary Goal</Label>
                  <Input
                    id="goal"
                    placeholder="e.g., Improve blood sugar levels"
                    {...register('goal')}
                  />
                  {errors.goal && (
                    <p className="text-sm text-destructive">{errors.goal.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    {...register('category')}
                  >
                    <option value="">Select category</option>
                    <option value="nutrition">🥗 Nutrition</option>
                    <option value="exercise">🏃 Exercise</option>
                    <option value="lifestyle">🏠 Lifestyle</option>
                    <option value="medical">🏥 Medical</option>
                    <option value="wellness">🧘 Wellness</option>
                  </select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    {...register('priority')}
                  >
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🔴 High Priority</option>
                  </select>
                  {errors.priority && (
                    <p className="text-sm text-destructive">{errors.priority.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Completion Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    {...register('targetDate')}
                  />
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Action Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateAIInsights}
                  className="flex items-center"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Get AI Suggestions
                </Button>
              </div>

              {/* AI Recommendations */}
              {showAIInsights && aiRecommendations.length > 0 && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Sparkles className="w-4 h-4 text-indigo-600 mr-2" />
                    <h4 className="font-medium text-indigo-900 dark:text-indigo-100">AI Recommendations</h4>
                    {aiRecommendations[0] === 'Loading AI recommendations...' && (
                      <div className="ml-2 w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {aiRecommendations.map((recommendation, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`text-left p-2 rounded border transition-colors ${
                          recommendation === 'Loading AI recommendations...'
                            ? 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-not-allowed'
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (recommendation !== 'Loading AI recommendations...') {
                            setCurrentItem(prev => ({
                              ...prev,
                              title: recommendation,
                              description: 'AI-generated recommendation'
                            }))
                          }
                        }}
                        disabled={recommendation === 'Loading AI recommendations...'}
                      >
                        <p className="text-sm text-slate-700 dark:text-slate-300">{recommendation}</p>
                        {recommendation !== 'Loading AI recommendations...' && (
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                            Click to add as action item
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Action Item */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <Label htmlFor="itemTitle">Item Title</Label>
                  <Input
                    id="itemTitle"
                    placeholder="e.g., Drink 8 glasses of water"
                    value={currentItem.title}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="itemDescription">Description</Label>
                  <Input
                    id="itemDescription"
                    placeholder="Optional description"
                    value={currentItem.description}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="itemPriority">Priority</Label>
                    <select
                      id="itemPriority"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      value={currentItem.priority}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <Button type="button" onClick={addActionItem} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Action Items List */}
              <div className="space-y-2">
                {actionItems.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeActionItem(item.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="text-sm text-muted-foreground">
                {actionItems.length > 0 ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✅ {actionItems.length} action item{actionItems.length > 1 ? 's' : ''} ready
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">
                    ⚠️ Add at least one action item to create plan
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={actionItems.length === 0}
                  className="min-w-[160px]"
                >
                  {actionItems.length === 0 ? 'Add Items First' : 'Create Action Plan'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
