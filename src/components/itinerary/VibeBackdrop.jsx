import { motion } from 'framer-motion'
import { DAY_VIBES } from './dayVibes'

const POSITIONS = [
  { left: '10%', delay: 0, duration: 7 },
  { left: '30%', delay: 0.8, duration: 8 },
  { left: '55%', delay: 1.4, duration: 6.5 },
  { left: '75%', delay: 0.4, duration: 7.5 },
  { left: '90%', delay: 1.1, duration: 6 },
]

// Ambient, decorative only — floats a few ghost icons behind the active
// DayCard so "today" feels like the day's actual activity (snow drifting,
// water falling) instead of a plain highlighted bar. Skipped on calm
// "travel" days on purpose — see DAY_VIBES.
export default function VibeBackdrop({ vibe }) {
  const config = DAY_VIBES[vibe] ?? DAY_VIBES.default
  if (!config.particles) return null
  const Icon = config.icon

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {POSITIONS.map((pos, index) => (
        <motion.div
          key={index}
          className={`absolute top-0 ${config.accent}`}
          style={{ left: pos.left }}
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 220, opacity: [0, 0.35, 0] }}
          transition={{ duration: pos.duration, repeat: Infinity, delay: pos.delay, ease: 'linear' }}
        >
          <Icon className="h-3.5 w-3.5" />
        </motion.div>
      ))}
    </div>
  )
}
