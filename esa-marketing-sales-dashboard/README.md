# ESA Marketing / Sales Dashboard

Vercel-hosted **Sales Command Center**: GHL contacts + Meta ads. UI tabs: **Dashboard**, **Raw Data**, **Snapshot**, **Sales** (log deals to GHL). **Tech stack** button in the header opens [`tech-stack.html`](./tech-stack.html) (workspace-wide inventory).

**System spec (tags, stages, SOP):** [ESA_SALES_SYSTEM.md](./ESA_SALES_SYSTEM.md) — Meta lead form workflow tag is aligned with marketer **Sam Sauter** (exact GHL string in the spec).

**Env (Vercel):** `GHL_API_KEY`, `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`

**Sales tab / deal form (optional):** `DEAL_UPLOAD_SECRET` — shared team password for the **Sales** tab. The form includes the same columns as the sales workbook (Fathom URLs, dates, client/event name, product, paid/owed, setter & closer, Meta attribution fields, etc.); submitted data is stored on the **opportunity** in GHL (notes block + tags). The same `GHL_API_KEY` must allow **contacts** and **opportunities** write. Without `DEAL_UPLOAD_SECRET`, the API returns 503.

**Submissions + Sales board:** Add **Redis** via Vercel **Storage**. Vercel often injects **`REDIS_URL`** only (`redis://` or `rediss://`). This app now uses **ioredis** for that. Alternatively use REST vars: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` or `KV_REST_API_URL` + `KV_REST_API_TOKEN` (REST is tried first if both URL and token exist). **Redeploy** after linking so `npm install` runs (`package.json` includes `ioredis`). Each successful **Sales** form post is appended to a list (newest first, max 500). Without Redis, both tabs show a setup notice; GHL logging still works.

### Google Sheet revenue (optional)

Use your **[sales sheet](https://docs.google.com/spreadsheets/d/1PpmjfmolXIkrShtb5LD4ZIC6ESO77SpfSGeHyXjDYl8/edit)** as the $ total for ROAS instead of GHL opportunity values.

1. **Google Cloud:** Create a project, enable **Google Sheets API**, create a **service account**, download JSON.
2. **Share the spreadsheet** with the service account email (e.g. `something@project.iam.gserviceaccount.com`) as **Viewer**.
3. **Vercel env:**
   - `GOOGLE_SERVICE_ACCOUNT_JSON` = paste the **full** JSON (one line is fine).
   - `SHEETS_REVENUE_MODE` = `replace` (omit or `off` to keep GHL-only revenue).
   - Optional: `GOOGLE_SHEETS_SPREADSHEET_ID` (defaults to the ESA sheet id above), `GOOGLE_SHEETS_RANGE` (default `Sheet1!A1:Z2000` — change tab name if yours differs), `GOOGLE_SHEETS_DATE_COLUMN` / `GOOGLE_SHEETS_AMOUNT_COLUMN` as letters (`A`, `B`) if auto-detect misses your layout.

**Sheet layout:** First row = headers. Include a **date** column (header text like “Date”, “Close date”) and an **amount** column (“Amount”, “Revenue”, “Total”). Rows whose date falls in the dashboard’s selected range are summed for **Revenue** and **Upfront ROAS**. By-channel $ in the table is cleared in `replace` mode so the top-line total matches the sheet.

**Optional:** `GHL_DEAL_VALUE_FALLBACK` – if an opportunity has **Closed Won** but `monetaryValue` is empty, count it as this dollar amount for revenue/ROAS (omit or set `0` to only count deals with real values entered in GHL).

After changing GHL pipeline stage IDs, update `PIPELINE_STAGES` and `CLOSED_WON_STAGE_ID` in `api/data.js`.

**Revenue / ROAS:** Sums **monetaryValue** on opportunities in **Closed Won** when **lastStatusChangeAt** falls in the selected date range (aligned with Meta spend range). Set deal value on each won opp in GHL for accurate ROAS.

### Local Excel workbook (`scripts/`)

Use a venv with `openpyxl`, e.g. `python3 -m venv .venv-sheet && .venv-sheet/bin/pip install openpyxl`.

| Script | What it does |
|--------|----------------|
| `scripts/clean_sales_sheet.py` | Rebuilds **`Clean_All`** from **`Sheet1`**, ensures **`Enter_Sales`** tab for manual entries. |
| `scripts/snapshot_dashboard_tab.py` | Optional: pushes the same flat KPI list into an Excel tab **`Dashboard_Snapshot`**. The **Sales Command Center** site also has an in-app **Snapshot** tab (no Excel needed). |
