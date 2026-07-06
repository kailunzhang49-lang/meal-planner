import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Clock, Trash2, ChefHat, Wheat, Check } from 'lucide-react'
import { cn, formatDisplayDate } from '../lib/utils'
import { getMealPlans, deleteMealPlan, updateMealPlanCooked } from '../lib/storage'
import type { DailyMealPlan } from '../types'
import { EmptyState } from '../components/EmptyState'

export function History() {
  const [plans, setPlans] = useState<DailyMealPlan[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const loadPlans = () => {
    const all = getMealPlans().sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    setPlans(all)
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const handleRemove = (planId: string) => {
    setRemovingId(planId)
    setTimeout(() => {
      deleteMealPlan(planId)
      setPlans((prev) => prev.filter((p) => p.id !== planId))
      setRemovingId(null)
    }, 300)
  }

  const handleToggleCooked = (planId: string, currentCooked: boolean) => {
    updateMealPlanCooked(planId, !currentCooked)
    setPlans((prev) => prev.map((p) => p.id === planId ? { ...p, cooked: !currentCooked } : p))
  }

  const toggleExpand = (planId: string) => {
    setExpandedId(expandedId === planId ? null : planId)
  }

  if (plans.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-5 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-6 pb-4"
        >
          <h1 className="text-2xl font-bold text-warm-800 tracking-tight">历史菜谱</h1>
          <p className="text-sm text-warm-400 mt-1">查看之前生成的所有菜谱</p>
        </motion.div>
        <EmptyState
          icon={<Clock size={48} />}
          title="暂无历史记录"
          description="生成菜谱后，它们会自动保存在这里"
        />
      </div>
    )
  }

  // Group plans by date
  const grouped: Record<string, DailyMealPlan[]> = {}
  for (const plan of plans) {
    if (!grouped[plan.date]) grouped[plan.date] = []
    grouped[plan.date].push(plan)
  }

  return (
    <div className="max-w-lg mx-auto px-5 pb-16">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6 pb-4"
      >
        <h1 className="text-2xl font-bold text-warm-800 tracking-tight">历史菜谱</h1>
        <p className="text-sm text-warm-400 mt-1">
          共 {Object.keys(grouped).length} 天、{plans.length} 份菜谱记录
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
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={{
                hidden: { opacity: 0, y: 16, scale: 0.97 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                },
              }}
              exit={{ opacity: 0, x: -40, transition: { duration: 0.3 } }}
              className={cn(
                'glass card-ring rounded-2xl overflow-hidden transition-all',
                removingId === plan.id && 'opacity-0 scale-95',
                plan.cooked && 'ring-sage-300/50',
              )}
            >
              {/* Header */}
              <button
                onClick={() => toggleExpand(plan.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-warm-50/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    plan.cooked ? 'bg-sage-200 text-sage-600' : 'bg-sage-100 text-sage-600',
                  )}>
                    {plan.cooked ? <Check size={18} /> : <ChefHat size={18} />}
                  </div>
                  <div>
                    <div className="font-medium text-warm-700 flex items-center gap-2">
                      {formatDisplayDate(plan.date)}
                      {plan.cooked && (
                        <span className="text-xs text-sage-500 bg-sage-50 px-1.5 py-0.5 rounded">已做</span>
                      )}
                    </div>
                    <div className="text-xs text-warm-400 mt-0.5">
                      早餐：{plan.breakfast.name}
                      {plan.lunch && <> · 午餐：{plan.lunch.name}</>}
                      {' · '}晚餐：{plan.dinner.name}
                    </div>
                  </div>
                </div>
                <motion.span
                  animate={{ rotate: expandedId === plan.id ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={18} className="text-warm-400" />
                </motion.span>
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {expandedId === plan.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-warm-100 pt-3">
                      {/* Breakfast */}
                      <div>
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          早餐
                        </span>
                        <h4 className="font-medium text-warm-700 mt-1.5">{plan.breakfast.name}</h4>
                        {plan.breakfast.staple && (
                          <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-700">
                            <Wheat size={11} /> {plan.breakfast.staple.name} {plan.breakfast.staple.amount}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {plan.breakfast.ingredients.map((ing) => (
                            <span key={ing.name} className="text-xs px-2 py-0.5 rounded-md bg-warm-100 text-warm-500">
                              {ing.name} {ing.amount}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Lunch */}
                      {plan.lunch && (
                        <div>
                          <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                            午餐
                          </span>
                          <h4 className="font-medium text-warm-700 mt-1.5">{plan.lunch.name}</h4>
                          {plan.lunch.staple && (
                            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-700">
                              <Wheat size={11} /> {plan.lunch.staple.name} {plan.lunch.staple.amount}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {plan.lunch.ingredients.map((ing) => (
                              <span key={ing.name} className="text-xs px-2 py-0.5 rounded-md bg-warm-100 text-warm-500">
                                {ing.name} {ing.amount}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dinner */}
                      <div>
                        <span className="text-xs font-medium text-sage-600 bg-sage-50 px-2 py-0.5 rounded-full">
                          晚餐
                        </span>
                        {plan.dinner.staple && (
                          <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-700">
                            <Wheat size={11} /> {plan.dinner.staple.name} {plan.dinner.staple.amount}
                          </span>
                        )}
                        {plan.dinner.dishes && plan.dinner.dishes.length > 0 ? (
                          <div className="mt-2 space-y-2">
                            {plan.dinner.dishes.map((dish, di) => (
                              <div key={dish.name} className="p-2.5 rounded-lg bg-warm-50 border border-warm-200/40">
                                <div className="text-xs font-semibold text-warm-600 mb-1">
                                  菜{di + 1}：{dish.name}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {dish.ingredients.map((ing) => (
                                    <span key={ing.name} className="text-xs px-2 py-0.5 rounded-md bg-white border border-warm-200/60 text-warm-500">
                                      {ing.name} {ing.amount}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            <h4 className="font-medium text-warm-700 mt-1.5">{plan.dinner.name}</h4>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {plan.dinner.ingredients.map((ing) => (
                                <span key={ing.name} className="text-xs px-2 py-0.5 rounded-md bg-warm-100 text-warm-500">
                                  {ing.name} {ing.amount}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Total cost + actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-warm-100">
                        <span className="text-xs text-warm-400">
                          总预算约 {(plan.breakfast.estimatedCost + (plan.lunch?.estimatedCost || 0) + plan.dinner.estimatedCost).toFixed(1)} 元
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleCooked(plan.id, !!plan.cooked)}
                            className={cn(
                              'flex items-center gap-1 text-xs transition-colors',
                              plan.cooked ? 'text-sage-500 hover:text-warm-400' : 'text-warm-400 hover:text-sage-500',
                            )}
                          >
                            <Check size={13} />
                            {plan.cooked ? '已做' : '标记做过'}
                          </button>
                          <button
                            onClick={() => handleRemove(plan.id)}
                            className="flex items-center gap-1 text-xs text-warm-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={13} />
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
