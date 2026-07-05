import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CursorSpotlight() {
  const mouseX = useMotionValue(-200)
  const mouseY = useMotionValue(-200)
  const springX = useSpring(mouseX, { stiffness: 100, damping: 25 })
  const springY = useSpring(mouseY, { stiffness: 100, damping: 25 })
  const isMoving = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 180)
      mouseY.set(e.clientY - 180)
      isMoving.current = true
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        isMoving.current = false
      }, 1500)
    }
    window.addEventListener('mousemove', handleMove)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [mouseX, mouseY])

  return (
    <motion.div
      className="fixed pointer-events-none z-[-5]"
      style={{
        left: springX,
        top: springY,
        width: 360,
        height: 360,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(101, 147, 104, 0.12) 0%, rgba(101, 147, 104, 0.04) 30%, transparent 70%)',
        filter: 'blur(2px)',
      }}
    />
  )
}
