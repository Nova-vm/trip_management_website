export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl2 border border-dashed border-white/10 px-6 py-10 text-center">
      {Icon && <Icon className="h-8 w-8 text-slate-500" />}
      <p className="font-display text-sm font-medium text-slate-200">{title}</p>
      {description && <p className="text-xs text-slate-400">{description}</p>}
    </div>
  )
}
