# Import sales rows from CSV (Submissions / Redis)

Use this to **one-time load** past deals from Excel or Google (export as CSV) into the Command Center **Submissions** table. New deals can keep coming from the **Sales** tab.

## Requirements

- **Redis** linked on Vercel (same as Submissions).
- **`DEAL_UPLOAD_SECRET`** set on Vercel (same **team password** as the Sales tab).
- Max **500** rows total in storage; imports that would exceed the limit are **rejected** (clear space or split the file).

## API

`POST /api/deal-import-csv` with JSON body:

```json
{
  "secret": "YOUR_DEAL_UPLOAD_SECRET",
  "csv": "paste full CSV text here"
}
```

## Required columns (header row)

Your CSV **must** include these headers (names are matched case-insensitively; underscores and spaces normalized):

| Column        | Maps to        | Notes                                      |
|---------------|----------------|--------------------------------------------|
| **Email**     | email          | Valid email                                |
| **EVENT_NAME**| client / deal  | Same as Submissions export                 |
| **Product**   | product        |                                            |
| **Paid**      | amount paid    | Number ≥ 0 (also accepts Amount paid)      |
| **Stage**     | pipeline stage | Stage **name** (e.g. `Closed Won`) or stage UUID |

## Recommended: match Export CSV

The easiest path is:

1. Log one deal from the **Sales** tab (or import a tiny test file).
2. Open **Submissions** → **Export CSV**.
3. Use that file’s **header row** as the template for your historical export (column order can vary; names must map).

## Optional columns

Same as the export file, including: Submitted, Fathom 1, Fathom 2, Date created, 1st call, Payment date, Closing date, First, Last, Phone, Owed, Setter, Setter 5pct, Closer, Closer comm, Lead source, Campaign, Adset, Ad, Source tag, Payment plan, Notes, Contact ID, Opp ID.

- **Submitted:** If blank, the import assigns synthetic timestamps so rows stay ordered (first data row = oldest).
- **Source tag:** If missing or unknown, defaults to `src-organic`.

## Errors

- **400** — bad row, missing required column, or would exceed 500 rows.
- **401** — wrong password.
- **503** — Redis or `DEAL_UPLOAD_SECRET` not configured.

After a successful import, refresh **Submissions** or use **Import CSV** in the UI (reads the file and calls this API).
