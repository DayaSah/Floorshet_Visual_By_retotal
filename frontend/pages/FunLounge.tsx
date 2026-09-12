import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Award,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  DollarSign,
  Flame,
  Gamepad2,
  HelpCircle,
  PartyPopper,
  Play,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Volume2,
  VolumeX,
  Waves,
  XCircle,
  Zap,
} from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { Button } from '../lib/shadcn/button'
import { Input } from '../lib/shadcn/input'
import {
  getSoundMuted,
  playAlarm,
  playBell,
  playCash,
  playCircuit,
  playClick,
  playLoss,
  playTick,
  playWhale,
  setSoundMuted,
} from '../utils/funSounds'

// --- Canvas Confetti Effect Helper ---
function triggerConfetti() {
  const canvas = document.getElementById('fun-confetti-canvas') as HTMLCanvasElement | null
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']
  const particles: Array<{
    x: number
    y: number
    vx: number
    vy: number
    size: number
    color: string
    rotation: number
    vr: number
  }> = []

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 3 + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.9) * 14,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)] ?? '#10b981',
      rotation: Math.random() * 360,
      vr: (Math.random() - 0.5) * 12,
    })
  }

  let frames = 0
  function render() {
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach((p) => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.35 // gravity
      p.rotation += p.vr

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    })

    frames++
    if (frames < 90) {
      requestAnimationFrame(render)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }
  requestAnimationFrame(render)
}

// ==========================================
// 1. NEPSE TRIVIA QUESTIONS DATABASE
// ==========================================
interface TriviaQuestion {
  question: string
  options: string[]
  answer: number
  explanation: string
}

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    question: 'What is the all-time peak high recorded by the NEPSE index?',
    options: ['3198.45', '3227.11', '3350.20', '3080.12'],
    answer: 1,
    explanation: 'NEPSE recorded its historic all-time closing high of 3,227.11 on August 18, 2021 (Bhadra 2, 2078).',
  },
  {
    question: 'Which official broker ID belongs to Naasa Securities?',
    options: ['Broker #45', 'Broker #28', 'Broker #58', 'Broker #57'],
    answer: 2,
    explanation: 'Naasa Securities Co. Ltd. is registered as NEPSE Broker #58, historically one of the largest by turnover.',
  },
  {
    question: 'What is the standard trade settlement cycle in NEPSE?',
    options: ['T+1', 'T+2', 'T+3', 'T+0 (Instant)'],
    answer: 1,
    explanation: 'NEPSE operates on a T+2 settlement cycle through CDS and Clearing Limited (CDSC).',
  },
  {
    question: 'What is the maximum daily price change percentage allowed for a standard listed equity?',
    options: ['± 5%', '± 10%', '± 15%', '± 20%'],
    answer: 1,
    explanation: 'NEPSE enforces a strict ±10% daily circuit breaker limit on individual equity securities.',
  },
  {
    question: 'What time does regular trading commence on the Nepal Stock Exchange?',
    options: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
    answer: 2,
    explanation: 'Standard continuous trading hours in NEPSE run from 11:00 AM to 3:00 PM, Sunday through Thursday.',
  },
  {
    question: 'In Nepali trader slang, what does "Kitta Thapnu" mean?',
    options: ['Liquidating all shares', 'Averaging down or buying more shares', 'Opening a new TMS account', 'Paying broker interest'],
    answer: 1,
    explanation: '"Kitta Thapnu" translates to adding more shares/units to your position, especially during market dips.',
  },
  {
    question: 'Which sector carries the largest aggregate market capitalization weighting in NEPSE?',
    options: ['Commercial Banks', 'Hydropower', 'Manufacturing & Processing', 'Hotels & Tourism'],
    answer: 0,
    explanation: 'Commercial Banks have traditionally held the largest weighting and highest capital base in NEPSE.',
  },
  {
    question: 'What is the minimum transaction value classified as a "Mega Block Deal" on this platform?',
    options: ['Rs. 100,000 (1 Lakh)', 'Rs. 500,000 (5 Lakhs)', 'Rs. 1,000,000 (10 Lakhs)', 'Rs. 5,000,000 (50 Lakhs)'],
    answer: 2,
    explanation: 'Transactions equal to or exceeding Rs. 1,000,000 (10 Lakhs) represent institutional block power.',
  },
  {
    question: 'Which regulatory body governs and oversees the securities market in Nepal?',
    options: ['Nepal Rastra Bank (NRB)', 'Securities Board of Nepal (SEBON)', 'Ministry of Finance', 'CDSC'],
    answer: 1,
    explanation: 'SEBON (Securities Board of Nepal) is the apex regulatory body governing capital market operations.',
  },
  {
    question: 'What does an "Internal Crossing" mean in a floorsheet transaction?',
    options: ['Buying from an international broker', 'Buyer Broker and Seller Broker are the exact same ID', 'Trade settled outside TMS', 'Trade done on Saturday'],
    answer: 1,
    explanation: 'An Internal Crossing occurs when both the buyer and seller execute through the same brokerage firm.',
  },
]

// ==========================================
// 2. ORACLE 8-BALL FORTUNES (25 AUTHENTIC REPLIES)
// ==========================================
const ORACLE_ANSWERS = [
  '10% Circuit incoming! Kitta thapera basa! 🚀',
  'Asti nai bechnu parne thiyo, aaba chiya khau ☕',
  'Broker #58 is accumulating quietly. Follow the whale! 🐋',
  'NRB Governor is drafting a new circular... caution advised! 📜',
  'Rahu is in your 4th house. Do NOT buy high-beta hydro today 🧘‍♂️',
  'Green candle is tempting, but it is a retail bull trap! 🪤',
  'Strong institutional absorption detected. Diamond Hands! 💎',
  'Ekdum pakka! Putalisadak tea stalls are buzzing with bullish rumors 🗣️',
  'Your stop loss will thank you if you exit before 2:50 PM ⏰',
  'Paper hands panic-selling right now. Opportunity of the month! 🛍️',
  'Wait for 11:30 AM before clicking Buy. Let opening frenzy settle 🛑',
  'Promoter block deal expected. Hold your position steady 🤝',
  'The charts say Buy, your broker says Buy, but your bank account says Sleep 😴',
  'Technical breakout confirmed with volume surge! Send it! 📈',
  'Market is in sideways chop. Take profit and eat some Buff Momo 🥟',
  'Whale absorption at support floor. High probability bounce! 🟢',
  'Sell on Thursday close to sleep peacefully over the weekend 🏖️',
  'TMS server might hang at 2:58 PM, place limit orders early! ⚡',
  'If you didn’t buy at the bottom, don’t chase the top wick! 🕯️',
  'The stars say your dividend is already deposited. Check Meroshare! 💰',
]

// ==========================================
// 3. FORTUNE WHEEL STOCKS & HOROSCOPES
// ==========================================
interface WheelStock {
  symbol: string
  color: string
  horoscope: string
}

const WHEEL_STOCKS: WheelStock[] = [
  { symbol: 'NABIL', color: '#10b981', horoscope: 'The king of commercial banking smiles upon your portfolio today. Steady dividends and institutional support ahead!' },
  { symbol: 'SHIVM', color: '#3b82f6', horoscope: 'Heavy concrete foundations detected. Volatility is high, but long-term builders will prevail.' },
  { symbol: 'CHCL', color: '#f59e0b', horoscope: 'Clean energy flows through your charts. Watch for afternoon volume spikes near market close!' },
  { symbol: 'GBIME', color: '#8b5cf6', horoscope: 'Massive branch network energy. Quiet institutional absorption spotted in the floorsheet.' },
  { symbol: 'HDL', color: '#ec4899', horoscope: 'High spirit and strong flavors! Resistance levels are being tested — drink water and stay patient.' },
  { symbol: 'NICA', color: '#06b6d4', horoscope: 'Aggressive retail liquidity. Quick swing momentum could reward fast-fingered traders.' },
  { symbol: 'CIT', color: '#14b8a6', horoscope: 'Trust is your greatest asset. Institutional money keeps this ship rock steady through market storms.' },
  { symbol: 'UPPER', color: '#f97316', horoscope: 'Turbines are spinning at full speed. Beware of false breakdowns during midday lunch hours!' },
  { symbol: 'SCB', color: '#6366f1', horoscope: 'International banking discipline. Perfect for risk-averse investors who cherish peaceful nights.' },
  { symbol: 'HIDCL', color: '#84cc16', horoscope: 'Mega capital base! Slow and steady wins the race. Keep an eye on promoter stake movements.' },
]

// ==========================================
// 4. TRADER PERSONA QUIZ DATA
// ==========================================
interface PersonaResult {
  title: string
  emoji: string
  quote: string
  strengths: string
  weakness: string
  brokerMatch: string
}

const PERSONAS: Record<string, PersonaResult> = {
  whale: {
    title: 'The Putalisadak Whale (#58)',
    emoji: '🐋',
    quote: 'You do not follow the market trend. You ARE the market trend.',
    strengths: 'Deep pockets, disciplined accumulation, ice-cold patience.',
    weakness: 'Cannot exit positions without crashing the entire sub-index.',
    brokerMatch: 'Broker #58 (Naasa) or #45 (Imperial)',
  },
  scalper: {
    title: 'The 3-Minute TMS Scalper',
    emoji: '🐒',
    quote: '50 trades before 1:00 PM. Net profit: Rs. 140. Broker commission: Rs. 9,500.',
    strengths: 'Lightning reflexes, high adrenaline tolerance, master of 1-minute wicks.',
    weakness: 'Severe anxiety, elevated blood pressure, paying his broker’s children’s college tuition.',
    brokerMatch: 'Broker #28 (Shree Hari) or #34 (Vision)',
  },
  guru: {
    title: 'The Chiya Stall Market Guru',
    emoji: '☕',
    quote: 'Portfolio balance is Rs. 12,000, but gives macro monetary policy advice worth Rs. 50 Crore.',
    strengths: 'Unbeatable gossip network, knows what Broker Dai ate for lunch, legendary storyteller.',
    weakness: 'Actually rarely executes trades; mostly drinks milk tea and argues about NRB.',
    brokerMatch: 'Broker #57 (Aryatara) tea corner',
  },
  chaser: {
    title: 'The Circuit Rocket Chaser',
    emoji: '⚡',
    quote: 'If a stock is not hitting +9.8% upper circuit by 11:15 AM, I am not interested.',
    strengths: 'Enormous courage, catches explosive momentum, celebrated hero when it works.',
    weakness: 'Buys the absolute peak green candle; holds the bag when the circuit breaks.',
    brokerMatch: 'Broker #14 (Nepal Stock) or #49 (Online)',
  },
  saint: {
    title: 'The Accidental Value Investor',
    emoji: '🧘',
    quote: 'Bought for a 3-day swing trade in 2021. Still holding for my grandchildren.',
    strengths: 'Immune to daily red candles, sleeps like a baby, enjoys annual cash dividends.',
    weakness: 'Forgot TMS login password three months ago; refuses to check portfolio balance.',
    brokerMatch: 'Broker #1 (Kumari) or #4 (Opal)',
  },
}

export default function FunLounge() {
  const [activeTab, setActiveTab] = useState<'game' | 'oracle' | 'persona' | 'chiya' | 'trivia' | 'soundboard'>('game')
  const [soundMuted, setMutedState] = useState(getSoundMuted)

  const toggleSound = () => {
    const next = !soundMuted
    setMutedState(next)
    setSoundMuted(next)
  }

  // ==========================================
  // ACTIVITY 1: 60-SECOND CHART TRADER (ARCADE)
  // ==========================================
  const [gamePlaying, setGamePlaying] = useState(false)
  const [gameTime, setGameTime] = useState(60)
  const [gameCash, setGameCash] = useState(100000)
  const [gameShares, setGameShares] = useState(0)
  const [currentRate, setCurrentRate] = useState(500)
  const [priceHistory, setPriceHistory] = useState<number[]>([500])
  const [lastNewsEvent, setLastNewsEvent] = useState<string>('Market opened. Awaiting orders.')
  const [gameFinished, setGameFinished] = useState(false)
  const [highScore, setHighScore] = useState(() => {
    try {
      return Number(localStorage.getItem('nepse_fun_trader_highscore')) || 100000
    } catch {
      return 100000
    }
  })

  // Portfolio total value
  const totalPortfolioValue = useMemo(() => gameCash + gameShares * currentRate, [gameCash, gameShares, currentRate])
  const gamePnL = useMemo(() => totalPortfolioValue - 100000, [totalPortfolioValue])
  const gamePnLPct = useMemo(() => (gamePnL / 100000) * 100, [gamePnL])

  // Game loop timer
  useEffect(() => {
    if (!gamePlaying) return
    const timer = setInterval(() => {
      setGameTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setGamePlaying(false)
          setGameFinished(true)
          if (totalPortfolioValue > 100000) {
            triggerConfetti()
            playCash()
          } else {
            playLoss()
          }
          if (totalPortfolioValue > highScore) {
            setHighScore(totalPortfolioValue)
            try {
              localStorage.setItem('nepse_fun_trader_highscore', String(Math.round(totalPortfolioValue)))
            } catch {}
          }
          return 0
        }
        return prev - 1
      })

      // Simulate price ticks
      setCurrentRate((prevRate) => {
        const deltaPct = (Math.random() - 0.49) * 0.04 // -2% to +2% normal volatility
        let newRate = Math.round(prevRate * (1 + deltaPct) * 10) / 10
        if (newRate < 80) newRate = 80

        // Random market shock events
        const roll = Math.random()
        if (roll < 0.08) {
          // Shock up
          const shock = Math.round(newRate * 0.04)
          newRate += shock
          setLastNewsEvent('⚡ Whale Inflow detected! +4% spike!')
          playWhale()
        } else if (roll > 0.93) {
          // Shock down
          const shock = Math.round(newRate * 0.035)
          newRate = Math.max(50, newRate - shock)
          setLastNewsEvent('📉 Profit booking panic! -3.5% drop!')
        }

        setPriceHistory((hist) => [...hist.slice(-24), newRate])
        return newRate
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gamePlaying, totalPortfolioValue, highScore])

  const startGame = () => {
    setGameCash(100000)
    setGameShares(0)
    setCurrentRate(500)
    setPriceHistory([500])
    setGameTime(60)
    setLastNewsEvent('Trading started! Watch the price curve!')
    setGameFinished(false)
    setGamePlaying(true)
    playBell()
  }

  const handleBuy = (qty: number) => {
    if (!gamePlaying) return
    const cost = qty * currentRate
    if (gameCash < cost) return
    setGameCash((prev) => prev - cost)
    setGameShares((prev) => prev + qty)
    playClick()
  }

  const handleBuyAll = () => {
    if (!gamePlaying || gameCash < currentRate) return
    const maxQty = Math.floor(gameCash / currentRate)
    if (maxQty <= 0) return
    const cost = maxQty * currentRate
    setGameCash((prev) => prev - cost)
    setGameShares((prev) => prev + maxQty)
    playClick()
  }

  const handleSellAll = () => {
    if (!gamePlaying || gameShares <= 0) return
    const proceeds = gameShares * currentRate
    setGameCash((prev) => prev + proceeds)
    setGameShares(0)
    playCash()
  }

  // ==========================================
  // ACTIVITY 2: ORACLE 8-BALL & FORTUNE WHEEL
  // ==========================================
  const [oracleQuestion, setOracleQuestion] = useState('')
  const [oracleAnswer, setOracleAnswer] = useState<string | null>(null)
  const [isShaking, setIsShaking] = useState(false)

  const askOracle = (customQ?: string) => {
    const q = customQ || oracleQuestion
    if (!q.trim()) return
    setIsShaking(true)
    playWhale()
    setTimeout(() => {
      const randomAns = ORACLE_ANSWERS[Math.floor(Math.random() * ORACLE_ANSWERS.length)] ?? ORACLE_ANSWERS[0]
      setOracleAnswer(randomAns)
      setIsShaking(false)
      playCircuit()
    }, 700)
  }

  // Wheel state
  const [spinning, setSpinning] = useState(false)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [selectedWheelStock, setSelectedWheelStock] = useState<WheelStock | null>(null)

  const spinWheel = () => {
    if (spinning) return
    setSpinning(true)
    setSelectedWheelStock(null)
    playBell()

    // Random target index
    const targetIdx = Math.floor(Math.random() * WHEEL_STOCKS.length)
    const segmentAngle = 360 / WHEEL_STOCKS.length
    const extraSpins = 360 * 5 // 5 full revolutions
    const targetAngle = extraSpins + (360 - (targetIdx * segmentAngle + segmentAngle / 2))
    const totalNewRotation = wheelRotation + targetAngle

    setWheelRotation(totalNewRotation)

    setTimeout(() => {
      setSpinning(false)
      const winner = WHEEL_STOCKS[targetIdx] ?? WHEEL_STOCKS[0]
      setSelectedWheelStock(winner)
      triggerConfetti()
      playCircuit()
    }, 3200)
  }

  // ==========================================
  // ACTIVITY 3: TRADER PERSONA QUIZ
  // ==========================================
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<string[]>([])
  const [quizResult, setQuizResult] = useState<PersonaResult | null>(null)

  const QUIZ_QUESTIONS = [
    {
      q: 'How do you pick your next stock in NEPSE?',
      options: [
        { text: 'Analyze covering indexes, smart money net flows, and broker trajectories.', persona: 'whale' },
        { text: 'Check whichever stock has huge green 5-minute wicks and high volume.', persona: 'scalper' },
        { text: 'My tea-shop friend in Putalisadak said “yo pakka badhchha”.', persona: 'guru' },
        { text: 'Sort the gainers list and buy whichever is at +9.8% circuit!', persona: 'chaser' },
      ],
    },
    {
      q: 'Your stock hits a -10% circuit on Sunday morning. What is your reaction?',
      options: [
        { text: 'Discount season is here! Aggressively absorb the retail panic.', persona: 'whale' },
        { text: 'Smash the Sell button at market price within 3.4 seconds.', persona: 'scalper' },
        { text: 'Drink another cup of milk tea and write an angry Facebook post.', persona: 'guru' },
        { text: 'Close the TMS app, turn off phone, and check back in 2029.', persona: 'saint' },
      ],
    },
    {
      q: 'What is your typical holding period?',
      options: [
        { text: 'Weeks to months of silent accumulation until supply is dry.', persona: 'whale' },
        { text: '3 minutes and 45 seconds. Long-term is lunch time.', persona: 'scalper' },
        { text: 'Whatever the tea-stall consensus says on Sunday morning.', persona: 'guru' },
        { text: 'Bought for a 2-day swing; still holding 3 years later.', persona: 'saint' },
      ],
    },
    {
      q: 'It’s Thursday at 2:45 PM before a 3-day festival holiday. What are you doing?',
      options: [
        { text: 'Executing massive cross-broker block transfers during the power hour.', persona: 'whale' },
        { text: 'Dumping all intraday inventory to sleep peacefully over the weekend.', persona: 'scalper' },
        { text: 'Buying speculative micro-cap hydro to gamble on Sunday’s opening gap!', persona: 'chaser' },
        { text: 'Wondering when my bonus shares will be credited to Meroshare.', persona: 'saint' },
      ],
    },
  ]

  const handleQuizChoice = (personaKey: string) => {
    const nextAnswers = [...quizAnswers, personaKey]
    setQuizAnswers(nextAnswers)
    playClick()

    if (quizStep + 1 < QUIZ_QUESTIONS.length) {
      setQuizStep(quizStep + 1)
    } else {
      // Tally persona
      const counts: Record<string, number> = {}
      nextAnswers.forEach((k) => {
        counts[k] = (counts[k] || 0) + 1
      })
      let topPersona = 'whale'
      let maxCount = 0
      Object.entries(counts).forEach(([k, count]) => {
        if (count > maxCount) {
          maxCount = count
          topPersona = k
        }
      })
      setQuizResult(PERSONAS[topPersona] ?? PERSONAS.whale)
      triggerConfetti()
      playCircuit()
    }
  }

  const restartQuiz = () => {
    setQuizStep(0)
    setQuizAnswers([])
    setQuizResult(null)
  }

  // ==========================================
  // ACTIVITY 4: CHIYA & MOMO CALCULATOR
  // ==========================================
  const [profitInput, setProfitInput] = useState<number>(25000)
  const isLoss = profitInput < 0
  const absProfit = Math.abs(profitInput)

  const cupsOfChiya = Math.floor(absProfit / 25)
  const platesOfMomo = Math.floor(absProfit / 150)
  const litersOfPetrol = Math.floor(absProfit / 175)
  const monthsOfWifi = (absProfit / 1200).toFixed(1)
  const pokharaTrips = (absProfit / 12000).toFixed(1)

  // ==========================================
  // ACTIVITY 5: NEPSE TRIVIA BLITZ
  // ==========================================
  const [triviaIndex, setTriviaIndex] = useState(0)
  const [triviaScore, setTriviaScore] = useState(0)
  const [triviaAnswered, setTriviaAnswered] = useState<number | null>(null)
  const [triviaFinished, setTriviaFinished] = useState(false)

  const handleTriviaAnswer = (selected: number) => {
    if (triviaAnswered !== null) return
    setTriviaAnswered(selected)
    const current = TRIVIA_QUESTIONS[triviaIndex]
    if (selected === current?.answer) {
      setTriviaScore((s) => s + 1)
      playCash()
    } else {
      playLoss()
    }
  }

  const handleNextTrivia = () => {
    if (triviaIndex + 1 < TRIVIA_QUESTIONS.length) {
      setTriviaIndex((i) => i + 1)
      setTriviaAnswered(null)
    } else {
      setTriviaFinished(true)
      triggerConfetti()
      playCircuit()
    }
  }

  const restartTrivia = () => {
    setTriviaIndex(0)
    setTriviaScore(0)
    setTriviaAnswered(null)
    setTriviaFinished(false)
  }

  return (
    <div className="text-foreground p-4 sm:p-6 min-h-screen relative">
      {/* Invisible Canvas for Confetti Burst */}
      <canvas id="fun-confetti-canvas" className="fixed inset-0 pointer-events-none z-50 w-full h-full" />

      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-primary/10 text-primary shadow-sm">
                <PartyPopper className="w-6 h-6 text-primary animate-bounce" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                  Trader’s Fun Lounge
                  <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning font-semibold border border-warning/30">
                    Relax & Play ☕
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Take a break from the candles! Play 60s paper trading, consult the NEPSE oracle, roast your trades, and test your market IQ.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSound}
              className="gap-2 cursor-pointer border-border/70 bg-card/60 hover:bg-card"
              title={soundMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-primary" />}
              <span className="text-xs font-medium">{soundMuted ? 'Muted' : 'Sound ON'}</span>
            </Button>
          </div>
        </div>

        {/* Activity Selection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          <button
            onClick={() => {
              setActiveTab('game')
              playClick()
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'game'
                ? 'bg-primary text-primary-foreground shadow-md scale-102 font-semibold'
                : 'bg-card/70 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            60s Chart Trader
          </button>

          <button
            onClick={() => {
              setActiveTab('oracle')
              playClick()
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'oracle'
                ? 'bg-primary text-primary-foreground shadow-md scale-102 font-semibold'
                : 'bg-card/70 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Oracle & Fortune Wheel
          </button>

          <button
            onClick={() => {
              setActiveTab('persona')
              playClick()
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'persona'
                ? 'bg-primary text-primary-foreground shadow-md scale-102 font-semibold'
                : 'bg-card/70 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-400" />
            Which Trader Are You?
          </button>

          <button
            onClick={() => {
              setActiveTab('chiya')
              playClick()
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'chiya'
                ? 'bg-primary text-primary-foreground shadow-md scale-102 font-semibold'
                : 'bg-card/70 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Coffee className="w-4 h-4 text-amber-500" />
            Chiya & Momo Converter
          </button>

          <button
            onClick={() => {
              setActiveTab('trivia')
              playClick()
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'trivia'
                ? 'bg-primary text-primary-foreground shadow-md scale-102 font-semibold'
                : 'bg-card/70 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Award className="w-4 h-4 text-cyan-400" />
            NEPSE Trivia Blitz
          </button>

          <button
            onClick={() => {
              setActiveTab('soundboard')
              playClick()
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'soundboard'
                ? 'bg-primary text-primary-foreground shadow-md scale-102 font-semibold'
                : 'bg-card/70 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Bell className="w-4 h-4 text-yellow-400" />
            Market Soundboard
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: 60-SECOND CHART TRADER (ARCADE MINI GAME)          */}
        {/* ========================================================= */}
        {activeTab === 'game' && (
          <div className="space-y-6">
            <GlassCard className="border-primary/20 relative overflow-hidden">
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border/50">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-primary" />
                    The 60-Second Chart Trader
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Start with Rs. 100,000. Buy low, sell high, survive market shocks, and beat the clock!
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-border/60 text-xs">
                    <span className="text-muted-foreground">Record:</span>
                    <span className="font-bold text-warning font-mono">Rs. {highScore.toLocaleString()}</span>
                  </div>

                  {!gamePlaying && (
                    <Button onClick={startGame} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                      <Play className="w-4 h-4 fill-current" />
                      {gameFinished ? 'Play Again' : 'Start 60s Game'}
                    </Button>
                  )}
                </div>
              </div>

              {/* HUD Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-4 border-b border-border/40">
                <div className="p-3 rounded-xl bg-card/60 border border-border/40">
                  <p className="text-[11px] text-muted-foreground">Time Left</p>
                  <p className={`text-xl font-black font-mono flex items-center gap-1.5 ${gameTime <= 10 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                    <Clock className="w-4 h-4" />
                    {gameTime}s
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-card/60 border border-border/40">
                  <p className="text-[11px] text-muted-foreground">Current Stock Rate</p>
                  <p className="text-xl font-black font-mono text-foreground">
                    Rs. {currentRate.toFixed(1)}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-card/60 border border-border/40">
                  <p className="text-[11px] text-muted-foreground">Cash Available</p>
                  <p className="text-xl font-bold font-mono text-foreground">
                    Rs. {Math.round(gameCash).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-card/60 border border-border/40">
                  <p className="text-[11px] text-muted-foreground">Shares Owned</p>
                  <p className="text-xl font-bold font-mono text-foreground">
                    {gameShares.toLocaleString()} kitta
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-card/60 border border-border/40">
                  <p className="text-[11px] text-muted-foreground">Total Equity / PnL</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black font-mono">Rs. {Math.round(totalPortfolioValue).toLocaleString()}</span>
                    <span className={`text-xs font-bold ${gamePnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ({gamePnLPct >= 0 ? '+' : ''}{gamePnLPct.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Live SVG Chart */}
              <div className="py-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span className="font-mono flex items-center gap-1.5 text-warning">
                    <Zap className="w-3.5 h-3.5" />
                    {lastNewsEvent}
                  </span>
                  <span className="text-[11px]">Symbol: $LUCK (Simulated NEPSE Floorsheet)</span>
                </div>

                <div className="w-full h-44 sm:h-52 bg-background/50 rounded-xl border border-border/50 p-2 relative overflow-hidden flex items-end">
                  {/* Visual grid lines */}
                  <div className="absolute inset-0 grid grid-rows-4 grid-cols-6 pointer-events-none opacity-10">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="border-b border-r border-foreground" />
                    ))}
                  </div>

                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 180">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={gamePnL >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={gamePnL >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Polyline */}
                    {(() => {
                      const minP = Math.min(...priceHistory) * 0.95
                      const maxP = Math.max(...priceHistory) * 1.05
                      const range = maxP - minP || 1
                      const stepX = 500 / Math.max(1, priceHistory.length - 1)

                      const points = priceHistory
                        .map((val, idx) => {
                          const x = idx * stepX
                          const y = 180 - ((val - minP) / range) * 160 - 10
                          return `${x},${y}`
                        })
                        .join(' ')

                      const firstX = 0
                      const lastX = (priceHistory.length - 1) * stepX
                      const areaPoints = `${firstX},180 ${points} ${lastX},180`

                      return (
                        <>
                          <polygon points={areaPoints} fill="url(#chartGrad)" />
                          <polyline
                            fill="none"
                            stroke={gamePnL >= 0 ? '#10b981' : '#ef4444'}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={points}
                          />
                        </>
                      )
                    })()}
                  </svg>
                </div>
              </div>

              {/* Game Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <Button
                  size="lg"
                  disabled={!gamePlaying || gameCash < currentRate * 100}
                  onClick={() => handleBuy(100)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 text-base gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <TrendingUp className="w-5 h-5" />
                  BUY 100 Shares (Rs. {Math.round(currentRate * 100).toLocaleString()})
                </Button>

                <Button
                  size="lg"
                  disabled={!gamePlaying || gameCash < currentRate}
                  onClick={handleBuyAll}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-base gap-2 cursor-pointer"
                >
                  <Zap className="w-5 h-5" />
                  ALL IN BUY (Max: {Math.floor(gameCash / currentRate)})
                </Button>

                <Button
                  size="lg"
                  disabled={!gamePlaying || gameShares <= 0}
                  onClick={handleSellAll}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold h-12 text-base gap-2 cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  <TrendingDown className="w-5 h-5" />
                  SELL ALL (Cash Out)
                </Button>
              </div>

              {/* Post Game Modal / Overlay */}
              {gameFinished && (
                <div className="mt-6 p-6 rounded-2xl bg-card/95 border-2 border-primary/40 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black">Trading Session Ended!</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {gamePnL > 0
                      ? `Sensational trading! You turned Rs. 100,000 into Rs. ${Math.round(totalPortfolioValue).toLocaleString()} (+Rs. ${Math.round(gamePnL).toLocaleString()})!`
                      : `Oof! You finished with Rs. ${Math.round(totalPortfolioValue).toLocaleString()} (${gamePnLPct.toFixed(1)}%). Even big bulls have red days!`}
                  </p>

                  <div className="inline-block p-3 rounded-xl bg-muted/70 border border-border text-xs font-semibold">
                    🏆 Title Unlocked:{' '}
                    <span className="text-primary font-bold">
                      {gamePnLPct >= 40
                        ? '👑 Giga Bull of Putalisadak'
                        : gamePnLPct >= 15
                        ? '💎 Diamond Hands Prodigy'
                        : gamePnLPct >= 0
                        ? '☕ Chiya & Breakfast Profit Taker'
                        : gamePnLPct >= -20
                        ? '🧻 Paper Hands Panic Seller'
                        : '🎒 Certified Bag Holder of 3200 Peak'}
                    </span>
                  </div>

                  <div>
                    <Button onClick={startGame} className="gap-2 bg-primary text-primary-foreground font-bold px-6">
                      <RotateCcw className="w-4 h-4" />
                      Play Again
                    </Button>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ORACLE 8-BALL & LUCKY STOCK SPIN WHEEL             */}
        {/* ========================================================= */}
        {activeTab === 'oracle' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Zone A: The 3D Magic 8-Ball */}
            <GlassCard className="flex flex-col items-center justify-between text-center p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  The NEPSE Magic 8-Ball
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  When technical indicators give conflicting signals, consult the ancient market oracle.
                </p>
              </div>

              {/* The Shaking Floating 8-Ball */}
              <div
                onClick={() => askOracle()}
                className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 border-4 border-indigo-500/30 shadow-2xl flex items-center justify-center cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 ${
                  isShaking ? 'animate-bounce' : ''
                }`}
                style={{
                  boxShadow: '0 20px 50px rgba(79, 70, 229, 0.3), inset 0 2px 15px rgba(255, 255, 255, 0.2)',
                }}
              >
                {/* Inner triangle lens */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-indigo-950/80 border-2 border-indigo-400/40 flex items-center justify-center p-3 text-center shadow-inner">
                  {oracleAnswer ? (
                    <p className="text-xs sm:text-sm font-bold text-indigo-200 leading-snug animate-in fade-in zoom-in-75 duration-300">
                      {oracleAnswer}
                    </p>
                  ) : (
                    <span className="text-4xl font-black text-indigo-400/70 font-mono">8</span>
                  )}
                </div>
              </div>

              {/* Question Input */}
              <div className="w-full space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask any market question (e.g. Should I buy NABIL?)"
                    value={oracleQuestion}
                    onChange={(e) => setOracleQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && askOracle()}
                    className="text-xs sm:text-sm bg-background/70"
                  />
                  <Button onClick={() => askOracle()} className="gap-1.5 font-bold cursor-pointer">
                    <Sparkles className="w-4 h-4" />
                    Ask
                  </Button>
                </div>

                {/* Quick Prompts */}
                <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                  {[
                    'Will NEPSE cross 3000?',
                    'Should I sell before Thursday?',
                    'Is Broker 58 buying for real?',
                    'Will my Hydro stock recover?',
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => {
                        setOracleQuestion(chip)
                        askOracle(chip)
                      }}
                      className="px-2.5 py-1 rounded-full bg-muted/60 hover:bg-primary/20 hover:text-primary text-[11px] transition-colors border border-border/50 cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Zone B: Chiya Fortune Spin Wheel */}
            <GlassCard className="flex flex-col items-center justify-between text-center p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold flex items-center justify-center gap-2">
                  <Coffee className="w-5 h-5 text-amber-500" />
                  The Lucky Stock Spin Wheel
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Spin the wheel to receive your auspicious stock of the day and daily market horoscope!
                </p>
              </div>

              {/* Wheel Container */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                {/* Needle Pointer */}
                <div className="absolute -top-3 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-rose-500 drop-shadow-md" />

                <div
                  className="w-full h-full rounded-full border-4 border-border/80 shadow-2xl overflow-hidden transition-transform duration-[3000ms] ease-out"
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {WHEEL_STOCKS.map((st, i) => {
                      const angle = 360 / WHEEL_STOCKS.length
                      const startAngle = i * angle
                      const endAngle = startAngle + angle

                      const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180)
                      const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180)
                      const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180)
                      const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180)

                      const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`
                      const textAngle = startAngle + angle / 2
                      const textX = 50 + 34 * Math.cos((Math.PI * textAngle) / 180)
                      const textY = 50 + 34 * Math.sin((Math.PI * textAngle) / 180)

                      return (
                        <g key={st.symbol}>
                          <path d={pathData} fill={st.color} opacity={0.85} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                          <text
                            x={textX}
                            y={textY}
                            fill="#ffffff"
                            fontSize="4.5"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="central"
                            transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                          >
                            {st.symbol}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                </div>
              </div>

              <div className="w-full space-y-3">
                <Button
                  size="lg"
                  disabled={spinning}
                  onClick={spinWheel}
                  className="w-full max-w-xs font-bold gap-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {spinning ? 'Spinning...' : 'SPIN THE WHEEL!'}
                </Button>

                {selectedWheelStock && (
                  <div className="p-3.5 rounded-xl bg-card/80 border border-primary/40 space-y-2 animate-in zoom-in-95 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">Winning Stock:</span>
                      <span className="text-sm font-black font-mono px-2 py-0.5 rounded bg-primary/20 text-primary">
                        {selectedWheelStock.symbol}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{selectedWheelStock.horoscope}</p>
                    <Link
                      to={`/script-analysis?symbol=${selectedWheelStock.symbol}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline pt-1"
                    >
                      Inspect {selectedWheelStock.symbol} in Script Analysis <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: TRADER PERSONA QUIZ                                */}
        {/* ========================================================= */}
        {activeTab === 'persona' && (
          <GlassCard className="max-w-2xl mx-auto p-6 space-y-6">
            {!quizResult ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Flame className="w-5 h-5 text-rose-500" />
                      Which NEPSE Trader Are You?
                    </h3>
                    <p className="text-xs text-muted-foreground">Answer 4 questions to reveal your true market spirit animal.</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary">
                    Question {quizStep + 1} of {QUIZ_QUESTIONS.length}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-semibold">{QUIZ_QUESTIONS[quizStep]?.q}</h4>

                <div className="space-y-2.5">
                  {QUIZ_QUESTIONS[quizStep]?.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuizChoice(opt.persona)}
                      className="w-full text-left p-3.5 rounded-xl border border-border/60 bg-muted/40 hover:bg-primary/10 hover:border-primary/50 text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span>{opt.text}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-5 animate-in zoom-in-95 duration-300">
                <div className="text-6xl">{quizResult.emoji}</div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-primary">Your Spirit Persona:</span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1">{quizResult.title}</h3>
                  <p className="text-xs sm:text-sm italic text-muted-foreground mt-2 max-w-md mx-auto">
                    "{quizResult.quote}"
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="p-3 rounded-xl bg-success/10 border border-success/30">
                    <span className="text-xs font-bold text-success flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Superpower:
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{quizResult.strengths}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30">
                    <span className="text-xs font-bold text-destructive flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Fatal Flaw:
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{quizResult.weakness}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border text-xs text-left">
                  <span className="text-muted-foreground">Natural Broker Habitat: </span>
                  <span className="font-bold text-foreground">{quizResult.brokerMatch}</span>
                </div>

                <Button onClick={restartQuiz} className="gap-2 bg-primary text-primary-foreground font-bold">
                  <RotateCcw className="w-4 h-4" /> Retake Quiz
                </Button>
              </div>
            )}
          </GlassCard>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CHIYA & MOMO CALCULATOR                             */}
        {/* ========================================================= */}
        {activeTab === 'chiya' && (
          <GlassCard className="max-w-3xl mx-auto p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Coffee className="w-5 h-5 text-amber-500" />
                The “Chiya & Momo” Real-Life Profit Converter
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Numbers on a screen feel abstract. Convert your NEPSE gains or losses into authentic Nepali living expenses!
              </p>
            </div>

            {/* Input Slider / Box */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="profit-npr-input" className="text-xs font-semibold text-muted-foreground">Enter Your Portfolio Gain / Loss (NPR):</label>
                <span className={`text-lg font-black font-mono ${profitInput >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {profitInput >= 0 ? '+Rs. ' : '-Rs. '}
                  {absProfit.toLocaleString()}
                </span>
              </div>

              <Input
                id="profit-npr-input"
                type="number"
                value={profitInput}
                onChange={(e) => setProfitInput(Number(e.target.value) || 0)}
                className="font-mono font-bold text-base"
              />

              <div className="flex flex-wrap gap-2 pt-1">
                {[5000, 25000, 100000, -10000, -50000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setProfitInput(preset)
                      playClick()
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      profitInput === preset
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card hover:bg-accent text-muted-foreground'
                    }`}
                  >
                    {preset > 0 ? `+${preset / 1000}k` : `${preset / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Conversion Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-card border border-border/50 text-center space-y-1">
                <div className="text-2xl">☕</div>
                <p className="text-xs text-muted-foreground">Special Milk Chiya</p>
                <p className="text-lg font-black text-foreground font-mono">{cupsOfChiya.toLocaleString()} cups</p>
                <p className="text-[10px] text-muted-foreground">(@ Rs. 25 / cup)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border/50 text-center space-y-1">
                <div className="text-2xl">🥟</div>
                <p className="text-xs text-muted-foreground">Steam Buff Momo</p>
                <p className="text-lg font-black text-foreground font-mono">{platesOfMomo.toLocaleString()} plates</p>
                <p className="text-[10px] text-muted-foreground">(@ Rs. 150 / plate)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border/50 text-center space-y-1">
                <div className="text-2xl">🛵</div>
                <p className="text-xs text-muted-foreground">Petrol for Bike</p>
                <p className="text-lg font-black text-foreground font-mono">{litersOfPetrol.toLocaleString()} Liters</p>
                <p className="text-[10px] text-muted-foreground">(@ Rs. 175 / Liter)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border/50 text-center space-y-1">
                <div className="text-2xl">📱</div>
                <p className="text-xs text-muted-foreground">FTTH WiFi Internet</p>
                <p className="text-lg font-black text-foreground font-mono">{monthsOfWifi} Months</p>
                <p className="text-[10px] text-muted-foreground">(@ Rs. 1,200 / month)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border/50 text-center space-y-1">
                <div className="text-2xl">🏖️</div>
                <p className="text-xs text-muted-foreground">Pokhara Lakeside Trips</p>
                <p className="text-lg font-black text-foreground font-mono">{pokharaTrips} Trips</p>
                <p className="text-[10px] text-muted-foreground">(@ Rs. 12,000 / trip)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border/50 text-center space-y-1 flex flex-col justify-center">
                <div className="text-2xl">{isLoss ? '😭' : '🥂'}</div>
                <p className="text-xs font-bold text-primary">{isLoss ? 'Moral Support' : 'Celebration'}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {isLoss ? 'At least Demat renewal is free next year!' : 'Time to treat your trading friends to dinner!'}
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* ========================================================= */}
        {/* TAB 5: NEPSE TRIVIA BLITZ                                 */}
        {/* ========================================================= */}
        {activeTab === 'trivia' && (
          <GlassCard className="max-w-2xl mx-auto p-6 space-y-6">
            {!triviaFinished ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Award className="w-5 h-5 text-cyan-400" />
                      NEPSE Trivia Blitz
                    </h3>
                    <p className="text-xs text-muted-foreground">Test your knowledge of Nepal stock market history and rules!</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-primary/20 text-primary">
                      Score: {triviaScore}/{TRIVIA_QUESTIONS.length}
                    </span>
                  </div>
                </div>

                {/* Question */}
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                    Question {triviaIndex + 1} of {TRIVIA_QUESTIONS.length}:
                  </span>
                  <h4 className="text-base sm:text-lg font-semibold">{TRIVIA_QUESTIONS[triviaIndex]?.question}</h4>
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  {TRIVIA_QUESTIONS[triviaIndex]?.options.map((opt, idx) => {
                    const isSelected = triviaAnswered === idx
                    const isCorrect = idx === TRIVIA_QUESTIONS[triviaIndex]?.answer
                    const showResult = triviaAnswered !== null

                    let btnClass = 'border-border/60 bg-muted/40 hover:bg-accent text-foreground'
                    if (showResult) {
                      if (isCorrect) btnClass = 'border-success bg-success/20 text-success font-bold'
                      else if (isSelected) btnClass = 'border-destructive bg-destructive/20 text-destructive font-bold'
                    }

                    return (
                      <button
                        key={idx}
                        disabled={showResult}
                        onClick={() => handleTriviaAnswer(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {showResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />}
                        {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>

                {/* Explanation & Next */}
                {triviaAnswered !== null && (
                  <div className="p-3.5 rounded-xl bg-card border border-primary/30 space-y-2 animate-in fade-in">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      💡 <strong>Explanation:</strong> {TRIVIA_QUESTIONS[triviaIndex]?.explanation}
                    </p>
                    <Button onClick={handleNextTrivia} className="gap-1.5 font-bold cursor-pointer w-full mt-2">
                      {triviaIndex + 1 < TRIVIA_QUESTIONS.length ? 'Next Question' : 'View Final Score'}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-5 animate-in zoom-in-95 duration-300">
                <div className="text-5xl">🏆</div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black">Trivia Challenge Completed!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You scored <span className="font-bold text-primary font-mono">{triviaScore} out of {TRIVIA_QUESTIONS.length}</span>!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/60 border border-border inline-block text-xs font-semibold">
                  🎖️ Market Title:{' '}
                  <span className="text-primary font-bold">
                    {triviaScore >= 9
                      ? 'Big Bull of NEPSE 👑'
                      : triviaScore >= 7
                      ? 'Senior Floor Trader 📈'
                      : triviaScore >= 5
                      ? 'Active TMS User 📊'
                      : 'IPO Babu (Still Learning) 🎒'}
                  </span>
                </div>

                <div>
                  <Button onClick={restartTrivia} className="gap-2 bg-primary text-primary-foreground font-bold">
                    <RotateCcw className="w-4 h-4" /> Retake Trivia
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        )}

        {/* ========================================================= */}
        {/* TAB 6: MARKET SOUNDBOARD                                  */}
        {/* ========================================================= */}
        {activeTab === 'soundboard' && (
          <GlassCard className="max-w-2xl mx-auto p-6 space-y-6 text-center">
            <div>
              <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                <Bell className="w-5 h-5 text-yellow-400" />
                The NEPSE Market Soundboard
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Synthesized 100% in pure Web Audio API with zero latency. Tap to play classic stock market sound effects!
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <button
                onClick={() => playBell()}
                className="p-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-primary/20 hover:border-primary/50 text-center space-y-2 transition-all cursor-pointer group active:scale-95"
              >
                <div className="text-3xl group-hover:scale-110 transition-transform">🔔</div>
                <p className="text-xs font-bold text-foreground">11:00 AM Opening Bell</p>
                <p className="text-[10px] text-muted-foreground">Continuous trading opens</p>
              </button>

              <button
                onClick={() => playCircuit()}
                className="p-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-center space-y-2 transition-all cursor-pointer group active:scale-95"
              >
                <div className="text-3xl group-hover:scale-110 transition-transform">🚀</div>
                <p className="text-xs font-bold text-emerald-400">+10% Upper Circuit</p>
                <p className="text-[10px] text-muted-foreground">Victorious brass fanfare</p>
              </button>

              <button
                onClick={() => playLoss()}
                className="p-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-rose-500/20 hover:border-rose-500/50 text-center space-y-2 transition-all cursor-pointer group active:scale-95"
              >
                <div className="text-3xl group-hover:scale-110 transition-transform">💀</div>
                <p className="text-xs font-bold text-rose-400">-10% Negative Circuit</p>
                <p className="text-[10px] text-muted-foreground">Sad sliding trombone</p>
              </button>

              <button
                onClick={() => playCash()}
                className="p-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-amber-500/20 hover:border-amber-500/50 text-center space-y-2 transition-all cursor-pointer group active:scale-95"
              >
                <div className="text-3xl group-hover:scale-110 transition-transform">💵</div>
                <p className="text-xs font-bold text-amber-400">Ka-Ching! (Cash Out)</p>
                <p className="text-[10px] text-muted-foreground">Take profits into bank</p>
              </button>

              <button
                onClick={() => playWhale()}
                className="p-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 text-center space-y-2 transition-all cursor-pointer group active:scale-95"
              >
                <div className="text-3xl group-hover:scale-110 transition-transform">🐋</div>
                <p className="text-xs font-bold text-cyan-400">Whale Splash</p>
                <p className="text-[10px] text-muted-foreground">Deep institutional dive</p>
              </button>

              <button
                onClick={() => playAlarm()}
                className="p-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-destructive/20 hover:border-destructive/50 text-center space-y-2 transition-all cursor-pointer group active:scale-95"
              >
                <div className="text-3xl group-hover:scale-110 transition-transform">🚨</div>
                <p className="text-xs font-bold text-destructive">Margin Call Siren</p>
                <p className="text-[10px] text-muted-foreground">Broker Dai calling you</p>
              </button>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
