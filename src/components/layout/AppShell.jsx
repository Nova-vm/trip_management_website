import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Home, CalendarDays, MapPin, Wallet, Receipt, Users, User, LayoutGrid, Shield, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTripConfig } from '../../context/TripConfigContext'
import AccountMenu from './AccountMenu'

const PRIMARY_NAV = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/itinerary', label: 'Itinerary', icon: CalendarDays },
  { to: '/journey', label: 'Journey', icon: MapPin },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
]

const MORE_NAV = [
  { to: '/payments', label: 'Payments', icon: Wallet },
  { to: '/group', label: 'Group', icon: Users },
  { to: '/profile', label: 'Profile', icon: User },
]

const ADMIN_NAV = { to: '/admin', label: 'Admin', icon: Shield }

function navLinkClasses({ isActive }) {
  return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-mountain-500/15 text-mountain-400' : 'text-slate-300 hover:bg-white/5'
  }`
}

export default function AppShell() {
  const [moreOpen, setMoreOpen] = useState(false)
  const { isOwner } = useAuth()
  const { tripConfig } = useTripConfig()
  const desktopNav = isOwner ? [...PRIMARY_NAV, ...MORE_NAV, ADMIN_NAV] : [...PRIMARY_NAV, ...MORE_NAV]
  const sheetItems = isOwner ? [...MORE_NAV, ADMIN_NAV] : MORE_NAV

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row">
      <aside className="hidden w-64 shrink-0 border-r border-white/5 p-4 md:flex md:flex-col">
        <div className="mb-6 px-2">
          <p className="font-display text-lg font-semibold text-white">TRIPVERSE</p>
          <p className="text-xs text-slate-400">{tripConfig.tripName}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {desktopNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClasses} end={item.to === '/'}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <AccountMenu />
      </aside>

      <header className="flex items-center justify-between border-b border-white/5 px-4 py-3 md:hidden">
        <div>
          <p className="font-display text-base font-semibold text-white">TRIPVERSE</p>
          <p className="text-xs text-slate-400">{tripConfig.tripName}</p>
        </div>
        <AccountMenu compact />
      </header>

      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-navy-900/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-2 py-2">
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium ${
                  isActive ? 'text-mountain-400' : 'text-slate-400'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-slate-400"
          >
            <LayoutGrid className="h-5 w-5" />
            More
          </button>
        </div>
      </nav>

      {moreOpen && <MoreSheet items={sheetItems} onClose={() => setMoreOpen(false)} />}
    </div>
  )
}

function MoreSheet({ items, onClose }) {
  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/50 md:hidden" onClick={onClose}>
      <div className="w-full rounded-t-2xl bg-navy-800 p-4 pb-8" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-sm font-semibold text-white">More</p>
          <button type="button" onClick={onClose} className="text-slate-400" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className="flex flex-col items-center gap-2 rounded-xl bg-white/5 py-4 text-xs font-medium text-slate-200"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}
