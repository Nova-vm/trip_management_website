import { createContext, useContext, useState } from 'react'
import { trip as defaultTripConfig } from '../data/mockTrip'

// Centralizes every trip-specific fact (name, dates, destinations, member
// count) in one editable place, so Super Admin can reconfigure it from the
// UI and the whole app can be reused for a future trip without code
// changes. Phase 1: lives in memory only (resets on reload). Phase 2: backed
// by the trips/{tripId} Firestore document instead, same shape.
// Guide: Read_Me/HOW_TO_MAKE_CHANGES.md -> "Trip settings (Super Admin)"
const TripConfigContext = createContext(null)

export function TripConfigProvider({ children }) {
  const [tripConfig, setTripConfig] = useState(defaultTripConfig)

  function updateTripConfig(partial) {
    setTripConfig((current) => ({ ...current, ...partial }))
  }

  return (
    <TripConfigContext.Provider value={{ tripConfig, updateTripConfig }}>
      {children}
    </TripConfigContext.Provider>
  )
}

export function useTripConfig() {
  const context = useContext(TripConfigContext)
  if (!context) throw new Error('useTripConfig must be used inside <TripConfigProvider>')
  return context
}
