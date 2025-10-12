'use client'

import { useState, useMemo } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Search, Upload, Eye, Download, Trash2, Filter, FileText, Loader2 } from 'lucide-react'
import { useAdminLabResults, useDeleteLabResult } from '@/hooks/use-admin-api'
import { format } from 'date-fns'

export default function LabResultsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSystem, setFilterSystem] = useState('all')
  const { toast } = useToast()

  const { data: labResults, isLoading, error } = useAdminLabResults()
  const deleteLabMutation = useDeleteLabResult()

  // Client-side filtering (since admin endpoint returns all results)
  const filteredResults = useMemo(() => {
    if (!labResults) return []
    
    return labResults.filter(result => {
      const matchesSearch = !searchTerm || result.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || result.processingStatus === filterStatus
      const matchesSystem = filterSystem === 'all' // Future: filter by user's system
      
      return matchesSearch && matchesStatus && matchesSystem
    })
  }, [labResults, searchTerm, filterStatus, filterSystem])

  const handleViewResult = (fileUrl: string, fileName: string) => {
    // Open PDF in new tab for viewing
    window.open(fileUrl, '_blank', 'noopener,noreferrer')
    toast({
      title: 'Opening lab result',
      description: `Viewing ${fileName} in browser`,
    })
  }

  const handleDownloadResult = (fileUrl: string, fileName: string) => {
    // Create temporary link for download
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: 'Download initiated',
      description: `Downloading ${fileName}`,
    })
  }

  const handleDeleteResult = async (resultId: string, fileName: string) => {
    if (confirm(`Are you sure you want to delete ${fileName}?`)) {
      try {
        await deleteLabMutation.mutateAsync(resultId)
        toast({
          title: 'Lab result deleted',
          description: `${fileName} has been deleted successfully`,
        })
      } catch (error) {
        console.error('Failed to delete lab result:', error)
        toast({
          title: 'Delete failed',
          description: 'Failed to delete lab result',
          variant: 'destructive',
        })
      }
    }
  }

  const handleUploadResults = () => {
    // Future Enhancement: Bulk upload modal
    toast({
      title: 'Upload lab results',
      description: 'Bulk upload functionality is a future enhancement',
    })
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    switch (status) {
      case 'completed':
      case 'processed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'processing':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'failed':
      case 'error':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'pending':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }
  
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed': return 'Processed'
      case 'processing': return 'Processing'
      case 'failed': return 'Error'
      case 'pending': return 'Pending'
      default: return status
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lab Results Management</h1>
            <p className="text-gray-600">Manage uploaded lab results and biomarker data</p>
          </div>
          <Button onClick={handleUploadResults}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Results
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
                    placeholder="Search results..."
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
                  <option value="processed">Processed</option>
                  <option value="processing">Processing</option>
                  <option value="error">Error</option>
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

        {/* Lab Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lab Results ({filteredResults.length})</CardTitle>
            <CardDescription>
              Manage uploaded lab results and processing status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}
            {error && !isLoading && (
              <div className="text-center py-8">
                <p className="text-red-600">Failed to load lab results</p>
              </div>
            )}
            {!isLoading && !error && (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredResults.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {result.fileName || 'Untitled'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadge(result.processingStatus)}>
                              {getStatusDisplay(result.processingStatus)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(result.uploadedAt), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewResult(result.s3Url, result.fileName || 'lab-result.pdf')}
                                title="View result"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadResult(result.s3Url, result.fileName || 'lab-result.pdf')}
                                title="Download result"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteResult(result.id, result.fileName || 'lab result')}
                                title="Delete result"
                                className="text-red-600 hover:text-red-700"
                                disabled={deleteLabMutation.isPending}
                              >
                                {deleteLabMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredResults.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No lab results found matching your criteria</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Results</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {labResults?.length || 0}
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
                  <p className="text-sm font-medium text-gray-600">Processed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {labResults?.filter(r => r.processingStatus === 'completed').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-yellow-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {labResults?.filter(r => r.processingStatus === 'processing').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-red-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {labResults?.filter(r => r.processingStatus === 'failed').length || 0}
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
