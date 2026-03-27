import { useCallback, useRef } from 'react'
import { useSimulationStore } from '../store/simulationStore'
import { runSimulation } from '../simulations/engine'
import type { DataPoint } from '../types'
import toast from 'react-hot-toast'

export function useSimulationRunner(simId: string) {
  const abortRef = useRef<AbortController | null>(null)

  const sim = useSimulationStore((s) => s.simulations[simId])
  const runtime = useSimulationStore((s) => s.runtimes[simId])
  const startSimulation = useSimulationStore((s) => s.startSimulation)
  const pauseSimulation = useSimulationStore((s) => s.pauseSimulation)
  const resumeSimulation = useSimulationStore((s) => s.resumeSimulation)
  const stopSimulation = useSimulationStore((s) => s.stopSimulation)
  const updateRuntime = useSimulationStore((s) => s.updateRuntime)
  const saveResult = useSimulationStore((s) => s.saveResult)

  const run = useCallback(async () => {
    if (!sim) return
    abortRef.current = new AbortController()
    startSimulation(simId)
    const toastId = toast.loading(`Running ${sim.name}...`)

    try {
      const result = await runSimulation(sim, {
        signal: abortRef.current.signal,
        onProgress: (progress: number, points: DataPoint[]) => {
          updateRuntime(simId, {
            progress,
            currentStep: points.length,
            liveData: points,
            elapsedMs: Date.now() - (Date.now() - progress * 10),
          })
        },
      })

      saveResult(simId, result)
      updateRuntime(simId, { status: 'completed', progress: 100 })
      toast.success(`${sim.name} completed! ${result.dataPoints.length} points`, { id: toastId })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      updateRuntime(simId, { status: 'error', error: msg })
      toast.error(`Simulation failed: ${msg}`, { id: toastId })
    }
  }, [sim, simId, startSimulation, updateRuntime, saveResult])

  const pause = useCallback(() => pauseSimulation(simId), [simId, pauseSimulation])
  const resume = useCallback(() => resumeSimulation(simId), [simId, resumeSimulation])
  const stop = useCallback(() => {
    abortRef.current?.abort()
    stopSimulation(simId)
  }, [simId, stopSimulation])

  return { run, pause, resume, stop, runtime, sim }
}
