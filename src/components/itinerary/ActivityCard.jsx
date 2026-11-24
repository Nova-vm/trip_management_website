import { Clock } from 'lucide-react'
import FallbackImage from '../ui/FallbackImage'
import StatusBadge from '../ui/StatusBadge'

export default function ActivityCard({ activity }) {
  return (
    <div className="flex gap-3 rounded-xl2 bg-navy-800/40 p-3">
      <FallbackImage
        src={activity.imageUrl}
        alt={activity.title}
        className="h-16 w-16 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-white">{activity.title}</p>
          <StatusBadge status={activity.status} />
        </div>
        <p className="mt-0.5 text-xs text-slate-400">{activity.location}</p>
        {activity.plannedStart && (
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3 w-3" /> Planned {activity.plannedStart}
          </p>
        )}
        {activity.optional && (
          <p className="mt-1 text-[11px] font-medium text-sunrise-400">
            Optional · extra charges may apply
          </p>
        )}
        {activity.notes && <p className="mt-1 text-xs text-slate-500">{activity.notes}</p>}
      </div>
    </div>
  )
}
