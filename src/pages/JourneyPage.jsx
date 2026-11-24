import { useEffect } from 'react'
import { Satellite } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTripConfig } from '../context/TripConfigContext'
import { captureLocationForUser, useLocationSharing } from '../lib/useLocationSharing'
import { itineraryDays } from '../data/mockItinerary'
import { getTripPhase, getActiveDayNumber } from '../lib/dateTime'
import RouteTimeline from '../components/journey/RouteTimeline'
import LiveLocationMap from '../components/journey/LiveLocationMap'
import ScheduleExampleCard from '../components/journey/ScheduleExampleCard'
import SectionHeading from '../components/ui/SectionHeading'
import Card from '../components/ui/Card'
import StatusBadge from '../components/ui/StatusBadge'

// Prefers matching the day's *end* location, using the last matching stop
// in the route (so a round trip like "...Delhi" at the start and end of
// the list correctly resolves to the final Delhi on the last day, not the
// first one).
function destinationIndexForDay(destinations, day) {
  if (!day) return -1
  const endIdx = destinations.lastIndexOf(day.endLocation)
  if (endIdx !== -1) return endIdx
  return destinations.indexOf(day.startLocation)
}

export default function JourneyPage() {
  const { firebaseUser, members, isOwner } = useAuth()
  const { tripConfig } = useTripConfig()
  const { sharingEnabled, locations } = useLocationSharing()
  const canSeeMap = isOwner || sharingEnabled || locations.length > 0
  const phase = getTripPhase(tripConfig)
  const activeDayNumber = getActiveDayNumber(itineraryDays)
  const activeDay = itineraryDays.find((day) => day.dayNumber === activeDayNumber)
  const currentIndex =
    phase === 'before' ? -1 : destinationIndexForDay(tripConfig.destinations, activeDay)

  // A fresh snapshot right when someone's actually looking at the map —
  // on top of the one <LocationCapture/> already takes at login. Calling
  // it twice is harmless, it just overwrites the same location document.
  useEffect(() => {
    if (firebaseUser) captureLocationForUser(firebaseUser.uid)
  }, [firebaseUser])

  return (
    <div className="flex flex-col gap-5 px-4 pt-4">
      <div>
        <SectionHeading
          title="Live Journey"
          subtitle={`Planned route · ${tripConfig.destinations[0]} to ${
            tripConfig.destinations[tripConfig.destinations.length - 1]
          }`}
        />
        <Card className="p-2">
          <RouteTimeline destinations={tripConfig.destinations} currentIndex={currentIndex} />
        </Card>
        {phase !== 'before' && activeDay && (
          <p className="mt-2 px-1 text-xs text-slate-500">
            Based on today's date — Day {activeDay.dayNumber}: {activeDay.title}.
          </p>
        )}
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-medium text-white">
            <Satellite className="h-4 w-4 text-mountain-400" /> Live locations
          </p>
          <StatusBadge status={canSeeMap ? 'in_progress' : 'upcoming'} />
        </div>
        {canSeeMap ? (
          <div className="mt-3">
            <LiveLocationMap locations={locations} members={members} />
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-400">
            Off right now — ask the Owner to turn on location sharing from Admin if you'd like
            to see where everyone else is.
          </p>
        )}
      </Card>

      <ScheduleExampleCard />
    </div>
  )
}
