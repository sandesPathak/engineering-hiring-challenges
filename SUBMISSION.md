# How to submit

Read this once now, and again before you send anything. A submission that does not follow
this is not disqualified, but it does make us hunt for things, and hunting costs you.

---

## 1. Get your own copy of this repository

**Preferred: fork it.**

Click *Fork* on GitHub. That gives us a fork graph, which tells us exactly which commits
are yours and which came from us. Nothing else does that as clearly.

**If you cannot fork** (some corporate GitHub accounts block forking public repos, and some
people would rather not have a public fork tied to a job search), do this instead:

```bash
git clone --depth 1 https://github.com/sandesPathak/engineering-hiring-challenges.git firstname_lastname_challenge
cd firstname_lastname_challenge
rm -rf .git
git init -b main
git add .
git commit -m "Import the challenge repository as provided"
```

That first commit is your baseline. Everything after it is your work, and we can read the
diff against our repo ourselves. **Say in your README which route you took.**

---

## 2. Work in it, committing as you go

Your commit history is part of the grade. See
[`docs/02-git-history-and-commits.md`](docs/02-git-history-and-commits.md).

One commit called `final` will cost you real points. So will 60 commits called `wip`.

Work on `main`, or work on a branch and open a pull request into your own `main` — a PR
with a written description is a small bonus, because it shows us how you hand work to a
reviewer.

---

## 3. Write your own README at the top of your repo

Replace or add to the root `README.md` in **your** copy. Ours describes the challenge;
yours must describe **your submission**. See
[`docs/03-documentation-and-comments.md`](docs/03-documentation-and-comments.md) for what
it has to contain. At minimum a stranger must be able to run your project from it without
asking you anything.

Also add an `AI-USAGE.md` — see [`docs/07-ai-coding-agents.md`](docs/07-ai-coding-agents.md).

---

## 4. Make it reachable

Either:

- **Public repository** — simplest, and what most people do; or
- **Private repository** with **`@sandesPathak`** invited as a collaborator.

If it is private and you forget to invite us, we cannot read it, and we will email you once.
If that email goes unanswered for 24 hours we grade the zip alone, which means we cannot see
your commit history at all.

---

## 5. Record the video

2–3 minutes. Not 8. Full brief in
[`docs/06-video-walkthrough.md`](docs/06-video-walkthrough.md).

Host it anywhere we can open without an account: **Loom**, **YouTube (unlisted)**,
**Google Drive (anyone with the link)**, **Vimeo**. Test the link in a private browser
window before you send it. A link we cannot open is the single most common reason a good
submission stalls.

Put the link in your README **and** in your email.

---

## 6. Make the zip

Name it exactly:

```
FirstName_LastName.zip
```

For example: `Anisha_Gurung.zip`, `Miguel_Santos.zip`. Capital first letters, one
underscore, no spaces, no dates, no `v2`, no `final_final`.

Build it like this, from the folder *above* your project:

```bash
# macOS / Linux
zip -r Anisha_Gurung.zip my-project-folder \
  -x "*/node_modules/*" "*/.next/*" "*/dist/*" "*/build/*" \
     "*/coverage/*" "*/.env" "*/playwright-report/*" "*/test-results/*"
```

```powershell
# Windows PowerShell — delete node_modules and dist first, then:
Compress-Archive -Path .\my-project-folder -DestinationPath .\Anisha_Gurung.zip
```

**Include the `.git` folder.** It is small once `node_modules` is out, and it is how we read
your history if your repo link breaks. **Exclude `node_modules`** — a 400 MB zip may bounce
off our mailbox.

**Do not include real secrets.** Ship `.env.example` with placeholder values, never `.env`.
See [`docs/04-security-baseline.md`](docs/04-security-baseline.md).

Sanity-check the zip before you send it:

```bash
unzip -l Anisha_Gurung.zip | head -40      # is the structure right?
du -h Anisha_Gurung.zip                    # under ~50 MB, ideally under 10
```

If it is over 50 MB, put it on Google Drive and send the link instead — do not silently
delete half your project to make it fit.

---

## 7. Send the email

**To:** 025pathaksandesh@gmail.com

**Subject (copy one of these exactly):**

```
Full-Stack Challenge — FirstName LastName
QA Challenge — FirstName LastName
```

**Body — this template is fine, we are not grading your prose:**

```
Hi,

Here is my submission for the <Full-Stack / QA> Engineer challenge.

GitHub:   https://github.com/<you>/<repo>
Video:    <link>
Zip:      attached as FirstName_LastName.zip

Roughly <N> hours of work. Node <version>, <package manager>, <database>.

Notes:
- <anything you want us to know: what you skipped, what you would do next,
  where you disagreed with the spec, anything broken>

Thanks,
<Name>
<phone, timezone>
```

Attach the zip. Include both links even though the zip contains everything — we grade the
GitHub copy first.

---

## Submission checklist

Tick every line before you hit send.

- [ ] Repo is forked (or imported with a clean baseline commit, and my README says which)
- [ ] More than one commit, with messages a human would write
- [ ] My own `README.md` at the repo root explains how to run it
- [ ] `AI-USAGE.md` exists and is honest
- [ ] `.env.example` is committed; no real `.env`, key, token or password anywhere in the repo *or its history*
- [ ] `docker compose up` works from a clean clone — I tested it after deleting `node_modules`
- [ ] Tests run and I have said in the README which ones pass and which do not
- [ ] The role-specific checklist in my role folder is complete
- [ ] Video is 2–3 minutes and the link opens in a private browser window
- [ ] Zip is named `FirstName_LastName.zip`, excludes `node_modules`, includes `.git`
- [ ] Repo is public, or private with `@sandesPathak` invited
- [ ] Email subject line matches the template exactly

---

## After you submit

We reply within **three working days**, either way. If you have not heard from us by then,
email again — it means something went to spam, not that you were rejected quietly.

If we move forward, the next step is a **single ~60-minute round**, split into a code
walkthrough of your own submission and a behavioural conversation. There is no separate
algorithm round and no whiteboard. Full detail — including the questions we ask — is in
[`docs/11-interview-process.md`](docs/11-interview-process.md).

If we do not move forward, we will tell you the specific reason. You are welcome to reapply
after three months.
