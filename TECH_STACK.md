# ESA / OpenClaw workspace tech inventory

Living reference for **everything detected in this repo** (March 2026). Update when you add projects.

**Single human-facing page (deployed with Sales Command Center):**  
`esa-marketing-sales-dashboard/tech-stack.html` → live at `/tech-stack.html` on Vercel.

---

## Platforms & shared tooling

| Item | Where / use |
|------|-------------|
| **Git / GitHub** | `clawdbot-alex` and related repos |
| **Cursor** | Editor + AI agents |
| **Node.js** | Serverless APIs, scripts, Vite apps |
| **Python 3** | Financial robot, sheet scripts, deploy helpers |
| **Vercel** | Static + serverless (`esa-marketing-sales-dashboard`, `will-sd-eos-empire`) |

---

## Apps in this workspace (by folder)

### `esa-marketing-sales-dashboard/`

- **UI:** HTML, CSS, vanilla JS (no React)
- **Runtime:** Vercel serverless (Node)
- **APIs:** GoHighLevel REST, Meta Marketing API, Google Sheets API (optional), Upstash Redis REST (submissions)
- **Fonts:** Google Fonts (Inter)

### `openclaw-3d-office/` (Virtual Office + in-app Command Center)

- **Build:** Vite 8
- **3D:** Three.js, OrbitControls
- **Realtime:** `ws` WebSocket server (`server/presenceServer.js`)
- **Integrations:** OpenClaw / Clawbot HTTP client (`src/api/clawbotClient.js`)

### `esa-memory/`

- **Server:** Express
- **DB / BaaS:** Supabase (`@supabase/supabase-js`)
- **Config:** dotenv

### `mcp-servers/ghl-server/`

- **Protocol:** Model Context Protocol (`@modelcontextprotocol/sdk`)
- **HTTP:** Express, node-fetch
- **Automation:** Playwright
- **Config:** dotenv

### `team-agent/scripts/`

- **Slack:** `@slack/web-api`

### Workspace root `package.json`

- **HTTP / APIs:** axios, googleapis
- **Email:** nodemailer, imap, mailparser
- **Config:** dotenv
- **3D (shared):** three

### `financial-modeling-robot/`

- **Python:** yfinance, pandas, numpy, typer, rich, tabulate
- **Demo UI** (`demo/public/`): HTML/CSS/JS, **Chart.js** (jsDelivr CDN)

### `elite-sales-women/`

- **UI:** Static HTML, CSS, vanilla JS

### `will-sd-eos-empire/`

- **UI:** Single static HTML page (Vercel)

### `scripts/` (dashboard)

- `snapshot_dashboard_tab.py`, `clean_sales_sheet.py` — **openpyxl**, Python 3

---

## External services (not in repo, used by your stack)

- **GoHighLevel** — CRM, pipelines, contacts, opportunities
- **Meta (Facebook) Ads** — spend, campaigns, lead results
- **Google Sheets** — optional revenue mode + local Excel scripts
- **Upstash Redis** — submission log for Sales Command Center
- **Slack** — team-agent scripts, Victoria workflows
- **Notion / ClickUp** — ops (referenced in agent docs)
- **Telegram** — bots / OpenClaw agents
- **ESA Builder** — `esabuilder.com` (client funnels, Victoria API)
- **Anthropic** — models via OpenClaw (e.g. Claude in `deploy_marcus.py` notes)
- **Fathom** — call links stored in GHL / sales forms

---

## Optional / adjacent

- **Tailscale / LAN IPs** — referenced in team-agent GHL browser automation docs
- **ElevenLabs (`sag`)** — voice TTS mentioned in workspace `AGENTS.md`

If something is missing, grep for `package.json`, `requirements.txt`, and `vercel.json` under `.openclaw/workspace` and add a row here.
