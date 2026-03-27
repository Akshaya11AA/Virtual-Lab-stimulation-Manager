import { motion } from 'framer-motion'
import { FlaskConical, Star, Play, CheckCircle, Clock } from 'lucide-react'
import { useSimulationStore } from '../store/simulationStore'

const CATEGORY_ICONS: Record<string, string> = {
  physics: '⚛️', chemistry: '🧪', biology: '🧬',
  mathematics: '📐', engineering: '⚙️', astronomy: '🔭', electronics: '⚡',
}

export default function DashboardPage() {
  const simulations = useSimulationStore((s) => s.simulations)
  const labs = useSimulationStore((s) => s.labs)
  const runtimes = useSimulationStore((s) => s.runtimes)
  const setActivePage = useSimulationStore((s) => s.setActivePage)
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation)

  const simList = Object.values(simulations)
  const totalRuns = simList.reduce((acc, s) => acc + s.results.length, 0)
  const favorites = simList.filter((s) => s.isFavorite)
  const running = Object.values(runtimes).filter((r) => r.status === 'running').length

  const stats = [
    { label: 'Simulations', value: simList.length, icon: FlaskConical, color: '#00d4ff' },
    { label: 'Labs', value: Object.keys(labs).length, icon: FlaskConical, color: '#00ff88' },
    { label: 'Total Runs', value: totalRuns, icon: CheckCircle, color: '#9b59b6' },
    { label: 'Favorites', value: favorites.length, icon: Star, color: '#ffd700' },
    { label: 'Running Now', value: running, icon: Play, color: '#ff6b35' },
  ]

  const recentSims = simList
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
          Welcome to <span className="glow-text">Virtual Lab</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Run physics, biology, electronics, and astronomy simulations entirely in your browser.
        </p>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card"
            style={{ padding: '20px 18px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
              </div>
              <Icon size={20} style={{ color, opacity: 0.7 }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Start + Recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Simulations */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} style={{ color: 'var(--accent-cyan)' }} /> Recent Simulations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentSims.map((sim) => (
              <button
                key={sim.id}
                onClick={() => { setActiveSimulation(sim.id); setActivePage('simulations') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                  textAlign: 'left', transition: 'all var(--transition)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-bright)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}
              >
                <span style={{ fontSize: 24 }}>{CATEGORY_ICONS[sim.category] ?? '🔬'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sim.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {sim.results.length} runs · {sim.category}
                  </div>
                </div>
                {sim.isFavorite && <Star size={13} style={{ color: '#ffd700', fill: '#ffd700', flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Labs Overview */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>My Labs</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.values(labs).map((lab) => (
              <div
                key={lab.id}
                className="glass-card"
                style={{
                  padding: '14px 16px', cursor: 'pointer',
                  borderLeft: `3px solid ${lab.color}`,
                }}
                onClick={() => setActivePage('labs')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{lab.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{lab.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{lab.simulations.length} simulations</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActivePage('labs')}
            className="btn btn-ghost"
            style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}
          >
            Manage Labs →
          </button>
        </motion.div>
      </div>
    </div>
  )
}
