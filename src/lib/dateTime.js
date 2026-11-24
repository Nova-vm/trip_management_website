// LOGIC FILE — not usually something to hand-edit. This answers "what day
// is it / how long until the trip" for Home, Itinerary and Journey. To
// change the trip's actual dates, edit mockTrip.js (or the Admin "Trip
// settings" form) instead.
//
// Date-based itinerary highlighting is deliberately separate from GPS —
// this file only answers "what day is it, in the trip's timezone", never
// "where is the group". See spec section 6.4 / Read_Me/PROJECT_PLAN.md.
const TRIP_UTC_OFFSET_MS = (5 * 60 + 30) * 60000 // Asia/Kolkata, fixed, no DST

export function todayIsoInTripZone(now = new Date()) {
  return new Date(now.getTime() + TRIP_UTC_OFFSET_MS).toISOString().slice(0, 10)
}

export function getTripPhase(trip, now = new Date()) {
  const start = new Date(`${trip.startDate}T00:00:00+05:30`).getTime()
  const end = new Date(`${trip.endDate}T23:59:59+05:30`).getTime()
  const current = now.getTime()
  if (current < start) return 'before'
  if (current > end) return 'after'
  return 'during'
}

export function getCountdown(trip, now = new Date()) {
  const startMs = new Date(`${trip.startDate}T00:00:00+05:30`).getTime()
  const diffMs = startMs - now.getTime()
  if (diffMs <= 0) return null
  const totalSeconds = Math.floor(diffMs / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

// Admin override: pass an explicit dayNumber to force the active day
// instead of deriving it from today's date (spec section 6.4).
export function getActiveDayNumber(itineraryDays, { now = new Date(), overrideDayNumber } = {}) {
  if (overrideDayNumber) return overrideDayNumber
  const todayIso = todayIsoInTripZone(now)
  return itineraryDays.find((day) => day.date === todayIso)?.dayNumber ?? null
}

// Compares a planned vs. actual timestamp (spec section 7.2). Both
// timestamps are ISO strings for the same trip day.
export function compareSchedule(plannedISO, actualISO) {
  if (!actualISO) return { status: 'pending', diffMinutes: null }
  const diffMinutes = Math.round((new Date(actualISO) - new Date(plannedISO)) / 60000)
  if (diffMinutes <= -5) return { status: 'ahead', diffMinutes }
  if (diffMinutes <= 5) return { status: 'on_time', diffMinutes }
  return { status: 'delayed', diffMinutes }
}

export function formatDayDate(isoDate) {
  return new Date(`${isoDate}T00:00:00+05:30`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatShortDate(isoDate) {
  return new Date(`${isoDate}T00:00:00+05:30`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateRange(startIso, endIso) {
  const start = new Date(`${startIso}T00:00:00+05:30`)
  const end = new Date(`${endIso}T00:00:00+05:30`)
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  if (sameMonth) {
    const month = end.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    return `${start.getDate()}–${end.getDate()} ${month}`
  }
  return `${formatShortDate(startIso)} – ${formatShortDate(endIso)}`
}
