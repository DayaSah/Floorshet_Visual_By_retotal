# 👥 Broker Analysis — Beginner's & Trader's Guide

> **Follow the Smart Money behind the market.** The Broker Analysis tab (`/brokers`) decodes the trading behavior of all 101 official NEPSE brokerages, exposing who is aggressively accumulating, who is liquidating, and which individual stocks they are targeting.

---

## 📌 Table of Contents
1. [What is Broker Analysis and Why Does It Matter?](#1-what-is-broker-analysis-and-why-does-it-matter)
2. [Market-Wide Broker Intelligence](#2-market-wide-broker-intelligence)
   - [A. Macro Market Sentiment KPIs](#a-macro-market-sentiment-kpis)
   - [B. Top Brokers by Turnover Chart](#b-top-brokers-by-turnover-chart)
   - [C. Top Accumulators & Distributors Cards](#c-top-accumulators--distributors-cards)
3. [Deep-Dive Broker Profile (Broker Selection)](#3-deep-dive-broker-profile-broker-selection)
   - [A. Broker Headline Financials](#a-broker-headline-financials)
   - [B. Daily Inflow vs. Outflow Chart](#b-daily-inflow-vs-outflow-chart)
   - [C. Stock Holdings Portfolio Breakdown](#c-stock-holdings-portfolio-breakdown)
4. [Master Broker Rankings Table](#4-master-broker-rankings-table)
5. [Real-World Example: Tracking Broker #58 (Naasa Securities)](#5-real-world-example-tracking-broker-58-naasa-securities)
6. [Actionable Strategies for Following Broker Flow](#6-actionable-strategies-for-following-broker-flow)
7. [Pro Tips & Shortcuts](#7-pro-tips--shortcuts)
8. [Frequently Asked Questions (FAQ)](#8-frequently-asked-questions-faq)

---

## 1. What is Broker Analysis and Why Does It Matter?

In NEPSE, retail traders often follow rumors or social media tips. In contrast, successful investors track **Broker Flows**:
- Brokerages like **#58 (Naasa)**, **#45 (Imperial)**, **#28 (Shree Hari)**, or **#57 (Aryatara)** often handle orders for institutional mutual funds, high-net-worth investors (HNIs), and promoter syndicates.
- By tracking a broker's net balance (`Buy Amount - Sell Amount`), you can see whether big capital is building a position or offloading inventory to the public.

---

## 2. Market-Wide Broker Intelligence

When you navigate to `/brokers`, the upper section summarizes broker participation:

```
+---------------------------------------------------------------------------------------------------+
| 👥 Active Brokers: 96   | 🟢 Accumulators: 42   | 🔴 Distributors: 54   | ⚖️ Market Balance: Mild Sell |
+---------------------------------------------------------------------------------------------------+
```

### A. Macro Market Sentiment KPIs
- **Active Brokers**: Total brokerages that executed trades in this period.
- **Accumulators vs. Distributors**: Compares how many brokers ended with positive net holdings versus negative net holdings.
- **Market Balance**: If accumulator brokers outnumber distributors, broad institutional buying sentiment is favorable.

---

### B. Top Brokers by Turnover Chart
- A ranked horizontal bar chart displaying the largest brokerages by gross turnover (`Buy Amount + Sell Amount`).
- Shows where the vast majority of NEPSE liquidity is physically processed.
- **Click any bar**: Instantly selects that brokerage and loads its complete operational profile.

---

### C. Top Accumulators & Distributors Cards
- 🟢 **Top 8 Accumulators (Net Buyers)**: The brokers with the highest positive net capital balance.
- 🔴 **Top 8 Distributors (Net Sellers)**: The brokers with the highest negative net balance.
- Each item displays the broker's official registered name (e.g. `Naasa Securities (#58)`), net rupee amount badge, and a one-click star (⭐) to add to your Watchlist.

---

## 3. Deep-Dive Broker Profile (Broker Selection)

Select any broker from the dropdown or URL (e.g., `/brokers?broker=58`):

```
+---------------------------------------------------------------------------------------------------+
| 🏦 Broker Profile: #58 — Naasa Securities Ltd.  [⭐ Star]                                         |
+-------------------+-------------------+-------------------+-------------------+-------------------+
| Total Buy Amount  | Total Sell Amount | Net Position      | Gross Turnover    | Executed Trades   |
| Rs. 42.5 Crore    | Rs. 31.8 Crore    | +Rs. 10.7 Cr 🟢   | Rs. 74.3 Crore    | 48,120 Trades     |
+-------------------+-------------------+-------------------+-------------------+-------------------+
```

### A. Broker Headline Financials
- **Total Buy Amount**: Gross capital spent purchasing shares.
- **Total Sell Amount**: Gross capital generated liquidating shares.
- **Net Position**: The bottom-line balance. `+Rs.` indicates net capital injected into equities; `-Rs.` indicates capital withdrawn.
- **Gross Turnover & Trade Count**: Reflects the overall trading velocity of this broker's client base.

---

### B. Daily Inflow vs. Outflow Chart
- **Green Bars**: Daily Buy Amount.
- **Red Bars**: Daily Sell Amount.
- **Blue Line**: Cumulative Net Holding over time.
- **Interpretation**: If green bars consistently overshadow red bars over consecutive trading days, that brokerage's clients are systematically absorbing shares.

---

### C. Stock Holdings Portfolio Breakdown

Directly below the daily chart, an interactive portfolio table reveals the broker's favorite stocks:

#### 1. 💼 Net Holdings Tab:
- Ranks the specific stocks where this broker accumulated the highest net position.
- Reveals which individual tickers the broker's clients are hoarding (`+Net Amount`) and which they are dumping (`-Net Amount`).
- **Click any stock symbol**: Takes you straight to `/script-analysis?symbol=<TICKER>` to see that stock's complete institutional trajectory!

#### 2. 📊 Volume Tab:
- Ranks stocks by total combined volume through this broker, highlighting where their intraday clients are actively speculating.

---

## 4. Master Broker Rankings Table

At the bottom of the page, a full sortable data table ranks all 101 NEPSE brokerages:

| Broker | Broker Name | Buy Amount (NPR) | Sell Amount (NPR) | Net Position | Trades | Gross Turnover |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **#58** | Naasa Securities | 425,120,000 | 318,450,000 | `+Rs. 106,670,000 🟢` | 48,120 | 743,570,000 |
| **#45** | Imperial Securities | 210,400,000 | 280,100,000 | `-Rs. 69,700,000 🔴` | 31,450 | 490,500,000 |

- **Sorting**: Click any column header to sort by turnover, net position, or trade count.
- **CSV Export**: Click **Export CSV** to download the complete broker rankings table.

---

## 5. Real-World Example: Tracking Broker #58 (Naasa Securities)

1. Open `/brokers` and select **#58 (Naasa)**.
2. Review **Net Position**: Naasa is `+Rs. 10.7 Crore` net buyer over the past 15 sessions.
3. Open the **Net Holdings Tab**:
   - Stock #1 on their accumulation list is **NABIL** with `+Rs. 3.2 Crore`.
   - Stock #2 is **SHIVM** with `+Rs. 2.1 Crore`.
4. **Strategic Deduction**:
   - The largest broker in Nepal is deploying massive capital into banking and manufacturing leaders.
   - Click **NABIL** to open [Script Analysis](scriptanalysis.md) and examine their exact daily trajectory line and breakeven cost basis.

---

## 6. Actionable Strategies for Following Broker Flow

| Scenario | Broker Behavior | Market Implication | Recommended Action |
| :--- | :--- | :--- | :--- |
| **Institutional Frontrunning** | Top 3 turnover brokers are all heavily net buying the same stock. | Syndicate or institutional buying consensus. | Look for entry points before retail awareness spreads. |
| **Silent Distribution** | A broker maintains high gross turnover, but their net holding slopes steadily downward. | Institutional offloading disguised by active retail churn. | Take profits or tighten stop losses. |
| **Broker Handoff** | Broker #22 aggressively sells, while Broker #57 and #58 absorb every single share. | Block transfer between institutions. | Identify the average absorption rate as a strong future support floor. |

---

## 7. Pro Tips & Shortcuts

- ⌨️ **Instant Search (`⌘K`)**: Press `⌘K`, type any broker number (e.g., `58`) or name (e.g., `Naasa`), and press Enter to jump to their profile.
- ⭐ **Pin High-Impact Brokers**: Star your top 3 favorite brokerages to keep them pinned in the top Watchlist bar.
- 🔗 **Deep-Link URLs**: Use URLs like `/brokers?broker=45` to share specific broker analysis with your trading group.

---

## 8. Frequently Asked Questions (FAQ)

### Q1: Does a high Net Buy guarantee a broker is making profitable trades?
**A:** Not necessarily. However, large net buying indicates that capital is committed to holding shares rather than scalping intraday. Always cross-reference with the broker's **Estimated Cost Basis** on the [Script Analysis](scriptanalysis.md) tab.

### Q2: Why are some brokers consistently top in turnover?
**A:** Major brokerages like Naasa (#58), Imperial (#45), and Aryatara (#57) have the largest retail branch networks, online client bases, and institutional fund ties in Nepal.

---

*Happy Trading & Smart Broker Tracking! 🚀👥*
