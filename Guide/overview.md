# 🌐 Market Overview — Beginner's & Trader's Guide

> **Get the 30,000-foot view of Nepal's equity market.** The Market Overview tab (`/overview`) delivers high-level macro intelligence, tracking aggregate turnover trends, daily trade velocity, and market leadership across NEPSE.

---

## 📌 Table of Contents
1. [What is Market Overview and Why Does It Matter?](#1-what-is-market-overview-and-why-does-it-matter)
2. [Macro KPIs & Headline Metrics](#2-macro-kpis--headline-metrics)
3. [Visualizing Market Flow: The Three Core Charts](#3-visualizing-market-flow-the-three-core-charts)
   - [A. Daily Traded Amount (Turnover Area Chart)](#a-daily-traded-amount-turnover-area-chart)
   - [B. Top 10 Symbols by Traded Amount (Leadership Bar Chart)](#b-top-10-symbols-by-traded-amount-leadership-bar-chart)
   - [C. Daily Trade Count (Execution Velocity Chart)](#c-daily-trade-count-execution-velocity-chart)
4. [How to Spot Macro Market Trends (Bull vs. Bear Regimes)](#4-how-to-spot-macro-market-trends-bull-vs-bear-regimes)
5. [Interactive Drilldowns & Workflow Integration](#5-interactive-drilldowns--workflow-integration)
6. [Pro Tips & Shortcuts](#6-pro-tips--shortcuts)
7. [Frequently Asked Questions (FAQ)](#7-frequently-asked-questions-faq)

---

## 1. What is Market Overview and Why Does It Matter?

Before diving into individual stocks or brokers, smart market participants always ask:
- *Is liquidity expanding or drying up across NEPSE?*
- *Are institutions actively deploying capital, or are traders sitting on cash?*
- *Which 2 or 3 market leaders are absorbing 50%+ of daily market turnover?*

The **Market Overview** tab aggregates all floorsheet transactions to deliver immediate macro clarity without information overload.

---

## 2. Macro KPIs & Headline Metrics

Across the top of the page, three summary cards synthesize overall market health:

```
+-----------------------------------+-----------------------------------+-----------------------------------+
| 💰 Total Turnover                 | 🔄 Total Trades                   | 📅 Trading Days                   |
| Rs. 142.85 Crore                  | 2,642,891                         | 48 Days                           |
| 🟢 Trending up over the period    | All executed orders               | Active exchange sessions          |
+-----------------------------------+-----------------------------------+-----------------------------------+
```

1. **Total Turnover**:
   - The gross sum of Nepali Rupees exchanged across all stocks and brokerages over the recorded period.
   - Includes a dynamic trend indicator: **🟢 Positive (Green)** if turnover expanded towards recent sessions; **🔴 Negative (Red)** if turnover contracted.
2. **Total Trades**:
   - Total number of executed NEPSE trade contracts. High trade counts reflect widespread market participation.
3. **Trading Days**:
   - Count of active trading days recorded in the database history.

---

## 3. Visualizing Market Flow: The Three Core Charts

### A. Daily Traded Amount (Turnover Area Chart)
- **What it shows**: The day-by-day evolution of gross market turnover (NPR).
- **Chart Type**: Smooth gradient area chart with hover tooltips displaying the exact date and traded sum.
- **Why it matters**:
  - **Expanding Turnover**: Sustained upward slopes confirm institutional capital inflow and healthy bull market momentum.
  - **Drying Volume**: Contracting turnover warns of market hesitation, exhaustion, or impending consolidation.

---

### B. Top 10 Symbols by Traded Amount (Leadership Bar Chart)
- **What it shows**: The 10 most heavily traded stocks in NEPSE ranked by gross turnover.
- **Chart Type**: Horizontal ranked bar chart with multi-colored categorical bars.
- **Interactive Feature**:
  - **Click any bar**: Instantly navigates to `/symbols?symbol=<TICKER>` to view that stock's complete price chart, gain/loss percentage, and broker distribution profile!
- **Why it matters**:
  - In healthy bull runs, quality index heavyweights (banks, hydropower, telecom) dominate the top 10.
  - When speculative penny stocks dominate the top 10 turnover, market volatility and risk are elevated.

---

### C. Daily Trade Count (Execution Velocity Chart)
- **What it shows**: The number of individual buy/sell executions per trading day.
- **Why it matters**:
  - Comparing **Turnover** vs. **Trade Count** reveals order size trends:
    - *High Turnover + Low Trade Count* = Big institutional block orders (Whales).
    - *Low Turnover + High Trade Count* = Retail frenzy with tiny lot sizes.

---

## 4. How to Spot Macro Market Trends (Bull vs. Bear Regimes)

| Market Regime | Turnover Chart Behavior | Top Symbols Composition | Practical Strategy |
| :--- | :--- | :--- | :--- |
| **Early Bullish Expansion** | Daily turnover rising steadily day over day. | Fundamentally strong commercial banks, bluechips. | Aggressively hunt breakout setups in [Script Analysis](scriptanalysis.md). |
| **Euphoric Climax** | Giant vertical turnover spikes, 2x–3x daily average. | Highly speculative micro-caps and high-beta hydro. | Tighten stop losses; institutions often distribute during euphoric volume spikes. |
| **Quiet Accumulation** | Low, steady turnover in a flat range; volatility drops. | Quiet accumulation in 2–3 selected leaders. | Patient swing positioning alongside smart money. |
| **Bearish Capitulation** | Sharp volume spike on heavy down day followed by drying volume. | Panic selling across all top 10 turnover stocks. | Watch for [Market Radar](radar.md) whale absorption at support levels. |

---

## 5. Interactive Drilldowns & Workflow Integration

The Market Overview tab is designed as the launchpad for your daily market preparation:

```
[ Market Overview ] ──► Identify Top Traded Symbol (e.g. SHIVM)
        │
        ├──► Click Bar ──► [ Symbol Analysis (/symbols?symbol=SHIVM) ]
        │
        └──► Check Accumulation ──► [ Script Analysis (/script-analysis?symbol=SHIVM) ]
```

1. Review **Market Overview** to see which stock is capturing liquidity today.
2. Click the stock's bar to jump to **Symbol Analysis**.
3. If the stock shows strong price momentum, jump to **Script Analysis** to see which broker is driving the accumulation.

---

## 6. Pro Tips & Shortcuts

- 🔄 **Refresh on Demand**: Hit the **Refresh** button in the top right corner to bypass cached stats and pull the latest numbers immediately.
- 📱 **Responsive Tooltips**: Hover or tap on any area or bar chart point to view exact figures formatted in Nepali currency standards.
- ⌨️ **Navigate with `⌘K`**: Press `⌘K` to jump to any symbol or tab in less than a second.

---

## 7. Frequently Asked Questions (FAQ)

### Q1: Why does turnover matter more than price in technical analysis?
**A:** "Volume precedes price." Large institutional investors cannot buy or sell without leaving footprints in the turnover figures. A price rally on expanding turnover is credible; a price rally on declining turnover is fragile.

### Q2: How often is the Overview data recalculated?
**A:** Aggregated daily summaries are cached at high speed. You can click **Refresh** anytime to force a live calculation against the newest database entries.

---

*Happy Trading & Macro Market Tracking! 🚀📊*
