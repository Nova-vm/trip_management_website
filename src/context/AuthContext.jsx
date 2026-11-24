// LOGIC FILE — real login, sessions, and the live traveller roster. Don't
// hand-edit unless you're changing how accounts/roles work. See
// Read_Me/FIREBASE_SETUP_GUIDE.md for how this all works, in plain terms.
import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, setDoc, collection, onSnapshot, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

// EDIT HERE — the ONE email allowed to become the trip Owner. Whoever signs
// up with this exact email becomes Owner and is auto-approved; every other
// email always starts as a pending Member, no matter when they sign up.
// This must match the email inside `isOwner()` in firestore.rules exactly —
// Firestore rules can't read this file, so the same email has to be typed
// in both places. If you ever change the Owner, update both and republish
// firestore.rules. See Read_Me/PROJECT_PLAN.md §10.5.
const OWNER_EMAIL = 'vijaymishra2205@gmail.com'

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [members, setMembers] = useState([])
  const [authChecked, setAuthChecked] = useState(false)
  const [profileChecked, setProfileChecked] = useState(false)

  // Fires once immediately with whoever Firebase already has logged in (or
  // null), then again every time someone logs in/out. This is the whole
  // mechanism behind "stay logged in across visits" — Firebase stores the
  // session in the browser itself, nothing here writes a cookie by hand.
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user)
      setAuthChecked(true)
      if (!user) {
        setProfile(null)
        setProfileChecked(true)
      }
    })
  }, [])

  // Once we know who's logged in, keep their own member document (name,
  // role) in sync live.
  useEffect(() => {
    if (!firebaseUser) return
    setProfileChecked(false)
    return onSnapshot(doc(db, 'members', firebaseUser.uid), (snap) => {
      setProfile(snap.exists() ? { uid: snap.id, ...snap.data() } : null)
      setProfileChecked(true)
    })
  }, [firebaseUser])

  // The full traveller roster, kept live for the Group page — anyone
  // signing up shows up for everyone else immediately, no refresh needed.
  useEffect(() => {
    if (!firebaseUser) {
      setMembers([])
      return
    }
    return onSnapshot(collection(db, 'members'), (snap) => {
      setMembers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })))
    })
  }, [firebaseUser])

  async function signUp(email, password, name) {
    // Lowercased/trimmed once, here, so this is the one place that decides
    // what "the same email" means — signup and login both go through it.
    const normalizedEmail = email.trim().toLowerCase()
    const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
    await updateProfile(credential.user, { displayName: name })
    const isTheOwner = normalizedEmail === OWNER_EMAIL
    await setDoc(doc(db, 'members', credential.user.uid), {
      name,
      email: normalizedEmail,
      // Only the one pre-agreed OWNER_EMAIL becomes Owner — not whoever
      // happens to sign up first. firestore.rules enforces this same rule
      // server-side, so this isn't just a client-side suggestion.
      role: isTheOwner ? 'owner' : 'member',
      // The Owner is active immediately. Everyone else lands pending — not
      // allowed into the app — until the Owner approves them from Admin.
      active: isTheOwner,
      createdAt: serverTimestamp(),
    })
  }

  function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
  }

  function logOut() {
    return signOut(auth)
  }

  // Works for ANY email, logged in or not — this is the one real way to
  // change a password in this app, since Firebase never lets code set a
  // password directly (not even the Owner's own). It emails that address a
  // link; whoever controls the inbox picks their own new password there.
  // Used two ways: a "Forgot password?" link on LoginPage (self-serve, by
  // typing your own email), and an Owner-only "reset" button on Group (the
  // Owner triggers it for someone else's address, but still can't choose
  // their new password for them).
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email.trim().toLowerCase())
  }

  // Owner-only actions (also enforced server-side by firestore.rules, so
  // these can't be bypassed by someone editing the frontend JS).
  function approveMember(uid) {
    return updateDoc(doc(db, 'members', uid), { active: true })
  }

  function removeMember(uid) {
    return deleteDoc(doc(db, 'members', uid))
  }

  // Per-member location-sharing override, on top of the global switch in
  // useLocationSharing.js: true forces that member visible, false forces
  // them hidden, null means "just follow the global switch". Lives on the
  // same member doc approveMember/removeMember already touch, rather than a
  // separate collection.
  function setMemberLocationOverride(uid, override) {
    return updateDoc(doc(db, 'members', uid), { locationOverride: override })
  }

  const value = {
    firebaseUser,
    profile,
    members,
    // The real, approved roster — what Group and Expenses should show/offer.
    // Pending sign-ups are deliberately left out of this list.
    activeMembers: members.filter((member) => member.active),
    // Based on the logged-in email itself, not the Firestore `role` field —
    // so this can never drift even if a profile document is stale or wrong.
    isOwner: firebaseUser?.email?.toLowerCase() === OWNER_EMAIL,
    // Stays true until we know for sure: either "definitely logged out", or
    // "logged in AND their member profile has loaded" — this is what stops
    // every page from flashing/crashing on a profile that isn't here yet.
    loading: !authChecked || (firebaseUser != null && !profileChecked),
    signUp,
    logIn,
    logOut,
    resetPassword,
    approveMember,
    removeMember,
    setMemberLocationOverride,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
