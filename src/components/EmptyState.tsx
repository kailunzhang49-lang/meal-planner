import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className,
      )}
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="mb-5 text-warm-300"
      >
        {icon}
      </motion.div>
      <h3 className="text-lg font-semibold text-warm-600 mb-1.5">{title}</h3>
      <p className="text-sm text-warm-400 max-w-xs leading-relaxed">{description}</p>
    </motion.div>
  )
}
