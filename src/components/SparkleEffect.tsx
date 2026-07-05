import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Sparkle {
  id: number
  x: number
  y: number
  size: number
  color: string
  rotation: number
}

interface SparkleEffectProps {
  active: boolean
  count?: number
}

const COLORS = ['#86b089', '#b0cdb2', '#fbbf24', '#f59e0b', '#34d399']

export function SparkleEffect({ active, count = 12 }: SparkleEffectProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  useEffect(() => {
    if (!active) {
      setSparkles([])
      return
    }

    const newSparkles: Sparkle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      size: Math.random() * 8 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
    }))

    setSparkles(newSparkles)
  }, [active, count])

  return (
    <AnimatePresence>
      {active && sparkles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {sparkles.map((s) => (
            <motion.div
              key={s.id}
              initial={{
                opacity: 1,
                scale: 0,
                x: 0,
                y: 0,
                rotate: 0,
              }}
              animate={{
                opacity: 0,
                scale: 1,
                x: s.x,
                y: s.y,
                rotate: s.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
              }}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: s.size,
                height: s.size,
                backgroundColor: s.color,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
