# BUG-00X — <a title a developer can triage without opening this file>

A good title names the thing, the place and the consequence:
`Any signed-in member can read every other member's phone number and address via /api/bookings/:reference`
not `Security issue in bookings endpoint`.

| | |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Priority** | P1 / P2 / P3 |
| **Area** | Booking request / Staff console / Public calendar / API / Auth / Data / Accessibility |
| **Found** | Exploratory / API testing / Concurrency / Automated / Code reading |
| **Spec reference** | `SPEC.md` §X.Y |
| **Status** | Open |

> **Severity** is how bad it is if it happens. **Priority** is how soon somebody should
> stop what they are doing. They are different, and a report that treats them as one thing
> tells us less. A cosmetic defect on the Send request button in the week weddings are
> booked can be Low severity and P1.

## Summary

One or two sentences. What is wrong, where, and why it matters. A lead should be able to
read only this and know whether to open the rest.

## Environment

- Build: Sabhaghar Booking 2.3.1 (`GET /api/health`)
- Running via: `npm start` / `docker compose up`, on port 4000
- Data state: fresh `npm run reset`
- Browser: Chrome 141 on macOS 15 — or "API only, curl"
- Account used: `member@himalayacc.example`

## Steps to reproduce

Numbered, exact, from a known state. Somebody who has never seen the app follows these and
sees it happen. Name the account. Name the record. Include the request.

1. `cd app && npm run reset && npm start`
2. Sign in as `member@himalayacc.example` / `member12345`
3. Copy the bearer token from the login response
4. Pick a booking belonging to somebody else — for example `HCC-BK-4271`
5. Request it as the first member:

```bash
curl -s localhost:4000/api/bookings/HCC-BK-4271 \
  -H "authorization: Bearer <member-token>"
```

## Expected result

What `SPEC.md` says should happen, quoted, with the section number.

> `SPEC.md` §2: "A member must never be able to read another member's booking or personal
> details."

So: `404 {"error":"No such booking"}`.

## Actual result

What happened, with evidence. Paste the response. Paste the number. Attach the screenshot.

```json
{
  "reference": "HCC-BK-4271",
  "purpose": "Board meeting, quarterly",
  "member": {
    "name": "Shrestha, Bijay \"BJ\"",
    "email": "bj.shrestha@example.com",
    "phone": "+1 817 555 0142",
    "address": "1212 Royal Pkwy, Euless, TX 76040"
  }
}
```

`200 OK`, with the other member's full record.

## Impact

**The part most reports get wrong.** Not the mechanism — the consequence, in words the
client would use.

> Any member with an account — which is anyone who has ever booked a room — can read every
> other member's name, email address, phone number and home address, and the purpose of
> events they marked private, by changing a reference in a URL. References are sequential,
> so the whole membership can be walked in a few seconds. That includes the sixteen bookings
> whose owners chose "private" and were told their event would not be identified. For an
> organisation whose members include people who are careful about who knows where they live,
> this is the most serious kind of failure, and it would be a reportable data breach in
> several of the jurisdictions its members live in.

## Evidence

- `evidence/BUG-00X-response.json`
- `evidence/BUG-00X.png`
- Playwright trace: `test-results/…/trace.zip`

## Regression test

Where the test that covers this lives, and confirmation that it currently fails.

- `qa/tests/api/authorisation.spec.ts` → *"a member cannot read another member's booking"*
- Fails against 2.3.1. Passes once the ownership check is applied.

## Notes and suggested area

Optional. Where you think it lives, or what you would look at. Do not guess confidently
about code you have not read — "the route appears to look the record up by id with no
ownership condition" is honest; "the developer forgot the middleware" is not.

## Open question

If you are not certain this is a defect rather than an undocumented decision, say so here
and say why you lean the way you do. This is a legitimate outcome and we score it well.
