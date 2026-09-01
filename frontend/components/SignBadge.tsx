import type { ReactNode } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '../lib/shadcn/utils'

interface SignBadgeProps {
  value: number
  children: ReactNode
  className?: string
}

/** Pill badge tinted success/destructive based on sign, with a trend icon. */
export function SignBadge({ value, children, className }: SignBadgeProps) {
  const positive = value >= 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
        positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
        className
      )}
    >
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {children}
    </span>
  )
}
