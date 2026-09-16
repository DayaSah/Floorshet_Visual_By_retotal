import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Activity, Download, FileSpreadsheet, Flame, Gamepad2, LayoutGrid, Table2, Users, X } from 'lucide-react'
import { cn } from '../lib/shadcn/utils'

interface NavItem {
  to: string
  label: string
  icon: any
  color?: string
  badge?: boolean
}

const ITEMS: NavItem[] = [
  { to: '/', label: 'Script', icon: FileSpreadsheet, color: 'text-emerald-400' },
  { to: '/table', label: 'Table', icon: Table2 },
  { to: '/overview', label: 'Overview', icon: LayoutGrid },
  { to: '/radar', label: 'Radar', icon: Flame, color: 'text-warning', badge: true },
  { to: '/symbols', label: 'Symbols', icon: Activity },
  { to: '/brokers', label: 'Brokers', icon: Users },
  { to: '/fun', label: 'Fun', icon: Gamepad2, color: 'text-pink-400' },
]

export function MobileBottomNav() {
  const location = useLocation()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(() =>
    !!localStorage.getItem('pwa-banner-dismissed')
  )

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    const handleAppInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setBannerDismissed(true)
    localStorage.setItem('pwa-banner-dismissed', '1')
  }

  const showBanner = deferredPrompt && !installed && !bannerDismissed

  return (
    <>
      {/* PWA Install Banner */}
      {showBanner && (
        <div className="md:hidden fixed bottom-[68px] left-3 right-3 z-40 rounded-2xl bg-card/95 backdrop-blur-xl border border-emerald-500/30 shadow-2xl shadow-emerald-900/20 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3 p-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <img src="/icons/icon.svg" alt="app icon" className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">Install NEPSE Floorsheet</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Add to home screen — works offline, loads instantly</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-[11px] font-bold shadow-md hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-3 h-3" />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Dock */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border/60 pb-safe">
        <div className="flex items-center justify-around px-1 py-1">
          {ITEMS.map((item) => {
            const Icon = item.icon
            const isActive =
              item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className="flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl text-[9px] font-medium transition-all duration-200 relative group cursor-pointer min-w-0"
              >
                <div className="relative">
                  <div
                    className={cn(
                      'p-1.5 rounded-xl transition-all duration-200',
                      isActive ? 'bg-primary/15 scale-110' : 'group-hover:bg-accent group-active:scale-95'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-colors',
                        isActive
                          ? (item.color ?? 'text-primary')
                          : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  {item.badge && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-warning ring-1 ring-background animate-pulse" />
                  )}
                </div>
                <span className={cn('mt-0.5 tracking-tight truncate w-full text-center', isActive ? (item.color ?? 'text-primary font-semibold') : 'text-muted-foreground')}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-3 h-0.5 rounded-full bg-current mt-0.5" />
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </>
  )
}
