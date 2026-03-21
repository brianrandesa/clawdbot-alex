# ESA Sales System (canonical reference)

**Last updated:** 2026-03-21  
**Pipeline (GHL):** BRIAN AND DIAMOND PIPELINE (ID in dashboard: `LlthtHqW8V4PA9AWN8g7` – confirm in GHL if renamed)

This doc is the single source of truth for tags, stages, and process. The live dashboard (`api/data.js`) maps **legacy/human tags** to the canonical `src-*` and `status-*` tags below.

---

## Brian & Diamond: call phases (operational)

| Phase | What happens |
|--------|----------------|
| **Pre-call** | Diamond owns New Lead. Book the sales call. Confirm tomorrow’s bookings. |
| **During call** | Brian runs the one-call close. |
| **Post-call** | Brian moves the opportunity: Offer Made, Contract Sent, Closed Won, Closed Lost, or Nurture. |

**Appointments:** Calendars → Appointments → set status **Showed / No Show / Cancelled**. Workflows should move opps and apply tags accordingly.

**Lead flow (high level):** Lead form → book-a-call page; if they do not book, they stay in the **far left (New Lead)** column and Diamond calls them.

### SS lead form + far left column (read this for metric accuracy)

**Definition:** In the **BRIAN AND DIAMOND** pipeline, an opportunity that is still in the **far left column (New Lead)** **and** has the source tag **`src-fb-lead-form-ss`** means:

- They came in on the **Facebook Lead Form (SS)** path.  
- They **did not** complete a self-book on the calendar (or otherwise land in Booked yet).  
- **Diamond is actively calling** them to get a sales call booked.

This is **not** “stale junk.” It is the **intentional queue** between Meta form fill and a confirmed appointment.

**Why this keeps rates honest**

| Metric | What it means when data is clean |
|--------|----------------------------------|
| **Lead → book %** (booking rate) | Of SS-tagged leads in scope, how many reached **`status-booked`** (or Booked stage). People still in New Lead + `src-fb-lead-form-ss` are **leads not yet booked**, not failed bookings. |
| **Show rate** | **Showed / Booked** (or equivalent). Only contacts with a real booking should have **`status-booked`** before they can show. New Lead + SS **without** `status-booked` stay in the **numerator of “leads”** only, **not** in “booked,” so they **do not** deflate show rate. |

**Ops rule:** As soon as Diamond books them, move the opp to **Booked** and apply **`status-booked`** (plus optional tags like *Booked by Diamond* or *Lead Form Self Book*). That transition is what makes funnel math match reality.

---

## Six source tags (never change after set)

| Source | How they enter | GHL tag |
|--------|----------------|---------|
| FB Lead Form | Meta lead ad → Diamond books OR self-book | `src-fb-lead-form-ss` **or** tag contains **`meta ss`**, **or** same tag contains both **`meta`** and **`lead form`** (e.g. `new lead - meta - lead form (sam)`) |
| VSL Funnel | Meta → VSL → quiz → books on page | `src-vsl` |
| Outbound Dialer | Tier lists dialed by team | `src-outbound` |
| Cold Call Events | Diamond cold calls promoters | `src-coldcall` |
| Organic | Content, referrals, DMs, site (non-paid) | `src-organic` |
| Brian’s Network | Warm intro / personal | `src-brian-direct` |

**Display / list naming (examples):** `FRESH LEAD VSL`, `FB LEAD FORM - SS` → normalize to the tags above in workflows.

**Smart lists:** e.g. all SS Lead Form contacts should carry **`src-fb-lead-form-ss`** so reporting matches.

---

## Lead flow labels (for ops, not extra source tags)

- FB Lead Form → New Lead, no book (Diamond dials)  
- FB Lead Form → Self-booked  
- FB Lead Form → Diamond manually booked  
- FB Ad → VSL → Booked  
- Outbound Dialer / Cold Call Events / Organic / Brian’s Network  

**Attribution tags (examples):** `Booked by Diamond`, `Lead Form Self Book`, `Diamond Appt Sets` – use alongside `status-booked` / pipeline stage so dashboards stay consistent.

---

## Pipeline stages (target order)

1. New Lead  
2. Booked  
3. Showed  
4. Offer Made / FU Needed  
5. Contract Sent  
6. Closed Won  
7. Closed Lost  
8. **No Show** (between Closed Lost and Nurture when GHL is updated)  
9. Nurture  

**Automation (typical):** Appointment created → Booked; status Showed → Showed; No Show / Cancelled → **No Show** stage + tags (not the same as long-term Nurture unless you choose to merge later).

**Manual (Brian):** Offer Made, Contract Sent, Closed Won, Closed Lost, Nurture (not a fit).

---

## Status tags (`status-*`)

Tags stack as contacts progress. Workflows on pipeline move should apply:

| Stage / outcome | Tag |
|-----------------|-----|
| New Lead | `status-new-lead` |
| Booked | `status-booked` |
| Showed | `status-showed` |
| Offer Made | `status-offer-made` |
| Contract Sent | `status-contract-sent` |
| Closed Won | `status-closed-won` |
| Closed Lost | `status-closed-lost` |
| No Show | `status-no-show` |
| Nurture | `status-nurture` |

---

## Slack (from playbook)

- `#sales-calls` – Fathom links; Victoria follow-up in thread.  
- `#nurture-followups` – Offer Made, Contract Sent, Nurture.  

**New:** per-interested-lead channels + Victoria follow-up plan (parallel to above).

---

## GHL / tooling backlog (not in this repo)

Do these **inside GHL** (and connected tools):

- [ ] Send Blue: turn on; disable AI convo mode if unwanted  
- [ ] Green bubble automations / AI: exclude DND contacts  
- [ ] Lead flow: Chat Widget; FB Messenger  
- [ ] Internal notifications: include FB Msg + Chat Widget; **Diamond** gets all lead-source notifications  
- [ ] Chat Widget: New Lead stage, opp name, source, tag  
- [ ] Move “Fresh” booked calls into correct pipeline column; reconcile **~51 Booked** after cleanup  
- [ ] Pipeline cleanup (Shah): e.g. `ESA Old pipeline`, merge/delete extras, calendars, tags, forms, custom fields  
- [ ] Victoria: tagging by organic / paid social / referral where applicable  

---

## Dashboard code

- **File:** `api/data.js` – `SOURCES`, `LEGACY_SOURCE_MAP`, `LEGACY_STATUS_MAP`, `PIPELINE_STAGES`
- **Sales tab:** Sales Command Center tab **Sales** (log deal form) → `POST /api/deal-upload` (requires `DEAL_UPLOAD_SECRET` on Vercel). Every successful save also appends the same row shape to **Redis** for **Submissions** / **Sales board** (your on-site spreadsheet; optional **Dashboard only** skips GHL). **Bulk history:** `POST /api/deal-import-csv` or **Submissions → Import CSV** — see `SUBMISSIONS_IMPORT_CSV.md` (max 500 rows). Form fields mirror the sales workbook (Fathom links, dates including **Closing date**, EVENT/NAME, product, paid/owed, setter/closer, Lead Source, Campaign/Adset/Ad, etc.). **Create in GHL:** full row in **opportunity notes**; tags include `src-*`, `status-*` from stage, `deal-logged-command-center`, optional `payment plan`, `esa-product-*`, `esa-owed-*` when applicable. Pipeline stage IDs must match `api/ghlDealConstants.js` / `data.js`. Add a **Closing date** column to **`Enter_Sales`** / master sheet if you track it in Excel so exports stay aligned.  
- If you **reorder stages or change stage IDs** in GHL, update `PIPELINE_STAGES` IDs to match or the “Pipeline by Stage” bars will be wrong.

### Marketing QA row (FB Lead Form SS)

**Canonical GHL tag (Sam Sauter / Meta instant form):** `new lead - meta - lead form (sam)` — this is the definition of “came from Meta lead form” in workflows and filters.

On the dashboard, the top **FB Lead Form (SS) · Marketing QA** strip uses contacts whose **`dateAdded`** falls in the selected range (same as the main dashboard filter) and who match **that tag**, **`src-fb-lead-form-ss`**, or the other Meta–lead-form patterns in `api/data.js`.

| Box | Definition |
|-----|------------|
| **SS Lead forms (Meta)** — **primary number** | Sum of **Results** from Meta campaigns whose name matches **SS \| Lead Form** (same as Ads Manager, e.g. **68**). This is the **marketing / agency** count. |
| **GHL (subtitle on first card)** | Contacts in range matching **Meta lead form** tags: `meta ss`, **or** `meta` + `lead form` in one tag (Sam Sauter workflow), **or** `src-fb-lead-form-ss` / legacy map. If **above** the Meta campaign number, other workflows may be tagging the same people. |
| **Booked / unbooked (vs Meta)** | Booking % uses **Meta SS count** as denominator when Meta data exists. Unbooked row ≈ Meta SS results minus CRM SS-tagged booked (sanity check if CRM booked &gt; Meta). |
| **Lead forms booked** | Same cohort with **`status-booked`** (or legacy tags that map to it). |
| **Booked by Diamond** | Booked **and** at least one of: *appt booked by diamond*, *booked by diamond*, *diamond appt sets*. |
| **Unbooked lead forms** | SS forms in range **without** `status-booked` (Diamond’s call queue). |

Subtext **self-book tag** counts booked contacts that also have **`lead form self book`** (for reconciliation vs Diamond-tagged books).

---

### Revenue and ROAS (dashboard)

- **Default source of truth:** GHL opportunity **`monetaryValue`** on deals in **Closed Won**.
- **Optional:** If **`SHEETS_REVENUE_MODE=replace`** and **`GOOGLE_SERVICE_ACCOUNT_JSON`** is set on Vercel, revenue and ROAS use the **Google Sheet** (ESA sales tracker). See **README.md** for setup. First sheet tab must match **`GOOGLE_SHEETS_RANGE`** (default `Sheet1!…`); rename the tab or set the env var if the tab is not `Sheet1`.  
- **Sheet attribution (Dashboard):** The same sheet read can aggregate **Lead Source**, **Campaign**, **Adset**, **Ad**, **Product**, and **Dashboard source** when those headers exist. Shown under **Google Sheet · cash by attribution**. With **`GOOGLE_SHEETS_ATTRIBUTION=1`**, the sheet is read for those tables even when revenue stays on GHL.  
- **Time rule:** Deal counts toward the selected range when **`lastStatusChangeAt`** (fallback `updatedAt`) is inside that range. Same window as Meta spend → **ROAS = revenue / ad spend** is comparable.  
- **Per source:** Revenue and “Won (deals)” use the **contact’s `src-*` tag** on that opportunity’s contact.  
- **If value is blank:** Set dollar amount on the opp in GHL, or set env **`GHL_DEAL_VALUE_FALLBACK`** on Vercel (optional). With no fallback and `$0`, that win is **excluded** from revenue so ROAS stays honest.

### Payment plans (close vs cash; dashboard limits)

The live dashboard reads **one `monetaryValue` per Closed Won opportunity** and **one close timestamp** (`lastStatusChangeAt`). It does **not** natively split one deal across multiple payment dates.

**Pick one story per deal (stay consistent):**

| Goal | What to do |
|------|------------|
| **ROAS / “sold” when they sign** | On close: **Closed Won** + put **full contract price** on the opp. Payment plan is finance/collections only; dashboard shows the full sale once, in the period they closed. |
| **ROAS / “cash collected” by month** | GHL alone won’t split installments. Use the **sales workbook** (**`Enter_Sales`** / **`Clean_All`**) or Google Sheet: **one row per payment** with **payment date** + **Amount Paid** + **Amount Owed**. Optionally wire **`SHEETS_REVENUE_MODE=replace`** so the dashboard sums sheet rows in the selected date range (see **README.md**). |
| **Hybrid** | **GHL** = full contract for pipeline truth; **spreadsheet** = cash log for payouts / P&amp;L. Don’t add the same dollars twice into one ROAS number. |

**Ops habit:** When a plan payment hits, log a row in **`Enter_Sales`** (or your master sheet). When the deal **first** closes, still move the opp to **Closed Won** and align **`monetaryValue`** with whatever definition you chose above.

---

## Example: mixed FB form + Diamond book

**Situation:** Lead from FB form; self-booked on form calendar; Diamond also moved them to an earlier slot.  

**Expectation:** `src-fb-lead-form-ss` + booked workflow tags (`status-booked` + optional `Booked by Diamond` / `Lead Form Self Book` as human-readable tags). Opportunity name and source field should match the same story.

Contact link (example): `/v2/location/.../contacts/detail/...` (see internal GHL URL).
