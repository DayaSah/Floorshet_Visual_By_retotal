# ⏰ Time Patterns — Beginner's & Trader's Guide

> **Timing is everything in the market.** The Time Patterns tab (`/time-patterns`) dissects NEPSE trading activity across the trading clock, revealing intraday liquidity cycles (5-minute buckets) and day-of-week volume seasonality.

---

## 📌 Table of Contents
1. [What is Time Patterns and Why Does It Matter?](#1-what-is-time-patterns-and-why-does-it-matter)
2. [Timing KPIs & Peak Intervals](#2-timing-kpis--peak-intervals)
3. [The Two Core Visualizations](#3-the-two-core-visualizations)
   - [A. Intraday Activity (5-Minute Buckets Histogram)](#a-intraday-activity-5-minute-buckets-histogram)
   - [B. Weekly Seasonality (Activity by Day of Week)](#b-weekly-seasonality-activity-by-day-of-week)
4. [The Anatomy of a NEPSE Trading Day](#4-the-anatomy-of-a-nepse-trading-day)
   - [11:00 AM – 11:30 AM: The Opening Rush](#1100-am--1130-am-the-opening-rush)
   - [11:30 AM – 1:30 PM: The Midday Lull](#1130-am--130-pm-the-midday-lull)
   - [1:30 PM – 3:00 PM: The Power Hour & Market Close](#130-pm--300-pm-the-power-hour--market-close)
5. [Day of Week Dynamics in Nepal (Sunday to Thursday)](#5-day-of-week-dynamics-in-nepal-sunday-to-thursday)
6. [Actionable Execution Strategies](#6-actionable-execution-strategies)
7. [Pro Tips & Shortcuts](#7-pro-tips--shortcuts)
8. [Frequently Asked Questions (FAQ)](#8-frequently-asked-questions-faq)

---

## 1. What is Time Patterns and Why Does It Matter?

Retail traders often enter orders whenever they feel like it, paying high slippage and getting whipsawed. In contrast, institutional algorithms and seasoned market makers execute with clockwork precision:
- *When is liquidity deepest so large orders can be filled without slippage?*
- *At what time of day does smart money execute block orders?*
- *Which day of the week experiences the heaviest turnover?*

The **Time Patterns** tab visualizes these rhythm cycles so you never trade blindly against the market clock.

---

## 2. Timing KPIs & Peak Intervals

At the top of `/time-patterns`, two KPI cards highlight peak liquidity moments:

```
+-----------------------------------+-----------------------------------+
| ⏰ Busiest Interval               | 📅 Busiest Day of Week            |
| 14:55 (2:55 PM)                   | Sunday                            |
| 124,510 trades executed           | Rs. 38.4 Crore avg turnover       |
+-----------------------------------+-----------------------------------+
```

1. **Busiest Interval**: The exact 5-minute window with the highest execution density across all trading sessions.
2. **Busiest Day of Week**: The calendar trading day (Sunday through Thursday in Nepal) that commands the largest aggregate turnover.

---

## 3. The Two Core Visualizations

### A. Intraday Activity (5-Minute Buckets Histogram)
- **X-Axis**: 5-minute time intervals from `11:00 AM` to `3:00 PM`.
- **Y-Axis**: Total number of trades executed across the database period.
- **Visual Curve**: Typically forms a classic "U-Shape" or "Hockey Stick" curve:
  - Moderate opening surge at 11:00 AM.
  - Trough during midday (12:00 PM – 1:30 PM).
  - Explosive, vertical spike between 2:30 PM and 3:00 PM!

---

### B. Weekly Seasonality (Activity by Day of Week)
- **X-Axis**: Trading days of the Nepali workweek (Sunday, Monday, Tuesday, Wednesday, Thursday).
- **Y-Axis**: Aggregate turnover (NPR).
- **Why it matters**:
  - Reveals whether investors enter the week aggressively on Sunday or prefer Thursday position squaring before the Friday-Saturday weekend.

---

## 4. The Anatomy of a NEPSE Trading Day

Understanding the three phases of the NEPSE session will dramatically improve your trade fills:

```
 Trades
   ▲
   │   [Opening Rush]              [Midday Lull]              [Power Close]
   │       ▄▄▄                                                    ████
   │       ███                        ▄▄                          ████
   │       ███       ▄▄▄             ████        ▄▄▄▄             ████
   │       ███       ███             ████        ████             ████
   └───────┴──────────┴───────────────┴───────────┴────────────────┴────────► Time
        11:00 AM   12:00 PM        1:00 PM     2:00 PM          3:00 PM
```

### 11:00 AM – 11:30 AM: The Opening Rush
- **Character**: Overnight news absorption, emotional retail market orders, and initial price discovery.
- **Trap**: High volatility and wider bid-ask spreads. Many false breakouts happen in the first 15 minutes.

### 11:30 AM – 1:30 PM: The Midday Lull
- **Character**: Low volume, tight price ranges, and consolidation.
- **Opportunity**: Excellent time for patient limit order placement with minimal price impact.

### 1:30 PM – 3:00 PM: The Power Hour & Market Close
- **Character**: Institutional participation peaks. 40% to 60% of all daily trades are often crammed into the final 45 minutes!
- **Significance**: The closing price determines margin maintenance, mutual fund NAV valuations, and portfolio settlement. Watch how closing candles form to gauge true daily conviction.

---

## 5. Day of Week Dynamics in Nepal (Sunday to Thursday)

| Day of Week | Typical Market Behavior | Trading Implication |
| :--- | :--- | :--- |
| **Sunday (Opening)** | High emotional turnover reacting to weekend news, cabinet announcements, or NRB directives. | Strong trend initiation day. Breakouts on Sunday often continue through Tuesday. |
| **Monday & Tuesday** | Trend confirmation and steady rotation. | Optimal for disciplined swing entries. |
| **Wednesday** | Midweek consolidation; traders evaluate gains. | Sideways price action common. |
| **Thursday (Closing)** | Weekend de-risking and margin settlement. | Late-session selloffs can occur as short-term traders cash out before the 2-day weekend. |

---

## 6. Actionable Execution Strategies

1. **Avoid Market Orders at 11:01 AM**:
   - Spreads are wide and liquidity is thin. Wait until 11:30 AM for the initial volatility to settle.
2. **Execute Whale Orders in the Power Hour**:
   - If buying or selling large blocks, execute between 2:15 PM and 2:55 PM when natural liquidity is at its peak.
3. **Fade Low-Volume Midday Breakouts**:
   - A breakout occurring at 12:30 PM on tiny volume is frequently a trap. Require afternoon volume confirmation before entering.

---

## 7. Pro Tips & Shortcuts

- 🔄 **Live Sync**: Tap **Refresh** to keep the intraday histogram synchronized with recent trading days.
- 📊 **Tooltip Inspections**: Hover over any 5-minute bar to view the exact trade count for that bucket.

---

## 8. Frequently Asked Questions (FAQ)

### Q1: Why does NEPSE have such a massive spike near 3:00 PM?
**A:** In Nepal, brokers and traders often aggregate client orders throughout the day and execute aggressive balancing trades in the closing minutes. Furthermore, intraday scalpers must square off positions before the 3:00 PM market freeze.

### Q2: Are Friday sessions included?
**A:** Regular equity trading in NEPSE is conducted Sunday through Thursday (11:00 AM to 3:00 PM). Fridays are non-trading days for standard secondary equity trades.

---

*Happy Trading & Perfect Market Timing! 🚀⏰*
