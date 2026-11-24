import { Train } from 'lucide-react'
import { trainTickets } from '../data/mockTrainTickets'
import { useAuth } from '../context/AuthContext'
import { usePayments } from '../lib/usePayments'
import PaymentSummaryCard from '../components/payments/PaymentSummaryCard'
import MemberPaymentRow from '../components/payments/MemberPaymentRow'
import SectionHeading from '../components/ui/SectionHeading'
import Card from '../components/ui/Card'
import StatusBadge from '../components/ui/StatusBadge'
import { formatPaise } from '../lib/splitwise'

export default function PaymentsPage() {
  const { activeMembers } = useAuth()
  const { packageTotalPaise, memberPayments, totalCollectedPaise } = usePayments()

  return (
    <div className="flex flex-col gap-6 px-4 pt-4">
      <div>
        <SectionHeading title="Payments" subtitle="Transport contribution & package status" />
        <PaymentSummaryCard
          title="Transport contribution"
          totalExpectedPaise={packageTotalPaise}
          totalCollectedPaise={totalCollectedPaise}
        />
      </div>

      <div>
        <SectionHeading title="Member-wise status" />
        <div className="flex flex-col gap-2">
          {memberPayments.map((payment) => (
            <MemberPaymentRow key={payment.uid} member={payment} payment={payment} />
          ))}
        </div>
      </div>

      <div>
        <SectionHeading title="Train tickets" />
        <div className="flex flex-col gap-3">
          {trainTickets.map((ticket) => (
            <Card key={ticket.bookingId} className="p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  <Train className="h-4 w-4 text-mountain-400" /> {ticket.trainName}
                </p>
                <StatusBadge status={ticket.paymentStatus} />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {ticket.boardingStation} → {ticket.destinationStation} · {ticket.departureDate} ·{' '}
                {ticket.departureTime}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                PNR {ticket.pnr} — booking status {ticket.bookingStatus.replace('_', ' ')}, to be
                confirmed against the voucher.
              </p>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-4">
        <p className="text-sm font-medium text-white">Package total</p>
        <p className="mt-2 text-xs text-slate-400">
          Quoted total {formatPaise(packageTotalPaise)} · Collected so far{' '}
          {formatPaise(totalCollectedPaise)} · Balance{' '}
          {formatPaise(packageTotalPaise - totalCollectedPaise)}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Split evenly across all {activeMembers.length} active traveller
          {activeMembers.length === 1 ? '' : 's'} right now — see your own share and report a
          payment from Profile.
        </p>
      </Card>
    </div>
  )
}
