import { mockConsultations } from '@/app/consultations/mock-data'
import { mockLabResults } from '@/app/lab-results/mock-data'

export type TodayAppointment = {
  id: string
  time: string
  patientName: string
  type: string
  duration: number
  status: string
}

export type PendingLab = {
  id: string
  fileName: string
  patientName: string
  uploadedAt: string
  urgency: 'normal' | 'high' | 'critical'
}

export type DoctorStats = {
  todayPatients: number
  todayConsultations: number
  pendingLabs: number
  upcomingToday: number
  completedToday: number
  revenue: number
}

// Get today's appointments from mock consultations
export function getTodaySchedule(): TodayAppointment[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return mockConsultations
    .filter((c) => {
      const schedTime = new Date(c.scheduledAt)
      return schedTime >= today && schedTime < tomorrow
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .map((c) => ({
      id: c.id,
      time: new Date(c.scheduledAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      patientName: c.patientName,
      type: c.type,
      duration: c.duration,
      status: c.status,
    }))
    .slice(0, 5) // Next 5 appointments
}

// Get pending lab results
export function getPendingLabs(): PendingLab[] {
  return mockLabResults
    .filter((r) => r.processingStatus === 'pending' || r.processingStatus === 'processing')
    .map((r, i): PendingLab => ({
      id: r.id,
      fileName: r.fileName,
      patientName: r.userName || 'Unknown Patient',
      uploadedAt: r.uploadedAt,
      urgency: (i % 3 === 0 ? 'critical' : i % 2 === 0 ? 'high' : 'normal') as 'normal' | 'high' | 'critical',
    }))
    .slice(0, 5)
}

// Get doctor stats for today
export function getDoctorStats(): DoctorStats {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayConsults = mockConsultations.filter((c) => {
    const schedTime = new Date(c.scheduledAt)
    return schedTime >= today && schedTime < tomorrow
  })

  const completed = todayConsults.filter((c) => c.status === 'COMPLETED')
  const upcoming = todayConsults.filter((c) => 
    c.status === 'SCHEDULED' || c.status === 'CONFIRMED'
  )

  return {
    todayPatients: new Set(todayConsults.map((c) => c.patientEmail)).size,
    todayConsultations: todayConsults.length,
    pendingLabs: mockLabResults.filter((r) => 
      r.processingStatus === 'pending' || r.processingStatus === 'processing'
    ).length,
    upcomingToday: upcoming.length,
    completedToday: completed.length,
    revenue: completed.reduce((sum, c) => sum + c.fee, 0),
  }
}

