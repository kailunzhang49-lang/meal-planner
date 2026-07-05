import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
  delay: number
  shape: 'circle' | 'rect' | 'star'
}

const COLORS = [
  '#86b089', '#b0cdb2', '#fbbf24', '#f59e0b',
  '#f472b6', '#818cf8', '#34d399', '#fb923c',
  '#a78bfa', '#2dd4bf',
]

interface ConfettiProps {
  active: boolean
}

export function Confetti({ active }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!active) {
      setParticles([])
      return
    }

    const newParticles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -5 - Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 720 - 360,
      delay: Math.random() * 0.5,
      shape: (['circle', 'rect', 'star'] as const)[Math.floor(Math.random() * 3)],
    }))

    setParticles(newParticles)
  }, [active])

  return (
    <AnimatePresence>
      {active && particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                opacity: 1,
                scale: 0,
                x: `${p.x}vw`,
                y: `${p.y}vh`,
                rotate: 0,
              }}
              animate={{
                opacity: [1, 1, 0],
                scale: [0, 1, 0.8],
                x: `${p.x}vw`,
                y: `${100 + Math.random() * 20}vh`,
                rotate: p.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2 + Math.random() * 1.5,
                delay: p.delay,
                ease: 'easeOut',
              }}
              className="absolute"
              style={{
                left: 0,
                top: 0,
                width: p.size,
                height: p.size,
                borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'star' ? '2px' : '2px',
                backgroundColor: p.color,
                transform: p.shape === 'star' ? 'rotate(45deg)' : undefined,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
