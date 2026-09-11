# 🚀 NEPSE Floorsheet Visualizer — Enhancement Roadmap

This document outlines the 7-phase improvement roadmap to turn NEPSE Floorsheet Visualizer into a high-performance, trader-grade analytical platform.

---

## 📌 Phase 1: Bundle Optimization & Code Splitting
- [x] Implement `React.lazy()` dynamic route imports in `frontend/App.tsx`.
- [x] Add sleek glassmorphism `<Suspense>` fallback loader.
- [x] Configure `rollupOptions.output.manualChunks` in `frontend/vite.config.ts` to isolate `recharts`, `@tanstack/react-table`, and `@radix-ui`.
- [x] Reduce main JS bundle size from 837 kB to < 100 kB and eliminate chunk size warnings.
- [x] Verify build and commit/push to `main`.

---

## 📌 Phase 2: Interactive Cross-Page Drill-downs & URL State
- [x] Make symbols clickable in Floorsheet Table to route to `/symbols?symbol=<TICKER>`.
- [x] Make buyer and seller broker badges clickable to route to `/brokers?broker=<ID>`.
- [x] Integrate `useSearchParams` into `SymbolAnalysis.tsx` to automatically load symbol from URL.
- [x] Integrate `useSearchParams` into `BrokerAnalysis.tsx` to automatically load broker from URL.
- [x] Enable clicking top symbols/brokers in Overview and Broker Network to deep-link directly into analysis views.
- [x] Verify build and commit/push to `main`.

---

## 📌 Phase 3: 1-Click CSV Data Export
- [x] Create `frontend/utils/csvExport.ts` for clean CSV formatting and download triggers.
- [x] Add **Export CSV** button in Floorsheet Table (downloads filtered trades).
- [x] Add **Export CSV** button in Symbol Analysis (downloads ranking & trade history).
- [x] Add **Export CSV** button in Broker Analysis (downloads broker ranking & daily history).
- [x] Verify build and commit/push to `main`.

---

## 📌 Phase 4: Dark / Light Mode Theme Toggle
- [x] Create `frontend/components/ThemeToggle.tsx` with smooth Sun/Moon icon animations.
- [x] Persist theme preference in `localStorage` with OS `prefers-color-scheme` fallback.
- [x] Mount theme switcher in the sticky header in `frontend/App.tsx`.
- [x] Ensure consistent high-contrast colors and glassmorphism styling in both modes.
- [x] Verify build and commit/push to `main`.

---

## 📌 Phase 5: Global Quick Search / Command Palette (`Ctrl+K` / `⌘K`)
- [x] Build `frontend/components/CommandPalette.tsx` accessible via `Ctrl+K`, `⌘K`, or navbar search button.
- [x] Instant search across all NEPSE symbols, broker numbers & names, and page navigation.
- [x] Keyboard navigation (Arrow keys, Enter to jump, Escape to close).
- [x] Verify build and commit/push to `main`.

---

## 📌 Phase 6: Server-Side Pagination & High-Volume Data Navigation
- [x] Update `api/floorsheet/raw.ts` to support `page` query parameter with offset-based slicing.
- [x] Update frontend hook and Floorsheet table to support multi-page historical navigation across all 2.6M records.
- [x] Cache pagination requests at Edge CDN with composite keys (`floorsheet_raw_${limit}_p${page}`).
- [x] Verify build and commit/push to `main`.

---

## 📌 Phase 7: Script Analysis Flagship Platform (Smart Money & Broker Accumulation Tracker)
- [x] **Dedicated Backend Aggregator**: Create `api/floorsheet/script-analysis.ts` computing symbol-specific broker net holdings, cumulative daywise trajectories for all ~96 brokers, daily closing prices, VWAP, and average cost basis.
- [x] **Interactive Flagship Page**: Build `frontend/pages/ScriptAnalysis.tsx` (`/script-analysis`) with symbol search, date window selectors (7D, 15D, 30D, All Time, Custom), and summary KPIs (Turnover, Volume, Lead Buyer/Seller).
- [x] **Trajectory Presets & All 96 Brokers Display**: Implement one-click filter presets (`Top 5 Accumulators`, `Top 5 Distributors`, `Top 5 Acc + 5 Dist`, and `All Listed Brokers (All 96 Brokers)`), paired with a searchable broker chip tray with color dots & net badges.
- [x] **Feature A — Dual-Axis Price vs. Holding Overlay**: Add secondary right Y-axis toggle for daily closing prices (amber dashed line) overlaid directly on broker trajectory curves to reveal smart money divergence (silent accumulation vs. retail distribution).
- [x] **Feature B — Estimated Broker Cost Basis, Breakeven & PnL Status**: Calculate volume-weighted broker entry prices against Latest Traded Price (LTP) with real-time PnL position status (`+X% In Profit 🟢` / `-X% Underwater 🔴`) in the Top 10 Broker Breakdown table.
- [x] **Feature C — Smart Money Sentiment & Accumulation Index**: Build a 0–100 algorithmic score gauge with plain-English dynamic Institutional Footprint verdict and Buyer vs. Seller concentration progress bars.
- [x] **Feature G — "Share Pro Card" Instant Snapshot Generator**: Add 1-click modal using `html-to-image` to generate branded, high-resolution social cards with direct clipboard copy (`navigator.clipboard.write`) and Retina PNG download.
- [x] **Comprehensive Guide Library**: Create detailed beginner-to-pro guides for all 9 platform tabs in `Guide/` ([Table](Guide/table.md), [Overview](Guide/overview.md), [Symbols](Guide/symbols.md), [Script Analysis](Guide/scriptanalysis.md), [Brokers](Guide/brokers.md), [Market Radar](Guide/radar.md), [Broker Network](Guide/broker_network.md), [Time Patterns](Guide/time_patterns.md), [Trade Size](Guide/trade_size.md)), anchored by a central [Guides Hub](Guide/README.md).
- [x] Verify build and commit/push to `main`.
