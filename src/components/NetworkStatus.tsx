import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff } from 'lucide-react'

export function NetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 overflow-hidden"
        >
          <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <WifiOff size={14} />
            当前无网络连接，仅可浏览已缓存的菜谱
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
