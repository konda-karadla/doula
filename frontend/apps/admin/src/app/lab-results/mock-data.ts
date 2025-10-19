export type LabResultStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'error'

export type AdminLabResult = {
  id: string
  fileName: string
  s3Url: string
  processingStatus: LabResultStatus
  uploadedAt: string
  processedAt?: string
  fileSize: number
  mimeType: string
  userId?: string
  userName?: string
}

const fileNames = [
  'Complete Blood Count - Jan 2025.pdf',
  'Lipid Profile - Dec 2024.pdf',
  'Thyroid Function Test - Jan 2025.pdf',
  'Liver Function Test - Dec 2024.pdf',
  'Kidney Function Test - Nov 2024.pdf',
  'Vitamin D Test - Jan 2025.pdf',
  'HbA1c Test - Dec 2024.pdf',
  'Iron Studies - Nov 2024.pdf',
]

const statuses: LabResultStatus[] = ['completed', 'processing', 'failed', 'pending']

const userNames = [
  'Rahul Kumar',
  'Priya Singh',
  'Amit Patel',
  'Sneha Reddy',
  'Vikram Sharma',
  'Anjali Verma',
]

export const mockLabResults: AdminLabResult[] = Array.from({ length: 25 }).map((_, i) => {
  const fileName = fileNames[i % fileNames.length].replace(/Jan|Dec|Nov/, 
    ['Jan', 'Feb', 'Mar'][i % 3])
  const status = statuses[i % statuses.length]
  const fileSize = 100000 + Math.floor(Math.random() * 900000) // 100KB - 1MB
  
  const uploadedAt = new Date()
  uploadedAt.setDate(uploadedAt.getDate() - (i * 2))
  uploadedAt.setHours(9 + (i % 10), (i % 4) * 15)
  
  let processedAt: Date | undefined
  if (status === 'completed') {
    processedAt = new Date(uploadedAt)
    processedAt.setMinutes(processedAt.getMinutes() + 5 + Math.floor(Math.random() * 20))
  }

  return {
    id: `lab_${i + 1}`,
    fileName,
    s3Url: `https://example-bucket.s3.amazonaws.com/lab-results/${i + 1}.pdf`,
    processingStatus: status,
    uploadedAt: uploadedAt.toISOString(),
    processedAt: processedAt?.toISOString(),
    fileSize,
    mimeType: 'application/pdf',
    userId: `user_${(i % 6) + 1}`,
    userName: userNames[i % userNames.length],
  }
})

