import { motion } from 'framer-motion'

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-0 via-surface-1 to-surface-0" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Ambient glow spots */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] bg-gold-300/10"
        style={{ top: '10%', left: '20%' }}
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] bg-sage-300/10"
        style={{ top: '40%', right: '10%' }}
        animate={{ x: [0, -20, 30, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full blur-[80px] bg-neon-400/5"
        style={{ bottom: '10%', left: '40%' }}
        animate={{ x: [0, 15, -25, 0], y: [0, -15, 5, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: i % 3 === 0 ? 'rgba(217,119,6,0.25)' : i % 3 === 1 ? 'rgba(101,147,104,0.2)' : 'rgba(99,102,241,0.15)',
          }}
          animate={{
            y: [0, -(Math.random() * 30 + 10), 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: Math.random() * 10 + 12,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
