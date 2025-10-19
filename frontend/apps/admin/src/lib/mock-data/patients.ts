export type Patient = {
  id: string
  name: string
  email: string
  phone: string
  age: number
  gender: 'male' | 'female' | 'other'
  bloodGroup?: string
  lastVisit?: string
  upcomingAppointment?: string
}

const indianNames = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210', gender: 'male' as const },
  { name: 'Diya Patel', email: 'diya.patel@example.com', phone: '+91 98765 43211', gender: 'female' as const },
  { name: 'Kabir Singh', email: 'kabir.singh@example.com', phone: '+91 98765 43212', gender: 'male' as const },
  { name: 'Anaya Gupta', email: 'anaya.gupta@example.com', phone: '+91 98765 43213', gender: 'female' as const },
  { name: 'Reyansh Kumar', email: 'reyansh.kumar@example.com', phone: '+91 98765 43214', gender: 'male' as const },
  { name: 'Saanvi Reddy', email: 'saanvi.reddy@example.com', phone: '+91 98765 43215', gender: 'female' as const },
  { name: 'Vivaan Mehta', email: 'vivaan.mehta@example.com', phone: '+91 98765 43216', gender: 'male' as const },
  { name: 'Aanya Verma', email: 'aanya.verma@example.com', phone: '+91 98765 43217', gender: 'female' as const },
  { name: 'Arjun Iyer', email: 'arjun.iyer@example.com', phone: '+91 98765 43218', gender: 'male' as const },
  { name: 'Isha Joshi', email: 'isha.joshi@example.com', phone: '+91 98765 43219', gender: 'female' as const },
  { name: 'Aditya Nair', email: 'aditya.nair@example.com', phone: '+91 98765 43220', gender: 'male' as const },
  { name: 'Myra Desai', email: 'myra.desai@example.com', phone: '+91 98765 43221', gender: 'female' as const },
  { name: 'Vihaan Rao', email: 'vihaan.rao@example.com', phone: '+91 98765 43222', gender: 'male' as const },
  { name: 'Kiara Kapoor', email: 'kiara.kapoor@example.com', phone: '+91 98765 43223', gender: 'female' as const },
  { name: 'Shaurya Malhotra', email: 'shaurya.malhotra@example.com', phone: '+91 98765 43224', gender: 'male' as const },
]

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const mockPatients: Patient[] = Array.from({ length: 50 }).map((_, i) => {
  const { name, email, phone, gender } = indianNames[i % indianNames.length]
  const age = 18 + Math.floor(Math.random() * 60)
  const bloodGroup = bloodGroups[i % bloodGroups.length]
  
  const lastVisit = new Date()
  lastVisit.setDate(lastVisit.getDate() - Math.floor(Math.random() * 90))
  
  const hasUpcoming = Math.random() > 0.5
  let upcomingAppointment: string | undefined
  if (hasUpcoming) {
    const upcoming = new Date()
    upcoming.setDate(upcoming.getDate() + Math.floor(Math.random() * 30) + 1)
    upcomingAppointment = upcoming.toISOString()
  }

  return {
    id: `pat_${i + 1}`,
    name: i > 14 ? `${name} ${i - 14}` : name,
    email: i > 14 ? email.replace('@', `${i - 14}@`) : email,
    phone: phone.replace(/\d{3}$/, String(i).padStart(3, '0')),
    age,
    gender,
    bloodGroup,
    lastVisit: lastVisit.toISOString(),
    upcomingAppointment,
  }
})

// Search helper
export function searchPatients(query: string): Patient[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  
  return mockPatients.filter((p) => {
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.id.toLowerCase().includes(q)
    )
  }).slice(0, 10) // Limit to top 10 results
}

