#!/bin/bash
# ESA Agent Army Status Checker - Double-click to see agent status

echo "📊 ESA AGENT ARMY STATUS CHECK"
echo "=============================="

cd /Users/henry/.openclaw/workspace/agent-army

./check_army_status.sh

echo ""
echo "Press any key to close this window..."
read -n 1