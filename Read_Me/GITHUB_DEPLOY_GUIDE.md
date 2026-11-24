# GitHub Deploy Guide — hosting TRIPVERSE for real

**What this file is for:** the exact steps to put TRIPVERSE on the internet via
GitHub Pages, so anyone with the link can open it on their phone — not just
people on your WiFi. Written to stand alone, same spirit as
`FIREBASE_SETUP_GUIDE.md` — hand it to any AI assistant on its own if you get
stuck without me.

**Status as of 2026-11-23:** not deployed yet. The code is now *ready* to
deploy (three small changes explained in §2). I tried to run the setup
commands myself this session (install Git, `git init`, first commit) but my
terminal access is blocked for this whole session — a permission-mode thing
on your end, not something retrying fixes. So §3/§4 below need your hands.

**Prefer clicking over typing?** Everything in §3 and §4 below can also be
done entirely with buttons inside VS Code — no terminal at all — see
[`GIT_AND_VSCODE_GUIDE.md`](GIT_AND_VSCODE_GUIDE.md). Same result either way;
use whichever feels easier.

---

## 1. The one real decision: public or private repo?

GitHub Pages is **free only for a public repository** on a personal GitHub
account. A private repo can use Pages too, but only on a paid GitHub plan.

So, practically: to host this for free, the GitHub repo holding your code
needs to be **public** — anyone can see your source code and your deployed
site's URL.

Here's exactly what that does and doesn't expose, same honesty-first approach
as everything else in this project:

| Thing | Public under this plan? | Is that actually a problem? |
| --- | --- | --- |
| Your React/JS source code | Yes, visible to anyone | No — it's just the app's logic, same as any open-source app. No real data lives in code (see `FIREBASE_SETUP_GUIDE.md` §8). |
| Your Firebase config (`apiKey`, `projectId`, etc.) | Yes, visible in the built JS once deployed | No — this is *designed* to be public (already explained in §8 of the Firebase guide). It's not a password. |
| The deployed site's login/sign-up screen | Yes, reachable by anyone with the URL | **This is the real tradeoff.** A stranger who finds the link could sign up for an account. |
| Your actual trip data (expenses, payments, locations) | No — stays in Firestore, protected by Security Rules, never touches GitHub | Protected regardless of the repo being public. |

The one genuine consequence: **a stranger with the URL could sign themselves
up.** Today, signing up just makes them a normal Member (or — only if they're
somehow the very first signup ever, before any of you — the Owner). Low odds,
and even if it happened, it's a Firestore `members` document you could delete
by hand in the Firebase console (`HOW_TO_MAKE_CHANGES.md` → "Group" already
covers this). For an 11-person friend trip, this is the same category of
accepted, low-stakes risk already written down for the self-promotion edge
case in `firestore.rules`.

If you'd rather close this off entirely later, the standard fix is an
**invite code** (a shared secret word required at sign-up, checked before
`createUserWithEmailAndPassword` runs) — not built now since nobody asked for
it, but easy to add as its own small step if you want it. Just say so.

**Going with: public repo**, since that's what makes free hosting possible
and the actual exposure is low-stakes for this trip. Tell me if you'd rather
pay for GitHub Pages on a private repo instead and we'll do that instead.

## 2. Code changes already made to be deploy-ready

Three small changes, done just now, all because GitHub Pages is *only* a
folder of static files with no server to help out:

- **`src/main.jsx`**: switched from `BrowserRouter` to `HashRouter`. Flask
  analogy: `BrowserRouter` needs the server to answer *every* URL (like
  `/itinerary`) with the same `index.html` — Flask could do that with a
  catch-all route, but GitHub Pages has no route logic at all, so a direct
  visit or refresh on `/itinerary` would 404. `HashRouter` keeps the real
  route after a `#` (`yoursite.com/#/itinerary`) — browsers always load the
  part before the `#` (just `index.html`) and hand the rest to your JS, so it
  works with zero server support.
- **`vite.config.js`**: added `base: './'`, so the built CSS/JS files
  reference each other with relative paths instead of assuming they live at
  the domain's root — needed because your site will live at a sub-path like
  `username.github.io/trip_management_website/`, not the bare domain.
- **`package.json`**: added two scripts —
  ```
  "predeploy": "vite build",
  "deploy": "gh-pages -d dist"
  ```
  npm automatically runs `predeploy` right before `deploy`, so one command
  (`npm run deploy`) builds the production files *and* publishes them.

None of this changes how the app looks or behaves when you run `npm run dev`
locally — it only matters once it's actually deployed.

## 3. One-time setup this needs from you

**a) Install Git.** This machine doesn't have it yet (confirmed while
preparing this guide). Download it from
[git-scm.com/download/win](https://git-scm.com/download/win), run the
installer, and you can accept every default option — just keep clicking
"Next" through the whole thing. Afterwards, **close and reopen your
terminal** (so it picks up the new install), then confirm it worked:
```
git --version
```
You should see something like `git version 2.4x.x`.

**b) Create the GitHub repo.** Go to [github.com/new](https://github.com) →
"New repository":
- Name it anything (e.g. `tripverse` or `trip_management_website`).
- Set it to **Public** (§1 above explains why).
- Do **not** tick "Add a README" — this project already has files; starting
  the GitHub repo empty avoids a merge conflict on the very first push.
- Click **Create repository**. Keep the page open — it shows you the exact
  URL you'll need in step (d) below (something like
  `https://github.com/<your-username>/<repo-name>.git`).

**c) Install the deploy tool** (one-time, local to this project):
```
npm install -D gh-pages
```
This downloads the `gh-pages` package that the `"deploy"` script from §2
actually uses to push your built site to GitHub.

## 4. First-time deploy — the actual commands

Run these, in order, in a terminal opened at
`c:\BotShare\OD\Python\trip_management_website` (after finishing §3):

```
git init
git add .
git commit -m "Phase 1 + Phase 2 step 1: visual shell and real login"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
Replace the `https://github.com/...` line with the exact URL GitHub showed
you in step (b). This pushes your **code** to GitHub — `.gitignore` already
keeps `.env.local` and `node_modules` out of it (nothing secret or huge gets
pushed).

Then, to actually publish the live site:
```
npm run deploy
```
This builds the app and pushes just the built `dist/` folder to a special
`gh-pages` branch GitHub Pages serves from — your real source code and that
published build stay separate, which is normal and exactly what this tool is
for.

**One manual click, one time only, to turn Pages on:** on GitHub, open your
repo → **Settings** → **Pages** (left sidebar) → under "Build and
deployment," set **Source** to **"Deploy from a branch,"** branch
**`gh-pages`**, folder **`/ (root)`** → **Save**. GitHub will then show you
the live URL — something like
`https://<your-username>.github.io/<repo-name>/`. It can take a minute or two
to go live the very first time.

## 5. Every time after this

Only one command, once you're happy with a change and want it live:
```
npm run deploy
```
That's it — no need to repeat the Pages setting or the `git remote add`
step. (You should still `git add . && git commit -m "..." && git push`
separately when you want your *source code* backed up on GitHub too —
`npm run deploy` only ever publishes the built site, it doesn't save your
code history.)

## 6. What this does *not* require

- No GitHub Actions, no YAML workflow files, no repo "Secrets" setup. Because
  `npm run deploy` builds **on your own machine**, it already has your real
  `.env.local` values available locally — they get baked into the build
  output before it's uploaded, the same way `npm run dev` already uses them.
  (A GitHub Actions-based auto-deploy-on-push setup is possible later if you
  want it, but it's extra complexity — six repo secrets to configure, a YAML
  file to maintain — for a benefit this 11-person trip doesn't need yet.)
- No change to Firebase itself. The deployed site talks to the exact same
  `tripverse-f6240` Firebase project your local dev server already uses.
