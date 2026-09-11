# 📈 Symbol Analysis — Beginner's & Trader's Guide

> **Evaluate any NEPSE stock in seconds.** The Symbol Analysis tab (`/symbols`) combines stock performance rankings, gainers/losers screening, interactive price & volume charts, and broker smart flow breakdowns into a single high-speed dashboard.

---

## 📌 Table of Contents
1. [What is Symbol Analysis and Why Does It Matter?](#1-what-is-symbol-analysis-and-why-does-it-matter)
2. [Market-Wide Stock Screeners & Quick Cards](#2-market-wide-stock-screeners--quick-cards)
   - [A. Top Gainers & Top Losers](#a-top-gainers--top-losers)
   - [B. Top Stocks by Turnover](#b-top-stocks-by-turnover)
3. [Deep-Dive Stock Dashboard (Symbol Selection)](#3-deep-dive-stock-dashboard-symbol-selection)
   - [A. Price & Volume KPIs](#a-price--volume-kpis)
   - [B. Dual Price & Volume Timeline Chart](#b-dual-price--volume-timeline-chart)
   - [C. Broker Smart Flow Breakdown (Accumulators vs. Distributors)](#c-broker-smart-flow-breakdown-accumulators-vs-distributors)
4. [Master Symbol Ranking Table](#4-master-symbol-ranking-table)
5. [Real-World Example: Screening & Analyzing a Breakout Stock](#5-real-world-example-screening--analyzing-a-breakout-stock)
6. [Pro Tips & Shortcuts](#6-pro-tips--shortcuts)
7. [Frequently Asked Questions (FAQ)](#7-frequently-asked-questions-faq)

---

## 1. What is Symbol Analysis and Why Does It Matter?

Every trader needs an effortless way to answer three questions about a stock:
1. *Is the price gaining or losing momentum, and by how much?*
2. *Is the price move supported by heavy trading volume or is it a low-volume fakeout?*
3. *Which specific brokerages are accumulating shares behind the scenes?*

The **Symbol Analysis** tab unifies market-wide screening with detailed single-stock diagnostics.

---

## 2. Market-Wide Stock Screeners & Quick Cards

When you open `/symbols` without selecting a specific ticker, the top section presents three instant market screeners:

```
+-----------------------------------+-----------------------------------+-----------------------------------+
| 🚀 Top Gainers                    | 🔻 Top Losers                     | 💎 Top Traded by Amount           |
| 1. HIDCLP (+9.8%)                 | 1. SHIVM (-4.2%)                  | 1. NABIL (Rs. 18.2 Cr)            |
| 2. CIT (+7.5%)                    | 2. CHCL (-3.8%)                   | 2. SHIVM (Rs. 14.5 Cr)            |
| 3. GBIME (+6.2%)                  | 3. NICA (-3.1%)                   | 3. GBIME (Rs. 11.8 Cr)            |
+-----------------------------------+-----------------------------------+-----------------------------------+
```

### A. Top Gainers & Top Losers
- Ranks the top 8 percentage gainers and losers across the recorded dataset.
- Calculated from **First Rate** to **Last Rate** (`(Last - First) / First × 100%`).
- **Click any stock**: Instantly opens that stock's complete profile.

### B. Top Stocks by Turnover
- Identifies the highest-liquidity companies in Nepal.
- High-turnover stocks provide easy entry and exit without large price slippage.

---

## 3. Deep-Dive Stock Dashboard (Symbol Selection)

Select any ticker from the search dropdown or URL parameter (e.g., `/symbols?symbol=NABIL`):

```
+---------------------------------------------------------------------------------------------------+
| 🔍 Selected Symbol: NABIL ── Star (⭐) ── Jump to Flagship [Script Analysis ⚡]                    |
+--------------------+--------------------+--------------------+-------------------+----------------+
| Latest Close       | Change             | Turnover           | Total Volume      | Day Range      |
| Rs. 585.00         | +2.63% 🟢          | Rs. 18.2 Crore     | 312,450 Shares    | 570.00 - 590.00|
+--------------------+--------------------+--------------------+-------------------+----------------+
```

### A. Price & Volume KPIs
- **Latest Close**: The most recent transaction rate recorded.
- **Percentage Change**: Color-coded green badge for positive gains, red for losses.
- **Turnover & Volume**: Gross NPR traded and total shares exchanged.
- **Day Range**: Spread between the lowest traded rate (`Min Rate`) and highest traded rate (`Max Rate`).

---

### B. Dual Price & Volume Timeline Chart
- **Price Curve (Blue Line)**: Tracks closing prices across trading sessions.
- **Volume Histogram (Grey/Blue Bars)**: Displays total traded share units per session.
- **Key Analysis Rule**: Look for **Volume-Price Confirmation**:
  - *Price rises on expanding volume bars* = Bullish institutional demand.
  - *Price rises on shrinking volume bars* = Weak rally / risk of reversal.

---

### C. Broker Smart Flow Breakdown (Accumulators vs. Distributors)

Directly under the chart, you can toggle between two specialized broker views for the selected stock:

#### 1. 🟢 Smart Flow Tab:
- **Top Accumulators (Net Buyers)**: Brokers whose clients bought more shares than they sold. Shows their total buy NPR, sell NPR, and net accumulation.
- **Top Distributors (Net Sellers)**: Brokers whose clients dumped shares. Shows who generated the selling pressure.

#### 2. 📊 Volume Tab:
- Displays brokers by total combined buy + sell activity to reveal market liquidity providers.

> ⚡ **Next Step Banner**: Click the highlighted **Open in Script Analysis** button to view the full day-by-day trajectory line chart, smart money index score, and broker breakeven cost basis!

---

## 4. Master Symbol Ranking Table

At the bottom of the page sits a comprehensive, searchable database of every traded ticker:

| Symbol | Total Amount (NPR) | Total Quantity | Trades | Min Rate | Max Rate | First Rate | Last Rate | Change (%) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NABIL** | 181,920,400 | 312,450 | 1,656 | 570.00 | 592.00 | 570.00 | 585.00 | `+2.63% 🟢` |
| **SHIVM** | 145,110,800 | 284,100 | 1,420 | 498.00 | 525.00 | 522.00 | 500.00 | `-4.21% 🔴` |

- **Sorting**: Click any header (`Change (%)`, `Total Amount`, `Last Rate`) to rank the entire NEPSE board.
- **Export to CSV**: Download the full ranked table to analyze in Microsoft Excel.

---

## 5. Real-World Example: Screening & Analyzing a Breakout Stock

1. Open `/symbols`.
2. Look at the **Top Gainers** card: You notice `GBIME` has gained `+6.2%`.
3. Click `GBIME` to load its deep-dive dashboard.
4. Check the **Volume Chart**: You observe volume is 3x higher than the previous 5 days.
5. Check the **Broker Smart Flow**:
   - Broker #58 bought Rs. 2.1 Crore and sold only Rs. 20 Lakhs (+Rs. 1.9 Crore Net).
   - Sellers are scattered across 25 different brokerages.
6. **Verdict**: High-confidence institutional breakout. Star `GBIME` (⭐) and track it in [Script Analysis](scriptanalysis.md).

---

## 6. Pro Tips & Shortcuts

- ⭐ **Instant Watchlist Addition**: Click the star icon next to the stock symbol or any broker name to save it to your persistent header bar.
- 🔗 **Shareable URLs**: The URL updates automatically (`?symbol=NABIL`). Copy and paste the link to send your exact analysis view to anyone.
- ⌨️ **Keyboard Shortcut**: Press `⌘K` or `Ctrl+K`, type `NABIL`, and press Enter to jump straight to its dashboard.

---

## 7. Frequently Asked Questions (FAQ)

### Q1: How is the percentage change calculated?
**A:** `% Change = ((Last Traded Price - First Traded Price) / First Traded Price) × 100`. It reflects the true price trajectory over the selected time window.

### Q2: What is the difference between Symbol Analysis and Script Analysis?
**A:** 
- **Symbol Analysis (`/symbols`)**: Focuses on price action, volume bars, gainers/losers rankings, and quick broker lists.
- **Script Analysis (`/script-analysis`)**: Our flagship deep-dive platform featuring 0–100 Smart Money Index gauges, daywise cumulative holding trajectories, broker average cost basis & PnL, and "Share Pro Card" exports.

---

*Happy Trading & Symbol Screening! 🚀📊*
