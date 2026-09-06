# Setup — a suggested path through the day

Not compulsory. It is the order we would use, and the biggest mistake we see is spending
four hours writing automation before knowing what is worth automating.

---

## Step 0 — get your machine ready (10 minutes, do it first)

| | What | Install link |
|---|---|---|
| 1 | **Node.js 24 LTS** | [nodejs.org/en/download](https://nodejs.org/en/download) — or `nvm install 24 && nvm use 24` ([nvm](https://github.com/nvm-sh/nvm), [nvm-windows](https://github.com/coreybutler/nvm-windows)) |
| 2 | **Docker Desktop** / Docker Engine + Compose v2 — optional, the app also runs with plain Node | [docs.docker.com/get-started/get-docker](https://docs.docker.com/get-started/get-docker/) |
| 3 | **Git** | [git-scm.com/downloads](https://git-scm.com/downloads) |
| 4 | An **API client** — curl is enough | [Bruno](https://www.usebruno.com/) · [Postman](https://www.postman.com/downloads/) · [HTTPie](https://httpie.io/cli) |
| 5 | A **screen recorder** for the video | [Loom](https://www.loom.com/) · [OBS](https://obsproject.com/) · macOS `Cmd-Shift-5` |

**You do not install a database.** The app under test uses `node:sqlite`, which ships inside
Node 24 — there is nothing to set up and nothing to connect to. When you run the app under
Docker, that file lives in a named volume; the compose file is already written for you in
[`app/docker-compose.yml`](app/docker-compose.yml).

For the automation you write, [Playwright](https://playwright.dev/docs/intro) and
[Vitest](https://vitest.dev/guide/) are the fast defaults, but use whatever you are quickest
in — the choice is not graded, the coverage is.

Fork this repository and clone your fork
([how to fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo)):

```bash
git clone https://github.com/<you>/engineering-hiring-challenges.git
cd engineering-hiring-challenges/roles/qa-engineer
node -v      # must print v24.x
```

---

## 0:00 – 0:30 — Get it running and read the spec

```bash
cd roles/qa-engineer/app
npm install && npm start        # or: docker compose up --build
open http://localhost:4000
```

Sign in to `/staff.html` as `staff@himalayacc.example` / `staff12345`.

Then **read [`app/SPEC.md`](app/SPEC.md) properly.** All of it, including §7. Twenty
minutes. Every hour you spend testing without it is an hour of guessing, and §7 is the
difference between a report that reads as careful and one that reads as noise.

While you read, keep a list of the claims the spec makes that a tester could check. That
list is the beginning of your test plan.

## 0:30 – 1:00 — Write the plan before you go deep

Ten focused minutes on `TEST-PLAN.md`: scope, risk ranking, approach, environment. It will
be wrong in places and you will revise it at the end — that revision is worth writing down
too, because "here is what I got wrong about where the risk was" is a genuinely strong thing
for us to read.

Rank by **consequence to the organisation and its members**, not by ease of testing. For a
building that a community books and pays for, our own ranking would start with: two
families are given the same room on the same afternoon, a member's private data leaks, the
money owed is wrong, the office cannot trust the numbers it reports to its board.

## 1:00 – 2:30 — Exploratory testing, notes as you go

Two browser tabs, and your API client open beside them. Keep a running log — timestamp,
what you tried, what happened. Write bug reports later; capture evidence now, because you
will not remember the exact steps at 9pm.

Places worth your attention on a booking platform:

- **Boundaries.** Minimum, maximum, one under, one over, zero, negative, empty, absent, a
  string where a number goes, a very long string, a very large number
- **The payload, not the page.** Open dev tools and read what the API actually returns.
  A field the interface does not display is still a field that left the server
- **Two of everything.** Two accounts, two tabs, two simultaneous requests
- **The awkward seed rows.** The name with a comma and quotation marks, the Devanagari
  name, the purpose containing HTML. They are in the data on purpose
- **The edges of a time range.** Back-to-back bookings, a booking that ends exactly when
  another starts, one that swallows another whole, midnight, and the last slot of the day
- **Round trips.** Export, then look at the export. Save, then reload. Cancel, then check
  every number that should have moved
- **The keyboard.** Try the whole booking request without touching the mouse

The single most useful habit: after every action, **check a number somewhere else**. Cancel
a booking and then look at the hours booked, the hire fees, the deposits held, the public
calendar and the availability grid. Inconsistency between two views of the same fact is
where the good findings are.

## 2:30 – 3:15 — Go under the interface

The interface hides more than it shows. Spend real time here.

```bash
# The public calendar payload — read every field, not the ones the page renders
curl -s 'localhost:4000/api/calendar?from=2026-10-01&to=2026-12-31' | jq

# Sign in, look at the token you were given, and think about what it is made of
curl -s -X POST localhost:4000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"member@himalayacc.example","password":"member12345"}' | jq

# What does one member see of another member's booking?
curl -s localhost:4000/api/bookings/HCC-BK-4271 -H "authorization: Bearer <member-token>" | jq

# What does the API do with input the form would never send?
curl -s -X POST localhost:4000/api/bookings -H 'content-type: application/json' \
  -H "authorization: Bearer <member-token>" \
  -d '{"spaceSlug":"library","eventDate":"2026-12-01","startTime":"09:00","endTime":"10:00","attendees":5000,"purpose":"x"}'

# And what the availability endpoint says, next to what the request endpoint does
curl -s 'localhost:4000/api/spaces/courtyard/availability?date=2026-11-07' | jq
```

Check the totals against the numbers in [`app/README.md`](app/README.md), by hand, with a
calculator. If a number is wrong, you have found something and you can prove it
arithmetically, which is the strongest kind of bug report there is.

## 3:15 – 3:45 — Concurrency

You cannot find these by clicking, and they are worth the most.

```js
// two-at-once.mjs — Node 24, no dependencies
const token = '<a member token from /api/auth/login>';
const body = JSON.stringify({
  spaceSlug: 'kitchen',
  eventDate: '2026-12-15',
  startTime: '09:00',
  endTime: '11:00',
  attendees: 10,
  purpose: 'Concurrency check',
});
const fire = () =>
  fetch('http://localhost:4000/api/bookings', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body,
  }).then((r) => r.status);

const results = await Promise.all(Array.from({ length: 10 }, fire));
console.log(results);
// SPEC.md §5: two members requesting the same slot at the same moment must not both succeed.
// So: how many of these should have been 201?
```

Ask the same question of every operation where two people could want the same thing, or
where the same person could send the same thing twice.

## 3:45 – 5:30 — Write the automated suite

Now that you know what matters.

```bash
mkdir qa && cd qa
npm init -y
npm i -D @playwright/test
npx playwright install --with-deps chromium
npx playwright test
```

Build it in this order — it is the order of value:

1. **API tests for the defects you found.** Fast, stable, and each one is a regression test.
   Check each **fails** against the app as shipped
2. **One concurrency test** asserting what §5 requires. This is the highest-value test in
   the suite
3. **One end-to-end UI flow** — request a booking, then see it in the office console
4. *(Bonus, if you are ahead)* API tests for the rules that are currently correct, so a
   future change cannot break them silently, and `@axe-core/playwright` on both pages

Keep it readable. Name each test after the behaviour it protects, not the endpoint it calls.

## 5:30 – 6:30 — Write it up

Bug reports from your notes, then `TEST-SUMMARY.md`. Rank by severity. Take a position on
Friday's release.

Write the summary as though it is going to the technical lead and then to the client,
because in this job it is.

## 6:30 – 7:00 — Check your own work, then record

```bash
npm run reset          # in app/
npx playwright test    # how many fail? is that the number you expect?
```

Follow **your own README** from a clean clone. Then record the video in one take.

---

## Tooling suggestions

Use what you know. If you have no preference:

| | |
|---|---|
| **Automation** | Playwright — one tool for UI and API, and its trace viewer is excellent evidence for a bug report |
| **API by hand** | `curl` + `jq`, Postman, Bruno, HTTPie, or the VS Code REST client |
| **Accessibility** | axe DevTools browser extension, then `@axe-core/playwright` |
| **Load** | k6 or autocannon, if you get that far |
| **Evidence** | Playwright traces, or any screen recorder. A 20-second clip of a race condition is worth a page of prose |

## Practical notes

- **`npm run reset`** before anything that asserts on totals
- **Blackout dates are intentional** (`SPEC.md` §7.3). If a test date keeps being refused,
  check it is not one of the four closed days before you write it up
- **Do not point any tool at anything except this app.** No scanning other hosts, no load
  testing to the point of denial of service
- **Capture evidence as you go.** Re-deriving a reproduction at 10pm is how good findings
  get dropped

## How people lose points here

- Writing 60 UI tests and finding no security or concurrency defects
- Reporting §7 behaviour as a bug — it says, in writing, that reading is optional for you
- Bug reports without steps a developer can follow, or without a spec citation
- An automated suite that passes completely against an application that is knowingly broken
- No summary, or a summary with no recommendation in it
- Finding a serious defect and burying it at number 14 in an unranked list
