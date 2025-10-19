'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Shield, Command } from 'lucide-react'
import { CommandPalette, type UserRole } from '@/components/cmd/command-palette'
import { ShortcutsModal } from '@/components/help/shortcuts-modal'
import { HorizontalNav } from './horizontal-nav'
import { UserSidebar } from './user-sidebar'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleHelpClick = () => {
    // Help modal opens automatically via keyboard shortcut (?)
    // This is a placeholder for future direct trigger if needed
  }

  // Map user role to CommandPalette role type
  const getUserRole = (): UserRole => {
    const role = user?.role?.toLowerCase()
    if (role?.includes('admin')) return 'super_admin'
    if (role?.includes('doctor')) return 'doctor'
    if (role?.includes('nurse')) return 'nurse'
    if (role?.includes('reception')) return 'receptionist'
    if (role?.includes('lab')) return 'lab_tech'
    return 'doctor' // default
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Compact User Sidebar (Left) */}
      <UserSidebar
        userName={user?.name}
        userRole={user?.role}
        userEmail={user?.email}
        onLogout={handleLogout}
        onHelpClick={handleHelpClick}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm">
          {/* Brand + ⌘K Hint */}
          <div className="flex items-center justify-between h-14 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Admin Portal</span>
            </div>
            
            {/* Command Palette Hint */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-gray-600 dark:text-gray-300">
              <Command className="h-4 w-4" />
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
                ⌘K
              </kbd>
              <span>to search</span>
            </div>
          </div>

          {/* Horizontal Navigation Tabs */}
          <HorizontalNav userRole={getUserRole()} />
        </div>

        {/* Page Content */}
        <main className="flex-1 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Command Palette - Always Available */}
      <CommandPalette userRole={getUserRole()} />
      
      {/* Keyboard Shortcuts Help Modal */}
      <ShortcutsModal />
    </div>
  )
}
