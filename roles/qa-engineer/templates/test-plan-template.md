# Test plan — Aangan Giving 1.4.2

| | |
|---|---|
| **Author** | |
| **Date** | |
| **Build** | 1.4.2 |
| **Time available** | |

## 1. Objective

One paragraph. What question is this testing effort answering? For this exercise it is
usually: *can this go to a client for a live fundraising drive on Friday, and if not, what
exactly is in the way?*

## 2. Scope

**In scope**

- …

**Out of scope, and why**

- …

> This second list is scored. "I did not test the units grid on a phone because `SPEC.md`
> §11 makes it desktop-first and the fundraising drive is email-driven to desktop" is a
> strong sentence. An empty out-of-scope list means either you tested everything, which you
> did not, or you did not decide.

## 3. Risk assessment

Rank by consequence to the organisation and its donors, not by how easy an area is to test.
Say what informed each ranking.

| # | Risk | Why it matters here | Likelihood | Impact | Where I will look |
|---|---|---|---|---|---|
| 1 | Money reported wrong | The treasurer reconciles against a bank statement; the board sees the number | | | Campaign totals, refunds, export |
| 2 | Donor personal data exposed | Home addresses and giving history for several thousand families | | | API payloads, authorisation |
| 3 | Two donors given the same unit | An engraved stone cannot be given to two people | | | Concurrent holds |
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

> **C1 — Explore the refund flow with two staff sessions, to discover state inconsistency
> between the donation record, the campaign total, the public list and the stats panel.**
> *45 minutes.*

Cases look like this:

| ID | Area | Precondition | Steps | Expected (spec ref) | Priority |
|---|---|---|---|---|---|
| TC-01 | Donation | Fresh reset | … | 422, `SPEC.md` §5 | High |

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
