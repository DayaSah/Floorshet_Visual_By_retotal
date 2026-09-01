import type { ReactNode } from 'react'
import { cn } from '../lib/shadcn/utils'

type Tone = 'positive' | 'negative' | 'neutral' | 'info'

const TONE_STYLES: Record<Tone, { border: string; iconBg: string; iconText: string; value: string }> = {
  positive: { border: 'border-l-success', iconBg: 'bg-success/10', iconText: 'text-success', value: 'text-success' },
  negative: { border: 'border-l-destructive', iconBg: 'bg-destructive/10', iconText: 'text-destructive', value: 'text-destructive' },
  neutral: { border: 'border-l-border', iconBg: 'bg-muted', iconText: 'text-muted-foreground', value: 'text-foreground' },
  info: { border: 'border-l-primary', iconBg: 'bg-primary/10', iconText: 'text-primary', value: 'text-foreground' },
}

interface KpiCardProps {
  label: string
  value: string
  icon?: ReactNode
  hint?: string
  tone?: Tone
}

export function KpiCard({ label, value, icon, hint, tone = 'neutral' }: KpiCardProps) {
  const styles = TONE_STYLES[tone]
  return (
    <div
      className={cn(
        'group relative rounded-xl border border-l-4 border-border/60 bg-card/60 backdrop-blur-xl shadow-retool-sm p-5 transition-all duration-300 hover:shadow-retool-lg hover:-translate-y-0.5',
        styles.border
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon ? (
          <span
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg transition-transform duration-300 group-hover:scale-110',
              styles.iconBg,
              styles.iconText
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div className={cn('text-2xl font-bold tabular-nums transition-colors', styles.value)}>{value}</div>
      {hint ? <div className="text-xs text-muted-foreground mt-1">{hint}</div> : null}
    </div>
  )
}
