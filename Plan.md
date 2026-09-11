# 🚀 NEPSE Floorsheet Visualizer — Enhancement Roadmap

This document outlines the 6-phase improvement roadmap to turn NEPSE Floorsheet Visualizer into a high-performance, trader-grade analytical platform.

---

## 📌 Phase 1: Bundle Optimization & Code Splitting
- [x] Implement `React.lazy()` dynamic route imports in `frontend/App.tsx`.
- [x] Add sleek glassmorphism `<Suspense>` fallback loader.
- [x] Configure `rollupOptions.output.manualChunks` in `frontend/vite.config.ts` to isolate `recharts`, `@tanstack/react-table`, and `@radix-ui`.
- [x] Reduce main JS bundle size from 837 kB to < 100 kB and eliminate chunk size warnings.
- [x] Verify build and commit/push to `main`.

---

## 📌 Phase 2: Interactive Cross-Page Drill-downs & URL State
- [ ] Make symbols clickable in Floorsheet Table to route to `/symbols?symbol=<TICKER>`.
- [ ] Make buyer and seller broker badges clickable to route to `/brokers?broker=<ID>`.
- [ ] Integrate `useSearchParams` into `SymbolAnalysis.tsx` to automatically load symbol from URL.
- [ ] Integrate `useSearchParams` into `BrokerAnalysis.tsx` to automatically load broker from URL.
- [ ] Enable clicking top symbols/brokers in Overview and Broker Network to deep-link directly into analysis views.
- [ ] Verify build and commit/push to `main`.

---

## 📌 Phase 3: 1-Click CSV Data Export
- [ ] Create `frontend/utils/csvExport.ts` for clean CSV formatting and download triggers.
- [ ] Add **Export CSV** button in Floorsheet Table (downloads filtered trades).
- [ ] Add **Export CSV** button in Symbol Analysis (downloads ranking & trade history).
- [ ] Add **Export CSV** button in Broker Analysis (downloads broker ranking & daily history).
- [ ] Verify build and commit/push to `main`.

---

## 📌 Phase 4: Dark / Light Mode Theme Toggle
- [ ] Create `frontend/components/ThemeToggle.tsx` with smooth Sun/Moon icon animations.
- [ ] Persist theme preference in `localStorage` with OS `prefers-color-scheme` fallback.
- [ ] Mount theme switcher in the sticky header in `frontend/App.tsx`.
- [ ] Ensure consistent high-contrast colors and glassmorphism styling in both modes.
- [ ] Verify build and commit/push to `main`.

---

## 📌 Phase 5: Global Quick Search / Command Palette (`Ctrl+K` / `⌘K`)
- [ ] Build `frontend/components/CommandPalette.tsx` accessible via `Ctrl+K`, `⌘K`, or navbar search button.
- [ ] Instant search across all NEPSE symbols, broker numbers & names, and page navigation.
- [ ] Keyboard navigation (Arrow keys, Enter to jump, Escape to close).
- [ ] Verify build and commit/push to `main`.

---

## 📌 Phase 6: Server-Side Pagination & High-Volume Data Navigation
- [ ] Update `api/floorsheet/raw.ts` to support `page` query parameter with offset-based slicing.
- [ ] Update frontend hook and Floorsheet table to support multi-page historical navigation across all 2.6M records.
- [ ] Cache pagination requests at Edge CDN with composite keys (`floorsheet_raw_${limit}_p${page}`).
- [ ] Verify build and commit/push to `main`.
