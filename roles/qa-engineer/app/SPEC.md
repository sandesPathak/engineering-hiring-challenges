# Aangan Giving — functional specification

**Version 1.4.2 · Himalaya Cultural Centre · last updated by the product owner**

This is the specification the reference build was written against. It is the **source of
truth** for this exercise: if the application does something this document does not
describe, or contradicts, that is a defect. If the application does something this document
describes and you find it surprising, that is not a defect — it is a design decision, and
§7 lists the ones people most often report by mistake.

Where this document is silent, say so in your report. "The specification does not define
what should happen when X" is a legitimate and valuable finding, and there are places where
it genuinely is silent.

---

## 1. Purpose

A public page where donors give to a named campaign, and a staff console where the office
sees what came in. Payments are handled by an external provider; this application records
the outcome.

## 2. Roles

| Role | Can |
|---|---|
| **Visitor** (not signed in) | View a campaign, view the public donation list, donate as a guest, hold courtyard units |
| **Donor** (signed in) | Everything a visitor can, plus view **their own** giving history and **their own** donation records |
| **Admin** (staff) | View, search, filter and export **all** donations; refund a donation; view the audit log |

A donor must never be able to read another donor's records or personal details. Staff
routes are reachable only by an admin.

## 3. Campaigns

Three campaigns are seeded: `aangan-courtyard` (active), `annadaan-kitchen` (active) and
`roof-repair-2025` (closed).

`GET /api/campaigns/:slug` returns the title, story, goal, amount raised, donor count and
percentage of goal.

- **Amount raised counts completed donations only.** A refunded donation and a failed
  donation both count for nothing.
- **Donor count** is the number of distinct donors with at least one completed donation.
- **Percentage** is `raised ÷ goal × 100`, shown to one decimal place.
- Money is displayed to the cent, with a thousands separator: `$43,058.00`.

## 4. The public donation list

`GET /api/campaigns/:slug/donations` returns the most recent **completed** donations.

**Privacy modes.** Every donation carries one of three, chosen by the donor:

| Mode | Public display | What may leave the server |
|---|---|---|
| `public` | The donor's full name | Name |
| `anonymous` | The word "Anonymous" | **Nothing identifying the donor.** Not their name, not their email, not their donor id — in any field of the response |
| `family` | "The `<surname>` family" | The surname only |

The dedication line and the dedication message are shown for all three modes.

**Refunded and failed donations never appear.**

## 5. Making a donation

`POST /api/donations`. No account required — guest checkout is the common case.

| Field | Rule |
|---|---|
| `amount` | A number of US dollars. **Minimum $1.00, maximum $25,000.00**, both inclusive, both enforced by the server. Anything outside that range, non-numeric, or missing is rejected with 422. |
| `donor.name`, `donor.email` | Required. A valid email address. |
| `privacyMode` | One of `public`, `anonymous`, `family`. Anything else is rejected with 422. |
| `dedication.type` | Optional, one of `in_honor_of`, `in_memory_of`. |
| `dedication.name` | Optional. |
| `dedication.message` | Optional, **at most 280 characters**. |
| `isRecurring` | Optional boolean. Records intent only; nothing is charged on a schedule. |
| `paymentToken` | `tok_ok` succeeds, `tok_decline` is declined. |

On success the response is `201` with a **unique receipt number** in the form
`HCC-2026-000123`. Two donations must never share a receipt number.

A declined payment returns `402` and **no donation is recorded**.

**A donation is recorded once per payment.** A donor who double-clicks, or whose phone
retries the request, must end up with one donation, not two.

## 6. Courtyard units

The courtyard is a grid of engraved stones, `A01` to `H12`, at **$1,008** each.

- A visitor may select and hold **at most 5** units at a time
- A hold lasts **10 minutes**, after which the unit becomes available again without anyone
  having to do anything
- **A unit may be held by exactly one person at a time.** If two people request the same
  unit, one succeeds and the other receives `409` naming the units they lost
- A unit that is already `dedicated` can never be held

## 7. Intentional behaviour — please do not report these as defects

These surprise people. They are all deliberate, and the reasoning is recorded here so that
a tester can tell the difference between a decision and a mistake.

1. **Guest donation cooldown.** A guest may make only one donation every **120 seconds**
   from the same IP address; a second attempt returns `429`. This is anti-abuse: donation
   forms are used by criminals to test stolen card numbers. It is configurable through
   `GUEST_COOLDOWN_SECONDS`, and you may set it to `0` while testing — but the shipped
   default is 120 and that is the behaviour under test.
2. **Preset amounts end in 1** — $21, $51, $101, $501, $1,001. This is not a typo. In this
   community an auspicious gift ends in one.
3. **A closed campaign is still visible.** `roof-repair-2025` can be read and appears in
   the campaign list, but rejects donations with `422`. Donors want to see what their giving
   finished.
4. **A campaign may exceed 100% of its goal.** The number keeps going up; the progress bar
   stops at 100%.
5. **There is no email.** No receipt email, no confirmation email. Out of scope for 1.4.
6. **Refunds are all-or-nothing.** Partial refunds are not supported in 1.4.
7. **The staff console is not translated.** Only the public page was ever in scope for
   Nepali, and even that is not yet built.

## 8. Staff console

`GET /api/admin/donations` — every donation, newest first.

- **Search** `?q=` matches the donor's name or email address, case-insensitively. It must
  work for names written in **Devanagari as well as Latin script**; a substantial part of
  this membership is registered under a Nepali name.
- **Filters** `?status=`, `?from=`, `?to=`
- **Pagination** `?page=` (1-based) and `?pageSize=` (default 25). Across consecutive pages
  every donation appears exactly once. `pageSize` is capped at 100.
- **Sorting** `?sort=` and `?dir=`, over a fixed set of columns.

`POST /api/admin/donations/:id/refund` — sets the donation to `refunded`, records who did it
and why in the audit log, and **removes it from every total in the same operation**.
Refunding a donation that is already refunded returns `409`.

`GET /api/admin/stats` — the amount raised **today**, where today means today in the
organisation's own timezone (**US Central**), plus all-time totals by status.

`GET /api/admin/donations.csv` — the donation list as CSV. It must open correctly in a
spreadsheet, including for donors whose names contain commas, quotation marks or Devanagari.

## 9. Security requirements

1. Passwords are stored using a **modern password hashing function with a salt**
2. Session tokens are **unguessable**, carry no privileges a client can edit, and **expire**
3. A donor can read only their own records; an attempt on another donor's record returns
   **404**
4. Staff routes are reachable only by an admin
5. All user input is validated against the rules in §5 before it reaches the database
6. **Donor-supplied text is escaped wherever it is displayed** — the public page, the staff
   table, and the CSV export. A dedication message containing HTML must be shown as text
7. Error responses carry a message for the user and **no internal detail** — no stack
   traces, no SQL, no file paths
8. The login endpoint does not reveal whether an email address is registered, and is rate
   limited
9. All database access is parameterised

## 10. Accessibility

Target **WCAG 2.2 level AA**. A significant part of this membership is over 65 and a
meaningful number use a screen reader or a keyboard only.

- Every form control has a programmatically associated label
- The whole donation flow is completable with a keyboard alone
- Focus is always visible, and never trapped anywhere it cannot be escaped
- Any dialog can be dismissed with `Escape` and returns focus where it came from
- The progress bar exposes its value to assistive technology
- Text contrast is at least 4.5:1

## 11. Browser and device support

Current Chrome, Safari, Firefox and Edge. Phones from 375px wide upwards. The public page
must be usable on a phone; the staff console is desktop-first but must not be broken on a
tablet.

## 12. Known limitations in 1.4.2 (already accepted by the product owner)

- No email of any kind
- No partial refunds
- No Nepali translation yet
- Recurring donations record intent only; nothing charges on a schedule
- The units grid has no checkout step — holding a unit is as far as 1.4 goes
