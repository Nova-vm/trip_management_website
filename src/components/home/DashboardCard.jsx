import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import Card from '../ui/Card'

export default function DashboardCard({ icon: Icon, label, value, hint, to, index = 0 }) {
  const content = (
    <Card className={`p-4 ${to ? 'transition-colors hover:bg-navy-800/90 active:scale-[0.98]' : ''}`}>
      <div className="flex items-center justify-between gap-2 text-slate-400">
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium">{label}</span>
        </span>
        {to && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
      </div>
      <p className="mt-2 font-display text-xl font-semibold text-white">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </Card>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
    >
      {to ? (
        <Link to={to} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </motion.div>
  )
}
