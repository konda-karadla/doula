'use client'

import { useState } from 'react'
import { DashboardNav } from '@/components/layout/dashboard-nav'
import { LabResultsList } from '@/components/lab-results/lab-results-list'
import { LabResultsUpload } from '@/components/lab-results/lab-results-upload'
import { LabResultsFilters } from '@/components/lab-results/lab-results-filters'
import { Button } from '@/components/ui/button'
import { Plus, Upload, Filter } from 'lucide-react'

export default function LabResultsPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<{
    search?: string
    status?: string[]
    dateRange?: { from: string; to: string }
    biomarkerCount?: { min: string; max: string }
  }>({})

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Lab Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage your health biomarkers and lab results
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Results
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <LabResultsFilters 
              onClose={() => setShowFilters(false)}
              onApplyFilters={setAppliedFilters}
            />
          </div>
        )}

        {/* Lab Results List */}
        <LabResultsList filters={appliedFilters} />

        {/* Upload Modal */}
        {showUploadModal && (
          <LabResultsUpload onClose={() => setShowUploadModal(false)} />
        )}
      </main>
    </div>
  )
}
