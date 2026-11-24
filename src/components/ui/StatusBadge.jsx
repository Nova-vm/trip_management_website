const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', color: 'bg-status-upcoming/20 text-status-upcoming' },
  in_progress: { label: 'In Progress', color: 'bg-status-progress/20 text-status-progress' },
  completed: { label: 'Completed', color: 'bg-status-completed/20 text-status-completed' },
  skipped: { label: 'Skipped', color: 'bg-status-skipped/20 text-status-skipped' },
  cancelled: { label: 'Cancelled', color: 'bg-status-cancelled/20 text-status-cancelled' },
  pending: { label: 'Pending', color: 'bg-status-pending/20 text-status-pending' },
  under_verification: { label: 'Under Verification', color: 'bg-mountain-500/20 text-mountain-400' },
  paid: { label: 'Paid', color: 'bg-status-paid/20 text-status-paid' },
  partially_paid: { label: 'Partially Paid', color: 'bg-status-pending/20 text-status-pending' },
  disputed: { label: 'Disputed', color: 'bg-status-disputed/20 text-status-disputed' },
  to_confirm: { label: 'To Confirm', color: 'bg-status-pending/20 text-status-pending' },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: 'bg-white/10 text-slate-300' }
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}
