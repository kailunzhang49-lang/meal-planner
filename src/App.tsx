import { useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './components/Navbar'
import { AnimatedBackground } from './components/AnimatedBackground'
import { CursorSpotlight } from './components/CursorSpotlight'
import { NetworkStatus } from './components/NetworkStatus'
import { Home } from './pages/Home'
import { History } from './pages/History'
import { Favorites } from './pages/Favorites'
import { Settings } from './pages/Settings'
import { ShoppingList } from './pages/ShoppingList'
import { WeeklyView } from './pages/WeeklyView'
import { getSettings } from './lib/storage'

const pageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.2 } },
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/shopping" element={<ShoppingList />} />
          <Route path="/weekly" element={<WeeklyView />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function DarkModeInit() {
  useEffect(() => {
    const settings = getSettings()
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <DarkModeInit />
      <div className="min-h-screen bg-warm-50 dark:bg-warm-900 text-warm-800 dark:text-warm-100 transition-colors duration-300">
        <AnimatedBackground />
        <CursorSpotlight />
        <div className="relative">
          <NetworkStatus />
          <Navbar />
          <main className="pt-2">
            <AnimatedRoutes />
          </main>
        </div>
      </div>
    </HashRouter>
  )
}
