import { Wallet, Receipt, LogOut, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useExpenses } from '../lib/useExpenses'
import { usePayments } from '../lib/usePayments'
import { computeBalances, formatPaise } from '../lib/splitwise'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import SectionHeading from '../components/ui/SectionHeading'
import StatusBadge from '../components/ui/StatusBadge'

const ROLE_LABEL = { owner: 'Owner', coordinator: 'Coordinator', member: 'Member' }

export default function ProfilePage() {
  const { firebaseUser, profile, activeMembers, logOut } = useAuth()
  const { expenses } = useExpenses()
  const { memberPayments, claimPayment } = usePayments()

  const myPayment = memberPayments.find((payment) => payment.uid === firebaseUser?.uid) ?? {
    expectedAmountPaise: 0,
    amountPaidPaise: 0,
    status: 'pending',
  }

  const memberIds = activeMembers.map((member) => member.uid)
  const balances = computeBalances(expenses, memberIds)
  const myBalance = balances[firebaseUser?.uid]?.balancePaise ?? 0

  function handleClaim() {
    claimPayment(myPayment.expectedAmountPaise).catch(() => {
      window.alert('Could not report this — make sure the latest firestore.rules has been published in the Firebase console.')
    })
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-4">
      <SectionHeading title="Profile" />

      <Card className="flex flex-col items-center gap-2 p-6 text-center">
        <Avatar name={profile?.name ?? 'Member'} size="lg" />
        <p className="font-display text-lg font-semibold text-white">{profile?.name ?? 'Member'}</p>
        <p className="text-sm text-slate-400">{ROLE_LABEL[profile?.role] ?? 'Member'}</p>
        <p className="text-xs text-slate-500">{profile?.email}</p>
      </Card>

      <Card className="p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-white">
          <Wallet className="h-4 w-4 text-mountain-400" /> Transport payment
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Your even share of the package total the Owner set on Admin.
        </p>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-display text-lg font-semibold text-white">
            {formatPaise(myPayment.amountPaidPaise)} / {formatPaise(myPayment.expectedAmountPaise)}
          </p>
          <StatusBadge status={myPayment.status} />
        </div>
        {myPayment.status === 'pending' && (
          <button
            type="button"
            onClick={handleClaim}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-mountain-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-mountain-400"
          >
            <CheckCircle2 className="h-4 w-4" /> I've paid my share
          </button>
        )}
        {myPayment.status === 'under_verification' && (
          <p className="mt-3 text-xs text-slate-500">Waiting for the Owner to confirm this.</p>
        )}
      </Card>

      <Card className="p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-white">
          <Receipt className="h-4 w-4 text-mountain-400" /> Shared expenses balance
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Positive means the group owes you; negative means you owe the group. Full breakdown and
          settle-up suggestions are on Expenses.
        </p>
        <p
          className={`mt-3 font-display text-lg font-semibold ${
            myBalance > 0
              ? 'text-status-completed'
              : myBalance < 0
                ? 'text-status-disputed'
                : 'text-slate-500'
          }`}
        >
          {myBalance === 0 ? 'Settled' : `${myBalance > 0 ? '+' : '-'}${formatPaise(Math.abs(myBalance))}`}
        </p>
      </Card>

      <button
        type="button"
        onClick={logOut}
        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </div>
  )
}
