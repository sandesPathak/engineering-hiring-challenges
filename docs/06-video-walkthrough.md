# The video walkthrough

**2 to 3 minutes. Not 8. Not 45 seconds.**

## Why we ask for it

Everyone on this team explains their work to people who are not in the room — a client
board, a colleague waking up in another timezone, a reviewer on a pull request. A short
video tells us three things a repository cannot:

1. Whether the thing actually runs, demonstrated by you
2. Whether **you** understand the code, or whether it arrived from somewhere you did not
   inspect
3. Whether you can compress a complicated thing into three minutes, which is the single
   most useful skill in a distributed team

It is not a presentation, and we are not grading your accent, your camera, your background
or your English. We are grading whether we understood you.

---

## What to cover

Roughly 30 seconds each. Do not read a script — talk.

### 0:00–0:20 — Who you are and what you built
"I'm Anisha. This is the donation tracking page. Next.js front end, Fastify API, Postgres,
all in one compose file."

### 0:20–1:10 — Show it working
Screen-share the running app. Make a donation. Show it appear in the list and move the
progress bar. Log in as admin, filter the list, refund one, show the total correct itself.
**Demonstrate, do not describe.** This is the most valuable part of the video.

### 1:10–2:00 — Show the part you are proudest of, in the code
One thing. Open the file and talk through it. The concurrency handling, the money type, the
authorisation layer, the test that proves the race cannot happen. Say why you did it that
way and what the alternative was.

This is the segment that separates submissions. Pick something with a decision in it.

### 2:00–2:40 — Trade-offs and what you did not do
"I skipped the bilingual toggle because the must-haves came first. I used optimistic
concurrency rather than a row lock — under this load either works, and under heavier write
contention I'd switch. The CSV export does not escape commas in donor names; I found it too
late and it is in Known Issues."

Honesty here is scored **positively**. Every submission has gaps. We are finding out whether
you know where yours are.

### 2:40–3:00 — What you would do next
The first three things, in order, if you had another week.

---

## For QA candidates

Same length, different content:

- **0:00–0:20** — who you are, how you approached the app
- **0:20–1:20** — walk through your two or three most serious findings. Reproduce one live
  on screen. Say the impact in the client's language, not only the mechanism.
- **1:20–2:20** — run your automated suite. Show it going green. Show one test failing
  against the unfixed bug, because a regression test that has never failed proves nothing.
- **2:20–3:00** — your coverage strategy: what you automated and what you deliberately left
  manual, what you would automate next, and what you would want from the developers to make
  the app more testable.

---

## Practical points

**Tools.** Loom (free tier, easiest), OBS, QuickTime, Zoom recording yourself, the Windows
Game Bar. Any of them.

**Hosting.** Loom, YouTube unlisted, Google Drive set to "anyone with the link", Vimeo.
Anywhere we can open **without an account and without requesting access**.

**Test the link.** Open it in a private browser window where you are not signed in. A
"Request access" screen is the most common way a good submission stalls, and we will email
you once about it, which costs you a day.

**Camera.** Optional. Screen and voice are what matter. Turn it on if you are comfortable —
it makes the conversation warmer, and we would rather meet you.

**Audio.** The one thing worth caring about. Any headset beats a laptop microphone in a
room with a fan. If your audio is unusable we have to guess, and guessing does not help you.

**One take is fine.** Please do not spend two hours editing. A stumble, a "sorry, let me
find that file", a dog barking — none of that costs you anything. Three polished minutes and
five raw ones score identically if the content is the same.

**Do not read your README aloud.** We have already read it. Show us the running thing and
tell us the reasoning behind it.

**Put the link in your README and in your email.** Both.

---

## A note on nerves

Some people find this the hardest part of the exercise. If that is you: write six bullet
points on a sticky note, hit record, talk for three minutes, and send the first take. It is
genuinely enough. We have hired people whose video had a toddler in it.
