// EDIT HERE — placeholder traveller data for the Payments demo screen ONLY
// (Expenses moved to the real Firestore roster — see src/lib/useExpenses.js
// and src/context/AuthContext.jsx). Real travellers sign up for real at
// /login and show up on the Group page from Firestore — this file no
// longer feeds Group, Profile, Expenses, or login in any way.
// Guide: Read_Me/HOW_TO_MAKE_CHANGES.md -> "Payments"
//
// Payments moves to this same real-roster model in its own Phase 2 step
// (see Read_Me/PROJECT_PLAN.md §5 — it's waiting on the per-traveller
// package-split question, not forgotten); until then, add/remove a person
// here to change who shows up in the Payments mock data.
export const members = [
  { userId: 'u1', name: 'Traveller 1', role: 'owner', active: true },
  { userId: 'u2', name: 'Traveller 2', role: 'coordinator', active: true },
  { userId: 'u3', name: 'Traveller 3', role: 'member', active: true },
  { userId: 'u4', name: 'Traveller 4', role: 'member', active: true },
  { userId: 'u5', name: 'Traveller 5', role: 'member', active: true },
  { userId: 'u6', name: 'Traveller 6', role: 'member', active: true },
  { userId: 'u7', name: 'Traveller 7', role: 'member', active: true },
  { userId: 'u8', name: 'Traveller 8', role: 'member', active: true },
  { userId: 'u9', name: 'Traveller 9', role: 'member', active: true },
  { userId: 'u10', name: 'Traveller 10', role: 'member', active: true },
  { userId: 'u11', name: 'Traveller 11', role: 'member', active: true },
]

export function getMemberName(userId) {
  return members.find((member) => member.userId === userId)?.name ?? 'Unknown'
}

export function initialsFor(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
