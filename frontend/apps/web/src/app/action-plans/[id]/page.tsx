'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardNav } from '@/components/layout/dashboard-nav'
import { ActionPlanDetail } from '@/components/action-plans/action-plan-detail'
import { ActionPlanProgress } from '@/components/action-plans/action-plan-progress'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, MoreHorizontal } from 'lucide-react'

export default function ActionPlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'progress'>('overview')
  
  const actionPlanId = params.id as string

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
                Action Plan Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Nutrition Optimization Plan - 65% Complete
              </p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button variant="outline" className="flex items-center">
              <MoreHorizontal className="w-4 h-4 mr-2" />
              More
            </Button>
            <Button className="flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Edit Plan
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'progress'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Progress Tracking
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <ActionPlanDetail actionPlanId={actionPlanId} />
        ) : (
          <ActionPlanProgress actionPlanId={actionPlanId} />
        )}
      </main>
    </div>
  )
}
