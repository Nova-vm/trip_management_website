import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TripConfigProvider } from './context/TripConfigContext'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingScreen from './components/ui/LoadingScreen'
import AppShell from './components/layout/AppShell'
import AccessPendingScreen from './components/layout/AccessPendingScreen'
import LocationCapture from './components/layout/LocationCapture'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ItineraryPage from './pages/ItineraryPage'
import JourneyPage from './pages/JourneyPage'
import PaymentsPage from './pages/PaymentsPage'
import ExpensesPage from './pages/ExpensesPage'
import GroupPage from './pages/GroupPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'

// Guards every route nested under it. Logged-out visitors get bounced to
// /login; logged-in visitors who aren't approved yet (or were removed) see
// AccessPendingScreen instead of the app — nothing else here knows or cares
// about auth.
// Guide: Read_Me/HOW_TO_MAKE_CHANGES.md -> "Login / Account"
function RequireAuth({ children }) {
  const { firebaseUser, profile, isOwner, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!firebaseUser) return <Navigate to="/login" replace />
  if (!profile) return <AccessPendingScreen reason="removed" />
  if (!profile.active && !isOwner) return <AccessPendingScreen reason="pending" />
  return children
}

// Each route below is wrapped in its own <ErrorBoundary>. If one section has
// a bug and crashes, only that section shows an error card — the nav and
// every other section keep working normally.
export default function App() {
  return (
    <TripConfigProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
          <Route element={<RequireAuth><LocationCapture /><AppShell /></RequireAuth>}>
            <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
            <Route path="/itinerary" element={<ErrorBoundary><ItineraryPage /></ErrorBoundary>} />
            <Route path="/journey" element={<ErrorBoundary><JourneyPage /></ErrorBoundary>} />
            <Route path="/payments" element={<ErrorBoundary><PaymentsPage /></ErrorBoundary>} />
            <Route path="/expenses" element={<ErrorBoundary><ExpensesPage /></ErrorBoundary>} />
            <Route path="/group" element={<ErrorBoundary><GroupPage /></ErrorBoundary>} />
            <Route path="/profile" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
            <Route path="/admin" element={<ErrorBoundary><AdminPage /></ErrorBoundary>} />
          </Route>
        </Routes>
      </AuthProvider>
    </TripConfigProvider>
  )
}
