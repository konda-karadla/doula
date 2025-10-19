'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Home,
  Users,
  Stethoscope,
  Calendar,
  FileText,
  Plus,
  Settings,
  Search,
  Clock,
  Shield,
  Activity,
  Target,
  User,
} from 'lucide-react'
import { searchPatients, type Patient } from '@/lib/mock-data/patients'

// Role-based access control
export type UserRole = 'super_admin' | 'doctor' | 'nurse' | 'receptionist' | 'lab_tech'

type CommandAction = {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  action: () => void
  category: 'navigation' | 'create' | 'search' | 'recent' | 'admin' | 'patients'
  keywords: string[]
  roles: UserRole[] // Empty array = all roles
  isPatient?: boolean
  patientData?: Patient
}

type CommandPaletteProps = {
  userRole?: UserRole
}

export function CommandPalette({ userRole = 'doctor' }: CommandPaletteProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [recentItems, setRecentItems] = React.useState<string[]>([])
  const [patientResults, setPatientResults] = React.useState<Patient[]>([])

  // Load recent items from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('cmd-palette-recent')
    if (stored) {
      try {
        setRecentItems(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to load recent items', e)
      }
    }
  }, [])

  // Search patients when typing (debounced)
  React.useEffect(() => {
    if (search.length >= 2) {
      const results = searchPatients(search)
      setPatientResults(results)
    } else {
      setPatientResults([])
    }
  }, [search])

  // Save to recent items
  const addToRecent = React.useCallback((actionId: string) => {
    setRecentItems((prev) => {
      const updated = [actionId, ...prev.filter((id) => id !== actionId)].slice(0, 10)
      localStorage.setItem('cmd-palette-recent', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Define all available commands with role-based access
  const allCommands: CommandAction[] = React.useMemo(() => [
    // Navigation - All Roles
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'Go to dashboard',
      icon: Home,
      action: () => router.push('/dashboard'),
      category: 'navigation',
      keywords: ['dashboard', 'home', 'overview'],
      roles: [],
    },
    {
      id: 'nav-doctors',
      label: 'Doctors',
      description: 'Manage doctors',
      icon: Stethoscope,
      action: () => router.push('/doctors'),
      category: 'navigation',
      keywords: ['doctors', 'physicians', 'staff'],
      roles: ['super_admin', 'receptionist'],
    },
    {
      id: 'nav-consultations',
      label: 'Consultations',
      description: 'View consultations',
      icon: Calendar,
      action: () => router.push('/consultations'),
      category: 'navigation',
      keywords: ['consultations', 'appointments', 'bookings', 'schedule'],
      roles: [],
    },
    {
      id: 'nav-users',
      label: 'Users',
      description: 'Manage users',
      icon: Users,
      action: () => router.push('/users'),
      category: 'navigation',
      keywords: ['users', 'patients', 'accounts'],
      roles: ['super_admin'],
    },
    {
      id: 'nav-labs',
      label: 'Lab Results',
      description: 'View lab results',
      icon: FileText,
      action: () => router.push('/lab-results'),
      category: 'navigation',
      keywords: ['labs', 'results', 'tests', 'biomarkers'],
      roles: [],
    },
    {
      id: 'nav-action-plans',
      label: 'Action Plans',
      description: 'Manage action plans',
      icon: Target,
      action: () => router.push('/action-plans'),
      category: 'navigation',
      keywords: ['action plans', 'tasks', 'goals'],
      roles: ['super_admin', 'doctor'],
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      description: 'System settings',
      icon: Settings,
      action: () => router.push('/settings'),
      category: 'navigation',
      keywords: ['settings', 'configuration', 'preferences'],
      roles: ['super_admin'],
    },

    // Quick Create Actions - Role-based
    {
      id: 'create-consultation',
      label: 'New Consultation',
      description: 'Create a new consultation',
      icon: Plus,
      action: () => router.push('/consultations/new'),
      category: 'create',
      keywords: ['new', 'create', 'consultation', 'appointment', 'booking'],
      roles: ['doctor', 'receptionist'],
    },
    {
      id: 'create-doctor',
      label: 'Add Doctor',
      description: 'Add a new doctor',
      icon: Plus,
      action: () => router.push('/doctors/new'),
      category: 'create',
      keywords: ['new', 'add', 'doctor', 'physician'],
      roles: ['super_admin'],
    },
    {
      id: 'create-user',
      label: 'Add User',
      description: 'Create a new user account',
      icon: Plus,
      action: () => router.push('/users/new'),
      category: 'create',
      keywords: ['new', 'add', 'user', 'account', 'patient'],
      roles: ['super_admin', 'receptionist'],
    },

    // Quick Actions - Role-based
    {
      id: 'today-schedule',
      label: "Today's Schedule",
      description: 'View today\'s appointments',
      icon: Clock,
      action: () => router.push('/consultations?filter=today'),
      category: 'search',
      keywords: ['today', 'schedule', 'appointments', 'calendar'],
      roles: ['doctor', 'receptionist'],
    },
    {
      id: 'pending-labs',
      label: 'Pending Lab Results',
      description: 'View pending lab results',
      icon: Activity,
      action: () => router.push('/lab-results?status=pending'),
      category: 'search',
      keywords: ['pending', 'labs', 'results', 'processing'],
      roles: ['doctor', 'lab_tech'],
    },
    {
      id: 'admin-dashboard',
      label: 'Admin Dashboard',
      description: 'System monitoring and analytics',
      icon: Shield,
      action: () => router.push('/dashboard?view=admin'),
      category: 'admin',
      keywords: ['admin', 'monitoring', 'analytics', 'system'],
      roles: ['super_admin'],
    },
  ], [router])

  // Convert patient results to commands
  const patientCommands: CommandAction[] = React.useMemo(() => {
    return patientResults.map((patient) => ({
      id: `patient-${patient.id}`,
      label: patient.name,
      description: `${patient.age}y, ${patient.gender} • ${patient.phone}`,
      icon: User,
      action: () => router.push(`/patients/${patient.id}`), // Future: create patients page
      category: 'patients' as const,
      keywords: [patient.name, patient.email, patient.phone, patient.id],
      roles: [],
      isPatient: true,
      patientData: patient,
    }))
  }, [patientResults, router])

  // Filter commands based on role and search
  const filteredCommands = React.useMemo(() => {
    return allCommands.filter((cmd) => {
      // Role-based filtering
      if (cmd.roles.length > 0 && !cmd.roles.includes(userRole)) {
        return false
      }

      // Search filtering
      if (!search) return true

      const searchLower = search.toLowerCase()
      return (
        cmd.label.toLowerCase().includes(searchLower) ||
        cmd.description?.toLowerCase().includes(searchLower) ||
        cmd.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower))
      )
    })
  }, [allCommands, search, userRole])

  // Group commands by category
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandAction[]> = {
      recent: [],
      patients: [],
      navigation: [],
      create: [],
      search: [],
      admin: [],
    }

    // Add patient results first (if searching)
    if (patientCommands.length > 0) {
      groups.patients = patientCommands
    }

    // Add recent items first (if not searching)
    if (!search) {
      recentItems.forEach((id) => {
        const cmd = allCommands.find((c) => c.id === id)
        if (cmd && (cmd.roles.length === 0 || cmd.roles.includes(userRole))) {
          groups.recent.push(cmd)
        }
      })
    }

    // Group filtered commands
    filteredCommands.forEach((cmd) => {
      if (!groups.recent.some((r) => r.id === cmd.id)) {
        groups[cmd.category].push(cmd)
      }
    })

    return groups
  }, [filteredCommands, recentItems, allCommands, search, userRole, patientCommands])

  // All visible commands (for keyboard navigation)
  const allVisibleCommands = React.useMemo(() => {
    return [
      ...groupedCommands.recent,
      ...groupedCommands.patients,
      ...groupedCommands.navigation,
      ...groupedCommands.create,
      ...groupedCommands.search,
      ...groupedCommands.admin,
    ]
  }, [groupedCommands])

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open palette with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        return
      }

      // Close with Escape
      if (e.key === 'Escape' && open) {
        setOpen(false)
        setSearch('')
        setSelectedIndex(0)
        return
      }

      if (!open) return

      // Navigate with arrow keys
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % allVisibleCommands.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + allVisibleCommands.length) % allVisibleCommands.length)
      }

      // Execute with Enter
      if (e.key === 'Enter' && allVisibleCommands[selectedIndex]) {
        e.preventDefault()
        executeCommand(allVisibleCommands[selectedIndex])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, selectedIndex, allVisibleCommands])

  // Reset selection when search changes
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  const executeCommand = (cmd: CommandAction) => {
    addToRecent(cmd.id)
    setOpen(false)
    setSearch('')
    setSelectedIndex(0)
    cmd.action()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="flex flex-col max-h-[600px]">
          {/* Search Input */}
          <div className="flex items-center border-b px-4 py-3">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command, patient name, phone, or email..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              ESC
            </kbd>
          </div>
          
          {/* Search Hint */}
          {search.length > 0 && search.length < 2 && (
            <div className="px-4 py-2 text-xs text-gray-500 bg-blue-50 border-b">
              💡 Type at least 2 characters to search patients
            </div>
          )}
          
          {patientResults.length > 0 && (
            <div className="px-4 py-2 text-xs text-gray-500 bg-green-50 border-b">
              👥 Found {patientResults.length} patient{patientResults.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Commands List */}
          <div className="overflow-y-auto max-h-[500px] py-2">
            {allVisibleCommands.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                No commands found
              </div>
            ) : (
              <CommandsList
                groups={groupedCommands}
                selectedIndex={selectedIndex}
                onSelect={executeCommand}
                allCommands={allVisibleCommands}
              />
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2 text-xs text-gray-500 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border rounded">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border rounded">⏎</kbd> Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border rounded">ESC</kbd> Close
              </span>
            </div>
            <div className="text-xs text-gray-400">
              Role: <span className="font-medium text-gray-600">{userRole.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Commands list with categories
function CommandsList({
  groups,
  selectedIndex,
  onSelect,
  allCommands,
}: {
  groups: Record<string, CommandAction[]>
  selectedIndex: number
  onSelect: (cmd: CommandAction) => void
  allCommands: CommandAction[]
}) {
  const categories = [
    { key: 'recent', label: 'Recent' },
    { key: 'patients', label: 'Patients' },
    { key: 'navigation', label: 'Navigation' },
    { key: 'create', label: 'Create' },
    { key: 'search', label: 'Quick Actions' },
    { key: 'admin', label: 'Admin' },
  ]

  let currentIndex = 0

  return (
    <div className="space-y-4">
      {categories.map(({ key, label }) => {
        const commands = groups[key as keyof typeof groups]
        if (commands.length === 0) return null

        return (
          <div key={key} className="px-2">
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {label}
            </div>
            <div className="space-y-1">
              {commands.map((cmd) => {
                const isSelected = allCommands[selectedIndex]?.id === cmd.id
                const itemIndex = currentIndex++

                return (
                  <button
                    key={cmd.id}
                    onClick={() => onSelect(cmd)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <cmd.icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{cmd.label}</div>
                      {cmd.description && (
                        <div className="text-xs text-gray-500 truncate">{cmd.description}</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

