# Vercel deploy checklist (Sales Command Center)

## Why production can look “stale”

GitHub **production branch** (often `main`) must contain the dashboard commits. Features merged only to another branch (e.g. `victoria-voice-comms`) will **not** show on the live site until that branch is merged into what Vercel builds.

## Project settings

1. **Root Directory:** `esa-marketing-sales-dashboard`  
   The API routes live under this folder (`api/*.js`). The monorepo root has **no** `/api` folder; wrong root breaks all serverless routes.

2. **Production Branch:** Usually `main`. After merging feature work into `main`, push and wait for the Vercel deployment to finish.

3. **Install:** `package.json` in this folder includes `ioredis`. Redeploy after env changes so dependencies install.

## Verify the new UI loaded

- **View page source** (not Inspect) and search for `Import CSV` or `spreadsheet on the site`.
- Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows).

## Env vars (Submissions + import)

- Redis: `REDIS_URL` and/or Upstash REST vars  
- Team password: `DEAL_UPLOAD_SECRET` (same for Sales form and CSV import)
