# 🎮 Trader's Fun Lounge — Complete User Guide

> **Tab:** Fun · **Route:** `/fun` · **Purpose:** Relax, learn, and laugh between trading sessions

The **Trader's Fun Lounge** is the entertainment wing of Floorsheet Visual. After hours of staring at red and green candles, every trader deserves a break. This tab packs **6 fully interactive activities** — all running entirely in your browser with zero external dependencies, zero API calls, and zero data uploads. Pure offline fun!

---

## 📑 Table of Contents

- [A. Getting Started](#a-getting-started)
- [B. Activity 1 — 60-Second Chart Trader](#b-activity-1--60-second-chart-trader)
- [C. Activity 2 — NEPSE Magic 8-Ball & Fortune Wheel](#c-activity-2--nepse-magic-8-ball--fortune-wheel)
- [D. Activity 3 — Which NEPSE Trader Are You?](#d-activity-3--which-nepse-trader-are-you)
- [E. Activity 4 — Chiya & Momo Profit Converter](#e-activity-4--chiya--momo-profit-converter)
- [F. Activity 5 — NEPSE Trivia Blitz](#f-activity-5--nepse-trivia-blitz)
- [G. Activity 6 — Market Soundboard](#g-activity-6--market-soundboard)
- [H. Sound Controls & Settings](#h-sound-controls--settings)
- [I. Tips & Fun Facts](#i-tips--fun-facts)

---

## A. Getting Started

1. **Navigate** to the **Fun** tab in the top navigation bar (the 🎮 pink gamepad icon)
2. You can also reach it via the **Command Palette** (`Ctrl+K` / `⌘K`) — type "Fun"
3. Choose any of the **6 activity tabs** at the top of the page

The Fun Lounge header shows a **Sound Toggle** button in the top-right corner. All activities use synthesized Web Audio effects — toggle mute/unmute anytime.

---

## B. Activity 1 — 60-Second Chart Trader

**Concept:** You start with **Rs. 100,000 virtual cash**. A simulated stock (`$LUCK`) ticks every second with realistic volatility. Your job: **buy low, sell high, and beat the clock!**

### How to Play

| Step | Action |
|------|--------|
| 1 | Click **"Start 60s Game"** to begin the trading session |
| 2 | Watch the **live SVG price chart** — it updates every second |
| 3 | Click **"BUY 100 Shares"** to purchase 100 kitta at the current rate |
| 4 | Click **"ALL IN BUY"** to invest all available cash at the current rate |
| 5 | Click **"SELL ALL"** to liquidate your entire holding for cash |
| 6 | When the timer hits **0 seconds**, the game ends automatically |

### Dashboard HUD

- **Time Left** — Countdown from 60s (turns red and pulses below 10 seconds)
- **Current Stock Rate** — The live price of `$LUCK` in Rs.
- **Cash Available** — Your free cash balance
- **Shares Owned** — Number of kitta you hold
- **Total Equity / PnL** — Combined value (cash + shares × rate) with percentage gain/loss

### Random Market Shocks

The simulator randomly triggers events:
- ⚡ **Whale Inflow** (+4% spike) — accompanied by the whale splash sound
- 📉 **Profit Booking Panic** (-3.5% sudden drop)

### Titles Unlocked at Game Over

| PnL Range | Title |
|-----------|-------|
| +40% or more | 👑 Giga Bull of Putalisadak |
| +15% to +39% | 💎 Diamond Hands Prodigy |
| 0% to +14% | ☕ Chiya & Breakfast Profit Taker |
| -1% to -20% | 🧻 Paper Hands Panic Seller |
| Below -20% | 🎒 Certified Bag Holder of 3200 Peak |

Your **high score** is saved in `localStorage` and displayed as "Record" on the game card.

---

## C. Activity 2 — NEPSE Magic 8-Ball & Fortune Wheel

This activity has **two zones** displayed side by side:

### Zone A: The NEPSE Magic 8-Ball 🔮

A beautiful 3D-styled floating 8-ball that answers your market questions with hilariously relatable NEPSE-themed fortunes.

**How to use:**
1. Type your question in the input field (e.g., "Should I buy NABIL?")
2. Press **Enter** or click **"Ask"**
3. The 8-ball shakes with a bounce animation and reveals a fortune

You can also click the **Quick Prompt** chips below the input:
- "Will NEPSE cross 3000?"
- "Should I sell before Thursday?"
- "Is Broker 58 buying for real?"
- "Will my Hydro stock recover?"

There are **20 unique oracle answers**, ranging from hilarious tea-stall wisdom to surprisingly useful trading psychology tips.

### Zone B: The Lucky Stock Fortune Wheel 🎡

A beautifully rendered **SVG spinning wheel** with 10 real NEPSE stocks:

| Stock | Sector |
|-------|--------|
| NABIL | Commercial Banking |
| SHIVM | Cement / Manufacturing |
| CHCL | Hydropower |
| GBIME | Commercial Banking |
| HDL | Manufacturing |
| NICA | Commercial Banking |
| CIT | Insurance |
| UPPER | Hydropower |
| SCB | Commercial Banking |
| HIDCL | Investment |

**How to spin:**
1. Click **"SPIN THE WHEEL!"**
2. The wheel rotates 5+ full revolutions with a smooth deceleration
3. A needle pointer at the top selects your lucky stock
4. You receive a personalized **market horoscope** for that stock
5. A link lets you jump directly to **Script Analysis** for that symbol

---

## D. Activity 3 — Which NEPSE Trader Are You?

A **4-question personality quiz** that reveals your NEPSE trader spirit animal from 5 possible personas:

| Persona | Emoji | Archetype |
|---------|-------|-----------|
| The Putalisadak Whale (#58) | 🐋 | Deep-pocketed institutional accumulator |
| The 3-Minute TMS Scalper | 🐒 | Lightning-fast day trader burning through commissions |
| The Chiya Stall Market Guru | ☕ | All talk, minimal execution, legendary storyteller |
| The Circuit Rocket Chaser | ⚡ | Buys at +9.8% circuit, holds the bag when it breaks |
| The Accidental Value Investor | 🧘 | Bought for a swing trade, still holding 3 years later |

### Your Result Card Shows:

- **Spirit Persona title** with emoji
- **Signature Quote** — a hilarious one-liner
- **Superpower** — what you're naturally great at
- **Fatal Flaw** — your Achilles heel
- **Natural Broker Habitat** — which broker number suits your style

You can click **"Retake Quiz"** anytime to try again.

---

## E. Activity 4 — Chiya & Momo Profit Converter

Portfolio numbers are abstract. This converter translates your **NEPSE profit or loss** into **real Nepali everyday expenses** you can feel:

### Conversion Categories

| Item | Unit Cost (NPR) | Icon |
|------|-----------------|------|
| Special Milk Chiya | Rs. 25 / cup | ☕ |
| Steam Buff Momo | Rs. 150 / plate | 🥟 |
| Petrol for Bike | Rs. 175 / liter | 🛵 |
| FTTH WiFi Internet | Rs. 1,200 / month | 📱 |
| Pokhara Lakeside Trip | Rs. 12,000 / trip | 🏖️ |

### How to Use:

1. Enter your profit or loss amount (positive or negative number)
2. Use the **preset buttons** (+5k, +25k, +100k, -10k, -50k) for quick input
3. All 5 conversion cards update in real-time
4. Negative values show a "Moral Support" card instead of a celebration

---

## F. Activity 5 — NEPSE Trivia Blitz

Test your knowledge of the Nepal Stock Exchange with **10 multiple-choice questions** covering:

- NEPSE all-time highs and historical records
- Broker IDs and securities regulations
- Settlement cycles and circuit breaker rules
- Trading hours and market terminology
- Nepali trader slang and culture
- Sector weightings and regulatory bodies
- Floorsheet-specific concepts (internal crossings, block deals)

### Gameplay Flow:

1. Read the question and select one of 4 options
2. Your choice is immediately highlighted — ✅ green for correct, ❌ red for wrong
3. A **detailed explanation** appears below each question
4. Click **"Next Question"** to advance
5. After question 10, see your final score and unlock a title

### Titles Based on Score:

| Score | Title |
|-------|-------|
| 9-10 / 10 | 👑 Big Bull of NEPSE |
| 7-8 / 10 | 📈 Senior Floor Trader |
| 5-6 / 10 | 📊 Active TMS User |
| 0-4 / 10 | 🎒 IPO Babu (Still Learning) |

---

## G. Activity 6 — Market Soundboard

**7 synthesized sound effects** powered by the Web Audio API — no audio files, no downloads, no external resources. Every sound is mathematically generated in real-time:

| Sound | Trigger | Description |
|-------|---------|-------------|
| 🔔 Opening Bell | `playBell()` | C Major chord harmonics — 11:00 AM vibes |
| 🚀 Upper Circuit | `playCircuit()` | Rising scale brass fanfare — +10% celebration |
| 💀 Negative Circuit | `playLoss()` | Descending sad trombone — -10% despair |
| 💵 Ka-Ching | `playCash()` | Dual-tone cash register — profit taken! |
| 🐋 Whale Splash | `playWhale()` | Deep bass resonance — institutional dive |
| 🚨 Margin Call | `playAlarm()` | Rapid square wave siren — broker calling |
| 🖱️ Click | `playClick()` | Short woodblock tick — UI interaction |

**Tap any card** to hear the sound. The soundboard respects the global mute toggle.

---

## H. Sound Controls & Settings

- **Mute/Unmute Toggle** — Click the 🔊/🔇 button in the top-right corner of the Fun Lounge header
- **Persistence** — Your mute preference is stored in `localStorage` (`nepse_fun_sound_muted`)
- **Browser Support** — Works on all modern browsers (Chrome, Firefox, Edge, Safari). First click may require browser audio context activation.

---

## I. Tips & Fun Facts

💡 **Tips for the 60-Second Trader:**
- Don't go ALL IN immediately — wait for a dip
- Watch for the "Whale Inflow" shock event and sell at the spike
- The price tends to drift upward slightly (0.49 bias) — patience pays

💡 **Oracle Pro Tips:**
- The oracle gives different answers every time — try asking the same question twice!
- Quick prompt chips auto-fill AND auto-ask in one click

💡 **Technical Facts:**
- The entire Fun Lounge runs 100% offline after initial page load
- All sound effects are synthesized using `OscillatorNode` and `GainNode` — zero audio file downloads
- The fortune wheel uses pure SVG with CSS `transform: rotate()` transitions
- The confetti effect renders 90 particles on a full-screen HTML5 canvas
- High scores are persisted in `localStorage` across browser sessions
- The page is **code-split** via React `lazy()` — it only loads when you visit `/fun`

---

> 🎯 **Remember:** The Fun Lounge is purely for entertainment and stress relief. No real money, no real trades, no real financial advice. Just pure NEPSE-flavored fun! ☕🥟🎮
