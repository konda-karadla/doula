'use client'

import { useAuthStore } from '@/lib/stores/auth'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardNav } from '@/components/layout/dashboard-nav'
import { HealthMetricsCard } from '@/components/dashboard/health-metrics-card'
import { RecentActivityCard } from '@/components/dashboard/recent-activity-card'
import { HealthChart } from '@/components/dashboard/health-chart'
import { useHealthStats, useRecentLabResults, useRecentActionPlans, useHealthTrends, useBiomarkerData } from '@/hooks/use-health-data'
import Link from 'next/link'
import { Heart, FileText, Target, User, TrendingUp } from 'lucide-react'

function DashboardContent() {
  const { user } = useAuthStore()
  
  // Fetch data using custom hooks
  const { data: healthStats, isLoading: statsLoading } = useHealthStats()
  const { data: recentLabs, isLoading: labsLoading } = useRecentLabResults()
  const { data: recentActionPlans, isLoading: plansLoading } = useRecentActionPlans()
  const { data: healthTrends, isLoading: trendsLoading } = useHealthTrends()
  const { data: biomarkerData, isLoading: biomarkersLoading } = useBiomarkerData()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.email}. Here's your health overview.
          </p>
        </div>

        {/* Health Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <HealthMetricsCard
            title="Health Score"
            value={healthStats?.healthScore || 0}
            change={healthStats?.healthScoreChange}
            changeLabel="last month"
            icon={Heart}
            color="green"
            loading={statsLoading}
          />
          
          <HealthMetricsCard
            title="Lab Results"
            value={healthStats?.labResults || 0}
            changeLabel={`${healthStats?.labResultsPending || 0} pending`}
            icon={FileText}
            color="blue"
            loading={statsLoading}
          />
          
          <HealthMetricsCard
            title="Action Plans"
            value={healthStats?.actionPlans || 0}
            changeLabel={`${healthStats?.actionPlansInProgress || 0} in progress`}
            icon={Target}
            color="purple"
            loading={statsLoading}
          />
          
          <HealthMetricsCard
            title="Profile Status"
            value={healthStats?.profileComplete ? "Complete" : "Incomplete"}
            icon={User}
            color="yellow"
            loading={statsLoading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <HealthChart
            title="Health Score Trend"
            data={healthTrends || []}
            type="line"
            loading={trendsLoading}
          />
          
          <HealthChart
            title="Latest Biomarkers"
            data={biomarkerData || []}
            type="bar"
            loading={biomarkersLoading}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivityCard
            title="Recent Lab Results"
            description="Your latest health biomarkers and insights"
            activities={recentLabs || []}
            loading={labsLoading}
            emptyMessage="No lab results yet. Upload your first lab result to get started!"
          />
          
          <RecentActivityCard
            title="Active Action Plans"
            description="Your current health improvement goals"
            activities={recentActionPlans || []}
            loading={plansLoading}
            emptyMessage="No active action plans. Create your first plan to start improving your health!"
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/lab-results?upload=1" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border transition hover:shadow-md cursor-pointer block no-underline text-gray-900 dark:text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Upload Lab Results</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add new lab results for analysis</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </Link>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border opacity-60 cursor-not-allowed select-none">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">View Insights</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Coming soon</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <Link href="/action-plans?create=1" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border transition hover:shadow-md cursor-pointer block no-underline text-gray-900 dark:text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Create Action Plan</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Start a new health improvement plan</p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
