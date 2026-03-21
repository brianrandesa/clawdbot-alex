# ESA Marketing / Sales Dashboard

Vercel-hosted **Sales Command Center**: GHL contacts + Meta ads. UI tabs: **Dashboard**, **Raw Data**, **Snapshot**, **Submissions** (your saved sales log + CSV in/out), **Sales board**, **Sales** (log form). **Tech stack** button in the header opens [`tech-stack.html`](./tech-stack.html) (workspace-wide inventory).

### Sales log (form + Submissions) — no Google required

Your **spreadsheet workflow** on the site: use the **Sales** tab to enter deals; each save appends to **Redis** and appears on **Submissions** (table + **Export CSV**). **Google Sheets** below is **optional** only for replacing dashboard revenue/ROAS, not for storing this log. **CSV import:** on **Submissions**, use **Import CSV** (same team password as Sales) or `POST /api/deal-import-csv` — see [`SUBMISSIONS_IMPORT_CSV.md`](./SUBMISSIONS_IMPORT_CSV.md). Rows are sorted by **Submitted** time (newest first). Max **500** rows.

**System spec (tags, stages, SOP):** [ESA_SALES_SYSTEM.md](./ESA_SALES_SYSTEM.md) — Meta lead form workflow tag is aligned with marketer **Sam Sauter** (exact GHL string in the spec).

**Env (Vercel):** `GHL_API_KEY`, `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`

**GHL opportunity create errors:** If **Create in GHL** fails with 400/422, set **`GHL_LOCATION_ID`** on Vercel to your sub-account Location ID (GHL Settings) and redeploy. Until fixed, use **Dashboard only** on the Sales tab (no GHL call).

**Sales tab / deal form (optional):** `DEAL_UPLOAD_SECRET` — shared team password for the **Sales** tab. The form includes the same columns as the sales workbook (Fathom URLs, dates, client/event name, product, paid/owed, setter & closer, Meta attribution fields, etc.). **Dashboard only** (checkbox): appends one row to **Submissions** / **Sales board** in Redis with **no** GHL calls (needs Redis + secret only). **Create in GHL**: writes to GHL (notes + tags + opportunity) and also appends to Redis when configured. `GHL_API_KEY` must allow **contacts** and **opportunities** write for the GHL path. Without `DEAL_UPLOAD_SECRET`, the API returns 503.

**Submissions + Sales board:** Add **Redis** via Vercel **Storage**. Vercel often injects **`REDIS_URL`** only (`redis://` or `rediss://`). This app now uses **ioredis** for that. Alternatively use REST vars: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` or `KV_REST_API_URL` + `KV_REST_API_TOKEN` (REST is tried first if both URL and token exist). **Redeploy** after linking so `npm install` runs (`package.json` includes `ioredis`). Each **Sales** form save or **CSV import** appends to a list (max **500** total; API returns rows sorted by submitted time, newest first). Without Redis, both tabs show a setup notice; rows cannot be persisted without Redis.

### Google Sheet revenue (optional)

Use your **[sales sheet](https://docs.google.com/spreadsheets/d/1PpmjfmolXIkrShtb5LD4ZIC6ESO77SpfSGeHyXjDYl8/edit)** as the $ total for ROAS instead of GHL opportunity values.

1. **Google Cloud:** Create a project, enable **Google Sheets API**, create a **service account**, download JSON.
2. **Share the spreadsheet** with the service account email (e.g. `something@project.iam.gserviceaccount.com`) as **Viewer**.
3. **Vercel env:**
   - `GOOGLE_SERVICE_ACCOUNT_JSON` = paste the **full** JSON (one line is fine).
   - `SHEETS_REVENUE_MODE` = `replace` (omit or `off` to keep GHL-only revenue).
   - Optional: `GOOGLE_SHEETS_SPREADSHEET_ID` (defaults to the ESA sheet id above), `GOOGLE_SHEETS_RANGE` (default `Sheet1!A1:Z2000` — change tab name if yours differs), `GOOGLE_SHEETS_DATE_COLUMN` / `GOOGLE_SHEETS_AMOUNT_COLUMN` as letters (`A`, `B`) if auto-detect misses your layout.

**Sheet layout:** First row = headers. Include a **date** column (header text like “Date”, “Close date”) and an **amount** column (“Amount”, “Revenue”, “Total”). Rows whose date falls in the dashboard’s selected range are summed for **Revenue** and **Upfront ROAS**. By-channel $ in the table is cleared in `replace` mode so the top-line total matches the sheet.

**Sheet attribution on the Dashboard:** With the same fetch, the API looks for optional columns (header names, case-insensitive): **Lead Source** (or **Source** / **UTM source**), **Dashboard source** / **Source tag**, **Campaign**, **Adset** / **Ad set**, **Ad**, **Product**. The **Dashboard** tab shows a **Google Sheet · cash by attribution** section: revenue and row counts per value, same date window as the sheet revenue logic. This runs automatically when `SHEETS_REVENUE_MODE=replace`. To read the sheet **only** for attribution while keeping **GHL** as the revenue source, set **`GOOGLE_SHEETS_ATTRIBUTION=1`** (still requires `GOOGLE_SERVICE_ACCOUNT_JSON` and a shared spreadsheet).

**Optional:** `GHL_DEAL_VALUE_FALLBACK` – if an opportunity has **Closed Won** but `monetaryValue` is empty, count it as this dollar amount for revenue/ROAS (omit or set `0` to only count deals with real values entered in GHL).

After changing GHL pipeline stage IDs, update `PIPELINE_STAGES` and `CLOSED_WON_STAGE_ID` in `api/data.js`.

**Revenue / ROAS:** Sums **monetaryValue** on opportunities in **Closed Won** when **lastStatusChangeAt** falls in the selected date range (aligned with Meta spend range). Set deal value on each won opp in GHL for accurate ROAS.

### Local Excel workbook (`scripts/`)

Use a venv with `openpyxl`, e.g. `python3 -m venv .venv-sheet && .venv-sheet/bin/pip install openpyxl`.

| Script | What it does |
|--------|----------------|
| `scripts/clean_sales_sheet.py` | Rebuilds **`Clean_All`** from **`Sheet1`**, ensures **`Enter_Sales`** tab for manual entries. |
| `scripts/snapshot_dashboard_tab.py` | Optional: pushes the same flat KPI list into an Excel tab **`Dashboard_Snapshot`**. The **Sales Command Center** site also has an in-app **Snapshot** tab (no Excel needed). |

### Match event names to GHL contacts (CSV)

From the dashboard folder, with the same **`GHL_API_KEY`** (private integration token) you use for the API:

```bash
export GHL_API_KEY="…"
# Save your one-name-per-line list as names.txt, then:
node scripts/match_names_to_ghl_contacts.js names.txt > enriched.csv
```

Output columns: input line, First, Last, Email, Phone, match score, GHL contact id. Lines with score `0` need a manual lookup. Suffixes like ` - 2nd payment` or ` - Summit At Sea` are stripped **only** for matching, not in the first column.
