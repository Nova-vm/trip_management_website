import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { formatPaise } from '../../lib/splitwise'
import Card from '../ui/Card'
import EmptyState from '../ui/EmptyState'

export default function SettlementSuggestions({ settlements }) {
  const { members } = useAuth()
  const nameFor = (uid) => members.find((member) => member.uid === uid)?.name ?? 'Unknown'

  if (settlements.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="All settled up"
        description="No payments needed — every balance nets to zero."
      />
    )
  }

  return (
    <Card className="p-4">
      <p className="text-sm font-medium text-white">Suggested settlements</p>
      <div className="mt-3 flex flex-col gap-2.5">
        {settlements.map((settlement, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-slate-200">
            <span className="truncate">{nameFor(settlement.fromUser)}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{nameFor(settlement.toUser)}</span>
            <span className="ml-auto shrink-0 font-display font-semibold text-sunrise-400">
              {formatPaise(settlement.amountInPaise)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
