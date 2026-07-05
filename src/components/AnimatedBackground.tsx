import { motion } from 'framer-motion'

const blobs = [
  { color: 'bg-sage-300/20', size: 'w-72 h-72', x: '-10%', y: '-10%', duration: 20 },
  { color: 'bg-amber-200/15', size: 'w-96 h-96', x: '60%', y: '20%', duration: 25 },
  { color: 'bg-emerald-300/15', size: 'w-80 h-80', x: '30%', y: '50%', duration: 22 },
  { color: 'bg-teal-200/15', size: 'w-64 h-64', x: '80%', y: '70%', duration: 18 },
  { color: 'bg-yellow-200/10', size: 'w-56 h-56', x: '-5%', y: '40%', duration: 28 },
]

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  delay: Math.random() * 5,
  duration: Math.random() * 10 + 15,
  opacity: Math.random() * 0.3 + 0.1,
}))

// Floating food emojis
const foodEmojis = [
  { emoji: '🥬', x: 5, y: 15, size: 'text-xl', delay: 0, duration: 18 },
  { emoji: '🍅', x: 85, y: 25, size: 'text-lg', delay: 2, duration: 20 },
  { emoji: '🥕', x: 15, y: 65, size: 'text-xl', delay: 4, duration: 22 },
  { emoji: '🍚', x: 75, y: 75, size: 'text-lg', delay: 1, duration: 19 },
  { emoji: '🥚', x: 50, y: 85, size: 'text-base', delay: 3, duration: 21 },
  { emoji: '🧄', x: 90, y: 55, size: 'text-sm', delay: 5, duration: 23 },
  { emoji: '🫑', x: 30, y: 35, size: 'text-lg', delay: 6, duration: 17 },
  { emoji: '🍄', x: 65, y: 10, size: 'text-base', delay: 2, duration: 24 },
]

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Large floating blobs */}
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${blob.color} ${blob.size}`}
          style={{ left: blob.x, top: blob.y }}
          animate={{
            x: [0, 40, -20, 30, 0],
            y: [0, -30, 20, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #374d39 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating food emojis */}
      {foodEmojis.map((item, i) => (
        <motion.div
          key={`emoji-${i}`}
          className={`absolute ${item.size} opacity-[0.15]`}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            rotate: [0, 10, -5, 8, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: 'easeInOut',
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Tiny floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-sage-400/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [p.opacity, p.opacity + 0.1, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Subtle gradient lines */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage-300/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage-300/20 to-transparent" />
      </div>
    </div>
  )
}
