import { LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const ROLE_LABEL = { owner: 'Owner', coordinator: 'Coordinator', member: 'Member' }

export default function AccountMenu({ compact = false }) {
  const { profile, logOut } = useAuth()

  return (
    <div
      className={
        compact
          ? 'flex items-center gap-2'
          : 'mt-4 flex items-center justify-between border-t border-white/5 pt-4'
      }
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{profile?.name ?? 'Member'}</p>
        {!compact && (
          <p className="text-xs text-slate-500">{ROLE_LABEL[profile?.role] ?? 'Member'}</p>
        )}
      </div>
      <button
        type="button"
        onClick={logOut}
        title="Log out"
        aria-label="Log out"
        className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  )
}
