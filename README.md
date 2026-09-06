# Engineering Hiring Challenges

Welcome, and thank you for the time you are about to spend on this.

This repository holds the take-home exercises for two open roles:

| Role | Folder | What you build |
|---|---|---|
| **Full-Stack Engineer** | [`roles/full-stack-engineer/`](roles/full-stack-engineer/) | A donation tracking page — backend, frontend, database, Docker — in a monorepo |
| **QA Engineer** | [`roles/qa-engineer/`](roles/qa-engineer/) | Find the defects we planted in a running donation app, then automate the regression suite |

You only do the one you applied for. If you applied for both, do the one you want to be
hired for first, and tell us in your email that the second one is a bonus.

---

## The 24-hour rule

**You have 24 hours from the moment we email you the link to this repository.**

That is a deadline, not a workload. We expect somewhere between **5 and 8 hours of actual
work**. The rest of the day is so you can sleep, go to your current job, and think about it
away from the keyboard. Nobody here wants you to pull an all-nighter — we can tell when
somebody did, and it does not score better.

Because the clock is short, **scope is your first engineering decision**. Every exercise in
this repo is split into *must-have*, *should-have* and *stretch*. Do the must-haves
properly. Then decide, deliberately, what to do next with the time you have left — and
write that decision down in your README. We would much rather read "I stopped here, and
here is why" than find four features that are each 70% finished.

If 24 hours genuinely does not work for you — a family thing, a deadline at your current
job, a visa appointment — reply to the email and ask for more time **before** the clock runs
out. We have never said no to somebody who asked in advance. We do notice when somebody
goes silent and submits late.

If you run out of time, **submit what you have** with a short note in your README saying
what you would have done next and why you chose that order. A half-finished exercise with an
honest, well-reasoned README beats a rushed complete one, and it is a much better
conversation to have in the interview.

---

## Prefer it as one document?

**[`Hiring_Handbook.pdf`](Hiring_Handbook.pdf)** — 19 pages
covering all of the below: the rubric, the code-quality bar, the security baseline, the AI
policy, exactly how to submit, and what the interview hour looks like. Print it, read it on
a train, forward it to the friend who asks what a good take-home looks like.

The folders below are still the authoritative version — they are the ones we keep updated.

## Start here

Read these in order. It takes about fifteen minutes and it will save you hours.

1. [`docs/00-about-us-and-the-project.md`](docs/00-about-us-and-the-project.md) — who we are and what the real work looks like
2. [`docs/01-how-we-evaluate.md`](docs/01-how-we-evaluate.md) — the scorecard we actually use
3. [`docs/02-git-history-and-commits.md`](docs/02-git-history-and-commits.md) — **your commit history is graded**
4. [`docs/03-documentation-and-comments.md`](docs/03-documentation-and-comments.md) — what we mean by "documented"
5. [`docs/04-security-baseline.md`](docs/04-security-baseline.md) — the non-negotiable list
6. [`docs/05-docker-and-deployment.md`](docs/05-docker-and-deployment.md) — `docker compose up` must work
7. [`docs/06-video-walkthrough.md`](docs/06-video-walkthrough.md) — the 2–3 minute video
8. [`docs/07-ai-coding-agents.md`](docs/07-ai-coding-agents.md) — **you may use AI. Read this before you do.**
9. [`docs/08-node-and-tooling.md`](docs/08-node-and-tooling.md) — versions, package managers, what we can run
10. [`docs/09-resources.md`](docs/09-resources.md) — links worth having open
11. [`docs/10-faq.md`](docs/10-faq.md) — read this before emailing us a question
12. [`docs/11-interview-process.md`](docs/11-interview-process.md) — what happens after you submit

Then open your role folder and follow its `README.md`.

---

## How to submit

Full detail is in [`SUBMISSION.md`](SUBMISSION.md). The short version:

1. **Fork this repository** (or, if you cannot fork it, create a fresh repo from it — both
   are fine, just tell us which).
2. Do your work in your fork, committing as you go.
3. Push it, and make it **public** — or private with `@sandesPathak` invited as a
   collaborator.
4. Record a **2–3 minute** video walkthrough and get a shareable link.
5. Export a zip of your repository named exactly `FirstName_LastName.zip`.
6. Email the zip, the GitHub link and the video link to
   **025pathaksandesh@gmail.com** with the subject line
   `Full-Stack Challenge — FirstName LastName` or `QA Challenge — FirstName LastName`.

Both the zip **and** the GitHub link are required. The zip is what we archive; the GitHub
link is what we read your history in.

---

## What we are not testing

To save you from optimising for the wrong thing:

- **We are not testing pixel-perfect design.** Clean and legible is enough. There is no
  Figma file and there will not be one.
- **We are not testing whether you can integrate a real payment processor.** The client's
  payments already work in production and are out of scope. Everything here uses a fake
  payment provider that we describe for you.
- **We are not testing breadth of buzzwords.** A boring, well-tested Express + Postgres
  service scores higher than a half-working microservice mesh with Kafka in it.
- **We are not testing whether you used AI.** We assume you did. We test whether you
  understand what it produced. See `docs/07-ai-coding-agents.md`.

## What we are testing

- Can you take a written specification and ship something that runs on a stranger's machine?
- Do you make sensible engineering trade-offs when the spec is ambiguous, and do you say so?
- Do you think about security, data integrity and concurrency without being told to twice?
- Can you explain your own work out loud in under three minutes?

---

## Questions

Open an issue on your own fork and tag it `question`, or email
**025pathaksandesh@gmail.com** with `[Challenge Question]` in the subject line. We answer
within one working day, and asking a good clarifying question is a point in your favour,
not against you.

Good luck. We hope you enjoy it more than you expect to.
