import { Bus, Landmark, Snowflake, Waves, Droplets, Compass } from 'lucide-react'

// Maps each itinerary day's "vibe" to how its DayCard should feel — purely
// cosmetic, no backend needed. Keys match the `vibe` field on each day in
// src/data/mockItinerary.js.
export const DAY_VIBES = {
  travel: {
    label: 'On the road',
    icon: Bus,
    gradient: 'from-navy-700/70 via-navy-800 to-navy-800',
    accent: 'text-slate-300',
    particles: false,
  },
  temple: {
    label: 'Temple visit',
    icon: Landmark,
    gradient: 'from-sunrise-500/15 via-navy-800 to-navy-800',
    accent: 'text-sunrise-400',
    particles: true,
  },
  snow: {
    label: 'Snow & adventure',
    icon: Snowflake,
    gradient: 'from-mountain-400/20 via-navy-800 to-navy-800',
    accent: 'text-mountain-300',
    particles: true,
  },
  river: {
    label: 'River & hot springs',
    icon: Waves,
    gradient: 'from-mountain-500/20 via-navy-800 to-navy-800',
    accent: 'text-mountain-400',
    particles: true,
  },
  waterfall: {
    label: 'Waterfalls & valley',
    icon: Droplets,
    gradient: 'from-mountain-400/20 via-navy-800 to-navy-800',
    accent: 'text-mountain-300',
    particles: true,
  },
  default: {
    label: 'Exploring',
    icon: Compass,
    gradient: 'from-navy-700/70 via-navy-800 to-navy-800',
    accent: 'text-slate-300',
    particles: false,
  },
}
