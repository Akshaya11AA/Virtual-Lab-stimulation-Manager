import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import SimulationsPage from './pages/SimulationsPage'
import LabsPage from './pages/LabsPage'
import { FavoritesPage, SettingsPage } from './pages/OtherPages'
import { useSimulationStore } from './store/simulationStore'
import './styles/global.css'

const PAGE_MAP: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  simulations: SimulationsPage,
  labs: LabsPage,
  favorites: FavoritesPage,
  settings: SettingsPage,
}

export default function App() {
  const activePage = useSimulationStore((s) => s.activePage)
  const PageComponent = PAGE_MAP[activePage] ?? DashboardPage

  return (
    <div className="grid-bg" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, overflow: 'auto', padding: '32px 28px', minWidth: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            <PageComponent />
          </motion.div>
        </AnimatePresence>
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#00ff88', secondary: '#000' } },
          error: { iconTheme: { primary: '#ff4757', secondary: '#000' } },
        }}
      />
    </div>
  )
}
