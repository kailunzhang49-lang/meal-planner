import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatDate, isToday } from '../lib/utils'

interface CalendarProps {
  selectedDate: string
  onSelect: (date: string) => void
  markedDates?: Set<string>
}

export function Calendar({ selectedDate, onSelect, markedDates }: CalendarProps) {
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [direction, setDirection] = useState(0)

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const cells: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [viewYear, viewMonth])

  const today = formatDate(new Date())

  const goMonth = (delta: number) => {
    setDirection(delta)
    let m = viewMonth + delta
    let y = viewYear
    if (m < 0) { m = 11; y-- }
    else if (m > 11) { m = 0; y++ }
    setViewMonth(m)
    setViewYear(y)
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  }

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4 px-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => goMonth(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-ink-3 hover:bg-surface-3/80 transition-colors"
        >
          <ChevronLeft size={18} />
        </motion.button>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.span
            key={`${viewYear}-${viewMonth}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="text-base font-bold text-ink-1 tracking-wide"
          >
            {viewYear}年 {monthNames[viewMonth]}
          </motion.span>
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => goMonth(1)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-ink-3 hover:bg-surface-3/80 transition-colors"
        >
          <ChevronRight size={18} />
        </motion.button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map((w) => (
          <div key={w} className="text-center text-[10px] font-medium text-ink-4 uppercase tracking-wider py-1.5">
            {w}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${viewYear}-${viewMonth}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1"
        >
          {days.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="aspect-square" />

            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isSelected = dateStr === selectedDate
            const isTodayDate = dateStr === today
            const hasMeal = markedDates?.has(dateStr)

            return (
              <motion.button
                key={dateStr}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onSelect(dateStr)}
                className={cn(
                  'relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all',
                  isSelected && 'bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-lg shadow-gold-400/30',
                  !isSelected && isTodayDate && 'text-gold-500 font-bold',
                  !isSelected && !isTodayDate && 'text-ink-2 hover:bg-surface-3/60',
                )}
              >
                <span className="font-mono text-xs">{day}</span>
                {hasMeal && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-500" />
                )}
                {isTodayDate && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-500" />
                )}
              </motion.button>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
