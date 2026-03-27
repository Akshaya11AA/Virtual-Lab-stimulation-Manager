// ============================================================
// VIRTUAL LAB SIMULATION MANAGER — CORE TYPES
// ============================================================

export type SimulationCategory =
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'mathematics'
  | 'engineering'
  | 'astronomy'
  | 'electronics'

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error'

export type ParameterType = 'number' | 'boolean' | 'select' | 'range' | 'color'

export interface SelectOption {
  label: string
  value: string | number
}

export interface SimulationParameter {
  id: string
  label: string
  description?: string
  type: ParameterType
  value: number | boolean | string
  defaultValue: number | boolean | string
  min?: number
  max?: number
  step?: number
  unit?: string
  options?: SelectOption[]
}

export interface DataPoint {
  timestamp: number
  x: number
  y: number
  z?: number
  label?: string
  metadata?: Record<string, unknown>
}

export interface SimulationResult {
  id: string
  simulationId: string
  runAt: string
  duration: number // ms
  dataPoints: DataPoint[]
  summary: Record<string, number | string>
  status: 'success' | 'failed' | 'aborted'
  errorMessage?: string
}

export interface Simulation {
  id: string
  name: string
  description: string
  category: SimulationCategory
  tags: string[]
  parameters: SimulationParameter[]
  results: SimulationResult[]
  createdAt: string
  updatedAt: string
  isFavorite: boolean
  thumbnail?: string
  version: string
}

export interface Lab {
  id: string
  name: string
  description: string
  simulations: string[] // simulation IDs
  createdAt: string
  updatedAt: string
  color: string
  icon: string
}

export interface AppState {
  simulations: Record<string, Simulation>
  labs: Record<string, Lab>
  activeSimulationId: string | null
  runningSimulations: Set<string>
  theme: 'dark' | 'light'
  sidebarOpen: boolean
}

export interface SimulationRuntime {
  id: string
  status: SimulationStatus
  progress: number // 0–100
  currentStep: number
  totalSteps: number
  startedAt: number | null
  elapsedMs: number
  liveData: DataPoint[]
  error: string | null
}

export interface ChartConfig {
  xAxis: string
  yAxis: string
  title: string
  type: 'line' | 'scatter' | 'bar' | 'area'
  color: string
}

export interface ExportFormat {
  format: 'csv' | 'json' | 'png'
  includeParameters: boolean
  includeMetadata: boolean
}
