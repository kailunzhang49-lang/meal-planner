export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-0 via-surface-1 to-surface-0" />

      {/* Subtle grid - static, no animation */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Static ambient glow - no animation, much lighter */}
      <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] bg-gold-300/8 top-[10%] left-[20%]" />
      <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] bg-sage-300/8 top-[40%] right-[10%]" />

      {/* CSS-animated particles (runs on compositor thread, not JS) */}
      <div className="bg-particles" />
    </div>
  )
}
