import { motion, AnimatePresence } from 'framer-motion'
import { Cpu } from 'lucide-react'

interface AiOrbProps {
  active: boolean
  progress?: string
}

export function AiOrb({ active, progress }: AiOrbProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center py-12 gap-6"
        >
          <div className="relative w-32 h-32">
            {/* Outer rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-gold-400/20"
              style={{ animation: 'orb-ring 8s linear infinite' }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border border-sage-400/25"
              style={{ animation: 'orb-ring 6s linear infinite reverse' }}
            />

            {/* Core orb */}
            <motion.div
              className="absolute inset-4 rounded-full"
              style={{
                background: 'radial-gradient(circle at 40% 35%, rgba(245,158,11,0.7), rgba(217,119,6,0.35) 50%, rgba(99,102,241,0.15) 80%, transparent)',
                boxShadow: '0 0 30px rgba(245,158,11,0.25), 0 0 60px rgba(245,158,11,0.1), inset 0 0 20px rgba(245,158,11,0.15)',
              }}
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 30px rgba(245,158,11,0.25), 0 0 60px rgba(245,158,11,0.1)',
                  '0 0 50px rgba(245,158,11,0.4), 0 0 80px rgba(245,158,11,0.15)',
                  '0 0 30px rgba(245,158,11,0.25), 0 0 60px rgba(245,158,11,0.1)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Scan line */}
            <div className="absolute inset-4 rounded-full overflow-hidden">
              <div className="scan-line" />
            </div>

            {/* Center icon */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center backdrop-blur-sm shadow-sm">
                <Cpu size={16} className="text-gold-500" />
              </div>
            </motion.div>

            {/* Orbiting particles */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-gold-400"
                style={{
                  top: '50%', left: '50%',
                  boxShadow: '0 0 4px rgba(245,158,11,0.6)',
                }}
                animate={{
                  x: [0, Math.cos((i * Math.PI) / 2) * 60, 0],
                  y: [0, Math.sin((i * Math.PI) / 2) * 60, 0],
                  scale: [0.5, 1, 0.5],
                  opacity: [0.3, 0.9, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.75, ease: 'easeInOut' }}
              />
            ))}
          </div>

          {/* Progress text */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-ink-2 font-medium">
              {progress || '正在分析食材偏好...'}
            </p>
            <div className="mt-2 flex items-center justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gold-400"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
