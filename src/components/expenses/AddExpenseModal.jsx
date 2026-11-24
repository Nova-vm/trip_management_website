import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { expenseCategories } from '../../data/mockExpenses'

export default function AddExpenseModal({ open, onClose, onSave }) {
  const { activeMembers: members, firebaseUser } = useAuth()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(expenseCategories[0])
  const [paidBy, setPaidBy] = useState(firebaseUser?.uid ?? '')
  const [participantIds, setParticipantIds] = useState(members.map((m) => m.uid))

  if (!open) return null

  function toggleParticipant(uid) {
    setParticipantIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid],
    )
  }

  function handleSubmit(event) {
    event.preventDefault()
    const amountInPaise = Math.round(parseFloat(amount || '0') * 100)
    const payer = paidBy || firebaseUser?.uid
    if (!title.trim() || amountInPaise <= 0 || participantIds.length === 0 || !payer) return

    onSave({
      title: title.trim(),
      amountInPaise,
      category,
      paidBy: payer,
      participants: participantIds,
      splitMethod: 'equal',
      shares: null,
      date: new Date().toISOString().slice(0, 10),
      notes: null,
    })

    setTitle('')
    setAmount('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-0 sm:items-center sm:px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-t-2xl bg-navy-800 p-5 sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-semibold text-white">Add expense</p>
          <button type="button" onClick={onClose} className="text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What was it for?"
            className="rounded-xl2 border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sunrise-500"
          />

          <div className="flex gap-3">
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount (₹)"
              className="w-1/2 rounded-xl2 border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sunrise-500"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-1/2 rounded-xl2 border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sunrise-500"
            >
              {expenseCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-1.5 text-xs text-slate-500">Paid by</p>
            <select
              value={paidBy}
              onChange={(event) => setPaidBy(event.target.value)}
              className="w-full rounded-xl2 border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sunrise-500"
            >
              {members.map((member) => (
                <option key={member.uid} value={member.uid}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-1.5 text-xs text-slate-500">Split equally between</p>
            <div className="flex flex-wrap gap-1.5">
              {members.map((member) => (
                <button
                  type="button"
                  key={member.uid}
                  onClick={() => toggleParticipant(member.uid)}
                  className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                    participantIds.includes(member.uid)
                      ? 'bg-sunrise-500 text-navy-900'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {member.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-5 w-full rounded-xl2 bg-sunrise-500 py-2.5 text-sm font-semibold text-navy-900"
        >
          Save expense
        </button>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          Saved for real now — synced instantly to everyone via Firebase.
        </p>
      </form>
    </div>
  )
}
