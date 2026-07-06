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
  breakfast: { icon: 'bg-gold-500/20 text-gold-500', badge: 'bg-gold-500/15 text-gold-500 border border-gold-500/30' },
  lunch: { icon: 'bg-neon-500/20 text-neon-500', badge: 'bg-neon-500/15 text-neon-500 border border-neon-500/30' },
  dinner: { icon: 'bg-gold-700/20 text-gold-500', badge: 'bg-gold-700/15 text-gold-500 border border-gold-700/30' },
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
      <div>
        <PageHeader title="收藏菜谱" subtitle="收藏你喜欢的菜谱，方便以后再做" />
        <EmptyState icon={<Heart size={48} />} title="还没有收藏" description="在菜谱卡片上点击爱心，收藏你喜欢的菜" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="收藏菜谱" subtitle={`共收藏了 ${favs.length} 道菜`} />

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
                variants={{ hidden: { opacity: 0, y: 16, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                exit={{ opacity: 0, x: -40, scale: 0.95 }}
                className={cn('card-glow p-4', isRemoving && 'opacity-0 scale-95')}>
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', colors.icon)}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink-1 truncate flex items-center gap-2">
                      {meal.name}
                      {cooked && <span className="text-[10px] text-sage-500 bg-sage-500/15 px-1.5 py-0.5 rounded font-bold uppercase">已做</span>}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-md font-bold uppercase', colors.badge)}>{mealLabels[meal.type]}</span>
                      <span className="text-xs text-ink-4 font-mono">¥{meal.estimatedCost}</span>
                      {meal.cookingTime && (
                        <span className="text-xs text-ink-4 flex items-center gap-0.5 font-mono">
                          <Clock size={11} />{meal.cookingTime}min
                        </span>
                      )}
                    </div>
                    {meal.tips && <p className="text-xs text-ink-4 mt-1.5 line-clamp-2">{meal.tips}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={() => handleToggleCooked(meal.id)}
                      className={cn('p-1.5 rounded-lg transition-colors', cooked ? 'text-sage-500' : 'text-ink-4 hover:text-sage-500')}>
                      <Check size={15} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={() => handleRemove(meal)}
                      className="p-1.5 rounded-lg text-ink-4 hover:text-red-400 transition-colors">
                      <X size={16} />
                    </motion.button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3 ml-[52px]">
                  {meal.ingredients.map((ing) => (
                    <span key={ing.name} className="tag">{ing.name} <span className="text-ink-4">{ing.amount}</span></span>
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

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 pb-4">
      <h1 className="text-2xl font-bold text-ink-1 tracking-tight">{title}</h1>
      <p className="text-sm text-ink-4 mt-1">{subtitle}</p>
    </motion.div>
  )
}
