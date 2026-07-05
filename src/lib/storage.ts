import type { DailyMealPlan, FavoriteMeal, Meal } from '../types'

const MEAL_PLANS_KEY = 'mealPlanner_mealPlans'
const FAVORITES_KEY = 'mealPlanner_favorites'

// --- Meal Plans ---

export function getMealPlans(): DailyMealPlan[] {
  try {
    const raw = localStorage.getItem(MEAL_PLANS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getMealPlanByDate(dateStr: string): DailyMealPlan | undefined {
  return getMealPlans().find((p) => p.date === dateStr)
}

export function saveMealPlan(plan: DailyMealPlan): void {
  const plans = getMealPlans().filter((p) => p.date !== plan.date)
  plans.push(plan)
  localStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(plans))
}

export function getAllPlanDates(): Set<string> {
  return new Set(getMealPlans().map((p) => p.date))
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
  return getFavorites().some((f) => f.meal.name === meal.name && f.meal.type === meal.type)
}

export function addFavorite(meal: Meal): void {
  if (isFavorite(meal)) return
  const favs = getFavorites()
  favs.push({
    id: meal.id,
    meal,
    addedAt: new Date().toISOString(),
  })
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
}

export function removeFavorite(meal: Meal): void {
  const favs = getFavorites().filter(
    (f) => !(f.meal.name === meal.name && f.meal.type === meal.type),
  )
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
}
