import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { useSimulationStore } from '../store/simulationStore'
import toast from 'react-hot-toast'

const COLORS = ['#00d4ff', '#00ff88', '#9b59b6', '#ff6b35', '#ffd700', '#e91e8c', '#f39c12']
const ICONS  = ['🔬', '⚛️', '🧪', '🧬', '📐', '⚙️', '🔭', '⚡', '🌊', '🧲']

export default function LabsPage() {
  const labs = useSimulationStore((s) => s.labs)
  const simulations = useSimulationStore((s) => s.simulations)
  const createLab = useSimulationStore((s) => s.createLab)
  const deleteLab = useSimulationStore((s) => s.deleteLab)
  const removeSimFromLab = useSimulationStore((s) => s.removeSimFromLab)
  const addSimToLab = useSimulationStore((s) => s.addSimToLab)

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0], icon: ICONS[0] })

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error('Lab name required'); return }
    createLab({ name: form.name, description: form.description, color: form.color, icon: form.icon, simulations: [] })
    setForm({ name: '', description: '', color: COLORS[0], icon: ICONS[0] })
    setShowCreate(false)
    toast.success('Lab created!')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My Labs</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
          <Plus size={15} /> New Lab
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Create New Lab</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <input className="input" placeholder="Lab name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Color</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })} style={{
                    width: 24, height: 24, borderRadius: '50%', background: c, border: form.color === c ? '2px solid white' : 'none', cursor: 'pointer',
                  }} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Icon</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {ICONS.map((ic) => (
                  <button key={ic} onClick={() => setForm({ ...form, icon: ic })} style={{
                    fontSize: 20, background: form.icon === ic ? 'var(--bg-elevated)' : 'transparent',
                    border: form.icon === ic ? '1px solid var(--border-bright)' : '1px solid transparent',
                    borderRadius: 6, padding: 4, cursor: 'pointer',
                  }}>{ic}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleCreate} className="btn btn-primary">Create Lab</button>
            <button onClick={() => setShowCreate(false)} className="btn btn-ghost">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Labs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {Object.values(labs).map((lab, i) => (
          <motion.div key={lab.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass-card" style={{ padding: 20, borderTop: `3px solid ${lab.color}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>{lab.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{lab.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lab.description}</div>
                </div>
              </div>
              <button onClick={() => { deleteLab(lab.id); toast.success('Lab deleted') }} className="btn btn-danger btn-icon">
                <Trash2 size={13} />
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
                SIMULATIONS ({lab.simulations.length})
              </div>
              {lab.simulations.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '12px 0' }}>No simulations added yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {lab.simulations.map((simId) => {
                    const sim = simulations[simId]
                    if (!sim) return null
                    return (
                      <div key={simId} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'var(--bg-elevated)', borderRadius: 8, padding: '8px 12px',
                      }}>
                        <span style={{ fontSize: '0.8rem' }}>{sim.name}</span>
                        <button onClick={() => removeSimFromLab(lab.id, simId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', fontSize: 16, lineHeight: 1 }}>×</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Add sim dropdown */}
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) { addSimToLab(lab.id, e.target.value); toast.success('Simulation added!') }
                e.target.value = ''
              }}
              style={{ width: '100%', fontSize: '0.8rem' }}
            >
              <option value="" disabled>+ Add simulation...</option>
              {Object.values(simulations).filter((s) => !lab.simulations.includes(s.id)).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
