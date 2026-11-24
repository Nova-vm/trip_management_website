// Real interactive map (free OpenStreetMap tiles — no API key, no billing)
// with one pin per member who has a captured location. JourneyPage decides
// WHETHER this renders at all (Owner always; a member only once sharing is
// on) — this component just draws whatever `locations` it's handed.
import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { initialsFor } from '../../data/mockMembers'

function relativeTime(date) {
  if (!date) return 'just now'
  const minutes = Math.round((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

// Matches Avatar.jsx's look (gradient circle + initials) instead of
// Leaflet's default marker image — sidesteps a known Leaflet+Vite bundling
// issue with the default marker PNGs, and looks native to the app. Inline
// styles (not Tailwind classes) on purpose: this HTML is handed straight to
// Leaflet via a plain string, outside React's own render tree.
function memberDivIcon(name) {
  return L.divIcon({
    html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:linear-gradient(135deg,#3E7FAF,#1A2740);border:2px solid #fff;color:#fff;font-weight:600;font-size:12px;font-family:Poppins,sans-serif;box-shadow:0 2px 6px rgba(7,11,20,0.5);">${initialsFor(name)}</div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  })
}

export default function LiveLocationMap({ locations, members }) {
  const pins = useMemo(() => {
    return locations
      .map((loc) => {
        const member = members.find((m) => m.uid === loc.uid)
        if (!member || loc.lat == null || loc.lng == null) return null
        return {
          uid: loc.uid,
          name: member.name,
          lat: loc.lat,
          lng: loc.lng,
          updatedAt: loc.updatedAt?.toDate ? loc.updatedAt.toDate() : null,
        }
      })
      .filter(Boolean)
  }, [locations, members])

  if (pins.length === 0) {
    return (
      <p className="p-4 text-center text-xs text-slate-500">
        Nobody's location has come in yet — it's captured quietly the next time someone opens
        the app.
      </p>
    )
  }

  const bounds = L.latLngBounds(pins.map((pin) => [pin.lat, pin.lng]))

  return (
    <div className="h-64 w-full overflow-hidden rounded-xl2">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [40, 40], maxZoom: 14 }}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((pin) => (
          <Marker key={pin.uid} position={[pin.lat, pin.lng]} icon={memberDivIcon(pin.name)}>
            <Popup>
              <span className="font-medium">{pin.name}</span>
              <br />
              last seen {relativeTime(pin.updatedAt)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
