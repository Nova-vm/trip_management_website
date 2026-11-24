import { useState } from 'react'

// Cover/activity photos are hotlinked placeholders (spec says real trip
// photos come later). If one fails to load — or there's no network — this
// shows a themed gradient instead of a broken-image icon.
export default function FallbackImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-mountain-600 via-navy-700 to-navy-900 ${className}`}
      >
        <span className="px-3 text-center text-xs text-white/60">{alt}</span>
      </div>
    )
  }

  return (
    <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />
  )
}
