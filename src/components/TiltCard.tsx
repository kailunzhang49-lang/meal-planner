import { useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '../lib/utils'

interface TiltCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function TiltCard({ children, className, glowColor = 'rgba(217, 119, 6, 0.15)' }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const springX = useSpring(mouseX, { stiffness: 200, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 200, damping: 20 })

  const rotateX = useTransform(springY, [0, 1], [6, -6])
  const rotateY = useTransform(springX, [0, 1], [-6, 6])
  const glowX = useTransform(springX, [0, 1], ['0%', '100%'])
  const glowY = useTransform(springY, [0, 1], ['0%', '100%'])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); mouseX.set(0.5); mouseY.set(0.5) }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={cn('relative', className)}
    >
      <motion.div
        className="absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glowX} ${glowY}, ${glowColor}, transparent 60%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />
      {isHovered && (
        <motion.div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(217,119,6,0.08) 45%, rgba(217,119,6,0.12) 50%, transparent 55%)',
              x: '-100%',
            }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  )
}
