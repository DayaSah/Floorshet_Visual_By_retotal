// Synthesized audio sound effects using the Web Audio API
// 100% zero external dependencies, works completely offline with zero latency

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

let isMuted = false

export function setSoundMuted(muted: boolean) {
  isMuted = muted
  try {
    localStorage.setItem('nepse_fun_sound_muted', muted ? 'true' : 'false')
  } catch {}
}

export function getSoundMuted(): boolean {
  try {
    return localStorage.getItem('nepse_fun_sound_muted') === 'true'
  } catch {
    return false
  }
}

// 1. Opening Bell (11:00 AM NEPSE Bell)
export function playBell() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const freqs = [523.25, 659.25, 783.99, 1046.5] // C Major chord harmonics
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    gain.gain.setValueAtTime(0.12 / (i + 1), now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 1.6)
  })
}

// 2. Upper Circuit Fanfare (10% Daily Upper Circuit!)
export function playCircuit() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5] // C E G C E G C
  const now = ctx.currentTime

  notes.forEach((freq, index) => {
    const noteTime = now + index * 0.08
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, noteTime)
    gain.gain.setValueAtTime(0.18, noteTime)
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(noteTime)
    osc.stop(noteTime + 0.35)
  })
}

// 3. Sad Loss / Negative Circuit (Sad Trombone)
export function playLoss() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const notes = [349.23, 329.63, 311.13, 293.66] // F4 -> E4 -> Eb4 -> D4
  const now = ctx.currentTime

  notes.forEach((freq, index) => {
    const startTime = now + index * 0.28
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(freq, startTime)
    if (index === 3) {
      // Final sad slide down
      osc.frequency.exponentialRampToValueAtTime(220, startTime + 0.7)
    }
    gain.gain.setValueAtTime(0.12, startTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + (index === 3 ? 0.75 : 0.25))
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(startTime)
    osc.stop(startTime + (index === 3 ? 0.75 : 0.25))
  })
}

// 4. Ka-ching! (Cash Register / Profit)
export function playCash() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc1 = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  const gain = ctx.createGain()

  osc1.type = 'sine'
  osc2.type = 'sine'
  osc1.frequency.setValueAtTime(987.77, now) // B5
  osc2.frequency.setValueAtTime(1318.51, now + 0.08) // E6

  gain.gain.setValueAtTime(0.2, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)

  osc1.connect(gain)
  osc2.connect(gain)
  gain.connect(ctx.destination)

  osc1.start(now)
  osc1.stop(now + 0.6)
  osc2.start(now + 0.08)
  osc2.stop(now + 0.6)
}

// 5. Woodblock Wheel / Clock Tick
export function playTick() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(800, now)
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.04)

  gain.gain.setValueAtTime(0.08, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.04)
}

// 6. Whale Splash (Deep Inflow Resonance)
export function playWhale() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(70, now)
  osc.frequency.exponentialRampToValueAtTime(160, now + 0.4)
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.9)

  gain.gain.setValueAtTime(0.25, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.9)
}

// 7. Margin Call Alarm (Warning Siren)
// 6b. UI Click Feedback (short tap sound for buttons)
export const playClick = playTick

// 7. Margin Call Alarm (Warning Siren)
export function playAlarm() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  for (let i = 0; i < 3; i++) {
    const t = now + i * 0.18
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(880, t)
    gain.gain.setValueAtTime(0.1, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.12)
  }
}
