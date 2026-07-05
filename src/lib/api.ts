import type { Meal, MealDish, MealStaple } from '../types'
import { generateId } from './utils'

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const API_URL = 'https://api.deepseek.com/chat/completions'

interface DeepSeekResponse {
  choices: { message: { content: string } }[]
}

const FOOD_RESTRICTIONS = `【食材限制 - 非常重要】
- 严禁使用任何鱼类（包括淡水鱼和海鱼，如鲤鱼、鲫鱼、草鱼、带鱼、鲅鱼等）
- 严禁使用任何海鲜（贝类、鱿鱼、螃蟹、海带、紫菜、海虹、蛤蜊、扇贝等）
- 虾：大虾（对虾/明虾/青虾）可以使用，但出现频率要非常低，一周最多一两次
- 优先使用：猪肉、鸡肉、牛肉、鸡蛋、豆腐、蔬菜、菌菇等家常食材`

/** 早餐：可提前备好、早上5-6分钟搞定的饭菜 + 主食 */
export async function generateBreakfast(dateStr: string): Promise<Meal> {
  const prompt = `你是一位生活在辽宁大连的家庭厨师，擅长做少油清爽的家常菜。

请为早餐设计一道"可提前备好、早上只需5-6分钟就能吃上"的菜品，要求：

【关键要求】
- 食材可以前一晚预处理（比如提前切好、提前泡好、提前腌好），早上只需要简单加热/煮/蒸/组装
- 早上实际动手时间不超过5-6分钟。例如：提前做好的包子蒸一下、提前泡好的燕麦粥热一下、提前包好的三明治煎一下
- 必须有主食（馒头、花卷、米饭、面条、饼、粥、面包、包子等），主食要根据这道菜的特点来搭配，给出具体用量
- 用油少，烹饪方式健康
- 食材必须是在大连普通菜市场就能买到的常见食材
- 预算是10-15元（包含主食），两个人吃
- 要有饱腹感，能吃饱

${FOOD_RESTRICTIONS}

请严格按照以下JSON格式回复（不要回复其他内容）：
{
  "name": "早餐菜名",
  "ingredients": [
    { "name": "食材名", "amount": "用量（克/个/勺等）" }
  ],
  "instructions": ["前一晚准备：xxx", "早上（5分钟）：xxx", ...],
  "staple": { "name": "主食名（如米饭、馒头、面条等）", "amount": "具体用量" },
  "estimatedCost": 预算金额数字,
  "tips": "一条让早上更快更方便的小贴士"
}`

  return callAPI(prompt, 'breakfast')
}

/** 晚餐：2道菜 + 主食 */
export async function generateDinner(dateStr: string): Promise<Meal> {
  const prompt = `你是一位生活在辽宁大连的家庭厨师，擅长做少油清爽的家常菜。

请为晚餐设计"两道菜 + 一份主食"的组合，要求：

【关键要求】
- 必须有两道菜，搭配合理（如一荤一素、一炒一拌、一菜一汤等），两个人能吃饱
- 每道菜都要给出独立的食材清单和做法步骤
- 必须有主食（米饭、馒头、花卷、面条、饼等），主食要根据菜的口味和菜量来搭配，给出具体用量
- 主食用量要考虑两道菜的菜量——如果菜多，主食就可以少一些；菜少或偏咸/下饭，主食就要多
- 用油少，烹饪方式健康（如蒸、煮、快炒、空气炸锅、凉拌等）
- 食材必须是在大连普通菜市场就能买到的常见食材
- 总预算在10-15元，两个人吃
- 要有饱腹感，能吃饱

${FOOD_RESTRICTIONS}

请严格按照以下JSON格式回复（不要回复其他内容）：
{
  "name": "晚餐组合名（如：番茄炒蛋 + 清炒时蔬 + 米饭）",
  "dishes": [
    {
      "name": "第一道菜名",
      "ingredients": [
        { "name": "食材名", "amount": "用量（克/个/勺等）" }
      ],
      "instructions": ["步骤1", "步骤2", "步骤3"]
    },
    {
      "name": "第二道菜名",
      "ingredients": [
        { "name": "食材名", "amount": "用量（克/个/勺等）" }
      ],
      "instructions": ["步骤1", "步骤2", "步骤3"]
    }
  ],
  "staple": { "name": "主食名（如米饭、馒头、面条等）", "amount": "具体用量" },
  "estimatedCost": 总预算金额数字,
  "tips": "一条烹饪小贴士"
}`

  return callAPI(prompt, 'dinner')
}

async function callAPI(prompt: string, type: 'breakfast' | 'dinner'): Promise<Meal> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位注重健康饮食的家庭厨师。回复必须是有效的JSON格式，不要使用Markdown代码块包裹。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 1536,
      }),
    })

    if (!res.ok) {
      throw new Error(`API 请求失败: ${res.status}`)
    }

    const data: DeepSeekResponse = await res.json()
    const content = data.choices[0].message.content

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('无法解析 AI 返回的菜谱数据')
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Flatten all ingredients for the top-level list
    let allIngredients = parsed.ingredients || []
    if (parsed.dishes) {
      for (const dish of parsed.dishes) {
        allIngredients = allIngredients.concat(dish.ingredients || [])
      }
    }

    return {
      id: generateId(),
      name: parsed.name || '',
      type,
      ingredients: allIngredients,
      instructions: parsed.instructions || [],
      estimatedCost: parsed.estimatedCost || 0,
      tips: parsed.tips || '',
      dishes: (parsed.dishes as MealDish[]) || undefined,
      staple: (parsed.staple as MealStaple) || undefined,
    }
  } catch (error) {
    console.error('生成菜谱失败:', error)
    throw error
  }
}

export async function generateDailyMeals(dateStr: string): Promise<{ breakfast: Meal; dinner: Meal }> {
  const [breakfast, dinner] = await Promise.all([
    generateBreakfast(dateStr),
    generateDinner(dateStr),
  ])
  return { breakfast, dinner }
}
