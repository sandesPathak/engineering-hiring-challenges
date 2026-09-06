# What happens after you submit

## The whole process, start to finish

| Stage | What it is | How long | When |
|---|---|---|---|
| 1. Application | CV / GitHub / a paragraph about you | — | done |
| 2. **This challenge** | 5–8 hours of work, 24-hour window | 1 day | you are here |
| 3. **Review** | Two of us read it independently against the published rubric, then compare | 3 working days | we come back to you either way |
| 4. **The round** | One ~60-minute call: code walkthrough, then behavioural | 1 hour | scheduled in your timezone |
| 5. **Decision** | Yes, or a specific no | 2 working days | — |
| 6. Offer | Rate, start date, and the first two weeks laid out | — | — |

**There is no separate algorithm round.** No whiteboard, no LeetCode, no take-two. Your
submission is the technical assessment, and the round is a conversation about it. We think
inventing a second, artificial test after you have already shown us real work is disrespectful
of your time.

---

## The round — roughly 60 minutes

One call. Two people from our side: the technical lead, and one engineer or QA engineer who
will actually work beside you. Camera on if you can, but say if you would rather not.

### 0:00–0:05 — Hello

Who we are, what the client work looks like right now, how the call will run. Nothing is
being assessed. If you are nervous, this is the part where you stop being nervous.

### 0:05–0:35 — Code walkthrough (about 30 minutes)

**You share your screen and open your own submission.** This is the bulk of the technical
assessment and it is entirely about work you have already done.

How it goes:

1. **You drive for the first five minutes.** Show us the shape of what you built and the
   one part you are proudest of. We interrupt with questions.
2. **Then we drive.** We open files — usually two or three we flagged during the review —
   and ask about specific lines.
3. **Then one small live change.** Fifteen or twenty minutes at the end, in your own
   codebase, on your own machine, in your own editor, with your usual tools **including
   your AI agent if that is how you work**.

The kind of things we ask:

- "Walk me through what happens between the donor clicking Donate and the row landing in the
  database."
- "Two people click the same unit at the same millisecond. Take me through your code and
  show me why only one of them gets it."
- "Why integer cents rather than a decimal column?"
- "This endpoint checks the session. What stops me reading somebody else's donation?"
- "What would break first if this went from 40 donations a day to 4,000?"
- "You skipped X. Talk me through that decision."
- "Here is a bug we found in your submission. No trap — what would you do about it?"

The live change is small and realistic. Something like: *add a minimum donation amount and
a test for it*, or — for QA — *this bug was fixed, write the regression test that would have
caught it*. We are not watching whether you type fast. We are watching how you orient in
your own code, whether you run the tests, whether you read the error message, and whether
you talk while you think.

**On AI in this segment:** use it exactly as you normally would. We will ask you to explain
what it produced before you accept it, which is the same standard we hold ourselves to. Using
an agent well is a positive signal. Accepting output you cannot explain is the negative one.

**How to do well here:** know your own code. Re-read your diff the morning of the call.
Have the project running before we join so we are not watching `npm install`. Say "I don't
know" when you do not know, then say how you would find out — that answer scores better than
a confident wrong one, every single time.

### 0:35–0:55 — Behavioural (about 20 minutes)

Not a personality quiz. We work asynchronously for a client with no technical staff and real
money on the line, and these questions are about the specific situations that come up here.

We ask three or four of these, and we ask follow-ups, because the follow-up is where the
real answer is:

- **Shipping something wrong.** "Tell me about a bug you put into production. What happened,
  how did you find out, what did you do in the first hour, and what did you change afterwards
  so it could not happen again?" *We are listening for ownership without self-flagellation,
  and for a systemic fix rather than "I was more careful after that".*
- **Disagreeing.** "Tell me about a time you thought a requirement was wrong. What did you
  do?" *We want somebody who pushes back in writing, early, with a reason — and who then
  commits fully once the decision is made, even when it goes against them.*
- **Being blocked.** "You are three hours into a task, you are stuck, and everyone who could
  help is asleep. What do you actually do?" *There is no single right answer. We are
  listening for how long you thrash before you write the question down.*
- **Handling the deadline.** "The scope will not fit the date. Walk me through the
  conversation you have and who you have it with."
- **Working across a gap.** "You are the only person awake. A client emails saying the
  donation page is showing the wrong total on a fundraising day. Go."
- **Reviewing someone else.** "How do you tell a colleague their pull request has a security
  problem in it?" *And the reverse — how you take that feedback.*
- **QA specifically:** "A developer says your bug is not a bug, it is expected behaviour. How
  do you resolve it?" and "The release is in four hours and you have found something serious.
  What do you do?"

There is no trick. The best answers are specific, short, and include the part that did not
go well. The weakest answers are hypothetical — "I would always communicate proactively" —
because we cannot tell whether you have ever actually done it.

### 0:55–1:00 — Your questions

Please have some. Ask us about the client, the on-call reality, how decisions get made, what
the last thing we got wrong was. We will answer honestly, including about the parts of this
job that are annoying, and there are some.

---

## How the round is scored

Weighted alongside the challenge score, not instead of it.

| | Weight | What a strong answer looks like |
|---|---|---|
| **Ownership of your code** | 30% | Explains any line, including AI-assisted ones. Knows where the weak parts are. |
| **Technical reasoning** | 25% | Reasons about trade-offs out loud. Considers failure and load. Says "I don't know" cleanly. |
| **The live change** | 15% | Orients quickly, runs the tests, reads the error rather than guessing. |
| **Communication** | 15% | Compresses well, checks we followed, adjusts when we look lost. |
| **Collaboration & judgement** | 15% | Specific stories. Disagrees well. Owns mistakes. Escalates at the right moment. |

---

## How to prepare

Half an hour is plenty.

- Re-read your own submission, including your commit history
- Have it running before the call starts
- Prepare a 90-second version of "here is what I built and here is the interesting part"
- Have three concrete stories ready — a failure, a disagreement, and a thing you shipped
  that you are proud of
- Write down two questions for us

Do not prepare answers to the behavioural questions word for word. We can hear it, and it
makes you sound less impressive than you are.

---

## Accommodations

If anything about this format is a barrier — you need the questions in advance, you need
more time in the live segment, you need captions, screen-sharing is difficult on your setup,
you would rather answer the behavioural part in writing — **say so when we schedule**. We
will adjust it, it is not held against you, and you do not have to explain why.

---

## Good luck

Genuinely. We know what a take-home costs, especially with a full-time job and a life
attached. We have tried to make this one worth the hours: the rubric is published, the spec
is the real work, and the interview is a conversation about what you built rather than a
puzzle we invented.

Do the must-haves properly. Write down the decisions you made and the ones you deliberately
skipped. Record the video in one take. Then close the laptop — the honest submission you
finished is worth more than the perfect one you did not.

We are looking forward to reading it.
