import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { Heart, ChevronDown, Coffee, Soup, ShoppingBasket, ChefHat, Lightbulb, Banknote, Wheat } from 'lucide-react'
import { cn } from '../lib/utils'
import type { Meal } from '../types'
import { isFavorite, addFavorite, removeFavorite } from '../lib/storage'
import { TiltCard } from './TiltCard'

interface MealCardProps {
  meal: Meal
  index?: number
}

export function MealCard({ meal, index = 0 }: MealCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [faved, setFaved] = useState(() => isFavorite(meal))
  const [heartAnim, setHeartAnim] = useState(false)

  // Animated budget counter
  const costMotion = useMotionValue(0)
  const costSpring = useSpring(costMotion, { stiffness: 80, damping: 15 })
  const [displayCost, setDisplayCost] = useState(0)

  useState(() => {
    const timer = setTimeout(() => {
      costMotion.set(meal.estimatedCost)
    }, 300 + index * 200)
    costSpring.on('change', (v) => setDisplayCost(Math.round(v * 10) / 10))
    return () => {
      costMotion.set(0)
      timer && clearTimeout(timer)
    }
  })

  const toggleFav = () => {
    if (faved) {
      removeFavorite(meal)
      setFaved(false)
    } else {
      addFavorite(meal)
      setFaved(true)
      setHeartAnim(true)
      setTimeout(() => setHeartAnim(false), 600)
    }
  }

  const Icon = meal.type === 'breakfast' ? Coffee : Soup
  const hasDishes = meal.dishes && meal.dishes.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <TiltCard glowColor={meal.type === 'breakfast' ? 'rgba(251, 191, 36, 0.25)' : 'rgba(101, 147, 104, 0.3)'}>
        <div className="glass card-ring rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-5 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <motion.div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    meal.type === 'breakfast' ? 'bg-amber-100 text-amber-600' : 'bg-sage-100 text-sage-600',
                  )}
                  whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon size={20} />
                </motion.div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-warm-800 truncate">{meal.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      meal.type === 'breakfast'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-sage-100 text-sage-700',
                    )}>
                      {meal.type === 'breakfast' ? '早餐' : '晚餐'}
                    </span>
                    <span className="text-xs text-warm-400 flex items-center gap-0.5">
                      <Banknote size={11} />
                      <motion.span className="tabular-nums">{displayCost.toFixed(1)}</motion.span>
                      元
                    </span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
                onClick={toggleFav}
                className="shrink-0 relative"
              >
                <Heart
                  size={21}
                  className={cn(
                    'transition-colors duration-200',
                    faved ? 'fill-red-400 text-red-400' : 'text-warm-300 hover:text-red-300',
                  )}
                />
                {heartAnim && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-red-400"
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          x: (Math.random() - 0.5) * 40,
                          y: (Math.random() - 0.5) * 40,
                          opacity: 0,
                          scale: 0,
                        }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    ))}
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Staple food badge */}
          {meal.staple && (
            <div className="px-5 pb-2">
              <motion.div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/60"
                whileHover={{ scale: 1.03 }}
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Wheat size={13} className="text-amber-500" />
                </motion.span>
                <span className="text-xs font-medium text-amber-700">{meal.staple.name}</span>
                <span className="text-xs text-amber-500">{meal.staple.amount}</span>
              </motion.div>
            </div>
          )}

          {/* Dinner: show each dish separately */}
          {hasDishes ? (
            <div className="px-5 pb-2 space-y-3">
              {meal.dishes!.map((dish, di) => (
                <motion.div
                  key={dish.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.15 + di * 0.1 }}
                  whileHover={{ x: 2 }}
                  className="p-3 rounded-xl bg-warm-50/80 border border-warm-200/40"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <ChefHat size={13} className="text-sage-500" />
                    <span className="text-sm font-semibold text-warm-700">
                      {meal.dishes!.length > 1 ? `菜${di + 1}：` : ''}{dish.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dish.ingredients.map((ing, ii) => (
                      <motion.span
                        key={ing.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.15 + di * 0.1 + ii * 0.04 }}
                        whileHover={{ scale: 1.05, y: -1 }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-warm-200/60 text-xs text-warm-600 cursor-default"
                      >
                        <span className="font-medium">{ing.name}</span>
                        <span className="text-warm-400">{ing.amount}</span>
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Breakfast: show ingredients */
            <div className="px-5 pb-2">
              <div className="flex items-center gap-1.5 mb-2">
                <ShoppingBasket size={14} className="text-warm-400" />
                <span className="text-xs font-medium text-warm-500">食材清单</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {meal.ingredients.map((ing, i) => (
                  <motion.span
                    key={ing.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.15 + i * 0.05 }}
                    whileHover={{ scale: 1.05, y: -1 }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-warm-50 border border-warm-200/60 text-xs text-warm-600 cursor-default"
                  >
                    <span className="font-medium">{ing.name}</span>
                    <span className="text-warm-400">{ing.amount}</span>
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Expandable instructions */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="overflow-hidden"
              >
                <div className="px-5 pt-2 pb-4 space-y-4 border-t border-warm-100 mt-1">
                  {hasDishes ? (
                    meal.dishes!.map((dish, di) => (
                      <div key={dish.name}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <ChefHat size={14} className="text-sage-500" />
                          <span className="text-xs font-semibold text-warm-600">{dish.name} — 做法</span>
                        </div>
                        <ol className="space-y-1.5 ml-5">
                          {dish.instructions.map((step, si) => (
                            <motion.li
                              key={si}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: di * 0.12 + si * 0.06 }}
                              className="flex gap-2 text-sm text-warm-600"
                            >
                              <span className="font-semibold text-sage-500 shrink-0 w-5 text-right">{si + 1}.</span>
                              <span>{step}</span>
                            </motion.li>
                          ))}
                        </ol>
                      </div>
                    ))
                  ) : (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <ChefHat size={14} className="text-warm-400" />
                        <span className="text-xs font-medium text-warm-500">做法</span>
                      </div>
                      <ol className="space-y-1.5">
                        {meal.instructions.map((step, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="flex gap-2 text-sm text-warm-600"
                          >
                            <span className="font-semibold text-sage-500 shrink-0 w-5 text-right">{i + 1}.</span>
                            <span>{step}</span>
                          </motion.li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {meal.tips && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100"
                    >
                      <Lightbulb size={15} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700">{meal.tips}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand toggle */}
          <motion.button
            onClick={() => setExpanded(!expanded)}
            whileHover={{ backgroundColor: 'rgba(245, 245, 244, 0.5)' }}
            className="w-full py-2.5 flex items-center justify-center gap-1 text-xs text-warm-400 hover:text-warm-600 transition-colors"
          >
            {expanded ? '收起做法' : '查看做法'}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} />
            </motion.span>
          </motion.button>
        </div>
      </TiltCard>
    </motion.div>
  )
}
