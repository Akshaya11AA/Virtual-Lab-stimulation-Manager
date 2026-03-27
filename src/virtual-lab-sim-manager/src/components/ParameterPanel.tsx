import { RotateCcw } from 'lucide-react'
import { useSimulationStore } from '../store/simulationStore'
import type { SimulationParameter } from '../types'

interface Props {
  simId: string
}

function ParamControl({ param, simId }: { param: SimulationParameter; simId: string }) {
  const updateParameter = useSimulationStore((s) => s.updateParameter)

  const onChange = (value: SimulationParameter['value']) =>
    updateParameter(simId, param.id, value)

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {param.label}
        </label>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
          color: 'var(--accent-cyan)', background: 'rgba(0,212,255,0.1)',
          padding: '2px 8px', borderRadius: 4,
        }}>
          {typeof param.value === 'number'
            ? param.value < 0.001 ? param.value.toExponential(2) : param.value
            : String(param.value)}
          {param.unit ? ` ${param.unit}` : ''}
        </span>
      </div>

      {param.type === 'range' && (
        <input
          type="range"
          min={param.min} max={param.max} step={param.step}
          value={param.value as number}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      )}

      {param.type === 'number' && (
        <input
          type="number" className="input"
          min={param.min} max={param.max} step={param.step}
          value={param.value as number}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      )}

      {param.type === 'select' && (
        <select
          value={param.value as string}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%' }}
        >
          {param.options?.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
          ))}
        </select>
      )}

      {param.type === 'boolean' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={param.value as boolean}
            onChange={(e) => onChange(e.target.checked)}
            style={{ accentColor: 'var(--accent-cyan)', width: 16, height: 16 }}
          />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enabled</span>
        </label>
      )}

      {param.description && (
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{param.description}</p>
      )}
    </div>
  )
}

export default function ParameterPanel({ simId }: Props) {
  const sim = useSimulationStore((s) => s.simulations[simId])
  const resetParameters = useSimulationStore((s) => s.resetParameters)

  if (!sim) return null

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Parameters</h3>
        <button
          onClick={() => resetParameters(simId)}
          className="btn btn-ghost btn-icon"
          title="Reset to defaults"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div>
        {sim.parameters.map((param) => (
          <ParamControl key={param.id} param={param} simId={simId} />
        ))}
      </div>
    </div>
  )
}
