// LOGIC FILE — Firestore wiring for real per-member trip payments (the
// package-total split, who's paid how much, and the Owner's review queue).
// Don't hand-edit unless you're changing how payment tracking works. See
// Read_Me/HOW_TO_MAKE_CHANGES.md -> "Payments" / "Admin".
import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { equalSplit } from './splitwise'
import { useAuth } from '../context/AuthContext'

export function usePayments() {
  const { firebaseUser, activeMembers } = useAuth()
  const [packageTotalPaise, setPackageTotalPaise] = useState(0)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  // Everyone reads the one Owner-set total live — it's what every
  // traveller's expected share below is computed from.
  useEffect(() => {
    if (!firebaseUser) {
      setPackageTotalPaise(0)
      return
    }
    return onSnapshot(doc(db, 'settings', 'payments'), (snap) => {
      setPackageTotalPaise(snap.exists() ? snap.data().packageTotalPaise ?? 0 : 0)
    })
  }, [firebaseUser])

  // One doc per member who has any payment progress — a missing doc just
  // means "hasn't paid/claimed anything yet", handled below, not an error.
  useEffect(() => {
    if (!firebaseUser) {
      setPayments([])
      setLoading(false)
      return
    }
    return onSnapshot(collection(db, 'payments'), (snap) => {
      setPayments(snap.docs.map((d) => ({ uid: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [firebaseUser])

  // The live roster's current size decides everyone's even split — add or
  // remove a traveller on Group/Admin and every share below updates
  // automatically, no re-typing a headcount by hand. Reuses the exact same
  // remainder-safe splitting math Expenses already uses.
  const expectedShares =
    activeMembers.length > 0
      ? equalSplit(packageTotalPaise, activeMembers.map((member) => member.uid))
      : {}

  const paymentsByUid = Object.fromEntries(payments.map((payment) => [payment.uid, payment]))

  const memberPayments = activeMembers.map((member) => {
    const record = paymentsByUid[member.uid]
    return {
      uid: member.uid,
      name: member.name,
      expectedAmountPaise: expectedShares[member.uid] ?? 0,
      amountPaidPaise: record?.amountPaidPaise ?? 0,
      status: record?.status ?? 'pending',
    }
  })

  const totalCollectedPaise = memberPayments.reduce((sum, p) => sum + p.amountPaidPaise, 0)
  const needsReview = memberPayments.filter((p) => p.status === 'under_verification').length

  // Owner-only — also enforced server-side by firestore.rules, so this
  // can't be bypassed by someone editing the frontend JS.
  function setPackageTotal(paise) {
    return setDoc(doc(db, 'settings', 'payments'), { packageTotalPaise: paise }, { merge: true })
  }

  // Owner-only full override — marking someone paid/partially paid, or
  // correcting a mistaken self-report.
  function setMemberPayment(uid, { amountPaidPaise, status }) {
    return setDoc(
      doc(db, 'payments', uid),
      { amountPaidPaise, status, updatedAt: serverTimestamp() },
      { merge: true },
    )
  }

  // Self-only — a member telling the Owner "I've paid my share", which
  // lands them in the review queue as 'under_verification'. They can never
  // write themselves straight to 'paid' — only the Owner's review can do
  // that, enforced the same way server-side.
  function claimPayment(expectedAmountPaise) {
    return setDoc(
      doc(db, 'payments', firebaseUser.uid),
      { amountPaidPaise: expectedAmountPaise, status: 'under_verification', updatedAt: serverTimestamp() },
      { merge: true },
    )
  }

  return {
    packageTotalPaise,
    memberPayments,
    totalCollectedPaise,
    needsReview,
    loading,
    setPackageTotal,
    setMemberPayment,
    claimPayment,
  }
}
