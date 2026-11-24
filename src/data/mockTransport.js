// NOT YET WIRED IN — no page currently reads this file; the voucher's two
// vehicle legs are summarised as text inside the Journey page instead.
// Kept here, ready to use, for a future dedicated Transport detail view.
//
// The voucher mentions both a Volvo journey and a 12-seat Tempo Traveller —
// kept as two separate legs here rather than assumed to be the same vehicle.
// See Read_Me/PROJECT_PLAN.md "Open data questions".
export const transportLegs = [
  {
    transportId: 't1',
    provider: 'Volvo (per voucher — to confirm)',
    vehicleType: 'Volvo coach',
    capacity: null,
    startLocation: 'Delhi',
    endLocation: 'Manali',
    travelDate: '2026-12-12',
    costPaise: null,
    advancePaidPaise: null,
    remainingAmountPaise: null,
    notes: 'Overnight journey, Day 1 → Day 2. Mode to be confirmed.',
  },
  {
    transportId: 't2',
    provider: 'Local operator',
    vehicleType: '12-seat Tempo Traveller',
    capacity: 12,
    startLocation: 'Manali',
    endLocation: 'Jibhi',
    travelDate: '2026-12-13',
    costPaise: null,
    advancePaidPaise: null,
    remainingAmountPaise: null,
    notes: 'Himachal sightseeing + inter-destination transport for the group.',
  },
  {
    transportId: 't3',
    provider: 'Local operator',
    vehicleType: 'Private AC vehicle',
    capacity: null,
    startLocation: 'Jibhi',
    endLocation: 'Delhi',
    travelDate: '2026-12-18',
    costPaise: null,
    advancePaidPaise: null,
    remainingAmountPaise: null,
    notes: 'Return journey to Delhi airport/railway station, per voucher.',
  },
]
