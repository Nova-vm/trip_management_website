import { motion } from 'framer-motion'
import { Megaphone } from 'lucide-react'
import Card from '../ui/Card'
import EmptyState from '../ui/EmptyState'

export default function AnnouncementPreview({ announcements }) {
  if (!announcements.length) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No announcements yet"
        description="Admin updates will show up here."
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {announcements.slice(0, 3).map((item, index) => (
        <motion.div
          key={item.announcementId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.08, duration: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-sunrise-400" />
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">{item.message}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
