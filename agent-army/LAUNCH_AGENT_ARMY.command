#!/bin/bash
# ESA Agent Army Launcher - Double-click to deploy your 22 business agents

echo "🤖 ESA AGENT ARMY LAUNCHER"
echo "=========================="
echo "🎯 Deploying 22 business automation agents"
echo "💼 Target: $5M revenue through autonomous operations"
echo ""

cd /Users/henry/.openclaw/workspace/agent-army

echo "🚀 Starting deployment..."
echo ""

# Run the deployment
./deploy_army.sh

echo ""
echo "📊 Checking final status..."
./check_army_status.sh

echo ""
echo "🎉 AGENT ARMY DEPLOYMENT COMPLETE!"
echo "Your autonomous business is now operational."
echo ""
echo "Press any key to close this window..."
read -n 1