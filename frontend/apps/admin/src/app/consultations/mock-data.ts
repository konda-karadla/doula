export type ConsultationStatus = 
  | 'SCHEDULED' 
  | 'CONFIRMED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW'

export type ConsultationType = 'VIDEO' | 'AUDIO' | 'CHAT' | 'IN_PERSON'

export type AdminConsultation = {
  id: string
  patientName: string
  patientEmail: string
  doctorName: string
  doctorSpecialization: string
  doctorImageUrl?: string
  scheduledAt: string
  duration: number
  type: ConsultationType
  fee: number
  isPaid: boolean
  status: ConsultationStatus
  notes?: string
  createdAt: string
}

const patientNames = [
  ['Rahul Kumar', 'rahul.kumar@example.com'],
  ['Priya Singh', 'priya.singh@example.com'],
  ['Amit Patel', 'amit.patel@example.com'],
  ['Sneha Reddy', 'sneha.reddy@example.com'],
  ['Vikram Sharma', 'vikram.sharma@example.com'],
  ['Anjali Verma', 'anjali.verma@example.com'],
  ['Rajesh Gupta', 'rajesh.gupta@example.com'],
  ['Meera Iyer', 'meera.iyer@example.com'],
]

const doctorNames = [
  ['Dr. Rajesh Kumar', 'Cardiologist'],
  ['Dr. Priya Sharma', 'Dermatologist'],
  ['Dr. Amit Patel', 'General Physician'],
  ['Dr. Sunita Reddy', 'Pediatrician'],
  ['Dr. Vikram Singh', 'Orthopedic'],
]

const statuses: ConsultationStatus[] = [
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]

const types: ConsultationType[] = ['VIDEO', 'AUDIO', 'CHAT', 'IN_PERSON']

export const mockConsultations: AdminConsultation[] = Array.from({ length: 30 }).map((_, i) => {
  const [patientName, patientEmail] = patientNames[i % patientNames.length]
  const [doctorName, doctorSpecialization] = doctorNames[i % doctorNames.length]
  const status = statuses[i % statuses.length]
  const type = types[i % types.length]
  const isPaid = i % 3 !== 0 // 66% paid
  const duration = [15, 30, 45, 60][i % 4]
  const fee = 500 + (i % 10) * 100
  
  // Generate scheduled date (mix of past and future)
  const daysOffset = (i % 40) - 20 // -20 to +20 days from today
  const scheduledAt = new Date()
  scheduledAt.setDate(scheduledAt.getDate() + daysOffset)
  scheduledAt.setHours(9 + (i % 10), (i % 4) * 15)
  
  const createdAt = new Date(scheduledAt)
  createdAt.setDate(createdAt.getDate() - 5)

  return {
    id: `cons_${i + 1}`,
    patientName,
    patientEmail,
    doctorName,
    doctorSpecialization,
    scheduledAt: scheduledAt.toISOString(),
    duration,
    type,
    fee,
    isPaid,
    status,
    createdAt: createdAt.toISOString(),
  }
})

