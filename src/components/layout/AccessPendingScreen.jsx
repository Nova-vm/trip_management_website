// Shown instead of the app when someone is logged in but not let in yet —
// either still waiting for the Owner's approval, or their account was
// removed. Guide: Read_Me/HOW_TO_MAKE_CHANGES.md -> "Login / Account"
import { Clock3, UserX, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AccessPendingScreen({ reason }) {
  const { profile, logOut } = useAuth()
  const removed = reason === 'removed'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      {removed ? (
        <UserX className="h-9 w-9 text-slate-500" />
      ) : (
        <Clock3 className="h-9 w-9 text-mountain-400" />
      )}
      <div>
        <p className="font-display text-lg font-semibold text-white">
          {removed ? "You're not on the trip list" : 'Waiting for approval'}
        </p>
        <p className="mt-2 max-w-xs text-sm text-slate-400">
          {removed
            ? "Your account isn't linked to a traveller slot anymore. If this is unexpected, ask the trip Owner."
            : `Hi${profile?.name ? ' ' + profile.name : ''} — the trip Owner needs to approve your account before you can get in. Check back soon, or ping them directly.`}
        </p>
      </div>
      <button
        type="button"
        onClick={logOut}
        className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </div>
  )
}
