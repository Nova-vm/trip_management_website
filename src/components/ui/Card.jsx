export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl2 border border-white/5 bg-navy-800/60 shadow-card ${className}`}>
      {children}
    </div>
  )
}
