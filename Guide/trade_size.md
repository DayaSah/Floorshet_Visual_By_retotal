# 📊 Trade Size Analysis — Beginner's & Trader's Guide

> **Separate retail noise from institutional power.** The Trade Size tab (`/trade-size`) categorizes millions of NEPSE trades into size brackets, comparing retail ticket volume against high-impact institutional block deals (> Rs. 1M).

---

## 📌 Table of Contents
1. [What is Trade Size Analysis and Why Does It Matter?](#1-what-is-trade-size-analysis-and-why-does-it-matter)
2. [Macro Size Distribution KPIs](#2-macro-size-distribution-kpis)
3. [The Two Core Visualizations](#3-the-two-core-visualizations)
   - [A. Trades by Size Bucket (Execution Count Bar Chart)](#a-trades-by-size-bucket-execution-count-bar-chart)
   - [B. Turnover Share by Size Bucket (Rupee Contribution Pie Chart)](#b-turnover-share-by-size-bucket-rupee-contribution-pie-chart)
4. [The 80/20 Pareto Rule of NEPSE Liquidity](#4-the-8020-pareto-rule-of-nepse-liquidity)
5. [The Largest Block Deals Table (> Rs. 1M)](#5-the-largest-block-deals-table--rs-1m)
6. [Real-World Example: Dissecting an Institutional Block Deal](#6-real-world-example-dissecting-an-institutional-block-deal)
7. [Actionable Risk Management Strategies](#7-actionable-risk-management-strategies)
8. [Pro Tips & Shortcuts](#8-pro-tips--shortcuts)
9. [Frequently Asked Questions (FAQ)](#9-frequently-asked-questions-faq)

---

## 1. What is Trade Size Analysis and Why Does It Matter?

Not all trades are created equal:
- A 10-share trade of Rs. 3,500 placed by a retail investor on a mobile app has virtually zero impact on future stock valuation.
- A 25,000-share trade of Rs. 1.25 Crore placed by an institutional desk alters market supply and creates strong support or resistance.

The **Trade Size** tab answers the most fundamental question about market mechanics:
*Who is really moving the market: millions of tiny retail orders, or a few dozen massive block transactions?*

---

## 2. Macro Size Distribution KPIs

Across the top of `/trade-size`, three summary cards set the financial stage:

```
+-----------------------------------+-----------------------------------+-----------------------------------+
| 🔢 Total Trades                   | 💰 Total Turnover                 | 🚨 Block Deal Turnover (>1M)      |
| 2,642,891 Trades                  | Rs. 142.85 Crore                  | Rs. 44.12 Crore                   |
| All recorded executions           | Total capital transacted          | 2,845 mega trades (30.9% of cash) |
+-----------------------------------+-----------------------------------+-----------------------------------+
```

1. **Total Trades**: The complete count of executed transactions.
2. **Total Turnover**: The gross value of all transactions in Nepali Rupees.
3. **Block Deal Turnover (> 1M)**: Total capital exchanged exclusively in transactions exceeding **Rs. 1,000,000 (10 Lakhs)**.

---

## 3. The Two Core Visualizations

### A. Trades by Size Bucket (Execution Count Bar Chart)
Categorizes every transaction into 6 standardized size brackets:
- `< 10K` (Micro-retail orders under Rs. 10,000)
- `10K - 50K` (Standard retail orders)
- `50K - 100K` (Active retail / small swing traders)
- `100K - 500K` (High net-worth / serious retail)
- `500K - 1M` (Semi-institutional tickets)
- `> 1M` (Institutional Mega Block Deals)

*Color Coding*: Transitions from calm cool blue (low financial risk) to intense amber and crimson red (high financial impact).

---

### B. Turnover Share by Size Bucket (Rupee Contribution Pie Chart)
- **What it shows**: The percentage of **Total Rupee Turnover** contributed by each size bucket.
- **Why it matters**: Reveals the financial disparity between order count and dollar value.

---

## 4. The 80/20 Pareto Rule of NEPSE Liquidity

When you compare the **Trade Count Bar Chart** with the **Turnover Pie Chart**, a striking institutional truth emerges:

```
 By Trade Count:                    By Rupee Turnover:
 ┌──────────────────────────────┐    ┌──────────────────────────────┐
 │  < 50K (Retail): ~78% of all │    │  > 500K (Whales): ~52% of all│
 │  orders                      │    │  market capital              │
 └──────────────────────────────┘    └──────────────────────────────┘
```

- **Order Count**: Small orders (< Rs. 50,000) make up nearly 80% of all rows in the floorsheet.
- **Capital Power**: Mega block orders (> Rs. 500,000), despite representing fewer than 5% of all orders, control over **half of all capital traded**!
- **Conclusion**: If you only read basic stock quotes, you are distracted by 80% of the noise. Tracking the `> 1M` bracket keeps you aligned with the true drivers of market value.

---

## 5. The Largest Block Deals Table (> Rs. 1M)

At the bottom of the page, a dedicated live table lists the largest transactions executed in NEPSE:

| Contract ID | Symbol | Buyer Broker | Seller Broker | Quantity | Rate (NPR) | Amount (NPR) | Trade Time |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 20260902... | **NABIL** | `#58 (Naasa)` | `#45 (Imperial)` | 25,000 | 585.00 | **Rs. 14,625,000** | 14:48:12 |
| 20260903... | **SHIVM** | `#28 (Shree Hari)`| `#57 (Aryatara)` | 20,000 | 510.00 | **Rs. 10,200,000** | 14:15:30 |

- **Symbol Link**: Click any symbol to open [Symbol Analysis](symbols.md).
- **Broker Badges**: Click any buyer or seller badge to open [Broker Analysis](brokers.md).
- **Sort by Amount**: Instant view of the largest transactions of the year.

---

## 6. Real-World Example: Dissecting an Institutional Block Deal

Suppose you see a single transaction in **NABIL** for **Rs. 1.46 Crore** (25,000 shares at Rs. 585):

1. **Verify the Contract**: The contract time is 14:48:12 (right in the power hour near market close).
2. **Examine the Counterparties**:
   - Buyer: `#58 (Naasa Securities)`
   - Seller: `#45 (Imperial Securities)`
3. **Cross-Check with Script Analysis**:
   - Open `/script-analysis?symbol=NABIL`.
   - Broker #58's cumulative holding line shoots vertically upward by +25,000 shares.
   - Broker #58's **Estimated Cost Basis** adjusts to Rs. 584.20.
4. **Actionable Deduction**:
   - An institutional buyer at Naasa placed a massive bet at Rs. 585.
   - Any future pullback towards Rs. 580–585 represents strong institutional buying support!

---

## 7. Actionable Risk Management Strategies

1. **Don't Fight Block Deals**:
   - If a stock is falling and the Largest Block Deals table reveals multiple `> 1M` sell contracts from premier brokers, do not try to "catch the falling knife".
2. **Identify Anchor Support Levels**:
   - The transacted price of mega block deals often serves as a psychological and structural floor for weeks to come.
3. **Gauge Retail Euphoria**:
   - If a stock's volume is surging but 95% of trades are in the `< 10K` bucket, the move is driven by retail frenzy rather than institutional backing.

---

## 8. Pro Tips & Shortcuts

- 🔄 **Refresh Button**: Tap **Refresh** to query the latest block deals without stale caching.
- 📱 **Table Slicing**: Sort by amount descending to instantly inspect the top 25 block trades of the trading session.

---

## 9. Frequently Asked Questions (FAQ)

### Q1: What is the official NEPSE definition of a block deal?
**A:** In this analytics platform, any trade equal to or exceeding **Rs. 1,000,000 (10 Lakhs)** is classified as a Mega Block Deal.

### Q2: Can a block deal be canceled by the exchange?
**A:** No. Once a contract ID is issued and recorded in the official floorsheet, the trade is legally binding and settled through CDS and Clearing Limited (CDSC).

---

*Happy Trading & Block Deal Tracking! 🚀📊*
