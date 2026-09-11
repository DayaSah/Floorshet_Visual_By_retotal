# 📈 NEPSE Floorsheet Visualizer

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://floorshet-visual.vercel.app/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-floorshet--visual.vercel.app-brightgreen?style=for-the-badge)](https://floorshet-visual.vercel.app/)

> 🌐 **Live Application**: [https://floorshet-visual.vercel.app/](https://floorshet-visual.vercel.app/)

A full-stack, production-ready analytics and visualization dashboard for Nepal Stock Exchange (NEPSE) floorsheet trading data. Built with React 19, Vite, Tailwind CSS, Recharts, and Vercel Serverless Functions powered by CockroachDB.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["🌐 Frontend (React 19 + Vite)"]
        UI["Modern Glassmorphism UI (Tailwind CSS)"]
        Router["React Router v7"]
        Hooks["Client Query Hooks (frontend/hooks/backend/floorsheet.ts)"]
        UI --> Router --> Hooks
    end

    subgraph Edge ["⚡ Vercel Edge & Serverless Layer"]
        CDN["Vercel Global Edge CDN (s-maxage Caching)"]
        API["Serverless API Routes (/api/floorsheet/*)"]
        MemCache["In-Memory TTL Cache (api/_db.ts)"]
        Hooks --> CDN --> API --> MemCache
    end

    subgraph Storage ["🗄️ CockroachDB Serverless (Cloud)"]
        Raw["floorsheet_raw (2.62M+ Trades)"]
        Summary["daily_broker_scrip_summary"]
        Idx["Covering Indexes (trade_time, symbol, broker)"]
        MemCache --> Raw
        MemCache --> Summary
        Raw --- Idx
    end
```

---

## 🗄️ Database Management System (DBMS) Structure

The application connects to **CockroachDB Cloud Serverless** (PostgreSQL wire compatible), designed for distributed execution and high-concurrency analytical reads.

### 1. Primary Table: `floorsheet_raw`
Stores individual transaction records for every executed trade on NEPSE.

| Column | Type | Description |
| :--- | :--- | :--- |
| `contract_id` | `VARCHAR` / `TEXT` | Primary Key. Unique contract / transaction ID assigned by NEPSE. |
| `symbol` | `VARCHAR` | Stock ticker symbol (e.g. `NABIL`, `SHIVM`, `HDL`, `NICA`). |
| `buyer_broker` | `VARCHAR` / `INT` | Broker number of the purchasing broker (e.g. `58`, `45`, `28`). |
| `seller_broker` | `VARCHAR` / `INT` | Broker number of the selling broker. |
| `quantity` | `NUMERIC` | Number of shares transacted in the trade. |
| `rate` | `NUMERIC` | Execution price per share in Nepalese Rupees (NPR). |
| `amount` | `NUMERIC` | Total transaction turnover (`quantity * rate`). |
| `trade_time` | `TIMESTAMP` | Timestamp when the transaction was executed. |

### 2. Analytical Summary Table: `daily_broker_scrip_summary`
Pre-aggregated rollups calculated by batch ETL runs for high-speed reporting.

| Column | Type | Description |
| :--- | :--- | :--- |
| `trade_date` | `DATE` | Trading session date. |
| `broker_id` | `SMALLINT` | Registered NEPSE broker ID number. |
| `symbol` | `VARCHAR` | Stock ticker symbol. |
| `buy_qty` / `sell_qty` | `BIGINT` | Total shares bought and sold by this broker for this symbol. |
| `net_qty` | `BIGINT` | Net quantity (`buy_qty - sell_qty`). Positive = Net Buy, Negative = Net Sell. |
| `buy_amt` / `sell_amt` | `NUMERIC` | Total monetary turnover transacted. |
| `net_amt` | `NUMERIC` | Net turnover (`buy_amt - sell_amt`). |
| `trades_count` | `BIGINT` | Total trade operations executed. |
| `buy_vwap` / `sell_vwap` | `NUMERIC` | Volume Weighted Average Price for purchases and sales. |
| `first_trade_time` / `last_trade_time` | `TIMESTAMP` | Timestamps of the broker's first and last trades of the session. |

### 3. Database Indexes & Query Execution Strategy
With over **2.62 million rows** in `floorsheet_raw`, queries are optimized to utilize specific indexes:

- **`floorsheet_raw_pkey` (`contract_id ASC`)**: Guarantees unique transactions.
- **`idx_trade_time` (`trade_time ASC`) `STORING (symbol, buyer_broker, seller_broker, quantity, amount)`**:
  - Covering index used by `/api/floorsheet/raw` for descending chronological ordering. By storing all displayed fields directly in the index btree, CockroachDB serves queries with zero secondary table lookups.
- **`idx_symbol_time` (`symbol ASC, trade_time ASC`)**:
  - Filters symbol-specific intraday price and trade queries in sub-millisecond execution.
- **`idx_buyer_time` (`buyer_broker ASC, trade_time ASC`)** and **`idx_seller_time` (`seller_broker ASC, trade_time ASC`)**:
  - Powers broker drilldown and counterparty pairing.

### 4. CockroachDB Request Unit (RU) Protection Policy
CockroachDB Serverless charges based on Request Units (RUs), where full table scans on millions of rows consume significant RUs. To preserve RU quotas:
- **Edge CDN Caching**: Every analytical endpoint serves `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`. Vercel's global CDN caches and serves responses at **0 database queries / 0 RUs**.
- **In-Memory Serverless Caching**: An in-process memory cache with 5–10 minute TTL prevents duplicate executions across warm serverless instances.
- **Enforced Query Bounds**: Raw floorsheet queries default to `LIMIT 500` (capped at `1000`) instead of scanning all 2.6M rows into memory.

---

## 📂 Project Directory Tree

```
.
├── api/
│   ├── _db.ts                             # Database connection pool & in-memory caching helper (prefixed with _ to exclude from Vercel function endpoints)
│   └── floorsheet/
│       ├── brokers.ts                     # GET /api/floorsheet/brokers (rankings & broker daily history)
│       ├── network.ts                     # GET /api/floorsheet/network (broker pairs & 10x10 matrix)
│       ├── raw.ts                         # GET /api/floorsheet/raw (latest transactions with limit)
│       ├── stats.ts                       # GET /api/floorsheet/stats (daily volume & top 10 symbols)
│       ├── symbols.ts                     # GET /api/floorsheet/symbols (symbol ranking & price trades)
│       ├── time-patterns.ts               # GET /api/floorsheet/time-patterns (5-min buckets & DOW)
│       └── trade-size.ts                  # GET /api/floorsheet/trade-size (brackets & block deals)
├── frontend/
│   ├── index.html                         # Single Page Application HTML entry point
│   ├── main.tsx                           # React 19 entry point with BrowserRouter & theme mount
│   ├── App.tsx                            # Primary navigation, glassmorphism layout & routing
│   ├── package.json                       # Frontend dependencies (Radix UI, Recharts, TanStack)
│   ├── vite.config.ts                     # Vite build configuration with /api proxy
│   ├── tailwind.config.js                 # Tailwind design tokens, colors, and shadows
│   ├── postcss.config.js                  # PostCSS Tailwind and Autoprefixer plugins
│   ├── tsconfig.json                      # TypeScript configuration
│   ├── theme.css                          # CSS variables for light/dark mode design system
│   ├── components/
│   │   ├── GlassCard.tsx                  # Frosted-glass container card with backdrop blur
│   │   ├── KpiCard.tsx                    # Key Performance Indicator card with status tone
│   │   └── SignBadge.tsx                  # Positive/negative trend pill badge
│   ├── hooks/
│   │   └── backend/
│   │       └── floorsheet.ts              # Type-safe client hooks for all API endpoints
│   ├── lib/
│   │   └── shadcn/
│   │       ├── button.tsx                 # Button component with CVA variants
│   │       ├── input.tsx                  # Styled input field component
│   │       ├── select.tsx                 # Radix UI select dropdown component
│   │       ├── table.tsx                  # Data table primitive components
│   │       └── utils.ts                   # Class name merger helper (clsx + twMerge)
│   ├── pages/
│   │   ├── Floorsheet.tsx                 # Route /: Searchable & sortable transactions table
│   │   ├── FloorsheetVisualization.tsx    # Route /overview: Market overview KPI & volume charts
│   │   ├── SymbolAnalysis.tsx             # Route /symbols: Gainers, losers & symbol drilldowns
│   │   ├── BrokerAnalysis.tsx             # Route /brokers: Broker accumulation vs distribution
│   │   ├── BrokerNetwork.tsx              # Route /broker-network: 10x10 inter-broker turnover matrix
│   │   ├── TimePatterns.tsx               # Route /time-patterns: Intraday 5-min trade liquidity
│   │   └── TradeSizeAnalysis.tsx          # Route /trade-size: Retail vs whale block deals
│   ├── styles/
│   │   └── effects.css                    # Ambient floating orb keyframe animations
│   └── utils/
│       ├── brokerNames.ts                 # NEPSE official directory mapping 101 registered brokers
│       ├── chartColors.ts                 # Palette constants for Recharts
│       └── format.ts                      # Number, currency (Rs.), date, and time formatters
├── .env.example                           # Sanitized environment variable template
├── .gitignore                             # Git exclusion list (protects .env, node_modules, dist)
├── package.json                           # Root workspace configuration with build & dev scripts
├── pnpm-lock.yaml                         # Deterministic pnpm dependency lockfile
├── dev-server.ts                          # Local Node.js development server
├── vercel.json                            # Vercel deployment configuration with SPA rewrites
└── README.md                              # Comprehensive project documentation
```

---

## 🔍 Detailed Function of Each File

### 1. API Layer (`api/`)
- **[`api/_db.ts`](api/_db.ts)**: Configures the PostgreSQL/CockroachDB connection pool using `pg.Pool`. Implements `getCachedOrFetch<T>` for in-memory caching with configurable TTL and `setCacheHeaders` for Vercel Edge CDN headers. Prefixed with an underscore (`_`) so Vercel ignores it as an API route and treats it strictly as an internal module.
- **[`dev-server.ts`](dev-server.ts)**: Node.js HTTP server running on port `3001` for local development, dispatching requests to `/api/floorsheet/*` handlers and injecting mock Vercel request/response objects.
- **[`api/floorsheet/raw.ts`](api/floorsheet/raw.ts)**: Handler for `/api/floorsheet/raw`. Returns the latest floorsheet transactions using the `idx_trade_time` index with a capped limit (`500` default, max `1000`).
- **[`api/floorsheet/stats.ts`](api/floorsheet/stats.ts)**: Handler for `/api/floorsheet/stats`. Groups trading volume by day and calculates top 10 traded stocks by turnover.
- **[`api/floorsheet/symbols.ts`](api/floorsheet/symbols.ts)**: Handler for `/api/floorsheet/symbols`. Computes min/max/first/last prices, turnover, and percentage price changes for symbols. If a `?symbol=XYZ` parameter is provided, returns its trade timeline.
- **[`api/floorsheet/brokers.ts`](api/floorsheet/brokers.ts)**: Handler for `/api/floorsheet/brokers`. Uses CTEs to compute buy vs. sell turnover, net accumulation, and returns daily broker volumes when `?broker=N` is requested.
- **[`api/floorsheet/network.ts`](api/floorsheet/network.ts)**: Handler for `/api/floorsheet/network`. Finds top 20 counterparty pairs and calculates a 10x10 matrix of trades between the top 10 brokers.
- **[`api/floorsheet/time-patterns.ts`](api/floorsheet/time-patterns.ts)**: Handler for `/api/floorsheet/time-patterns`. Aggregates trades into 5-minute intraday buckets and Day-of-Week buckets.
- **[`api/floorsheet/trade-size.ts`](api/floorsheet/trade-size.ts)**: Handler for `/api/floorsheet/trade-size`. Categorizes transactions into 6 size buckets and retrieves the top 25 block deals (> Rs. 1M).

### 2. Frontend Core & Pages (`frontend/`)
- **[`frontend/App.tsx`](frontend/App.tsx)**: Root application component. Renders the sticky navigation bar, floating glassmorphism ambient background, and registers client-side routes.
- **[`frontend/main.tsx`](frontend/main.tsx)**: React 19 bootstrap entry point mounting the app into `#root` with `BrowserRouter`.
- **[`frontend/pages/Floorsheet.tsx`](frontend/pages/Floorsheet.tsx)**: Interactive table page powered by `@tanstack/react-table`. Supports client-side sorting, pagination, symbol filtering, broker filtering, and date range filtering.
- **[`frontend/pages/FloorsheetVisualization.tsx`](frontend/pages/FloorsheetVisualization.tsx)**: Market overview page featuring turnover KPI cards, daily volume area charts, and top symbol bar charts.
- **[`frontend/pages/SymbolAnalysis.tsx`](frontend/pages/SymbolAnalysis.tsx)**: Symbol analysis page displaying top gainers, top losers, symbol rankings, and symbol-specific intraday price chart.
- **[`frontend/pages/BrokerAnalysis.tsx`](frontend/pages/BrokerAnalysis.tsx)**: Broker page displaying net accumulation vs. distribution rankings and broker daily buy/sell bar charts.
- **[`frontend/pages/BrokerNetwork.tsx`](frontend/pages/BrokerNetwork.tsx)**: Visualizes inter-broker trades with top trading pairs and a 10x10 counterparty intensity heatmap grid.
- **[`frontend/pages/TimePatterns.tsx`](frontend/pages/TimePatterns.tsx)**: Visualizes trade distribution across the trading day (5-min intervals) and days of the week.
- **[`frontend/pages/TradeSizeAnalysis.tsx`](frontend/pages/TradeSizeAnalysis.tsx)**: Displays trade size distribution (pie and bar charts) and a table of large block deals (> Rs. 1M).

### 3. UI Components, Hooks & Utilities
- **[`frontend/components/GlassCard.tsx`](frontend/components/GlassCard.tsx)**: Translucent glassmorphism container using `backdrop-blur-xl`, subtle border highlighting, and hover elevation.
- **[`frontend/components/KpiCard.tsx`](frontend/components/KpiCard.tsx)**: Metric card displaying value, icon, hint, and colored border status (`positive`, `negative`, `info`, `neutral`).
- **[`frontend/components/SignBadge.tsx`](frontend/components/SignBadge.tsx)**: Pill badge displaying trend arrows and success/destructive colors based on numeric sign.
- **[`frontend/hooks/backend/floorsheet.ts`](frontend/hooks/backend/floorsheet.ts)**: Reusable `useQuery` hook factory creating `useGetFloorsheetRaw`, `useGetFloorsheetStats`, etc., returning `{ data, loading, error, trigger }`.
- **[`frontend/utils/brokerNames.ts`](frontend/utils/brokerNames.ts)**: Complete mapping of all **101 official NEPSE registered stock brokers** (e.g., #58 Naasa Securities, #45 Imperial Securities), converting raw numbers to human-readable names.
- **[`frontend/utils/format.ts`](frontend/utils/format.ts)**: Formatting utilities for numbers, currencies (`Rs.`), dates, and intraday minute intervals.
- **[`frontend/utils/chartColors.ts`](frontend/utils/chartColors.ts)**: Centralized Recharts color constants matching theme CSS variables.

---

## 🚀 Running Locally

### 1. Prerequisites
- **Node.js**: `>= 18.0.0`
- **pnpm**: `>= 9.0.0` (`corepack enable pnpm`)

### 2. Configure Environment Secrets
Create a `.env` file in the root directory (this file is excluded by `.gitignore` and will never be committed):
```bash
cp .env.example .env
```
Add your CockroachDB connection string:
```env
DATABASE_URL="postgresql://user:password@host:26257/defaultdb?sslmode=verify-full"
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Start Development Servers
```bash
pnpm dev
```
This runs both processes concurrently:
- **API Server**: [http://localhost:3001](http://localhost:3001)
- **Vite Web App**: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deploying to Vercel

This repository is ready for zero-configuration deployment on Vercel:

### Step 1: Push to GitHub
Ensure all your changes are committed and pushed to your remote repository.

### Step 2: Import Project in Vercel
1. Navigate to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... -> Project**.
2. Select your repository.
3. Vercel automatically detects [`vercel.json`](vercel.json):
   - **Build Command**: `pnpm --filter frontend build`
   - **Output Directory**: `frontend/dist`
   - **Serverless API**: `api/**`

### Step 3: Add Database Secret
Under **Settings -> Environment Variables**:
- **Name**: `DATABASE_URL`
- **Value**: Your CockroachDB connection string (`postgresql://...`)

Click **Deploy**! 🚀
