import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { Heart, ChevronDown, Coffee, Soup, Sun, ShoppingBasket, ChefHat, Lightbulb, Banknote, Wheat, RefreshCw, Check, Clock } from 'lucide-react'
import { cn } from '../lib/utils'
import type { Meal } from '../types'
import { isFavorite, addFavorite, removeFavorite, isMealCooked, toggleMealCooked } from '../lib/storage'
import { TiltCard } from './TiltCard'

interface MealCardProps {
  meal: Meal
  index?: number
  onRegenerate?: () => void
  regenerating?: boolean
}

const mealIcons = { breakfast: Coffee, lunch: Sun, dinner: Soup }
const mealLabels = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }
const mealColors = {
  breakfast: { icon: 'bg-gold-500/20 text-gold-400', badge: 'bg-gold-500/20 text-gold-400 border border-gold-500/30' },
  lunch: { icon: 'bg-neon-500/20 text-neon-400', badge: 'bg-neon-500/20 text-neon-400 border border-neon-500/30' },
  dinner: { icon: 'bg-gold-700/20 text-gold-500', badge: 'bg-gold-700/20 text-gold-500 border border-gold-700/30' },
}

export function MealCard({ meal, index = 0, onRegenerate, regenerating }: MealCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [faved, setFaved] = useState(() => isFavorite(meal))
  const [heartAnim, setHeartAnim] = useState(false)
  const [cooked, setCooked] = useState(() => isMealCooked(meal.id))

  const costMotion = useMotionValue(0)
  const costSpring = useSpring(costMotion, { stiffness: 80, damping: 15 })
  const [displayCost, setDisplayCost] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => { costMotion.set(meal.estimatedCost) }, 300 + index * 200)
    const unsub = costSpring.on('change', (v) => setDisplayCost(Math.round(v * 10) / 10))
    return () => { costMotion.set(0); clearTimeout(timer); unsub() }
  }, [meal.estimatedCost, index, costMotion, costSpring])

  useEffect(() => {
    setFaved(isFavorite(meal))
    setCooked(isMealCooked(meal.id))
  }, [meal])

  const toggleFav = () => {
    if (faved) { removeFavorite(meal); setFaved(false) }
    else { addFavorite(meal); setFaved(true); setHeartAnim(true); setTimeout(() => setHeartAnim(false), 600) }
  }

  const toggleCooked = () => { toggleMealCooked(meal.id); setCooked(!cooked) }

  const Icon = mealIcons[meal.type]
  const colors = mealColors[meal.type]
  const hasDishes = meal.dishes && meal.dishes.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <TiltCard glowColor="rgba(232, 168, 56, 0.25)">
        <div className="card-glow overflow-hidden">
          {/* Header */}
          <div className="p-5 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <motion.div
                  className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', colors.icon)}
                  whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon size={20} />
                </motion.div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink-1 truncate">{meal.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider', colors.badge)}>
                      {mealLabels[meal.type]}
                    </span>
                    <span className="text-xs text-ink-3 flex items-center gap-0.5 font-mono">
                      <Banknote size={11} />
                      <motion.span className="tabular-nums">{displayCost.toFixed(1)}</motion.span>元
                    </span>
                    {meal.cookingTime && (
                      <span className="text-xs text-ink-3 flex items-center gap-0.5 font-mono">
                        <Clock size={11} />
                        {meal.cookingTime}min
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={toggleCooked}>
                  <Check size={19} className={cn('transition-colors duration-200', cooked ? 'text-sage-400 fill-sage-400/20' : 'text-surface-5 hover:text-sage-400')} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={toggleFav} className="relative">
                  <Heart size={21} className={cn('transition-colors duration-200', faved ? 'fill-gold-400 text-gold-400' : 'text-surface-5 hover:text-gold-400')} />
                  {heartAnim && (
                    [...Array(6)].map((_, i) => (
                      <motion.div key={i} className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-gold-400"
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{ x: (Math.random() - 0.5) * 40, y: (Math.random() - 0.5) * 40, opacity: 0, scale: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }} />
                    ))
                  )}
                </motion.button>
                {onRegenerate && (
                  <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={onRegenerate} disabled={regenerating}
                    className={cn(regenerating && 'animate-spin')}>
                    <RefreshCw size={17} className={cn('text-surface-5 hover:text-gold-400 transition-colors', regenerating && 'text-gold-400')} />
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Staple */}
          {meal.staple && (
            <div className="px-5 pb-2">
              <motion.div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500/10 border border-gold-500/20" whileHover={{ scale: 1.03 }}>
                <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Wheat size={13} className="text-gold-500" />
                </motion.span>
                <span className="text-xs font-medium text-gold-400">{meal.staple.name}</span>
                <span className="text-xs text-gold-600">{meal.staple.amount}</span>
              </motion.div>
            </div>
          )}

          {/* Dishes or ingredients */}
          {hasDishes ? (
            <div className="px-5 pb-2 space-y-3">
              {meal.dishes!.map((dish, di) => (
                <motion.div key={dish.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.15 + di * 0.1 }} whileHover={{ x: 2 }}
                  className="p-3 rounded-xl bg-surface-3/60 border border-surface-4/40">
                  <div className="flex items-center gap-1.5 mb-2">
                    <ChefHat size={13} className="text-gold-500" />
                    <span className="text-sm font-semibold text-ink-1">
                      {meal.dishes!.length > 1 ? `菜${di + 1}：` : ''}{dish.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dish.ingredients.map((ing) => (
                      <motion.span key={ing.name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.05, y: -1 }}
                        className="tag cursor-default">
                        <span className="font-medium text-ink-2">{ing.name}</span>
                        <span className="text-ink-4">{ing.amount}</span>
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="px-5 pb-2">
              <div className="flex items-center gap-1.5 mb-2">
                <ShoppingBasket size={14} className="text-ink-4" />
                <span className="text-xs font-medium text-ink-3">食材清单</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {meal.ingredients.map((ing, i) => (
                  <motion.span key={ing.name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + index * 0.15 + i * 0.05 }} whileHover={{ scale: 1.05, y: -1 }}
                    className="tag cursor-default">
                    <span className="font-medium text-ink-2">{ing.name}</span>
                    <span className="text-ink-4">{ing.amount}</span>
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Expandable instructions */}
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
                <div className="px-5 pt-2 pb-4 space-y-4 border-t border-surface-4/40 mt-1">
                  {hasDishes ? (
                    meal.dishes!.map((dish, di) => (
                      <div key={dish.name}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <ChefHat size={14} className="text-gold-500" />
                          <span className="text-xs font-semibold text-ink-2">{dish.name} — 做法</span>
                        </div>
                        <ol className="space-y-1.5 ml-5">
                          {dish.instructions.map((step, si) => (
                            <motion.li key={si} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: di * 0.12 + si * 0.06 }}
                              className="flex gap-2 text-sm text-ink-2">
                              <span className="font-mono font-semibold text-gold-500 shrink-0 w-5 text-right">{si + 1}.</span>
                              <span>{step}</span>
                            </motion.li>
                          ))}
                        </ol>
                      </div>
                    ))
                  ) : (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <ChefHat size={14} className="text-ink-4" />
                        <span className="text-xs font-medium text-ink-3">做法</span>
                      </div>
                      <ol className="space-y-1.5">
                        {meal.instructions.map((step, i) => (
                          <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                            className="flex gap-2 text-sm text-ink-2">
                            <span className="font-mono font-semibold text-gold-500 shrink-0 w-5 text-right">{i + 1}.</span>
                            <span>{step}</span>
                          </motion.li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {meal.tips && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      className="flex items-start gap-2 p-3 rounded-xl bg-gold-500/10 border border-gold-500/20">
                      <Lightbulb size={15} className="text-gold-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-gold-300">{meal.tips}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button onClick={() => setExpanded(!expanded)} whileHover={{ backgroundColor: 'rgba(30,30,50,0.5)' }}
            className="w-full py-2.5 flex items-center justify-center gap-1 text-xs text-ink-4 hover:text-ink-2 transition-colors">
            {expanded ? '收起做法' : '查看做法'}
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} />
            </motion.span>
          </motion.button>
        </div>
      </TiltCard>
    </motion.div>
  )
}
