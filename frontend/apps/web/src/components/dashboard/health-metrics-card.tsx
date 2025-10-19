'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface HealthMetricsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  loading?: boolean
}

export function HealthMetricsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = 'blue',
  loading = false
}: HealthMetricsCardProps) {
  const getColorClasses = () => {
    const colorMap = {
      blue: {
        icon: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        positive: 'text-blue-600 dark:text-blue-400',
        negative: 'text-red-600 dark:text-red-400'
      },
      green: {
        icon: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/30',
        positive: 'text-green-600 dark:text-green-400',
        negative: 'text-red-600 dark:text-red-400'
      },
      yellow: {
        icon: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        positive: 'text-green-600 dark:text-green-400',
        negative: 'text-red-600 dark:text-red-400'
      },
      red: {
        icon: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/30',
        positive: 'text-green-600 dark:text-green-400',
        negative: 'text-red-600 dark:text-red-400'
      },
      purple: {
        icon: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        positive: 'text-green-600 dark:text-green-400',
        negative: 'text-red-600 dark:text-red-400'
      }
    }
    return colorMap[color]
  }

  const colors = getColorClasses()

  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="w-3 h-3" />
    return change > 0 ? 
      <TrendingUp className="w-3 h-3" /> : 
      <TrendingDown className="w-3 h-3" />
  }

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-muted-foreground'
    return change > 0 ? colors.positive : colors.negative
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`w-8 h-8 rounded-full ${colors.bg} animate-pulse`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded" />
          <p className="text-xs text-muted-foreground animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded mt-1" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${colors.icon}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-1 text-xs">
            {getTrendIcon()}
            <span className={getTrendColor()}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            {changeLabel && (
              <span className="text-muted-foreground">from {changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
