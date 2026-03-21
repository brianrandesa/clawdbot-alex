# After deploy: verify CSV import (5 min)

Use the **exact production URL** from Vercel **Deployments → Visit** or **Settings → Domains**.  
If `https://esa-marketing-sales-dashboard.vercel.app` returns 404, the project’s assigned domain may differ; always use the URL Vercel shows.

## 1. HTML markers (same as View Page Source)

Replace `YOUR_URL` (no trailing slash required):

```bash
curl -sS "YOUR_URL" | grep -E 'esa-dashboard-build|submissions-import-file' || echo "MISSING — wrong URL, cache, or old build"
```

You should see:

- `esa-dashboard-build` in a `<meta>` tag
- `id="submissions-import-file"` on the file input

## 2. In the browser

1. Open **YOUR_URL** in a fresh tab or incognito.
2. **Submissions** tab, or **`YOUR_URL/#submissions`**.
3. At the top: **Upload · import CSV** (file, password, button).

## 3. If the button works but import fails

| Check | Where |
|--------|--------|
| `DEAL_UPLOAD_SECRET` | Vercel → Settings → Environment Variables (Production) |
| Redis / KV | Vercel → Storage, or `REDIS_URL` / `UPSTASH_REDIS_REST_*` / `KV_REST_*` |
| Redeploy | After changing env vars |

API: `POST /api/deal-import-csv` (see [SUBMISSIONS_IMPORT_CSV.md](SUBMISSIONS_IMPORT_CSV.md)).
