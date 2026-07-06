import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Clock, Trash2, ChefHat, Wheat, Check, RotateCcw } from 'lucide-react'
import { cn, formatDisplayDate, formatDate } from '../lib/utils'
import { getMealPlans, deleteMealPlan, updateMealPlanCooked, saveMealPlan } from '../lib/storage'
import type { DailyMealPlan } from '../types'
import { EmptyState } from '../components/EmptyState'
import { generateId } from '../lib/utils'

export function History() {
  const [plans, setPlans] = useState<DailyMealPlan[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const loadPlans = () => {
    setPlans(getMealPlans().sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)))
  }

  useEffect(() => { loadPlans() }, [])

  const handleRemove = (planId: string) => {
    setRemovingId(planId)
    setTimeout(() => { deleteMealPlan(planId); setPlans((prev) => prev.filter((p) => p.id !== planId)); setRemovingId(null) }, 300)
  }

  const handleToggleCooked = (planId: string, currentCooked: boolean) => {
    updateMealPlanCooked(planId, !currentCooked)
    setPlans((prev) => prev.map((p) => p.id === planId ? { ...p, cooked: !currentCooked } : p))
  }

  const handleRedo = (plan: DailyMealPlan) => {
    const today = formatDate(new Date())
    const newPlan: DailyMealPlan = { ...plan, id: generateId(), date: today, createdAt: new Date().toISOString(), cooked: false }
    newPlan.breakfast = { ...newPlan.breakfast, id: generateId() }
    if (newPlan.lunch) newPlan.lunch = { ...newPlan.lunch, id: generateId() }
    newPlan.dinner = { ...newPlan.dinner, id: generateId() }
    saveMealPlan(newPlan)
    loadPlans()
  }

  if (plans.length === 0) {
    return (
      <div>
        <PageHeader title="历史菜谱" subtitle="查看之前生成的所有菜谱" />
        <EmptyState icon={<Clock size={48} />} title="暂无历史记录" description="生成菜谱后，它们会自动保存在这里" />
      </div>
    )
  }

  const grouped: Record<string, DailyMealPlan[]> = {}
  for (const plan of plans) { if (!grouped[plan.date]) grouped[plan.date] = []; grouped[plan.date].push(plan) }

  return (
    <div>
      <PageHeader title="历史菜谱" subtitle={`共 ${Object.keys(grouped).length} 天、${plans.length} 份菜谱`} />

      <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }} className="space-y-3">
        <AnimatePresence>
          {plans.map((plan) => (
            <motion.div key={plan.id}
              variants={{ hidden: { opacity: 0, y: 16, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } } }}
              exit={{ opacity: 0, x: -40, transition: { duration: 0.3 } }}
              className={cn('card-glow overflow-hidden', removingId === plan.id && 'opacity-0 scale-95', plan.cooked && 'border-sage-500/30')}>
              <button onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-3/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', plan.cooked ? 'bg-sage-500/20 text-sage-500' : 'bg-surface-3/60 text-ink-3')}>
                    {plan.cooked ? <Check size={18} /> : <ChefHat size={18} />}
                  </div>
                  <div>
                    <div className="font-medium text-ink-1 flex items-center gap-2">
                      {formatDisplayDate(plan.date)}
                      {plan.cooked && <span className="text-[10px] text-sage-500 bg-sage-500/15 px-1.5 py-0.5 rounded font-bold uppercase">已做</span>}
                    </div>
                    <div className="text-xs text-ink-4 mt-0.5">
                      早餐：{plan.breakfast.name}
                      {plan.lunch && <> · 午餐：{plan.lunch.name}</>}
                      {' · '}晚餐：{plan.dinner.name}
                    </div>
                  </div>
                </div>
                <motion.span animate={{ rotate: expandedId === plan.id ? 90 : 0 }}>
                  <ChevronRight size={18} className="text-ink-4" />
                </motion.span>
              </button>

              <AnimatePresence>
                {expandedId === plan.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-3 border-t border-surface-4/40 pt-3">
                      <MealSummary label="早餐" meal={plan.breakfast} color="text-gold-500" bg="bg-gold-500/10" />
                      {plan.lunch && <MealSummary label="午餐" meal={plan.lunch} color="text-neon-500" bg="bg-neon-500/10" />}
                      <MealSummary label="晚餐" meal={plan.dinner} color="text-gold-500" bg="bg-gold-700/10" />

                      <div className="flex items-center justify-between pt-2 border-t border-surface-4/40">
                        <span className="text-xs text-ink-4 font-mono">
                          约 {(plan.breakfast.estimatedCost + (plan.lunch?.estimatedCost || 0) + plan.dinner.estimatedCost).toFixed(1)} 元
                        </span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleToggleCooked(plan.id, !!plan.cooked)}
                            className={cn('flex items-center gap-1 text-xs transition-colors', plan.cooked ? 'text-sage-500 hover:text-ink-3' : 'text-ink-4 hover:text-sage-500')}>
                            <Check size={13} />{plan.cooked ? '已做' : '标记做过'}
                          </button>
                          <button onClick={() => handleRedo(plan)} className="flex items-center gap-1 text-xs text-ink-4 hover:text-gold-500 transition-colors">
                            <RotateCcw size={13} />再做一次
                          </button>
                          <button onClick={() => handleRemove(plan.id)} className="flex items-center gap-1 text-xs text-ink-4 hover:text-red-400 transition-colors">
                            <Trash2 size={13} />删除
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

function MealSummary({ label, meal, color, bg }: { label: string; meal: any; color: string; bg: string }) {
  return (
    <div>
      <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md', color, bg)}>{label}</span>
      <h4 className="font-medium text-ink-1 mt-1.5">{meal.name}</h4>
      {meal.staple && (
        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-gold-500/10 border border-gold-500/20 text-xs text-gold-500">
          <Wheat size={11} /> {meal.staple.name} {meal.staple.amount}
        </div>
      )}
      <div className="flex flex-wrap gap-1 mt-1.5">
        {meal.ingredients.map((ing: any) => (
          <span key={ing.name} className="tag">{ing.name} <span className="text-ink-4">{ing.amount}</span></span>
        ))}
      </div>
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
