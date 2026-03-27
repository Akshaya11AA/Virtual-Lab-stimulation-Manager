import { motion } from 'framer-motion'
import { Search, Star, ChevronRight } from 'lucide-react'
import { useSimulationStore } from '../store/simulationStore'
import SimulationRunner from '../components/SimulationRunner'

const CATEGORY_ICONS: Record<string, string> = {
  physics: '⚛️', chemistry: '🧪', biology: '🧬',
  mathematics: '📐', engineering: '⚙️', astronomy: '🔭', electronics: '⚡',
}

const CATEGORY_COLORS: Record<string, string> = {
  physics: '#00d4ff', chemistry: '#ff6b35', biology: '#00ff88',
  mathematics: '#ffd700', engineering: '#9b59b6', astronomy: '#e91e8c', electronics: '#f39c12',
}

export default function SimulationsPage() {
  const simulations = useSimulationStore((s) => s.simulations)
  const activeSimulationId = useSimulationStore((s) => s.activeSimulationId)
  const categoryFilter = useSimulationStore((s) => s.categoryFilter)
  const searchQuery = useSimulationStore((s) => s.searchQuery)
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation)
  const toggleFavorite = useSimulationStore((s) => s.toggleFavorite)
  const setSearchQuery = useSimulationStore((s) => s.setSearchQuery)
  const runtimes = useSimulationStore((s) => s.runtimes)

  const simList = Object.values(simulations).filter((sim) => {
    const matchCat = categoryFilter === 'all' || sim.category === categoryFilter
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || sim.name.toLowerCase().includes(q) || sim.tags.some((t) => t.includes(q))
    return matchCat && matchSearch
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: activeSimulationId ? '320px 1fr' : '1fr', gap: 20 }}>
      {/* Sim List */}
      <div>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search simulations..."
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {simList.map((sim, i) => {
            const runtime = runtimes[sim.id]
            const isActive = activeSimulationId === sim.id
            const catColor = CATEGORY_COLORS[sim.category] ?? '#00d4ff'
            const isRunning = runtime?.status === 'running'

            return (
              <motion.div
                key={sim.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setActiveSimulation(isActive ? null : sim.id)}
                style={{
                  background: isActive ? `color-mix(in srgb, ${catColor} 8%, var(--bg-surface))` : 'var(--bg-surface)',
                  border: `1px solid ${isActive ? catColor + '44' : 'var(--border)'}`,
                  borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                  transition: 'all var(--transition)',
                  borderLeft: `3px solid ${catColor}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{CATEGORY_ICONS[sim.category]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sim.name}</span>
                      {isRunning && <span className="badge badge-running animate-pulse">LIVE</span>}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {sim.description}
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {sim.tags.slice(0, 3).map((tag) => (
                        <span key={tag} style={{
                          fontSize: '0.62rem', padding: '2px 7px', borderRadius: 4,
                          background: 'var(--bg-elevated)', color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(sim.id) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                    >
                      <Star size={14} style={{ color: sim.isFavorite ? '#ffd700' : 'var(--text-muted)', fill: sim.isFavorite ? '#ffd700' : 'none' }} />
                    </button>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {sim.results.length} runs
                    </span>
                    <ChevronRight size={14} style={{ color: isActive ? catColor : 'var(--text-muted)' }} />
                  </div>
                </div>
              </motion.div>
            )
          })}

          {simList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>No simulations found</div>
            </div>
          )}
        </div>
      </div>

      {/* Runner Panel */}
      {activeSimulationId && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <SimulationRunner simId={activeSimulationId} />
        </motion.div>
      )}
    </div>
  )
}
