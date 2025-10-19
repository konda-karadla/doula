'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Calendar,
  FileText,
  CheckSquare,
  AlertTriangle,
  Clock,
  Target
} from 'lucide-react';
import type { HealthStats } from '@health-platform/types';

interface HealthStatisticsProps {
  stats?: HealthStats | null;
  isLoading: boolean;
  error: Error | null;
}

export function HealthStatistics({ stats, isLoading, error }: HealthStatisticsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Statistics</h3>
        <p className="text-gray-600">Unable to load your health statistics. Please try again later.</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Statistics Available</h3>
        <p className="text-gray-600">Start by uploading lab results and creating action plans to see your health statistics.</p>
      </div>
    );
  }

  const totalActionItems = stats.completedActionItems + stats.pendingActionItems;

  const completionRate = totalActionItems > 0 
    ? Math.round((stats.completedActionItems / totalActionItems) * 100)
    : 0;

  const pendingItems = stats.pendingActionItems;

  const statCards = [
    {
      title: 'Lab Results',
      value: stats.totalLabResults,
      icon: FileText,
      color: 'blue',
      description: 'Total lab results uploaded',
      trend: stats.lastLabUpload ? 'Last upload: ' + new Date(stats.lastLabUpload).toLocaleDateString() : 'No recent uploads'
    },
    {
      title: 'Action Plans',
      value: stats.totalActionPlans,
      icon: Target,
      color: 'green',
      description: 'Active health plans',
      trend: stats.lastActionPlanUpdate ? 'Last update: ' + new Date(stats.lastActionPlanUpdate).toLocaleDateString() : 'No recent updates'
    },
    {
      title: 'Completed Items',
      value: stats.completedActionItems,
      icon: CheckSquare,
      color: 'emerald',
      description: 'Action items completed',
      trend: `${completionRate}% completion rate`
    },
    {
      title: 'Critical Insights',
      value: stats.criticalInsights,
      icon: AlertTriangle,
      color: 'red',
      description: 'High priority health insights',
      trend: stats.criticalInsights > 0 ? 'Requires attention' : 'All clear'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Health Statistics</h2>
        <p className="text-sm text-gray-600">Overview of your health data and progress.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            green: 'bg-green-50 text-green-600 border-green-200',
            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
            red: 'bg-red-50 text-red-600 border-red-200',
          };

          return (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">{stat.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Plan Progress */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Activity className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Action Plan Progress</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Completion Rate</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completedActionItems}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{pendingItems}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Health Insights Summary */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Health Insights</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Critical Issues</span>
              <Badge variant={stats.criticalInsights > 0 ? "destructive" : "secondary"}>
                {stats.criticalInsights}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High Priority</span>
              <Badge variant="outline">
                {stats.criticalInsights}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Normal Range</span>
              <Badge variant="secondary">
                {Math.max(0, stats.totalLabResults - stats.criticalInsights)}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        
        <div className="space-y-4">
          {stats.lastLabUpload && (
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center">
                <FileText className="w-4 h-4 text-blue-600 mr-3" />
                <span className="text-sm text-gray-900">Lab result uploaded</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(stats.lastLabUpload).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {stats.lastActionPlanUpdate && (
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center">
                <Target className="w-4 h-4 text-green-600 mr-3" />
                <span className="text-sm text-gray-900">Action plan updated</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(stats.lastActionPlanUpdate).toLocaleDateString()}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900">Account created</span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(stats.memberSince).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Health Score */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Health Score</h3>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-emerald-600 mb-2">
            {Math.max(0, 100 - (stats.criticalInsights * 10))}
          </div>
          <p className="text-sm text-gray-600 mb-4">Based on your lab results and action plan progress</p>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-emerald-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(0, 100 - (stats.criticalInsights * 10))}%` }}
            ></div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            {stats.criticalInsights === 0 
              ? "Excellent! Keep up the great work."
              : `${stats.criticalInsights} critical issue${stats.criticalInsights > 1 ? 's' : ''} need${stats.criticalInsights === 1 ? 's' : ''} attention.`
            }
          </div>
        </div>
      </Card>
    </div>
  );
}
