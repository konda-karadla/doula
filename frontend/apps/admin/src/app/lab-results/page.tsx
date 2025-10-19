'use client'

import { useState, useMemo } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Upload, Trash2, Filter, FileText } from 'lucide-react'
import { LabResultsDataTable } from './lab-results-data-table'
import { mockLabResults, type AdminLabResult } from './mock-data'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function LabResultsPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resultToDelete, setResultToDelete] = useState<AdminLabResult | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [selectedResults, setSelectedResults] = useState<AdminLabResult[]>([])
  const { toast } = useToast()

  // Using mock data per request. Replace with hook when backend is ready.
  const labResults = mockLabResults
  const isLoading = false
  const error = null
  const deleteLabMutation = { isPending: false, mutateAsync: async (_id: string) => {} }

  const filteredResults = useMemo(() => {
    if (!labResults) return []
    
    return labResults.filter(result => {
      const matchesStatus = filterStatus === 'all' || result.processingStatus === filterStatus
      return matchesStatus
    })
  }, [labResults, filterStatus])

  const handleViewResult = (result: AdminLabResult) => {
    window.open(result.s3Url, '_blank', 'noopener,noreferrer')
    toast({
      title: 'Opening lab result',
      description: `Viewing ${result.fileName} in browser`,
    })
  }

  const handleDownloadResult = (result: AdminLabResult) => {
    const link = document.createElement('a')
    link.href = result.s3Url
    link.download = result.fileName
    link.setAttribute('download', result.fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: 'Download initiated',
      description: `Downloading ${result.fileName}`,
    })
  }

  const handleDeleteResult = (result: AdminLabResult) => {
    setResultToDelete(result)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteResult = async () => {
    if (!resultToDelete) return
    try {
      await deleteLabMutation.mutateAsync(resultToDelete.id)
      toast({
        title: 'Lab result deleted',
        description: `${resultToDelete.fileName} has been deleted successfully`,
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

  const handleBulkDelete = () => {
    if (selectedResults.length === 0) return
    setBulkDeleteDialogOpen(true)
  }

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedResults.map((r) => deleteLabMutation.mutateAsync(r.id)))
      toast({
        title: 'Lab results deleted',
        description: `${selectedResults.length} result(s) have been deleted successfully`,
      })
      setSelectedResults([])
    } catch (error) {
      console.error('Failed to delete lab results:', error)
      toast({
        title: 'Delete failed',
        description: 'Failed to delete lab results',
        variant: 'destructive',
      })
    }
  }

  const handleUploadResults = () => {
    toast({
      title: 'Upload lab results',
      description: 'Bulk upload functionality is a future enhancement',
    })
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
            <CardDescription>Filter lab results by processing status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Processed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Error</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilterStatus('all')}
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lab Results ({filteredResults.length})</CardTitle>
                <CardDescription>Manage uploaded lab results and processing status</CardDescription>
              </div>
              {selectedResults.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {selectedResults.length} selected
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <LabResultsDataTable
              labResults={filteredResults}
              onView={handleViewResult}
              onDownload={handleDownloadResult}
              onDelete={handleDeleteResult}
              onSelectionChange={setSelectedResults}
            />
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Lab Result"
        description={
          resultToDelete
            ? `Are you sure you want to delete ${resultToDelete.fileName}? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDeleteResult}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Multiple Lab Results"
        description={`Are you sure you want to delete ${selectedResults.length} lab result(s)? This action cannot be undone.`}
        confirmText={`Delete ${selectedResults.length} result(s)`}
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmBulkDelete}
      />
    </AdminLayout>
  )
}
