import { describe, it, expect, vi } from 'vitest'
import { runSimulation, getChartLabels } from '../simulations/engine'
import type { Simulation } from '../types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeSim = (id: string, overrides: Partial<Simulation> = {}): Simulation => ({
  id,
  name: 'Test Sim',
  description: 'A test simulation',
  category: 'physics',
  tags: [],
  version: '1.0.0',
  isFavorite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  results: [],
  parameters: [],
  ...overrides,
})

const pendulumSim = makeSim('sim-pendulum', {
  parameters: [
    { id: 'length',  label: 'Length',  type: 'range', value: 1.0,  defaultValue: 1.0,  min: 0.1, max: 5,   step: 0.1  },
    { id: 'mass',    label: 'Mass',    type: 'range', value: 1.0,  defaultValue: 1.0,  min: 0.1, max: 10,  step: 0.1  },
    { id: 'gravity', label: 'Gravity', type: 'range', value: 9.81, defaultValue: 9.81, min: 1,   max: 25,  step: 0.01 },
    { id: 'angle',   label: 'Angle',   type: 'range', value: 30,   defaultValue: 30,   min: 1,   max: 90,  step: 1    },
    { id: 'damping', label: 'Damping', type: 'range', value: 0.05, defaultValue: 0.05, min: 0,   max: 1,   step: 0.01 },
    { id: 'steps',   label: 'Steps',   type: 'range', value: 50,   defaultValue: 50,   min: 50,  max: 500, step: 10   },
  ],
})

const projectileSim = makeSim('sim-projectile', {
  parameters: [
    { id: 'velocity', label: 'Velocity', type: 'range', value: 50,    defaultValue: 50,    min: 1,  max: 200,  step: 1    },
    { id: 'angle',    label: 'Angle',    type: 'range', value: 45,    defaultValue: 45,    min: 1,  max: 89,   step: 1    },
    { id: 'gravity',  label: 'Gravity',  type: 'range', value: 9.81,  defaultValue: 9.81,  min: 1,  max: 25,   step: 0.01 },
    { id: 'drag',     label: 'Drag',     type: 'range', value: 0.001, defaultValue: 0.001, min: 0,  max: 0.5,  step: 0.001},
    { id: 'mass',     label: 'Mass',     type: 'range', value: 1,     defaultValue: 1,     min: 0.1,max: 50,   step: 0.1  },
  ],
})

// ── Engine Tests ───────────────────────────────────────────────────────────────

describe('Simulation Engine', () => {
  it('runs pendulum simulation and returns a result', async () => {
    const result = await runSimulation(pendulumSim)
    expect(result.status).toBe('success')
    expect(result.dataPoints.length).toBeGreaterThan(0)
    expect(result.simulationId).toBe('sim-pendulum')
    expect(result.summary).toHaveProperty('Period (s)')
  })

  it('pendulum data points have valid x and y', async () => {
    const result = await runSimulation(pendulumSim)
    result.dataPoints.forEach((pt) => {
      expect(isFinite(pt.x)).toBe(true)
      expect(isFinite(pt.y)).toBe(true)
    })
  })

  it('runs projectile simulation', async () => {
    const result = await runSimulation(projectileSim)
    expect(result.status).toBe('success')
    expect(result.dataPoints.length).toBeGreaterThan(0)
    expect(result.summary).toHaveProperty('Range (m)')
    expect(result.summary).toHaveProperty('Max Height (m)')
  })

  it('projectile y values never go below 0', async () => {
    const result = await runSimulation(projectileSim)
    result.dataPoints.forEach((pt) => {
      expect(pt.y).toBeGreaterThanOrEqual(0)
    })
  })

  it('calls onProgress during execution', async () => {
    const onProgress = vi.fn()
    await runSimulation(pendulumSim, { onProgress })
    expect(onProgress).toHaveBeenCalled()
    const lastCall = onProgress.mock.calls[onProgress.mock.calls.length - 1]
    expect(lastCall[0]).toBe(100)
  })

  it('aborts simulation when signal fires', async () => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 10)
    await expect(runSimulation(pendulumSim, { signal: controller.signal })).rejects.toThrow('aborted')
  })

  it('returns a valid result duration', async () => {
    const result = await runSimulation(pendulumSim)
    expect(result.duration).toBeGreaterThanOrEqual(0)
  })
})

// ── Chart Labels Tests ─────────────────────────────────────────────────────────

describe('getChartLabels', () => {
  it('returns correct labels for pendulum', () => {
    const labels = getChartLabels('sim-pendulum')
    expect(labels.x).toBe('Time (s)')
    expect(labels.y).toBe('Angle (°)')
    expect(labels.title).toBeTruthy()
  })

  it('returns correct labels for projectile', () => {
    const labels = getChartLabels('sim-projectile')
    expect(labels.x).toContain('Horizontal')
  })

  it('returns fallback for unknown sim id', () => {
    const labels = getChartLabels('sim-unknown-xyz')
    expect(labels.x).toBe('X')
    expect(labels.y).toBe('Y')
  })

  it('includes z label for population sim', () => {
    const labels = getChartLabels('sim-population')
    expect(labels.z).toBeDefined()
  })
})
