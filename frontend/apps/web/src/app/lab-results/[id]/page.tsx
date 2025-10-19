'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardNav } from '@/components/layout/dashboard-nav'
import { LabResultDetail } from '@/components/lab-results/lab-result-detail'
import { BiomarkerTrends } from '@/components/lab-results/biomarker-trends'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Share } from 'lucide-react'

export default function LabResultDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'details' | 'trends'>('details')
  
  const labResultId = params.id as string

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Lab Result Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Complete Blood Count (CBC) - January 15, 2024
              </p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button variant="outline" className="flex items-center">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Lab Details
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trends'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Biomarker Trends
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' ? (
          <LabResultDetail labResultId={labResultId} />
        ) : (
          <BiomarkerTrends labResultId={labResultId} />
        )}
      </main>
    </div>
  )
}
