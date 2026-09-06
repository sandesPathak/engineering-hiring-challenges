# Test summary — Aangan Giving 1.4.2

| | |
|---|---|
| **Tester** | |
| **Date** | |
| **Build** | 1.4.2 |
| **Effort** | ~N hours |
| **Recommendation** | **GO / GO WITH CONDITIONS / NO-GO** |

---

## Recommendation

Lead with it. Three or four sentences a technical lead can act on, and then forward to the
client without rewriting.

> **No-go for Friday as it stands.** Three defects would cause direct harm during a
> fundraising drive: the amount raised is overstated because refunds are still counted, any
> signed-in donor can read every other donor's personal details, and the courtyard grid
> hands the same stone to every simultaneous request. The first two are small fixes and I
> would expect them inside a day. The third needs a design decision, so my recommendation is
> to fix the first two, disable the units grid for launch, and ship the rest.

Take a position. "Here are some bugs" is not a recommendation, and deciding is the part of
the job we are hiring for.

---

## What I did

- How long, and how it was divided between exploratory, API, automation and writing
- What I ran it against and in what state
- What tooling

## Findings

Ranked. Most serious first. One line each, linking to the full report.

| # | Severity | Finding | Area | Report |
|---|---|---|---|---|
| 1 | Critical | | | [BUG-001](bugs/BUG-001-….md) |
| 2 | Critical | | | |
| 3 | High | | | |

**Totals:** N critical · N high · N medium · N low · N open questions

## Open questions for the product owner

Things where the specification is silent or ambiguous, with your reading and what you would
recommend. These are not defects and should not be in the table above.

1. …

## Automated coverage delivered

| Layer | Tests | Currently failing | Notes |
|---|---|---|---|
| API | | | |
| UI end-to-end | | | |
| Concurrency | | | |
| Accessibility | | | |

**N of M tests fail against 1.4.2.** Each failure corresponds to a finding above; the list
is in the suite's README. The suite is expected to go fully green once the findings are
fixed, and that is how it should be run in CI.

## Coverage gaps and residual risk

What I did not test, and what could still be wrong because of it. Be specific. This is the
section that protects everybody, including you.

- …

## What I would do next

In order, with a rough size.

1. …

## What I would ask the developers to change

To make this application easier to test and harder to break. Stable selectors, a test-data
endpoint, structured error codes, a schema validation library at the boundary, a lint rule
that bans a particular pattern.

- …
