import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
  return `${month}月${day}日 ${weekDay}`
}

export function formatShortDate(dateStr: string): string {
  const date = parseDate(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date())
}

/** Feature 10: 当前季节 */
export function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return '春季'
  if (month >= 6 && month <= 8) return '夏季'
  if (month >= 9 && month <= 11) return '秋季'
  return '冬季'
}

/** Feature 4: 获取指定日期所在周的7天 (周一开始) */
export function getWeekDates(dateStr: string): string[] {
  const date = parseDate(dateStr)
  const day = date.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + mondayOffset)
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(formatDate(d))
  }
  return dates
}

export function getWeekLabel(dateStr: string): string {
  const dates = getWeekDates(dateStr)
  return `${formatShortDate(dates[0])} - ${formatShortDate(dates[6])}`
}
