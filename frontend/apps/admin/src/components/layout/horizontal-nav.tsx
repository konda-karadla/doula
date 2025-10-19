'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  FileText,
  Target,
  Settings,
  ChevronDown,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/components/cmd/command-palette'

type NavItem = {
  name: string
  href: string
  icon: React.ElementType
  roles: UserRole[] // Empty = all roles
}

const primaryNav: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: [] },
  { name: 'Consultations', href: '/consultations', icon: Calendar, roles: [] },
  { name: 'Lab Results', href: '/lab-results', icon: FileText, roles: [] },
  { name: 'Action Plans', href: '/action-plans', icon: Target, roles: ['super_admin', 'doctor'] },
]

const secondaryNav: NavItem[] = [
  { name: 'Users', href: '/users', icon: Users, roles: ['super_admin'] },
  { name: 'Doctors', href: '/doctors', icon: Stethoscope, roles: ['super_admin', 'receptionist'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['super_admin'] },
]

export type HorizontalNavProps = {
  userRole: UserRole
}

export function HorizontalNav({ userRole }: HorizontalNavProps) {
  const pathname = usePathname()

  // Filter nav items by role
  const visiblePrimaryNav = primaryNav.filter(
    (item) => item.roles.length === 0 || item.roles.includes(userRole)
  )
  const visibleSecondaryNav = secondaryNav.filter(
    (item) => item.roles.length === 0 || item.roles.includes(userRole)
  )

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Primary Navigation Tabs */}
      {visiblePrimaryNav.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              active
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-100'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.name}</span>
          </Link>
        )
      })}

      {/* More Menu (Secondary Nav) */}
      {visibleSecondaryNav.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'gap-1 border-b-2',
                visibleSecondaryNav.some((item) => isActive(item.href))
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              More
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {visibleSecondaryNav.map((item) => {
              const active = isActive(item.href)
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 cursor-pointer',
                      active && 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  )
}

