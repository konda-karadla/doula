'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Command } from 'lucide-react'

type ShortcutGroup = {
  title: string
  shortcuts: {
    keys: string[]
    description: string
  }[]
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Global',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['Ctrl', 'K'], description: 'Open command palette (Windows/Linux)' },
      { keys: ['?'], description: 'Show keyboard shortcuts (this modal)' },
      { keys: ['Esc'], description: 'Close modal or dialog' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Then type page name to navigate' },
      { keys: ['↑', '↓'], description: 'Navigate through command results' },
      { keys: ['Enter'], description: 'Select highlighted command' },
    ],
  },
  {
    title: 'Tables',
    shortcuts: [
      { keys: ['Hover'], description: 'Show action buttons on table row' },
      { keys: ['Click'], description: 'Select checkbox for bulk actions' },
    ],
  },
  {
    title: 'Quick Actions (via ⌘K)',
    shortcuts: [
      { keys: ['today'], description: "View today's schedule" },
      { keys: ['pending'], description: 'View pending lab results' },
      { keys: ['new cons'], description: 'Create new consultation' },
      { keys: ['dashboard'], description: 'Go to dashboard' },
    ],
  },
]

export function ShortcutsModal() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with '?' key (Shift + /)
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Don't open if user is typing in an input
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return
        }
        e.preventDefault()
        setOpen(true)
      }

      // Close with Escape
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5 text-blue-600" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Quick reference for keyboard shortcuts in the admin portal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{group.title}</h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-700">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono font-medium text-gray-900 shadow-sm">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-gray-400 mx-1">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>💡 Pro Tip:</strong> Press <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono mx-1">⌘K</kbd> 
            and start typing to access any page or action instantly. It's the fastest way to navigate!
          </p>
        </div>

        <div className="text-xs text-gray-500 text-center mt-4">
          Press <kbd className="px-1 py-0.5 bg-gray-100 border rounded">?</kbd> anytime to view this help
        </div>
      </DialogContent>
    </Dialog>
  )
}

