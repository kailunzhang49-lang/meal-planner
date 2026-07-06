import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Key, Utensils, Download, Upload, Check, AlertCircle } from 'lucide-react'
import { getSettings, saveSettings, exportAllData, importAllData } from '../lib/storage'
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
    a.href = url
    a.download = `meal-planner-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        importAllData(ev.target?.result as string)
        setImportError(false)
        setImportMsg('导入成功！数据已恢复。')
        setTimeout(() => setImportMsg(''), 3000)
      } catch {
        setImportError(true)
        setImportMsg('导入失败：文件格式不正确。')
        setTimeout(() => setImportMsg(''), 3000)
      }
    }
    reader.readAsText(file)
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="max-w-lg mx-auto px-5 pb-16">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6 pb-4"
      >
        <h1 className="text-2xl font-bold text-warm-800 tracking-tight">设置</h1>
        <p className="text-sm text-warm-400 mt-1">配置 API、饮食偏好和数据管理</p>
      </motion.div>

      <div className="space-y-5">
        {/* API Key */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass card-ring rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Key size={16} className="text-sage-500" />
            <h2 className="font-semibold text-warm-700">DeepSeek API Key</h2>
          </div>
          <p className="text-xs text-warm-400 mb-3">
            API Key 仅保存在你的浏览器本地，不会上传到任何服务器。
          </p>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
            placeholder="sk-..."
            className="w-full px-4 py-2.5 rounded-xl bg-warm-50 border border-warm-200 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent transition-all"
          />
        </motion.section>

        {/* Food Restrictions */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass card-ring rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Utensils size={16} className="text-sage-500" />
            <h2 className="font-semibold text-warm-700">饮食偏好与限制</h2>
          </div>
          <p className="text-xs text-warm-400 mb-3">
            自定义食材限制，这些规则会在生成菜谱时传递给 AI。
          </p>
          <textarea
            value={settings.foodRestrictions}
            onChange={(e) => setSettings({ ...settings, foodRestrictions: e.target.value })}
            rows={6}
            className="w-full px-4 py-3 rounded-xl bg-warm-50 border border-warm-200 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent transition-all resize-y leading-relaxed"
          />
        </motion.section>

        {/* Budget */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass card-ring rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <SettingsIcon size={16} className="text-sage-500" />
            <h2 className="font-semibold text-warm-700">预算设置</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-warm-500 mb-1 block">早餐预算（元/两人）</label>
              <input
                type="text"
                value={settings.breakfastBudget}
                onChange={(e) => setSettings({ ...settings, breakfastBudget: e.target.value })}
                placeholder="10-15"
                className="w-full px-4 py-2.5 rounded-xl bg-warm-50 border border-warm-200 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-warm-500 mb-1 block">午/晚餐预算（元/两人）</label>
              <input
                type="text"
                value={settings.dinnerBudget}
                onChange={(e) => setSettings({ ...settings, dinnerBudget: e.target.value })}
                placeholder="10-15"
                className="w-full px-4 py-2.5 rounded-xl bg-warm-50 border border-warm-200 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </motion.section>

        {/* Save button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className={cn(
            'w-full py-3 rounded-2xl font-semibold text-base transition-colors',
            saved
              ? 'bg-sage-100 text-sage-600'
              : 'bg-sage-500 text-white hover:bg-sage-600 shadow-md shadow-sage-200/50',
          )}
        >
          {saved ? (
            <span className="flex items-center justify-center gap-2">
              <Check size={18} /> 已保存
            </span>
          ) : (
            '保存设置'
          )}
        </motion.button>

        {/* Data Management */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass card-ring rounded-2xl p-5"
        >
          <h2 className="font-semibold text-warm-700 mb-3">数据管理</h2>
          <p className="text-xs text-warm-400 mb-4">
            导出所有数据用于备份，或从备份文件恢复数据。
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-warm-50 border border-warm-200 text-sm text-warm-600 hover:bg-warm-100 transition-colors"
            >
              <Download size={15} />
              导出数据
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-warm-50 border border-warm-200 text-sm text-warm-600 hover:bg-warm-100 transition-colors"
            >
              <Upload size={15} />
              导入数据
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          {importMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-lg',
                importError ? 'bg-red-50 text-red-600' : 'bg-sage-50 text-sage-600',
              )}
            >
              {importError ? <AlertCircle size={14} /> : <Check size={14} />}
              {importMsg}
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  )
}
