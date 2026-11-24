# Git & GitHub inside VS Code — a beginner's guide

**What this file is for:** you asked how "git" actually works inside VS Code,
since you're new to GitHub. This explains the concepts in Flask terms, then
walks through the exact buttons to click — as an alternative to the terminal
commands in `GITHUB_DEPLOY_GUIDE.md` (both reach the same result; use
whichever feels easier, or mix and match).

## 1. Git and GitHub are two different things — the #1 mix-up

- **Git** is a program that runs entirely on your own laptop. It keeps a
  history of saved checkpoints ("commits") of your code, going back as far as
  you want, that you control — nothing leaves your computer. You could use
  Git forever and never touch GitHub at all.
- **GitHub** is a *website* that stores a copy of that history online. You
  choose when to send your local commits there ("push"). It's what makes your
  code backed up off your laptop, shareable, and (via GitHub Pages) hostable
  as a live site.

Flask analogy: Git is like a much more powerful, whole-project version of
hitting "save checkpoint" by hand whenever you want — not a single database
migration, a snapshot of *everything*. GitHub is the remote server you
optionally copy those checkpoints to, the same way you might `git push` a
Flask project to a VPS, except GitHub also hosts the static-site part for you
(already covered in `FIREBASE_SETUP_GUIDE.md` §4).

## 2. The vocabulary you'll actually see

| Word | What it means | Flask-ish analogy |
| --- | --- | --- |
| **Repository** ("repo") | This project folder, once Git is tracking it | The folder your Flask app already lives in — nothing moves |
| **Commit** | One saved checkpoint, with a short message | A named save-point you can always come back to |
| **Stage** | Choosing *which* changed files go into the next commit | Like `git add` — you can commit only some files at a time |
| **Push** | Copy your local commits up to GitHub | Deploying your migration history to a shared server |
| **Pull** | Bring down commits from GitHub that aren't on this computer yet | The reverse of push — matters once more than one device pushes |
| **Branch** | A named line of commits — `main` is the default one | We're only using one branch (`main`) for this project, so you can ignore this concept otherwise |
| **Remote** | The saved nickname (`origin`) for "which GitHub repo this folder is connected to" | Like an environment variable pointing at your deploy target |

## 3. Where this lives in the VS Code window

- The icon in the far-left sidebar that looks like three dots joined by
  branching lines — that's the **Source Control** panel. Click it (or press
  `Ctrl+Shift+G`).
- Once a repo exists, the **bottom-left corner** of the window shows the
  current branch name (`main`). Once it's connected to GitHub, a sync icon
  (two arrows in a circle) appears right next to it.
- Inside Source Control, every file you've changed since your last commit
  shows up under a **"Changes"** heading.

## 4. Today's one-time setup, step by step

**Step 0 — Install Git.** VS Code's Source Control panel is just a visual
wrapper around the same `git` program a terminal would use — it still needs
Git installed to do anything at all. This machine doesn't have it yet
(confirmed this session). Download it from
[git-scm.com/download/win](https://git-scm.com/download/win), run the
installer accepting every default ("Next" the whole way through), then
**fully close and reopen VS Code** (not just a terminal inside it) so it
detects the new install.

**Step 1 — Initialize the repo.** Open the Source Control panel. Since this
folder isn't tracked by Git yet, you'll see a button labeled **"Initialize
Repository."** Click it. (This is the exact same thing as typing `git init`.)

**Step 2 — Stage your files.** You'll now see every project file listed
under "Changes." Hover over the word **"Changes"** itself and click the **+**
icon that appears next to it — this stages everything at once. (Same as
`git add .`.)

**Step 3 — Commit.** Type a short message in the text box at the top of the
panel, for example:
```
Phase 1 + Phase 2 step 1: visual shell and real login
```
Then click the **✓ Commit** button above it (or press `Ctrl+Enter`).

**Step 4 — Publish to GitHub.** After your first commit, the same panel now
shows a **"Publish to GitHub"** button. Click it:
- If you've never signed in to GitHub inside VS Code before, it opens your
  browser asking you to log in (or create a free account at github.com
  first, if you don't have one) and authorize VS Code.
- It then asks for a repo name (anything — e.g. `tripverse`) and whether it
  should be **Public** or **Private** — choose **Public** (see
  `GITHUB_DEPLOY_GUIDE.md` §1 for exactly why that's the right call for free
  hosting).

That one click does what the terminal path does in three separate commands
(`git remote add`, `git branch -M main`, `git push -u origin main`) — VS Code
creates the actual GitHub repository *and* pushes your code, together, with
no separate trip to github.com needed.

## 5. From now on, whenever you make a change you want backed up

Source Control panel → stage (**+**) → type a short message → **✓ Commit** →
click **"Sync Changes"** (same button, now showing a sync icon instead of
"Publish"). That pushes the new commit to GitHub.

**Important:** pushing to GitHub only backs up your *code*. It does **not**
automatically update the live website — that's the separate `npm run deploy`
step covered in `GITHUB_DEPLOY_GUIDE.md` §5. Think of them as two different
buttons for two different jobs: "save my code's history" vs. "put this
exact version live for everyone to see."

## 6. Quick cross-reference to the terminal commands

| VS Code button | Terminal command it replaces |
| --- | --- |
| Initialize Repository | `git init` |
| **+** on "Changes" | `git add .` |
| ✓ Commit (with your typed message) | `git commit -m "your message"` |
| Publish to GitHub | `git remote add origin ...` + `git branch -M main` + `git push -u origin main` |
| Sync Changes (after the first publish) | `git push` |

Both paths end up at the exact same result — pick whichever you're more
comfortable with on a given day, there's no wrong choice.
