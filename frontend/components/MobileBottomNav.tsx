import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Activity, Download, Flame, LayoutGrid, Table2, Users } from 'lucide-react'
import { cn } from '../lib/shadcn/utils'

interface NavItem {
  to: string
  label: string
  icon: any
  badge?: boolean
}

const ITEMS: NavItem[] = [
  { to: '/', label: 'Floorsheet', icon: Table2 },
  { to: '/overview', label: 'Overview', icon: LayoutGrid },
  { to: '/radar', label: 'Radar', icon: Flame, badge: true },
  { to: '/symbols', label: 'Symbols', icon: Activity },
  { to: '/brokers', label: 'Brokers', icon: Users },
]

export function MobileBottomNav() {
  const location = useLocation()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

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
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  return (
    <>
      {/* Optional Install Banner if prompt available */}
      {deferredPrompt && !installed && (
        <div className="md:hidden fixed bottom-16 left-3 right-3 z-40 p-2.5 rounded-xl bg-card/95 backdrop-blur-md border border-primary/40 shadow-xl flex items-center justify-between animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Install Floorsheet App</p>
              <p className="text-[10px] text-muted-foreground">Fast access directly from home screen</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Install
          </button>
        </div>
      )}

      {/* Sticky Mobile Dock */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-xl border-t border-border/60 pb-safe transition-all duration-300">
        <div className="flex items-center justify-around px-2 py-1.5">
          {ITEMS.map((item) => {
            const Icon = item.icon
            const isActive =
              item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-lg text-[10px] font-medium transition-all duration-200 relative group cursor-pointer',
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="relative">
                  <div
                    className={cn(
                      'p-1 rounded-lg transition-transform duration-200',
                      isActive ? 'scale-110 bg-primary/10' : 'group-hover:scale-105'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-colors',
                        isActive
                          ? item.to === '/radar'
                            ? 'text-warning fill-warning/20'
                            : 'text-primary'
                          : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  {item.badge && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-warning ring-2 ring-background animate-pulse" />
                  )}
                </div>
                <span className="mt-0.5 tracking-tight">{item.label}</span>
                {isActive && (
                  <span className="w-4 h-0.5 rounded-full bg-primary mt-0.5 transition-all" />
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </>
  )
}
