'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'

interface Biomarker {
  name: string
  value: string
  unit: string
  referenceRange: string
  status: 'normal' | 'high' | 'low' | 'critical'
  trend?: 'up' | 'down' | 'stable'
  previousValue?: string
}

interface LabResultDetailProps {
  labResultId: string
}

// Mock data
const mockLabResult = {
  id: '1',
  title: 'Complete Blood Count (CBC)',
  date: new Date('2024-01-15'),
  status: 'processed',
  fileSize: '2.3 MB',
  insights: 'Most values are within normal range. White blood cell count is slightly elevated, which may indicate a mild infection or inflammatory response.',
  criticalValues: 0,
  biomarkers: [
    {
      name: 'White Blood Cell Count',
      value: '8.5',
      unit: 'K/μL',
      referenceRange: '4.5 - 11.0',
      status: 'normal' as const,
      trend: 'up' as const,
      previousValue: '7.2'
    },
    {
      name: 'Red Blood Cell Count',
      value: '4.2',
      unit: 'M/μL',
      referenceRange: '4.0 - 5.2',
      status: 'normal' as const,
      trend: 'stable' as const,
      previousValue: '4.1'
    },
    {
      name: 'Hemoglobin',
      value: '13.8',
      unit: 'g/dL',
      referenceRange: '12.0 - 16.0',
      status: 'normal' as const,
      trend: 'up' as const,
      previousValue: '13.2'
    },
    {
      name: 'Hematocrit',
      value: '41.2',
      unit: '%',
      referenceRange: '36.0 - 46.0',
      status: 'normal' as const,
      trend: 'stable' as const,
      previousValue: '40.8'
    },
    {
      name: 'Platelet Count',
      value: '285',
      unit: 'K/μL',
      referenceRange: '150 - 450',
      status: 'normal' as const,
      trend: 'down' as const,
      previousValue: '320'
    }
  ] as Biomarker[]
}

export function LabResultDetail({ labResultId }: LabResultDetailProps) {
  const [viewMode, setViewMode] = useState<'pdf' | 'data'>('data')
  
  // Differentiate mock content per id so pages are visibly different
  const titleById: Record<string, string> = {
    '1': 'Complete Blood Count (CBC)',
    '2': 'Lipid Panel',
  }
  const effectiveTitle = titleById[labResultId] || `${mockLabResult.title} (ID: ${labResultId})`

  const getStatusIcon = (status: Biomarker['status']) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'high':
      case 'low':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: Biomarker['status']) => {
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

  const getTrendIcon = (trend: Biomarker['trend']) => {
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

  return (
    <div className="space-y-6">
      {/* Lab Result Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>{effectiveTitle}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(mockLabResult.date, 'MMMM dd, yyyy')}
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Dr. Smith
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'data' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('data')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Data View
              </Button>
              <Button
                variant={viewMode === 'pdf' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('pdf')}
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF View
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'data' ? (
            <div className="space-y-6">
              {/* Insights */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">AI Insights</h4>
                <p className="text-blue-800 dark:text-blue-400 text-sm">
                  {mockLabResult.insights}
                </p>
              </div>

              {/* Biomarkers Table */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Biomarkers</h4>
                <div className="space-y-3">
                  {mockLabResult.biomarkers.map((biomarker, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(biomarker.status)}
                        <div>
                          <p className="font-medium">{biomarker.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Reference: {biomarker.referenceRange} {biomarker.unit}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {biomarker.value} {biomarker.unit}
                          </p>
                          {biomarker.previousValue && (
                            <p className="text-sm text-muted-foreground">
                              Previous: {biomarker.previousValue} {biomarker.unit}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {biomarker.trend && getTrendIcon(biomarker.trend)}
                          {getStatusBadge(biomarker.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  PDF Viewer
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  PDF viewer would be integrated here using a library like react-pdf
                </p>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Download Original PDF
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Biomarkers</p>
                <p className="text-2xl font-bold">{mockLabResult.biomarkers.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Normal Values</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockLabResult.biomarkers.filter(b => b.status === 'normal').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abnormal Values</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {mockLabResult.biomarkers.filter(b => b.status !== 'normal').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">File Size</p>
                <p className="text-2xl font-bold">{mockLabResult.fileSize}</p>
              </div>
              <Download className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
