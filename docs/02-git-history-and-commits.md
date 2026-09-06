# Git history and commits

Your commit history is graded. This surprises people, so here is why.

The code you submit tells us what you can produce with a day and no reviewer. The commit
history tells us **how you got there** — whether you work in coherent steps, whether you
keep the tree working, whether you would be pleasant to review. On this team every change
goes through a pull request that a colleague has to read at 7am in another timezone. History
is a communication artefact, not bookkeeping.

---

## What we want to see

**Commits that are one change each.** A commit adds a thing, or fixes a thing, or refactors
a thing. Not all three. If your message needs the word "and", it is probably two commits.

**Messages a working engineer would write.** Short, imperative, under about sixty
characters, saying what the change does.

```
Good:
  Add the donation intake endpoint
  Store amounts as integer cents
  Fix the progress bar counting refunded donations
  Move the seed script out of the server entrypoint
  Add a concurrency test for unit holds

Bad:
  final
  wip
  update
  Updated files
  fixed stuff
  feat: implement comprehensive donation management functionality
  Changes as per requirement 3.2
```

**A body only when it earns one.** Most commits need one line. Use a body to explain *why*,
when a future reader would otherwise have to reconstruct your reasoning:

```
Use a row lock rather than a unique constraint for holds

A unique constraint would reject the second request with a database
error we would then have to translate. The lock lets us return a
proper 409 with the reason, and the contention window is a few ms.
```

**A tree that works at each commit.** Not religiously — nobody is going to `git bisect`
your take-home — but a commit that leaves the project unable to start is a smell.

**Roughly 10 to 30 commits** for an exercise this size. There is no target. Thirty tiny
honest commits is fine. Six well-shaped ones is fine. One is not, and eighty `wip` is not.

---

## Conventional Commits

If you already use [Conventional Commits](https://www.conventionalcommits.org/)
(`feat:`, `fix:`, `chore:`), keep using them — we will not mark you down, and it is a
perfectly good convention when a changelog is generated from it.

If you do not use them, **do not adopt them for this exercise**. A plain imperative subject
line is just as good and we would rather see your natural habits. What we mark down is a
history where the prefix is the only thing carrying meaning: `feat: updates`, `fix: fixes`.

Pick one style and stay in it. Mixed conventions in one history reads as carelessness.

---

## Do not fake it

Please do not build the whole thing and then reconstruct a plausible history with
`git commit --date` or by staging fragments at the end. We have read a lot of these and it
is visible: timestamps in an unnaturally regular rhythm, no fix-up commits, no commit that
undoes an earlier decision, files appearing complete rather than growing.

Real history has a commit that reverses something. That is a *good* sign. It means you
changed your mind, which is what engineering is.

---

## Branches and pull requests

Optional, and a small bonus if you do it.

Work on a branch, open a pull request into your own `main`, and write the description you
would write for a colleague: what changed, why, what you want them to look at, what you are
unsure about. Then merge it yourself. That description is the single best writing sample
you can give us, because it is the thing you would be doing every week.

If you prefer to commit straight to `main`, that is fine too. Nobody has ever been rejected
for not opening a PR against themselves.

---

## Secrets in history

Removing a secret in a later commit does not remove it. It is still in the history, and the
history is what we read.

Before you submit:

```bash
git log -p | grep -nEi '(api[_-]?key|secret|password|token|BEGIN [A-Z ]*PRIVATE KEY)' | head -40
```

If that finds something real, do not just delete the line — rewrite the history
(`git filter-repo`, or start a clean repo and re-commit), and **rotate the credential**,
because it has been on your disk and possibly on GitHub.

A live credential in a submission is an automatic conversation about security judgement,
which is not the conversation you want to be having.

---

## A worked example

This is roughly what a healthy full-stack submission's `git log --oneline` looks like:

```
b3f2a1c  Add the README, run instructions and decision notes
9d8e7f6  Add a docker compose stack with the database and both apps
4c5b6a7  Handle the empty-state on the campaign page
1a2b3c4  Add the CSV export for the admin donation list
8f9e0d1  Reject donations under the one-dollar minimum
7e6d5c4  Add the admin donation list with search and filters
5b4a3c2  Escape the dedication message before rendering it
2c1d0e9  Add the public donation form and success state
6a5b4c3  Add a concurrency test proving two holds cannot overlap
3d2c1b0  Add the donation intake endpoint
0e9f8a7  Store money as integer cents throughout
9c8b7a6  Add the campaign and donation schema with migrations
4a3b2c1  Set up eslint, prettier and vitest
7b6a5c4  Set up the monorepo workspaces and shared package
1c0b9a8  Import the challenge repository as provided
```

Fourteen commits. Tooling first. Schema before endpoints. A test appearing next to the
feature it tests. One commit that is purely a security fix. Docs last. That is a normal
week, compressed.
