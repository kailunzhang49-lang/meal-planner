import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Key, Utensils, Download, Upload, Check, AlertCircle, Users, Moon, Sun } from 'lucide-react'
import { getSettings, saveSettings, exportAllData, importAllData, setLastBackupTime } from '../lib/storage'
import type { UserSettings } from '../types'
import { cn } from '../lib/utils'

export function Settings() {
  const [settings, setSettings] = useState<UserSettings>(getSettings)
  const [saved, setSaved] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const [importError, setImportError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `meal-planner-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click()
    URL.revokeObjectURL(url)
    setLastBackupTime()
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        importAllData(ev.target?.result as string)
        setImportError(false); setImportMsg('导入成功！数据已恢复。')
        setTimeout(() => setImportMsg(''), 3000)
      } catch {
        setImportError(true); setImportMsg('导入失败：文件格式不正确。')
        setTimeout(() => setImportMsg(''), 3000)
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const toggleDarkMode = () => {
    const next = !settings.darkMode
    setSettings({ ...settings, darkMode: next })
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <div className="max-w-lg mx-auto px-5 pb-16">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 pb-4">
        <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100 tracking-tight">设置</h1>
        <p className="text-sm text-warm-400 dark:text-warm-500 mt-1">配置 API、饮食偏好和数据管理</p>
      </motion.div>

      <div className="space-y-5">
        {/* API Key */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass card-ring rounded-2xl p-5 dark:bg-warm-800/50 dark:border-warm-700/40">
          <div className="flex items-center gap-2 mb-3">
            <Key size={16} className="text-sage-500" />
            <h2 className="font-semibold text-warm-700 dark:text-warm-200">DeepSeek API Key</h2>
          </div>
          <p className="text-xs text-warm-400 dark:text-warm-500 mb-3">API Key 仅保存在你的浏览器本地，不会上传到任何服务器。</p>
          <input type="password" value={settings.apiKey} onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })} placeholder="sk-..."
            className="w-full px-4 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-700/50 border border-warm-200 dark:border-warm-600 text-sm text-warm-700 dark:text-warm-200 placeholder:text-warm-300 dark:placeholder:text-warm-500 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent transition-all" />
        </motion.section>

        {/* Servings (Feature 6) */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass card-ring rounded-2xl p-5 dark:bg-warm-800/50 dark:border-warm-700/40">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-sage-500" />
            <h2 className="font-semibold text-warm-700 dark:text-warm-200">用餐人数</h2>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setSettings({ ...settings, servings: n })}
                className={cn('flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  settings.servings === n ? 'bg-sage-500 text-white' : 'bg-warm-50 dark:bg-warm-700/50 text-warm-600 dark:text-warm-300 border border-warm-200 dark:border-warm-600')}>
                {n}人
              </button>
            ))}
          </div>
        </motion.section>

        {/* Dark Mode (Feature 12) */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass card-ring rounded-2xl p-5 dark:bg-warm-800/50 dark:border-warm-700/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.darkMode ? <Moon size={16} className="text-sage-500" /> : <Sun size={16} className="text-amber-500" />}
              <h2 className="font-semibold text-warm-700 dark:text-warm-200">暗色模式</h2>
            </div>
            <button onClick={toggleDarkMode}
              className={cn('w-12 h-6 rounded-full transition-colors relative',
                settings.darkMode ? 'bg-sage-500' : 'bg-warm-300 dark:bg-warm-600')}>
              <motion.div animate={{ x: settings.darkMode ? 24 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow" />
            </button>
          </div>
        </motion.section>

        {/* Food Restrictions */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass card-ring rounded-2xl p-5 dark:bg-warm-800/50 dark:border-warm-700/40">
          <div className="flex items-center gap-2 mb-3">
            <Utensils size={16} className="text-sage-500" />
            <h2 className="font-semibold text-warm-700 dark:text-warm-200">饮食偏好与限制</h2>
          </div>
          <p className="text-xs text-warm-400 dark:text-warm-500 mb-3">自定义食材限制，这些规则会在生成菜谱时传递给 AI。</p>
          <textarea value={settings.foodRestrictions} onChange={(e) => setSettings({ ...settings, foodRestrictions: e.target.value })} rows={6}
            className="w-full px-4 py-3 rounded-xl bg-warm-50 dark:bg-warm-700/50 border border-warm-200 dark:border-warm-600 text-sm text-warm-700 dark:text-warm-200 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent transition-all resize-y leading-relaxed" />
        </motion.section>

        {/* Budget */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass card-ring rounded-2xl p-5 dark:bg-warm-800/50 dark:border-warm-700/40">
          <div className="flex items-center gap-2 mb-3">
            <SettingsIcon size={16} className="text-sage-500" />
            <h2 className="font-semibold text-warm-700 dark:text-warm-200">预算设置</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-warm-500 dark:text-warm-400 mb-1 block">早餐预算（元）</label>
              <input type="text" value={settings.breakfastBudget} onChange={(e) => setSettings({ ...settings, breakfastBudget: e.target.value })} placeholder="10-15"
                className="w-full px-4 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-700/50 border border-warm-200 dark:border-warm-600 text-sm text-warm-700 dark:text-warm-200 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-sage-300 transition-all" />
            </div>
            <div>
              <label className="text-xs text-warm-500 dark:text-warm-400 mb-1 block">午/晚餐预算（元）</label>
              <input type="text" value={settings.dinnerBudget} onChange={(e) => setSettings({ ...settings, dinnerBudget: e.target.value })} placeholder="10-15"
                className="w-full px-4 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-700/50 border border-warm-200 dark:border-warm-600 text-sm text-warm-700 dark:text-warm-200 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-sage-300 transition-all" />
            </div>
          </div>
        </motion.section>

        {/* Save */}
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave}
          className={cn('w-full py-3 rounded-2xl font-semibold text-base transition-colors',
            saved ? 'bg-sage-100 dark:bg-sage-900/40 text-sage-600 dark:text-sage-400' : 'bg-sage-500 text-white hover:bg-sage-600 shadow-md shadow-sage-200/50')}>
          {saved ? <span className="flex items-center justify-center gap-2"><Check size={18} /> 已保存</span> : '保存设置'}
        </motion.button>

        {/* Data Management */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass card-ring rounded-2xl p-5 dark:bg-warm-800/50 dark:border-warm-700/40">
          <h2 className="font-semibold text-warm-700 dark:text-warm-200 mb-3">数据管理</h2>
          <p className="text-xs text-warm-400 dark:text-warm-500 mb-4">导出所有数据用于备份，或从备份文件恢复数据。</p>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-700/50 border border-warm-200 dark:border-warm-600 text-sm text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-600/50 transition-colors">
              <Download size={15} />导出数据
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-warm-50 dark:bg-warm-700/50 border border-warm-200 dark:border-warm-600 text-sm text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-600/50 transition-colors">
              <Upload size={15} />导入数据
            </motion.button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
          {importMsg && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className={cn('mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-lg',
                importError ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-sage-50 dark:bg-sage-900/20 text-sage-600 dark:text-sage-400')}>
              {importError ? <AlertCircle size={14} /> : <Check size={14} />}
              {importMsg}
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  )
}
