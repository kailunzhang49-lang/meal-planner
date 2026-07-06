import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { CalendarDays, Clock, Heart, Settings as SettingsIcon, ShoppingCart, LayoutGrid } from 'lucide-react'
import { cn } from '../lib/utils'

const links = [
  { to: '/', label: '日历', icon: CalendarDays },
  { to: '/history', label: '历史', icon: Clock },
  { to: '/favorites', label: '收藏', icon: Heart },
  { to: '/shopping', label: '采购', icon: ShoppingCart },
  { to: '/weekly', label: '周览', icon: LayoutGrid },
  { to: '/settings', label: '设置', icon: SettingsIcon },
]

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="sticky top-0 z-40"
    >
      <div className="glass border-b border-warm-200/40 dark:border-warm-700/40">
        <div className="max-w-lg mx-auto px-3">
          <div className="flex items-center justify-between h-12">
            <NavLink to="/" className="flex items-center gap-1.5 group shrink-0">
              <motion.span
                className="text-lg"
                whileHover={{ rotate: [0, -10, 10, -5, 0] }}
                transition={{ duration: 0.5 }}
              >
                🥗
              </motion.span>
              <span className="font-semibold text-warm-700 dark:text-warm-200 group-hover:text-sage-600 transition-colors text-sm">
                菜谱
              </span>
            </NavLink>

            <nav className="flex items-center gap-0">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className="relative px-1.5 py-1"
                >
                  {({ isActive }) => (
                    <div className="flex flex-col items-center gap-0.5">
                      <link.icon
                        size={14}
                        className={cn(
                          'transition-colors',
                          isActive ? 'text-sage-600' : 'text-warm-400 dark:text-warm-500',
                        )}
                      />
                      <span
                        className={cn(
                          'text-[10px] font-medium transition-colors leading-none',
                          isActive ? 'text-sage-600' : 'text-warm-500 dark:text-warm-400',
                        )}
                      >
                        {link.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 bg-sage-100/60 dark:bg-sage-900/40 rounded-lg -z-10"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </div>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
