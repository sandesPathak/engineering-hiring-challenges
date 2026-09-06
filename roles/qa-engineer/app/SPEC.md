# Sabhaghar Booking — functional specification

**Version 2.3.1 · Himalaya Cultural Centre · last updated by the product owner**

This is the specification the reference build was written against. It is the **source of
truth** for this exercise: if the application does something this document does not
describe, or contradicts, that is a defect. If the application does something this document
*does* describe and you find it surprising, that is not a defect — it is a design decision,
and §7 lists the ones people most often report by mistake.

Where this document is silent, say so in your report. "The specification does not define
what should happen when X" is a legitimate and valuable finding, and there are places where
it genuinely is silent.

---

## 1. Purpose

Members of the centre book its halls, courtyard, kitchen and classrooms for weddings,
ceremonies, classes and meetings. The office reviews each request, approves or rejects it,
and holds a refundable deposit. A public calendar shows the community what is on.

Money is not taken by this application. Hire fees and deposits are settled at the front
desk; this system records what is owed and what is held.

## 2. Roles

| Role | Can |
|---|---|
| **Visitor** (not signed in) | Browse spaces, see availability for a date, see the public what's-on calendar |
| **Member** (signed in) | Everything a visitor can, plus request a booking, see **their own** bookings, and cancel **their own** booking |
| **Staff** | See, search, filter and export **all** bookings; approve and reject requests; read the audit log |

A member must never be able to read another member's booking or personal details. Staff
routes are reachable only by a staff account.

## 3. Spaces

Six spaces are seeded. Each has a capacity, an hourly hire rate and a refundable deposit.

| Slug | Name | Capacity | Rate/hour | Deposit | Bookable |
|---|---|---|---|---|---|
| `main-hall` | Sabhaghar — Main Hall | 400 | $182.50 | $500 | yes |
| `courtyard` | Aangan — Courtyard | 150 | $91.30 | $250 | yes |
| `kitchen` | Community Kitchen | 30 | $62.75 | $150 | yes |
| `classroom-a` | Classroom A | 40 | $47.35 | $100 | yes |
| `library` | Reading Room | 20 | $32.10 | $50 | yes |
| `classroom-b` | Classroom B | 40 | $45.00 | $100 | **no** — closed for renovation |

`GET /api/spaces` lists them. `GET /api/spaces/:slug` returns one space with the add-on
catalogue and the blackout dates.

**Money is displayed to the cent, with a thousands separator: `$21,312.90`.** No amount
anywhere in the system — in a payload or on a page — may show more than two decimal places.

## 4. Availability and the public calendar

`GET /api/spaces/:slug/availability?date=YYYY-MM-DD` returns the hours already taken on
that date, and whether the building is closed.

- A slot is taken when a booking on that space and date is **confirmed, completed or
  pending**. A pending request holds the slot while the office decides; the office does not
  want two people invited to the same room.
- Cancelled and rejected bookings **do not** hold a slot. The room is free again.

`GET /api/calendar?from=&to=` returns the public what's-on list.

- **Only confirmed and completed bookings appear.** A pending request is not an event yet;
  a cancelled or rejected one never happened.
- Every booking carries a visibility, chosen by the member:

| Visibility | Public calendar shows | What may leave the server |
|---|---|---|
| `public` | The purpose, the space, the date and time, and the member's name | Name and purpose |
| `private` | "Private event", the space, the date and time | **Nothing identifying the member, and not the purpose either** — not their name, not their email, not their member id, in any field of the response |

## 5. Requesting a booking

`POST /api/bookings`. **Sign-in is required.**

The request carries `spaceSlug`, `eventDate`, `startTime`, `endTime`, `attendees`,
`purpose`, optional `notes`, `visibility`, and an optional list of add-ons.

**Validation, all enforced on the server:**

- `eventDate` is `YYYY-MM-DD` and **must be in the future**. A date in the past is rejected
  with 422.
- `startTime` and `endTime` are on the hour or the half hour, between **09:00 and 23:00**,
  and the end must be after the start.
- The booking must be at least **30 minutes** and at most **12 hours**.
- `attendees` is at least 1 and **at most the capacity of the space**. Over capacity is
  rejected with 422 — this is a fire regulation, not a preference.
- The space must be bookable. A closed space is rejected with 409.
- The date must not be a blackout date (§7.3).
- **The slot must be free.** Two bookings on the same space and date conflict when their
  times overlap. Times that merely touch do **not** conflict: a booking that ends at 12:00
  and one that starts at 12:00 are both allowed, and the seed data contains exactly that
  pair on the courtyard on 2026-11-07.
- A conflict is rejected with **409** and names the booking it conflicts with.

**Two members requesting the same slot at the same moment must not both succeed.** Exactly
one gets it. This is the single most important rule in this document.

On success the response is **201** with a reference (`HCC-BK-####`), the status `pending`,
the hours, the total and the deposit.

### Pricing

`total = hours × hourly_rate + Σ (add-on unit price × quantity)`

Add-on quantities are whole numbers of **at least zero**. A negative quantity is rejected
with 422.

## 6. The office

### 6.1 The bookings console

`GET /api/staff/bookings` supports:

- `q` — search by member name, member email or reference. **Search must work for a name
  written in Devanagari**, which is in the seed data.
- `status` — one of `pending`, `confirmed`, `completed`, `cancelled`, `rejected`, or `all`
- `space`, `from`, `to` — filters
- `sort` (`event_date`, `created_at`, `attendees`, `status`), `dir` (`asc`/`desc`)
- `page` (1 or greater) and `pageSize` (**1 to 100**). Values outside those ranges are
  rejected with 422; the response must never be an error page or an unbounded dump.

### 6.2 Approving and rejecting

- `POST /api/staff/bookings/:reference/approve` — status becomes `confirmed`. **The slot is
  re-checked at this moment**: if something else has taken the time since the request was
  made, approval fails with 409 rather than creating a double booking.
- `POST /api/staff/bookings/:reference/reject` — status becomes `rejected`, and **the
  deposit is released**: `deposit.status` becomes `refunded`.
- Both write an audit row **naming the staff member who did it**.

### 6.3 Cancellation by a member

`POST /api/my/bookings/:reference/cancel`, on their own booking only.

- Status becomes `cancelled` and the deposit is released.
- **A booking can only be cancelled once.** A second attempt is rejected with 409, and must
  not write a second refund.

### 6.4 Statistics

`GET /api/staff/stats` reports **hours booked** and **hire fees** for bookings that are
`confirmed` or `completed` only. Cancelled, rejected and pending bookings contribute
nothing. Deposits held counts bookings whose deposit status is `held`.

### 6.5 CSV export

`GET /api/staff/bookings.csv` exports the current filter.

- **RFC 4180 quoting.** A field containing a comma, a quotation mark or a newline is quoted,
  and quotation marks inside it are doubled. The seed data contains a member whose name is
  `Shrestha, Bijay "BJ"` and a purpose containing a comma, and both must survive the round
  trip into a spreadsheet with the columns intact.
- The file is UTF-8 **with a byte-order mark**, so Devanagari names open correctly in Excel.

## 7. Deliberate behaviour — not defects

Every item below is intended. Reporting one as a bug costs marks; noticing that it is
deliberate and saying so does not.

1. **Guests cannot book.** Browsing is open to everyone, but a booking request requires a
   member account. The office wants a person attached to every request.
2. **Every request starts as `pending`.** Nothing is auto-approved, however obviously fine
   it looks. A human at the front desk decides.
3. **Blackout dates are refused with 422.** The building is genuinely closed on those days
   — Ghatasthapana, Vijaya Dashami, Deusi Bhailo and 25 December. This is correct.
4. **Times must be on the hour or the half hour.** `10:15` is rejected with 422. The
   caretaker schedules in half-hour blocks.
5. **Classroom B still appears in the catalogue** while it is closed for renovation, marked
   as not bookable. Members asked to be able to see it is coming back.
6. **Deposits are recorded, never charged.** `deposit.status` is `held` from the moment a
   request is made. Money changes hands at the front desk, not here.
7. **The building closes at 23:00** and opens at 09:00. A booking outside those hours is
   rejected with 422 even though the caretaker is sometimes there later.

## 8. Non-functional expectations

- Every page works at 375px wide.
- The console is used by two members of staff on an old laptop; a list of 100 bookings
  should not take seconds to render.
- No page may render a value the office cannot explain to a member on the phone.
