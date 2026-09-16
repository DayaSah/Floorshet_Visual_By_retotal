# 📘 Beginner's Complete Guide to Script Analysis

Welcome to the **Script Analysis** module of the **NEPSE Floorsheet Visualizer**! 

This guide is designed for traders, retail investors, and market enthusiasts who want to understand **who is buying, who is selling, and how institutional money is moving** in any specific Nepal Stock Exchange (NEPSE) listed company.

---

## 📑 Table of Contents
1. [What is Script Analysis & Why Does It Matter?](#1-what-is-script-analysis--why-does-it-matter)
2. [Core Concepts Every Beginner Must Know](#2-core-concepts-every-beginner-must-know)
3. [Step-by-Step Walkthrough of the Features](#3-step-by-step-walkthrough-of-the-features)
   - [A. Script (Symbol) Selector](#a-script-symbol-selector)
   - [B. Date Range Window](#b-date-range-window)
   - [C. Script Summary KPIs](#c-script-summary-kpis)
   - [D. Smart Money Sentiment & Accumulation Index](#d-smart-money-sentiment--accumulation-index-aialgorithmic-score)
   - [E. The Daywise Line Diagram (Holding Trajectory)](#e-the-daywise-line-diagram-holding-trajectory)
   - [F. Top 10 Broker Breakdown Table](#f-top-10-broker-breakdown-table)
   - [G. CSV Data Export](#g-csv-data-export)
   - [H. Share Pro Card (Instant Institutional Flow Snapshot)](#h-share-pro-card-instant-institutional-flow-snapshot)
4. [Real-World Example: Analyzing NABIL (Nabil Bank)](#4-real-world-example-analyzing-nabil-nabil-bank)
5. [How to Spot Smart Money (Bullish vs. Bearish Signs)](#5-how-to-spot-smart-money-bullish-vs-bearish-signs)
6. [Pro Tips & Shortcuts](#6-pro-tips--shortcuts)
7. [Frequently Asked Questions (FAQ)](#7-frequently-asked-questions-faq)

---

## 1. What is Script Analysis & Why Does It Matter?

On the Nepal Stock Exchange, stock prices do not move by accident. Large moves are fueled by **institutional investors, mutual funds, high-net-worth individuals (HNIs), and retail trading groups**.

Every single transaction executed on the exchange is recorded in the **Floorsheet**. The **Script Analysis** tab aggregates hundreds of thousands of raw trade records for any selected stock and answers three vital questions:
1. **Which brokerages are heavily accumulating (buying and holding) this stock?**
2. **Which brokerages are dumping or distributing (selling off) their positions?**
3. **How has each top broker's position evolved day-by-day over time?**

By tracking institutional footprints, beginners can stop guessing and start trading alongside **smart money**.

---

## 2. Core Concepts Every Beginner Must Know

Before exploring the tool, understand these four fundamental terms:

| Term | What It Means | Why It Matters |
| :--- | :--- | :--- |
| **Script / Ticker** | The 3-6 letter trading symbol of a company (e.g., `NABIL`, `SHIVM`, `CHCL`, `GBIME`). | Identifies the exact stock you want to analyze. |
| **Broker Number** | Licensed brokerage houses in Nepal (numbered #1 through #101, e.g., Broker #58 is Naasa Securities). | In NEPSE, institutional players often execute through specific major brokerages. |
| **Gross Turnover** | Total Buy Amount + Total Sell Amount for a broker. | Indicates how actively that broker is trading the stock (churn and liquidity). |
| **Net Holding (Net Position)** | `Buy Amount - Sell Amount` (or `Buy Shares - Sell Shares`). | **The most critical metric.** Shows whether a broker's clients are net accumulators or net dumpers. |

### 🟢 Net Buyer (Accumulator)
- If Broker #58 buys **Rs. 50 Lakhs** and sells only **Rs. 10 Lakhs**, their Net Position is **+Rs. 40 Lakhs**.
- Their clients are taking delivery and locking shares away. This creates **buying support**.

### 🔴 Net Seller (Distributor)
- If Broker #34 buys **Rs. 5 Lakhs** and sells **Rs. 35 Lakhs**, their Net Position is **-Rs. 30 Lakhs**.
- Their clients are liquidating shares and taking cash out. This creates **selling pressure**.

---

## 3. Step-by-Step Walkthrough of the Features

When you open the **Script Analysis** tab (`/` or `/script-analysis` — the platform's default homepage), you will see an intuitive control dashboard.

```
+-----------------------------------------------------------------------------------------+
| [ 🔍 Search Script (e.g. NABIL) ]   [ ⚡ 7D | ⚡ 15D | ⚡ 30D | All Time | 📅 Custom ]    |
| Quick Picks: [NABIL] [SHIVM] [CHCL] [GBIME] [HDL] [NICA] [CIT]                          |
+-----------------------------------------------------------------------------------------+
```

### A. Script (Symbol) Selector
1. **Search Bar**: Click on the input box and type any ticker (e.g., `NABIL` or `SHIVM`). An autocomplete list will instantly appear.
2. **Quick Picks**: Tap any of the popular stock chips (`NABIL`, `SHIVM`, `CHCL`, etc.) to load that stock with a single click.
3. **Watchlist Integration**: If you have starred any stocks in your Watchlist (⭐), they are highlighted in the dropdown.

### B. Date Range Window
Select the time period you want to investigate:
- **⚡ Past 7 Days**: Ideal for short-term swing traders looking for immediate momentum or breakout accumulation.
- **⚡ Past 15 Days** *(Default)*: The sweet spot for discovering multi-week institutional positioning.
- **⚡ Past 30 Days**: Best for spotting steady, patient monthly accumulation patterns.
- **All Time**: Analyzes the entire database history.
- **📅 Custom Range**: Allows you to enter specific `From` and `To` dates (e.g., right before an earnings announcement).

> 💡 **Bonus Tip**: The URL automatically updates with your choices (e.g., `?symbol=NABIL&range=15d`). You can bookmark this link or send it to a friend, and it will open the exact same analysis!

---

### C. Script Summary KPIs
Once you choose a stock, four top-level summary cards appear:

1. **Total Script Turnover**: The gross NPR traded in this stock during the selected period, with the Latest Traded Price (LTP).
2. **Shares Traded**: Total shares exchanged, trade count, and the volume-weighted average rate.
3. **Top Accumulator (Net Buyer)**: The #1 broker that accumulated the largest positive net position in NPR, their average buy cost, and whether their holding is currently in profit or underwater.
4. **Top Distributor (Net Seller)**: The #1 broker that offloaded the most shares in NPR and their average exit rate.

---

### D. Smart Money Sentiment & Accumulation Index (Mathematical Engine)

Directly below the KPIs, an automated quantitative algorithm calculates the **Smart Money Index (0 to 100)** to reveal whether institutions are accumulating or distributing.

#### The 3 Mathematical Components:

1. **Component 1: Concentration Delta (0 to 40 Points)**:
   Measures asymmetric order capture (Pareto dominance):
   - $\text{Buyer Conc} = (\sum_{i=1}^5 \text{BuyAmount}_i / \text{Total Buy Vol}) \times 100$
   - $\text{Seller Conc} = (\sum_{i=1}^5 \text{SellAmount}_i / \text{Total Sell Vol}) \times 100$
   - $\Delta_{\text{conc}} = \text{Buyer Conc} - \text{Seller Conc}$
   - $\text{Points}_{\text{conc}} = \min(40, \max(0, 20 + \Delta_{\text{conc}} \times 0.8))$
   - *Interpretation*: When top 5 buyers soak up 75%+ of buying while selling is dispersed across 40+ brokers, points max out at **40**.

2. **Component 2: Net Absorption Balance (0 to 35 Points)**:
   Measures the net monetary tug-of-war between top buyers and sellers:
   - $\text{Net Ratio} = (\text{Top5 Net Inflow} - \text{Top5 Net Outflow}) / (\text{Top5 Net Inflow} + \text{Top5 Net Outflow})$
   - $\text{Points}_{\text{abs}} = \min(35, \max(0, 17.5 + \text{Net Ratio} \times 17.5))$
   - *Interpretation*: If lead buyers absorb all shares dumped into the market, this awards the maximum **35** points.

3. **Component 3: Trajectory Trend Momentum (0 to 25 Points)**:
   Tracks the daily cumulative holding curve of the lead accumulator (`TopBuyer[0]`):
   - **25 Points**: Holdings expanded over the session ($\text{CumNet}_{\text{end}} > \text{CumNet}_{\text{start}}$).
   - **5 Points**: Holdings contracted / unloaded ($\text{CumNet}_{\text{end}} < \text{CumNet}_{\text{start}}$).
   - **12.5 Points**: Neutral holding pattern or insufficient days.

#### Composite Score & Verdict Tiers:

$$\text{Smart Money Index} = \text{round}\Big(\min\big(100, \max(5, \text{Points}_{\text{conc}} + \text{Points}_{\text{abs}} + \text{Points}_{\text{mom}})\big)\Big)$$

- **`75 - 100`**: **Strong Institutional Accumulation 🟢** (Supply actively locked away)
- **`60 - 74`**: **Moderate Accumulation 🔵** (Patient, steady accumulation)
- **`45 - 59`**: **Neutral / Churning 🟡** (Two-sided intraday turnover)
- **`30 - 44`**: **Moderate Distribution 🟠** (Institutions trimming into retail demand)
- **`5 - 29`**: **Heavy Institutional Distribution 🔴** (Aggressive smart money liquidation)

- **Plain-English Institutional Footprint Verdict**: Dynamically names the lead buyers/sellers, exact NPR capital absorbed, and market implications.
- **Buyer vs. Seller Concentration**: Dual visual progress bars displaying the Pareto order capture percentage.

---

### E. The Daywise Line Diagram (Holding Trajectory)

This is the centerpiece of the Script Analysis tab. It plots the **day-by-day cumulative holding trajectory across brokerages**.

```
  Net Holding (NPR)
      ▲
 +15M │                             ─── Broker #57 (Aggressive Accumulation)
 +10M │                     ───────
  +5M │             ───────         ─── Broker #92 (Steady Inflow)
    0 ┼────────────────────────────────────────────────────────► Time (Days)
  -5M │             ───────
 -10M │                     ─────── ─── Broker #22 (Continuous Offloading)
      ▼
```

#### 1. Metric View Modes (Switchable Buttons):
- **Cumulative NPR (Net)**: Starts at Day 1 and plots the running total of net money each broker has accumulated.
  - *Upward-sloping line* = The broker is buying more every day.
  - *Downward-sloping line* = The broker is selling out every day.
  - *Flat horizontal line* = The broker stopped trading or is balancing buy and sell equally.
- **Cumulative Shares**: Same as above, but measured in **number of shares** instead of rupees.
- **Daily Net NPR**: Shows the exact net position taken on each single day (spikes indicate aggressive single-day buying or selling).
- **📈 Price (NPR) Overlay Toggle**: Displays the daily closing price line (amber dashed) on a secondary right Y-axis directly on top of broker trajectories to reveal **Smart Money Divergence** (silent accumulation vs. retail distribution).

#### 2. One-Click Trajectory Presets:
Four smart preset buttons allow you to filter the chart in seconds:
- **🟢 Top 5 Accumulators**: Displays only the top 5 net buyers (`netAmount > 0`), isolating institutional buying pressure.
- **🔴 Top 5 Distributors**: Displays only the top 5 net sellers (`netAmount < 0`), showing who is liquidating shares.
- **⚖️ Top 5 Acc + 5 Dist** *(Default)*: Plots both top 5 accumulators and top 5 distributors side-by-side to reveal who is absorbing whose supply.
- **🌐 All Listed Brokers (All 96 Brokers)**: Renders the trajectory lines for **all brokers** who traded that stock in that period, giving you the complete, macro market footprint.

#### 3. Searchable Broker Chip Tray & Individual Toggles:
- Below the preset bar, an interactive tray displays every active broker with their signature color dot, broker ID, and net position badge (e.g. `+Rs. 10.2M` or `-Rs. 8.1M`).
- Use the **Filter broker #** search box to quickly find any specific broker (e.g. `58` or `Naasa`) and toggle their line on or off.
- Click **Clear All** anytime to reset the chart and construct your own custom broker comparison.

#### 4. Interactive Tooltip:
- Hover your mouse (or tap on mobile) anywhere on the chart.
- A popup reveals the exact date, registered broker names, and exact net rupees or shares accumulated up to that day, sorted automatically with the largest positions at the top.

---

### F. Top 10 Broker Breakdown Table

Below the chart sits a ranked table displaying the numerical breakdown for the top brokers.

#### Table Tabs:
- 🟢 **Top 10 Accumulators**: Ranks brokers with positive net holdings from highest to lowest.
- 🔴 **Top 10 Distributors**: Ranks brokers with negative net holdings from most aggressive seller to least.
- 📊 **Top 10 by Gross Turnover**: Ranks brokers by total combined volume (buyers and sellers).

#### Table Columns:
1. **Rank (`#`)**: 1 to 10.
2. **Broker**: Star button (⭐) to add to your Watchlist, plus the registered company name (e.g., `Naasa Securities (#58)`). Clicking the broker name opens their full brokerage profile.
3. **Buy Amount, Shares & Avg Rate**: Total value and unit count bought by that broker, with their **Average Buy Rate (VWAP)**.
4. **Sell Amount, Shares & Avg Rate**: Total value and unit count sold by that broker, with their **Average Sell Rate (VWAP)**.
5. **Net Holding**: The net balance highlighted in green badge (`+Rs.`) or red badge (`-Rs.`), alongside net share count.
6. **Est. Cost & Position Status**: The broker's calculated cost basis compared against the Latest Traded Price (LTP). Shows whether their net position is **In Profit (+X% 🟢)** or **Underwater (-X% 🔴)**, providing powerful insights into institutional support zones!
7. **Turnover Share**: Visual progress bar showing what percentage of the entire stock's turnover went through this single brokerage.

---

### G. CSV Data Export
- **Export CSV** (Header): Downloads the complete broker breakdown table to a spreadsheet with average buy/sell rates.
- **Export Timeline** (Chart Header): Downloads the day-by-day net values and closing prices for every broker into a CSV file.
- Perfect for building custom models in Microsoft Excel, Google Sheets, or Python.

---

### H. Share Pro Card (Instant Institutional Flow Snapshot)
- Click **Share Pro Card** in the top header to generate a branded, high-resolution social graphic.
- **Copy Image**: Copies the PNG directly to your system clipboard with 1 click, ready to paste into Telegram groups, Discord, Viber, or X.
- **Download PNG**: Saves a Retina-quality graphic with the company ticker, latest price, Smart Money Index score, top buyers, top sellers, and net holding footprints.

---

## 4. Real-World Example: Analyzing NABIL (Nabil Bank)

Let's walk through an actual analysis of **NABIL** over the **Past 15 Days**:

### Step 1: Open the Tab & Select NABIL
1. Navigate to **Script Analysis**.
2. Click the `NABIL` quick chip or type `NABIL`.
3. Ensure `Past 15 Days` is highlighted.

### Step 2: Read the Headline Numbers
- **Total Turnover**: Rs. 18.2 Crore (181.9M NPR).
- **Total Shares**: 326,792 shares traded across 1,656 transactions.
- **Top Accumulator**: Broker #57 (Aryatara Securities) with **+Rs. 1.02 Crore** (+18,547 shares).
- **Top Distributor**: Broker #22 (Siprabi Securities) with **-Rs. 1.01 Crore** (-18,852 shares).

### Step 3: Interpret the Line Diagram
1. Look at the **Broker #57 (Aryatara)** line:
   - It starts near zero on Day 1 and slopes steadily upward to `+Rs. 10.2M` by Day 11.
   - **Conclusion**: Broker #57 was not a one-day wonder. They patiently accumulated shares almost every trading session.
2. Look at the **Broker #22 (Siprabi)** line:
   - It slopes steadily downward, reaching `-Rs. 10.1M`.
   - **Conclusion**: An institution or major shareholder holding an account at Broker #22 was offloading a large block of shares.
3. Look at **Broker #58 (Naasa)**:
   - High gross turnover (over Rs. 2.2 Crore), but the cumulative net line stays near zero.
   - **Conclusion**: Broker #58 clients are actively trading intraday or swing trading back and forth, rather than holding.

### Step 4: The Strategic Takeaway
- Even though Broker #22 dumped over 18,000 shares, the stock did not collapse because Broker #57, Broker #92, and Broker #45 absorbed all the supply.
- If the selling pressure from Broker #22 dries up while Broker #57 continues buying, **the stock price is primed for an upward breakout!**

---

## 5. How to Spot Smart Money (Bullish vs. Bearish Signs)

| Scenario | What You See on Script Analysis | Market Interpretation | Actionable Insight |
| :--- | :--- | :--- | :--- |
| **Institutional Accumulation (Bullish)** | 1 or 2 top brokers have massive positive net holdings, while sellers are fragmented across 20+ smaller brokers. | Strong hands are absorbing shares from weak retail sellers. | Favorable setup for an upward price move. |
| **Institutional Distribution (Bearish)** | 1 or 2 top brokers have massive negative net holdings, while buyers are scattered retail traders. | Major players are using market liquidity to exit their positions. | Caution advised; risk of price drop. |
| **Whale Absorption** | A major broker sells Rs. 1 Crore+, but another single broker steps in and buys Rs. 1 Crore+. | Block transfer / institutional handoff. | Price often consolidates and forms a strong support floor. |
| **High Churn / Speculation** | High buy and sell amounts with net position near zero across all top 10 brokers. | Day trading and churning without long-term commitment. | Expect volatility without clear directional trend. |

---

## 6. Pro Tips & Shortcuts

- ⌨️ **Quick Navigation (`⌘K` / `Ctrl+K`)**: Press `⌘K` anywhere in the app and type `Script Analysis` or type any stock symbol to jump instantly.
- ⭐ **Star Your Tickers & Brokers**: Click the Star icon next to any broker or symbol. They will instantly appear on your sticky top Watchlist bar.
- 📱 **Mobile Friendly**: You can install this platform as an app on your phone via the PWA "Install" prompt. On mobile, use your thumb to switch between 7D, 15D, and 30D views effortlessly.
- 🔄 **Cross-Reference with Market Radar**: If you see a broker accumulating heavily in Script Analysis, switch to the **Market Radar** tab to check if they executed whale block deals (> 10 Lakhs).

---

## 7. Frequently Asked Questions (FAQ)

### Q1: Does high broker accumulation guarantee that the stock will rise?
**A:** No single indicator guarantees price movement. However, institutional accumulation shows where large capital is committed. When big players buy and hold, the floating market supply shrinks, making price increases much more probable.

### Q2: What if a broker has a huge Buy Amount but also a huge Sell Amount?
**A:** That indicates high liquidity and active turnover (such as retail clients buying while other clients of the same brokerage sell, or active swing traders). Always check the **Net Holding** column to see the true directional bias.

### Q3: Why do some brokers show negative share amounts?
**A:** A negative amount simply means that the clients of that broker sold more shares than they bought during that specific date window.

### Q4: How frequently is the data updated?
**A:** When you select a stock, data is fetched and cached in high-speed memory for 4 hours. You can click the **Refresh** button at any time to bypass cache and query the latest database records.

---

*Happy Trading & Smart Analysis! 🚀📊*
