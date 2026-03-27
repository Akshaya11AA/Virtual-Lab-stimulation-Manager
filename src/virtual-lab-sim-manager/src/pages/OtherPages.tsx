import { motion } from 'framer-motion'
import { Star, Moon, Sun, Trash2 } from 'lucide-react'
import { useSimulationStore } from '../store/simulationStore'
import SimulationRunner from '../components/SimulationRunner'
import toast from 'react-hot-toast'

// ─── Favorites ────────────────────────────────────────────────────────────────
export function FavoritesPage() {
  const simulations = useSimulationStore((s) => s.simulations)
  const activeSimulationId = useSimulationStore((s) => s.activeSimulationId)
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation)
  const toggleFavorite = useSimulationStore((s) => s.toggleFavorite)

  const favorites = Object.values(simulations).filter((s) => s.isFavorite)

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Star size={22} style={{ color: '#ffd700', fill: '#ffd700' }} /> Favorites
      </h1>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Star simulations to find them here</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: activeSimulationId ? '300px 1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {favorites.map((sim, i) => (
              <motion.div key={sim.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card" style={{ padding: '16px 18px', cursor: 'pointer', borderLeft: '3px solid #ffd700' }}
                onClick={() => setActiveSimulation(activeSimulationId === sim.id ? null : sim.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{sim.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sim.category} · {sim.results.length} runs</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(sim.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Star size={15} style={{ color: '#ffd700', fill: '#ffd700' }} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          {activeSimulationId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SimulationRunner simId={activeSimulationId} />
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export function SettingsPage() {
  const theme = useSimulationStore((s) => s.theme)
  const toggleTheme = useSimulationStore((s) => s.toggleTheme)
  const simulations = useSimulationStore((s) => s.simulations)
  const clearResults = useSimulationStore((s) => s.clearResults)

  const totalRuns = Object.values(simulations).reduce((a, s) => a + s.results.length, 0)

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Settings</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
        {/* Theme */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 4, fontWeight: 600 }}>Appearance</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Toggle between dark and light mode.</p>
          <button onClick={toggleTheme} className="btn btn-ghost" style={{ gap: 10 }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        {/* Data */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 4, fontWeight: 600 }}>Data Management</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
            You have <strong style={{ color: 'var(--accent-cyan)' }}>{totalRuns}</strong> total simulation results stored in your browser.
          </p>
          <button
            onClick={() => {
              Object.keys(simulations).forEach((id) => clearResults(id))
              toast.success('All results cleared')
            }}
            className="btn btn-danger"
            disabled={totalRuns === 0}
          >
            <Trash2 size={15} /> Clear All Results
          </button>
        </div>

        {/* Info */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 12, fontWeight: 600 }}>About</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['App', 'Virtual Lab Simulation Manager'],
              ['Version', '1.0.0'],
              ['Storage', 'Browser localStorage'],
              ['Framework', 'React + TypeScript + Vite'],
              ['Charts', 'Recharts'],
              ['State', 'Zustand + Immer'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
