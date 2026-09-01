/** Semantic chart colors bound to theme CSS variables — adapt automatically to light/dark mode. */
export const CHART_SUCCESS = 'hsl(var(--success))'
export const CHART_DESTRUCTIVE = 'hsl(var(--destructive))'
export const CHART_WARNING = 'hsl(var(--warning))'
export const CHART_PRIMARY = 'hsl(var(--primary))'
export const CHART_NEUTRAL = 'hsl(var(--muted-foreground))'

/** Pick success (accumulation/gain) or destructive (distribution/loss) based on sign. */
export function signColor(value: number): string {
  return value >= 0 ? CHART_SUCCESS : CHART_DESTRUCTIVE
}

/** Sequential severity ramp for magnitude-based buckets (small -> large). */
export const SEVERITY_RAMP = [CHART_PRIMARY, 'hsl(var(--chart-2))', CHART_WARNING, CHART_WARNING, CHART_DESTRUCTIVE, CHART_DESTRUCTIVE]
