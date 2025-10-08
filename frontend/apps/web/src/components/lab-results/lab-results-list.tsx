'use client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Calendar, 
  Eye, 
  Download,
  Trash2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Upload
} from 'lucide-react'
import { format } from 'date-fns'

interface LabResult {
  id: string
  title: string
  date: Date
  status: 'processed' | 'processing' | 'pending' | 'error'
  biomarkerCount: number
  fileSize: string
  insights?: string
  criticalValues?: number
}

// Mock data - in real implementation, this would come from API
const mockLabResults: LabResult[] = [
  {
    id: '1',
    title: 'Complete Blood Count (CBC)',
    date: new Date('2024-01-15'),
    status: 'processed',
    biomarkerCount: 12,
    fileSize: '2.3 MB',
    insights: 'All values within normal range',
    criticalValues: 0
  },
  {
    id: '2',
    title: 'Lipid Panel',
    date: new Date('2024-01-10'),
    status: 'processed',
    biomarkerCount: 4,
    fileSize: '1.8 MB',
    insights: 'Cholesterol slightly elevated',
    criticalValues: 1
  },
  {
    id: '3',
    title: 'Thyroid Function Test',
    date: new Date('2024-01-05'),
    status: 'processing',
    biomarkerCount: 0,
    fileSize: '1.5 MB',
    insights: undefined,
    criticalValues: 0
  },
  {
    id: '4',
    title: 'Comprehensive Metabolic Panel',
    date: new Date('2023-12-20'),
    status: 'processed',
    biomarkerCount: 14,
    fileSize: '2.1 MB',
    insights: 'Glucose levels optimal',
    criticalValues: 0
  }
]

interface LabResultsListProps {
  filters?: {
    search?: string
    status?: string[]
    dateRange?: { from: string; to: string }
    biomarkerCount?: { min: string; max: string }
  }
}

export function LabResultsList({ filters }: LabResultsListProps = {}) {
  const router = useRouter()

  // Filter lab results based on applied filters
  const filteredResults = mockLabResults.filter(result => {
  
    if (!filters) return true

    // Search filter
    if (filters.search && !result.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }

    // Status filter
    if (filters.status && filters.status.length > 0 && !filters.status.includes(result.status)) {
      return false
    }

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      const resultDate = result.date
      if (filters.dateRange.from && resultDate < new Date(filters.dateRange.from)) {
        return false
      }
      if (filters.dateRange.to && resultDate > new Date(filters.dateRange.to)) {
        return false
      }
    }

    // Biomarker count filter
    if (filters.biomarkerCount?.min && result.biomarkerCount < parseInt(filters.biomarkerCount.min)) {
      return false
    }
    if (filters.biomarkerCount?.max && result.biomarkerCount > parseInt(filters.biomarkerCount.max)) {
      return false
    }

    return true
  })

  const getStatusBadge = (status: LabResult['status']) => {
    switch (status) {
      case 'processed':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Processed</Badge>
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return null
    }
  }

  const getStatusIcon = (status: LabResult['status']) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'processing':
        return <TrendingUp className="w-4 h-4 text-blue-600 animate-pulse" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Results</p>
                <p className="text-2xl font-bold">{filteredResults.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processed</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredResults.filter(r => r.status === 'processed').length}
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
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredResults.filter(r => r.status === 'processing').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Values</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredResults.reduce((sum, r) => sum + (r.criticalValues || 0), 0)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lab Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResults.map((result) => (
          <Card 
            key={result.id} 
            className={`transition-all duration-200 hover:shadow-md`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  <CardTitle className="text-lg">{result.title}</CardTitle>
                </div>
                {getStatusBadge(result.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                {format(result.date, 'MMM dd, yyyy')}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Biomarkers</p>
                  <p className="font-medium">{result.biomarkerCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">File Size</p>
                  <p className="font-medium">{result.fileSize}</p>
                </div>
              </div>
              
              {result.insights && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    {result.insights}
                  </p>
                </div>
              )}
              
              {result.criticalValues && result.criticalValues > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-400 font-medium">
                    {result.criticalValues} critical value{result.criticalValues > 1 ? 's' : ''} detected
                  </p>
                </div>
              )}
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/lab-results/${result.id}`)
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled
                  title="Coming soon"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled
                  title="Coming soon"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredResults.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Lab Results Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload your first lab result to get started with personalized health insights.
            </p>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Lab Results
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
