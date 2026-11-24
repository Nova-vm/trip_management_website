// DEPRECATED — replaced by src/context/AuthContext.jsx (real Firebase
// login, see Read_Me/FIREBASE_SETUP_GUIDE.md). Nothing in the app imports
// this file anymore. Safe to delete yourself — kept only because this
// session's tools had no file-delete capability.
import { createContext, useContext, useState } from 'react'
import { members } from '../data/mockMembers'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [currentUserId, setCurrentUserId] = useState('u1')
  const currentUser = members.find((member) => member.userId === currentUserId) ?? members[0]

  const value = {
    currentUser,
    currentUserId,
    setCurrentUserId,
    isOwner: currentUser.role === 'owner',
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used inside <SessionProvider>')
  return context
}
