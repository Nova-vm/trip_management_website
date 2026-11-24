// EDIT HERE — the day-by-day plan. Add/remove/edit a day by editing the
// objects in itineraryDays below: date, title, hotel, meals, activities,
// and "vibe" (travel/temple/snow/river/waterfall) which themes the
// Itinerary page's background for that day.
// Guide: Read_Me/HOW_TO_MAKE_CHANGES.md -> "Itinerary"
//
// Seeded from the Day 1-7 schedule in the spec (section 20). Times are
// planned placeholders pending the Day 1/2 clarification flagged in
// Read_Me/PROJECT_PLAN.md. All statuses start "upcoming" until the trip
// begins — nothing here is auto-marked "completed" by date alone.

const IMG = {
  road: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=1200&auto=format&fit=crop',
  temple: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1200&auto=format&fit=crop',
  valley: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop',
  river: 'https://images.unsplash.com/photo-1465189684280-6a8fa9b19a7a?q=80&w=1200&auto=format&fit=crop',
  waterfall: 'https://images.unsplash.com/photo-1434608519344-49d01f7d4f03?q=80&w=1200&auto=format&fit=crop',
  pass: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1200&auto=format&fit=crop',
}

function activity(id, title, { location, start, end, image, optional = false, notes } = {}) {
  return {
    activityId: id,
    title,
    location,
    imageUrl: image ?? IMG.valley,
    plannedStart: start ?? null,
    plannedEnd: end ?? null,
    actualStart: null,
    actualEnd: null,
    status: 'upcoming',
    optional,
    extraCharge: optional,
    notes: notes ?? null,
  }
}

export const itineraryDays = [
  {
    dayId: 'day-1',
    dayNumber: 1,
    date: '2026-12-12',
    title: 'Delhi to Manali',
    vibe: 'travel',
    startLocation: 'Delhi',
    endLocation: 'Manali',
    description:
      'Overnight journey towards Manali. Exact departure time and transport mode to be confirmed against the voucher.',
    hotel: null,
    meals: 'Not specified',
    activities: [
      activity('a1-1', 'Departure from Delhi', {
        location: 'Delhi Railway Station (per voucher)',
        start: '17:00',
        image: IMG.road,
        notes: 'Transport mode to be confirmed — see open data questions.',
      }),
    ],
  },
  {
    dayId: 'day-2',
    dayNumber: 2,
    date: '2026-12-13',
    title: 'Manali Local Sightseeing',
    vibe: 'temple',
    startLocation: 'Manali',
    endLocation: 'Manali',
    description: 'Arrival and a full day covering Manali’s most-loved local spots.',
    hotel: 'Kullu Manali Inn',
    meals: 'Breakfast, Dinner',
    activities: [
      activity('a2-1', 'Hadimba Devi Temple', { location: 'Manali', image: IMG.temple }),
      activity('a2-2', 'Ghatotkacha Temple', { location: 'Manali', image: IMG.temple }),
      activity('a2-3', 'Clubhouse', { location: 'Manali', image: IMG.valley }),
      activity('a2-4', 'Vashisht Hot Springs', { location: 'Manali', image: IMG.river }),
    ],
  },
  {
    dayId: 'day-3',
    dayNumber: 3,
    date: '2026-12-14',
    title: 'Solang Valley',
    vibe: 'snow',
    startLocation: 'Manali',
    endLocation: 'Manali',
    description: 'Day trip to Solang Valley with optional adventure activities, weather permitting.',
    hotel: 'Kullu Manali Inn',
    meals: 'Breakfast, Dinner',
    activities: [
      activity('a3-1', 'Solang Valley', { location: 'Solang Valley', image: IMG.valley }),
      activity('a3-2', 'Optional adventure activities', {
        location: 'Solang Valley',
        image: IMG.pass,
        optional: true,
        notes: 'Subject to weather and additional charges.',
      }),
    ],
  },
  {
    dayId: 'day-4',
    dayNumber: 4,
    date: '2026-12-15',
    title: 'Manali → Kullu → Manikaran → Kasol',
    vibe: 'river',
    startLocation: 'Manali',
    endLocation: 'Kasol',
    description: 'Travel day covering Kullu, Manikaran and arrival at Kasol.',
    hotel: 'River View Camps, Kasol',
    meals: 'Breakfast, Dinner',
    activities: [
      activity('a4-1', 'Devlok Manali', { location: 'Manali', image: IMG.valley }),
      activity('a4-2', 'Vaishno Devi Temple', { location: 'Kullu', image: IMG.temple }),
      activity('a4-3', 'Pashmina showrooms', { location: 'Kullu', image: IMG.valley }),
      activity('a4-4', 'Optional rafting & paragliding', {
        location: 'Kullu',
        image: IMG.river,
        optional: true,
      }),
      activity('a4-5', 'Manikaran Gurudwara & Hot Springs', { location: 'Manikaran', image: IMG.temple }),
    ],
  },
  {
    dayId: 'day-5',
    dayNumber: 5,
    date: '2026-12-16',
    title: 'Kasol to Jibhi',
    vibe: 'travel',
    startLocation: 'Kasol',
    endLocation: 'Jibhi',
    description: 'Scenic drive via the Aut Tunnel into the Tirthan Valley region.',
    hotel: 'Lato The Hut / Chauhans Palace',
    meals: 'Breakfast, Dinner',
    activities: [
      activity('a5-1', 'Aut Tunnel', { location: 'En route', image: IMG.road }),
      activity('a5-2', 'Tirthan Valley', { location: 'Tirthan Valley', image: IMG.valley }),
    ],
  },
  {
    dayId: 'day-6',
    dayNumber: 6,
    date: '2026-12-17',
    title: 'Jibhi Local Sightseeing',
    vibe: 'waterfall',
    startLocation: 'Jibhi',
    endLocation: 'Jibhi',
    description: 'Waterfalls, viewpoints and an optional high-altitude lake trek.',
    hotel: 'Lato The Hut / Chauhans Palace',
    meals: 'Breakfast, Dinner',
    activities: [
      activity('a6-1', 'Jibhi Waterfall', { location: 'Jibhi', image: IMG.waterfall }),
      activity('a6-2', 'Mini Thailand', { location: 'Jibhi', image: IMG.valley }),
      activity('a6-3', 'Jalori Pass', { location: 'Jalori Pass', image: IMG.pass }),
      activity('a6-4', 'Optional Serolsar Lake trek', {
        location: 'Serolsar Lake',
        image: IMG.pass,
        optional: true,
      }),
    ],
  },
  {
    dayId: 'day-7',
    dayNumber: 7,
    date: '2026-12-18',
    title: 'Jibhi to Delhi',
    vibe: 'travel',
    startLocation: 'Jibhi',
    endLocation: 'Delhi',
    description: 'Check-out and return journey by private AC vehicle (per voucher) to Delhi.',
    hotel: null,
    meals: 'Breakfast',
    activities: [
      activity('a7-1', 'Check-out', { location: 'Jibhi', image: IMG.valley }),
      activity('a7-2', 'Return journey to Delhi', {
        location: 'Delhi',
        image: IMG.road,
        notes: 'Drop at Delhi airport or railway station.',
      }),
    ],
  },
]
