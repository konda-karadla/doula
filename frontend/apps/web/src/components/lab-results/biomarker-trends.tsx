'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HealthChart } from '@/components/dashboard/health-chart'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface BiomarkerTrendsProps {
  readonly labResultId: string
}

// Mock trend data
const mockTrendData = {
  'White Blood Cell Count': [
    { name: 'Jul', value: 7.2 },
    { name: 'Aug', value: 7.8 },
    { name: 'Sep', value: 8.1 },
    { name: 'Oct', value: 7.5 },
    { name: 'Nov', value: 7.9 },
    { name: 'Dec', value: 8.5 }
  ],
  'Hemoglobin': [
    { name: 'Jul', value: 13.2 },
    { name: 'Aug', value: 13.5 },
    { name: 'Sep', value: 13.3 },
    { name: 'Oct', value: 13.6 },
    { name: 'Nov', value: 13.4 },
    { name: 'Dec', value: 13.8 }
  ],
  'Platelet Count': [
    { name: 'Jul', value: 320 },
    { name: 'Aug', value: 315 },
    { name: 'Sep', value: 305 },
    { name: 'Oct', value: 295 },
    { name: 'Nov', value: 310 },
    { name: 'Dec', value: 285 }
  ]
}

const mockBiomarkerSummary = [
  {
    name: 'White Blood Cell Count',
    currentValue: 8.5,
    previousValue: 7.2,
    unit: 'K/μL',
    trend: 'up' as const,
    change: '+18.1%',
    status: 'normal' as const
  },
  {
    name: 'Hemoglobin',
    currentValue: 13.8,
    previousValue: 13.2,
    unit: 'g/dL',
    trend: 'up' as const,
    change: '+4.5%',
    status: 'normal' as const
  },
  {
    name: 'Platelet Count',
    currentValue: 285,
    previousValue: 320,
    unit: 'K/μL',
    trend: 'down' as const,
    change: '-10.9%',
    status: 'normal' as const
  }
]

export function BiomarkerTrends({ }: BiomarkerTrendsProps) {
  const [selectedBiomarker, setSelectedBiomarker] = useState('White Blood Cell Count')

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: 'normal' | 'high' | 'low' | 'critical') => {
    switch (status) {
      case 'normal':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Normal</Badge>
      case 'high':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">High</Badge>
      case 'low':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Low</Badge>
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Biomarker Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Biomarker for Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockBiomarkerSummary.map((biomarker) => (
              <Card 
                key={biomarker.name}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedBiomarker === biomarker.name 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedBiomarker(biomarker.name)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{biomarker.name}</h4>
                    {getTrendIcon(biomarker.trend)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">
                      {biomarker.currentValue} {biomarker.unit}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${getTrendColor(biomarker.trend)}`}>
                        {biomarker.change}
                      </span>
                      {getStatusBadge(biomarker.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Previous: {biomarker.previousValue} {biomarker.unit}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <HealthChart
        title={`${selectedBiomarker} - 6 Month Trend`}
        data={mockTrendData[selectedBiomarker as keyof typeof mockTrendData] || []}
        type="line"
      />

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                {selectedBiomarker}
              </h4>
              <p className="text-blue-800 dark:text-blue-400 text-sm">
                {selectedBiomarker === 'White Blood Cell Count' && 
                  "Your white blood cell count has been trending upward over the past 6 months, indicating a healthy immune response. This could be due to recent vaccinations or minor infections."
                }
                {selectedBiomarker === 'Hemoglobin' && 
                  "Hemoglobin levels have shown a gradual improvement, suggesting better iron status and overall blood health."
                }
                {selectedBiomarker === 'Platelet Count' && 
                  "Platelet count has decreased slightly but remains well within normal range. This is not concerning and may be due to natural variation."
                }
              </p>
            </div>
            
            <div className="space-y-3">
              <h5 className="font-medium">Key Insights:</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  All values remain within normal reference ranges
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  No critical values detected in recent testing
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
                  Continue monitoring for any significant changes
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h5 className="font-medium text-green-900 dark:text-green-100 mb-1">
                  Maintain Current Habits
                </h5>
                <p className="text-sm text-green-800 dark:text-green-400">
                  Your current lifestyle and diet appear to be supporting healthy biomarker levels.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Regular Monitoring
                </h5>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  Continue with regular lab testing every 3-6 months to track trends.
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-1">
                  Lifestyle Optimization
                </h5>
                <p className="text-sm text-purple-800 dark:text-purple-400">
                  Consider iron-rich foods and regular exercise to maintain optimal levels.
                </p>
              </div>
            </div>
            
            <Button className="w-full">
              Create Action Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
