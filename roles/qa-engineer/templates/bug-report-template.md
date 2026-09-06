# BUG-00X — <a title a developer can triage without opening this file>

A good title names the thing, the place and the consequence:
`Any signed-in donor can read every other donor's phone number and address via /api/donors/:id`
not `Security issue in donors endpoint`.

| | |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Priority** | P1 / P2 / P3 |
| **Area** | Donation flow / Staff console / API / Units grid / Auth / Data / Accessibility |
| **Found** | Exploratory / API testing / Concurrency / Automated / Code reading |
| **Spec reference** | `SPEC.md` §X.Y |
| **Status** | Open |

> **Severity** is how bad it is if it happens. **Priority** is how soon somebody should
> stop what they are doing. They are different, and a report that treats them as one thing
> tells us less. A cosmetic defect on the donation button during a fundraising drive can be
> Low severity and P1.

## Summary

One or two sentences. What is wrong, where, and why it matters. A lead should be able to
read only this and know whether to open the rest.

## Environment

- Build: Aangan Giving 1.4.2 (`GET /api/health`)
- Running via: `npm start` / `docker compose up`, on port 4000
- Data state: fresh `npm run reset`
- `GUEST_COOLDOWN_SECONDS`: 120 (default) / 0
- Browser: Chrome 141 on macOS 15 — or "API only, curl"
- Account used: `donor@himalayacc.example`

## Steps to reproduce

Numbered, exact, from a known state. Somebody who has never seen the app follows these and
sees it happen. Name the account. Name the record. Include the request.

1. `cd app && npm run reset && npm start`
2. Sign in as `donor@himalayacc.example` / `donor12345`
3. Copy the bearer token from the login response
4. Find a donation belonging to `other@himalayacc.example` — for example …
5. Request it as the first donor:

```bash
curl -s localhost:4000/api/donations/<other-donors-donation-id> \
  -H "authorization: Bearer <donor-token>"
```

## Expected result

What `SPEC.md` says should happen, quoted, with the section number.

> `SPEC.md` §2: "A donor must never be able to read another donor's records or personal
> details." §9.3: "an attempt on another donor's record returns **404**."

So: `404 {"error":"Donation not found"}`.

## Actual result

What happened, with evidence. Paste the response. Paste the number. Attach the screenshot.

```json
{
  "id": "…",
  "amount": 21,
  "donor_name": "Other Donor",
  "donor_email": "other@himalayacc.example",
  …
}
```

`200 OK`, with the other donor's full record.

## Impact

**The part most reports get wrong.** Not the mechanism — the consequence, in words the
client would use.

> Any donor with an account — which is anyone who has ever given and registered — can read
> every other donor's name, email address, phone number, home address and complete giving
> history by changing an identifier in a URL. That includes the several hundred donors who
> chose "anonymous", who have been told their giving is private. For an organisation whose
> members include people who are careful about who knows where they live, this is the most
> serious kind of failure, and it would be a reportable data breach in several of the
> jurisdictions its donors live in.

## Evidence

- `evidence/BUG-00X-response.json`
- `evidence/BUG-00X.png`
- Playwright trace: `test-results/…/trace.zip`

## Regression test

Where the test that covers this lives, and confirmation that it currently fails.

- `qa/tests/api/authorisation.spec.ts` → *"a donor cannot read another donor's donation"*
- Fails against 1.4.2. Passes once the ownership check is applied.

## Notes and suggested area

Optional. Where you think it lives, or what you would look at. Do not guess confidently
about code you have not read — "the route appears to look the record up by id with no
ownership condition" is honest; "the developer forgot the middleware" is not.

## Open question

If you are not certain this is a defect rather than an undocumented decision, say so here
and say why you lean the way you do. This is a legitimate outcome and we score it well.
