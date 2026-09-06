# Rubric — Full-Stack Engineer

100 points. Two reviewers score independently, then compare. This is the actual sheet.

| Category | Points |
|---|---|
| 1. It runs | 20 |
| 2. Core requirements (M1–M9) | 25 |
| 3. Engineering judgement | 20 |
| 4. Security & data integrity | 15 |
| 5. Documentation & commits | 10 |
| 6. Video walkthrough | 10 |

---

## 1. It runs — 20 points

| | |
|---|---|
| **20** | Clean clone, `cp .env.example .env`, `docker compose up --build`, and both apps come up with seeded data. First try, no improvisation. |
| **15** | Comes up, but needed one obvious step your README did not mention. |
| **10** | Runs locally without Docker, and the README is honest about why. |
| **5** | Runs after we debug it for more than ten minutes. |
| **0** | We could not get it running. |

The clean-clone rehearsal in [`SETUP.md`](SETUP.md) is the whole defence here, and it takes
twenty minutes.

## 2. Core requirements — 25 points

Roughly 3 points per must-have, weighted by how much of the product depends on it.

| | Points | What full marks looks like |
|---|---|---|
| M1 | 2 | Real monorepo. `packages/shared` is imported by both apps. Lint clean. |
| M2 | 3 | Migrations committed, constraints in the DB, seed loads all 75 rows correctly. |
| M3 | 4 | Correct totals, **privacy enforced server-side**, refunds excluded, empty/loading/error states. |
| M4 | 4 | Guest checkout, presets and custom, server-side amount validation, decline **and timeout** handled distinctly, receipt number. |
| M5 | 4 | Role separation enforced in the query, search works in Devanagari, pagination correct at boundaries, refund transactional, CSV survives the awkward rows. |
| M6 | 3 | See category 4 — scored there in detail; this is the "did you do it at all" mark. |
| M7 | 2 | Multi-stage build, health check, non-root, `.dockerignore`. |
| M8 | 2 | The tests listed in M8 exist and pass. |
| M9 | 1 | READMEs and `AI-USAGE.md` present. |

Should-haves and stretch goals do **not** add points in this category. They add in category 3,
and only once the must-haves are complete. A stretch goal attempted while M5 is broken
*costs* you, because scope discipline is part of what we are hiring for.

## 3. Engineering judgement — 20 points

The category with the most spread, and the one that decides between two submissions that
both work.

**Structure — 6**
Sensible module boundaries. Business rules are not living inside route handlers or React
components. Naming a stranger can follow. No file over 500 lines. No abstraction invented
for a single call site.

**Trade-offs, written down — 6**
A *Decisions* section in the README that names what you chose, what you rejected, and why.
This is where we look to see whether you think or whether you type. A submission with a
weaker implementation and a sharp Decisions section frequently outscores a stronger
implementation with none.

**Correctness under awkward input — 4**
The seed data is full of traps. Did the comma-and-quotes name survive the round trip? Does
the Devanagari donor come back from search? Is $25,000.01 rejected and $25,000.00 accepted?
Does an empty campaign render `0%` rather than `NaN%`?

**Tests that test the hard thing — 4**
The authorisation test. The refund test. The money boundaries. If you attempted X1, the
concurrency test. Forty assertions on a form validator and none on the money path scores
low here regardless of the count.

## 4. Security & data integrity — 15 points

Scored against [`../../docs/04-security-baseline.md`](../../docs/04-security-baseline.md).
We check these by hand, with `curl`, against your running app.

| Check | Points |
|---|---|
| Authorisation per record — donor A cannot read donor B's donation | 3 |
| Privacy modes enforced in the API payload, not the UI | 3 |
| Money as integer cents throughout, correct arithmetic | 3 |
| Input validated with a schema; client-supplied amounts not trusted | 2 |
| Output escaped — the two XSS payloads in the seed data never execute | 2 |
| Secrets absent from the repo and its history; passwords hashed properly | 1 |
| Parameterised queries, including any dynamic `ORDER BY` | 1 |

**Automatic deductions**, applied on top of the category score:

| | |
|---|---|
| A live credential anywhere in the repository or its history | −10 |
| An XSS payload from the seed data executing in a browser | −8 |
| Money stored or calculated as a float | −8 |
| Any authenticated user able to read any other donor's record | −8 |
| Passwords stored in plain text, or hashed with a bare SHA/MD5 | −8 |

These are the failures that would hurt a real donor, so we treat them the way we would
treat them in review.

## 5. Documentation & commits — 10 points

| | Points |
|---|---|
| README a stranger can run the project from, with test accounts and expected output | 3 |
| *Decisions* and *Known issues* sections that are honest and specific | 2 |
| Comments that explain **why**, at a sane density, with no AI narration left in | 2 |
| Commit history: multiple coherent commits, human messages, no `final` | 2 |
| `AI-USAGE.md` present and specific about what you changed | 1 |

## 6. Video walkthrough — 10 points

| | Points |
|---|---|
| 2–3 minutes, link opens without an account | 2 |
| The app demonstrated running, not described | 3 |
| One technical decision explained with its alternative | 3 |
| Honest about gaps and what you would do next | 2 |

Over five minutes, or no video at all, caps this category at 2.

---

## Bonus — up to +8, only when the must-haves are complete

| | |
|---|---|
| **X1, the dedication grid with a passing concurrency test** | **+5** |
| Idempotency on donation intake, done properly (S3) | +2 |
| Bilingual UI that survives Devanagari layout (S5) | +1 |
| Accessibility pass with axe results in the README (X3) | +1 |
| Server-side PDF receipt (X2) | +1 |
| Deployed and reachable (X4) | +1 |

Capped at +8, and it cannot lift a submission that lost category 1.

---

## Worked examples

**A 91.** Everything runs first try. Must-haves complete. `packages/shared` holds the money
type and the Zod schemas, and both apps import them. The Decisions section explains why they
used optimistic concurrency for holds and names the load at which they would switch. There
is a test that fires 20 concurrent requests at one unit and asserts one winner. The CSV
export is streamed and quoted. The README lists three known issues, one of which we had
already spotted. The video is 2:40 and shows a refund correcting the total live.

**A 68.** Everything runs. Must-haves nearly complete, but pagination repeats a row across
page 2 and the CSV export shifts a column on the `Shrestha, Bijay "BJ"` row. Money is
correct. Authorisation is correct. Tests exist but only cover the happy path. The README is
adequate and has no Decisions section. Good submission, clear interview, specific questions.

**A 41.** Runs after we fix an unmentioned migration step. The campaign page is attractive
and the donation form works. Amounts are floats. The public API returns `donorName` for
anonymous donations and the React component hides it. One commit, "initial commit". No
video. The technical instinct is visible, but every one of those is a defect that would
reach a donor.
