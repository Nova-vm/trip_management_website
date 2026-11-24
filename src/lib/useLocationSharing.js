// LOGIC FILE — Firestore wiring for live location sharing on Journey. Don't
// hand-edit unless you're changing how location capture/visibility works.
// See Read_Me/HOW_TO_MAKE_CHANGES.md -> "Journey" / "Admin".
import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from '../context/AuthContext'

// Standalone (no subscriptions attached), so both the always-mounted
// <LocationCapture/> and JourneyPage can fire a quiet write straight from
// `firebaseUser.uid` without also opening the settings/app + locations
// listeners below — those are only useful where something actually reads
// them back.
export function captureLocationForUser(uid) {
  if (!uid || !navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setDoc(doc(db, 'locations', uid), {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        updatedAt: serverTimestamp(),
      }).catch(() => {})
    },
    () => {},
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
  )
}

export function useLocationSharing() {
  const { firebaseUser, isOwner, activeMembers } = useAuth()
  const [sharingEnabled, setSharingEnabledState] = useState(false)
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)

  // Every logged-in member reads this live — even before sharing is on —
  // so their own app knows whether to show the map or the "ask the Owner"
  // placeholder.
  useEffect(() => {
    if (!firebaseUser) {
      setSharingEnabledState(false)
      return
    }
    return onSnapshot(doc(db, 'settings', 'app'), (snap) => {
      setSharingEnabledState(snap.exists() ? !!snap.data().locationSharingEnabled : false)
    })
  }, [firebaseUser])

  // The Owner reads the whole collection in one listener, same as before —
  // firestore.rules grants isOwner() the whole collection unconditionally,
  // so this stays just as cheap regardless of anyone's per-member override.
  //
  // A non-owner can't share that collection listener any more: once
  // visibility can depend on each doc's own member override, the read
  // rule's result isn't the same for every document any more, and
  // Firestore refuses to run a collection-wide query it can't prove is
  // uniformly safe. So each active member instead gets their own direct
  // doc() listener — a single-document read is always evaluated against
  // that exact document, with no such ambiguity. Whichever of those the
  // rule denies just errors quietly and is dropped, which is the normal,
  // expected shape of "that person isn't visible to you right now."
  useEffect(() => {
    if (!firebaseUser) {
      setLocations([])
      setLoading(false)
      return
    }

    if (isOwner) {
      setLoading(true)
      return onSnapshot(collection(db, 'locations'), (snap) => {
        setLocations(snap.docs.map((d) => ({ uid: d.id, ...d.data() })))
        setLoading(false)
      })
    }

    setLoading(false)
    const byUid = new Map()
    const unsubs = activeMembers.map((member) =>
      onSnapshot(
        doc(db, 'locations', member.uid),
        (snap) => {
          if (snap.exists()) byUid.set(member.uid, { uid: member.uid, ...snap.data() })
          else byUid.delete(member.uid)
          setLocations(Array.from(byUid.values()))
        },
        () => {
          // Not visible to us right now (override off, or global switch
          // off) — drop silently rather than surfacing as an error.
          byUid.delete(member.uid)
          setLocations(Array.from(byUid.values()))
        },
      ),
    )
    return () => unsubs.forEach((unsub) => unsub())
  }, [firebaseUser, isOwner, activeMembers])

  // Owner-only — also enforced server-side by firestore.rules, so this
  // can't be bypassed by someone editing the frontend JS.
  function setSharingEnabled(enabled) {
    return setDoc(doc(db, 'settings', 'app'), { locationSharingEnabled: enabled }, { merge: true })
  }

  return { sharingEnabled, locations, loading, setSharingEnabled }
}
