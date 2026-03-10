#!/bin/bash
# Stop ESA Agent Army

echo "🛑 STOPPING ESA AGENT ARMY"
echo "========================="

cd /Users/henry/.openclaw/workspace/agent-army

if [ ! -f "logs/agents.pid" ]; then
    echo "❌ No agents.pid file found"
    exit 1
fi

stopped=0

while IFS=: read -r agent_id pid timestamp; do
    # Skip comments and empty lines
    [[ "$agent_id" =~ ^#.*$ ]] && continue
    [[ -z "$agent_id" ]] && continue
    
    echo "🛑 Stopping $agent_id (PID: $pid)..."
    
    if kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null
        stopped=$((stopped + 1))
        echo "✅ $agent_id stopped"
    else
        echo "⚠️  $agent_id was already stopped"
    fi
done < logs/agents.pid

echo ""
echo "📊 SUMMARY: $stopped agents stopped"
echo "👋 ESA Agent Army shutdown complete"

# Clean up PID file
rm -f logs/agents.pid
