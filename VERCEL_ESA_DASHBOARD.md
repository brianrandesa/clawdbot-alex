# ESA Sales Command Center on Vercel

## Proof your live site is NOT this repo (checked 2026-03-21)

We fetched **`https://esa-marketing-sales-dashboard.vercel.app/`** raw HTML:

| Signal | Live site (broken) | This repo `main` (`clawdbot-alex`) |
|--------|----------------------|-------------------------------------|
| Stylesheet query | `styles.css?v=20260326` | `styles.css?v=984b9fd` (after next push) |
| Meta `esa-dashboard-build` | **missing** | `clawdbot-984b9fd-submissions-import` |
| Submissions blurb | “Every deal logged from the **Sales** tab…” | “**spreadsheet on the site**” + import card |

So **`esa-marketing-sales-dashboard.vercel.app` is not deploying from `github.com/brianrandesa/clawdbot-alex`** (or not from `esa-marketing-sales-dashboard/` inside it). Pushing `main` here will **never** update that URL until the Vercel project is fixed.

## Fix (pick one)

### A) Point the existing project at this monorepo (recommended)

1. Vercel → ** esa-marketing-sales-dashboard** project → **Settings → Git**.
2. Note which **repository** is connected. If it is **not** `brianrandesa/clawdbot-alex`, that is the bug.
3. **Disconnect** (or use **Transfer / Import** flow) and **Connect** to **`brianrandesa/clawdbot-alex`**.
4. **Settings → General → Root Directory** = **`esa-marketing-sales-dashboard`** (exact folder name).
5. **Production Branch** = **`main`** (or whatever you push to).
6. **Deployments → Redeploy** the latest production deployment.

### B) New project (fastest sanity check)

1. Vercel → **Add New… → Project** → Import **`brianrandesa/clawdbot-alex`**.
2. **Root Directory** → **Edit** → **`esa-marketing-sales-dashboard`**.
3. Deploy. Open the **new** `*.vercel.app` URL → **View Source** → search **`esa-dashboard-build`**.  
4. If it appears, attach your custom domain to this new project or delete the old one.

## After a correct deploy

- **View Page Source** → search **`esa-dashboard-build`** → should see `clawdbot-984b9fd-submissions-import`.
- Search **`submissions-import-file`** → must exist.
- Open **`https://YOUR_URL/#submissions`** → **Upload · import CSV** at top of tab.

## Push from this workspace (only helps after Git is wired correctly)

```bash
git checkout main && git pull origin main && git push origin main
```

Commit **`984b9fd`** and follow-up commits live on **`main`** in `clawdbot-alex`; they do not affect Vercel until the project builds **that** repo at **that** path.
