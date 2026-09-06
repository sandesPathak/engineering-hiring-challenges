# Test plan — Sabhaghar Booking 2.3.1

| | |
|---|---|
| **Author** | |
| **Date** | |
| **Build** | 2.3.1 |
| **Time available** | |

## 1. Objective

One paragraph. What question is this testing effort answering? For this exercise it is
usually: *can this go to a client for a live booking season on Friday, and if not, what
exactly is in the way?*

## 2. Scope

**In scope**

- …

**Out of scope, and why**

- …

> This second list is scored. "I did not verify the CSV byte-order mark in Excel because I
> do not have it, so that finding rests on a hex dump rather than on the spreadsheet" is a
> strong sentence. An empty out-of-scope list means either you tested everything, which you
> did not, or you did not decide.

## 3. Risk assessment

Rank by consequence to the organisation and its members, not by how easy an area is to test.
Say what informed each ranking.

| # | Risk | Why it matters here | Likelihood | Impact | Where I will look |
|---|---|---|---|---|---|
| 1 | Two families given the same room | Somebody is turned away on the day of their wedding | | | Concurrent requests, approval, availability |
| 2 | Member personal data exposed | Home addresses and phone numbers for several hundred families | | | API payloads, authorisation |
| 3 | Money reported wrong | The treasurer reconciles hire fees and deposits against the bank | | | Stats, totals, export |
| 4 | … | | | | |

## 4. Approach

Which techniques, applied where, and why that split.

| Technique | Where | Why |
|---|---|---|
| Exploratory (session-based) | | |
| API testing | | |
| Concurrency testing | | |
| Security testing | | |
| Accessibility | | |
| Data integrity / arithmetic | | |
| Cross-browser | | |

## 5. Test charters or cases

Either style. Charters look like this:

> **C1 — Explore the cancellation flow with two sessions, to discover state inconsistency
> between the booking record, the availability grid, the public calendar and the stats.**
> *45 minutes.*

Cases look like this:

| ID | Area | Precondition | Steps | Expected (spec ref) | Priority |
|---|---|---|---|---|---|
| TC-01 | Booking request | Fresh reset | … | 422, `SPEC.md` §5 | High |

## 6. Environment

- App version and how it was started
- `GUEST_COOLDOWN_SECONDS` and anything else you changed
- Data state and how it is reset
- Browsers, versions, OS
- Tooling

## 7. Entry and exit criteria

**Entry** — what has to be true before testing starts.

**Exit** — what has to be true before you would say "this can go to the client". Be
specific enough that somebody else could apply it without you.

## 8. Deliverables

- `TEST-PLAN.md` (this)
- `bugs/`
- `qa/` automated suite
- `TEST-SUMMARY.md`
- Video

## 9. What I revised, and what I got wrong

Write this at the end, after you have tested. Where was your risk ranking wrong? What
surprised you? This section is short and it is one of the most valuable things we read,
because it is the only direct evidence of you updating a belief.
