'use client'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LogOut, HelpCircle, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/components/cmd/command-palette'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type UserSidebarProps = {
  userName?: string
  userRole?: string
  userEmail?: string
  onLogout: () => void
  onHelpClick: () => void
}

const roleColors: Record<string, 'success' | 'primary' | 'info' | 'warning' | 'default'> = {
  super_admin: 'primary',
  doctor: 'success',
  nurse: 'info',
  receptionist: 'warning',
  lab_tech: 'default',
}

export function UserSidebar({
  userName = 'User',
  userRole = 'doctor',
  userEmail,
  onLogout,
  onHelpClick,
}: UserSidebarProps) {
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const roleLabel = userRole.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  const roleVariant = roleColors[userRole.toLowerCase()] || 'default'

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-20">
        {/* User Profile Section */}
        <div className="flex flex-col items-center py-6 px-3 border-b border-gray-200 dark:border-gray-700">
          {/* Avatar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative mb-3 cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-xl transition-shadow">
                  {getInitials(userName)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <div className="text-sm">
                <p className="font-semibold">{userName}</p>
                {userEmail && <p className="text-xs text-gray-500">{userEmail}</p>}
                <div className="mt-2">
                  <StatusBadge variant={roleVariant} className="text-xs">
                    {roleLabel}
                  </StatusBadge>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Name (truncated) */}
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center truncate w-full">
            {userName.split(' ')[0]}
          </p>
          
          {/* Role Badge */}
          <div className="mt-1">
            <StatusBadge variant={roleVariant} className="text-[10px] px-1.5 py-0">
              {roleLabel.split(' ')[0]}
            </StatusBadge>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Quick Actions */}
        <div className="flex flex-col items-center gap-2 py-4 border-t border-gray-200 dark:border-gray-700">
          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ThemeToggle />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">Toggle theme</TooltipContent>
          </Tooltip>

          {/* Help */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onHelpClick}
                className="h-9 w-9"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Keyboard shortcuts (?)</TooltipContent>
          </Tooltip>

          {/* Logout */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="h-9 w-9 text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign out</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

