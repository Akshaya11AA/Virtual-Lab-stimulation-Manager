import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FlaskConical, BookOpen, Star, Settings,
  ChevronLeft, ChevronRight, Atom, Dna, Calculator, Cog, Telescope, CircuitBoard,
} from 'lucide-react'
import { useSimulationStore } from '../store/simulationStore'

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'simulations', label: 'Simulations', icon: FlaskConical },
  { id: 'labs', label: 'My Labs', icon: BookOpen },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const CATEGORIES = [
  { id: 'physics', label: 'Physics', icon: Atom, color: '#00d4ff' },
  { id: 'chemistry', label: 'Chemistry', icon: FlaskConical, color: '#ff6b35' },
  { id: 'biology', label: 'Biology', icon: Dna, color: '#00ff88' },
  { id: 'mathematics', label: 'Mathematics', icon: Calculator, color: '#ffd700' },
  { id: 'engineering', label: 'Engineering', icon: Cog, color: '#9b59b6' },
  { id: 'astronomy', label: 'Astronomy', icon: Telescope, color: '#e91e8c' },
  { id: 'electronics', label: 'Electronics', icon: CircuitBoard, color: '#f39c12' },
]

export default function Sidebar() {
  const activePage = useSimulationStore((s) => s.activePage)
  const sidebarOpen = useSimulationStore((s) => s.sidebarOpen)
  const categoryFilter = useSimulationStore((s) => s.categoryFilter)
  const setActivePage = useSimulationStore((s) => s.setActivePage)
  const toggleSidebar = useSimulationStore((s) => s.toggleSidebar)
  const setCategoryFilter = useSimulationStore((s) => s.setCategoryFilter)

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'var(--bg-panel)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 72,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #00d4ff, #00ff88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 18,
        }}>⚗</div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }}>Virtual Lab</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>SIM MANAGER</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav style={{ padding: '12px 8px', flex: 1, overflowY: 'auto' }}>
        <div style={{ marginBottom: 4 }}>
          {PAGES.map(({ id, label, icon: Icon }) => {
            const active = activePage === id
            return (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                title={!sidebarOpen ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  border: 'none', cursor: 'pointer', marginBottom: 2,
                  background: active ? 'rgba(0,212,255,0.12)' : 'transparent',
                  color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  transition: 'all var(--transition)', textAlign: 'left',
                  borderLeft: active ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </div>

        {/* Category Filter */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ marginTop: 20 }}
            >
              <div style={{
                color: 'var(--text-muted)', fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
                padding: '0 12px 8px', textTransform: 'uppercase',
              }}>Categories</div>
              <button
                onClick={() => setCategoryFilter('all')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '7px 12px', borderRadius: 'var(--radius-sm)',
                  border: 'none', cursor: 'pointer', marginBottom: 2,
                  background: categoryFilter === 'all' ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: categoryFilter === 'all' ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '0.8rem', textAlign: 'left',
                }}
              >
                <span>🔬</span> All Categories
              </button>
              {CATEGORIES.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => setCategoryFilter(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '7px 12px', borderRadius: 'var(--radius-sm)',
                    border: 'none', cursor: 'pointer', marginBottom: 2,
                    background: categoryFilter === id ? `${color}18` : 'transparent',
                    color: categoryFilter === id ? color : 'var(--text-muted)',
                    fontSize: '0.8rem', textAlign: 'left',
                    transition: 'all var(--transition)',
                  }}
                >
                  <Icon size={14} style={{ flexShrink: 0 }} />
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="btn btn-ghost"
        style={{ margin: '12px 8px', padding: '10px', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </motion.aside>
  )
}
