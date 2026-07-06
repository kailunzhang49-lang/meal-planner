import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar } from '../components/Calendar'
import { MealCard } from '../components/MealCard'
import { GenerateButton } from '../components/GenerateButton'
import { EmptyState } from '../components/EmptyState'
import { TiltCard } from '../components/TiltCard'
import { formatDate, formatDisplayDate, isToday } from '../lib/utils'
import { generateDailyMeals, generateBreakfast, generateLunch, generateDinner } from '../lib/api'
import { getMealPlanByDate, saveMealPlan, getAllPlanDates } from '../lib/storage'
import type { DailyMealPlan } from '../types'
import { ChefHat, AlertCircle, Sparkles } from 'lucide-react'

export function Home() {
  const today = formatDate(new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [plan, setPlan] = useState<DailyMealPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMeal, setLoadingMeal] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null)
  const [error, setError] = useState('')
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    setMarkedDates(getAllPlanDates())
  }, [])

  useEffect(() => {
    const existing = getMealPlanByDate(selectedDate)
    setPlan(existing || null)
    setError('')
  }, [selectedDate])

  const handleGenerate = useCallback(async () => {
    setError('')
    setLoading(true)

    try {
      const meals = await generateDailyMeals(selectedDate)

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
      setMarkedDates(getAllPlanDates())
    } catch (err) {
      const msg = err instanceof Error ? err.message : '生成失败，请稍后重试'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  const handleRegenerateMeal = useCallback(async (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    if (!plan) return
    setError('')
    setLoadingMeal(mealType)

    try {
      const generators = { breakfast: generateBreakfast, lunch: generateLunch, dinner: generateDinner }
      const newMeal = await generators[mealType](selectedDate)

      const updatedPlan: DailyMealPlan = {
        ...plan,
        [mealType]: newMeal,
        createdAt: new Date().toISOString(),
      }

      saveMealPlan(updatedPlan)
      setPlan(updatedPlan)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '生成失败，请稍后重试'
      setError(msg)
    } finally {
      setLoadingMeal(null)
    }
  }, [plan, selectedDate])

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
  }

  const canGenerate = isToday(selectedDate) || selectedDate < today

  return (
    <div className="max-w-lg mx-auto px-5 pb-16">
      {/* Hero title with gradient text */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="pt-8 pb-5 text-center"
      >
        <motion.div
          className="inline-flex items-center gap-2 mb-2"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        >
          <motion.span
            className="text-3xl"
            animate={{ rotate: [0, 10, -10, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🥗
          </motion.span>
        </motion.div>
        <h1 className="text-2xl font-bold text-warm-800 tracking-tight">
          <span className="gradient-text">{formatDisplayDate(selectedDate)}</span>
          {isToday(selectedDate) && (
            <motion.span
              initial={{ opacity: 0, scale: 0, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="ml-2.5 text-sm font-semibold text-sage-600 bg-sage-100 px-2.5 py-0.5 rounded-full inline-block align-middle"
            >
              <motion.span
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                今天
              </motion.span>
            </motion.span>
          )}
        </h1>
        <p className="text-sm text-warm-400 mt-2">
          选择日期，生成清爽健康的家常菜谱
        </p>
      </motion.div>

      {/* Calendar card with tilt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-6"
      >
        <TiltCard glowColor="rgba(101, 147, 104, 0.2)">
          <div className="glass card-ring rounded-2xl p-5">
            <Calendar
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
              markedDates={markedDates}
            />
          </div>
        </TiltCard>
      </motion.div>

      {/* Generate button area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center mb-8"
      >
        {canGenerate ? (
          <GenerateButton
            onClick={handleGenerate}
            loading={loading}
            disabled={!canGenerate}
          />
        ) : (
          <p className="text-sm text-warm-400">未来日期不可生成，请选择今天或之前的日期</p>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600"
            >
              <AlertCircle size={16} />
              {error}
              <button
                onClick={handleGenerate}
                className="ml-auto text-red-500 underline underline-offset-2 hover:text-red-600"
              >
                重试
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Meal plan display */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass card-ring rounded-2xl p-6"
              >
                <div className="relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warm-100 to-warm-200 animate-pulse-soft" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gradient-to-r from-warm-100 via-warm-200 to-warm-100 rounded-lg w-2/3 bg-[length:200%_100%] animate-shimmer" />
                      <div className="h-3 bg-gradient-to-r from-warm-100 via-warm-200 to-warm-100 rounded-lg w-1/4 bg-[length:200%_100%] animate-shimmer" />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div
                        key={j}
                        className="h-7 w-16 rounded-lg bg-gradient-to-r from-warm-100 via-warm-200 to-warm-100 bg-[length:200%_100%] animate-shimmer"
                        style={{ animationDelay: `${j * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : plan ? (
          <motion.div
            key={plan.id || plan.createdAt + selectedDate}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <MealCard
              meal={plan.breakfast}
              index={0}
              onRegenerate={() => handleRegenerateMeal('breakfast')}
              regenerating={loadingMeal === 'breakfast'}
            />
            {plan.lunch && (
              <MealCard
                meal={plan.lunch}
                index={1}
                onRegenerate={() => handleRegenerateMeal('lunch')}
                regenerating={loadingMeal === 'lunch'}
              />
            )}
            <MealCard
              meal={plan.dinner}
              index={plan.lunch ? 2 : 1}
              onRegenerate={() => handleRegenerateMeal('dinner')}
              regenerating={loadingMeal === 'dinner'}
            />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-center pt-2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass card-ring">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-sm text-warm-500">
                  一天预算约{' '}
                  <span className="font-semibold text-warm-700 tabular-nums">
                    {(plan.breakfast.estimatedCost + (plan.lunch?.estimatedCost || 0) + plan.dinner.estimatedCost).toFixed(1)}
                  </span>{' '}
                  元
                </span>
                <span className="text-xs text-warm-400">· 健康清爽家常菜</span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={<ChefHat size={48} />}
              title="还没有菜谱"
              description={canGenerate ? '点击上方按钮，为今天生成清爽健康的家常菜谱' : '选择今天或之前的日期来生成菜谱'}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
