import { formatPaise } from '../../lib/splitwise'
import ProgressBar from '../ui/ProgressBar'
import Card from '../ui/Card'

export default function PaymentSummaryCard({ title, totalExpectedPaise, totalCollectedPaise, deadline }) {
  const pendingPaise = totalExpectedPaise - totalCollectedPaise

  return (
    <Card className="p-4">
      <p className="text-sm font-medium text-white">{title}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="font-display text-base font-semibold text-white">{formatPaise(totalExpectedPaise)}</p>
          <p className="text-[11px] text-slate-500">Total</p>
        </div>
        <div>
          <p className="font-display text-base font-semibold text-status-completed">
            {formatPaise(totalCollectedPaise)}
          </p>
          <p className="text-[11px] text-slate-500">Collected</p>
        </div>
        <div>
          <p className="font-display text-base font-semibold text-status-pending">
            {formatPaise(pendingPaise)}
          </p>
          <p className="text-[11px] text-slate-500">Pending</p>
        </div>
      </div>
      <ProgressBar value={totalCollectedPaise} max={totalExpectedPaise} className="mt-3" />
      {deadline && <p className="mt-2 text-xs text-slate-500">Deadline: {deadline}</p>}
    </Card>
  )
}
