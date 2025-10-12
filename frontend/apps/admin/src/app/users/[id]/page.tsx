'use client'

import { useParams, useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Mail, 
  User as UserIcon, 
  Calendar, 
  Shield,
  Activity,
  FileText,
  Target,
  Loader2
} from 'lucide-react'
import { useUser } from '@/hooks/use-admin-api'
import { format } from 'date-fns'

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const { data: user, isLoading } = useUser(userId)

  const handleBack = () => {
    router.push('/users')
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    )
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-600">User not found</p>
          <Button onClick={handleBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.username || 'User Profile'}
              </h1>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Profile Type</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {user.profileType || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Role</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {user.role || 'user'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Journey</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {user.journeyType || 'general'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Member Since</p>
                  <p className="text-sm font-bold text-gray-900">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm text-gray-900 mt-1 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Username</p>
                <p className="text-sm text-gray-900 mt-1">{user.username}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">System ID</p>
                <p className="text-sm text-gray-900 mt-1 font-mono">{user.systemId}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">User ID</p>
                <p className="text-sm text-gray-900 mt-1 font-mono">{user.id}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-sm text-gray-900 mt-1">
                  {format(new Date(user.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm text-gray-900 mt-1">
                  {format(new Date(user.updatedAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>

              {user.language && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Language</p>
                  <p className="text-sm text-gray-900 mt-1 uppercase">{user.language}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lab Results</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                  <p className="text-xs text-gray-500 mt-1">Total uploaded</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Action Plans</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                  <p className="text-xs text-gray-500 mt-1">Active plans</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">0%</p>
                  <p className="text-xs text-gray-500 mt-1">Tasks completed</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

