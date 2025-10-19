export type AdminUser = {
  id: string
  name: string
  email: string
  system: 'doula' | 'functional_health' | 'elderly_care'
  status: 'active' | 'inactive'
  createdAt: string
  lastLogin: string
}

const names = [
  ['Aarav Sharma', 'aarav.sharma@example.com'],
  ['Diya Patel', 'diya.patel@example.com'],
  ['Isha Gupta', 'isha.gupta@example.com'],
  ['Kabir Rao', 'kabir.rao@example.com'],
  ['Meera Iyer', 'meera.iyer@example.com'],
  ['Rohan Mehta', 'rohan.mehta@example.com'],
  ['Sara Khan', 'sara.khan@example.com'],
  ['Vikram Singh', 'vikram.singh@example.com'],
  ['Anaya Joshi', 'anaya.joshi@example.com'],
  ['Dev Patel', 'dev.patel@example.com'],
]

const systems: AdminUser['system'][] = ['doula', 'functional_health', 'elderly_care']

export const mockUsers: AdminUser[] = Array.from({ length: 30 }).map((_, i) => {
  const [name, email] = names[i % names.length]
  const system = systems[i % systems.length]
  const status: AdminUser['status'] = i % 4 === 0 ? 'inactive' : 'active'
  const createdAt = new Date(2025, (i * 3) % 12, (i * 2) % 28 + 1)
  const lastLogin = new Date(2025, (i * 5) % 12, (i * 3) % 28 + 1)
  return {
    id: `u_${i + 1}`,
    name,
    email,
    system,
    status,
    createdAt: createdAt.toISOString(),
    lastLogin: lastLogin.toISOString(),
  }
})


