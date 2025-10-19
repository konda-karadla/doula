'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
  id: string
  title: string
  description: string
  type: 'lab_result' | 'action_plan' | 'insight' | 'notification'
  status: 'completed' | 'pending' | 'new'
  timestamp: Date
  actionLabel?: string
  onAction?: () => void
  href?: string
}

interface RecentActivityCardProps {
  title: string
  description: string
  activities: ActivityItem[]
  loading?: boolean
  emptyMessage?: string
}

export function RecentActivityCard({
  title,
  description,
  activities,
  loading = false,
  emptyMessage = "No recent activity"
}: RecentActivityCardProps) {
  const getTypeIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'lab_result':
        return <FileText className="w-4 h-4" />
      case 'action_plan':
        return <CheckCircle className="w-4 h-4" />
      case 'insight':
        return <AlertCircle className="w-4 h-4" />
      case 'notification':
        return <Clock className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'new':
        return <Badge variant="destructive">New</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                  </div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {getTypeIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {activity.actionLabel && (() => {
                  const fallbackHref =
                    activity.type === 'lab_result'
                      ? `/lab-results/${activity.id}`
                      : activity.type === 'action_plan'
                      ? `/action-plans/${activity.id}`
                      : '/dashboard'

                  const targetHref = activity.href || fallbackHref

                  return (
                    <Button asChild variant="outline" size="sm">
                      <Link href={targetHref}>{activity.actionLabel}</Link>
                    </Button>
                  )
                })()}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
