// ============================================================
// VIRTUAL LAB — SIMULATION ENGINE
// Runs all physics/bio/electronics models in-browser
// ============================================================

import type { Simulation, DataPoint, SimulationResult } from '../types'
import { v4 as uuidv4 } from 'uuid'

type ParamMap = Record<string, number | string | boolean>

function getParams(sim: Simulation): ParamMap {
  return sim.parameters.reduce<ParamMap>((acc, p) => {
    acc[p.id] = p.value
    return acc
  }, {})
}

// ─── Pendulum ─────────────────────────────────────────────────────────────────
function runPendulum(p: ParamMap): DataPoint[] {
  const L = p.length as number
  const g = p.gravity as number
  const theta0 = ((p.angle as number) * Math.PI) / 180
  const b = p.damping as number
  const steps = p.steps as number
  const dt = 0.05
  const points: DataPoint[] = []

  let theta = theta0
  let omega = 0

  for (let i = 0; i < steps; i++) {
    const alpha = -(g / L) * Math.sin(theta) - b * omega
    omega += alpha * dt
    theta += omega * dt
    const t = i * dt
    points.push({ timestamp: t, x: t, y: (theta * 180) / Math.PI })
  }
  return points
}

// ─── Projectile ───────────────────────────────────────────────────────────────
function runProjectile(p: ParamMap): DataPoint[] {
  const v0 = p.velocity as number
  const angle = ((p.angle as number) * Math.PI) / 180
  const g = p.gravity as number
  const drag = p.drag as number
  const mass = p.mass as number
  const dt = 0.05
  const points: DataPoint[] = []

  let vx = v0 * Math.cos(angle)
  let vy = v0 * Math.sin(angle)
  let x = 0
  let y = 0

  while (y >= 0 || points.length === 0) {
    const speed = Math.sqrt(vx * vx + vy * vy)
    const dragF = (drag * speed * speed) / mass
    vx -= (dragF * (vx / speed)) * dt
    vy -= (g + dragF * (vy / speed)) * dt
    x += vx * dt
    y += vy * dt
    if (y < 0 && points.length > 0) break
    points.push({ timestamp: points.length * dt, x, y: Math.max(0, y) })
    if (points.length > 5000) break
  }
  return points
}

// ─── Wave Interference ────────────────────────────────────────────────────────
function runWave(p: ParamMap): DataPoint[] {
  const f1 = p.freq1 as number
  const f2 = p.freq2 as number
  const a1 = p.amp1 as number
  const a2 = p.amp2 as number
  const phase = ((p.phase as number) * Math.PI) / 180
  const points: DataPoint[] = []
  const steps = 300
  const dt = 0.02

  for (let i = 0; i < steps; i++) {
    const t = i * dt
    const y1 = a1 * Math.sin(2 * Math.PI * f1 * t)
    const y2 = a2 * Math.sin(2 * Math.PI * f2 * t + phase)
    points.push({ timestamp: t, x: t, y: y1 + y2, z: y1 })
  }
  return points
}

// ─── Population Dynamics (Lotka-Volterra) ─────────────────────────────────────
function runPopulation(p: ParamMap): DataPoint[] {
  let prey = p.prey0 as number
  let pred = p.pred0 as number
  const alpha = p.alpha as number
  const beta = p.beta as number
  const delta = p.delta as number
  const gamma = p.gamma as number
  const steps = p.steps as number
  const dt = 0.1
  const points: DataPoint[] = []

  for (let i = 0; i < steps; i++) {
    const dprey = (alpha * prey - beta * prey * pred) * dt
    const dpred = (delta * prey * pred - gamma * pred) * dt
    prey = Math.max(0, prey + dprey)
    pred = Math.max(0, pred + dpred)
    points.push({ timestamp: i * dt, x: i * dt, y: prey, z: pred })
  }
  return points
}

// ─── RC Circuit ───────────────────────────────────────────────────────────────
function runRCCircuit(p: ParamMap): DataPoint[] {
  const R = p.resistance as number
  const C = p.capacitance as number
  const V = p.voltage as number
  const mode = p.mode as string
  const tau = R * C
  const points: DataPoint[] = []
  const steps = 200

  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * 5 * tau
    const vc =
      mode === 'charging'
        ? V * (1 - Math.exp(-t / tau))
        : V * Math.exp(-t / tau)
    const ic = (mode === 'charging' ? (V - vc) : vc) / R
    points.push({ timestamp: t, x: t, y: vc, z: ic * 1000 }) // z = mA
  }
  return points
}

// ─── Orbital Mechanics ────────────────────────────────────────────────────────
function runOrbital(p: ParamMap): DataPoint[] {
  const G = 6.674e-11
  const M = p.mass_star as number
  const distGm = (p.distance as number) * 1e9
  const ecc = p.eccentricity as number
  const steps = p.steps as number
  const points: DataPoint[] = []

  // Semi-major axis = distance, compute orbit points
  const a = distGm
  const T = 2 * Math.PI * Math.sqrt((a * a * a) / (G * M))

  for (let i = 0; i <= steps; i++) {
    const angle = (2 * Math.PI * i) / steps
    const r = (a * (1 - ecc * ecc)) / (1 + ecc * Math.cos(angle))
    const x = (r / 1e9) * Math.cos(angle)
    const y = (r / 1e9) * Math.sin(angle)
    const t = (T * i) / steps
    points.push({ timestamp: t, x, y, z: r / 1e9 })
  }
  return points
}

// ─── Engine Dispatch ──────────────────────────────────────────────────────────

const ENGINES: Record<string, (p: ParamMap) => DataPoint[]> = {
  'sim-pendulum': runPendulum,
  'sim-projectile': runProjectile,
  'sim-wave': runWave,
  'sim-population': runPopulation,
  'sim-rc-circuit': runRCCircuit,
  'sim-orbital': runOrbital,
}

export interface RunOptions {
  onProgress?: (progress: number, points: DataPoint[]) => void
  signal?: AbortSignal
}

export async function runSimulation(
  sim: Simulation,
  options: RunOptions = {}
): Promise<SimulationResult> {
  const { onProgress, signal } = options
  const startTime = performance.now()

  return new Promise((resolve, reject) => {
    const engine = ENGINES[sim.id]
    const params = getParams(sim)

    let rawPoints: DataPoint[]

    if (engine) {
      rawPoints = engine(params)
    } else {
      // Generic fallback: sine wave placeholder
      rawPoints = Array.from({ length: 100 }, (_, i) => ({
        timestamp: i * 0.1,
        x: i * 0.1,
        y: Math.sin(i * 0.2) * Math.random(),
      }))
    }

    // Simulate async streaming with chunked progress
    const chunkSize = Math.max(1, Math.floor(rawPoints.length / 20))
    let idx = 0

    function processChunk() {
      if (signal?.aborted) {
        reject(new Error('Simulation aborted'))
        return
      }

      const end = Math.min(idx + chunkSize, rawPoints.length)
      const chunk = rawPoints.slice(0, end)
      const progress = Math.round((end / rawPoints.length) * 100)
      onProgress?.(progress, chunk)
      idx = end

      if (idx < rawPoints.length) {
        setTimeout(processChunk, 30)
      } else {
        const duration = performance.now() - startTime
        const summary = buildSummary(sim.id, rawPoints, params)
        resolve({
          id: uuidv4(),
          simulationId: sim.id,
          runAt: new Date().toISOString(),
          duration,
          dataPoints: rawPoints,
          summary,
          status: 'success',
        })
      }
    }

    setTimeout(processChunk, 50)
  })
}

function buildSummary(simId: string, points: DataPoint[], params: ParamMap): Record<string, number | string> {
  const yVals = points.map((p) => p.y).filter(isFinite)
  const base = {
    totalPoints: points.length,
    maxY: Math.max(...yVals).toFixed(4),
    minY: Math.min(...yVals).toFixed(4),
    avgY: (yVals.reduce((a, b) => a + b, 0) / yVals.length).toFixed(4),
  }

  if (simId === 'sim-pendulum') {
    const L = params.length as number
    const g = params.gravity as number
    const period = (2 * Math.PI * Math.sqrt(L / g)).toFixed(4)
    return { ...base, 'Period (s)': period, 'Natural Freq (Hz)': (1 / parseFloat(period)).toFixed(4) }
  }
  if (simId === 'sim-projectile') {
    const maxX = Math.max(...points.map((p) => p.x)).toFixed(2)
    const maxH = Math.max(...yVals).toFixed(2)
    return { ...base, 'Range (m)': maxX, 'Max Height (m)': maxH }
  }
  if (simId === 'sim-rc-circuit') {
    const R = params.resistance as number
    const C = params.capacitance as number
    return { ...base, 'Time Constant τ (s)': (R * C).toFixed(6), 'Supply Voltage (V)': params.voltage as number }
  }
  return base
}

export function getChartLabels(simId: string): { x: string; y: string; z?: string; title: string } {
  const labels: Record<string, { x: string; y: string; z?: string; title: string }> = {
    'sim-pendulum': { x: 'Time (s)', y: 'Angle (°)', title: 'Pendulum Angular Displacement' },
    'sim-projectile': { x: 'Horizontal Distance (m)', y: 'Height (m)', title: 'Projectile Trajectory' },
    'sim-wave': { x: 'Time (s)', y: 'Amplitude', z: 'Wave 1', title: 'Wave Superposition' },
    'sim-population': { x: 'Time', y: 'Prey Count', z: 'Predator Count', title: 'Predator-Prey Dynamics' },
    'sim-rc-circuit': { x: 'Time (s)', y: 'Voltage (V)', z: 'Current (mA)', title: 'RC Circuit Response' },
    'sim-orbital': { x: 'X Position (Gm)', y: 'Y Position (Gm)', title: 'Orbital Path' },
  }
  return labels[simId] ?? { x: 'X', y: 'Y', title: 'Simulation Output' }
}
