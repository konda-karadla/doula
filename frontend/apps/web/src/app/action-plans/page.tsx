'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardNav } from '@/components/layout/dashboard-nav'
import { ActionPlansList } from '@/components/action-plans/action-plans-list'
import { ActionPlanCreator } from '@/components/action-plans/action-plan-creator'
import { ActionPlanFilters } from '@/components/action-plans/action-plan-filters'
import { Button } from '@/components/ui/button'
import { Plus, Filter, Target } from 'lucide-react'

function ActionPlansContent() {
  const searchParams = useSearchParams()
  const [showCreateModal, setShowCreateModal] = useState(false)
  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setShowCreateModal(true)
    }
  }, [searchParams])
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Action Plans
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Create and track your personalized health improvement plans
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
              onClick={() => setShowCreateModal(true)}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <ActionPlanFilters onClose={() => setShowFilters(false)} />
          </div>
        )}

        {/* Action Plans List */}
        <ActionPlansList />

        {/* Create Plan Modal */}
        {showCreateModal && (
          <ActionPlanCreator onClose={() => setShowCreateModal(false)} />
        )}
      </main>
    </div>
  )
}

export default function ActionPlansPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActionPlansContent />
    </Suspense>
  )
}
