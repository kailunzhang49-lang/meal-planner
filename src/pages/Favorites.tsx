import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Coffee, Soup, X, ChefHat } from 'lucide-react'
import { cn } from '../lib/utils'
import { getFavorites, removeFavorite } from '../lib/storage'
import type { FavoriteMeal, Meal } from '../types'
import { EmptyState } from '../components/EmptyState'

export function Favorites() {
  const [favs, setFavs] = useState<FavoriteMeal[]>([])
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    setFavs(getFavorites())
  }, [])

  const handleRemove = (meal: Meal) => {
    setRemovingId(meal.id)
    removeFavorite(meal)
    setTimeout(() => {
      setFavs(getFavorites())
      setRemovingId(null)
    }, 300)
  }

  if (favs.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-5 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-6 pb-4"
        >
          <h1 className="text-2xl font-bold text-warm-800 tracking-tight">收藏菜谱</h1>
          <p className="text-sm text-warm-400 mt-1">收藏你喜欢的菜谱，方便以后再做</p>
        </motion.div>
        <EmptyState
          icon={<Heart size={48} />}
          title="还没有收藏"
          description="在菜谱卡片上点击爱心，收藏你喜欢的菜"
        />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-5 pb-16">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6 pb-4"
      >
        <h1 className="text-2xl font-bold text-warm-800 tracking-tight">收藏菜谱</h1>
        <p className="text-sm text-warm-400 mt-1">
          共收藏了 {favs.length} 道菜
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
        className="space-y-3"
      >
        <AnimatePresence>
          {favs.map((fav) => {
            const meal = fav.meal
            const isRemoving = removingId === meal.id
            const Icon = meal.type === 'breakfast' ? Coffee : Soup

            return (
              <motion.div
                key={fav.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 16, scale: 0.97 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                  },
                }}
                exit={{ opacity: 0, x: -40, scale: 0.95, transition: { duration: 0.3 } }}
                className={cn(
                  'glass card-ring rounded-2xl p-4 transition-all',
                  isRemoving && 'opacity-0 scale-95',
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      meal.type === 'breakfast'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-sage-100 text-sage-600',
                    )}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-warm-700 truncate">{meal.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          meal.type === 'breakfast'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-sage-100 text-sage-600',
                        )}
                      >
                        {meal.type === 'breakfast' ? '早餐' : '晚餐'}
                      </span>
                      <span className="text-xs text-warm-400">约 {meal.estimatedCost} 元</span>
                    </div>
                    {meal.tips && (
                      <p className="text-xs text-warm-400 mt-1.5 line-clamp-2">{meal.tips}</p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleRemove(meal)}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-warm-300 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </motion.button>
                </div>

                {/* Ingredients grid */}
                <div className="flex flex-wrap gap-1 mt-3 ml-[52px]">
                  {meal.ingredients.map((ing) => (
                    <span
                      key={ing.name}
                      className="text-xs px-2 py-0.5 rounded-md bg-warm-50 border border-warm-200/60 text-warm-500"
                    >
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
