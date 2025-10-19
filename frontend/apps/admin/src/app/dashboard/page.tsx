'use client'

import { AdminLayout } from '@/components/layout/admin-layout'
import { DoctorDashboard } from '@/components/dashboard/doctor-dashboard'

export default function DashboardPage() {
  return (
    <AdminLayout>
      <DoctorDashboard />
    </AdminLayout>
  )
}
