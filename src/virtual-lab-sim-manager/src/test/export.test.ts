import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportToCSV, exportToJSON } from '../utils/export'
import type { Simulation, SimulationResult } from '../types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockSim: Simulation = {
  id: 'sim-test',
  name: 'Test Sim',
  description: 'desc',
  category: 'physics',
  tags: ['test'],
  version: '1.0.0',
  isFavorite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  results: [],
  parameters: [
    { id: 'length', label: 'Length', type: 'range', value: 1, defaultValue: 1, unit: 'm' },
  ],
}

const mockResult: SimulationResult = {
  id: 'result-1',
  simulationId: 'sim-test',
  runAt: new Date().toISOString(),
  duration: 123,
  status: 'success',
  dataPoints: [
    { timestamp: 0, x: 0, y: 1 },
    { timestamp: 1, x: 1, y: 2, z: 3 },
    { timestamp: 2, x: 2, y: 0.5 },
  ],
  summary: { maxY: '2', minY: '0.5' },
}

// ── Mock DOM Download ─────────────────────────────────────────────────────────

let clickSpy: ReturnType<typeof vi.fn>
let createElementSpy: ReturnType<typeof vi.spyOn>
let createObjectURLSpy: ReturnType<typeof vi.spyOn>
let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  clickSpy = vi.fn()
  createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
    href: '',
    download: '',
    click: clickSpy,
  } as unknown as HTMLAnchorElement)
  createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
  revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('exportToCSV', () => {
  it('triggers a download click', () => {
    exportToCSV(mockSim, mockResult)
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  it('creates a blob URL', () => {
    exportToCSV(mockSim, mockResult)
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1)
  })

  it('revokes the blob URL after download', () => {
    exportToCSV(mockSim, mockResult)
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock')
  })

  it('sets the correct filename', () => {
    const el = { href: '', download: '', click: clickSpy }
    createElementSpy.mockReturnValue(el as unknown as HTMLAnchorElement)
    exportToCSV(mockSim, mockResult)
    expect(el.download).toMatch(/Test_Sim.*\.csv/)
  })
})

describe('exportToJSON', () => {
  it('triggers a download click', () => {
    exportToJSON(mockSim, mockResult)
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  it('creates a blob URL', () => {
    exportToJSON(mockSim, mockResult)
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1)
  })

  it('sets the correct filename', () => {
    const el = { href: '', download: '', click: clickSpy }
    createElementSpy.mockReturnValue(el as unknown as HTMLAnchorElement)
    exportToJSON(mockSim, mockResult)
    expect(el.download).toMatch(/Test_Sim.*\.json/)
  })
})
