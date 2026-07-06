import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Coffee, Sun, Soup, BarChart3 } from 'lucide-react'
import { cn, formatDate, getWeekDates, getWeekLabel, parseDate, formatShortDate } from '../lib/utils'
import { getPlansInRange, getMealPlans } from '../lib/storage'
import type { DailyMealPlan } from '../types'
import { EmptyState } from '../components/EmptyState'

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const mealIcons = { breakfast: Coffee, lunch: Sun, dinner: Soup }

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

  // Feature 5: frequency stats
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
            if (ing.name.includes(pk)) {
              proteinCount.set(pk, (proteinCount.get(pk) || 0) + 1)
            }
          }
        }
      }
    }

    const topIngredients = [...ingredientCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
    const topDishes = [...dishNames.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    const proteinBreakdown = [...proteinCount.entries()].sort((a, b) => b[1] - a[1])

    return { topIngredients, topDishes, proteinBreakdown, totalMeals: allPlans.length }
  }, [])

  const hasAnyPlan = planMap.size > 0
  const maxIngCount = stats.topIngredients.length > 0 ? stats.topIngredients[0][1] : 1

  return (
    <div className="max-w-lg mx-auto px-5 pb-16">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 pb-4">
        <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100 tracking-tight">周览</h1>
        <p className="text-sm text-warm-400 dark:text-warm-500 mt-1">一周菜谱总览与饮食统计</p>
      </motion.div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setWeekOffset((p) => p - 1)} className="p-2 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-700/30 transition-colors">
          <ChevronLeft size={18} className="text-warm-500" />
        </button>
        <span className="text-sm font-medium text-warm-600 dark:text-warm-300">
          {weekOffset === 0 ? '本周' : getWeekLabel(centerDate)}
        </span>
        <button onClick={() => setWeekOffset((p) => p + 1)} className="p-2 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-700/30 transition-colors">
          <ChevronRight size={18} className="text-warm-500" />
        </button>
      </div>

      {/* Week grid */}
      {hasAnyPlan ? (
        <div className="space-y-2 mb-8">
          {weekDates.map((dateStr, i) => {
            const plan = planMap.get(dateStr)
            const isTodayDate = dateStr === today
            return (
              <motion.div key={dateStr} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={cn('glass card-ring rounded-xl p-3 dark:bg-warm-800/50 dark:border-warm-700/40',
                  isTodayDate && 'ring-sage-400/50 dark:ring-sage-500/50')}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full',
                    isTodayDate ? 'bg-sage-100 dark:bg-sage-900/40 text-sage-600 dark:text-sage-400' : 'bg-warm-100 dark:bg-warm-700/50 text-warm-500 dark:text-warm-400')}>
                    {weekDays[i]}
                  </span>
                  <span className="text-xs text-warm-400 dark:text-warm-500">{formatShortDate(dateStr)}</span>
                </div>
                {plan ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-warm-600 dark:text-warm-300">
                      <Coffee size={11} className="text-amber-500" />
                      <span className="truncate">{plan.breakfast.name}</span>
                    </div>
                    {plan.lunch && (
                      <div className="flex items-center gap-1.5 text-xs text-warm-600 dark:text-warm-300">
                        <Sun size={11} className="text-orange-500" />
                        <span className="truncate">{plan.lunch.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-warm-600 dark:text-warm-300">
                      <Soup size={11} className="text-sage-500" />
                      <span className="truncate">{plan.dinner.name}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-warm-300 dark:text-warm-600">暂无菜谱</span>
                )}
              </motion.div>
            )
          })}
        </div>
      ) : (
        <EmptyState icon={<BarChart3 size={48} />} title="本周暂无菜谱" description="先生成一些菜谱，这里会显示一周总览" />
      )}

      {/* Statistics */}
      {stats.totalMeals > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
          <h2 className="text-lg font-bold text-warm-800 dark:text-warm-100 flex items-center gap-2">
            <BarChart3 size={18} className="text-sage-500" />饮食统计
          </h2>

          {/* Ingredient frequency */}
          {stats.topIngredients.length > 0 && (
            <div className="glass card-ring rounded-2xl p-4 dark:bg-warm-800/50 dark:border-warm-700/40">
              <h3 className="text-sm font-semibold text-warm-700 dark:text-warm-200 mb-3">常用食材 TOP 10</h3>
              <div className="space-y-2">
                {stats.topIngredients.map(([name, count]) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-xs text-warm-600 dark:text-warm-300 w-16 truncate">{name}</span>
                    <div className="flex-1 h-4 bg-warm-100 dark:bg-warm-700/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / maxIngCount) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-sage-400 dark:bg-sage-500 rounded-full" />
                    </div>
                    <span className="text-xs text-warm-400 dark:text-warm-500 w-6 text-right">{count}次</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Protein breakdown */}
          {stats.proteinBreakdown.length > 0 && (
            <div className="glass card-ring rounded-2xl p-4 dark:bg-warm-800/50 dark:border-warm-700/40">
              <h3 className="text-sm font-semibold text-warm-700 dark:text-warm-200 mb-3">蛋白质来源</h3>
              <div className="flex flex-wrap gap-2">
                {stats.proteinBreakdown.map(([name, count]) => (
                  <div key={name} className="px-3 py-1.5 rounded-lg bg-sage-50 dark:bg-sage-900/20 border border-sage-200 dark:border-sage-700/40">
                    <span className="text-xs font-medium text-sage-700 dark:text-sage-300">{name}</span>
                    <span className="text-xs text-sage-500 dark:text-sage-400 ml-1">{count}次</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top dishes */}
          {stats.topDishes.length > 0 && (
            <div className="glass card-ring rounded-2xl p-4 dark:bg-warm-800/50 dark:border-warm-700/40">
              <h3 className="text-sm font-semibold text-warm-700 dark:text-warm-200 mb-3">最常吃的菜</h3>
              <div className="space-y-1.5">
                {stats.topDishes.map(([name, count], i) => (
                  <div key={name} className="flex items-center gap-2 text-sm">
                    <span className="text-warm-400 dark:text-warm-500 text-xs w-4">{i + 1}.</span>
                    <span className="text-warm-700 dark:text-warm-200">{name}</span>
                    <span className="text-xs text-warm-400 dark:text-warm-500 ml-auto">{count}次</span>
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
