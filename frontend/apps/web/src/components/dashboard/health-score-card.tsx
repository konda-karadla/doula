'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useHealthScore } from '@/hooks/use-health-score';
import { TrendingUp, TrendingDown, Minus, Activity, Heart, Baby, Salad, Zap } from 'lucide-react';

export function HealthScoreCard() {
  const { data: healthScore, isLoading, error } = useHealthScore();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Upload lab results to see your health score</p>
      </Card>
    );
  }

  if (!healthScore || healthScore.totalBiomarkers === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">Health Score</h3>
        <p className="text-sm text-muted-foreground">
          Upload your lab results to get your personalized health score
        </p>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-green-600';
    if (score >= 70) return 'bg-blue-600';
    if (score >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getTrendIcon = () => {
    if (!healthScore.trend) return <Minus className="h-4 w-4" />;
    if (healthScore.trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (healthScore.trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'metabolic':
        return <Activity className="h-5 w-5" />;
      case 'cardiovascular':
        return <Heart className="h-5 w-5" />;
      case 'reproductive':
        return <Baby className="h-5 w-5" />;
      case 'nutritional':
        return <Salad className="h-5 w-5" />;
      case 'hormonal':
        return <Zap className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Health Score</h3>
          {healthScore.trend && (
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className="text-sm text-muted-foreground capitalize">
                {healthScore.trend}
              </span>
            </div>
          )}
        </div>

        {/* Overall Score */}
        <div className="text-center space-y-4">
          <div className={`text-6xl font-bold ${getScoreColor(healthScore.overall)}`}>
            {healthScore.overall}
          </div>
          <Badge
            variant={healthScore.overallStatus === 'excellent' ? 'default' : 'secondary'}
            className="text-sm"
          >
            {healthScore.overallStatus.toUpperCase()}
          </Badge>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={healthScore.overall} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{healthScore.normalCount} normal</span>
              <span>{healthScore.criticalCount} need attention</span>
            </div>
          </div>
        </div>

        {/* Category Scores */}
        {Object.keys(healthScore.categories).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Category Breakdown</h4>
            
            {Object.entries(healthScore.categories).map(([category, data]) => (
              <div key={category} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <span className="text-sm font-medium capitalize">{category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${getScoreColor(data.score)}`}>
                      {data.score}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {data.status}
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={data.score} 
                  className={`h-2 ${getProgressColor(data.score)}`}
                />
                <p className="text-xs text-muted-foreground">{data.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Based on {healthScore.totalBiomarkers} biomarkers •{' '}
            Last updated: {new Date(healthScore.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Card>
  );
}

