# How we evaluate

This is the actual scorecard. We are showing it to you because a hiring exercise where the
candidate has to guess the rubric tests guessing, not engineering.

Two people read every submission independently, score it, and then compare. Where we
disagree by more than a band, a third person reads it.

## The shared rubric — 100 points

Both roles are scored on these six categories. The weights differ per role; the
role-specific `RUBRIC.md` in your folder has the exact numbers and the detail.

| # | Category | Full-Stack | QA | What earns points |
|---|---|---|---|---|
| 1 | **It runs** | 20 | 20 | A stranger clones it, follows the README, and it works. First try. |
| 2 | **Core requirements** | 25 | 30 | The must-have list in your `REQUIREMENTS.md`, done properly. |
| 3 | **Engineering judgement** | 20 | 15 | Structure, naming, the trade-offs you made, what you chose *not* to build. |
| 4 | **Security & data integrity** | 15 | 15 | Money, authorisation, validation, concurrency, secrets. |
| 5 | **Documentation & commits** | 10 | 10 | README, comments, commit history, bug reports. |
| 6 | **Video walkthrough** | 10 | 10 | Can you explain your own work in three minutes. |

### Bands

| Score | What happens |
|---|---|
| **80+** | Strong hire. Interview scheduled, and the conversation is about how you would approach the real change orders. |
| **65–79** | Interview. We have specific questions about specific decisions. |
| **50–64** | Borderline. Usually one category collapsed. We may ask you to talk us through it before deciding. |
| **< 50** | No. We tell you the specific reason. |

---

## The four things that sink most submissions

In order of how often we see them.

### 1. It does not run

We give you one honest attempt. Clean clone, follow your README exactly, no improvisation.
If we hit an error we cannot resolve in ten minutes, category 1 goes to zero and everything
downstream is guesswork.

**The fix takes twenty minutes.** Before you submit:

```bash
cd ..
git clone <your-repo-url> clean-test
cd clean-test
# now follow YOUR OWN README, word for word, and do not use any knowledge
# that is only in your head
```

Do it on a machine that has never had your project on it, or at least in a fresh directory
with `node_modules` gone and Docker volumes pruned. Most "it works on my machine" failures
are an uncommitted `.env`, a global package you forgot you installed, or a database that
only has data because you seeded it by hand in March.

### 2. One giant commit

`git log` shows a single commit called "final" or "initial commit" containing 4,000 lines.
We cannot see how you work, which is half of what we were trying to learn. This is a
straight deduction — see [`02-git-history-and-commits.md`](02-git-history-and-commits.md).

### 3. Money as a float

`price * quantity` in floating point, `parseFloat` on user input, a total that is
`149.99999999999997`. In a donation system this is disqualifying on its own, because it
means we would have to check every arithmetic line you ever write.

Store money as **integer minor units** (cents). Format at the edge, for display only.

### 4. No authorisation check

Authentication answers "who are you". Authorisation answers "are you allowed to touch
*this* record". We see a lot of submissions with a login and no second check, where
`GET /api/donations/42` returns donation 42 to anybody with any valid session.

---

## What earns disproportionate credit

- **A written trade-off.** A short "Decisions" section in your README that says *"I used
  optimistic locking rather than a row lock because the contention window is short and I
  wanted the read path to stay cheap; under heavier write load I would switch"* moves you a
  whole band. It shows us the thing an interview is trying to find out.
- **Saying what is broken.** "The CSV export does not escape commas in names. I found it, I
  ran out of time, here is where it is." That is honest engineering and we reward it. We
  find these things anyway; the difference is whether we found them *with* you or *about* you.
- **Disagreeing with the spec.** These specifications have deliberate gaps and at least one
  arguable decision. Noticing and saying so, in writing, is exactly the behaviour we want.
- **Tests on the hard part.** Anybody can test the happy path. A test that proves two
  concurrent requests cannot double-book the same unit tells us more than forty assertions
  on a form validator.
- **Restraint.** Doing the must-haves excellently and skipping the stretch goals with a
  sentence explaining why beats doing everything at 60%.

## What we explicitly do not care about

- Which framework you chose, as long as you can defend it
- CSS polish beyond "legible and not broken on a phone"
- Test coverage percentage as a number
- Whether you used an AI agent (assume we assume you did)
- Whether your English is native. We are a distributed team; several of us are not. We are
  reading for clarity of thought, not grammar.
