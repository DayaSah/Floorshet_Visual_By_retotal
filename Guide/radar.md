# ⚡ Market Radar — Beginner's & Trader's Guide

> **Detect institutional footprints in real time.** The Market Radar tab (`/radar`) acts as an early warning radar for NEPSE, tracking high-conviction whale block deals (> Rs. 10 Lakhs), in-house broker crossings, and institutional concentration.

---

## 📌 Table of Contents
1. [What is Market Radar and Why Does It Matter?](#1-what-is-market-radar-and-why-does-it-matter)
2. [Macro Radar KPIs](#2-macro-radar-kpis)
3. [The Three Specialized Workspaces](#3-the-three-specialized-workspaces)
   - [A. Whale Deals Tracker (Big Money Execution Feed)](#a-whale-deals-tracker-big-money-execution-feed)
   - [B. Internal Crossings Tracker (In-House Matches)](#b-internal-crossings-tracker-in-house-matches)
   - [C. Concentration & Leadership Analytics](#c-concentration--leadership-analytics)
4. [Customizable Whale Thresholds & Filtering](#4-customizable-whale-thresholds--filtering)
5. [Real-World Example: Catching a Whale Accumulation in Real Time](#5-real-world-example-catching-a-whale-accumulation-in-real-time)
6. [Actionable Reading Matrix for Whales & Crossings](#6-actionable-reading-matrix-for-whales--crossings)
7. [Pro Tips & Shortcuts](#7-pro-tips--shortcuts)
8. [Frequently Asked Questions (FAQ)](#8-frequently-asked-questions-faq)

---

## 1. What is Market Radar and Why Does It Matter?

In a sea of thousands of small retail orders, a few dozen high-value transactions dictate market direction:
- **Whale Trades**: Orders of Rs. 10 Lakhs, Rs. 25 Lakhs, or Rs. 1 Crore+ placed by mutual funds, wealthy individuals, or corporate treasuries.
- **Crossings**: Transactions where the buyer and seller trade through the same broker, often indicating promoter stake transfers or private block sales.

The **Market Radar** filters out 99% of retail noise, allowing you to focus exclusively on significant capital shifts as they happen.

---

## 2. Macro Radar KPIs

At the top of `/radar`, four radar cards summarize high-value activity across the market:

```
+-----------------------------------+-----------------------------------+
| 🌊 Mega Block Deals (> 10L)       | 🔄 Internal Crossings             |
| Rs. 28.4 Crore                    | Rs. 14.1 Crore                    |
| 184 trades ≥ Rs. 1,000,000        | 312 in-house matched trades       |
+-----------------------------------+-----------------------------------+
| ⚡ Largest Single Deal            | 🎯 Top Whale Ticker               |
| Rs. 1.85 Crore                    | NABIL                             |
| Highest single trade value        | Rs. 4.2 Cr block turnover         |
+-----------------------------------+-----------------------------------+
```

1. **Mega Block Deals (> 10L)**: Total turnover and count of trades valued at or above Rs. 1,000,000.
2. **Internal Crossings**: Volume and count of trades matched entirely within a single brokerage.
3. **Largest Single Deal**: The single highest-value trade contract recorded in the dataset.
4. **Top Whale Ticker**: The individual stock that attracted the highest block deal capital.

---

## 3. The Three Specialized Workspaces

### A. Whale Deals Tracker (Big Money Execution Feed)
- **Live Stream**: Displays every transaction exceeding the selected rupee threshold, sorted chronologically or by size.
- **Data Columns**:
  - **Time**: Exact timestamp of execution.
  - **Contract ID**: Authenticated NEPSE contract number.
  - **Symbol**: Stock ticker with star toggle (⭐) and deep link to [Symbol Analysis](symbols.md).
  - **Buyer Broker**: Green badge with star toggle and deep link to [Broker Analysis](brokers.md).
  - **Seller Broker**: Red badge with star toggle and deep link to [Broker Analysis](brokers.md).
  - **Quantity & Rate**: Exact unit count and execution price.
  - **Turnover**: Total transaction value highlighted in bold.

---

### B. Internal Crossings Tracker (In-House Matches)
- **What is a Crossing?** When a buyer and seller execute through the same brokerage (`Buyer Broker == Seller Broker`).
- **Why it matters**:
  - In-house deals often represent pre-negotiated trades, family stake realignments, or institutional portfolio handovers.
  - While they do not consume open-market liquidity, large crossings in a stock often precede major news announcements or earnings updates.

---

### C. Concentration & Leadership Analytics
This tab provides high-level visual charts of where institutional money is concentrated:
- **Top Whale Symbols (Bar Chart & Table)**: Ranks stocks attracting the largest block orders, showing total block turnover, number of whale trades, and the largest single contract size.
- **Top Crossing Brokers (Bar Chart & Table)**: Reveals which brokerages execute the highest volume of internal matched deals.

---

## 4. Customizable Whale Thresholds & Filtering

The Radar allows you to set your own sensitivity:
- **Whale Size Thresholds**: Choose between `≥ Rs. 5 Lakhs`, `≥ Rs. 10 Lakhs`, `≥ Rs. 25 Lakhs`, or `≥ Rs. 50 Lakhs` depending on whether you want broad swing coverage or mega-block monitoring.
- **Text Search**: Filter instantaneously by ticker (e.g. `NABIL`), broker ID (e.g. `58`), or contract ID.
- **Watchlist Only Toggle**: Filter the radar feed to only notify you of whale transactions in your starred tickers or favorite brokerages!
- **1-Click Export**: Download the whale trade feed as a structured CSV file.

---

## 5. Real-World Example: Catching a Whale Accumulation in Real Time

Suppose you have **CHCL** (Chilime Hydropower) on your radar:

1. Open `/radar` and select the **Whale Deals Tracker** tab.
2. In the search box, type `CHCL`.
3. Set the threshold to `≥ Rs. 10 Lakhs`.
4. **What You Discover**:
   - At 14:05, 14:12, and 14:20, three trades of Rs. 15 Lakhs each appear at Rs. 480.
   - **Buyer**: Broker #58 (Naasa) on all 3 trades.
   - **Seller**: Broker #28 (Shree Hari) on all 3 trades.
5. **Conclusion**:
   - A negotiated block transfer of Rs. 45 Lakhs took place between two premier brokerages at Rs. 480 without driving up the market price.
   - Rs. 480 now serves as an institutional anchor price!

---

## 6. Actionable Reading Matrix for Whales & Crossings

| Whale Signal | Buyer vs. Seller Dynamic | Typical Market Outcome | Actionable Response |
| :--- | :--- | :--- | :--- |
| **Whale Breakout** | Single buyer absorbs multiple retail sellers near 52-week highs. | Aggressive continuation rally. | Enter with stop-loss just below the whale execution rate. |
| **Whale Support Floor** | Massive block purchases appear after a multi-day decline. | Selling pressure absorbed; reversal floor formed. | Accumulate in tranches alongside the institutional buyer. |
| **Promoter Crossing** | Huge crossing (Rs. 1 Crore+) at current market rate. | Share transfer without market disruption. | Check for corporate governance announcements. |
| **Institutional Offloading** | Consecutive whale sales from a major broker bought by retail brokers. | Smart money dumping into retail enthusiasm. | Exit long positions or protect profits. |

---

## 7. Pro Tips & Shortcuts

- ⚡ **Cross-Reference with Script Analysis**: When you spot a whale trade on Market Radar, immediately jump to [Script Analysis](scriptanalysis.md) to inspect the buyer's cumulative holding trajectory and cost basis.
- ⭐ **Watchlist Priority**: Star high-volatility tickers in the table so they are highlighted in yellow on the radar.
- 🔄 **Refresh Button**: Click **Refresh** to query the newest blocks directly from the database engine.

---

## 8. Frequently Asked Questions (FAQ)

### Q1: Can a retail trader execute a whale trade?
**A:** Any transaction valued at or above Rs. 1,000,000 qualifies as a Whale Deal on the platform, whether placed by a wealthy private investor or an institutional mutual fund.

### Q2: Why are internal crossings excluded from some market indicators?
**A:** Because crossings do not test open order book depth (the buyer and seller are pre-matched), they do not move the current market bid-ask spread the same way an open-market order does.

---

*Happy Trading & Whale Hunting! 🚀⚡*
