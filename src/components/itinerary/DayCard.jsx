import { Hotel, Utensils, ArrowRight } from 'lucide-react'
import Card from '../ui/Card'
import ActivityCard from './ActivityCard'
import VibeBackdrop from './VibeBackdrop'
import { DAY_VIBES } from './dayVibes'
import { formatDayDate } from '../../lib/dateTime'

export default function DayCard({ day, isActive }) {
  const vibe = DAY_VIBES[day.vibe] ?? DAY_VIBES.default
  const VibeIcon = vibe.icon

  return (
    <Card className={`relative overflow-hidden p-4 ${isActive ? 'ring-2 ring-sunrise-500' : ''}`}>
      {isActive && <div className={`absolute inset-0 bg-gradient-to-br ${vibe.gradient}`} />}
      {isActive && <VibeBackdrop vibe={day.vibe} />}

      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-mountain-400">
              <span>
                Day {day.dayNumber} · {formatDayDate(day.date)}
              </span>
              <VibeIcon className={`h-3.5 w-3.5 ${vibe.accent}`} />
            </p>
            <p className="mt-0.5 font-display text-base font-semibold text-white">{day.title}</p>
          </div>
          {isActive && (
            <span className="shrink-0 rounded-full bg-sunrise-500/20 px-2.5 py-1 text-xs font-medium text-sunrise-400">
              Today · {vibe.label}
            </span>
          )}
        </div>

        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          {day.startLocation} <ArrowRight className="h-3 w-3" /> {day.endLocation}
        </p>

        {(day.hotel || day.meals) && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
            {day.hotel && (
              <span className="flex items-center gap-1">
                <Hotel className="h-3.5 w-3.5" /> {day.hotel}
              </span>
            )}
            {day.meals && (
              <span className="flex items-center gap-1">
                <Utensils className="h-3.5 w-3.5" /> {day.meals}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-col gap-2">
          {day.activities.map((activity) => (
            <ActivityCard key={activity.activityId} activity={activity} />
          ))}
        </div>
      </div>
    </Card>
  )
}
