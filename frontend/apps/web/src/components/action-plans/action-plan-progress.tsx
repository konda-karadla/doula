'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HealthChart } from '@/components/dashboard/health-chart'
import { 
  TrendingUp, 
  Calendar, 
  Target,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  Activity
} from 'lucide-react'
import { format } from 'date-fns'

interface ActionPlanProgressProps {
  actionPlanId: string
}

// Mock progress data
const mockProgressData = [
  { name: 'Week 1', value: 25, completed: 3, total: 12 },
  { name: 'Week 2', value: 40, completed: 5, total: 12 },
  { name: 'Week 3', value: 50, completed: 6, total: 12 },
  { name: 'Week 4', value: 58, completed: 7, total: 12 },
  { name: 'Week 5', value: 65, completed: 8, total: 12 },
  { name: 'Week 6', value: 65, completed: 8, total: 12 }
]

const mockDailyActivity = [
  { date: '2024-01-15', completed: 2, total: 3, streak: 5 },
  { date: '2024-01-16', completed: 3, total: 3, streak: 6 },
  { date: '2024-01-17', completed: 2, total: 3, streak: 7 },
  { date: '2024-01-18', completed: 3, total: 3, streak: 8 },
  { date: '2024-01-19', completed: 1, total: 3, streak: 0 },
  { date: '2024-01-20', completed: 3, total: 3, streak: 1 },
  { date: '2024-01-21', completed: 2, total: 3, streak: 2 }
]

const mockMilestones = [
  {
    id: '1',
    title: 'First Week Complete',
    description: 'Completed first week of nutrition plan',
    achieved: true,
    date: new Date('2024-01-17'),
    reward: '🏆'
  },
  {
    id: '2',
    title: 'Halfway Mark',
    description: 'Reached 50% completion',
    achieved: true,
    date: new Date('2024-01-24'),
    reward: '⭐'
  },
  {
    id: '3',
    title: '30-Day Streak',
    description: 'Maintain consistency for 30 days',
    achieved: false,
    date: new Date('2024-02-10'),
    reward: '🎯'
  },
  {
    id: '4',
    title: 'Goal Achievement',
    description: 'Complete all action items',
    achieved: false,
    date: new Date('2024-03-10'),
    reward: '🏅'
  }
]

export function ActionPlanProgress({ actionPlanId }: ActionPlanProgressProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week')

  const currentStreak = 2
  const longestStreak = 8
  const averageDailyCompletion = 75
  const totalDaysActive = 21

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">{currentStreak} days</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold text-green-600">{longestStreak} days</p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Daily</p>
                <p className="text-2xl font-bold text-blue-600">{averageDailyCompletion}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Days Active</p>
                <p className="text-2xl font-bold text-purple-600">{totalDaysActive}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Progress Over Time</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={timeRange === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('week')}
              >
                Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('month')}
              >
                Month
              </Button>
              <Button
                variant={timeRange === 'quarter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('quarter')}
              >
                Quarter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <HealthChart
            title="Weekly Progress"
            data={mockProgressData}
            type="line"
          />
        </CardContent>
      </Card>

      {/* Daily Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Daily Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockDailyActivity.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium">
                    {format(new Date(day.date), 'MMM dd')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{day.completed}/{day.total} completed</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Streak: </span>
                    <span className="font-medium">{day.streak} days</span>
                  </div>
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(day.completed / day.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Milestones & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockMilestones.map((milestone) => (
              <div 
                key={milestone.id}
                className={`p-4 rounded-lg border-2 ${
                  milestone.achieved 
                    ? 'border-green-200 bg-green-50 dark:bg-green-950/20' 
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center">
                    <span className="text-2xl mr-2">{milestone.reward}</span>
                    {milestone.title}
                  </h4>
                  {milestone.achieved ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Achieved
                    </Badge>
                  ) : (
                    <Badge variant="outline">In Progress</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  Target: {format(milestone.date, 'MMM dd, yyyy')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                🎯 Great Progress!
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                You've maintained a consistent routine for the past week. Your current streak of {currentStreak} days shows strong commitment to your health goals.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                📈 Improvement Area
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-400">
                Focus on completing all daily items to maintain your streak. Missing even one day can break momentum.
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              💡 Next Steps
            </h4>
            <ul className="text-sm text-green-800 dark:text-green-400 space-y-1">
              <li>• Aim to complete 100% of daily items for the next 3 days</li>
              <li>• Consider adding one new healthy habit to your routine</li>
              <li>• Track your energy levels to see the benefits of your changes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
