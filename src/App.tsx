import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './components/Navbar'
import { AnimatedBackground } from './components/AnimatedBackground'
import { CursorSpotlight } from './components/CursorSpotlight'
import { Home } from './pages/Home'
import { History } from './pages/History'
import { Favorites } from './pages/Favorites'
import { Settings } from './pages/Settings'

const pageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.2 } },
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-warm-50">
        <AnimatedBackground />
        <CursorSpotlight />
        <div className="relative">
          <Navbar />
          <main className="pt-2">
            <AnimatedRoutes />
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
