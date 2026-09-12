/** @jsxRuntime automatic */
import { type ReactNode, lazy, Suspense, useState, useEffect } from 'react'
import { NavLink, Routes, Route } from 'react-router-dom'
import { Activity, Clock, FileSpreadsheet, Flame, Gamepad2, LayoutGrid, Loader2, Network, ScatterChart, Search, Table2, Users } from 'lucide-react'
import { cn } from './lib/shadcn/utils'
import { ThemeToggle } from './components/ThemeToggle'
import { CommandPalette } from './components/CommandPalette'
import { WatchlistBar } from './components/WatchlistBar'
import { MobileBottomNav } from './components/MobileBottomNav'
import './styles/effects.css'

const Floorsheet = lazy(() => import('./pages/Floorsheet'))
const FloorsheetVisualization = lazy(() => import('./pages/FloorsheetVisualization'))
const SymbolAnalysis = lazy(() => import('./pages/SymbolAnalysis'))
const ScriptAnalysis = lazy(() => import('./pages/ScriptAnalysis'))
const BrokerAnalysis = lazy(() => import('./pages/BrokerAnalysis'))
const MarketRadar = lazy(() => import('./pages/MarketRadar'))
const BrokerNetwork = lazy(() => import('./pages/BrokerNetwork'))
const TimePatterns = lazy(() => import('./pages/TimePatterns'))
const TradeSizeAnalysis = lazy(() => import('./pages/TradeSizeAnalysis'))
const FunLounge = lazy(() => import('./pages/FunLounge'))

function PageFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground animate-in fade-in duration-300">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm font-medium">Loading view...</p>
    </div>
  )
}

function NavTab({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap',
          isActive
            ? 'bg-primary text-primary-foreground shadow-retool-sm scale-[1.02]'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="relative min-h-screen bg-background isolate overflow-x-hidden">
      {/* Decorative ambient background for the glassmorphism effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 w-[36rem] h-[36rem] rounded-full bg-success/10 dark:bg-success/10 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-32 -right-24 w-[36rem] h-[36rem] rounded-full bg-destructive/10 dark:bg-destructive/10 blur-3xl animate-float-slow-reverse" />
        <div className="absolute top-1/3 right-1/4 w-[28rem] h-[28rem] rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl animate-float-drift" />
      </div>

      <nav className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-6 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none">
            <NavTab to="/" icon={<Table2 className="w-4 h-4" />} label="Table" />
            <NavTab to="/overview" icon={<LayoutGrid className="w-4 h-4" />} label="Overview" />
            <NavTab to="/symbols" icon={<Activity className="w-4 h-4" />} label="Symbols" />
            <NavTab to="/script-analysis" icon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />} label="Script Analysis" />
            <NavTab to="/brokers" icon={<Users className="w-4 h-4" />} label="Brokers" />
            <NavTab to="/radar" icon={<Flame className="w-4 h-4 text-warning" />} label="Market Radar" />
            <NavTab to="/broker-network" icon={<Network className="w-4 h-4" />} label="Broker Network" />
            <NavTab to="/time-patterns" icon={<Clock className="w-4 h-4" />} label="Time Patterns" />
            <NavTab to="/trade-size" icon={<ScatterChart className="w-4 h-4" />} label="Trade Size" />
            <NavTab to="/fun" icon={<Gamepad2 className="w-4 h-4 text-pink-400" />} label="Fun" />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border/60 bg-muted/40 hover:bg-accent text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Search symbols, brokers, pages (⌘K / Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-block text-[10px] font-mono bg-background border border-border px-1 py-0.2 rounded text-muted-foreground">
                ⌘K
              </kbd>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <WatchlistBar onOpenSearch={() => setPaletteOpen(true)} />
      <div className="relative z-10 pb-20 md:pb-0">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Floorsheet />} />
            <Route path="/overview" element={<FloorsheetVisualization />} />
            <Route path="/symbols" element={<SymbolAnalysis />} />
            <Route path="/script-analysis" element={<ScriptAnalysis />} />
            <Route path="/brokers" element={<BrokerAnalysis />} />
            <Route path="/radar" element={<MarketRadar />} />
            <Route path="/broker-network" element={<BrokerNetwork />} />
            <Route path="/time-patterns" element={<TimePatterns />} />
            <Route path="/trade-size" element={<TradeSizeAnalysis />} />
            <Route path="/fun" element={<FunLounge />} />
          </Routes>
        </Suspense>
      </div>

      <MobileBottomNav />
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
