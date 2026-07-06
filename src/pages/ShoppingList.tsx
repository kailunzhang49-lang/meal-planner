import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Check, Square, CalendarDays } from 'lucide-react'
import { cn, formatDate, getWeekDates, formatShortDate, parseDate } from '../lib/utils'
import { getMealPlanByDate, getPlansInRange } from '../lib/storage'
import type { DailyMealPlan, ShoppingItem } from '../types'
import { EmptyState } from '../components/EmptyState'

function extractItems(plans: DailyMealPlan[]): ShoppingItem[] {
  const items: ShoppingItem[] = []
  for (const plan of plans) {
    const meals = [plan.breakfast]
    if (plan.lunch) meals.push(plan.lunch)
    meals.push(plan.dinner)
    for (const meal of meals) {
      for (const ing of meal.ingredients) {
        const existing = items.find((i) => i.name === ing.name)
        if (existing) {
          existing.amount += ` + ${ing.amount}`
        } else {
          items.push({ name: ing.name, amount: ing.amount, source: meal.name, checked: false })
        }
      }
    }
  }
  return items
}

export function ShoppingList() {
  const today = formatDate(new Date())
  const [mode, setMode] = useState<'day' | 'week'>('day')
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [checkedSet, setCheckedSet] = useState<Set<number>>(new Set())

  useEffect(() => {
    let plans: DailyMealPlan[] = []
    if (mode === 'day') {
      const plan = getMealPlanByDate(today)
      if (plan) plans = [plan]
    } else {
      const weekDates = getWeekDates(today)
      const planMap = getPlansInRange(weekDates[0], weekDates[6])
      plans = [...planMap.values()]
    }
    setItems(extractItems(plans))
    setCheckedSet(new Set())
  }, [mode, today])

  const toggleItem = (index: number) => {
    setCheckedSet((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const uncheckedCount = items.length - checkedSet.size

  return (
    <div className="max-w-lg mx-auto px-5 pb-16">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 pb-4">
        <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100 tracking-tight">采购清单</h1>
        <p className="text-sm text-warm-400 dark:text-warm-500 mt-1">汇总食材，买菜更方便</p>
      </motion.div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setMode('day')}
          className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            mode === 'day' ? 'bg-sage-500 text-white' : 'bg-warm-100 dark:bg-warm-700/50 text-warm-600 dark:text-warm-300')}>
          <CalendarDays size={14} className="inline mr-1.5 -mt-0.5" />今日
        </button>
        <button onClick={() => setMode('week')}
          className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            mode === 'week' ? 'bg-sage-500 text-white' : 'bg-warm-100 dark:bg-warm-700/50 text-warm-600 dark:text-warm-300')}>
          本周
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<ShoppingCart size={48} />} title="暂无食材" description={`${mode === 'day' ? '今天' : '本周'}还没有菜谱，先生成菜谱再生成采购清单`} />
      ) : (
        <>
          <div className="text-xs text-warm-400 dark:text-warm-500 mb-3">
            {items.length} 种食材，已勾选 {checkedSet.size} 种
          </div>
          <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.03 } } }}
            className="space-y-1.5">
            {items.map((item, i) => {
              const checked = checkedSet.has(i)
              return (
                <motion.button key={i} onClick={() => toggleItem(i)}
                  variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-left',
                    'glass card-ring dark:bg-warm-800/50 dark:border-warm-700/40',
                    checked && 'opacity-50',
                  )}>
                  {checked ? <Check size={16} className="text-sage-500 shrink-0" /> : <Square size={16} className="text-warm-300 dark:text-warm-500 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <span className={cn('text-sm', checked ? 'line-through text-warm-400' : 'text-warm-700 dark:text-warm-200')}>{item.name}</span>
                    <span className="text-xs text-warm-400 dark:text-warm-500 ml-2">{item.amount}</span>
                  </div>
                  <span className="text-[10px] text-warm-400 dark:text-warm-500 truncate max-w-[80px]">{item.source}</span>
                </motion.button>
              )
            })}
          </motion.div>
          {uncheckedCount > 0 && (
            <div className="mt-4 text-center text-sm text-warm-400 dark:text-warm-500">
              还有 {uncheckedCount} 种食材待采购
            </div>
          )}
        </>
      )}
    </div>
  )
}
