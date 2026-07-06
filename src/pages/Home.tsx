import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar } from '../components/Calendar'
import { MealCard } from '../components/MealCard'
import { GenerateButton } from '../components/GenerateButton'
import { AiOrb } from '../components/AiOrb'
import { EmptyState } from '../components/EmptyState'
import { TiltCard } from '../components/TiltCard'
import { formatDate, formatDisplayDate, isToday } from '../lib/utils'
import { generateDailyMealsStream, generateBreakfast, generateLunch, generateDinner } from '../lib/api'
import { getMealPlanByDate, saveMealPlan, getAllPlanDates, shouldRemindBackup, setLastBackupTime, exportAllData } from '../lib/storage'
import type { DailyMealPlan, Meal } from '../types'
import { ChefHat, AlertCircle, Sparkles, Download, X, ShoppingCart, Check, Square } from 'lucide-react'

function extractDayItems(plan: DailyMealPlan) {
  const meals = [plan.breakfast]
  if (plan.lunch) meals.push(plan.lunch)
  meals.push(plan.dinner)
  const items: { name: string; amount: string; source: string }[] = []
  for (const meal of meals) {
    for (const ing of meal.ingredients) {
      const existing = items.find((i) => i.name === ing.name)
      if (existing) existing.amount += ` + ${ing.amount}`
      else items.push({ name: ing.name, amount: ing.amount, source: meal.name })
    }
  }
  return items
}

export function Home() {
  const today = formatDate(new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [plan, setPlan] = useState<DailyMealPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMeal, setLoadingMeal] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null)
  const [error, setError] = useState('')
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set())
  const [progressText, setProgressText] = useState('')
  const [partialMeals, setPartialMeals] = useState<{ breakfast?: Meal; lunch?: Meal; dinner?: Meal }>({})
  const [showBackupReminder, setShowBackupReminder] = useState(false)
  const [showShopping, setShowShopping] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    setMarkedDates(getAllPlanDates())
    if (shouldRemindBackup()) setShowBackupReminder(true)
  }, [])

  useEffect(() => {
    const existing = getMealPlanByDate(selectedDate)
    setPlan(existing || null)
    setPartialMeals({})
    setError('')
    setShowShopping(false)
    setCheckedItems(new Set())
  }, [selectedDate])

  const handleGenerate = useCallback(async () => {
    setError('')
    setLoading(true)
    setPartialMeals({})
    try {
      const meals = await generateDailyMealsStream(
        selectedDate,
        (meal, type) => setPartialMeals((prev) => ({ ...prev, [type]: meal })),
        // Show meal-type progress (API no longer passes raw JSON)
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
      setError(err instanceof Error ? err.message : '生成失败，请稍后重试')
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
      const updatedPlan = { ...plan, [mealType]: newMeal, createdAt: new Date().toISOString() }
      saveMealPlan(updatedPlan)
      setPlan(updatedPlan)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败')
    } finally {
      setLoadingMeal(null)
    }
  }, [plan, selectedDate])

  const displayMeals = loading ? partialMeals : (plan ? { breakfast: plan.breakfast, lunch: plan.lunch, dinner: plan.dinner } : {})
  const hasMeals = !!(displayMeals.breakfast || displayMeals.lunch || displayMeals.dinner)

  const shoppingItems = useMemo(() => plan ? extractDayItems(plan) : [], [plan])

  const toggleItem = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index); else next.add(index)
      return next
    })
  }

  const handleBackup = () => {
    const data = exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `meal-backup-${today}.json`; a.click()
    URL.revokeObjectURL(url)
    setLastBackupTime()
    setShowBackupReminder(false)
  }


  return (
    <div>
      {/* Backup reminder */}
      <AnimatePresence>
        {showBackupReminder && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mt-3 mb-2 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20 text-sm">
            <Download size={15} className="text-gold-500 shrink-0" />
            <span className="text-gold-600 flex-1">建议备份菜谱数据</span>
            <button onClick={handleBackup} className="text-gold-500 font-medium hover:underline">备份</button>
            <button onClick={() => setShowBackupReminder(false)} className="text-ink-4 hover:text-ink-2"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="pt-6 pb-5 text-center">
        <motion.div className="inline-flex items-center gap-2 mb-3" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <motion.span className="text-3xl" animate={{ rotate: [0, 10, -10, 5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>🥗</motion.span>
        </motion.div>
        <h1 className="text-2xl font-bold text-ink-1 tracking-tight">
          <span className="text-gradient-gold">{formatDisplayDate(selectedDate)}</span>
          {isToday(selectedDate) && (
            <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="ml-2.5 text-xs font-bold text-gold-500 bg-gold-500/15 border border-gold-500/30 px-2.5 py-0.5 rounded-full inline-block align-middle">
              <motion.span animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }}>TODAY</motion.span>
            </motion.span>
          )}
        </h1>
        <p className="text-sm text-ink-3 mt-2">AI 智能菜谱 · 每日推荐</p>
      </motion.div>

      {/* Calendar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mb-6">
        <TiltCard glowColor="rgba(217, 119, 6, 0.12)">
          <div className="card p-5">
            <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} markedDates={markedDates} />
          </div>
        </TiltCard>
      </motion.div>

      {/* Generate button */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col items-center mb-6">
        <GenerateButton onClick={handleGenerate} loading={loading} disabled={false} />
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500">
              <AlertCircle size={16} />
              {error}
              <button onClick={handleGenerate} className="ml-auto underline underline-offset-2 hover:text-red-600">重试</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AI Orb or Meals */}
      <AnimatePresence mode="wait">
        {loading && !hasMeals ? (
          <AiOrb active={true} progress={progressText || undefined} />
        ) : loading ? (
          <motion.div key="partial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <AiOrb active={true} progress={progressText || undefined} />
            {displayMeals.breakfast && <MealCard meal={displayMeals.breakfast} index={0} />}
            {displayMeals.lunch && <MealCard meal={displayMeals.lunch} index={1} />}
            {displayMeals.dinner && <MealCard meal={displayMeals.dinner} index={displayMeals.lunch ? 2 : 1} />}
          </motion.div>
        ) : hasMeals ? (
          <motion.div key={plan?.id || 'meals'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-surface-3/60">
                  <Sparkles size={14} className="text-gold-500" />
                  <span className="text-sm text-ink-3">
                    一天预算约 <span className="font-mono font-semibold text-gold-500">
                      {(plan.breakfast.estimatedCost + (plan.lunch?.estimatedCost || 0) + plan.dinner.estimatedCost).toFixed(1)}
                    </span> 元
                  </span>
                </div>
              </motion.div>
            )}

            {/* Shopping list toggle */}
            {shoppingItems.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
                <button
                  onClick={() => { setShowShopping(!showShopping); setCheckedItems(new Set()) }}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/60 border border-surface-3/60 hover:bg-white/80 transition-all"
                >
                  <ShoppingCart size={16} className="text-gold-500" />
                  <span className="text-sm font-medium text-ink-2">采购清单</span>
                  <span className="text-xs text-ink-4 font-mono ml-auto">{shoppingItems.length} 种食材</span>
                  <motion.span animate={{ rotate: showShopping ? 180 : 0 }} className="text-ink-4">
                    <ChevronDownIcon />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {showShopping && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-1">
                        <div className="text-xs text-ink-4 mb-2 font-mono px-1">
                          已勾选 {checkedItems.size} / {shoppingItems.length}
                        </div>
                        {shoppingItems.map((item, i) => {
                          const checked = checkedItems.has(i)
                          return (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              onClick={() => toggleItem(i)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/60 border border-surface-3/40 text-left hover:bg-white/80 transition-all ${checked ? 'opacity-50' : ''}`}
                            >
                              {checked ? <Check size={16} className="text-gold-500 shrink-0" /> : <Square size={16} className="text-surface-5 shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm ${checked ? 'line-through text-ink-4' : 'text-ink-1'}`}>{item.name}</span>
                                <span className="text-xs text-ink-4 ml-2">{item.amount}</span>
                              </div>
                              <span className="text-[10px] text-ink-4 truncate max-w-[80px]">{item.source}</span>
                            </motion.button>
                          )
                        })}
                        {shoppingItems.length - checkedItems.size > 0 && (
                          <div className="text-center text-sm text-ink-4 pt-2 pb-1">
                            还有 {shoppingItems.length - checkedItems.size} 种食材待采购
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyState icon={<ChefHat size={48} />} title="还没有菜谱"
              description="点击上方按钮，AI 为你生成菜谱" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
