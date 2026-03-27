import {
  LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import { getChartLabels } from '../simulations/engine'
import type { DataPoint } from '../types'

interface Props {
  simId: string
  data: DataPoint[]
  isLive?: boolean
}

// Downsample for performance
function downsample(data: DataPoint[], maxPoints = 400): DataPoint[] {
  if (data.length <= maxPoints) return data
  const step = Math.ceil(data.length / maxPoints)
  return data.filter((_, i) => i % step === 0)
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>
        {typeof label === 'number' ? label.toFixed(3) : label}
      </div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(4) : p.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default function ResultsChart({ simId, data, isLive = false }: Props) {
  const labels = getChartLabels(simId)
  const sampled = downsample(data)
  const isOrbital = simId === 'sim-orbital'

  const chartData = sampled.map((p) => ({
    x: parseFloat(p.x.toFixed(4)),
    y: parseFloat(p.y.toFixed(4)),
    ...(p.z !== undefined ? { z: parseFloat((p.z as number).toFixed(4)) } : {}),
  }))

  if (data.length === 0) {
    return (
      <div style={{
        height: 300, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
        color: 'var(--text-muted)',
      }}>
        <div style={{ fontSize: 40 }}>📊</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Run a simulation to see results</div>
      </div>
    )
  }

  if (isOrbital) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h4 style={{ fontWeight: 600, fontSize: '0.875rem' }}>{labels.title}</h4>
          {isLive && <span className="badge badge-running"><span className="animate-pulse">●</span> LIVE</span>}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="x" name={labels.x} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} label={{ value: labels.x, position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 11 }} />
            <YAxis dataKey="y" name={labels.y} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="rgba(255,255,255,0.1)" />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
            <Scatter data={chartData} fill="#00d4ff" opacity={0.8} />
            {/* Star at center */}
            <Scatter data={[{ x: 0, y: 0 }]} fill="#ffd700" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ fontWeight: 600, fontSize: '0.875rem' }}>{labels.title}</h4>
        {isLive && <span className="badge badge-running"><span className="animate-pulse">●</span> LIVE</span>}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="x"
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono' }}
            label={{ value: labels.x, position: 'insideBottom', offset: -10, fill: 'var(--text-secondary)', fontSize: 11 }}
          />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono' }} />
          <Tooltip content={<CustomTooltip />} />
          {labels.z && <Legend wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} />}
          <Line
            type="monotone" dataKey="y" name={labels.y}
            stroke="#00d4ff" strokeWidth={2} dot={false}
            isAnimationActive={!isLive}
          />
          {labels.z && (
            <Line
              type="monotone" dataKey="z" name={labels.z}
              stroke="#00ff88" strokeWidth={2} dot={false}
              isAnimationActive={!isLive}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
