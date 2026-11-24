// EDIT HERE — the `expenses` array below is now just a reference example,
// kept so you can see the exact shape of one expense. The real Expenses
// page no longer reads this file — expenses now live in Firestore (see
// src/lib/useExpenses.js) and start out empty; add real ones from the
// Expenses page's "Add" button instead of editing this file.
// Guide: Read_Me/HOW_TO_MAKE_CHANGES.md -> "Expenses"
//
// `expenseCategories` below IS still live — it's the dropdown list shown
// in the "Add expense" form. Add/remove a category there any time.
//
// Amounts are in integer paise throughout (see src/lib/splitwise.js) to
// avoid floating-point rounding errors.
export const expenses = [
  {
    expenseId: 'e1',
    title: 'Dinner at Manali Inn',
    amountInPaise: 440000, // ₹4,400
    category: 'Food',
    paidBy: 'u1',
    participants: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11'],
    splitMethod: 'equal',
    shares: null,
    date: '2026-12-13',
    notes: null,
  },
  {
    expenseId: 'e2',
    title: 'Fuel top-up',
    amountInPaise: 250000, // ₹2,500
    category: 'Fuel',
    paidBy: 'u2',
    participants: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11'],
    splitMethod: 'equal',
    shares: null,
    date: '2026-12-14',
    notes: null,
  },
  {
    expenseId: 'e3',
    title: 'Snacks & tea, Solang Valley',
    amountInPaise: 68000, // ₹680
    category: 'Snacks',
    paidBy: 'u3',
    participants: ['u1', 'u2', 'u3', 'u4', 'u5'],
    splitMethod: 'equal',
    shares: null,
    date: '2026-12-14',
    notes: null,
  },
  {
    expenseId: 'e4',
    title: 'Kasol shopping run',
    amountInPaise: 120000, // ₹1,200
    category: 'Shopping',
    paidBy: 'u4',
    participants: ['u4', 'u5', 'u6'],
    splitMethod: 'custom_amount',
    shares: { u4: 20000, u5: 50000, u6: 50000 },
    date: '2026-12-15',
    notes: null,
  },
]

export const expenseCategories = [
  'Food',
  'Snacks',
  'Fuel',
  'Tea & Coffee',
  'Shopping',
  'Transport',
  'Adventure Activities',
  'Hotel Extras',
  'Miscellaneous',
]
