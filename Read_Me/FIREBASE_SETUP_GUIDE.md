# Firebase Setup Guide — Phase 2 (Login, Database, Deploy Workflow)

**What this file is for:** everything about connecting TRIPVERSE to a real
database and real logins. It's written to stand alone — if you get stuck and
want to ask a different AI assistant for help, you can hand it just this file
(plus `PROJECT_PLAN.md` and `HOW_TO_MAKE_CHANGES.md` if you want full context)
instead of pasting your whole codebase.

**Status as of 2026-11-22:** done — the Firebase project (`tripverse-f6240`)
is created, Email/Password sign-in is on, Firestore exists, and real Login is
now actually built and wired into the app (`src/context/AuthContext.jsx`,
`src/pages/LoginPage.jsx`). §7 below is kept as a record of how it was set up.

If you only read one section right now, read **§12 "What's left for you to
do"** at the very bottom — that's the actual next action now.

---

## 1. Is Firebase actually free?

Yes, for this project, with no realistic path to it costing anything.

Firebase's **Spark plan** is free forever, no credit card required to sign up.
The free daily quotas (reset every 24 hours):

| Resource | Free quota, every day | What an 11-person trip actually uses |
| --- | --- | --- |
| Authentication (logins) | 50,000 free logins/month (not even a daily cap) | 11 people logging in a few times a day — maybe 100–200/day |
| Firestore reads | 50,000/day | Every page load that shows data is a handful of reads. Even heavy use by 11 people is low hundreds/day |
| Firestore writes | 20,000/day | Every "add expense," "mark paid," "check in" is one write. Realistically dozens/day |
| Firestore storage | 1 GiB total | Text data like expenses/payments/locations is tiny — you'd need years to fill 1 GiB |

You would need roughly 100–1000x your actual usage before Firebase even shows
you a warning, let alone a bill. There is a "Blaze" paid plan that exists for
apps with thousands of active users — not relevant here. We will not enable
billing at all; Spark doesn't require it.

## 2. Build order (confirmed 2026-11-22)

1. **Login** (Firebase Authentication)
2. **Payments & Expenses** (Firestore)
3. **Itinerary** (Firestore) — Home's dashboard cards ride along with this,
   since they just deep-link into Itinerary/Journey/Expenses/Payments
4. **Live Journey / GPS** (Firestore + realtime listeners) — last, on purpose,
   because it's the hardest and most failure-prone part

This is your own proposed order, and it's the right one: Login unlocks
testing with several real traveller accounts at once, Payments/Expenses are
already fully working in-memory (just need a permanent home), Itinerary is
mostly read-only/low-risk, and GPS is deliberately saved for when everything
else is stable.

## 3. How "Home has 4 tabs" actually works — confirming your understanding

You asked whether Home's 4 dashboard cards are "home scripts" that somehow
contain Itinerary/Journey/Expenses/Payments. They don't — your understanding
is correct once stated plainly:

- `src/pages/ItineraryPage.jsx`, `JourneyPage.jsx`, `ExpensesPage.jsx`, and
  `PaymentsPage.jsx` are four fully independent pages, each with its own
  component folder and data file (see `HOW_TO_MAKE_CHANGES.md`'s "Quick map").
- `src/pages/HomePage.jsx`'s 4 cards are just **navigation links** — in Flask
  terms, each card is a styled `<a href="/itinerary">`-equivalent
  (`react-router-dom`'s `<Link to="/itinerary">`). Clicking one doesn't run
  any Itinerary logic *on* Home — it swaps the whole screen to the Itinerary
  page, which then runs its own independent code.
- Home never reads Itinerary's or Expenses' internal data structures directly.
  It only reads a few summary numbers (next stop name, today's day number,
  total pending amount) from the same shared data sources those pages use —
  there's no hidden coupling beyond "they both read the same underlying trip
  data," which is intentional and fine (see §5 below on how this holds once
  the data moves to Firestore).

## 4. What you're built on — correcting a mix-up

**This is not Python or Flask. It's React, which is JavaScript.** This is
worth stating plainly since you asked directly.

Why: **GitHub Pages** (the free hosting this project uses) can only serve
*static files* — HTML, CSS, and JavaScript that a browser can run entirely on
its own, with no program running on a server. Flask apps need an actual
running Python process (`app.run()` or similar) sitting on a server,
listening for requests, rendering templates on demand. GitHub Pages has no
such process — it's the equivalent of a folder of already-finished files
being handed to whoever asks for them. Python literally cannot run there.

React (via Vite) solves this by doing all the "rendering" ahead of time, in
the browser itself, using JavaScript instead of Python. The browser downloads
the JS once, then runs it locally to build/update the page — no server
round-trip needed for that part. That's *why* this project is JS-based: it's
not a style preference, it's the only thing that actually works on free static
hosting.

| What you know (Flask) | What this project uses instead | Why |
| --- | --- | --- |
| Python | JavaScript (via React) | Only JS runs inside a browser |
| `render_template('page.html', data=...)` | A React **component** — a JS function that returns what to show | Same job (data → HTML), done on the browser instead of your server |
| `@app.route('/itinerary')` in Flask | `react-router-dom`'s `<Route path="/itinerary">` in `src/App.jsx` | Same job (URL → which code runs), done entirely in the browser |
| Jinja `{{ }}` template variables | JSX `{ }` curly braces inside a component | Same job (insert a value into HTML) |
| A WSGI/Flask process running on a server | *Nothing* — GitHub Pages just serves files; Firebase (next section) stands in for "the server" | This is the actual architecture shift |

## 5. Where does the database come in? (Flask → Firebase)

| Flask mental model | Firebase equivalent |
| --- | --- |
| Your own server process handling requests | No server you write — the browser talks to Firebase directly over the internet using Firebase's JS SDK (a library, not a server) |
| `@login_required` + Flask-Login's session cookie | **Firebase Authentication** — Google runs the login system; your code just calls it |
| A SQL database (tables, rows, foreign keys) | **Cloud Firestore** — "collections" (≈ tables) of "documents" (≈ rows, but schema-less — each one is just a JSON object) |
| A `sessions` table, or Flask's signed session cookie | **Nothing you build.** The Firebase SDK stores a security token in the browser automatically and silently refreshes it — see §6 |
| Permission checks inside a view function (`if current_user.id != trip.owner_id: abort(403)`) | **Firestore Security Rules** — the same kind of check, but written once and enforced by Firebase's servers on every read/write, so it can't be bypassed by editing the frontend JS |

Each of the 8 sections keeps its own **collection** in Firestore —
`expenses`, `payments`, `itinerary`, `members`, and so on — mirroring the
same one-file-per-section split the code already has
(`src/data/mockExpenses.js` → later, the `expenses` collection). A security
rule or a bug touching `expenses` cannot reach into `payments`' data, same
spirit as the per-route `ErrorBoundary`s already in place.

There is **one** Firestore database per Firebase project — not a separate
"dev" and "live" database like a typical Flask app might use local SQLite
locally and Postgres in production. Your laptop running `npm run dev` and the
eventual real website both talk to the exact same Firebase project. This is
simpler than Flask's usual setup, but it does mean: once real data is in
there, everyone (including you testing locally) sees the same real data. We
can create a few obviously-fake test accounts for early testing if you want a
safety margin before using real traveller logins.

## 6. How login/sessions will actually work

In Flask, you'd write a `User` model, a login view that checks a password
hash, and `login_user()` which sets a signed cookie — then every request
checks that cookie via `current_user`.

With Firebase Authentication, you don't write any of that. The flow:

1. A traveller opens the site and sees a real login/sign-up screen (replacing
   today's dev-only "Previewing as Owner/Member" switch).
2. They enter an email + password (simplest method to start with — Firebase
   also supports Google sign-in, phone OTP, etc., but email/password is the
   least fiddly for 11 people you already know).
3. Your code calls `createUserWithEmailAndPassword(...)` (first time) or
   `signInWithEmailAndPassword(...)` (after that) — one function call each,
   from the `firebase/auth` library.
4. Firebase's servers verify it and hand back a signed token. **The Firebase
   SDK stores this token in the browser automatically** (similar spirit to a
   session cookie, but you never touch it directly) and quietly refreshes it
   in the background.
5. Every time the app loads, one listener — `onAuthStateChanged(auth, user =>
   ...)` — fires with either `null` (nobody logged in → show login screen) or
   a real `user` object (already logged in → go straight to Home). This is
   what gives you "members shouldn't need to log in repeatedly" for free: the
   browser already has the token, so there's no re-entering a password every
   visit, same as how a Flask session cookie keeps you logged in until it
   expires or you log out.
6. This `onAuthStateChanged` listener will replace the current
   `src/context/SessionContext.jsx` dev switch — same job (knowing "who's
   logged in right now"), driven by a real account instead of a dropdown.

No separate "sessions table" to design or clean up — Firebase manages the
token lifecycle for you. The only thing *you* store in Firestore is a small
`members` document per person (name, role, phone) linked to their login by a
user ID Firebase gives you — that's the equivalent of a Flask `User` row, but
without the password column, since Firebase holds the password itself and
never shows it to your code at all.

## 7. What you need to do first (done — kept as a record)

I can't click buttons in a browser for you, so this part is on you. It's
mostly clicking "Next" — nothing to write or install yet.

1. Go to **console.firebase.google.com** and sign in with a Google account
   (any Google/Gmail account works — doesn't need to be new).
2. Click **"Create a project"**. Name it something like `tripverse` or
   `himachal-trip-2026` — the name is just a label, travellers never see it.
3. When asked about **Google Analytics**, you can switch it off — not needed
   for this project. Click through to create the project (takes under a
   minute).
4. In the left sidebar, click **Build → Authentication → Get started**. Under
   "Sign-in method," enable **Email/Password** (click it, flip the toggle on,
   Save). That's the only sign-in method we need for now.
5. In the left sidebar, click **Build → Firestore Database → Create
   database**.
   - Choose a location close to India — **asia-south1 (Mumbai)** is the
     right pick.
   - When asked "test mode" vs "production mode": for this initial setup,
     **test mode** is fine (it's open read/write for 30 days, no real data in
     it yet). Before any real login or real trip data goes in, we'll write
     proper security rules together — that's a short, deliberate step, not
     something to skip, just not needed on day one.
6. Click the **gear icon → Project settings**, scroll down to **"Your apps,"**
   click the **`</>`** (web) icon, give it a nickname like `tripverse-web`,
   and click **Register app**. Firebase will show you a code block containing
   a `firebaseConfig` object with keys like `apiKey`, `authDomain`,
   `projectId`, etc.
7. **Copy those values somewhere safe** (a notes file is fine) and tell me
   you've got them — I'll create a `.env.local` file in the project with them
   in the correct `VITE_FIREBASE_*` format (see §8 for exactly why that file
   and not `.env.example`), and then write the real connection code
   (`src/lib/firebase.js`).

You do **not** need to touch billing, upgrade any plan, or enter a credit
card anywhere in this flow.

## 8. Code vs. data — what goes to GitHub, what goes to Firebase

This is a common mix-up coming from Flask, so it's worth being explicit:

- **`git push` only ever sends code** — your `.jsx`/`.js`/`.css` files. It
  never touches real data.
- **Real data (expenses, payments, accounts, locations) lives only in
  Firestore**, on Google's servers. It never passes through git, never shows
  up in a commit, and isn't part of your GitHub repo at all.
- **Firebase config keys** (the `apiKey`, `projectId`, etc. from §7 step 6)
  are a gray area, already handled correctly in this project:
  - They go in a file literally named **`.env.local`** (you create this
    yourself; I can't create it blind since it needs your real keys).
  - `.gitignore` already excludes `.env` and `.env.*` **except**
    `.env.example` (which is deliberately just a placeholder template, safe
    to commit, already in the repo).
  - So `.env.local` **never gets pushed to GitHub**, by design, already
    configured — you don't need to change anything there.
  - Note: Firebase's client config (`apiKey` etc.) is *designed* to be
    visible in a deployed site's JS bundle — it's not a secret like a
    database password. We still keep it out of git as good practice and to
    make swapping it easy, but if it ever did leak, Firestore Security Rules
    (§5) are what actually protects your data, not keeping this config
    hidden. **Never** put an actual secret/admin key behind a `VITE_`-prefixed
    variable, since anything with that prefix does get bundled into the
    public JS that ships to every visitor's browser.

## 9. What got built instead of a separate throwaway example

The original plan (kept below for context) was a tiny isolated
`learning-lab/` example before touching the real login screen. Since you'd
already created the real Firebase project yourself and asked to complete
Phase 2 directly, the real login screen got built straight away instead —
`learning-lab/README.md` is updated to say so, so that plan doesn't look
silently abandoned if you look there later.

The real code lives in three small files, each short enough to read top to
bottom, explained here in Flask terms:

- **`src/context/AuthContext.jsx`** — the backend logic. `onAuthStateChanged`
  plays the role of Flask-Login's `current_user` getting populated from the
  session cookie on every request. `createUserWithEmailAndPassword` /
  `signInWithEmailAndPassword` / `signOut` are your sign-up/login/logout view
  functions — except Firebase handles the password hashing and session
  storage for you instead of you writing it.
- **`src/pages/LoginPage.jsx`** — the template: a form that calls the
  functions above and shows a friendly message if one fails.
- **`src/components/layout/AccountMenu.jsx`** — the small "logged in as ___
  [Logout]" box, the same job as a `{{ current_user.name }}` snippet plus a
  `<a href="/logout">` link in a Jinja base template.

*Original plan, kept for context:* build one small, standalone example
inside `learning-lab/` first — just enough code to sign up, log in, log out,
and print "Welcome, you!" on screen, in a folder where breaking something
costs nothing. That step was intentionally skipped this time in favor of
going straight to the real, clearly-labeled code above.

## 10. Commands you'll run yourself this session

My terminal access is blocked in this session, so these need to run on your
machine directly (a terminal in the project folder,
`c:\BotShare\OD\Python\trip_management_website`):

```
npm install firebase
```
Adds the Firebase SDK as a project dependency (updates `package.json` and
`node_modules`) — one-time, needed before any Firebase code can run.

```
npm run dev
```
Starts your local preview, same as always. (You've likely already run this
today, since `node_modules` already exists in the project — if `npm run dev`
already shows you the site at `http://localhost:5173`, you're set, and only
the `npm install firebase` command above is new.)

Git/GitHub itself (`git init`, connecting to a real GitHub repo, and actually
hosting this live) now has its own dedicated guide, since that's moved up
from "later" to "today" — see `GITHUB_DEPLOY_GUIDE.md` (terminal commands) or
`GIT_AND_VSCODE_GUIDE.md` (VS Code buttons, no terminal needed).

## 11. What was built just now (2026-11-22)

- `.env.local` — your real Firebase config from §7, gitignored, never pushed
  to GitHub.
- `src/lib/firebase.js` — connects the app to your real `tripverse-f6240`
  Firebase project.
- `firestore.rules` — security rules for the `members` collection (who can
  read/write what). **Not live yet** — see §12, step 2.
- `src/context/AuthContext.jsx`, `src/pages/LoginPage.jsx`,
  `src/components/layout/AccountMenu.jsx` — the real login/sign-up screen,
  session handling, and account menu, replacing the old dev-only "Previewing
  as Owner/Member" switch everywhere it was used.
- `src/App.jsx` now sends anyone who isn't logged in to `/login` first;
  every other page sits behind that gate.
- The **first person to sign up automatically becomes the trip Owner** — no
  manual promotion step needed. Everyone who signs up after that defaults to
  a regular Member.
  **Update 2026-11-23:** everyone after the Owner now also starts out
  *pending* and can't get into the app until the Owner approves them from
  the Admin tab — see `Read_Me/PROJECT_PLAN.md` §10.4 and
  `Read_Me/HOW_TO_MAKE_CHANGES.md` → "Login / Account" / "Admin" for the
  full behaviour.
  **Update 2026-11-24 — superseded:** Owner is no longer "whoever signs up
  first." It's now one fixed, hardcoded email (`OWNER_EMAIL` in
  `src/context/AuthContext.jsx`, mirrored in `firestore.rules`) — sign up
  with that exact email and you're Owner, no matter when. See
  `Read_Me/PROJECT_PLAN.md` §10.5.
- **Payments and Expenses were deliberately left untouched** — they still
  run on `src/data/mockMembers.js` and the other mock files, exactly as
  before. That's on purpose, not an oversight: those two are the *next*
  Phase 2 step (§2), and touching them now would risk breaking something
  that already works. Group and Profile now show the real signed-up
  roster; Payments and Expenses still show the original placeholder
  travellers until their own migration step lands.

## 12. What's left for you to do

Three things, none of them code — these need your hands, not mine:

1. **Run `npm install firebase`** in the project folder (a permission
   setting blocked me from running terminal commands this session — see
   §10).
2. **Publish the security rules:** open `firestore.rules` at the project
   root, copy the whole file, then in the Firebase console go to
   **Build → Firestore Database → Rules tab**, replace everything there
   with it, and click **Publish**. Without this step, Firestore is still in
   its original 30-day "test mode" — open to anyone, fine briefly, not for
   real data.
3. **Run `npm run dev`**, open the site, and sign up using the Owner email
   set in `OWNER_EMAIL` (`src/context/AuthContext.jsx`) — that's what makes
   you the trip Owner now, not being first (see §11's 2026-11-24 update).
   Once you've confirmed it works, share the site's network URL with the
   rest of the group so each person can sign up for their own account —
   **each of them will land on a "waiting for approval" screen until you
   approve them from the Admin tab.**

   One gotcha specific to testing this way: browser geolocation (the live
   locations feature on Journey, see `PROJECT_PLAN.md` §10.8) only works
   over **HTTPS or `localhost`** — login, approvals, expenses etc. all work
   fine over a plain `http://192.168.x.x:5173` network URL, but a tester's
   phone will likely silently **block** location capture specifically on
   that address. Not a bug — it'll work normally once the site is actually
   deployed (GitHub Pages is HTTPS), or for anyone testing on `localhost`
   directly.
