# Vercel deploy checklist (Sales Command Center)

## Prove the right build is live

1. Open your live site → **View Page Source** (not Inspect).
2. Search for **`esa-dashboard-build`** — you should see  
   `<meta name="esa-dashboard-build" content="submissions-import-ui-20260321">`
3. Search for **`submissions-import-file`** — the CSV `<input type="file" ...>` must be present on **Submissions**.

If either is missing, Vercel is **not** deploying this folder from the commit you think (wrong repo, wrong root directory, wrong branch, or an old deployment pinned as production).

## Why production can look “stale”

GitHub **production branch** (often `main`) must contain the dashboard commits. Features merged only to another branch (e.g. `victoria-voice-comms`) will **not** show on the live site until that branch is merged into what Vercel builds.

## Project settings

1. **Root Directory:** `esa-marketing-sales-dashboard`  
   The API routes live under this folder (`api/*.js`). The monorepo root has **no** `/api` folder; wrong root breaks all serverless routes.

2. **Production Branch:** Usually `main`. After merging feature work into `main`, push and wait for the Vercel deployment to finish.

3. **Install:** `package.json` in this folder includes `ioredis`. Redeploy after env changes so dependencies install.

## Verify the new UI loaded

- **View page source** (not Inspect) and search for `Upload · import CSV` or `submissions-import-card`. If those strings are missing, production is still an old build (wrong branch, wrong root, or deploy not finished).
- Open **`#submissions`** on your site URL (e.g. `https://yoursite.vercel.app/#submissions`) to jump straight to the Submissions tab.
- Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows).

## Env vars (Submissions + import)

- Redis: `REDIS_URL` and/or Upstash REST vars  
- Team password: `DEAL_UPLOAD_SECRET` (same for Sales form and CSV import)
