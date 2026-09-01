import type { ReactNode } from 'react'
import { cn } from '../lib/shadcn/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
}

/** Frosted-glass panel: translucent + blurred backdrop with a soft hover lift. */
export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-retool-md transition-all duration-300 hover:shadow-retool-lg hover:border-border/90 p-6',
        className
      )}
    >
      {children}
    </div>
  )
}
