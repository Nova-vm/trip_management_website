import { useState } from 'react'
import {
  ShieldAlert,
  Users,
  Wallet,
  Receipt,
  Megaphone,
  Settings,
  Save,
  UserCheck,
  MapPin,
  IndianRupee,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTripConfig } from '../context/TripConfigContext'
import { useLocationSharing } from '../lib/useLocationSharing'
import { useExpenses } from '../lib/useExpenses'
import { usePayments } from '../lib/usePayments'
import { useAnnouncements } from '../lib/useAnnouncements'
import { formatPaise } from '../lib/splitwise'
import Card from '../components/ui/Card'
import SectionHeading from '../components/ui/SectionHeading'
import EmptyState from '../components/ui/EmptyState'
import ProgressBar from '../components/ui/ProgressBar'
import Avatar from '../components/ui/Avatar'
import StatusBadge from '../components/ui/StatusBadge'

export default function AdminPage() {
  const { isOwner, members, activeMembers, approveMember, removeMember, setMemberLocationOverride } = useAuth()
  const { tripConfig, updateTripConfig } = useTripConfig()
  const { sharingEnabled, setSharingEnabled } = useLocationSharing()
  const { expenses } = useExpenses()
  const { packageTotalPaise, memberPayments, totalCollectedPaise, needsReview, setPackageTotal, setMemberPayment } =
    usePayments()
  const { announcements, postAnnouncement, deleteAnnouncement } = useAnnouncements()

  if (!isOwner) {
    return (
      <div className="px-4 pt-4">
        <EmptyState
          icon={ShieldAlert}
          title="Owner access required"
          description="Only the trip Owner (the first person who signed up) can see this dashboard."
        />
      </div>
    )
  }

  const pendingMembers = members.filter((member) => !member.active)
  const totalExpensePaise = expenses.reduce((sum, expense) => sum + expense.amountInPaise, 0)
  const collectionPct = packageTotalPaise > 0 ? Math.round((totalCollectedPaise / packageTotalPaise) * 100) : 0

  function handleApprove(uid) {
    approveMember(uid).catch(() => {
      window.alert('Could not approve them — make sure the latest firestore.rules has been published in the Firebase console.')
    })
  }

  function handleReject(member) {
    const ok = window.confirm(
      `Reject ${member.name}'s sign-up?\n\nThis deletes their request. Their login still works if they try again later — only their traveller slot is removed.`,
    )
    if (!ok) return
    removeMember(member.uid).catch(() => {
      window.alert('Could not reject them — make sure the latest firestore.rules has been published in the Firebase console.')
    })
  }

  function handleToggleSharing() {
    setSharingEnabled(!sharingEnabled).catch(() => {
      window.alert('Could not change this — make sure the latest firestore.rules has been published in the Firebase console.')
    })
  }

  function handleSetOverride(uid, override) {
    setMemberLocationOverride(uid, override).catch(() => {
      window.alert('Could not change this — make sure the latest firestore.rules has been published in the Firebase console.')
    })
  }

  function handleSetPackageTotal(rupees) {
    setPackageTotal(Math.round(Number(rupees) * 100)).catch(() => {
      window.alert('Could not save this — make sure the latest firestore.rules has been published in the Firebase console.')
    })
  }

  function handleMarkPaid(payment) {
    setMemberPayment(payment.uid, { amountPaidPaise: payment.expectedAmountPaise, status: 'paid' }).catch(() => {
      window.alert('Could not update this — make sure the latest firestore.rules has been published in the Firebase console.')
    })
  }

  function handleApprovePayment(payment) {
    setMemberPayment(payment.uid, { amountPaidPaise: payment.amountPaidPaise, status: 'paid' }).catch(() => {
      window.alert('Could not approve this — make sure the latest firestore.rules has been published in the Firebase console.')
    })
  }

  function handleDeleteAnnouncement(announcement) {
    const ok = window.confirm(`Delete the announcement "${announcement.title}"? This can't be undone.`)
    if (!ok) return
    deleteAnnouncement(announcement.announcementId).catch(() => {
      window.alert('Could not delete it — make sure the latest firestore.rules has been published in the Firebase console.')
    })
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-4">
      <SectionHeading title="Admin Dashboard" subtitle="Owner-only overview — manage the whole trip from here" />

      <TripSettingsCard tripConfig={tripConfig} onSave={updateTripConfig} />

      <PendingApprovalsCard pendingMembers={pendingMembers} onApprove={handleApprove} onReject={handleReject} />

      <LocationSharingCard sharingEnabled={sharingEnabled} onToggle={handleToggleSharing} />

      <LocationOverridesCard members={activeMembers} onSetOverride={handleSetOverride} />

      <PackageTotalCard key={packageTotalPaise} packageTotalPaise={packageTotalPaise} onSave={handleSetPackageTotal} />

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Users} label="Active" value={`${activeMembers.length} / ${tripConfig.totalMembers}`} />
        <StatCard icon={Wallet} label="Collected" value={`${collectionPct}%`} />
        <StatCard icon={Receipt} label="Group spend" value={formatPaise(totalExpensePaise)} />
        <StatCard icon={ShieldAlert} label="Needs review" value={needsReview} />
      </div>

      <Card className="p-4">
        <p className="text-sm font-medium text-white">Transport collection</p>
        <ProgressBar value={totalCollectedPaise} max={Math.max(packageTotalPaise, 1)} className="mt-3" />
        <p className="mt-2 text-xs text-slate-500">
          {formatPaise(totalCollectedPaise)} of {formatPaise(packageTotalPaise)} collected — split evenly
          across {activeMembers.length} active traveller{activeMembers.length === 1 ? '' : 's'} right now.
        </p>
      </Card>

      <PaymentReviewCard
        memberPayments={memberPayments}
        onMarkPaid={handleMarkPaid}
        onApprove={handleApprovePayment}
      />

      <AnnouncementsCard
        announcements={announcements}
        onPost={postAnnouncement}
        onDelete={handleDeleteAnnouncement}
      />

      <p className="text-center text-xs text-slate-500">
        Expense in-place editing and per-category budgets are still future Admin additions — for
        now, a wrong expense is fixed by delete + re-add.
      </p>
    </div>
  )
}

function PendingApprovalsCard({ pendingMembers, onApprove, onReject }) {
  return (
    <Card className="p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-white">
        <UserCheck className="h-4 w-4 text-mountain-400" /> Pending approvals
        {pendingMembers.length > 0 && ` (${pendingMembers.length})`}
      </p>
      {pendingMembers.length === 0 ? (
        <p className="mt-2 text-xs text-slate-500">
          Nobody's waiting — anyone who signs up next shows up here first.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {pendingMembers.map((member) => (
            <div
              key={member.uid}
              className="flex items-center justify-between gap-2 rounded-lg bg-white/5 p-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{member.name}</p>
                <p className="truncate text-xs text-slate-500">{member.email}</p>
                {member.createdAt?.toDate && (
                  <p className="text-[11px] text-slate-600">
                    Signed up {member.createdAt.toDate().toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => onApprove(member.uid)}
                  className="rounded-lg bg-status-completed/20 px-2.5 py-1.5 text-xs font-medium text-status-completed transition-colors hover:bg-status-completed/30"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => onReject(member)}
                  className="rounded-lg bg-status-disputed/20 px-2.5 py-1.5 text-xs font-medium text-status-disputed transition-colors hover:bg-status-disputed/30"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function LocationSharingCard({ sharingEnabled, onToggle }) {
  return (
    <Card className="p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-white">
        <MapPin className="h-4 w-4 text-mountain-400" /> Live location sharing
      </p>
      <p className="mt-2 text-xs text-slate-500">
        You can always see everyone's last known location on Journey, switch or no switch. This
        turns it on (or off) for every other member too — their own location is still captured
        quietly either way, this only controls who's allowed to see it.
      </p>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-white/5 p-2.5">
        <span className="text-sm text-white">
          {sharingEnabled ? 'On — everyone can see each other' : 'Off — only you can see locations'}
        </span>
        <button
          type="button"
          onClick={onToggle}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            sharingEnabled
              ? 'bg-status-disputed/20 text-status-disputed hover:bg-status-disputed/30'
              : 'bg-status-completed/20 text-status-completed hover:bg-status-completed/30'
          }`}
        >
          {sharingEnabled ? 'Turn off' : 'Turn on'}
        </button>
      </div>
    </Card>
  )
}

function LocationOverridesCard({ members, onSetOverride }) {
  return (
    <Card className="p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-white">
        <MapPin className="h-4 w-4 text-mountain-400" /> Per-member location override
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Overrides the switch above for one person at a time — force someone visible while it's off
        for everyone else, or hide just them while it's on. Leave everyone else on "Follow switch".
      </p>
      {members.length === 0 ? (
        <p className="mt-3 text-xs text-slate-500">No active travellers yet.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {members.map((member) => (
            <div key={member.uid} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 p-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <Avatar name={member.name} size="sm" />
                <p className="truncate text-sm text-white">{member.name}</p>
              </div>
              <select
                value={member.locationOverride === true ? 'on' : member.locationOverride === false ? 'off' : 'auto'}
                onChange={(event) => {
                  const value = event.target.value
                  onSetOverride(member.uid, value === 'auto' ? null : value === 'on')
                }}
                className="shrink-0 rounded-lg border border-white/10 bg-navy-900 px-2 py-1.5 text-xs text-white outline-none focus:border-mountain-400"
              >
                <option value="auto">Follow switch</option>
                <option value="on">Force on</option>
                <option value="off">Force off</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function PackageTotalCard({ packageTotalPaise, onSave }) {
  const [value, setValue] = useState(String(packageTotalPaise / 100))
  const [saved, setSaved] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    onSave(value)
    setSaved(true)
  }

  return (
    <Card className="p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-white">
        <IndianRupee className="h-4 w-4 text-mountain-400" /> Package total
      </p>
      <p className="mt-1 text-xs text-slate-500">
        The one number every traveller's expected share is split from, evenly across however many
        active travellers there are right now. Change the headcount by approving/removing
        travellers above — every share updates on its own, no need to retype anything here.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1 text-xs text-slate-400">
          Total (₹)
          <input
            type="number"
            min="0"
            step="1"
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setSaved(false)
            }}
            className="rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white outline-none focus:border-mountain-400"
          />
        </label>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-lg bg-mountain-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-mountain-400"
        >
          <Save className="h-4 w-4" /> {saved ? 'Saved' : 'Save'}
        </button>
      </form>
    </Card>
  )
}

function PaymentReviewCard({ memberPayments, onMarkPaid, onApprove }) {
  return (
    <Card className="p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-white">
        <Wallet className="h-4 w-4 text-mountain-400" /> Payment review
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Each traveller's even share of the package total above. Approve a self-reported payment,
        or mark someone paid directly if they paid you outside the app.
      </p>
      {memberPayments.length === 0 ? (
        <p className="mt-3 text-xs text-slate-500">No active travellers yet.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {memberPayments.map((payment) => (
            <div key={payment.uid} className="flex items-center gap-3 rounded-xl2 bg-navy-800/40 p-3">
              <Avatar name={payment.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{payment.name}</p>
                <p className="text-xs text-slate-500">
                  {formatPaise(payment.amountPaidPaise)} / {formatPaise(payment.expectedAmountPaise)}
                </p>
              </div>
              <StatusBadge status={payment.status} />
              {payment.status === 'under_verification' ? (
                <button
                  type="button"
                  onClick={() => onApprove(payment)}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-status-completed/20 px-2.5 py-1.5 text-xs font-medium text-status-completed transition-colors hover:bg-status-completed/30"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </button>
              ) : payment.status !== 'paid' ? (
                <button
                  type="button"
                  onClick={() => onMarkPaid(payment)}
                  className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
                >
                  Mark paid
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function AnnouncementsCard({ announcements, onPost, onDelete }) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [posting, setPosting] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    if (!title.trim() || !message.trim()) return
    setPosting(true)
    onPost({ title: title.trim(), message: message.trim() })
      .then(() => {
        setTitle('')
        setMessage('')
      })
      .catch(() => {
        window.alert('Could not post this — make sure the latest firestore.rules has been published in the Firebase console.')
      })
      .finally(() => setPosting(false))
  }

  return (
    <Card className="p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-white">
        <Megaphone className="h-4 w-4 text-mountain-400" /> Announcements
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          className="rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white outline-none focus:border-mountain-400"
        />
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Message everyone will see on Home"
          rows={2}
          className="rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white outline-none focus:border-mountain-400"
        />
        <button
          type="submit"
          disabled={posting}
          className="flex items-center justify-center gap-2 self-start rounded-lg bg-mountain-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-mountain-400 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {posting ? 'Posting…' : 'Post'}
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-2">
        {announcements.length === 0 ? (
          <p className="text-xs text-slate-500">Nothing posted yet.</p>
        ) : (
          announcements.map((item) => (
            <div
              key={item.announcementId}
              className="flex items-start justify-between gap-2 rounded-lg bg-white/5 p-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">{item.message}</p>
              </div>
              <button
                type="button"
                onClick={() => onDelete(item)}
                className="shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-status-disputed/20 hover:text-status-disputed"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

function TripSettingsCard({ tripConfig, onSave }) {
  const [form, setForm] = useState({
    tripName: tripConfig.tripName,
    startDate: tripConfig.startDate,
    endDate: tripConfig.endDate,
    totalMembers: tripConfig.totalMembers,
  })
  const [saved, setSaved] = useState(false)

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  function handleSave(event) {
    event.preventDefault()
    onSave({ ...form, totalMembers: Number(form.totalMembers) || tripConfig.totalMembers })
    setSaved(true)
  }

  return (
    <Card className="p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-white">
        <Settings className="h-4 w-4 text-mountain-400" /> Trip settings
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Only you can see or change this. Home, Group and Journey read from here live — it's also
        what makes this whole site reusable for a future trip, just by editing these fields.
      </p>

      <form onSubmit={handleSave} className="mt-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Trip name
          <input
            type="text"
            value={form.tripName}
            onChange={(event) => handleChange('tripName', event.target.value)}
            className="rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white outline-none focus:border-mountain-400"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            Start date
            <input
              type="date"
              value={form.startDate}
              onChange={(event) => handleChange('startDate', event.target.value)}
              className="rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white outline-none focus:border-mountain-400"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            End date
            <input
              type="date"
              value={form.endDate}
              onChange={(event) => handleChange('endDate', event.target.value)}
              className="rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white outline-none focus:border-mountain-400"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Total members
          <input
            type="number"
            min="1"
            value={form.totalMembers}
            onChange={(event) => handleChange('totalMembers', event.target.value)}
            className="w-24 rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white outline-none focus:border-mountain-400"
          />
        </label>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 self-start rounded-lg bg-mountain-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-mountain-400"
        >
          <Save className="h-4 w-4" /> {saved ? 'Saved' : 'Save changes'}
        </button>
      </form>

      <p className="mt-3 text-[11px] text-slate-500">
        Saved on this device only for now — real sync to everyone's device arrives with Firebase
        in Phase 2.
      </p>
    </Card>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="flex flex-col gap-1.5 p-4">
      <Icon className="h-4 w-4 text-mountain-400" />
      <p className="font-display text-lg font-semibold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </Card>
  )
}
