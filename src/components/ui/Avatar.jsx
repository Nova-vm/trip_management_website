import { initialsFor } from '../../data/mockMembers'

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
}

export default function Avatar({ name, size = 'md' }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mountain-500 to-navy-700 font-display font-semibold text-white ${SIZES[size]}`}
    >
      {initialsFor(name)}
    </div>
  )
}
