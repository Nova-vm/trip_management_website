// Renders nothing — mounted once in App.jsx for every logged-in, approved
// member, so a quiet "where am I right now" snapshot gets taken on every
// login, not just when Journey happens to be open. See
// src/lib/useLocationSharing.js (LOGIC FILE) for what this actually writes,
// and Read_Me/HOW_TO_MAKE_CHANGES.md -> "Journey" for the full feature.
import { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { captureLocationForUser } from '../../lib/useLocationSharing'

export default function LocationCapture() {
  const { firebaseUser } = useAuth()

  useEffect(() => {
    if (firebaseUser) captureLocationForUser(firebaseUser.uid)
  }, [firebaseUser])

  return null
}
