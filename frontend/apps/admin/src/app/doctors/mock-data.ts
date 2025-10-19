export type AdminDoctor = {
  id: string
  name: string
  email: string
  specialization: string
  experience: number
  consultationFee: number
  qualifications: string[]
  isActive: boolean
  imageUrl?: string
  consultationsCount: number
  rating: number
  createdAt: string
}

const specializations = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic',
  'Gynecologist',
  'Neurologist',
  'Psychiatrist',
]

const qualifications = [
  ['MBBS', 'MD'],
  ['MBBS', 'MS'],
  ['MBBS', 'DNB'],
  ['MBBS', 'MD', 'DM'],
]

const names = [
  'Dr. Rajesh Kumar',
  'Dr. Priya Sharma',
  'Dr. Amit Patel',
  'Dr. Sunita Reddy',
  'Dr. Vikram Singh',
  'Dr. Anjali Verma',
  'Dr. Rahul Gupta',
  'Dr. Meena Iyer',
  'Dr. Sanjay Mehta',
  'Dr. Kavita Desai',
  'Dr. Arjun Nair',
  'Dr. Pooja Joshi',
]

export const mockDoctors: AdminDoctor[] = Array.from({ length: 25 }).map((_, i) => {
  const name = names[i % names.length]
  const specialization = specializations[i % specializations.length]
  const experience = 5 + (i % 20)
  const consultationFee = 500 + (i % 10) * 100
  const isActive = i % 5 !== 0 // 80% active
  const consultationsCount = Math.floor(Math.random() * 200) + 10
  const rating = 3.5 + Math.random() * 1.5
  const createdAt = new Date(2024, (i * 2) % 12, (i * 3) % 28 + 1)

  return {
    id: `doc_${i + 1}`,
    name,
    email: name.toLowerCase().replace(/dr\.\s*/g, '').replace(/\s+/g, '.') + '@clinic.com',
    specialization,
    experience,
    consultationFee,
    qualifications: qualifications[i % qualifications.length],
    isActive,
    imageUrl: undefined, // Can add image URLs if needed
    consultationsCount,
    rating: parseFloat(rating.toFixed(1)),
    createdAt: createdAt.toISOString(),
  }
})

