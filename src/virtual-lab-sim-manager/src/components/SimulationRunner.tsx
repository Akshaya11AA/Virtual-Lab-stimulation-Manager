import { Play, Pause, Square, Download, Trash2, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSimulationRunner } from '../hooks/useSimulationRunner'
import { useSimulationStore } from '../store/simulationStore'
import ResultsChart from './ResultsChart'
import ParameterPanel from './ParameterPanel'
import { exportToCSV, exportToJSON } from '../utils/export'
import toast from 'react-hot-toast'

interface Props {
  simId: string
}

export default function SimulationRunner({ simId }: Props) {
  const { run, pause, resume, stop, runtime, sim } = useSimulationRunner(simId)
  const clearResults = useSimulationStore((s) => s.clearResults)

  if (!sim) return null

  const isRunning = runtime?.status === 'running'
  const isPaused = runtime?.status === 'paused'
  const latestResult = sim.results[sim.results.length - 1]
  const liveData = runtime?.liveData ?? []
  const displayData = isRunning || isPaused ? liveData : (latestResult?.dataPoints ?? [])

  const catClass = `cat-${sim.category}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className={`badge ${catClass}`} style={{ color: 'var(--cat-color)', background: 'color-mix(in srgb, var(--cat-color) 15%, transparent)' }}>
                {sim.category}
              </span>
              <span className={`badge badge-${runtime?.status ?? 'idle'}`}>
                {runtime?.status ?? 'idle'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>{sim.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: 500 }}>{sim.description}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {!isRunning && !isPaused && (
              <button onClick={run} className="btn btn-success" disabled={isRunning}>
                <Play size={15} /> Run Simulation
              </button>
            )}
            {isRunning && (
              <button onClick={pause} className="btn btn-ghost">
                <Pause size={15} /> Pause
              </button>
            )}
            {isPaused && (
              <button onClick={resume} className="btn btn-primary">
                <Play size={15} /> Resume
              </button>
            )}
            {(isRunning || isPaused) && (
              <button onClick={stop} className="btn btn-danger">
                <Square size={15} /> Stop
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        {(isRunning || isPaused) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>{runtime?.currentStep ?? 0} data points</span>
              <span>{runtime?.progress ?? 0}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${runtime?.progress ?? 0}%` }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        {/* Parameter Panel */}
        <ParameterPanel simId={simId} />

        {/* Chart + Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <ResultsChart
              simId={simId}
              data={displayData}
              isLive={isRunning}
            />
          </div>

          {/* Summary Stats */}
          {latestResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card" style={{ padding: 20 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BarChart3 size={16} style={{ color: 'var(--accent-cyan)' }} />
                  Result Summary
                </h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { exportToCSV(sim, latestResult); toast.success('CSV exported!') }}
                    className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '7px 14px' }}
                  >
                    <Download size={13} /> CSV
                  </button>
                  <button
                    onClick={() => { exportToJSON(sim, latestResult); toast.success('JSON exported!') }}
                    className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '7px 14px' }}
                  >
                    <Download size={13} /> JSON
                  </button>
                  <button
                    onClick={() => { clearResults(simId); toast.success('Results cleared') }}
                    className="btn btn-danger" style={{ fontSize: '0.78rem', padding: '7px 14px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {Object.entries(latestResult.summary).map(([key, val]) => (
                  <div key={key} style={{
                    background: 'var(--bg-elevated)', borderRadius: 8, padding: '12px 14px',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{key}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{String(val)}</div>
                  </div>
                ))}
                <div style={{
                  background: 'var(--bg-elevated)', borderRadius: 8, padding: '12px 14px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>Duration</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                    {latestResult.duration.toFixed(0)} ms
                  </div>
                </div>
              </div>

              {sim.results.length > 1 && (
                <p style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {sim.results.length} total runs saved
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
