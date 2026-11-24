export default function ProgressBar({ value, max = 100, className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-mountain-500 to-sunrise-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
