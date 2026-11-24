import { useAuth } from '../../context/AuthContext'
import { formatPaise } from '../../lib/splitwise'
import Card from '../ui/Card'
import Avatar from '../ui/Avatar'

export default function BalanceSummaryCard({ balances }) {
  const { activeMembers: members } = useAuth()

  return (
    <Card className="p-4">
      <p className="text-sm font-medium text-white">Member balances</p>
      <div className="mt-3 flex flex-col gap-2">
        {members.map((member) => {
          const balance = balances[member.uid]?.balancePaise ?? 0
          return (
            <div key={member.uid} className="flex items-center gap-3">
              <Avatar name={member.name} size="sm" />
              <p className="flex-1 truncate text-sm text-slate-200">{member.name}</p>
              <p
                className={`font-display text-sm font-semibold ${
                  balance > 0
                    ? 'text-status-completed'
                    : balance < 0
                      ? 'text-status-disputed'
                      : 'text-slate-500'
                }`}
              >
                {balance === 0
                  ? 'Settled'
                  : `${balance > 0 ? '+' : '-'}${formatPaise(Math.abs(balance))}`}
              </p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
