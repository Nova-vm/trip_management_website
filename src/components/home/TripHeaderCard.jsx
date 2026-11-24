import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, CalendarDays } from 'lucide-react'
import FallbackImage from '../ui/FallbackImage'
import StatusBadge from '../ui/StatusBadge'
import { getCountdown, getTripPhase, formatDateRange } from '../../lib/dateTime'

export default function TripHeaderCard({ trip }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const countdown = getCountdown(trip, now)
  const phase = getTripPhase(trip, now)

  return (
    <div className="relative overflow-hidden rounded-b-3xl md:rounded-xl2">
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <FallbackImage
          src={trip.coverImage}
          alt={trip.tripName}
          className="h-56 w-full object-cover md:h-64"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="font-display text-2xl font-bold text-white">{trip.tripName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-200">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" /> {formatDateRange(trip.startDate, trip.endDate)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" /> {trip.totalMembers} travellers
          </span>
        </div>
        <div className="mt-3">
          {phase === 'before' && countdown && (
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0px rgba(242,153,74,0.3)',
                  '0 0 16px rgba(242,153,74,0.55)',
                  '0 0 0px rgba(242,153,74,0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur"
            >
              <span className="font-display text-lg font-semibold tabular-nums text-sunrise-400">
                {countdown.days}d {String(countdown.hours).padStart(2, '0')}h{' '}
                {String(countdown.minutes).padStart(2, '0')}m{' '}
                {String(countdown.seconds).padStart(2, '0')}s
              </span>
              <span className="text-xs text-slate-300">to departure</span>
            </motion.div>
          )}
          {phase === 'during' && <StatusBadge status="in_progress" />}
          {phase === 'after' && <StatusBadge status="completed" />}
        </div>
      </div>
    </div>
  )
}
