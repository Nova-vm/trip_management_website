import { Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { formatPaise } from '../../lib/splitwise'
import Card from '../ui/Card'

const SPLIT_LABEL = {
  equal: 'Split equally',
  custom_amount: 'Custom amounts',
  custom_percentage: 'Custom percentages',
}

// onDelete is only ever passed in by ExpensesPage for the Owner — see
// ExpensesPage.jsx.
export default function ExpenseCard({ expense, onDelete }) {
  const { members } = useAuth()
  const paidByName = members.find((member) => member.uid === expense.paidBy)?.name ?? 'Unknown'

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{expense.title}</p>
          <p className="text-xs text-slate-500">
            Paid by {paidByName} · {expense.date}
          </p>
        </div>
        <p className="shrink-0 font-display text-sm font-semibold text-sunrise-400">
          {formatPaise(expense.amountInPaise)}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="rounded-full bg-white/5 px-2 py-0.5">{expense.category}</span>
        <span>{SPLIT_LABEL[expense.splitMethod]}</span>
        <span>· {expense.participants.length} people</span>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            title="Delete this expense"
            aria-label="Delete this expense"
            className="ml-auto text-slate-500 transition-colors hover:text-status-disputed"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </Card>
  )
}
