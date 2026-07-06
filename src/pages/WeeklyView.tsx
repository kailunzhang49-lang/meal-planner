import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Coffee, Sun, Soup, BarChart3 } from 'lucide-react'
import { cn, formatDate, getWeekDates, getWeekLabel, formatShortDate } from '../lib/utils'
import { getPlansInRange, getMealPlans } from '../lib/storage'
import type { DailyMealPlan } from '../types'
import { EmptyState } from '../components/EmptyState'

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export function WeeklyView() {
  const today = formatDate(new Date())
  const [weekOffset, setWeekOffset] = useState(0)

  const centerDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + weekOffset * 7)
    return formatDate(d)
  }, [weekOffset])

  const weekDates = getWeekDates(centerDate)
  const planMap = getPlansInRange(weekDates[0], weekDates[6])

  const stats = useMemo(() => {
    const allPlans = getMealPlans()
    const ingredientCount = new Map<string, number>()
    const dishNames = new Map<string, number>()
    const proteinCount = new Map<string, number>()
    const proteinKeywords = ['猪', '鸡', '牛', '鸡蛋', '豆腐', '虾']

    for (const plan of allPlans) {
      const meals = [plan.breakfast]
      if (plan.lunch) meals.push(plan.lunch)
      meals.push(plan.dinner)
      for (const meal of meals) {
        dishNames.set(meal.name, (dishNames.get(meal.name) || 0) + 1)
        for (const ing of meal.ingredients) {
          ingredientCount.set(ing.name, (ingredientCount.get(ing.name) || 0) + 1)
          for (const pk of proteinKeywords) {
            if (ing.name.includes(pk)) proteinCount.set(pk, (proteinCount.get(pk) || 0) + 1)
          }
        }
      }
    }

    return {
      topIngredients: [...ingredientCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
      topDishes: [...dishNames.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
      proteinBreakdown: [...proteinCount.entries()].sort((a, b) => b[1] - a[1]),
      totalMeals: allPlans.length,
    }
  }, [])

  const maxIngCount = stats.topIngredients.length > 0 ? stats.topIngredients[0][1] : 1

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 pb-4">
        <h1 className="text-2xl font-bold text-ink-1 tracking-tight">周览</h1>
        <p className="text-sm text-ink-4 mt-1">一周菜谱总览与饮食统计</p>
      </motion.div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setWeekOffset((p) => p - 1)} className="p-2 rounded-lg hover:bg-surface-4/40 transition-colors">
          <ChevronLeft size={18} className="text-ink-3" />
        </button>
        <span className="text-sm font-medium text-ink-2">{weekOffset === 0 ? '本周' : getWeekLabel(centerDate)}</span>
        <button onClick={() => setWeekOffset((p) => p + 1)} className="p-2 rounded-lg hover:bg-surface-4/40 transition-colors">
          <ChevronRight size={18} className="text-ink-3" />
        </button>
      </div>

      {planMap.size > 0 ? (
        <div className="space-y-2 mb-8">
          {weekDates.map((dateStr, i) => {
            const plan = planMap.get(dateStr)
            const isTodayDate = dateStr === today
            return (
              <motion.div key={dateStr} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={cn('card p-3', isTodayDate && 'border-gold-500/30')}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-md',
                    isTodayDate ? 'bg-gold-500/15 text-gold-400' : 'bg-surface-4/60 text-ink-3')}>
                    {weekDays[i]}
                  </span>
                  <span className="text-xs text-ink-4 font-mono">{formatShortDate(dateStr)}</span>
                </div>
                {plan ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-ink-2">
                      <Coffee size={11} className="text-gold-400" /><span className="truncate">{plan.breakfast.name}</span>
                    </div>
                    {plan.lunch && (
                      <div className="flex items-center gap-1.5 text-xs text-ink-2">
                        <Sun size={11} className="text-neon-400" /><span className="truncate">{plan.lunch.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-ink-2">
                      <Soup size={11} className="text-gold-500" /><span className="truncate">{plan.dinner.name}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-surface-5">暂无菜谱</span>
                )}
              </motion.div>
            )
          })}
        </div>
      ) : (
        <EmptyState icon={<BarChart3 size={48} />} title="本周暂无菜谱" description="先生成一些菜谱，这里会显示一周总览" />
      )}

      {stats.totalMeals > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
          <h2 className="text-lg font-bold text-ink-1 flex items-center gap-2">
            <BarChart3 size={18} className="text-gold-400" />饮食统计
          </h2>

          {stats.topIngredients.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-ink-2 mb-3">常用食材 TOP 10</h3>
              <div className="space-y-2">
                {stats.topIngredients.map(([name, count]) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-xs text-ink-2 w-16 truncate">{name}</span>
                    <div className="flex-1 h-4 bg-surface-4/40 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(count / maxIngCount) * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full" />
                    </div>
                    <span className="text-xs text-ink-4 w-6 text-right font-mono">{count}次</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.proteinBreakdown.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-ink-2 mb-3">蛋白质来源</h3>
              <div className="flex flex-wrap gap-2">
                {stats.proteinBreakdown.map(([name, count]) => (
                  <div key={name} className="px-3 py-1.5 rounded-lg bg-neon-500/10 border border-neon-500/20">
                    <span className="text-xs font-medium text-neon-400">{name}</span>
                    <span className="text-xs text-ink-4 ml-1 font-mono">{count}次</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.topDishes.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-ink-2 mb-3">最常吃的菜</h3>
              <div className="space-y-1.5">
                {stats.topDishes.map(([name, count], i) => (
                  <div key={name} className="flex items-center gap-2 text-sm">
                    <span className="text-ink-4 text-xs font-mono w-4">{i + 1}.</span>
                    <span className="text-ink-1">{name}</span>
                    <span className="text-xs text-ink-4 ml-auto font-mono">{count}次</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
