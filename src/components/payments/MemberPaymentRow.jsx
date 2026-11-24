import Avatar from '../ui/Avatar'
import StatusBadge from '../ui/StatusBadge'
import { formatPaise } from '../../lib/splitwise'

export default function MemberPaymentRow({ member, payment }) {
  return (
    <div className="flex items-center gap-3 rounded-xl2 bg-navy-800/40 p-3">
      <Avatar name={member?.name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{member?.name}</p>
        <p className="text-xs text-slate-500">
          {formatPaise(payment.amountPaidPaise)} / {formatPaise(payment.expectedAmountPaise)}
        </p>
      </div>
      <StatusBadge status={payment.status} />
    </div>
  )
}
