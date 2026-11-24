# TRIPVERSE — Project Plan & Working Notes

*Last updated: 2026-11-24 — Phase 2 step 1 (Login) and step 2 (Expenses) shipped; deploy prep done; Owner approval gate + remove-member control added; Owner switched to a fixed hardcoded email instead of "first signup"; fixed a real bug where /login never redirected away after a successful signup/login; added self-serve "Forgot password?", Owner-triggered member password reset, and Owner-only expense delete; added live location sharing on Journey (Phase 3 pulled forward) with an Owner-controlled visibility switch; added a per-member location override, moved Payments to real Firestore data with a dynamic even-split, and added real Announcements — Admin is now the one place the Owner manages the whole trip from.*

This is our shared working document — separate from the original spec, which stays
untouched at `Read_Me/trip_management_website_MD.docx`. Here we track decisions,
open questions, and what's actually been built, in plain language.

### Read_Me folder map (start here if you're new to this project, human or AI)

**If you're only going to share one file with another AI to ask a question, share this one** —
it explains the whole project and links out to the rest below for specifics.

- `trip_management_website_MD.docx` — the original spec. Never edited.
- **`PROJECT_PLAN.md` (this file)** — why things are built the way they are, the phase
  order, and a running decisions log.
- `HOW_TO_MAKE_CHANGES.md` — "I want to change X, which file do I open?" — point-wise, one
  section per tab.
- `FIREBASE_SETUP_GUIDE.md` — everything about Phase 2: is Firebase free, how login/sessions
  will work, how local dev talks to the real database, how code vs. data reach GitHub vs.
  Firebase, and the exact console steps to set it up.
- `GITHUB_DEPLOY_GUIDE.md` — how to actually put this on the internet via GitHub Pages:
  public-vs-private tradeoff, the code changes that made it deploy-ready, and the exact
  terminal commands.
- `GIT_AND_VSCODE_GUIDE.md` — the same steps as above, but clicking buttons in VS Code's
  Source Control panel instead of typing terminal commands — written for someone brand new
  to Git/GitHub.

## 1. What TRIPVERSE is

A private, mobile-first web app for the group's Himachal Expedition 2026 trip
(12–18 Dec 2026, Delhi → Manali → Solang Valley → Kullu → Manikaran → Kasol →
Jibhi → Jalori Pass → Serolsar Lake → Delhi, 11 travellers). It replaces
scattered WhatsApp messages and spreadsheets with one place for the itinerary,
live journey status, train/transport payments, Splitwise-style shared
expenses, group info, and an owner-only admin view.

## 2. The architecture question: "Can GitHub alone manage this?"

No, and here's why that's not a limitation we need to work around:

- **GitHub** stores your code and, through **GitHub Pages**, can serve static
  files (HTML/CSS/JS) for free. That's it — no server process, no database.
  It's the equivalent of hosting a folder of already-rendered files.
- TRIPVERSE needs logins and a live-updating database (who's paid, who owes
  what, where the group currently is). That requires something GitHub itself
  doesn't provide.

### Why Firebase — and why it's free + secure

- **Firebase Authentication** (logins) + **Cloud Firestore** (database), both
  on Firebase's free "Spark" plan — no credit card required, and the free
  limits are far beyond what an 11-person trip will ever use.
- There is still no server you have to write or host. The React app, running
  in the browser, talks to Firebase directly using Firebase's SDK (a JS
  library). This is the "serverless" model — Google runs the server, you just
  call it.
- Security is **not** "hide the database and hope." It's **Firestore Security
  Rules** — a set of rules Firebase itself checks on every single read and
  write, no matter what the browser sends. Think of it as the equivalent of
  checking `current_user.id == resource.owner_id` inside a Flask view — except
  it's enforced by Firebase's servers, not your own code, so it can't be
  bypassed by someone editing the frontend JS.
- Put together: **GitHub (code + static hosting) + Firebase (login +
  database)** gives the spec everything it asks for — free, no server to
  maintain, and secure — without a traditional backend.

## 3. Flask → Firebase, translated

| What you know (Flask) | What you're about to learn (Firebase) |
| --- | --- |
| Your own server process (`app.run()`) | No server — the browser talks to Firebase directly |
| `@login_required` decorator you wrote | Firebase Authentication (Google-run login, called via SDK) |
| A SQL database (tables, rows) | Cloud Firestore — collections of JSON-like documents |
| Permission checks inside a view function | Firestore Security Rules — same idea, enforced by Firebase itself |
| Template re-render after a page reload | A "realtime listener" — the page updates itself the instant data changes |

Hands-on versions of each of these live in [`learning-lab/`](../learning-lab/README.md),
built one at a time, right before the matching real feature — kept completely
separate from the production app in `src/`.

## 4. Build order & phases

**Phase 1 — Visual shell (done, this pass).** Every member-facing screen,
built mobile-first, running entirely on mock data. No Firebase yet. Goal: you
can click through the whole app and approve the look before anything harder
gets built.

**Phase 2 — go-ahead given 2026-11-22.** Set up a real Firebase project, then
wire it in this order (your call, and it's the right one — each step is
testable on its own before the next starts):

1. **Login (Firebase Authentication) — done, 2026-11-22.** Real per-person
   accounts, replacing the "Previewing as Owner/Member" dev switch. Done
   first because every other step needs to know *who* is doing the
   saving/paying/checking-in, and because it immediately lets you test with
   several real traveller accounts at once instead of just the one dev
   preview. Full writeup: §10 below.
2. **Expenses — done, 2026-11-23.** Moved from in-memory mock data to a real
   Firestore `expenses` collection — adding an expense now actually persists
   and syncs live to everyone. `src/lib/splitwise.js`'s calculation logic
   didn't need to change at all. Full writeup: §10 below.
   **Payments — done, 2026-11-24.** Originally held back because the package
   total wasn't split per traveller anywhere, and §5's traveller-count
   question (11 vs 9) was still open. Resolved without waiting on that number
   — see §10.9: the split now follows the real, live roster size instead of
   a hardcoded headcount, so the exact voucher number stopped being a
   blocker.
3. **Itinerary** (and the data it shares with Home's dashboard cards) — mostly
   read-only data, low risk.
4. **Live Journey / GPS** — deliberately last; see Phase 3 below, it's really
   its own phase.

**Deploy prep — done, 2026-11-23.** The code is now ready to host on GitHub
Pages (routing fix, relative asset paths, a one-command deploy script) —
see `GITHUB_DEPLOY_GUIDE.md` / `GIT_AND_VSCODE_GUIDE.md`. Actually creating
the GitHub repo and pushing still needs your hands (your GitHub account,
and Git installed on this machine) — not something that can be done for you
without your own login.

Full step-by-step (is Firebase actually free, how login/sessions work, how
local dev talks to the live database, exact console clicks) is in
[`FIREBASE_SETUP_GUIDE.md`](FIREBASE_SETUP_GUIDE.md) — written so it can be
handed to any AI assistant on its own if you're stuck and I'm not around.

**Phase 3 — the hard/risky part, done last on purpose.** Live GPS sharing and
the planned-vs-actual journey timing, using Firestore's realtime listeners.

**Phase 4 — final polish.** PWA icon/branding pass, offline/empty/error
states, audit logs, guided GitHub repo + Pages deployment, and folding in the
real trip data once the open questions below are answered.

## 5. Open questions from the voucher

The original voucher has a few things that don't fully agree with each other.
None of this blocks Phase 1 (it's all mock data), but Phase 2+ needs real
answers before these numbers go live:

- **Traveller count (resolved 2026-11-24, see §10.9):** voucher mentions both 11 and 9
  adults — rather than guess which is correct, Payments now splits the package total evenly
  across however many approved travellers actually exist at any moment, recomputed
  automatically as people are approved or removed. The literal 11-vs-9 number no longer
  matters to anything the app calculates.
- **Vehicle:** Volvo vs. a 12-seater Tempo Traveller — are these two different
  legs of the journey, or a mismatch in the voucher?
- **Day 1 / Day 2 schedule:** the exact activity split between these two days
  isn't fully clear yet.
- **Financials (resolved 2026-11-24, see §10.9):** package total ₹1,13,500, advance paid
  ₹6,000, balance ₹1,07,500 — now a real, Owner-editable number (`settings/payments` in
  Firestore, via the Admin "Package total" card) split live across active travellers, instead
  of a static package-level total. **One manual step still needed:** the ₹6,000 advance
  already received isn't auto-attributed to anyone — record who actually paid it using
  Admin's "Payment review" list once, the same way you'd record any other real payment.

## 6. What's built right now (Phase 1)

*Note: Login and Expenses have since moved to real Firebase/Firestore data —
the bullets below are updated to match; see §10 for the full writeup of what
changed and why.*

All data is mock (hand-written JS files in `src/data/`, shaped exactly like
the real Firestore documents will be later, so swapping in real data in
Phase 2 is a small change, not a rewrite). Eight screens, all responsive
(mobile bottom nav + "More" sheet, full desktop sidebar):

- **Home** — trip header with a live, second-by-second countdown (animated glow, no digit
  jitter), auto-highlighted "current day," and 4 dashboard cards that are now clickable —
  each one jumps straight to its full page (Starting point → Journey, Day plan → that exact
  day on Itinerary, Group expenses → Expenses, Pending payments → Payments). Trip name,
  dates and member count shown here come from the shared trip settings (see §9) so the
  Owner can change them without touching code.
- **Itinerary** — day-by-day timeline seeded from the spec's real Day 1–7 plan, now themed
  per day: each day carries a "vibe" (travel/temple/snow/river/waterfall) that changes the
  background gradient and adds a subtle ambient animation on whichever day is active.
- **Live Journey** — animated route timeline (planned stops only), now correctly resolving
  *which* stop is "current" from today's actual date (previously this was hardcoded to the
  first stop). Clearly-labelled "GPS tracking arrives later" card, rewritten to describe the
  actual plan — each member's own check-in location clustered along the route — instead of a
  single vehicle feed.
- **Payments** — transport contribution summary, member-wise status, train ticket card, and
  the package total, all now **real Firestore data** (added 2026-11-24, see §10.9): the
  package total and every member's paid/expected amounts live-sync for everyone, split evenly
  across the real active roster.
- **Expenses** — Splitwise-style balances and settlement suggestions, computed by a real
  calculation engine in `src/lib/splitwise.js`, now running on **real Firestore data**: the
  "Add expense" button saves for real and syncs live to everyone signed up, same as Group
  below. Paid-by/participants are picked from the real signed-up roster.
- **Group** — member grid with roles, **live from Firestore** — whoever has actually signed
  up at `/login`, not mock data.
- **Profile** — your own real name/email/role from Firestore, a working Log out button, and
  (added 2026-11-24) your real payment status with a self-serve "I've paid" button, plus your
  real shared-expenses balance.
- **Admin Dashboard** — the Owner's one control panel: trip settings, pending approvals,
  global + per-member location sharing, the package total and payment review queue, real
  stats (collection %, group spend, needs-review count), and announcement composing (all
  added 2026-11-24, see §10.9) — genuinely interactive and, except for Trip Settings, synced
  live to everyone via Firestore, not just this device.

## 7. Getting started — seeing it on your phone

I wasn't able to run terminal commands for you this session (a permission
setting blocked it), so these first steps need to happen on your machine. It's
one-time setup — after this, re-running it later is just step 3.

1. **Check Node.js is installed.** Open a terminal in the project folder
   (`c:\BotShare\OD\Python\trip_management_website`) and run:
   ```
   node -v
   ```
   If that errors instead of printing a version number, install Node.js from
   [nodejs.org](https://nodejs.org) (the "LTS" version) first.

2. **Install the project's dependencies** (one-time — this reads
   `package.json` and downloads React, Tailwind, etc. into a `node_modules`
   folder):
   ```
   npm install
   ```

3. **Start the dev server:**
   ```
   npm run dev
   ```
   Vite will print something like:
   ```
   Local:   http://localhost:5173/
   Network: http://192.168.1.23:5173/
   ```
   The `Network` line is your phone preview — `vite.config.js` is already set
   to expose it (`host: true`), so no extra flags needed.

4. **On your phone**, connect to the **same WiFi** as your computer, then open
   that `Network` URL in a browser. That's the whole trick behind a "local
   network preview": your phone and computer are talking directly to each
   other over WiFi, nothing goes over the internet, and nothing needs to be
   deployed anywhere yet.

5. **Backing this up to GitHub / putting it live** — now its own full guide,
   since this has actually moved from "later" to "today": see
   `GITHUB_DEPLOY_GUIDE.md` (terminal commands) or `GIT_AND_VSCODE_GUIDE.md`
   (VS Code buttons, no terminal needed).

## 8. Known gaps (not urgent, tracked here so they don't get lost)

- The app icon is currently a simple hand-drawn SVG placeholder
  (`public/icons/icon.svg`), not a designed logo — easy to swap later.
- No in-app edit/delete button for a wrong expense yet — fix it directly in
  the Firebase console for now (see `HOW_TO_MAKE_CHANGES.md` → "Expenses").
- ~~Payments still runs on mock data~~ — done 2026-11-24, see §10.9. The old
  `src/data/mockPayments.js`/`mockAnnouncements.js` are dead code now (nothing imports them) —
  flagged for manual deletion since this session's terminal access was blocked (see §10.3's
  note on the same limitation).
- The GitHub repo for this project doesn't exist yet, and Git itself isn't
  installed on this dev machine (confirmed 2026-11-23) — see
  `GITHUB_DEPLOY_GUIDE.md` §3.
- ~~`BrowserRouter` needs a routing fix before GitHub Pages~~ — done
  2026-11-23, switched to `HashRouter` (see §10).
- ~~"Previewing as Owner/Member" switcher~~ — removed, replaced by real
  login 2026-11-22 (see §10).
- ~~ProfilePage showing your own role~~ — no longer a concern: Profile is
  now your own real, private account page (not a shared dev preview), so
  there's no Super-Admin-identity leak to worry about (§9.1 was always about
  what *other* members see in Group, not your own Profile).

## 9. 2026-11-22 decisions — section isolation, reusability, Super Admin controls

This section records the architecture decisions made in response to the request to: keep
each of the 8 tabs separately built and easy to hand off, make the whole site reusable for a
future trip, and give the Owner ("Super Admin") real control from the UI instead of code
edits.

### 9.1 Super Admin visibility — decided

Two questions, both answered by you directly (not a default I picked):

- **Does the Owner's own account show up in the Group list looking just like everyone
  else?** Yes — appears as a normal member, no "Owner" badge visible to anyone browsing the
  Group tab. Regular members see every traveller as equal; only the Owner's own device shows
  the Admin tab at all (today, that's driven by the "Previewing as" switch; in Phase 2 it'll
  be driven by their real logged-in account).
- **Does the Owner get a separate "Super Admin mode" to flip into?** Not a visible mode
  switch — the Admin tab itself *is* that elevated access, already gated by `isOwner` in
  `src/context/SessionContext.jsx`. There's nothing else to build for "hidden" — the owner
  account simply has one extra tab nobody else can see.

### 9.2 Location sharing — decided

Asked once, answered the same way both times it came up: **automatic background capture**,
not a visible per-member opt-in toggle. When Phase 3 (live GPS) is built, each member's
location is captured automatically as they use the app — logging in, opening the Journey
tab, etc. — with no "share my location?" switch shown to them. Noted here so this doesn't
get re-asked in a future session.

### 9.3 Reusability — the `TripConfigContext` pattern

Every trip-specific fact (name, dates, member count, route stops, package amounts) now lives
in one object, `tripConfig`, defined in `src/context/TripConfigContext.jsx` and seeded from
`src/data/mockTrip.js`. Home, Journey, Group, Payments and the nav header all read it live;
the Admin "Trip settings" form is the only place that writes to it.

This is what makes "reuse this site for a different trip later" a data change, not a code
change — concrete walkthrough (using your own Ville Parle → Andheri example) is in
[`HOW_TO_MAKE_CHANGES.md`](HOW_TO_MAKE_CHANGES.md#reusing-this-whole-site-for-a-different-trip).

### 9.4 "Build it like Microservices" — what that actually became

Real backend microservices (separate servers and databases per feature, talking over a
network) would be serious overkill for an 11-person trip site — more cost, more moving parts,
nothing gained. What you described wanting — *"if any one of them gets down, the rest don't
get impacted"* and *"build these sections independently"* — is fully achievable on the
frontend with two much simpler pieces, both now in place:

1. **Independent code per section.** Each tab already only reads its own page file,
   component folder and data file (see the "Quick map" table in
   [`HOW_TO_MAKE_CHANGES.md`](HOW_TO_MAKE_CHANGES.md)) — Expenses code never reaches into
   Payments' files or vice versa.
2. **Per-route error isolation.** `src/App.jsx` now wraps every single tab in its own
   `src/components/ErrorBoundary.jsx`. If a bug crashes one tab, that tab shows a small "this
   section hit a snag" card — the nav bar and every other tab keep working normally. This is
   the literal "one goes down, the rest don't" behaviour, just implemented the way a
   single-page frontend app actually achieves it.

### 9.5 Where to actually make changes

[`Read_Me/HOW_TO_MAKE_CHANGES.md`](HOW_TO_MAKE_CHANGES.md) is now the one file to open for
"I want to change X, which file do I edit?" — point-wise, one subsection per tab. Every
`src/data/*.js` file (and the logic files) also carries a short `EDIT HERE` (or `LOGIC FILE`)
comment at the top pointing back to it, so the file itself and this guide stay in sync even
if you open the code directly instead of the guide first. Keep both updated together as
sections change.

## 10. 2026-11-22 to 2026-11-23 decisions — Login, Expenses, deploy prep

### 10.1 Login — the dual-roster bridge

Rather than migrate Login *and* Payments/Expenses/Group/Profile all at once (risky, hard to
test incrementally), real accounts were wired in while deliberately leaving Payments/Expenses
on the old mock roster for one more step:

- **Two member systems existed side by side, on purpose:** `src/data/mockMembers.js`
  (`u1`..`u11`) kept powering Payments/Expenses unchanged; a new real system — Firebase Auth
  + a Firestore `members` collection keyed by real login `uid`s, via
  `src/context/AuthContext.jsx` — powers Login, Group, Profile, and the nav. This is the same
  "each section stays independent" principle from §9.4, applied to a migration in progress,
  not just to finished code.
- **Owner-bootstrap:** the first person to ever sign up automatically becomes `role: 'owner'`
  — checked via a one-time Firestore read performed right after sign-up succeeds (not from a
  pre-login listener, which would race and make every signup look like "no owner yet").
  Everyone after that defaults to `role: 'member'`.
- **Security rules** (`firestore.rules`) scope only to `members/{uid}`: anyone logged in can
  read the whole roster (needed for Group), but can only create/edit their *own* document.
  Publishing this makes Firestore deny everything else by default — each new real collection
  needs its own added rule block (Expenses' is in 10.2).
  **Accepted risk:** nothing stops someone from editing their own `role` field to `'owner'`
  via the Firebase SDK directly — no field-level validation was added. Low-stakes for an
  11-person friend trip; revisit with stricter rules if this ever isn't true.
- **Bug caught and fixed before it shipped:** `src/components/group/MemberCard.jsx` still had
  a `ROLE_CONFIG.owner` entry (Crown icon + "Owner" label) left over from Phase 1 mock data.
  Harmless while nobody was really an Owner — but a real Owner now exists, and §9.1 already
  decided the Owner should look like a normal member in the Group list. Removed.
- **Profile honesty principle:** `src/pages/ProfilePage.jsx` shows an honest "not linked yet"
  message for payment/expense numbers instead of fabricating balance data for a real account
  that has no real financial link yet. Same principle applied again for Payments in §4.

### 10.2 Expenses — migrated to real Firestore

- New `expenses` Firestore collection, one document per expense, written by
  `src/lib/useExpenses.js` (a small hook, not a Context — nothing outside the Expenses page
  needs this data). `src/lib/splitwise.js`'s balance/settlement maths needed **zero changes**
  — it already just operates on whatever expense list and member-id list it's handed.
- `AddExpenseModal`, `ExpenseCard`, `BalanceSummaryCard`, `SettlementSuggestions` all switched
  from reading `mockMembers.js` to reading the real roster via `useAuth()` — same "paid by /
  split between" UI as before, just keyed by real `uid`s instead of `u1`..`u11`.
  `mockExpenses.js`'s `expenses` array is no longer read by the app at all (kept only as a
  reference example of the shape); `expenseCategories` in that same file is still live.
- Security rule added for `expenses`: any logged-in traveller can read all of it and create a
  new one stamped with their own `uid` as `createdBy`; update/delete are both denied for now
  since no edit/delete button exists in the app yet (matches "don't write rules for features
  that don't exist," same spirit as §9's YAGNI-flavored decisions elsewhere).
- **Payments was deliberately not migrated alongside Expenses**, even though they were
  originally grouped as one Phase 2 step. Reason: Payments' numbers would need a real
  "expected amount per traveller," and §5 already records that the real package-total split
  is an open question you haven't confirmed yet. Inventing a number now to make Payments
  "real" would quietly pre-empt that decision. Expenses has no such landmine — expenses are
  ad-hoc (dinner, fuel, shopping), never tied to the fixed package total — so it moved ahead
  on its own.

### 10.3 Deploy prep — ready to host, not hosted yet

- `src/main.jsx`: `BrowserRouter` → `HashRouter` (GitHub Pages has no server-side rewrites, so
  a path-based route 404s on direct load/refresh; a `#`-based route always resolves to the
  same `index.html`).
- `vite.config.js`: added `base: './'` so built assets use relative paths, since the live
  site will sit at a GitHub Pages sub-path, not a bare domain.
- `package.json`: added `predeploy`/`deploy` scripts (`gh-pages -d dist`) so publishing a new
  build is one command (`npm run deploy`) once the GitHub repo exists.
- **Public repo, deliberately:** free GitHub Pages requires a public repo. The real tradeoff
  (a stranger with the URL could reach the login/signup screen and sign themselves up) is
  written out in full in `GITHUB_DEPLOY_GUIDE.md` §1 — accepted as the same category of
  low-stakes risk as 10.1's role-self-promotion note, not a default picked without
  mentioning it.
- **Confirmed this session: Git is not installed on this machine, and my own terminal access
  was fully blocked for the whole session** (a permission-mode setting, confirmed
  non-retryable) — so the actual `git init`/GitHub-repo/push steps could not be run on your
  behalf. `GITHUB_DEPLOY_GUIDE.md` (terminal) and `GIT_AND_VSCODE_GUIDE.md` (VS Code buttons)
  both exist so you can do this either way.

### 10.4 Owner approval gate + remove-member control — 2026-11-23

Requested so (a) sample/test sign-ups during setup don't permanently eat one of the 11 real
seats, and (b) once the site is public (see 10.3's public-repo note), a stranger who finds the
URL can't actually get into the app just by signing up — every login now needs your sign-off.

- **Sign-up no longer means "in."** `src/context/AuthContext.jsx`'s `signUp` still makes the
  very first person to ever sign up the Owner (`role: 'owner', active: true`, unchanged from
  10.1) — that should be you, signing up first with the email/password you want to use as
  Owner. Everyone who signs up after that is created with `active: false` ("pending") instead
  of `true`. `src/App.jsx`'s `RequireAuth` now shows a new screen
  (`src/components/layout/AccessPendingScreen.jsx`) instead of any real page until you approve
  them — they cannot reach Home, Itinerary, Group, anything, just a "waiting for approval"
  message with a log-out button.
- **You approve/reject from Admin.** The Admin dashboard (Owner-only) gained a "Pending
  approvals" card showing each pending signup's name, email, and signup time. Approve flips
  their `active` field to `true` (`approveMember` in `AuthContext.jsx`) and they're in
  immediately — no re-login needed, the app updates live. Reject deletes their Firestore
  profile outright (`removeMember`) — same action used below for removing an already-active
  member.
- **Remove an active member (e.g. a test account) to free their seat.** The Group page now has
  a small remove button on every member's card except your own (Owner-only, via `onRemove` on
  `MemberCard.jsx`). It deletes their Firestore profile the same way Reject does — confirmed
  with a `window.confirm` first.
- **Group and Expenses now only show approved people.** Both switched from the raw `members`
  list to a new `activeMembers` (`members.filter(m => m.active)`) from `AuthContext` — pending
  signups don't clutter the traveller grid or the "paid by"/"split between" pickers for
  everyone else. Only you, on Admin, see the pending ones (you need to, to approve them).
- **This is enforced in `firestore.rules`, not just hidden in the UI — that's the actual
  "secure" part.** A regular member can still edit their own profile document (e.g. nothing
  currently lets them, but the rule allows it for future fields), but the rules now explicitly
  block them from changing their own `active` or `role` fields — only a request coming from
  your (the Owner's) own logged-in account passes, checked via a `get()` lookup inside the rule
  itself (`isOwner()`). Without this, anyone could open their browser's dev console and call
  Firestore directly to flip their own `active` to `true` — the UI gate alone would be
  security theatre. Delete is now `allow delete: if isOwner()` for the same reason — only you
  can remove someone, even by calling Firestore directly.
- **Known limitation, can't be fixed from inside this app:** removing someone's Firestore
  profile frees their seat and locks them out of the app (they land on
  `AccessPendingScreen` with `reason="removed"`), but it does **not** delete their actual
  Firebase *login* (their email/password credential). The Firebase client SDK can only ever
  delete the currently-signed-in user's own account — there's no way for your code, running in
  your browser, to delete someone else's login. So if you want an email fully free for reuse,
  or want to be certain a removed test account can never log in again (even if it would just
  see the "removed" screen), do one manual step: Firebase console → **Authentication** tab →
  find that row → delete. One click, but it's manual — there's no backend here to script it
  from (same "no server, just Firebase direct from the browser" architecture as everything
  else — see §2).
- **Separately-accepted, narrower risk — unchanged in kind from 10.1's self-promotion note,
  not newly introduced:** someone who bypasses the UI entirely and calls the Firestore SDK
  directly from a browser console, at the exact moment before *anyone* has ever signed up,
  could theoretically race to create the very first `members` doc with `role: 'owner'` before
  you do. This was deliberately **not** closed — doing it properly needs an always-present
  Firestore "lock" document plus atomic batched writes plus retry handling in `signUp`, which
  is disproportionate effort for an 11-person trip where you sign up locally, as Owner, before
  this is ever public. Noted here so it's a documented, conscious tradeoff rather than a gap
  nobody decided on. **Superseded by §10.5 below — this risk is now actually closed, not just
  accepted,** once it turned out there was a better reason to fix it than this risk alone.

### 10.5 Owner is now a fixed email, not "whoever signs up first" — 2026-11-24

What changed, and why: while setting this up, you signed up with a first test email, then
logging back in with the same email/password said "wrong" — most likely a small mismatch
between what was typed at signup vs. login (easy to do with a password field, since you can't
see what you typed), though it's also possible that account simply wasn't the one you expected
it to be (see "first signup becomes Owner" below — if someone/something else had already
claimed Owner, your account would have been created as a normal pending Member instead, which
*looks* identical to a login problem from the outside: you can log in fine, you just land on
the "waiting for approval" screen instead of the app). Either way, you then deleted things from
Firebase while troubleshooting, and asked for something more solid: **one pre-decided email
address that is always the Owner, set in code, not dependent on who signs up when.**

- **New mechanic.** `src/context/AuthContext.jsx` now has an `OWNER_EMAIL` constant
  (`vijaymishra2205@gmail.com`). `signUp()` no longer asks "does an owner already exist yet"
  (which required an extra Firestore read, and was the actual source of the race this section
  used to flag as accepted-but-open) — it just checks "is this email the one true Owner
  email." Sign up with that exact email → Owner, auto-approved. Sign up with any other email →
  pending Member, same as before.
  **The password is never part of this.** Only the email is hardcoded anywhere — passwords are
  never stored in this app's code or files at all; Firebase Auth owns password storage
  entirely, the same way it already did before this change. Whatever password you type into
  the sign-up form for that email simply *becomes* the Owner's password, nothing more to set up.
- **This is enforced in `firestore.rules`, which is the part that actually matters.** The
  `isOwner()` helper no longer does a Firestore lookup at all — it reads
  `request.auth.token.email` straight off the caller's own verified Firebase Auth token, which
  can't be forged by editing frontend JS or calling Firestore directly from devtools. The
  `create` rule on `members/{uid}` now actively checks that whoever is creating a doc can only
  set `role:'owner', active:true` if their token's email matches, and must set
  `role:'member', active:false` otherwise — so a tampered client can no longer self-promote by
  racing to sign up first. **This fully closes the bootstrap race noted in §10.4** — it's not
  an accepted risk anymore, it's just not possible, regardless of signup order.
- **Two-file rule:** because `firestore.rules` is a separate language Firestore evaluates
  server-side, it can't import the `OWNER_EMAIL` constant from the JS file. The same email is
  typed literally in both `src/context/AuthContext.jsx` and the `isOwner()` function near the
  top of `firestore.rules`. **If the Owner's email ever changes, both must be updated, and
  `firestore.rules` must be republished in the Firebase console** — updating only one half
  silently breaks things (JS would think one person is Owner while the database enforces a
  different one).
- **Cleanup needed from the earlier test signup:** the old `vj@gmail.com` attempt may have left
  a leftover entry in Firebase — check both the **Authentication** tab and the Firestore
  **members** collection in the console and delete anything from that test before relying on
  the real rollout, so it doesn't show up as a phantom traveller on Group later.

### 10.6 Real bug found: `/login` never redirected away once you were actually signed in — 2026-11-24

While testing 10.5, signing up (and later logging in) appeared to do "nothing" — no error, no
redirect, just the same form sitting there — even though Firebase console confirmed the Owner
account and Firestore profile really had been created. Root cause: `src/App.jsx` only ever
redirects *into* `/login` when you're logged out (`RequireAuth`'s `!firebaseUser` check); there
was nothing redirecting *away from* `/login` once you became authenticated. Since signing up
or logging in doesn't change the URL by itself, a fully successful attempt looked identical to
a silently-failed one — you'd just keep looking at the login form either way.

- **Fix:** `src/pages/LoginPage.jsx` now checks `firebaseUser` from `useAuth()` itself —
  if you're already signed in (e.g. the instant after a successful signup/login, or Firebase
  remembering a session from before), it immediately hands off via `<Navigate to="/" replace />`
  instead of rendering the form. `App.jsx`'s existing `RequireAuth` then takes it from there
  (home, or the pending/removed screen) — `LoginPage` doesn't duplicate that logic.
- **Also added while in there:** a show/hide icon on the password field (easy to mistype or
  have a browser silently autofill a different password than you think, with no way to check);
  and unmapped Firebase errors now show their raw code (e.g. `auth/xyz`) instead of a bare
  "something went wrong," so a future one-off failure is self-diagnosable from the screen
  itself, not just Chrome DevTools' console.
- The two real `400`s you saw on `signInWithPassword` in the console (as opposed to the
  "nothing happens" symptom) were a genuine wrong email/password combo on those specific
  attempts — most likely typed differently than the original signup, or a browser-suggested
  password you didn't notice get used. That part wasn't a code bug; the show/hide toggle above
  is the mitigation for it going forward.

### 10.7 Password changes, member-level fixes, and the fake-email question — 2026-11-24

Four related questions came up in one go once login was finally working: how to change the
Owner's password, whether the app accepts junk signups, whether the Owner can fix a member's
mistake, and whether the Owner can reset someone else's password.

- **Changing (or recovering) any password, including the Owner's:** nobody — not the Owner,
  not even someone editing the code — can set a Firebase Auth password directly. Firebase
  never hands the password itself to any code, ever (see §5/§6 of
  `FIREBASE_SETUP_GUIDE.md`); the only real mechanism is `sendPasswordResetEmail(auth, email)`,
  which emails that address a link that lets *them* pick a new one. Added a **"Forgot
  password?"** link under the password field in Log in mode on `LoginPage.jsx` — type the
  email, tap it, follow the email. This is self-serve for literally anyone, Owner included; no
  Firebase console step needed anymore for a forgotten password.
- **Owner resetting a *member's* password:** same underlying call, triggered by the Owner
  instead of the member themselves. Added a small key icon next to the existing remove button
  on every other member's card in `GroupPage.jsx`/`MemberCard.jsx` (Owner-only, never on the
  Owner's own card — same gating pattern as remove). It sends that member a reset email; the
  Owner still can't see or choose their new password, same limitation as above — this button
  just saves the member from having to find the "Forgot password?" link themselves.
- **Does signup accept a fake/random email?** Yes, structurally — `createUserWithEmailAndPassword`
  only validates that an email is *shaped* like one (`x@y.tld`); Firebase has no way to know if
  `y.tld` exists or whether whoever typed it actually controls that inbox. **Decided not to
  restrict signup to Gmail-only**, for two reasons: (1) it would incorrectly block real
  travellers using an Outlook/work/other real address, and (2) it wouldn't actually stop
  anyone determined to misuse it — typing a syntactically-valid-but-fake address is just as
  easy whether or not it ends in `@gmail.com`. The control that actually matters is already
  built and already does the real job: **every signup, from any address, lands pending and
  invisible/powerless until the Owner reviews the name + email and approves it** (§10.4). A
  junk signup just sits pending, or gets rejected with the same one-click Reject already on
  Admin's "Pending approvals" card — no extra email validation needed.
- **Owner fixing a member's wrongly-entered expense:** built. Every expense card now shows a
  small delete icon, **Owner-only**, bottom-right. `src/lib/useExpenses.js` gained
  `deleteExpense(expenseId)`; `firestore.rules`' `expenses` match block changed from
  `allow update, delete: if false` to `allow delete: if isOwner()` (update stays `false` — see
  below). There's deliberately no in-place *edit* — the fix for a wrong amount/wrong person is
  delete (Owner) + re-add (whoever it actually belongs to), which reuses the existing "Add"
  flow instead of needing a whole new edit form for a small, infrequent correction. Can revisit
  if delete-and-redo turns out to be annoying in practice.

All four are enforced the same two-layer way as every other Owner-only action in this app: a
button that's only rendered for the Owner in the UI, *and* a matching `firestore.rules` check
that would refuse the write even if someone bypassed the UI — see §10.4 for why the rules copy,
not the UI, is what actually matters for security.

### 10.8 Live location sharing on Journey — Phase 3 pulled forward, 2026-11-24

User asked: when anyone logs in, their location should be captured automatically, and shown on
Journey so travellers can see each other's last known spot on a map. This was already Phase 3
(live GPS) — the hardest, riskiest part, deliberately saved for last (see the phase order near
the top of this doc) — pulled forward ahead of Itinerary moving to Firestore, because the user
asked for it now.

Two design questions, resolved with the user before building anything:

- **Who can see whom, by default?** Starts **off** for every regular member — nobody sees
  anyone. The Owner flips a switch on **Admin** ("Live location sharing") to turn it on for
  everyone, and can flip it back off any time. The **Owner can always see everyone's
  location, regardless of that switch** — their one standing advantage here, same spirit as
  the existing Owner-only controls (approve/remove members, reset a password, delete an
  expense). Important: this is a *visibility* decision, separate from the *capture* mechanism
  — automatic background capture, with no "share my location?" toggle ever shown to a member,
  was already locked in earlier (see `tripverse-super-admin-decisions` memory) and was not
  revisited here.
- **What does the map look like?** A real interactive map with a pin per member, not just
  badges on the existing route timeline — via `react-leaflet` + free OpenStreetMap tiles (no
  Google account, API key, or billing involved).

**What was built:**

- Two new Firestore collections: `locations/{uid}` (one doc per member — `{ lat, lng,
  updatedAt }`, overwritten in place, no history) and a single `settings/app` doc
  (`{ locationSharingEnabled: boolean }`, missing/false = off). New `firestore.rules` blocks
  for both — a member can only ever write their *own* location doc; reading the whole
  `locations` collection requires either being the Owner, or `settings/app`'s switch being on.
  Only the Owner can write `settings/app` at all.
- `src/lib/useLocationSharing.js` (new **LOGIC FILE**): a standalone `captureLocationForUser(uid)`
  (one-shot `navigator.geolocation.getCurrentPosition`, writes straight to `locations/{uid}`,
  silently does nothing on denial/unsupported browsers — this has to stay invisible, same as
  the original capture decision) plus a `useLocationSharing()` hook exposing the live
  `sharingEnabled` switch, the derived `canSeeEveryone` (`isOwner || sharingEnabled`), the live
  `locations` list (only subscribed once `canSeeEveryone` is true, to avoid a doomed
  subscription before sharing is on), and an Owner-only `setSharingEnabled(enabled)`.
- `src/components/layout/LocationCapture.jsx` (new, renders nothing): mounted once in
  `App.jsx` inside `RequireAuth`, alongside `AppShell` — fires one capture per login, for
  every page, not just Journey.
- `src/components/journey/LiveLocationMap.jsx` (new): the actual map. Custom `DivIcon` markers
  (gradient circle + initials, matching `Avatar.jsx`'s look) instead of Leaflet's default
  marker image — sidesteps a known Leaflet+Vite bundling issue with the default marker PNGs,
  and looks native to the app. Map bounds auto-fit to whichever pins exist (capped at zoom 14
  so a single pin doesn't zoom in to street level).
- `JourneyPage.jsx`: the old static "Live GPS tracking" placeholder card is now real — Owner or
  a member with sharing on sees `<LiveLocationMap/>`; everyone else sees a short "ask the
  Owner" placeholder instead. Also fires its own capture-on-open, for a fresher pin right when
  someone's actually looking (redundant with `LocationCapture`'s login-time capture, but
  harmless — it just overwrites the same doc).
- `AdminPage.jsx`: new `LocationSharingCard` — current on/off state plus one button to flip it,
  same pattern as the existing `PendingApprovalsCard`/`TripSettingsCard`.
- `package.json`: added `leaflet` and `react-leaflet` (the `^4.2.1` line specifically, since it
  supports React 18 — this project is on React 18.3.1). Needs one `npm install` to actually
  pull them in.

**One real gotcha, flagged up front rather than discovered the hard way:** browser geolocation
only works over **HTTPS or `localhost`**. `npm run dev` is fine either way, and the eventual
GitHub Pages deployment is HTTPS too — but testing by sharing a dev machine's plain
`http://192.168.x.x:5173` LAN URL with someone else's phone (as `FIREBASE_SETUP_GUIDE.md`
suggests for early multi-device testing) will likely have their browser silently **block**
location on that address. Not a bug — expected, until the site is actually deployed.

Enforced the same two-layer way as every other Owner-only control in this app (UI button +
matching `firestore.rules` check) — see §10.4 for why the rules copy is what actually matters
for security.

### 10.9 Admin becomes the real control panel: real Payments, per-member location override, Announcements — 2026-11-24

While dev-testing 10.8's live-location feature, you found several things on Admin that didn't
do what you expected: the location switch was all-or-nothing with no way to override one
person; "Needs review," "Transport collection," and "Group spend" were confusing because
they'd quietly stayed mock/illustrative numbers (Payments was deliberately held back — see
§5/§10.1); there was no way to actually post an announcement, just a static count; and the
underlying ask was for Admin to genuinely be the one place you manage the whole trip from, not
just a dashboard of numbers.

**Two design questions, resolved with you before building anything:**

- **Location override:** keep the existing global on/off switch as the default, and add a
  per-member override on top of it, rather than replacing the switch.
- **The package split:** rather than finally picking between the voucher's "11" and "9"
  travellers, split one Owner-set package total evenly across however many **active members
  actually exist right now** — the same real roster Group/Admin already grow and shrink via
  approve/remove. This closes §5's traveller-count question by making the exact number stop
  mattering: the split recalculates on its own the moment someone is approved or removed, so
  there's never a stale headcount to keep in sync by hand.

**What was built:**

- **Real Payments**, replacing `mockPayments.js` entirely: a new `settings/payments` doc
  (`{ packageTotalPaise }`, Owner-editable from Admin's "Package total" card) and a new
  `payments/{uid}` collection (one doc per member with any progress —
  `{ amountPaidPaise, status, updatedAt }`). `src/lib/usePayments.js` (new **LOGIC FILE**)
  computes each active member's expected share by reusing `equalSplit()` from
  `src/lib/splitwise.js` (now exported — previously a private helper only `computeShares()`
  could reach), the exact same remainder-safe splitting maths Expenses already uses. No new
  splitting logic had to be invented.
- **A small addition of my own, flagged clearly since you didn't explicitly ask for it:** a
  self-serve "I've paid my share" button on Profile, which reports a member's own payment as
  `under_verification` — this is the only way that status (and therefore a non-zero "Needs
  review" count) ever becomes real, since otherwise you'd just mark everyone "paid" directly
  and that in-between state would never exist. Easy to remove if you'd rather only ever set
  every member's status yourself from Admin.
- **Per-member location override:** one new optional field, `locationOverride: true | false |
  null`, right on the existing `members/{uid}` document (not a new collection) —
  absent/`null` follows the global switch, `true` forces that person visible, `false` forces
  them hidden. Admin's new "Per-member location override" list is a dropdown per active
  traveller: Follow switch / Force on / Force off.
- **Real Announcements**, replacing `mockAnnouncements.js`: a new `announcements/{id}`
  collection (`{ title, message, createdBy, createdAt }`), wired up by
  `src/lib/useAnnouncements.js` (new **LOGIC FILE**) the same live-list way `useExpenses.js`
  already works. Admin's "Announcements" card gained a real compose form (title + message +
  Post) and the real posted list, each with a delete icon.
- **`firestore.rules`** gained three new match blocks (`payments/{uid}`, `settings/payments`,
  `announcements/{id}`) and two existing ones changed: `members/{uid}`'s update rule now also
  protects `locationOverride` from being self-edited by anyone but the Owner, and
  `locations/{uid}`'s read rule became override-aware (readable if you're the Owner, *or* your
  own override is `true`, *or* your override isn't `false` and the global switch is on).
  A member can only ever self-report their own payment into `under_verification` — never
  straight to `paid`, and never someone else's doc — only the Owner's review can actually
  confirm one. All enforced server-side, same two-layer pattern as every other Owner-only
  control in this app (see §10.4).
- **One real implementation wrinkle worth recording:** once the `locations` read rule started
  varying per-document (a per-member override makes the result different for different
  `uid`s), a single non-owner `collection(db, 'locations')` listener stopped being usable —
  Firestore refuses a collection-wide `list` query unless the rule's result is provably
  uniform across every document for that reader, and an override breaks that uniformity. The
  Owner's own read stays exactly as cheap as before (`isOwner()` alone is uniformly true for
  them no matter what anyone's override is), but `useLocationSharing.js` now opens one direct
  `onSnapshot(doc(...))` per active member for non-owners instead — a single-document read has
  no such uniformity requirement, so this is the correct way to let Firestore decide
  visibility per person. A listener for someone not currently visible just silently gets
  nothing back; that's expected, not an error to chase.
- **Admin, Payments, Profile and Home** all now read from the same real hooks
  (`useExpenses()`, `usePayments()`, `useAnnouncements()`) instead of a mix of live data and
  leftover mock imports — this was also a correctness fix: Admin's "Group spend" stat had
  quietly still been reading old mock expenses instead of the real Firestore ones Expenses
  already used, so it could disagree with Expenses' own total. It can't anymore, since both
  pages now read the exact same hook.
- `src/data/mockTrip.js` lost its `packageTotalPaise`/`advanceReceivedPaise` fields (moved to
  `settings/payments` above, since they're genuinely load-bearing now, not cosmetic).
  `mockPayments.js` and `mockAnnouncements.js` are fully dead code — nothing imports either
  one anymore — but couldn't be deleted this session (terminal access blocked, same
  limitation noted in §10.3); delete both files by hand whenever convenient.

**Two manual steps you still need to do:**

1. **Publish the updated `firestore.rules`** in the Firebase console — same one-time step
   every Firestore change in this project has needed (Build → Firestore Database → Rules →
   paste → Publish). Nothing above works for anyone but you until this is done.
2. **Attribute the already-received ₹6,000 advance to whoever actually paid it**, once Payments
   is live — it isn't auto-assigned to anyone, since the app has no way to know who paid it in
   real life. Do this once from Admin's "Payment review" list, the same way you'd record any
   other real payment.
