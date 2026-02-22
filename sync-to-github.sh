#!/bin/bash
# Auto-sync Henry workspace to GitHub

cd /Users/jedidiahenderson/.openclaw/workspace

# Check if there are changes
if [[ -z $(git status -s) ]]; then
  echo "No changes to sync"
  exit 0
fi

# Stage all changes
git add .

# Create commit with timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S %Z")
git commit -m "Auto-sync: $TIMESTAMP

Updated files:
$(git status --short | head -10)
"

# Push to GitHub
git push origin main

echo "✅ Synced to GitHub at $TIMESTAMP"
