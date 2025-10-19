'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  Plus,
} from 'lucide-react'
import { getTodaySchedule, getPendingLabs, getDoctorStats } from '@/lib/mock-data/dashboard'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'

export function DoctorDashboard() {
  const router = useRouter()
  const todaySchedule = getTodaySchedule()
  const pendingLabs = getPendingLabs()
  const stats = getDoctorStats()

  const urgencyVariant = {
    normal: 'default' as const,
    high: 'warning' as const,
    critical: 'error' as const,
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, Doctor!</h1>
          <p className="text-gray-600">Here's what's happening today</p>
        </div>
        <Button onClick={() => router.push('/consultations/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Consultation
        </Button>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayPatients}</div>
            <p className="text-xs text-gray-500 mt-1">Unique patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Consultations</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}/{stats.todayConsultations}</div>
            <p className="text-xs text-gray-500 mt-1">Completed / Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Labs</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLabs}</div>
            <p className="text-xs text-gray-500 mt-1">Need review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">From {stats.completedToday} consultations</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>Your next {todaySchedule.length} appointments</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/consultations?filter=today')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/consultations/${appt.id}`)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex flex-col items-center justify-center bg-white rounded-lg px-2 py-1 border">
                        <span className="text-xs text-gray-500">Time</span>
                        <span className="text-sm font-bold text-gray-900">{appt.time}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{appt.patientName}</p>
                        <p className="text-xs text-gray-500">
                          {appt.type} • {appt.duration} min
                        </p>
                      </div>
                      <StatusBadge
                        variant={
                          appt.status === 'COMPLETED'
                            ? 'success'
                            : appt.status === 'IN_PROGRESS'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {appt.status}
                      </StatusBadge>
                    </div>
                    <Eye className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Lab Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Pending Lab Results
                </CardTitle>
                <CardDescription>Results awaiting review</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/lab-results?status=pending')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {pendingLabs.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">All lab results reviewed!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLabs.map((lab) => (
                  <div
                    key={lab.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/lab-results?id=${lab.id}`)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{lab.fileName}</p>
                        <p className="text-xs text-gray-500">{lab.patientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge variant={urgencyVariant[lab.urgency]}>
                        {lab.urgency}
                      </StatusBadge>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(lab.uploadedAt), { addSuffix: true })}
                      </span>
                      <Eye className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks - or press ⌘K for instant access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all group"
              onClick={() => router.push('/consultations/new')}
            >
              <Plus className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-gray-900">New Consultation</h3>
              <p className="text-xs text-gray-500 mt-1">Book appointment</p>
            </button>

            <button
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all group"
              onClick={() => router.push('/consultations?filter=today')}
            >
              <Calendar className="h-6 w-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-gray-900">Today's Schedule</h3>
              <p className="text-xs text-gray-500 mt-1">{stats.upcomingToday} upcoming</p>
            </button>

            <button
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all group"
              onClick={() => router.push('/lab-results?status=pending')}
            >
              <FileText className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-gray-900">Pending Labs</h3>
              <p className="text-xs text-gray-500 mt-1">{stats.pendingLabs} need review</p>
            </button>

            <button
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all group"
              onClick={() => router.push('/action-plans')}
            >
              <FileText className="h-6 w-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-gray-900">Action Plans</h3>
              <p className="text-xs text-gray-500 mt-1">Manage patient plans</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

