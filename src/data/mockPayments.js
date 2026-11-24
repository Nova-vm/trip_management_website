import { members } from './mockMembers'

// EDIT HERE — per-member transport payment amounts/status shown on
// Payments and Profile. STATUSES below sets which demo state each member
// starts in; totalExpectedPaise/totalCollectedPaise drive the progress bar.
// Guide: Read_Me/HOW_TO_MAKE_CHANGES.md -> "Payments"
//
// Illustrative placeholder amounts only — NOT derived from the real
// package total (₹1,13,500), per the spec's explicit instruction not to
// auto-split package financials until allocation is confirmed. This data
// exists purely to demo every payment-status state in the UI.
const STATUSES = ['paid', 'pending', 'under_verification', 'partially_paid']

export const transportPaymentSummary = {
  totalExpectedPaise: 11 * 1000000, // ₹1,10,000 illustrative total
  totalCollectedPaise: 6 * 1000000,
  paymentDeadline: '2026-12-01',
}

export const memberPayments = members.map((member, index) => {
  const status = STATUSES[index % STATUSES.length]
  const expectedAmountPaise = 1000000 // ₹10,000 illustrative, per traveller
  const amountPaidPaise =
    status === 'paid'
      ? expectedAmountPaise
      : status === 'partially_paid'
        ? expectedAmountPaise / 2
        : 0

  return {
    paymentId: `pay-${member.userId}`,
    memberId: member.userId,
    category: 'transport',
    expectedAmountPaise,
    amountPaidPaise,
    status,
    paymentDate: status === 'paid' ? '2026-11-05' : null,
    approvedBy: status === 'paid' ? 'u1' : null,
  }
})
