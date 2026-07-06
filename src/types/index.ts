export interface Ingredient {
  name: string
  amount: string
}

export interface MealDish {
  name: string
  ingredients: Ingredient[]
  instructions: string[]
}

export interface MealStaple {
  name: string
  amount: string
}

export interface Meal {
  id: string
  name: string
  type: 'breakfast' | 'lunch' | 'dinner'
  ingredients: Ingredient[]
  instructions: string[]
  estimatedCost: number
  tips: string
  dishes?: MealDish[]
  staple?: MealStaple
  cookingTime?: number // minutes (feature 11)
}

export interface DailyMealPlan {
  id: string
  date: string // YYYY-MM-DD
  breakfast: Meal
  lunch?: Meal
  dinner: Meal
  createdAt: string // ISO
  cooked?: boolean
}

export interface FavoriteMeal {
  id: string
  meal: Meal
  addedAt: string // ISO
}

export interface UserSettings {
  apiKey: string
  foodRestrictions: string
  breakfastBudget: string
  dinnerBudget: string
  servings: number      // feature 6: 用餐人数
  darkMode: boolean     // feature 12: 暗色模式
}

export interface ShoppingItem {
  name: string
  amount: string
  source: string // meal name
  checked: boolean
}
