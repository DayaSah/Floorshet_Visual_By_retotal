/** @jsxRuntime automatic */
import type { ReactNode } from 'react'
import { NavLink, Routes, Route } from 'react-router-dom'
import { Activity, Clock, LayoutGrid, Network, ScatterChart, Table2, Users } from 'lucide-react'
import Floorsheet from './pages/Floorsheet'
import FloorsheetVisualization from './pages/FloorsheetVisualization'
import SymbolAnalysis from './pages/SymbolAnalysis'
import BrokerAnalysis from './pages/BrokerAnalysis'
import BrokerNetwork from './pages/BrokerNetwork'
import TimePatterns from './pages/TimePatterns'
import TradeSizeAnalysis from './pages/TradeSizeAnalysis'
import { cn } from './lib/shadcn/utils'
import './styles/effects.css'

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
  return (
    <div className="relative min-h-screen bg-background isolate overflow-x-hidden">
      {/* Decorative ambient background for the glassmorphism effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 w-[36rem] h-[36rem] rounded-full bg-success/10 dark:bg-success/10 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-32 -right-24 w-[36rem] h-[36rem] rounded-full bg-destructive/10 dark:bg-destructive/10 blur-3xl animate-float-slow-reverse" />
        <div className="absolute top-1/3 right-1/4 w-[28rem] h-[28rem] rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl animate-float-drift" />
      </div>

      <nav className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center gap-2 px-6 py-3 overflow-x-auto">
          <NavTab to="/" icon={<Table2 className="w-4 h-4" />} label="Table" />
          <NavTab to="/overview" icon={<LayoutGrid className="w-4 h-4" />} label="Overview" />
          <NavTab to="/symbols" icon={<Activity className="w-4 h-4" />} label="Symbols" />
          <NavTab to="/brokers" icon={<Users className="w-4 h-4" />} label="Brokers" />
          <NavTab to="/broker-network" icon={<Network className="w-4 h-4" />} label="Broker Network" />
          <NavTab to="/time-patterns" icon={<Clock className="w-4 h-4" />} label="Time Patterns" />
          <NavTab to="/trade-size" icon={<ScatterChart className="w-4 h-4" />} label="Trade Size" />
        </div>
      </nav>
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<Floorsheet />} />
          <Route path="/overview" element={<FloorsheetVisualization />} />
          <Route path="/symbols" element={<SymbolAnalysis />} />
          <Route path="/brokers" element={<BrokerAnalysis />} />
          <Route path="/broker-network" element={<BrokerNetwork />} />
          <Route path="/time-patterns" element={<TimePatterns />} />
          <Route path="/trade-size" element={<TradeSizeAnalysis />} />
        </Routes>
      </div>
    </div>
  )
}
