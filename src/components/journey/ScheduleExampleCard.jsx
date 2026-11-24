import { Clock } from 'lucide-react'
import Card from '../ui/Card'
import { compareSchedule } from '../../lib/dateTime'

const STATUS_LABEL = {
  ahead: { text: 'Ahead of schedule', color: 'text-status-completed' },
  on_time: { text: 'On time', color: 'text-status-completed' },
  delayed: { text: 'Delayed', color: 'text-status-pending' },
  pending: { text: 'Pending', color: 'text-slate-400' },
}

// A worked example straight from the spec, run through the real
// compareSchedule() helper — not live data. Once Phase 3 wires up actual
// departure/arrival timestamps, this same helper drives the real card.
export default function ScheduleExampleCard() {
  const planned = '2026-12-13T09:00:00+05:30'
  const actual = '2026-12-13T09:30:00+05:30'
  const result = compareSchedule(planned, actual)
  const label = STATUS_LABEL[result.status]

  return (
    <Card className="p-4">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        <Clock className="h-3.5 w-3.5" /> Planned vs actual · example
      </p>
      <p className="mt-2 text-sm text-slate-300">Planned: Leave hotel at 9:00 AM</p>
      <p className="text-sm text-slate-300">Actual: Left hotel at 9:30 AM</p>
      <p className={`mt-2 font-display text-sm font-semibold ${label.color}`}>
        {label.text} · {Math.abs(result.diffMinutes)} min {result.diffMinutes >= 0 ? 'behind' : 'ahead'}
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Real departure/arrival times will drive this card once journey tracking is built.
      </p>
    </Card>
  )
}
