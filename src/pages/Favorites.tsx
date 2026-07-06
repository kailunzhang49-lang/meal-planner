import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Coffee, Soup, Sun, X, ChefHat, Check, Clock } from 'lucide-react'
import { cn } from '../lib/utils'
import { getFavorites, removeFavorite, isMealCooked, toggleMealCooked } from '../lib/storage'
import type { FavoriteMeal, Meal } from '../types'
import { EmptyState } from '../components/EmptyState'

const mealIcons = { breakfast: Coffee, lunch: Sun, dinner: Soup }
const mealLabels = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }
const mealColors = {
  breakfast: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-400' },
  lunch: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-600 dark:text-orange-400' },
  dinner: { bg: 'bg-sage-100 dark:bg-sage-900/40', text: 'text-sage-600 dark:text-sage-400' },
}

export function Favorites() {
  const [favs, setFavs] = useState<FavoriteMeal[]>([])
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [cookedSet, setCookedSet] = useState<Set<string>>(new Set())

  useEffect(() => {
    setFavs(getFavorites())
    const ids = new Set<string>()
    getFavorites().forEach((f) => { if (isMealCooked(f.meal.id)) ids.add(f.meal.id) })
    setCookedSet(ids)
  }, [])

  const handleRemove = (meal: Meal) => {
    setRemovingId(meal.id)
    removeFavorite(meal)
    setTimeout(() => { setFavs(getFavorites()); setRemovingId(null) }, 300)
  }

  const handleToggleCooked = (mealId: string) => {
    toggleMealCooked(mealId)
    setCookedSet((prev) => { const next = new Set(prev); if (next.has(mealId)) next.delete(mealId); else next.add(mealId); return next })
  }

  if (favs.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-5 pb-16">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100 tracking-tight">收藏菜谱</h1>
          <p className="text-sm text-warm-400 dark:text-warm-500 mt-1">收藏你喜欢的菜谱，方便以后再做</p>
        </motion.div>
        <EmptyState icon={<Heart size={48} />} title="还没有收藏" description="在菜谱卡片上点击爱心，收藏你喜欢的菜" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-5 pb-16">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 pb-4">
        <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100 tracking-tight">收藏菜谱</h1>
        <p className="text-sm text-warm-400 dark:text-warm-500 mt-1">共收藏了 {favs.length} 道菜</p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }} className="space-y-3">
        <AnimatePresence>
          {favs.map((fav) => {
            const meal = fav.meal
            const isRemoving = removingId === meal.id
            const cooked = cookedSet.has(meal.id)
            const Icon = mealIcons[meal.type]
            const colors = mealColors[meal.type]
            return (
              <motion.div key={fav.id} layout
                variants={{ hidden: { opacity: 0, y: 16, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } }}
                exit={{ opacity: 0, x: -40, scale: 0.95, transition: { duration: 0.3 } }}
                className={cn('glass card-ring rounded-2xl p-4 transition-all dark:bg-warm-800/50 dark:border-warm-700/40', isRemoving && 'opacity-0 scale-95')}>
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', colors.bg, colors.text)}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-warm-700 dark:text-warm-200 truncate flex items-center gap-2">
                      {meal.name}
                      {cooked && <span className="text-xs text-sage-500 bg-sage-50 dark:bg-sage-900/30 dark:text-sage-400 px-1.5 py-0.5 rounded shrink-0">已做</span>}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', colors.bg, colors.text)}>{mealLabels[meal.type]}</span>
                      <span className="text-xs text-warm-400 dark:text-warm-500">约 {meal.estimatedCost} 元</span>
                      {meal.cookingTime && (
                        <span className="text-xs text-warm-400 dark:text-warm-500 flex items-center gap-0.5">
                          <Clock size={11} />{meal.cookingTime}分钟
                        </span>
                      )}
                    </div>
                    {meal.tips && <p className="text-xs text-warm-400 dark:text-warm-500 mt-1.5 line-clamp-2">{meal.tips}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={() => handleToggleCooked(meal.id)}
                      className={cn('p-1.5 rounded-lg transition-colors', cooked ? 'text-sage-500 hover:bg-sage-50 dark:hover:bg-sage-900/30' : 'text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700/30 hover:text-sage-400')}>
                      <Check size={15} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={() => handleRemove(meal)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-warm-300 hover:text-red-400 transition-colors">
                      <X size={16} />
                    </motion.button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3 ml-[52px]">
                  {meal.ingredients.map((ing) => (
                    <span key={ing.name} className="text-xs px-2 py-0.5 rounded-md bg-warm-50 dark:bg-warm-700/50 border border-warm-200/60 dark:border-warm-600/40 text-warm-500 dark:text-warm-400">
                      {ing.name} {ing.amount}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
