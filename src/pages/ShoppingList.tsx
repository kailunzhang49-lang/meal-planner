import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Check, Square, CalendarDays } from 'lucide-react'
import { cn, formatDate, getWeekDates } from '../lib/utils'
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
        if (existing) existing.amount += ` + ${ing.amount}`
        else items.push({ name: ing.name, amount: ing.amount, source: meal.name, checked: false })
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
      plans = [...getPlansInRange(weekDates[0], weekDates[6]).values()]
    }
    setItems(extractItems(plans))
    setCheckedSet(new Set())
  }, [mode, today])

  const toggleItem = (index: number) => {
    setCheckedSet((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index); else next.add(index)
      return next
    })
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 pb-4">
        <h1 className="text-2xl font-bold text-ink-1 tracking-tight">采购清单</h1>
        <p className="text-sm text-ink-4 mt-1">汇总食材，买菜更方便</p>
      </motion.div>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setMode('day')}
          className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all',
            mode === 'day' ? 'btn-primary' : 'btn-ghost')}>
          <CalendarDays size={14} className="inline mr-1.5 -mt-0.5" />今日
        </button>
        <button onClick={() => setMode('week')}
          className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all',
            mode === 'week' ? 'btn-primary' : 'btn-ghost')}>
          本周
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<ShoppingCart size={48} />} title="暂无食材" description={`${mode === 'day' ? '今天' : '本周'}还没有菜谱`} />
      ) : (
        <>
          <div className="text-xs text-ink-4 mb-3 font-mono">
            {items.length} 种食材，已勾选 {checkedSet.size} 种
          </div>
          <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.03 } } }} className="space-y-1.5">
            {items.map((item, i) => {
              const checked = checkedSet.has(i)
              return (
                <motion.button key={i} onClick={() => toggleItem(i)}
                  variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                  className={cn('w-full flex items-center gap-3 px-4 py-2.5 rounded-xl card text-left', checked && 'opacity-50')}>
                  {checked ? <Check size={16} className="text-gold-400 shrink-0" /> : <Square size={16} className="text-surface-5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <span className={cn('text-sm', checked ? 'line-through text-ink-4' : 'text-ink-1')}>{item.name}</span>
                    <span className="text-xs text-ink-4 ml-2">{item.amount}</span>
                  </div>
                  <span className="text-[10px] text-ink-4 truncate max-w-[80px]">{item.source}</span>
                </motion.button>
              )
            })}
          </motion.div>
          {items.length - checkedSet.size > 0 && (
            <div className="mt-4 text-center text-sm text-ink-4">
              还有 {items.length - checkedSet.size} 种食材待采购
            </div>
          )}
        </>
      )}
    </div>
  )
}
