import { useAuth } from '../context/AuthContext'
import { useTripConfig } from '../context/TripConfigContext'
import MemberCard from '../components/group/MemberCard'
import SectionHeading from '../components/ui/SectionHeading'

export default function GroupPage() {
  const { activeMembers, profile, isOwner, removeMember, resetPassword } = useAuth()
  const { tripConfig } = useTripConfig()

  function handleRemove(member) {
    const ok = window.confirm(
      `Remove ${member.name} from the trip?\n\nThis deletes them from the traveller list immediately — their seat opens up for someone else. Their login still works until you also delete it in the Firebase console -> Authentication tab (see HOW_TO_MAKE_CHANGES.md -> "Group").`,
    )
    if (!ok) return
    removeMember(member.uid).catch(() => {
      window.alert('Could not remove them — make sure the latest firestore.rules has been published in the Firebase console.')
    })
  }

  // Doesn't set their new password for them — nobody but them can do that.
  // This just emails member.email a reset link, same as if they'd clicked
  // "Forgot password?" themselves on the login screen.
  function handleResetPassword(member) {
    const ok = window.confirm(`Send ${member.name} a password reset email at ${member.email}?`)
    if (!ok) return
    resetPassword(member.email)
      .then(() => window.alert(`Reset email sent to ${member.email}.`))
      .catch(() => window.alert('Could not send the reset email — try again.'))
  }

  return (
    <div className="px-4 pt-4">
      <SectionHeading
        title="Group"
        subtitle={`${activeMembers.length} of ${tripConfig.totalMembers} travellers signed up · ${tripConfig.tripName}`}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {activeMembers.map((member) => (
          <MemberCard
            key={member.uid}
            member={member}
            isYou={member.uid === profile?.uid}
            onRemove={isOwner && member.uid !== profile?.uid ? () => handleRemove(member) : undefined}
            onResetPassword={
              isOwner && member.uid !== profile?.uid ? () => handleResetPassword(member) : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}
