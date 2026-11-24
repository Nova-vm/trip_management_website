import { ShieldCheck, UserMinus, KeyRound } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Card from '../ui/Card'

// No 'owner' entry on purpose — the Owner shows up looking like any other
// member here (deliberate decision, see Read_Me/PROJECT_PLAN.md §9.1).
const ROLE_CONFIG = {
  coordinator: { label: 'Coordinator', icon: ShieldCheck, color: 'text-mountain-400' },
  member: { label: 'Member', icon: null, color: 'text-slate-400' },
}

// onRemove and onResetPassword are only ever passed in by GroupPage for the
// Owner, and never for the Owner's own card — see GroupPage.jsx.
export default function MemberCard({ member, isYou, onRemove, onResetPassword }) {
  const role = ROLE_CONFIG[member.role] ?? ROLE_CONFIG.member
  const RoleIcon = role.icon

  return (
    <Card className="relative flex flex-col items-center gap-2 p-4 text-center">
      {(onRemove || onResetPassword) && (
        <div className="absolute right-2 top-2 flex items-center gap-2">
          {onResetPassword && (
            <button
              type="button"
              onClick={onResetPassword}
              title={`Send ${member.name} a password reset email`}
              aria-label={`Send ${member.name} a password reset email`}
              className="text-slate-500 transition-colors hover:text-mountain-400"
            >
              <KeyRound className="h-3.5 w-3.5" />
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              title={`Remove ${member.name}`}
              aria-label={`Remove ${member.name}`}
              className="text-slate-500 transition-colors hover:text-status-disputed"
            >
              <UserMinus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
      <Avatar name={member.name} size="lg" />
      <div>
        <p className="flex items-center justify-center gap-1 text-sm font-medium text-white">
          {member.name}
          {isYou && <span className="text-xs text-slate-500">(You)</span>}
        </p>
        <p className={`mt-0.5 flex items-center justify-center gap-1 text-xs ${role.color}`}>
          {RoleIcon && <RoleIcon className="h-3 w-3" />}
          {role.label}
        </p>
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] ${
          member.active ? 'bg-status-completed/20 text-status-completed' : 'bg-white/5 text-slate-500'
        }`}
      >
        {member.active ? 'Active' : 'Inactive'}
      </span>
    </Card>
  )
}
