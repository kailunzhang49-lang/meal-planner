import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, Check } from 'lucide-react'
import { cn } from '../lib/utils'
import { SparkleEffect } from './SparkleEffect'

interface GenerateButtonProps {
  onClick: () => void
  loading: boolean
  disabled?: boolean
}

export function GenerateButton({ onClick, loading, disabled }: GenerateButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const [magneticPos, setMagneticPos] = useState({ x: 0, y: 0 })
  const [showSparkle, setShowSparkle] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (loading || disabled) return
    const rect = btnRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3
    setMagneticPos({ x, y })
  }

  const handleMouseLeave = () => {
    setMagneticPos({ x: 0, y: 0 })
  }

  const handleClick = async () => {
    if (loading || disabled) return
    setShowSparkle(true)
    await onClick()
    setShowSparkle(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 1500)
  }

  return (
    <div className="relative">
      <motion.button
        ref={btnRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ x: magneticPos.x, y: magneticPos.y }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        disabled={loading || disabled}
        className={cn(
          'relative overflow-hidden px-8 py-3.5 rounded-2xl font-semibold text-base',
          'bg-sage-500 text-white',
          'shadow-md shadow-sage-200/50',
          'transition-colors duration-200',
          'hover:bg-sage-600 active:bg-sage-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
        style={{ willChange: 'transform' }}
      >
        {/* Background shimmer on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.8 }}
        />

        <span className="relative flex items-center gap-2 justify-center">
          {loading ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 size={20} />
              </motion.span>
              正在生成菜谱...
            </>
          ) : showSuccess ? (
            <motion.span
              className="flex items-center gap-2"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <Check size={20} />
              生成完成
            </motion.span>
          ) : (
            <>
              <Sparkles size={20} />
              生成今日菜谱
            </>
          )}
        </span>

        {/* Loading progress bar */}
        {loading && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-white/40"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 8, ease: 'easeInOut' }}
          />
        )}
      </motion.button>

      <SparkleEffect active={showSparkle} />
    </div>
  )
}
