import type { DailyMealPlan, FavoriteMeal, Meal, UserSettings } from '../types'

const MEAL_PLANS_KEY = 'mealPlanner_mealPlans'
const FAVORITES_KEY = 'mealPlanner_favorites'
const COOKED_KEY = 'mealPlanner_cooked'
const SETTINGS_KEY = 'mealPlanner_settings'
const LAST_BACKUP_KEY = 'mealPlanner_lastBackup'

// --- Default Settings ---

const DEFAULT_SETTINGS: UserSettings = {
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  foodRestrictions: `【食材限制 - 非常重要】
- 严禁使用任何鱼类（包括淡水鱼和海鱼，如鲤鱼、鲫鱼、草鱼、带鱼、鲅鱼等）
- 严禁使用任何海鲜（贝类、鱿鱼、螃蟹、海带、紫菜、海虹、蛤蜊、扇贝等）
- 虾：大虾（对虾/明虾/青虾）可以使用，但出现频率要非常低，一周最多一两次
- 优先使用：猪肉、鸡肉、牛肉、鸡蛋、豆腐、蔬菜、菌菇等家常食材`,
  breakfastBudget: '10-15',
  dinnerBudget: '10-15',
  servings: 2,
  darkMode: false,
}

// --- Meal Plans ---

export function getMealPlans(): DailyMealPlan[] {
  try {
    const raw = localStorage.getItem(MEAL_PLANS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getMealPlansByDate(dateStr: string): DailyMealPlan[] {
  return getMealPlans()
    .filter((p) => p.date === dateStr)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getMealPlanByDate(dateStr: string): DailyMealPlan | undefined {
  const plans = getMealPlansByDate(dateStr)
  return plans[0]
}

export function saveMealPlan(plan: DailyMealPlan): void {
  const plans = getMealPlans()
  plans.push(plan)
  localStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(plans))
}

export function deleteMealPlan(planId: string): void {
  const plans = getMealPlans().filter((p) => p.id !== planId)
  localStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(plans))
}

export function updateMealPlanCooked(planId: string, cooked: boolean): void {
  const plans = getMealPlans()
  const plan = plans.find((p) => p.id === planId)
  if (plan) {
    plan.cooked = cooked
    localStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(plans))
  }
}

export function getAllPlanDates(): Set<string> {
  return new Set(getMealPlans().map((p) => p.date))
}

/** Feature 1: 最近 N 个不同日期的菜谱 (去重) */
export function getRecentPlans(n: number = 5): DailyMealPlan[] {
  const plans = getMealPlans().sort((a, b) => b.date.localeCompare(a.date))
  const seen = new Set<string>()
  const result: DailyMealPlan[] = []
  for (const plan of plans) {
    if (!seen.has(plan.date)) {
      seen.add(plan.date)
      result.push(plan)
      if (result.length >= n) break
    }
  }
  return result
}

/** Feature 4: 获取日期范围内的菜谱 (周视图) */
export function getPlansInRange(startDate: string, endDate: string): Map<string, DailyMealPlan> {
  const plans = getMealPlans()
  const map = new Map<string, DailyMealPlan>()
  for (const plan of plans) {
    if (plan.date >= startDate && plan.date <= endDate) {
      if (!map.has(plan.date) || plan.createdAt > map.get(plan.date)!.createdAt) {
        map.set(plan.date, plan)
      }
    }
  }
  return map
}

// --- Favorites ---

export function getFavorites(): FavoriteMeal[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function isFavorite(meal: Meal): boolean {
  return getFavorites().some((f) => f.id === meal.id)
}

export function addFavorite(meal: Meal): void {
  if (isFavorite(meal)) return
  const favs = getFavorites()
  favs.push({ id: meal.id, meal, addedAt: new Date().toISOString() })
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
}

export function removeFavorite(meal: Meal): void {
  const favs = getFavorites().filter((f) => f.id !== meal.id)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
}

// --- Cooked Meals ---

export function getCookedMeals(): Set<string> {
  try {
    const raw = localStorage.getItem(COOKED_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function isMealCooked(mealId: string): boolean {
  return getCookedMeals().has(mealId)
}

export function toggleMealCooked(mealId: string): void {
  const cooked = getCookedMeals()
  if (cooked.has(mealId)) cooked.delete(mealId)
  else cooked.add(mealId)
  localStorage.setItem(COOKED_KEY, JSON.stringify([...cooked]))
}

// --- Settings ---

export function getSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

// --- Auto Backup Reminder (Feature 9) ---

export function getLastBackupTime(): string | null {
  return localStorage.getItem(LAST_BACKUP_KEY)
}

export function setLastBackupTime(): void {
  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString())
}

export function shouldRemindBackup(): boolean {
  const last = getLastBackupTime()
  if (!last) return getMealPlans().length > 5
  const daysSince = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24)
  return daysSince >= 7 && getMealPlans().length > 5
}

// --- Export / Import ---

export function exportAllData(): string {
  return JSON.stringify({
    version: 2,
    mealPlans: getMealPlans(),
    favorites: getFavorites(),
    cooked: [...getCookedMeals()],
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  })
}

export function importAllData(jsonStr: string): void {
  const data = JSON.parse(jsonStr)
  if (data.mealPlans) localStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(data.mealPlans))
  if (data.favorites) localStorage.setItem(FAVORITES_KEY, JSON.stringify(data.favorites))
  if (data.cooked) localStorage.setItem(COOKED_KEY, JSON.stringify(data.cooked))
  if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings))
}
