// LOGIC FILE — Firestore wiring for the Expenses page. Don't hand-edit
// unless you're changing how expenses are saved/loaded. The splitting
// maths itself still lives in src/lib/splitwise.js, untouched by this file.
import { useEffect, useState } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from '../context/AuthContext'

export function useExpenses() {
  const { firebaseUser } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  // Live list of every expense, newest first — updates for everyone the
  // instant anyone adds one, same live-roster pattern as AuthContext's
  // member list.
  useEffect(() => {
    if (!firebaseUser) {
      setExpenses([])
      return
    }
    const expensesQuery = query(collection(db, 'expenses'), orderBy('date', 'desc'))
    return onSnapshot(expensesQuery, (snap) => {
      setExpenses(snap.docs.map((d) => ({ expenseId: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [firebaseUser])

  async function addExpense(expense) {
    await addDoc(collection(db, 'expenses'), {
      ...expense,
      createdBy: firebaseUser.uid,
      createdAt: serverTimestamp(),
    })
  }

  // Owner-only in the UI (ExpensesPage only ever passes this through for
  // the Owner) and enforced the same way server-side in firestore.rules —
  // the fix for a wrong expense is delete + have the member re-add it
  // correctly, there's no in-place edit.
  function deleteExpense(expenseId) {
    return deleteDoc(doc(db, 'expenses', expenseId))
  }

  return { expenses, loading, addExpense, deleteExpense }
}
