import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useExpenses } from '../lib/useExpenses'
import { computeBalances, suggestSettlements, formatPaise } from '../lib/splitwise'
import SectionHeading from '../components/ui/SectionHeading'
import Card from '../components/ui/Card'
import ExpenseCard from '../components/expenses/ExpenseCard'
import BalanceSummaryCard from '../components/expenses/BalanceSummaryCard'
import SettlementSuggestions from '../components/expenses/SettlementSuggestions'
import AddExpenseModal from '../components/expenses/AddExpenseModal'

export default function ExpensesPage() {
  const { members, isOwner } = useAuth()
  const { expenses, addExpense, deleteExpense } = useExpenses()
  const [modalOpen, setModalOpen] = useState(false)

  const memberIds = members.map((member) => member.uid)
  const balances = computeBalances(expenses, memberIds)
  const settlements = suggestSettlements(balances)
  const totalSpentPaise = expenses.reduce((sum, expense) => sum + expense.amountInPaise, 0)

  // Owner-only — see firestore.rules' `expenses` match block, which enforces
  // this same restriction server-side, not just by hiding the button here.
  function handleDeleteExpense(expense) {
    const ok = window.confirm(
      `Delete "${expense.title}" (${formatPaise(expense.amountInPaise)})? This can't be undone — if it just needs fixing, delete it and have the right person re-add it correctly.`,
    )
    if (!ok) return
    deleteExpense(expense.expenseId).catch(() => {
      window.alert('Could not delete it — make sure the latest firestore.rules has been published in the Firebase console.')
    })
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-4">
      <div>
        <SectionHeading
          title="Expenses"
          subtitle="Splitwise-style shared spending"
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-sunrise-500 px-3 py-1.5 text-xs font-medium text-navy-900"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Add
            </button>
          }
        />
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total group spend</p>
          <p className="mt-1 font-display text-2xl font-semibold text-white">
            {formatPaise(totalSpentPaise)}
          </p>
        </Card>
      </div>

      <BalanceSummaryCard balances={balances} />
      <SettlementSuggestions settlements={settlements} />

      <div>
        <SectionHeading title="All expenses" />
        {expenses.length === 0 ? (
          <Card className="p-4 text-center text-sm text-slate-500">
            No expenses yet — add the first one with the button above.
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.expenseId}
                expense={expense}
                onDelete={isOwner ? () => handleDeleteExpense(expense) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <AddExpenseModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={addExpense} />
    </div>
  )
}
