import { CalendarCheck, MapPin, Wallet, Receipt } from 'lucide-react'
import TripHeaderCard from '../components/home/TripHeaderCard'
import DashboardCard from '../components/home/DashboardCard'
import AnnouncementPreview from '../components/home/AnnouncementPreview'
import SectionHeading from '../components/ui/SectionHeading'
import { useTripConfig } from '../context/TripConfigContext'
import { itineraryDays } from '../data/mockItinerary'
import { useAnnouncements } from '../lib/useAnnouncements'
import { useExpenses } from '../lib/useExpenses'
import { usePayments } from '../lib/usePayments'
import { formatPaise } from '../lib/splitwise'
import { getActiveDayNumber, getTripPhase } from '../lib/dateTime'

export default function HomePage() {
  const { tripConfig } = useTripConfig()
  const { announcements } = useAnnouncements()
  const { expenses } = useExpenses()
  const { memberPayments } = usePayments()
  const phase = getTripPhase(tripConfig)
  const activeDayNumber = getActiveDayNumber(itineraryDays)
  const activeDay = itineraryDays.find((day) => day.dayNumber === activeDayNumber)
  const highlightedDay = activeDay ?? itineraryDays[0]

  const totalExpensesPaise = expenses.reduce((sum, expense) => sum + expense.amountInPaise, 0)
  const pendingPayments = memberPayments.filter((payment) => payment.status !== 'paid').length

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div className="md:px-4 md:pt-4">
        <TripHeaderCard trip={tripConfig} />
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 md:grid-cols-4">
        <DashboardCard
          index={0}
          to="/journey"
          icon={MapPin}
          label={phase === 'before' ? 'Starting point' : 'Current destination'}
          value={phase === 'before' ? highlightedDay.startLocation : highlightedDay.endLocation}
        />
        <DashboardCard
          index={1}
          to={`/itinerary#day-${highlightedDay.dayNumber}`}
          icon={CalendarCheck}
          label={phase === 'before' ? 'Day 1 plan' : "Today's plan"}
          value={`Day ${highlightedDay.dayNumber} · ${highlightedDay.title}`}
        />
        <DashboardCard
          index={2}
          to="/expenses"
          icon={Receipt}
          label="Group expenses so far"
          value={formatPaise(totalExpensesPaise)}
          hint={`${expenses.length} expenses logged`}
        />
        <DashboardCard
          index={3}
          to="/payments"
          icon={Wallet}
          label="Pending payments"
          value={`${pendingPayments} of ${memberPayments.length}`}
          hint="Transport contribution"
        />
      </div>

      <div className="px-4">
        <SectionHeading title="Announcements" subtitle="Latest updates from the trip owner" />
        <AnnouncementPreview announcements={announcements} />
      </div>
    </div>
  )
}
