# Engineering Hiring Challenges

Welcome, and thank you for the time you are about to spend on this.

This repository holds the take-home exercises for two open roles:

| Role | Folder | What you build |
|---|---|---|
| **Full-Stack Engineer** | [`roles/full-stack-engineer/`](roles/full-stack-engineer/) | A donation tracking page — backend, frontend, database, Docker — in a monorepo |
| **QA Engineer** | [`roles/qa-engineer/`](roles/qa-engineer/) | Find the defects we planted in a running hall-booking system, then automate the regression suite |

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

## What you need installed

Five things, and four of them you probably already have. Every link below is the official
download page.

| | What | Why | Link |
|---|---|---|---|
| 1 | **Docker Desktop** (or Docker Engine + Compose v2 on Linux) | `docker compose up --build` has to work. This is 20 of the 100 points. | [docs.docker.com/get-started/get-docker](https://docs.docker.com/get-started/get-docker/) · [Compose on Linux](https://docs.docker.com/compose/install/linux/) |
| 2 | **Node.js 24 LTS** | Both exercises run on Node 24. | [nodejs.org/en/download](https://nodejs.org/en/download) · via [nvm](https://github.com/nvm-sh/nvm) — `nvm install 24 && nvm use 24` |
| 3 | **Git** | Your commit history is graded. | [git-scm.com/downloads](https://git-scm.com/downloads) |
| 4 | **A GitHub account** | You submit a repository link. | [github.com/signup](https://github.com/signup) |
| 5 | **A screen recorder** | 2–3 minute walkthrough, with your voice. | [Loom](https://www.loom.com/) · [OBS](https://obsproject.com/) · macOS `Cmd-Shift-5` · Windows Game Bar `Win-G` |

Check you are ready — both commands must print a version:

```bash
node -v            # v24.x
docker compose version   # v2.x
```

You do **not** need Postgres, a database GUI, or any cloud account installed on your
machine. If you use Postgres it runs in a container, from your compose file — see
[`docs/05-docker-and-deployment.md`](docs/05-docker-and-deployment.md).

---

## Prefer it as one document?

**[`Hiring_Handbook.pdf`](Hiring_Handbook.pdf)** — one document covering all of the
below: the rubric, the code-quality bar, the security baseline, the AI policy, exactly how
to submit, and what the interview hour looks like. Print it, or read it on a train.

The folders below are still the authoritative version — they are the ones we keep updated.

## Start here — you do not have to read everything

There are a lot of files in this repository. **Three of them are required reading**, and
they take about fifteen minutes. Everything else is reference you open when a specific
question comes up, and each one is linked from the place where it matters.

### Required — read these three, in this order

| | | |
|---|---|---|
| 1 | [`docs/00-about-us-and-the-project.md`](docs/00-about-us-and-the-project.md) | Who we are and what the real work looks like. 5 min. |
| 2 | **Your role's `README.md`** — [full-stack](roles/full-stack-engineer/) or [QA](roles/qa-engineer/) | The brief. Start here for what you actually build. |
| 3 | **Your role's `REQUIREMENTS.md`** | The specification. Must / should / stretch. |

Then just start. Your role folder tells you when to open anything else.

### Reference — open when the question comes up

| File | Open it when |
|---|---|
| Your role's `SETUP.md` | You want a suggested path through the day |
| Your role's `RUBRIC.md` | You want the exact points breakdown |
| Your role's `CHECKLIST.md` | **Always — before you submit.** 30 minutes well spent |
| [`SUBMISSION.md`](SUBMISSION.md) | You are ready to send it |
| [`docs/04-security-baseline.md`](docs/04-security-baseline.md) | Before you write auth, validation, or anything touching money |
| [`docs/05-docker-and-deployment.md`](docs/05-docker-and-deployment.md) | Before you write the Dockerfile |
| [`docs/06-video-walkthrough.md`](docs/06-video-walkthrough.md) | Before you record |
| [`docs/07-ai-coding-agents.md`](docs/07-ai-coding-agents.md) | **Before you use an AI agent.** There is a required file and one rule |
| [`docs/01-how-we-evaluate.md`](docs/01-how-we-evaluate.md) · [`02-git-history-and-commits.md`](docs/02-git-history-and-commits.md) · [`03-documentation-and-comments.md`](docs/03-documentation-and-comments.md) | You want to know how we read a submission |
| [`docs/08-node-and-tooling.md`](docs/08-node-and-tooling.md) | You are choosing a Node version, package manager or database |
| [`docs/09-resources.md`](docs/09-resources.md) | You are stuck on money, concurrency, security, Unicode or testing |
| [`docs/10-faq.md`](docs/10-faq.md) | Before you email us a question |
| [`docs/11-interview-process.md`](docs/11-interview-process.md) | After you submit |

If you would rather have it all as one document, the PDF above covers the same ground.

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
