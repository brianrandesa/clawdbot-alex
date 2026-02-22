#!/bin/bash
# Deploy script for Will's SD EOS Empire

echo "🚀 Creating GitHub repo: will-sd-eos-empire"
echo "📁 All files ready in: /Users/henry/.openclaw/workspace/sd-eos-prospects"

# Create repo via GitHub API (you'll need to run this manually)
echo ""
echo "🔥 MANUAL STEPS TO DEPLOY:"
echo "1. Go to: https://github.com/new"
echo "2. Repo name: will-sd-eos-empire"  
echo "3. Make it PUBLIC"
echo "4. DON'T initialize with README"
echo "5. Click CREATE"
echo ""
echo "Then run:"
echo "cd /Users/henry/.openclaw/workspace/sd-eos-prospects"
echo "git remote set-url origin https://github.com/brianrandesa/will-sd-eos-empire.git"
echo "git push -u origin main"
echo ""
echo "🎯 Live site will be at: https://brianrandesa.github.io/will-sd-eos-empire"
echo ""
echo "📱 Files ready to deploy:"
ls -la