'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardNav } from '@/components/layout/dashboard-nav';
import { HealthScoreCard } from '@/components/dashboard/health-score-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

function HealthScorePageContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Health Score
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive analysis of your health based on biomarker data
          </p>
        </div>

        {/* Detailed Health Score Card */}
        <HealthScoreCard />

        {/* Additional Info Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            How Your Health Score is Calculated
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Scores are calculated from your biomarker values and reference ranges</li>
            <li>• Each category is scored independently (0-100)</li>
            <li>• Overall score is the average of all categories</li>
            <li>• Trends compare your current vs previous lab results</li>
            <li>• Upload more lab results to track your progress over time</li>
          </ul>
        </div>

        {/* Score Legend */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-green-700 dark:text-green-300 font-bold">85-100</div>
            <div className="text-sm text-green-600 dark:text-green-400">Excellent</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-blue-700 dark:text-blue-300 font-bold">70-84</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Good</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-yellow-700 dark:text-yellow-300 font-bold">50-69</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Fair</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-red-700 dark:text-red-300 font-bold">0-49</div>
            <div className="text-sm text-red-600 dark:text-red-400">Needs Attention</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HealthScorePage() {
  return (
    <ProtectedRoute>
      <HealthScorePageContent />
    </ProtectedRoute>
  );
}

