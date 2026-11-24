import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { itineraryDays } from '../data/mockItinerary'
import { useTripConfig } from '../context/TripConfigContext'
import DayCard from '../components/itinerary/DayCard'
import SectionHeading from '../components/ui/SectionHeading'
import { getActiveDayNumber } from '../lib/dateTime'

export default function ItineraryPage() {
  const { tripConfig } = useTripConfig()
  const activeDayNumber = getActiveDayNumber(itineraryDays)
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  return (
    <div className="px-4 pt-4">
      <SectionHeading title="Itinerary" subtitle={`${tripConfig.tripName} · day by day`} />
      <div className="relative flex flex-col gap-4 border-l-2 border-white/10 pl-5">
        {itineraryDays.map((day) => (
          <div key={day.dayId} id={`day-${day.dayNumber}`} className="relative">
            <span
              className={`absolute -left-[26px] top-4 h-3 w-3 rounded-full ${
                day.dayNumber === activeDayNumber ? 'bg-sunrise-500' : 'bg-mountain-500'
              }`}
            />
            <DayCard day={day} isActive={day.dayNumber === activeDayNumber} />
          </div>
        ))}
      </div>
    </div>
  )
}
