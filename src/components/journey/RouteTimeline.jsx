import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

// currentIndex < 0 means the trip hasn't started — every stop shows as
// upcoming. This reflects planned progress only; it becomes "actual"
// progress once live GPS sharing exists (Phase 3).
export default function RouteTimeline({ destinations, currentIndex }) {
  return (
    <div className="scrollbar-none overflow-x-auto">
      <div className="flex min-w-max items-center px-1 py-4">
        {destinations.map((name, index) => {
          const state =
            currentIndex < 0
              ? 'upcoming'
              : index < currentIndex
                ? 'completed'
                : index === currentIndex
                  ? 'current'
                  : 'upcoming'

          return (
            <div key={name} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                    state === 'completed'
                      ? 'border-status-completed bg-status-completed/20 text-status-completed'
                      : state === 'current'
                        ? 'border-sunrise-500 bg-sunrise-500/20 text-sunrise-400'
                        : 'border-white/15 bg-navy-800 text-slate-500'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                </motion.div>
                <span
                  className={`w-16 text-center text-[11px] ${
                    state === 'upcoming' ? 'text-slate-500' : 'text-slate-200'
                  }`}
                >
                  {name}
                </span>
              </div>
              {index < destinations.length - 1 && (
                <div className={`h-0.5 w-8 ${index < currentIndex ? 'bg-status-completed' : 'bg-white/10'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
