// LOGIC FILE — not usually something to hand-edit. This is the shared-
// expense math (equal/custom splits, balances, settle-up suggestions). To
// change WHAT expenses exist, edit mockExpenses.js instead; only touch
// this file if you actually want to change HOW the splitting math works.
//
// Pure expense-splitting logic — no Firebase dependency, so this is
// exactly as correct now as it will be once Phase 2 points it at real
// Firestore data. Everything is integer paise to avoid floating-point
// rounding errors (spec section 10.3).

export function computeShares(expense) {
  const { amountInPaise, participants, splitMethod, shares } = expense
  if (splitMethod === 'equal') return equalSplit(amountInPaise, participants)
  if (splitMethod === 'custom_amount') {
    assertSharesMatchTotal(shares, amountInPaise)
    return shares
  }
  if (splitMethod === 'custom_percentage') return percentageSplit(amountInPaise, shares)
  throw new Error(`Unknown split method: ${splitMethod}`)
}

export function equalSplit(amountInPaise, participants) {
  const base = Math.floor(amountInPaise / participants.length)
  const remainder = amountInPaise - base * participants.length
  const shares = {}
  participants.forEach((id, index) => {
    shares[id] = base + (index < remainder ? 1 : 0)
  })
  return shares
}

function percentageSplit(amountInPaise, percentages) {
  const entries = Object.entries(percentages)
  let allocated = 0
  const shares = {}
  entries.forEach(([id, pct], index) => {
    if (index === entries.length - 1) {
      shares[id] = amountInPaise - allocated // last share absorbs rounding, never loses a paisa
    } else {
      const amount = Math.round((amountInPaise * pct) / 100)
      shares[id] = amount
      allocated += amount
    }
  })
  return shares
}

function assertSharesMatchTotal(shares, amountInPaise) {
  const sum = Object.values(shares).reduce((a, b) => a + b, 0)
  if (sum !== amountInPaise) {
    throw new Error(`Custom shares (${sum}) do not add up to the expense total (${amountInPaise})`)
  }
}

// Member Balance = Total Paid by Member − Total Expense Share of Member
// (spec section 10.4). Positive = should receive money, negative = owes.
export function computeBalances(expenses, memberIds) {
  const paid = Object.fromEntries(memberIds.map((id) => [id, 0]))
  const share = Object.fromEntries(memberIds.map((id) => [id, 0]))

  expenses.forEach((expense) => {
    paid[expense.paidBy] = (paid[expense.paidBy] ?? 0) + expense.amountInPaise
    const shares = computeShares(expense)
    Object.entries(shares).forEach(([id, amount]) => {
      share[id] = (share[id] ?? 0) + amount
    })
  })

  return Object.fromEntries(
    memberIds.map((id) => [
      id,
      {
        paidPaise: paid[id] ?? 0,
        sharePaise: share[id] ?? 0,
        balancePaise: (paid[id] ?? 0) - (share[id] ?? 0),
      },
    ]),
  )
}

// Greedy settle-up: match the biggest creditor with the biggest debtor
// until every balance is zero (spec section 10.5).
export function suggestSettlements(balances) {
  const creditors = []
  const debtors = []
  Object.entries(balances).forEach(([id, { balancePaise }]) => {
    if (balancePaise > 0) creditors.push({ id, amount: balancePaise })
    else if (balancePaise < 0) debtors.push({ id, amount: -balancePaise })
  })
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const settlements = []
  let ci = 0
  let di = 0
  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci]
    const debtor = debtors[di]
    const amount = Math.min(creditor.amount, debtor.amount)
    settlements.push({ fromUser: debtor.id, toUser: creditor.id, amountInPaise: amount })
    creditor.amount -= amount
    debtor.amount -= amount
    if (creditor.amount === 0) ci += 1
    if (debtor.amount === 0) di += 1
  }
  return settlements
}

export function formatPaise(paise) {
  const rupees = paise / 100
  const hasFraction = rupees % 1 !== 0
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
}
