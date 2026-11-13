import { Navigate, Route, Routes } from 'react-router-dom'
import { daysUntil, tripById, useCarnet } from './store'
import { NEXT_TRIP_ID } from './data/demo'
import { stepsDone } from './logic'
import { ConfettiProvider } from './parts/bits'
import { DiscoverScreen } from './screens/DiscoverScreen'
import { HomeScreen } from './screens/HomeScreen'
import { OnsiteScreen } from './screens/OnsiteScreen'
import { PrepScreen } from './screens/PrepScreen'
import { StepScreen } from './screens/StepScreen'
import { TripScreen } from './screens/TripScreen'
import { TripsScreen } from './screens/TripsScreen'
import './carnet.css'

/** Module Carnet de voyage, monté sur /carnet/*. */
export function CarnetModule() {
  return (
    <ConfettiProvider>
      <Routes>
        <Route index element={<HomeScreen />} />
        <Route path="voyages" element={<TripsScreen />} />
        <Route path="voyages/:id" element={<TripScreen />} />
        <Route path="preparer" element={<PrepScreen />} />
        <Route path="preparer/:tripId" element={<PrepScreen />} />
        <Route path="preparer/:tripId/:stepId" element={<StepScreen />} />
        <Route path="discover" element={<DiscoverScreen />} />
        <Route path="sur-place" element={<OnsiteScreen />} />
        <Route path="*" element={<Navigate to="/carnet" replace />} />
      </Routes>
    </ConfettiProvider>
  )
}

/** Texte de la carte du module sur l'accueil du QG. */
export function useCarnetSummary() {
  const carnet = useCarnet()
  const trip = tripById(NEXT_TRIP_ID)!
  const days = daysUntil(trip)
  const prep = carnet.state.preps[NEXT_TRIP_ID]
  return {
    title: trip.name,
    note: days > 1 ? `dans ${days} jours` : days === 1 ? 'demain' : days === 0 ? 'c’est aujourd’hui' : `${prep ? stepsDone(prep.steps) : 0}/9 étapes`,
  }
}

export const CARNET_NAV = [
  { to: '', label: 'Accueil', emoji: '🌍', color: 'honey', rotate: 4 },
  { to: 'voyages', label: 'Voyages', emoji: '🧳', color: 'peach', rotate: -5 },
  { to: 'discover', label: 'Discover', emoji: '🧭', color: 'mist', rotate: -3, central: true },
  { to: 'preparer', label: 'Préparer', emoji: '🗺️', color: 'mint', rotate: 5 },
  { to: 'sur-place', label: 'Sur place', emoji: '📍', color: 'coral', rotate: -3 },
] as const
