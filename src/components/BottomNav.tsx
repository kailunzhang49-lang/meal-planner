import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, BookOpen, Heart, ShoppingCart, CalendarDays, Settings,
} from 'lucide-react'
import { cn } from '../lib/utils'

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/shopping', icon: ShoppingCart, label: '采购' },
  { path: '/favorites', icon: Heart, label: '收藏' },
  { path: '/history', icon: BookOpen, label: '历史' },
  { path: '/weekly', icon: CalendarDays, label: '周览' },
  { path: '/settings', icon: Settings, label: '设置' },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[env(safe-area-inset-bottom)] pt-1">
      <div className="glass-nav rounded-2xl px-2 py-2 mx-auto max-w-md shadow-xl shadow-black/30">
        <div className="flex items-center justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors duration-200',
                  active ? 'text-gold-400' : 'text-ink-4 hover:text-ink-2',
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute inset-0 rounded-xl bg-gold-500/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-gold-400"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
