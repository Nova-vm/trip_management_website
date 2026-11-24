// LOGIC FILE — Firestore wiring for the Admin-composed announcements shown
// on Home. Don't hand-edit unless you're changing how announcements are
// saved/loaded. See Read_Me/HOW_TO_MAKE_CHANGES.md -> "Admin" / "Home".
import { useEffect, useState } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from '../context/AuthContext'

export function useAnnouncements() {
  const { firebaseUser } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  // Live list, newest first — posting on Admin shows up on Home for
  // everyone immediately, same live-list pattern as useExpenses.js.
  useEffect(() => {
    if (!firebaseUser) {
      setAnnouncements([])
      return
    }
    const announcementsQuery = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
    return onSnapshot(announcementsQuery, (snap) => {
      setAnnouncements(snap.docs.map((d) => ({ announcementId: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [firebaseUser])

  // Owner-only in the UI (AdminPage only ever renders the compose form for
  // the Owner) and enforced the same way server-side in firestore.rules.
  async function postAnnouncement({ title, message }) {
    await addDoc(collection(db, 'announcements'), {
      title,
      message,
      createdBy: firebaseUser.uid,
      createdAt: serverTimestamp(),
    })
  }

  // Owner-only — no in-place edit, same delete-and-repost pattern as
  // useExpenses.js's deleteExpense.
  function deleteAnnouncement(announcementId) {
    return deleteDoc(doc(db, 'announcements', announcementId))
  }

  return { announcements, loading, postAnnouncement, deleteAnnouncement }
}
