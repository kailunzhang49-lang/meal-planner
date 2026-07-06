import type { Meal, MealDish, MealStaple } from '../types'
import { generateId, getCurrentSeason } from './utils'
import { getSettings, getRecentPlans } from './storage'

const API_URL = 'https://api.deepseek.com/chat/completions'

function getApiKey(): string {
  return getSettings().apiKey
}

function getFoodRestrictions(): string {
  return getSettings().foodRestrictions
}

function getBudget(mealType: 'breakfast' | 'lunch' | 'dinner'): string {
  const settings = getSettings()
  if (mealType === 'breakfast') return settings.breakfastBudget
  return settings.dinnerBudget
}

function getServings(): number {
  return getSettings().servings || 2
}

/** Feature 1: 构建最近菜谱上下文，用于去重 */
function buildRecentMealsContext(): string {
  const recent = getRecentPlans(5)
  if (recent.length === 0) return ''
  const lines = recent.map((p) => {
    const meals = [p.breakfast.name]
    if (p.lunch) meals.push(p.lunch.name)
    meals.push(p.dinner.name)
    return `${p.date}: ${meals.join('、')}`
  })
  return `\n\n【最近${recent.length}天的菜谱 - 请避免重复以下菜式】\n${lines.join('\n')}`
}

/** Feature 10: 季节上下文 */
function buildSeasonContext(): string {
  const season = getCurrentSeason()
  const tips: Record<string, string> = {
    '春季': '春季适合吃时令蔬菜（韭菜、菠菜、春笋等），清淡为主',
    '夏季': '夏季适合凉拌、清爽的菜（黄瓜、西红柿、绿豆汤等），少油少腻',
    '秋季': '秋季适合润燥的菜（莲藕、南瓜、银耳等），可以适当进补',
    '冬季': '冬季适合炖煮、暖身的菜（白菜、萝卜、羊肉等），可以多喝汤',
  }
  return `\n\n现在是${season}，${tips[season] || ''}，请根据时令推荐食材。`
}

function buildCommonContext(): string {
  return buildSeasonContext() + buildRecentMealsContext()
}

function servingsText(): string {
  const s = getServings()
  return s === 2 ? '两个人吃' : `${s}个人吃，请相应调整食材用量和预算`
}

/** 早餐 */
export async function generateBreakfast(dateStr: string, onToken?: (t: string) => void): Promise<Meal> {
  const budget = getBudget('breakfast')
  const prompt = `你是一位生活在辽宁大连的家庭厨师，擅长做少油清爽的家常菜。

请为早餐设计一道"可提前备好、早上只需5-6分钟就能吃上"的菜品，要求：

【关键要求】
- 食材可以前一晚预处理（比如提前切好、提前泡好、提前腌好），早上只需要简单加热/煮/蒸/组装
- 早上实际动手时间不超过5-6分钟
- 必须有主食（馒头、花卷、米饭、面条、饼、粥、面包、包子等），给出具体用量
- 用油少，烹饪方式健康
- 食材必须是在大连普通菜市场就能买到的常见食材
- 预算是${budget}元（包含主食），${servingsText()}
- 要有饱腹感，能吃饱
${getFoodRestrictions()}${buildCommonContext()}

请严格按照以下JSON格式回复（不要回复其他内容）：
{
  "name": "早餐菜名",
  "ingredients": [{ "name": "食材名", "amount": "用量" }],
  "instructions": ["前一晚准备：xxx", "早上（5分钟）：xxx"],
  "staple": { "name": "主食名", "amount": "具体用量" },
  "estimatedCost": 预算数字,
  "tips": "一条让早上更快更方便的小贴士",
  "cookingTime": 总烹饪时间（分钟，数字）
}`
  return callAPI(prompt, 'breakfast', onToken)
}

/** 午餐 */
export async function generateLunch(dateStr: string, onToken?: (t: string) => void): Promise<Meal> {
  const budget = getBudget('dinner')
  const prompt = `你是一位生活在辽宁大连的家庭厨师，擅长做少油清爽的家常菜。

请为午餐设计"一道菜 + 一份主食"的组合，要求：

【关键要求】
- 一道简单快手的菜，30分钟内能做好，${servingsText()}
- 给出独立的食材清单和做法步骤
- 必须有主食，给出具体用量
- 用油少，烹饪方式健康
- 食材必须是大连普通菜市场就能买到的常见食材
- 总预算在${budget}元
- 要有饱腹感，能吃饱
${getFoodRestrictions()}${buildCommonContext()}

请严格按照以下JSON格式回复（不要回复其他内容）：
{
  "name": "午餐组合名",
  "ingredients": [{ "name": "食材名", "amount": "用量" }],
  "instructions": ["步骤1", "步骤2"],
  "staple": { "name": "主食名", "amount": "具体用量" },
  "estimatedCost": 总预算数字,
  "tips": "一条烹饪小贴士",
  "cookingTime": 总烹饪时间（分钟，数字）
}`
  return callAPI(prompt, 'lunch', onToken)
}

/** 晚餐 */
export async function generateDinner(dateStr: string, onToken?: (t: string) => void): Promise<Meal> {
  const budget = getBudget('dinner')
  const prompt = `你是一位生活在辽宁大连的家庭厨师，擅长做少油清爽的家常菜。

请为晚餐设计"两道菜 + 一份主食"的组合，要求：

【关键要求】
- 必须有两道菜，搭配合理（如一荤一素、一炒一拌、一菜一汤等），${servingsText()}
- 每道菜给出独立的食材清单和做法步骤
- 必须有主食，给出具体用量
- 主食用量要考虑菜量
- 用油少，烹饪方式健康
- 食材必须是大连普通菜市场就能买到的常见食材
- 总预算在${budget}元
- 要有饱腹感
${getFoodRestrictions()}${buildCommonContext()}

请严格按照以下JSON格式回复（不要回复其他内容）：
{
  "name": "晚餐组合名",
  "dishes": [
    { "name": "第一道菜名", "ingredients": [{ "name": "食材名", "amount": "用量" }], "instructions": ["步骤1", "步骤2"] },
    { "name": "第二道菜名", "ingredients": [{ "name": "食材名", "amount": "用量" }], "instructions": ["步骤1", "步骤2"] }
  ],
  "staple": { "name": "主食名", "amount": "具体用量" },
  "estimatedCost": 总预算数字,
  "tips": "一条烹饪小贴士",
  "cookingTime": 总烹饪时间（分钟，数字）
}`
  return callAPI(prompt, 'dinner', onToken)
}

/** Feature 7: 流式输出 + 普通输出 */
async function callAPI(
  prompt: string,
  type: 'breakfast' | 'lunch' | 'dinner',
  onToken?: (token: string) => void,
): Promise<Meal> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('请先在「设置」页面配置 DeepSeek API Key')
  }

  const stream = !!onToken

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位注重健康饮食的家庭厨师。回复必须是有效的JSON格式，不要使用Markdown代码块包裹。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 1536,
        stream,
      }),
    })

    if (!res.ok) throw new Error(`API 请求失败: ${res.status}`)

    let content = ''

    if (stream && res.body) {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content || ''
            if (delta) {
              content += delta
              onToken!(content)
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } else {
      const data = await res.json()
      content = data.choices[0].message.content
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('无法解析 AI 返回的菜谱数据')

    const parsed = JSON.parse(jsonMatch[0])

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
      cookingTime: parsed.cookingTime || undefined,
    }
  } catch (error) {
    console.error('生成菜谱失败:', error)
    throw error
  }
}

/** 流式生成三餐 (sequential, each card appears as completed) */
export async function generateDailyMealsStream(
  dateStr: string,
  onMealReady: (meal: Meal, type: 'breakfast' | 'lunch' | 'dinner') => void,
  onProgress?: (text: string) => void,
): Promise<{ breakfast: Meal; lunch: Meal; dinner: Meal }> {
  onProgress?.('正在生成早餐...')
  const breakfast = await generateBreakfast(dateStr, onProgress)
  onMealReady(breakfast, 'breakfast')

  onProgress?.('正在生成午餐...')
  const lunch = await generateLunch(dateStr, onProgress)
  onMealReady(lunch, 'lunch')

  onProgress?.('正在生成晚餐...')
  const dinner = await generateDinner(dateStr, onProgress)
  onMealReady(dinner, 'dinner')

  return { breakfast, lunch, dinner }
}

/** 并行生成（保留旧接口） */
export async function generateDailyMeals(dateStr: string): Promise<{ breakfast: Meal; lunch: Meal; dinner: Meal }> {
  const [breakfast, lunch, dinner] = await Promise.all([
    generateBreakfast(dateStr),
    generateLunch(dateStr),
    generateDinner(dateStr),
  ])
  return { breakfast, lunch, dinner }
}
