# TRIPVERSE Learning Lab

This folder is just for you to learn in. Nothing in here is part of the real app —
it's a sandbox of small, standalone examples that each do **one thing**, so you can
run them, poke at them, and understand how Firebase actually works before we wire
it into the real TRIPVERSE pages.

Why a separate folder? Because mixing "teaching code" into `src/` makes the real
app messy and hard to maintain. Here, each lesson is self-contained — you can
delete any single lesson folder without affecting anything else.

Nothing exists here yet except this roadmap. Lessons get added one at a time,
right before we build the matching real feature — so the lesson is still fresh
in your head when you see the real version.

## How to think about this, coming from Flask

| What you know (Flask) | What you're about to learn (Firebase) |
| --- | --- |
| Your own server process, running `app.run()` | No server — the browser talks directly to Firebase over the internet |
| `@login_required` decorator you wrote | Firebase Authentication — Google-run login, you just call its SDK |
| A SQL database (tables, rows, `SELECT`) | Cloud Firestore — a NoSQL database (collections of documents, like folders of JSON files) |
| Checking `current_user.id == resource.owner_id` in a view function | Firestore Security Rules — the same kind of check, but written once and enforced by Firebase itself, not your code |
| A template re-rendering after you reload the page | A "realtime listener" — the page updates itself the instant the data changes, no reload |

## Lesson roadmap

### Lesson 1 — Firebase Auth 101 *(shipped directly instead, 2026-11-22)*
Goal: understand how a user actually logs in with no server of your own involved.
The original plan was a tiny standalone example here first — instead, since you'd
already created the real Firebase project and asked to go straight to Phase 2, the
real login screen got built directly as production code
(`src/context/AuthContext.jsx`, `src/pages/LoginPage.jsx`). The Flask-analogy
walkthrough that this lesson would have given you is instead in
`Read_Me/FIREBASE_SETUP_GUIDE.md` §9, explained against the real files. Nothing
missing — just delivered as the real thing instead of a throwaway copy of it.

### Lesson 2 — Firestore CRUD 101 *(shipped directly instead, 2026-11-23)*
Goal: understand how data is saved and read without a database server you manage.
Same story as Lesson 1: this landed directly as the real Expenses Firestore wiring
(`src/lib/useExpenses.js`) rather than a standalone example first, since the
pattern from Lesson 1 already applied directly. See `Read_Me/PROJECT_PLAN.md` §10.2
for the concrete save/read walkthrough against the real file.

### Lesson 3 — Realtime listeners 101 *(coming in Phase 3, alongside Live Journey)*
Goal: understand how a screen updates itself live, which is what makes GPS
tracking and live payment counts possible. A tiny example with a counter that
updates on its own in a second browser tab the moment you change it in the first.

---

Each lesson, when added, will be its own folder (`learning-lab/01-auth/`, etc.)
with its own tiny `README.md` explaining what to run and what you should see.
