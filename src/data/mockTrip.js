// EDIT HERE — trip name, dates, member count, cover image and route stops.
// Home, Journey and Group all read this live through TripConfigContext, and
// the Owner can also edit tripName/dates/totalMembers straight from the
// Admin page without touching code. The package total and per-traveller
// payments live in Firestore now (src/lib/usePayments.js), not here.
// Guide: Read_Me/HOW_TO_MAKE_CHANGES.md -> "Home & trip settings"
//
// Phase 1 placeholder. In Phase 2 this becomes a document read from
// Firestore's trips/{tripId} instead of a hardcoded object — same shape.
export const trip = {
  tripId: 'himachal-2026',
  tripName: 'Himachal Expedition 2026',
  startDate: '2026-12-12',
  endDate: '2026-12-18',
  timezone: 'Asia/Kolkata',
  totalMembers: 11,
  status: 'upcoming', // upcoming | ongoing | completed
  ownerId: 'u1',
  coverImage:
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&auto=format&fit=crop',
  destinations: [
    'Delhi',
    'Manali',
    'Solang Valley',
    'Kullu',
    'Manikaran',
    'Kasol',
    'Jibhi',
    'Jalori Pass',
    'Serolsar Lake',
    'Delhi',
  ],
}
