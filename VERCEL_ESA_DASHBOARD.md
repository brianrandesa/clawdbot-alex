# ESA Sales Command Center on Vercel

If **`esa-marketing-sales-dashboard.vercel.app`** is missing **Submissions → CSV import**, the project is almost certainly not building from **`esa-marketing-sales-dashboard/`** in this repo (or not from the latest commit).

## Fix in Vercel (2 minutes)

1. **Project → Settings → General → Root Directory**  
   Set to: **`esa-marketing-sales-dashboard`**  
   (Not repo root, not blank.)

2. **Settings → Git → Production Branch**  
   Must match the branch you push to (often **`main`**).

3. **Deployments → … on latest → Redeploy** (or push a new commit).

4. **View Page Source** on the live site and search for **`esa-dashboard-build`**.  
   If it’s missing, that URL is still an old build or a different project.

## Push from this workspace

```bash
git checkout main
git pull origin main
# merge your feature branch if needed, then:
git push origin main
```

After deploy, open **`https://YOUR_DOMAIN/#submissions`** — the import card should be at the top of the tab.
