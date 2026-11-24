// DEPRECATED — replaced by src/components/layout/AccountMenu.jsx (shows the
// real logged-in member + a working logout button). Nothing in the app
// imports this file anymore. Safe to delete yourself — kept only because
// this session's tools had no file-delete capability.
import { useSession } from '../../context/SessionContext'

const PREVIEW_CHOICES = [
  { userId: 'u1', label: 'Owner' },
  { userId: 'u3', label: 'Member' },
]

export default function RolePreviewSwitch({ compact = false }) {
  const { currentUserId, setCurrentUserId } = useSession()

  return (
    <div className={compact ? 'flex flex-col items-end gap-1' : 'mt-4 border-t border-white/5 pt-4'}>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">Previewing as (dev only)</p>
      <div className="flex gap-1">
        {PREVIEW_CHOICES.map((choice) => (
          <button
            key={choice.userId}
            type="button"
            onClick={() => setCurrentUserId(choice.userId)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              currentUserId === choice.userId
                ? 'bg-mountain-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  )
}
