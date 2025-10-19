'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export type CopyToClipboardProps = {
  text: string
  label?: string
  className?: string
  variant?: 'icon' | 'text' | 'inline'
  showSuccessToast?: boolean
}

export function CopyToClipboard({
  text,
  label,
  className,
  variant = 'icon',
  showSuccessToast = true,
}: CopyToClipboardProps) {
  const [copied, setCopied] = React.useState(false)
  const { toast } = useToast()

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click if in table
    
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      
      if (showSuccessToast) {
        toast({
          title: 'Copied to clipboard',
          description: label || 'Text copied successfully',
        })
      }

      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast({
        title: 'Copy failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      })
    }
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          'inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors',
          className
        )}
        title="Copy to clipboard"
      >
        <span className="font-mono">{text}</span>
        {copied ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    )
  }

  if (variant === 'text') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className={cn('h-8 gap-2', className)}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-600" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span>{label || 'Copy'}</span>
          </>
        )}
      </Button>
    )
  }

  // Default: icon variant
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={cn('h-8 w-8', className)}
      title={label || 'Copy to clipboard'}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )
}

