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
  type: 'breakfast' | 'dinner'
  ingredients: Ingredient[]
  instructions: string[]
  estimatedCost: number
  tips: string
  dishes?: MealDish[]     // 晚餐多道菜
  staple?: MealStaple     // 主食
}

export interface DailyMealPlan {
  date: string // YYYY-MM-DD
  breakfast: Meal
  dinner: Meal
  createdAt: string // ISO
}

export interface FavoriteMeal {
  id: string
  meal: Meal
  addedAt: string // ISO
}
