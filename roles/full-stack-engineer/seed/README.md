# Seed data

Load these. Every submission we review then has the same data in it, which lets us compare
your work to somebody else's fairly, and lets us check a number without reading your code.

| File | What it is |
|---|---|
| `campaigns.json` | 3 campaigns — one active, one secondary, one closed and already past its goal |
| `donations.csv` | 75 donations across those campaigns |

## Read this before you write the importer

**Several rows are awkward on purpose.** They are the rows that catch the bugs we care
about. If your importer, your search, your CSV export or your rendering breaks on one of
them, that is the exercise working.

| Row | Why it is there |
|---|---|
| `HCC-2026-000001` — `Shrestha, Bijay "BJ"` | A comma **and** double quotes in a name. Breaks a naive `split(',')` on import and a naive `join(',')` on export. RFC 4180 quoting, both directions. |
| `HCC-2026-000002` — `अनिशा गुरुङ` / `बुबा` | Devanagari in the name, the dedication and the message. Your admin search must find this donor. `toLowerCase()` will not help you. |
| `HCC-2026-000003` — `$25,000.00` | The documented maximum, exactly. Your validation must accept it and reject one cent more. |
| `HCC-2026-000004` — `$1.00` | The documented minimum, exactly. |
| `HCC-2026-000005`, `13` | `privacy_mode = anonymous`. **The name must not appear in any public API response.** Not blanked in the UI — absent from the payload. |
| `HCC-2026-000006`, `23` | `privacy_mode = family`. Surname only: "The Gurung family". |
| `HCC-2026-000007`, `18`, `21` | `refunded`. Must not count towards the total, the donor count, or the public list. |
| `HCC-2026-000008` | `failed`. Same, and it must be distinguishable from a refund in the admin view. |
| `HCC-2026-000009`, `10` | `<script>alert(1)</script>` and an `onerror` payload in the dedication message. This message is rendered on the public page, in the admin table and in the CSV. **Escape it per context.** If either fires in a browser, that is a critical finding against you. |
| `HCC-2026-000011` / `12` | The same person with two capitalisations of their email address. Decide whether they are one donor or two, and write the decision down. |
| `HCC-2026-000013` | An emoji in the message. Your column type, your truncation and your PDF all have opinions about this. |
| `HCC-2026-000014` | A dedication message at the 280-character limit. |
| `HCC-2026-000019`–`23` | Belong to the two seeded donor accounts. Use them for the authorisation test: `donor@` must never see `other@`'s donations. |
| Amounts generally | Given as **dollar strings**. Convert to integer cents **once**, on import. If `SUM()` over your table ever needs a float, something has gone wrong upstream. |

## Numbers you can check yourself

After a correct import:

- **75** donation rows
- **66** `completed`, **7** `refunded`, **2** `failed`
- **48** `public`, **15** `anonymous`, **12** `family`
- Completed donations for `aangan-courtyard` total **$43,058.00** — that is **4,305,800
  cents**, and your campaign page must show exactly that

If your page shows `$43,058.000000001`, or `$43,109` because a refund is being counted, you
have found the bug this seed data exists to find.

## Donors

Create donors from the distinct emails. Two of them need passwords so they can log in — see
`../SETUP.md` for the accounts, and put the credentials in your README in plain text.

Everybody else is a guest donor with no password, which is the normal case and which your
schema has to allow.
