import { HashRouter, Routes, Route } from 'react-router-dom'
import { AnimatedBackground } from './components/AnimatedBackground'
import { BottomNav } from './components/BottomNav'
import { NetworkStatus } from './components/NetworkStatus'
import { Home } from './pages/Home'
import { History } from './pages/History'
import { Favorites } from './pages/Favorites'
import { ShoppingList } from './pages/ShoppingList'
import { WeeklyView } from './pages/WeeklyView'
import { Settings } from './pages/Settings'

export default function App() {
  return (
    <HashRouter>
      <AnimatedBackground />
      <NetworkStatus />
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/shopping" element={<ShoppingList />} />
          <Route path="/weekly" element={<WeeklyView />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <BottomNav />
    </HashRouter>
  )
}
