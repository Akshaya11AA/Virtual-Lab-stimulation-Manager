import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import type {
  Simulation,
  Lab,
  SimulationRuntime,
  SimulationParameter,
  DataPoint,
  SimulationResult,
} from '../types'

// ─── Default Simulations ─────────────────────────────────────────────────────

const DEFAULT_SIMULATIONS: Record<string, Simulation> = {
  'sim-pendulum': {
    id: 'sim-pendulum',
    name: 'Simple Pendulum',
    description: 'Simulate harmonic motion of a pendulum with variable length, mass, and gravity.',
    category: 'physics',
    tags: ['mechanics', 'oscillation', 'gravity'],
    version: '1.0.0',
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    results: [],
    parameters: [
      { id: 'length', label: 'Length', type: 'range', value: 1.0, defaultValue: 1.0, min: 0.1, max: 5, step: 0.1, unit: 'm' },
      { id: 'mass', label: 'Mass', type: 'range', value: 1.0, defaultValue: 1.0, min: 0.1, max: 10, step: 0.1, unit: 'kg' },
      { id: 'gravity', label: 'Gravity', type: 'range', value: 9.81, defaultValue: 9.81, min: 1, max: 25, step: 0.01, unit: 'm/s²' },
      { id: 'angle', label: 'Initial Angle', type: 'range', value: 30, defaultValue: 30, min: 1, max: 90, step: 1, unit: '°' },
      { id: 'damping', label: 'Damping', type: 'range', value: 0.05, defaultValue: 0.05, min: 0, max: 1, step: 0.01, unit: '' },
      { id: 'steps', label: 'Time Steps', type: 'range', value: 200, defaultValue: 200, min: 50, max: 500, step: 10, unit: '' },
    ],
  },
  'sim-projectile': {
    id: 'sim-projectile',
    name: 'Projectile Motion',
    description: 'Analyze 2D projectile trajectories with air resistance and varying launch angles.',
    category: 'physics',
    tags: ['kinematics', 'trajectory', 'ballistics'],
    version: '1.0.0',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    results: [],
    parameters: [
      { id: 'velocity', label: 'Initial Velocity', type: 'range', value: 50, defaultValue: 50, min: 1, max: 200, step: 1, unit: 'm/s' },
      { id: 'angle', label: 'Launch Angle', type: 'range', value: 45, defaultValue: 45, min: 1, max: 89, step: 1, unit: '°' },
      { id: 'gravity', label: 'Gravity', type: 'range', value: 9.81, defaultValue: 9.81, min: 1, max: 25, step: 0.01, unit: 'm/s²' },
      { id: 'drag', label: 'Air Resistance', type: 'range', value: 0.01, defaultValue: 0.01, min: 0, max: 0.5, step: 0.001, unit: '' },
      { id: 'mass', label: 'Mass', type: 'range', value: 1, defaultValue: 1, min: 0.1, max: 50, step: 0.1, unit: 'kg' },
    ],
  },
  'sim-wave': {
    id: 'sim-wave',
    name: 'Wave Interference',
    description: 'Visualize constructive and destructive interference patterns of two wave sources.',
    category: 'physics',
    tags: ['waves', 'interference', 'optics'],
    version: '1.0.0',
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    results: [],
    parameters: [
      { id: 'freq1', label: 'Frequency 1', type: 'range', value: 2, defaultValue: 2, min: 0.5, max: 10, step: 0.5, unit: 'Hz' },
      { id: 'freq2', label: 'Frequency 2', type: 'range', value: 3, defaultValue: 3, min: 0.5, max: 10, step: 0.5, unit: 'Hz' },
      { id: 'amp1', label: 'Amplitude 1', type: 'range', value: 1, defaultValue: 1, min: 0.1, max: 3, step: 0.1, unit: '' },
      { id: 'amp2', label: 'Amplitude 2', type: 'range', value: 1, defaultValue: 1, min: 0.1, max: 3, step: 0.1, unit: '' },
      { id: 'phase', label: 'Phase Shift', type: 'range', value: 0, defaultValue: 0, min: 0, max: 360, step: 15, unit: '°' },
    ],
  },
  'sim-population': {
    id: 'sim-population',
    name: 'Population Dynamics',
    description: 'Lotka–Volterra predator-prey model showing population oscillations over time.',
    category: 'biology',
    tags: ['ecology', 'population', 'lotka-volterra'],
    version: '1.0.0',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    results: [],
    parameters: [
      { id: 'prey0', label: 'Initial Prey', type: 'range', value: 40, defaultValue: 40, min: 5, max: 200, step: 5, unit: '' },
      { id: 'pred0', label: 'Initial Predators', type: 'range', value: 9, defaultValue: 9, min: 1, max: 100, step: 1, unit: '' },
      { id: 'alpha', label: 'Prey Growth Rate', type: 'range', value: 0.1, defaultValue: 0.1, min: 0.01, max: 1, step: 0.01, unit: '' },
      { id: 'beta', label: 'Predation Rate', type: 'range', value: 0.02, defaultValue: 0.02, min: 0.001, max: 0.1, step: 0.001, unit: '' },
      { id: 'delta', label: 'Predator Growth', type: 'range', value: 0.01, defaultValue: 0.01, min: 0.001, max: 0.1, step: 0.001, unit: '' },
      { id: 'gamma', label: 'Predator Death', type: 'range', value: 0.1, defaultValue: 0.1, min: 0.01, max: 1, step: 0.01, unit: '' },
      { id: 'steps', label: 'Simulation Steps', type: 'range', value: 500, defaultValue: 500, min: 100, max: 2000, step: 100, unit: '' },
    ],
  },
  'sim-rc-circuit': {
    id: 'sim-rc-circuit',
    name: 'RC Circuit Charge',
    description: 'Model charging and discharging behavior of an RC circuit over time.',
    category: 'electronics',
    tags: ['circuit', 'capacitor', 'resistor'],
    version: '1.0.0',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    results: [],
    parameters: [
      { id: 'resistance', label: 'Resistance', type: 'range', value: 1000, defaultValue: 1000, min: 100, max: 100000, step: 100, unit: 'Ω' },
      { id: 'capacitance', label: 'Capacitance', type: 'range', value: 0.001, defaultValue: 0.001, min: 0.0001, max: 0.1, step: 0.0001, unit: 'F' },
      { id: 'voltage', label: 'Supply Voltage', type: 'range', value: 5, defaultValue: 5, min: 1, max: 24, step: 0.5, unit: 'V' },
      { id: 'mode', label: 'Mode', type: 'select', value: 'charging', defaultValue: 'charging', options: [{ label: 'Charging', value: 'charging' }, { label: 'Discharging', value: 'discharging' }] },
    ],
  },
  'sim-orbital': {
    id: 'sim-orbital',
    name: 'Orbital Mechanics',
    description: 'Simulate planetary orbits using Newtonian gravity with adjustable orbital parameters.',
    category: 'astronomy',
    tags: ['gravity', 'orbit', 'kepler'],
    version: '1.0.0',
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    results: [],
    parameters: [
      { id: 'mass_star', label: 'Star Mass', type: 'range', value: 1e30, defaultValue: 1e30, min: 1e29, max: 1e31, step: 1e29, unit: 'kg' },
      { id: 'mass_planet', label: 'Planet Mass', type: 'range', value: 6e24, defaultValue: 6e24, min: 1e23, max: 1e26, step: 1e23, unit: 'kg' },
      { id: 'distance', label: 'Orbital Distance', type: 'range', value: 150, defaultValue: 150, min: 10, max: 500, step: 10, unit: 'Gm' },
      { id: 'eccentricity', label: 'Eccentricity', type: 'range', value: 0.0167, defaultValue: 0.0167, min: 0, max: 0.9, step: 0.001, unit: '' },
      { id: 'steps', label: 'Orbit Steps', type: 'range', value: 360, defaultValue: 360, min: 60, max: 720, step: 60, unit: '' },
    ],
  },
}

const DEFAULT_LABS: Record<string, Lab> = {
  'lab-physics': {
    id: 'lab-physics',
    name: 'Physics Lab',
    description: 'Classical mechanics, waves, and electromagnetism experiments',
    simulations: ['sim-pendulum', 'sim-projectile', 'sim-wave'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: '#00d4ff',
    icon: '⚛️',
  },
  'lab-life': {
    id: 'lab-life',
    name: 'Life Sciences Lab',
    description: 'Biological systems, population dynamics, and ecology models',
    simulations: ['sim-population'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: '#00ff88',
    icon: '🧬',
  },
  'lab-space': {
    id: 'lab-space',
    name: 'Space & Astronomy',
    description: 'Orbital mechanics, stellar physics, and cosmology simulations',
    simulations: ['sim-orbital'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: '#9b59b6',
    icon: '🔭',
  },
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface SimulationStore {
  // State
  simulations: Record<string, Simulation>
  labs: Record<string, Lab>
  runtimes: Record<string, SimulationRuntime>
  activeSimulationId: string | null
  activePage: string
  theme: 'dark' | 'light'
  sidebarOpen: boolean
  searchQuery: string
  categoryFilter: string

  // Simulation Actions
  setActiveSimulation: (id: string | null) => void
  updateParameter: (simId: string, paramId: string, value: SimulationParameter['value']) => void
  resetParameters: (simId: string) => void
  toggleFavorite: (simId: string) => void
  createSimulation: (sim: Omit<Simulation, 'id' | 'createdAt' | 'updatedAt' | 'results'>) => string
  deleteSimulation: (simId: string) => void

  // Runtime Actions
  startSimulation: (simId: string) => void
  pauseSimulation: (simId: string) => void
  resumeSimulation: (simId: string) => void
  stopSimulation: (simId: string) => void
  updateRuntime: (simId: string, patch: Partial<SimulationRuntime>) => void
  pushLiveData: (simId: string, point: DataPoint) => void
  saveResult: (simId: string, result: SimulationResult) => void
  clearResults: (simId: string) => void

  // Lab Actions
  createLab: (lab: Omit<Lab, 'id' | 'createdAt' | 'updatedAt'>) => string
  deleteLab: (labId: string) => void
  addSimToLab: (labId: string, simId: string) => void
  removeSimFromLab: (labId: string, simId: string) => void

  // UI Actions
  setActivePage: (page: string) => void
  toggleTheme: () => void
  toggleSidebar: () => void
  setSearchQuery: (q: string) => void
  setCategoryFilter: (cat: string) => void
}

// ─── Store Implementation ─────────────────────────────────────────────────────

export const useSimulationStore = create<SimulationStore>()(
  persist(
    immer((set, _get) => ({
      simulations: DEFAULT_SIMULATIONS,
      labs: DEFAULT_LABS,
      runtimes: {},
      activeSimulationId: 'sim-pendulum',
      activePage: 'dashboard',
      theme: 'dark',
      sidebarOpen: true,
      searchQuery: '',
      categoryFilter: 'all',

      // ── Simulation Actions ──
      setActiveSimulation: (id) =>
        set((s) => { s.activeSimulationId = id }),

      updateParameter: (simId, paramId, value) =>
        set((s) => {
          const param = s.simulations[simId]?.parameters.find((p) => p.id === paramId)
          if (param) { param.value = value; s.simulations[simId].updatedAt = new Date().toISOString() }
        }),

      resetParameters: (simId) =>
        set((s) => {
          const sim = s.simulations[simId]
          if (sim) sim.parameters.forEach((p) => { p.value = p.defaultValue })
        }),

      toggleFavorite: (simId) =>
        set((s) => {
          if (s.simulations[simId]) s.simulations[simId].isFavorite = !s.simulations[simId].isFavorite
        }),

      createSimulation: (sim) => {
        const id = `sim-${uuidv4().slice(0, 8)}`
        set((s) => {
          s.simulations[id] = {
            ...sim,
            id,
            results: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        })
        return id
      },

      deleteSimulation: (simId) =>
        set((s) => {
          delete s.simulations[simId]
          delete s.runtimes[simId]
          if (s.activeSimulationId === simId) s.activeSimulationId = null
        }),

      // ── Runtime Actions ──
      startSimulation: (simId) =>
        set((s) => {
          s.runtimes[simId] = {
            id: simId,
            status: 'running',
            progress: 0,
            currentStep: 0,
            totalSteps: 100,
            startedAt: Date.now(),
            elapsedMs: 0,
            liveData: [],
            error: null,
          }
        }),

      pauseSimulation: (simId) =>
        set((s) => {
          if (s.runtimes[simId]) s.runtimes[simId].status = 'paused'
        }),

      resumeSimulation: (simId) =>
        set((s) => {
          if (s.runtimes[simId]) s.runtimes[simId].status = 'running'
        }),

      stopSimulation: (simId) =>
        set((s) => {
          if (s.runtimes[simId]) s.runtimes[simId].status = 'idle'
        }),

      updateRuntime: (simId, patch) =>
        set((s) => {
          if (s.runtimes[simId]) Object.assign(s.runtimes[simId], patch)
        }),

      pushLiveData: (simId, point) =>
        set((s) => {
          if (s.runtimes[simId]) s.runtimes[simId].liveData.push(point)
        }),

      saveResult: (simId, result) =>
        set((s) => {
          if (s.simulations[simId]) {
            s.simulations[simId].results.push(result)
            s.simulations[simId].updatedAt = new Date().toISOString()
          }
        }),

      clearResults: (simId) =>
        set((s) => {
          if (s.simulations[simId]) s.simulations[simId].results = []
        }),

      // ── Lab Actions ──
      createLab: (lab) => {
        const id = `lab-${uuidv4().slice(0, 8)}`
        set((s) => {
          s.labs[id] = { ...lab, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        })
        return id
      },

      deleteLab: (labId) =>
        set((s) => { delete s.labs[labId] }),

      addSimToLab: (labId, simId) =>
        set((s) => {
          if (s.labs[labId] && !s.labs[labId].simulations.includes(simId))
            s.labs[labId].simulations.push(simId)
        }),

      removeSimFromLab: (labId, simId) =>
        set((s) => {
          if (s.labs[labId])
            s.labs[labId].simulations = s.labs[labId].simulations.filter((id) => id !== simId)
        }),

      // ── UI Actions ──
      setActivePage: (page) => set((s) => { s.activePage = page }),
      toggleTheme: () => set((s) => { s.theme = s.theme === 'dark' ? 'light' : 'dark' }),
      toggleSidebar: () => set((s) => { s.sidebarOpen = !s.sidebarOpen }),
      setSearchQuery: (q) => set((s) => { s.searchQuery = q }),
      setCategoryFilter: (cat) => set((s) => { s.categoryFilter = cat }),
    })),
    {
      name: 'vlsm-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ simulations: s.simulations, labs: s.labs, theme: s.theme }),
    }
  )
)
