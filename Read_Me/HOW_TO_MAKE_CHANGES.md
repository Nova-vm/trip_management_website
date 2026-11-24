# How to Make Changes to TRIPVISER

This is the one file to open when you want to change something and aren't sure where.
Every section below follows the exact same pattern, so once one of them makes sense,
all the others work the same way.

**If you only remember one thing:** every file this guide points you to also has a short
`EDIT HERE` comment at the very top of it, saying the same thing in-place. So even if you
lose this file, opening the right file will remind you.

## The pattern every section follows

Think of each of the 8 tabs (Home, Itinerary, Journey, Expenses, Payments, Group, Profile,
Admin) as its own mini Flask app with its own template and its own data:

| Flask word you know | TRIPVISER equivalent |
|---|---|
| `app.py` route / view function | `src/pages/XPage.jsx` — one file per tab |
| template (`.html`) | `src/components/x/*.jsx` — the visual pieces that page uses |
| data passed into the template | `src/data/mockX.js` — the actual numbers/text, in one place |

So to change what a page **shows**, you almost always only need to edit the `data/mockX.js`
file. You only need to touch a `components/x/*.jsx` file if you want to change how
something **looks**, and you'd only touch `pages/XPage.jsx` if you want to change what's on
the page at all.

This separation is also the answer to "build it like Microservices" — each tab's data file,
components, and page file only talk to its own folder (plus the one shared `TripConfig`
described near the bottom). If Expenses has a bug, Payments, Group, Home etc. keep working —
each page is also wrapped in its own safety net (`ErrorBoundary`) so one broken section shows
a small error card instead of taking down the whole app.

## Quick map

| Section | Page file | Data file(s) | Components folder |
|---|---|---|---|
| Home | `src/pages/HomePage.jsx` | `src/data/mockTrip.js`; live Firestore `expenses`/`payments`/`announcements`, via `useExpenses.js`/`usePayments.js`/`useAnnouncements.js` | `src/components/home/` |
| Itinerary | `src/pages/ItineraryPage.jsx` | `src/data/mockItinerary.js` | `src/components/itinerary/` |
| Journey | `src/pages/JourneyPage.jsx` | `src/data/mockItinerary.js` (+ trip settings); live Firestore `locations`/`settings/app`, via `src/lib/useLocationSharing.js` | `src/components/journey/` |
| Expenses | `src/pages/ExpensesPage.jsx` | live Firestore `expenses` collection, via `src/lib/useExpenses.js` | `src/components/expenses/` |
| Payments | `src/pages/PaymentsPage.jsx` | live Firestore `payments`/`settings/payments`, via `src/lib/usePayments.js`; `src/data/mockTrainTickets.js` | `src/components/payments/` |
| Group | `src/pages/GroupPage.jsx` | live Firestore `members` collection, via `src/context/AuthContext.jsx` | `src/components/group/` |
| Profile | `src/pages/ProfilePage.jsx` | your own live Firestore profile, via `src/context/AuthContext.jsx` | (no separate folder yet — simple enough to live in the page file) |
| Admin | `src/pages/AdminPage.jsx` | reads from everywhere (it's the owner's overview) | (no separate folder yet) |
| Login / Account | `src/pages/LoginPage.jsx` | Firebase Authentication + Firestore `members`, via `src/context/AuthContext.jsx` | `src/components/layout/AccountMenu.jsx` |

---

## Site name / branding

**What it shows:** the "TRIPVISER" wordmark on the login screen and in the sidebar
(desktop)/header (mobile) of every page, the browser tab title, and the name shown if someone
adds the site to their phone's home screen.

**To rename the site**, there's no single source of truth yet — update the name in each of
these places:
- `src/pages/LoginPage.jsx` — the wordmark on the login screen itself.
- `src/components/layout/AppShell.jsx` — the wordmark shown in the desktop sidebar **and** the
  mobile top header (two separate lines in the same file — both need changing).
- `index.html` — the browser tab title (`<title>`) and the `<meta name="description">` line.
- `public/manifest.webmanifest` — the `name`/`short_name` used if someone adds the site to
  their phone's home screen.
- `package.json` — the `"name"` field. Nobody ever sees this one, but keep it in sync so it
  doesn't confuse whoever (human or AI) opens the project next.
- This file's own title, and `Read_Me/PROJECT_PLAN.md`'s title — cosmetic, but keeps every doc
  calling the project the same thing.

**Don't rename:** the GitHub repo itself or the live URL
(`nova-vm.github.io/trip_management_website/`) — changing either would break the link already
shared with and bookmarked by the group; a rename here only ever changes what's *displayed*,
never the address. Also leave every `tripverse-f6240` you see (in
`Read_Me/FIREBASE_SETUP_GUIDE.md`) completely alone — that's the real, fixed Firebase backend
project's ID, assigned once when it was created, and has nothing to do with the site's display
name — the same way a company can rebrand its product while its internal server hostname never
changes.

**Renamed TRIPVERSE → TRIPVISER on 2026-11-24** — see `PROJECT_PLAN.md` §10.10.

## Home

**What it shows:** trip name, date range, live countdown, 4 clickable summary boxes,
announcements.

**Common changes:**
- Change trip name / dates / member count → edit `src/data/mockTrip.js` (the starting
  values), **or** as the Owner, open the **Admin** tab → "Trip settings" and save — that
  changes it live without touching any file.
- Post or delete an announcement → as the Owner, open the **Admin** tab → "Announcements"
  card. Type a title + message and hit Post — it's live on Home for everyone immediately.
  Delete with the trash icon next to any posted one. No file to hand-edit anymore — this is
  real Firestore data via `src/lib/useAnnouncements.js`.
- Change how the countdown/cover image looks or animates →
  `src/components/home/TripHeaderCard.jsx`.
- Change what the 4 boxes link to or how they're laid out →
  `src/components/home/DashboardCard.jsx` (the box itself) and
  `src/pages/HomePage.jsx` (which page each box links to, via the `to="..."` prop).

**Don't touch:** `src/lib/dateTime.js` — that's the maths behind the countdown and "today",
not something to hand-edit (see "Logic files" below).

## Itinerary

**What it shows:** one card per day, with today's day visually highlighted and themed
(snow/temple/waterfall/etc. depending on the day's `vibe`).

**Common changes:**
- Add, remove, or edit a day's plan → `src/data/mockItinerary.js`. Each day is one object in
  the `itineraryDays` array — copy an existing day's shape to add a new one.
- Change a day's background theme → set that day's `vibe` field to one of: `travel`,
  `temple`, `snow`, `river`, `waterfall` (see `src/components/itinerary/dayVibes.js` for the
  full list and what each looks like).
- Change how a day card looks → `src/components/itinerary/DayCard.jsx`.

## Journey

**What it shows:** the route timeline (start → stops → end) and where the group currently is
along it, based on today's date.

**Common changes:**
- Change the list of stops → edit `destinations` in `src/data/mockTrip.js` (or the future
  Admin "route" control). The first and last entries are shown as the trip's start/end.
- Change which day maps to which stop → that's driven by each day's `startLocation` /
  `endLocation` in `src/data/mockItinerary.js` — keep those spelled exactly the same as the
  matching entries in `destinations`.
- **Live locations (added 2026-11-24):** every logged-in member's device quietly captures a
  one-time "where am I right now" snapshot (not continuous tracking) — at login, and again
  whenever Journey is opened — and writes it to a `locations` Firestore collection. There's no
  "share my location?" switch shown to a member; this part was a deliberate, already-made
  decision (see `tripverse-super-admin-decisions` memory). What's new is *who can see it*:
  - The Owner can **always** see everyone's last known location, as a real map with a pin per
    member (`src/components/journey/LiveLocationMap.jsx`, free OpenStreetMap tiles — no API
    key, no billing).
  - A regular member sees the same map once **either** the Owner turns on the **Admin** tab's
    global "Live location sharing" switch, **or** the Owner has force-switched that specific
    member on individually (see the next bullet). Until then, they see a short placeholder
    instead ("ask the Owner to turn it on").
  - **Per-member override (added 2026-11-24):** below the global switch, Admin has a
    "Per-member location override" list — one dropdown per active traveller: "Follow switch"
    (default), "Force on", or "Force off". This lets the Owner make one person visible even
    while the global switch is off, or hide just one person while it's on for everyone else.
    It's stored as a `locationOverride: true | false | null` field right on that member's own
    `members/{uid}` document — not a new collection — and only the Owner can change it.
  - The Owner can flip the global switch (or any override) at any time — changes apply
    immediately (their location capture itself never stops either way).
  - All of this logic lives in `src/lib/useLocationSharing.js` (a **LOGIC FILE**) and is
    enforced the same two-layer way as every other owner-only control: once in the UI, and
    once in `firestore.rules` (the `locations`/`settings/app` match blocks, plus the override
    field's guard in the `members` match block) — a member can never read someone else's
    location by bypassing the UI, only the Owner's account (or an override naming them) can.
  - Needs two new packages (`leaflet`, `react-leaflet`) — run `npm install` once after pulling
    this change.

## Expenses

**What it shows:** every shared expense, who paid, who owes whom (Splitwise-style), and a
running group total — live from Firestore, same "updates for everyone instantly" behaviour as
the Group page. Whoever signs up (via `/login`) is who shows up in the "Paid by" and
participant pickers — same real roster Group/Profile use, via `useAuth()`.

**Common changes:**
- There's no starting sample data anymore — the real Expenses collection starts empty, and
  members add real expenses themselves from the page (the "Add" button). They now genuinely
  persist and sync for everyone, not just this browser tab.
- Change expense categories available in the "Add" form →
  `expenseCategories` in `src/data/mockExpenses.js` (this one list is still live — see the
  file's own banner comment for what else in that file is now just a kept-for-reference
  example).
- **Don't touch** `src/lib/splitwise.js` unless you actually want to change the splitting
  formula itself, or `src/lib/useExpenses.js` unless you're changing how expenses are
  saved/loaded — see "Logic files" below.
- **Fixing a wrong expense (added 2026-11-24):** every expense card now has a small delete
  icon, visible **only to the Owner**, in its bottom-right corner — click it, confirm, it's
  gone. There's still no in-place *edit*, so the fix for "wrong amount" or "wrong person" is:
  Owner deletes it, then whoever it belongs to adds it again correctly. Enforced server-side
  too (`firestore.rules`' `expenses` match block), not just a hidden button.

**Not built yet (flagged by the user, coming soon):** Owner-only "clear all expenses" and
"set a budget" controls on the Admin page; an in-app in-place *edit* button for a single
expense (delete + re-add covers it for now).

## Payments

**What it shows:** transport-payment collection progress, each member's real payment status,
and train ticket details — live from Firestore (added 2026-11-24, see `PROJECT_PLAN.md`
§10.9).

**How the split actually works:** there's one Owner-set **package total**, split *evenly*
across however many approved travellers (`activeMembers`) exist right **now** — not a
hardcoded headcount. Approve or remove someone on Group/Admin and everyone's expected share
recalculates on its own. This is the answer to the old "11 vs 9 travellers" open question in
§5 of `PROJECT_PLAN.md` — the exact number stopped mattering once the split follows the real,
live roster instead of a number typed in once.

**Common changes:**
- Set or change the package total → as the Owner, Admin tab → "Package total" card. Updates
  everyone's expected share immediately.
- Mark someone paid, or approve a self-reported payment → as the Owner, Admin tab → "Payment
  review" list. A member can also self-report "I've paid" from their own **Profile** tab,
  which lands them here as "needs review" until you confirm it.
- Change train ticket info → `src/data/mockTrainTickets.js` (unchanged, still mock).
- All of this is real Firestore data now, via `src/lib/usePayments.js` (a **LOGIC FILE**) — no
  file to hand-edit for a member's payment status anymore.
- Two data files exist but aren't used by any page yet — `src/data/mockHotels.js` and
  `src/data/mockTransport.js`. They're kept ready for a future "Hotel details" /
  "Transport details" screen; today that information is shown as plain text instead.

## Group

**What it shows:** every **approved** traveller (`activeMembers` — see below), as a card —
live from Firestore, updating for everyone the instant someone new joins or gets approved. No
mock data involved.

**Common changes:**
- There's no file to edit to "add" a traveller anymore — they add themselves by signing up at
  `/login`, then wait for the Owner to approve them from **Admin** (see "Login / Account" and
  "Admin" below) before they show up here.
- **Heads up:** the `totalMembers` number on Home/Admin (`src/data/mockTrip.js`, or the Admin
  "Trip settings" form) is the *expected* headcount, and is allowed to be higher than the
  number of people who've actually signed up — Admin shows both (e.g. "7 / 11 signed up").
- Change what a member's card shows → `src/components/group/MemberCard.jsx`.
- **To remove someone (e.g. a test account) and free their seat:** as the Owner, every other
  member's card on this page now has a small remove button — click it, confirm, done. It
  deletes their Firestore profile, which immediately locks them out of the app (they'll see a
  "removed" screen if they try to log back in). **It does not delete their actual Firebase
  login** (email/password) — the browser-side SDK can only ever delete the currently-logged-in
  user's own account, never someone else's. To fully free up that email, or be sure the
  account can never log in again, also delete it by hand: Firebase console →
  **Authentication** tab → find their row → delete. See `PROJECT_PLAN.md` §10.4 for why this
  is a manual step.
- **To reset someone's password (added 2026-11-24):** next to that remove button is a small
  key icon, also Owner-only — click it, confirm, and that member gets a password-reset email.
  Nobody (not even the Owner) can set another person's password directly — Firebase doesn't
  allow that from the browser SDK — so this just sends them the same kind of reset link they'd
  get from the "Forgot password?" link on the login page themselves. See `PROJECT_PLAN.md`
  §10.7.
- To hand-fix a role, still do it directly in the Firebase console (Firestore Database →
  `members` collection → their document) — there's no in-app control for that yet (only
  `active`/approval is wired up so far).

## Profile

**What it shows:** your own real name, email and role, live from your Firestore `members`
document; your real transport-payment status (added 2026-11-24, with an "I've paid my share"
button while it's still pending); your real shared-expenses balance; and a working Log out
button.

**Common changes:**
- Name/role come from what you entered at sign-up. There's no in-app "edit my name" form yet —
  change it directly in the Firebase console (Firestore Database → `members` → your document)
  if you need to fix one.
- The payment-status card reads the same `src/lib/usePayments.js` hook Admin/Payments use —
  there's nothing to edit here, it's computed, not stored. Tapping "I've paid my share" moves
  you into Admin's "Payment review" list as "needs review" until the Owner confirms it.
- The expense-balance card is `computeBalances()` from `src/lib/splitwise.js` (same maths
  Expenses' balance card uses), filtered down to just your own `uid`.

## Login / Account

**What it shows:** the sign-up/log-in screen everyone sees before reaching any tab, and the
account box at the bottom of the desktop sidebar / top-right of the mobile header.

**Common changes:**
- Change how the login/signup screen itself looks (logo, tagline, colors, layout, the Log
  in/Sign up toggle, form fields, button) → it's all in one file, `src/pages/LoginPage.jsx` —
  no separate components folder for this page yet.
- Change the error messages shown for bad logins → the `ERROR_MESSAGES` map at the top of
  `src/pages/LoginPage.jsx`.
- Change how the account box looks, or what the Logout button does →
  `src/components/layout/AccountMenu.jsx`.
- Change login/signup rules — who becomes Owner, what gets saved per member →
  `src/context/AuthContext.jsx` (a **LOGIC FILE**, see below — only touch this if you mean to
  change how accounts/roles work).
- Change who's allowed to read/write the `members` collection → `firestore.rules` at the
  project root (paste it into the Firebase console's Rules tab by hand — see
  `Read_Me/FIREBASE_SETUP_GUIDE.md`).

**Who becomes Owner (updated 2026-11-24 — see `PROJECT_PLAN.md` §10.5):** Owner is now a fixed,
hardcoded email (`OWNER_EMAIL` at the top of `src/context/AuthContext.jsx`), not "whoever signs
up first." Sign up with that exact email → Owner, auto-approved. Any other email → pending
Member, regardless of signup order. To change the Owner, edit the email in **both**
`AuthContext.jsx` and the `isOwner()` function in `firestore.rules`, then republish the rules —
they can't share a constant since one is JS and the other is Firestore's own rules language.

**Approval gate (added 2026-11-23 — see `PROJECT_PLAN.md` §10.4 for the full reasoning):**
- Signing up no longer gets you straight in. Only the Owner's email (above) is auto-approved —
  everyone else is created "pending" and sees
  `src/components/layout/AccessPendingScreen.jsx` ("waiting for approval") instead of the app,
  until the Owner approves them from the **Admin** tab.
- This gate is enforced twice: once in the UI (`src/App.jsx`'s `RequireAuth`, so a pending
  person can't navigate to any page), and once in `firestore.rules` (a pending member's own
  login cannot flip their own `active` or `role` field — only a request from the Owner's
  account can). The rules copy is what actually matters for security; the UI check is just so
  a pending person sees a friendly screen instead of a confusing one.
- If you change anything about who's allowed in, re-check both places — a UI-only change
  without the matching `firestore.rules` update would be bypassable from the browser console.
- **Fixed 2026-11-24:** signing up or logging in used to look like "nothing happened" even
  when it fully worked, because `/login` never redirected away once you were actually signed
  in. `LoginPage.jsx` now redirects to `/` the moment `firebaseUser` exists, and lets
  `RequireAuth` in `App.jsx` take it from there. See `PROJECT_PLAN.md` §10.6.
- **Changing/forgetting a password (added 2026-11-24) — this includes the Owner's own:**
  there's a "Forgot password?" link under the password field in Log in mode. Type the email,
  tap it, check that inbox for a reset link — that's how the Owner (or anyone) changes their
  password today; nothing to do in code or the Firebase console. See `PROJECT_PLAN.md` §10.7.
- **Does signup accept a fake/random email?** Yes, structurally — Firebase only checks the
  *shape* of an email (`someone@somewhere.tld`), not that it's real or that whoever typed it
  actually owns the inbox. We deliberately did **not** add a "must be Gmail" restriction — see
  `PROJECT_PLAN.md` §10.7 for why the existing Owner-approval gate already covers this risk.

## Admin (Owner / Super Admin only)

**What it shows:** the Owner-only control panel — this is meant to be the one place you can
manage the whole trip without touching code: trip settings, pending approvals, location
sharing (global + per-member), the real package total and payment review queue, real stats,
and announcement composing.

**Common changes:**
- Trip name / dates / member count → use the "Trip settings" form right on this page
  (saves immediately, but only on this device until Firebase is wired up).
- **Pending approvals card** (added 2026-11-23): lists everyone who's signed up but isn't
  approved yet — name, email, signup time — with Approve/Reject buttons. Approve lets them
  into the app immediately (no re-login needed on their end). Reject deletes their signup
  outright (same effect as the Group page's remove button — see "Group" above, including the
  Firebase-console caveat about their login credential surviving a Reject/remove). The
  component is `PendingApprovalsCard` at the bottom of `src/pages/AdminPage.jsx`.
- The "Active" stat card counts approved members only (`activeMembers`), not raw signups.
- **Live location sharing card:** the global on/off switch for whether regular members can see
  everyone's location on the Journey map (you, the Owner, can always see it regardless).
  Starts **off** by default for a new trip.
- **Per-member location override list (added 2026-11-24):** sits right below the global
  switch — a "Follow switch / Force on / Force off" dropdown per active traveller, for the
  one-off case where you want someone's visibility to differ from everyone else's. See
  "Journey" above for the full feature.
- **Package total card (added 2026-11-24):** the one number everyone's expected payment share
  splits from, evenly across however many active travellers exist right now. This replaced
  the old `tripConfig.packageTotalPaise` field — see `PROJECT_PLAN.md` §10.9.
- **Payment review list (added 2026-11-24):** every active traveller's expected share, what
  they've actually paid, and their status. "Approve" confirms a member's own self-reported
  "I've paid" (sent from their Profile tab); "Mark paid" lets you record an offline/cash
  payment directly. This is what makes the "Needs review" and "Transport collection" stats
  above it real numbers instead of mock placeholders.
- **Announcements card (added 2026-11-24):** a real compose form (title + message + Post) and
  the real posted list, each with a delete icon. Shows up on Home for everyone the instant you
  post, same live-list pattern as Expenses.
- Expense in-place editing and per-category budgets are still the next Admin additions — for
  now, a wrong expense is fixed by delete (Owner, on Expenses) + re-add.

---

## Shared files used by every section

- `src/context/TripConfigContext.jsx` — the one shared "trip settings" object (name, dates,
  member count, route, package amounts). This is what makes the Admin "Trip settings" form
  able to update Home/Journey/Group/Payments all at once, and what makes the whole site
  reusable for a future trip.
- `src/context/AuthContext.jsx` — real login, session, and the live traveller roster (Firebase
  Authentication + Firestore). Every page that needs to know "who's logged in" or "who else
  has signed up" reads this instead of a data file. See `Read_Me/FIREBASE_SETUP_GUIDE.md`.
- `src/components/layout/AppShell.jsx` — the nav bar / header shared by every page.
- `src/components/ui/*.jsx` — small shared building blocks (Card, ProgressBar, StatusBadge,
  etc.) used across every section so they all look consistent.
- `src/components/ErrorBoundary.jsx` — the safety net around each page (see "The pattern"
  above).

### Logic files — usually don't hand-edit these

- `src/lib/dateTime.js` — works out "what day is it" and the countdown. Edit `mockTrip.js`'s
  dates instead of this file.
- `src/lib/splitwise.js` — the expense-splitting maths. Doesn't need to change when expense
  data moved to Firestore — it just works on whatever expense list it's handed.
- `src/lib/useExpenses.js` — Firestore wiring for Expenses (loading the live list, saving a
  new one). Only touch this if you're intentionally changing how expenses are saved/loaded.
- `src/lib/useLocationSharing.js` — Firestore wiring for live location capture/visibility,
  including the per-member override (see "Journey" above). Only touch this if you're
  intentionally changing how that works.
- `src/lib/usePayments.js` — Firestore wiring for the real package-total split and per-member
  payment tracking (see "Payments"/"Admin"/"Profile" above). Only touch this if you're
  intentionally changing how payment tracking works.
- `src/lib/useAnnouncements.js` — Firestore wiring for Admin-composed announcements (see
  "Admin"/"Home" above). Only touch this if you're intentionally changing how announcements
  are saved/loaded.
- `src/context/AuthContext.jsx` — login/session/roster logic (see "Login / Account" above).
  Only touch this if you're intentionally changing how accounts or roles work.

---

## Reusing this whole site for a different trip

This is the point of `TripConfigContext` — once this trip is over, reusing the site for a
new one (the user's own example: a short Ville Parle → Andheri trip) should mean editing
values, not code:

1. In `src/data/mockTrip.js` (or the Admin "Trip settings" form): change `tripName`,
   `startDate`, `endDate`, `totalMembers`, and `destinations` (for a 2-stop trip, this list
   would just be `['Ville Parle', 'Andheri']`).
2. `src/data/mockMembers.js` no longer feeds Payments or Expenses — both are real Firestore
   data now, tied to whoever actually signs up. Nothing to edit here for a new trip; it only
   still provides the `initialsFor` helper used for avatar initials.
3. In `src/data/mockItinerary.js`: replace the day-by-day plan (can be just 1 day for a short
   trip).
4. Expenses and Payments both already start clean for a new trip (real Firestore data, not a
   file) — delete old documents from the `expenses` and `payments` collections in the Firebase
   console, and reset `settings/payments`'s `packageTotalPaise` to the new trip's total (or 0
   until you know it).
5. Same for live locations: delete old documents from the `locations` collection (old pins from
   the last trip), and reset `settings/app`'s `locationSharingEnabled` to `false` and any
   `locationOverride` fields on `members/{uid}` docs if you want the new trip to start clean.
6. Delete old documents from the `announcements` collection so the new trip's Home doesn't show
   last trip's messages.

Everything else — the pages, the nav, the countdown, the Splitwise maths — keeps working
unchanged, because none of it hardcodes "Himachal" or "11" anywhere; it all reads from the
files above.

---

## General rules of thumb

- If this file and the actual code ever disagree, trust the code — and let Claude know so
  this guide gets refreshed.
- Logging in/signing up, adding an expense, tracking a payment, and posting an announcement
  all really persist (Firebase) — refreshing or coming back later keeps them. Trip settings
  (Admin's "Trip settings" form) are still the one exception — they only live in that browser
  tab's memory and reset on refresh, until their own turn in Phase 2.
- Real login, Expenses, Payments, announcements and live locations all exist now; Itinerary
  moving to a real database is the one piece still ahead — see `Read_Me/PROJECT_PLAN.md` for
  the phase plan.
- Want to put this site on the actual internet (not just your WiFi)? See
  `Read_Me/GITHUB_DEPLOY_GUIDE.md`.
