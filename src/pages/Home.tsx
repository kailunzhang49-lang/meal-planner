import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar } from '../components/Calendar'
import { MealCard } from '../components/MealCard'
import { GenerateButton } from '../components/GenerateButton'
import { EmptyState } from '../components/EmptyState'
import { TiltCard } from '../components/TiltCard'
import { formatDate, formatDisplayDate, isToday } from '../lib/utils'
import { generateDailyMealsStream, generateBreakfast, generateLunch, generateDinner } from '../lib/api'
import { getMealPlanByDate, saveMealPlan, getAllPlanDates, shouldRemindBackup, setLastBackupTime } from '../lib/storage'
import type { DailyMealPlan, Meal } from '../types'
import { ChefHat, AlertCircle, Sparkles, Download, X } from 'lucide-react'
import { exportAllData } from '../lib/storage'

export function Home() {
  const today = formatDate(new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [plan, setPlan] = useState<DailyMealPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMeal, setLoadingMeal] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null)
  const [error, setError] = useState('')
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set())
  const [progressText, setProgressText] = useState('')
  // Feature 7: progressive meal display
  const [partialMeals, setPartialMeals] = useState<{ breakfast?: Meal; lunch?: Meal; dinner?: Meal }>({})
  // Feature 9: backup reminder
  const [showBackupReminder, setShowBackupReminder] = useState(false)

  useEffect(() => {
    setMarkedDates(getAllPlanDates())
    if (shouldRemindBackup()) setShowBackupReminder(true)
  }, [])

  useEffect(() => {
    const existing = getMealPlanByDate(selectedDate)
    setPlan(existing || null)
    setPartialMeals({})
    setError('')
  }, [selectedDate])

  const handleGenerate = useCallback(async () => {
    setError('')
    setLoading(true)
    setPartialMeals({})

    try {
      const meals = await generateDailyMealsStream(
        selectedDate,
        (meal, type) => {
          setPartialMeals((prev) => ({ ...prev, [type]: meal }))
        },
        (text) => setProgressText(text),
      )

      const newPlan: DailyMealPlan = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        date: selectedDate,
        breakfast: meals.breakfast,
        lunch: meals.lunch,
        dinner: meals.dinner,
        createdAt: new Date().toISOString(),
      }

      saveMealPlan(newPlan)
      setPlan(newPlan)
      setPartialMeals({})
      setMarkedDates(getAllPlanDates())
    } catch (err) {
      const msg = err instanceof Error ? err.message : '生成失败，请稍后重试'
      setError(msg)
    } finally {
      setLoading(false)
      setProgressText('')
    }
  }, [selectedDate])

  const handleRegenerateMeal = useCallback(async (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    if (!plan) return
    setError('')
    setLoadingMeal(mealType)
    try {
      const generators = { breakfast: generateBreakfast, lunch: generateLunch, dinner: generateDinner }
      const newMeal = await generators[mealType](selectedDate)
      const updatedPlan: DailyMealPlan = { ...plan, [mealType]: newMeal, createdAt: new Date().toISOString() }
      saveMealPlan(updatedPlan)
      setPlan(updatedPlan)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '生成失败，请稍后重试'
      setError(msg)
    } finally {
      setLoadingMeal(null)
    }
  }, [plan, selectedDate])

  const canGenerate = isToday(selectedDate) || selectedDate < today
  const displayMeals = loading ? partialMeals : (plan ? { breakfast: plan.breakfast, lunch: plan.lunch, dinner: plan.dinner } : {})
  const hasMeals = !!(displayMeals.breakfast || displayMeals.lunch || displayMeals.dinner)

  const handleBackup = () => {
    const data = exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `meal-planner-backup-${today}.json`; a.click()
    URL.revokeObjectURL(url)
    setLastBackupTime()
    setShowBackupReminder(false)
  }

  return (
    <div className="max-w-lg mx-auto px-5 pb-16">
      {/* Backup reminder */}
      <AnimatePresence>
        {showBackupReminder && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mt-3 mb-2 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sage-50 dark:bg-sage-900/20 border border-sage-200 dark:border-sage-800 text-sm">
            <Download size={15} className="text-sage-500 shrink-0" />
            <span className="text-sage-700 dark:text-sage-300 flex-1">建议备份菜谱数据，防止数据丢失</span>
            <button onClick={handleBackup} className="text-sage-600 dark:text-sage-400 font-medium hover:underline">备份</button>
            <button onClick={() => setShowBackupReminder(false)} className="text-warm-400 hover:text-warm-500"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }} className="pt-8 pb-5 text-center">
        <motion.div className="inline-flex items-center gap-2 mb-2" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}>
          <motion.span className="text-3xl" animate={{ rotate: [0, 10, -10, 5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>🥗</motion.span>
        </motion.div>
        <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100 tracking-tight">
          <span className="gradient-text">{formatDisplayDate(selectedDate)}</span>
          {isToday(selectedDate) && (
            <motion.span initial={{ opacity: 0, scale: 0, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="ml-2.5 text-sm font-semibold text-sage-600 dark:text-sage-400 bg-sage-100 dark:bg-sage-900/40 px-2.5 py-0.5 rounded-full inline-block align-middle">
              <motion.span animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }}>今天</motion.span>
            </motion.span>
          )}
        </h1>
        <p className="text-sm text-warm-400 dark:text-warm-500 mt-2">选择日期，生成清爽健康的家常菜谱</p>
      </motion.div>

      {/* Calendar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mb-6">
        <TiltCard glowColor="rgba(101, 147, 104, 0.2)">
          <div className="glass card-ring rounded-2xl p-5 dark:bg-warm-800/50 dark:border-warm-700/40">
            <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} markedDates={markedDates} />
          </div>
        </TiltCard>
      </motion.div>

      {/* Generate button */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col items-center mb-8">
        {canGenerate ? <GenerateButton onClick={handleGenerate} loading={loading} disabled={!canGenerate} /> :
          <p className="text-sm text-warm-400 dark:text-warm-500">未来日期不可生成，请选择今天或之前的日期</p>}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -8, height: 0 }}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={16} />
              {error}
              <button onClick={handleGenerate} className="ml-auto text-red-500 underline underline-offset-2 hover:text-red-600">重试</button>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Streaming progress */}
        {loading && progressText && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-sage-600 dark:text-sage-400">{progressText}</motion.div>
        )}
      </motion.div>

      {/* Meal display */}
      <AnimatePresence mode="wait">
        {loading && !hasMeals ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass card-ring rounded-2xl p-6 dark:bg-warm-800/50 dark:border-warm-700/40">
                <div className="relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warm-100 to-warm-200 dark:from-warm-700 dark:to-warm-600 animate-pulse-soft" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gradient-to-r from-warm-100 via-warm-200 to-warm-100 dark:from-warm-700 dark:via-warm-600 dark:to-warm-700 rounded-lg w-2/3 bg-[length:200%_100%] animate-shimmer" />
                      <div className="h-3 bg-gradient-to-r from-warm-100 via-warm-200 to-warm-100 dark:from-warm-700 dark:via-warm-600 dark:to-warm-700 rounded-lg w-1/4 bg-[length:200%_100%] animate-shimmer" />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="h-7 w-16 rounded-lg bg-gradient-to-r from-warm-100 via-warm-200 to-warm-100 dark:from-warm-700 dark:via-warm-600 dark:to-warm-700 bg-[length:200%_100%] animate-shimmer" style={{ animationDelay: `${j * 0.1}s` }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : hasMeals ? (
          <motion.div key={plan?.id || 'partial'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">
            {displayMeals.breakfast && (
              <MealCard meal={displayMeals.breakfast} index={0} onRegenerate={() => handleRegenerateMeal('breakfast')} regenerating={loadingMeal === 'breakfast'} />
            )}
            {displayMeals.lunch && (
              <MealCard meal={displayMeals.lunch} index={1} onRegenerate={() => handleRegenerateMeal('lunch')} regenerating={loadingMeal === 'lunch'} />
            )}
            {displayMeals.dinner && (
              <MealCard meal={displayMeals.dinner} index={displayMeals.lunch ? 2 : 1} onRegenerate={() => handleRegenerateMeal('dinner')} regenerating={loadingMeal === 'dinner'} />
            )}
            {!loading && plan && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="text-center pt-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass card-ring dark:bg-warm-800/50">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="text-sm text-warm-500 dark:text-warm-400">
                    一天预算约 <span className="font-semibold text-warm-700 dark:text-warm-200 tabular-nums">
                      {(plan.breakfast.estimatedCost + (plan.lunch?.estimatedCost || 0) + plan.dinner.estimatedCost).toFixed(1)}
                    </span> 元
                  </span>
                  <span className="text-xs text-warm-400 dark:text-warm-500">· 健康清爽家常菜</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyState icon={<ChefHat size={48} />} title="还没有菜谱"
              description={canGenerate ? '点击上方按钮，为今天生成清爽健康的家常菜谱' : '选择今天或之前的日期来生成菜谱'} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
