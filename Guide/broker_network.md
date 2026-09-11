# 🕸️ Broker Network — Beginner's & Trader's Guide

> **Uncover the hidden alliances and liquidity corridors of NEPSE.** The Broker Network tab (`/broker-network`) maps the counterparty relationships between brokerages, revealing which brokers actively buy from and sell to each other.

---

## 📌 Table of Contents
1. [What is the Broker Network and Why Does It Matter?](#1-what-is-the-broker-network-and-why-does-it-matter)
2. [Network Headline KPIs](#2-network-headline-kpis)
3. [The Two Core Visualizations](#3-the-two-core-visualizations)
   - [A. Top 20 Broker Pairs by Turnover (Horizontal Bar Chart)](#a-top-20-broker-pairs-by-turnover-horizontal-bar-chart)
   - [B. Top 10 Brokers Turnover Matrix (10x10 Heatmap Grid)](#b-top-10-brokers-turnover-matrix-10x10-heatmap-grid)
4. [Decoding the Heatmap Matrix](#4-decoding-the-heatmap-matrix)
   - [Diagonal Cells: Internal Crossings](#diagonal-cells-internal-crossings)
   - [Off-Diagonal Hotspots: Institutional Corridors](#off-diagonal-hotspots-institutional-corridors)
5. [Real-World Example: Identifying an Inter-Broker Accumulation Corridor](#5-real-world-example-identifying-an-inter-broker-accumulation-corridor)
6. [Actionable Trader Takeaways](#6-actionable-trader-takeaways)
7. [Pro Tips & Shortcuts](#7-pro-tips--shortcuts)
8. [Frequently Asked Questions (FAQ)](#8-frequently-asked-questions-faq)

---

## 1. What is the Broker Network and Why Does It Matter?

In NEPSE, trading does not happen in a vacuum. Shares move through specific broker-to-broker conduits:
- Does Broker #58 consistently absorb selling pressure from Broker #45?
- Are certain brokerages trading almost exclusively within their own in-house accounts?
- When a major institutional selloff begins, which specific brokerages step in as counterparties to provide liquidity?

The **Broker Network** tab models NEPSE as a connected counterparty graph, spotlighting the high-volume highways of Nepali capital.

---

## 2. Network Headline KPIs

At the top of `/broker-network`, three summary metrics frame counterparty activity:

```
+-----------------------------------+-----------------------------------+-----------------------------------+
| 🕸️ Tracked Broker Pairs           | 💰 Largest Pair Turnover          | 🏆 Top Broker Pair                |
| 20 Major Corridors                | Rs. 18.5 Crore                    | #58 (Naasa) ──► #45 (Imperial)    |
| Primary inter-broker channels     | Peak counterparty exchange        | Dominant capital pipeline         |
+-----------------------------------+-----------------------------------+-----------------------------------+
```

1. **Tracked Broker Pairs**: Number of major bilateral trading relationships analyzed.
2. **Largest Pair Turnover**: Total rupee value transacted between the #1 buyer broker and #1 seller broker pair.
3. **Top Broker Pair**: The exact buyer and seller broker IDs constituting the strongest trading channel.

---

## 3. The Two Core Visualizations

### A. Top 20 Broker Pairs by Turnover (Horizontal Bar Chart)
- **What it displays**: A ranked bar chart displaying the 20 largest counterparty corridors formatted as `Buyer -> Seller` (e.g., `58 -> 45`).
- **Data Points**: Total turnover (NPR), share units exchanged, and total trade contract count.
- **Why it matters**: Identifies the primary liquidity pipelines in the market.

---

### B. Top 10 Brokers Turnover Matrix (10x10 Heatmap Grid)
- **What it displays**: A 10x10 cross-tabulation table where:
  - **Rows** = Purchasing Broker (Buyer).
  - **Columns** = Liquidating Broker (Seller).
  - **Cells** = Total gross turnover exchanged between that specific pair.
- **Color Intensity (Heatmap)**:
  - Cells are dynamically shaded based on trading intensity.
  - **Darker, vibrant cells** represent heavy capital concentration.
  - **Lighter, translucent cells** represent minimal trading activity.

---

## 4. Decoding the Heatmap Matrix

```
                Seller Broker (#)
          | #58    | #45    | #57    | #28    | #34    | ...
   ───────+────────+────────+────────+────────+────────+
    #58   | [ 14M ]| [ 18M ]| [  6M ]| [  9M ]| [  4M ]|
 B  #45   | [  8M ]| [  7M ]| [  2M ]| [  5M ]| [  1M ]|
 u  #57   | [ 12M ]| [  4M ]| [  5M ]| [  3M ]| [  2M ]|
 y  #28   | [  7M ]| [  3M ]| [  2M ]| [  4M ]| [  1M ]|
 e  ...   | ...    | ...    | ...    | ...    | ...    |
```

### Diagonal Cells: Internal Crossings
- When `Buyer Broker == Seller Broker` (e.g., Row #58, Column #58), the trade was matched entirely within that single brokerage.
- A glowing diagonal indicates a brokerage with a massive internal client base capable of sustaining high turnover without relying on outside market liquidity.

### Off-Diagonal Hotspots: Institutional Corridors
- When an off-diagonal cell lights up with high volume (e.g., Buyer #58 and Seller #45), it shows where supply is migrating from one institution to another.
- If Broker #58 buys Rs. 18 Crore from Broker #45, but Broker #45 buys only Rs. 8 Crore back from Broker #58, **Rs. 10 Crore of net capital has flowed from Broker #45 into Broker #58!**

---

## 5. Real-World Example: Identifying an Inter-Broker Accumulation Corridor

1. Open `/broker-network`.
2. Inspect the **Top 20 Broker Pairs** chart:
   - You notice `57 -> 22` is ranked #3 with Rs. 11.2 Crore turnover.
3. Check the **10x10 Matrix**:
   - Row #57 (Aryatara), Column #22 (Siprabi) shows Rs. 11.2 Crore.
   - Row #22 (Siprabi), Column #57 (Aryatara) shows only Rs. 1.1 Crore.
4. **Strategic Conclusion**:
   - This is a **one-way liquidity corridor**.
   - Broker #22 is serving as a primary source of institutional supply, while Broker #57 is absorbing every share.
   - Jump to [Script Analysis](scriptanalysis.md) to find out which specific stock (e.g. NABIL) this corridor was trading!

---

## 6. Actionable Trader Takeaways

| Network Pattern | What You Observe | Market Implication | Actionable Response |
| :--- | :--- | :--- | :--- |
| **High Internal Density** | Diagonal cells are the darkest on the matrix. | Large brokerages are self-matching orders internally. | Stable pricing; low external market impact. |
| **Asymmetric Corridor** | Pair A -> B turnover is 5x higher than Pair B -> A turnover. | Direct institutional wealth transfer from B to A. | Follow Broker A's holdings in [Broker Analysis](brokers.md). |
| **Bilateral Churn** | Pair A -> B and Pair B -> A have nearly equal, high volume. | Active two-way swing trading between client bases. | High liquidity; favorable for day trading. |

---

## 7. Pro Tips & Shortcuts

- 🔍 **Inspect Cell Tooltips**: Hover over any matrix cell to see the full broker names and exact NPR turnover.
- 🔄 **Refresh Button**: Click the top-right Refresh button to update the counterparty matrix with the newest trades.
- 📱 **Horizontal Scrolling**: On tablets and mobile devices, the matrix supports smooth horizontal scrolling with frozen row headers.

---

## 8. Frequently Asked Questions (FAQ)

### Q1: Why are the top 10 brokers used for the matrix instead of all 96 brokers?
**A:** A 96x96 matrix contains 9,216 cells, which would create extreme cognitive overload. The top 10 brokers account for over 65% of all NEPSE trading volume, capturing the vast majority of institutional signals.

### Q2: Does a high counterparty volume imply collusion?
**A:** No. In a liquid electronic exchange like NEPSE, orders are matched automatically based on price-time priority. High turnover between top brokerages simply reflects their large market share and active client trading books.

---

*Happy Trading & Network Analysis! 🚀🕸️*
