# Requirements — QA Engineer

Five deliverables. **D1 to D4 are the must-haves.** Do them properly before anything below.

Everything goes in your own repository, in a `qa/` folder or at the root — your call, just
say where in your README.

---

## D1 — Test plan (`TEST-PLAN.md`)

Written **before** you go deep, and it is fine — good, even — to revise it afterwards and
say what changed.

- **Scope.** What you are testing and, more importantly, **what you are not**, with a
  reason. "I did not test the units grid on mobile because the spec marks it desktop-only
  in 1.4" is a strong sentence.
- **Risk assessment.** Where do you expect the damage to be, and why? For a donation
  platform, rank by consequence to the organisation and its donors, not by how easy the area
  is to test. Say what informed the ranking.
- **Approach.** Which of exploratory, functional, API, security, concurrency, accessibility,
  compatibility, data-integrity testing you used, and where.
- **Test charters or cases.** Either style is fine. Session-based charters
  ("Explore the refund flow with concurrent staff sessions, to discover state
  inconsistencies") are as acceptable as a numbered case table — we want to see structure,
  not a particular template.
- **Environment.** How you ran it, browsers and versions, the OS, the data state, whether
  you changed `GUEST_COOLDOWN_SECONDS`.
- **Entry and exit criteria.** What would make you say "this is ready for Friday", and what
  would make you say no.

## D2 — Bug reports (`bugs/`)

One file per defect, or one table if you prefer — but each defect gets the full treatment.
Use [`templates/bug-report-template.md`](templates/bug-report-template.md).

Each report needs:

- a **title** a developer can triage without opening the file
- **severity** and **priority**, as two separate judgements, with a sentence of reasoning
- **steps to reproduce** — numbered, exact, from a known state (`npm run reset`), including
  the account used, the data used, and the exact request if it is an API defect
- **expected** result, **with a citation to `SPEC.md`** — section number
- **actual** result, with the evidence: a response body, a screenshot, a log line, a number
- **impact in the client's language.** Not "IDOR on `/api/donors/:id`" but "any donor who
  signs in can read every other donor's home address and phone number by changing a number
  in the URL — several hundred families, including people who asked to be anonymous"
- **environment**
- **suggested fix or area**, if you have one. Optional, and appreciated.

**Quality over quantity.** Ten sharp reports beat thirty thin ones. Duplicates, and defects
that are actually documented behaviour from `SPEC.md` §7, both cost you points.

If you are unsure whether something is a defect, **report it as a question** with your
reasoning. That is a real category and we score it positively — it is what you would do on
the job.

## D3 — Automated regression suite

The deliverable that outlives you. Playwright is preferred; Cypress, or Playwright in
Python or Java, are all fine.

**Requirements:**

- Runs from a documented command, from a clean clone: `npm test` or equivalent
- Runs against the app started per [`app/README.md`](app/README.md) — say whether it expects
  the app already running, or starts it itself
- Resets or accounts for its own data state. A suite that only passes on a fresh database
  and does not say so is a flaky suite
- Deterministic. No `waitForTimeout(3000)` as a synchronisation strategy
- Readable. A developer who has never seen it should be able to add a case

**Coverage we look for:**

| Layer | What we want to see |
|---|---|
| **API** | The fastest, most valuable layer here. Authorisation, validation, privacy in payloads, totals arithmetic. |
| **UI end-to-end** | At least the donation flow and one staff flow. |
| **Concurrency** | At least one test that fires simultaneous requests and asserts what the spec requires. This is worth more than any five UI tests. |
| **Accessibility** | Automated is fine — `@axe-core/playwright` on the two main pages, plus a manual keyboard pass noted in your plan. |

**Every regression test must have failed at least once.** Before you submit, check that each
test for a defect you found **fails against the app as shipped**. A test that passes whether
or not the bug is present is worse than no test, because it creates false confidence. Mark
them clearly:

```js
// Fails against 1.4.2 — see bugs/BUG-004-anonymous-donor-name-in-payload.md
test('an anonymous donation exposes no donor identity in the public payload', async () => { … });
```

We will run your suite and expect a specific number of failures. Tell us that number in your
README, and tell us which failures are the bugs you found. **A suite that is fully green
against a knowingly broken application is a contradiction, and we read it as one.**

## D4 — Test summary (`TEST-SUMMARY.md`)

The document you would actually send to the technical lead. Use
[`templates/test-summary-template.md`](templates/test-summary-template.md).

- What you tested, in how long, and how
- **The findings table**, ranked by severity, one line each
- **A go / no-go recommendation for Friday, with conditions.** Take a position. "Ship, but
  only after the three critical items, and with the units grid disabled" is a real answer.
  "Here are some bugs" is not.
- Coverage gaps and residual risk — what you did not test and what could still bite
- What you would automate next, and what you would ask the developers to change to make the
  application more testable

This is the document a client-facing lead reads. It is scored as writing as well as
analysis.

## D5 — The video

2–3 minutes. See [`../../docs/06-video-walkthrough.md`](../../docs/06-video-walkthrough.md)
— it has a QA-specific structure. Reproduce one finding live, and show your suite running,
including a test failing against the unfixed bug.

---

## Should-have — if the must-haves are genuinely done

- **A CI workflow** (`.github/workflows/`) that runs the suite on push, with the report as
  an artefact. This is the deliverable that makes the suite matter, and it is the single
  best use of your remaining time.
- **A performance or load observation** — k6 or autocannon against the donation endpoint,
  with a number, not a feeling.
- **A cross-browser run** on Chromium, WebKit and Firefox, with the differences noted.
- **A test-data strategy** — factories, fixtures, or a documented approach to the state
  problem, rather than depending on the seed.
- **A defect-prevention note.** One page: given what you found, what would you change about
  how this team works? A pull-request checklist, a schema validation library, a lint rule.
  This is the thinking that separates a tester from a QA engineer.

## Not in scope

- Testing anything outside the provided app. Do not scan or attack any other host.
- Load testing to the point of a denial of service. Note the risk and move on.
- Fixing the bugs. If a fix is one obvious line, mention it in the report — but the
  deliverable is the finding and the test, not a patch.
