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
    if (m < 0) {
      m = 11
      y--
    } else if (m > 11) {
      m = 0
      y++
    }
    setViewMonth(m)
    setViewYear(y)
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  }

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月',
  ]

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => goMonth(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-warm-500 hover:bg-warm-100 transition-colors"
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
            className="text-base font-semibold text-warm-800"
          >
            {viewYear}年 {monthNames[viewMonth]}
          </motion.span>
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => goMonth(1)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-warm-500 hover:bg-warm-100 transition-colors"
        >
          <ChevronRight size={18} />
        </motion.button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map((w) => (
          <div key={w} className="text-center text-xs font-medium text-warm-400 py-1.5">
            {w}
          </div>
        ))}
      </div>

      {/* Days grid */}
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
            if (day === null) {
              return <div key={`empty-${i}`} className="aspect-square" />
            }

            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isSelected = dateStr === selectedDate
            const isTodayDate = dateStr === today
            const hasMeal = markedDates?.has(dateStr)
            const isFuture = dateStr > today

            return (
              <motion.button
                key={dateStr}
                whileHover={{ scale: isFuture ? 1 : 1.08 }}
                whileTap={{ scale: isFuture ? 1 : 0.92 }}
                onClick={() => !isFuture && onSelect(dateStr)}
                disabled={isFuture}
                className={cn(
                  'relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-colors',
                  isSelected && 'bg-sage-500 text-white shadow-sm',
                  !isSelected && isTodayDate && 'text-sage-600 font-semibold',
                  !isSelected && !isTodayDate && !isFuture && 'text-warm-700 hover:bg-warm-100',
                  isFuture && 'text-warm-300 cursor-default',
                )}
              >
                {day}
                {hasMeal && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sage-400" />
                )}
                {isTodayDate && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sage-400" />
                )}
              </motion.button>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
