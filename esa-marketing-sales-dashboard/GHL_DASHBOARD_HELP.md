# What to do in GHL so the Command Center stays accurate

Short checklist. Full tag and stage spec: [ESA_SALES_SYSTEM.md](./ESA_SALES_SYSTEM.md). Env vars: [README.md](./README.md).

## TCV (total contract) vs what they paid (cash in) — where to put each

These are **two different numbers**. The dashboard reads them from **two different places** on the same GHL opportunity.

| What it means | Where you update it in GHL | What the Marketing **Dashboard** uses |
|---------------|----------------------------|----------------------------------------|
| **TCV** = full contract / deal size | On the opportunity: **Value** (the main dollar field on the deal card). That is API `monetaryValue`. | **Total contract value (TCV)**, **Closed Won** $ line (GHL path), **Wins driving revenue** “amount”, ROAS numerator (unless sheet replace mode). |
| **Cash collected** = money actually received so far on that deal | **Opportunity custom field** (you create it), e.g. “Cash collected” or “Amount paid to date”. Put the running total here when payments hit. | **Total cash collected** (Row C) and **Cash** column on **Wins driving revenue** — only if **`GHL_OPP_CASH_CUSTOM_FIELD_ID`** on Vercel is set to that field’s ID. |
| **No separate cash field** | N/A | Set **`GHL_CASH_MATCHES_CONTRACT=1`** on Vercel to treat cash = full **Value** (use only when every Closed Won is paid in full at close). |

**How to add the cash field in GHL (typical path):** **Settings → Custom fields → Opportunities** (or your location’s custom fields) → create a **number / currency** field → save. Copy the field’s **ID** (often visible in the field’s URL or in the API / developer tools). Put that ID in Vercel as **`GHL_OPP_CASH_CUSTOM_FIELD_ID`**, then **redeploy**.

**Sales board vs Dashboard:** The **Sales board** does **not** read those GHL fields live. It reads your **Sales tab / CSV log** in Redis. To reflect the same story there, use the form fields **Amount paid ($)** and **Amount owed ($)** so **paid + owed** matches the **full contract** you care about, and **Amount paid** matches **cash collected** you track in GHL (update both when a payment posts).

## Location and API

1. **Sub-account:** Dashboard reads contacts and opps for one **location**. On Vercel set **`GHL_LOCATION_ID`** to **Settings → Business Profile → Location ID** (same sub-account where deals live).
2. **API key:** Private integration token with read access to contacts, users, pipeline opportunities.

## Closed Won revenue (TCV, ROAS, “Wins driving revenue”)

1. **Pipeline:** Opps must be in your **Brian & Diamond** pipeline with stage **Closed Won** (IDs in `api/ghlDealConstants.js` must match GHL if you ever change stages).
2. **Dollar amount:** Set **Opportunity value** (`monetaryValue`). Blank opps are **excluded** from revenue unless you set **`GHL_DEAL_VALUE_FALLBACK`** on Vercel.
3. **Date:** The deal counts in the selected range by **`lastStatusChangeAt`** when it moved to Closed Won (fallback `updatedAt`). If the close was long ago, widen the dashboard range or use **All Time**.
4. **Lead source on the dashboard:** Put the right **`src-*` tag** on the **contact** (e.g. **`src-vsl`**, **`src-returning`**, **`src-organic`**) so Row C and lead source tables match how you sold them.

## Cash collected (Row C)

1. **Option A:** Create an **opportunity custom field** for “cash collected” / “amount paid so far” and set **`GHL_OPP_CASH_CUSTOM_FIELD_ID`** on Vercel to that field’s numeric ID.
2. **Option B:** Set **`GHL_CASH_MATCHES_CONTRACT=1`** if you treat cash as the full contract (no partial payments in CRM).

Without one of these, **Total cash collected** and per-source cash lines stay at **$0** even when TCV is correct.

## Meta vs GHL lead counts

1. **FB Lead Form (SS):** Canonical workflow tag is **`new lead - meta - lead form (sam)`** (see **ESA_SALES_SYSTEM.md**). If GHL shows 0 leads but Meta has spend, check **location ID** and tagging.

## What GHL does *not* feed today

- **Sales board** “paid / owed / notes” tables use your **Redis log** (Sales tab saves and CSV import), **not** live GHL fields.
- **“Still owes $10k”** only rolls into **Sales board KPIs** and breakdowns if **`Amount owed ($)`** on the Sales form (or CSV column **owed** / **amount owed**) is **10000**. Text in **Notes** shows in **Each closed deal** after deploy; it does **not** by itself change **Total owed** sums.
- **Marketing Dashboard** Row C **cash** comes from GHL opps (custom field or matches contract), **not** from the Sales log **Amount owed**. Those are different concepts (cash in vs balance remaining).

## Optional: sheet as revenue source

If **`SHEETS_REVENUE_MODE=replace`**, headline revenue / TCV can follow the Google Sheet; **Wins driving revenue** still lists GHL Closed Won. See **README.md**.
