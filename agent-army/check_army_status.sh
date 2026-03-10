#!/bin/bash
# ESA Agent Army Status Checker

echo "📊 ESA AGENT ARMY STATUS"
echo "========================"

cd /Users/henry/.openclaw/workspace/agent-army

if [ ! -f "logs/agents.pid" ]; then
    echo "❌ No agents.pid file found - army may not be deployed"
    exit 1
fi

echo "🤖 AGENT STATUS:"
echo ""

total=0
running=0

while IFS=: read -r agent_id pid timestamp; do
    # Skip comments and empty lines
    [[ "$agent_id" =~ ^#.*$ ]] && continue
    [[ -z "$agent_id" ]] && continue
    
    total=$((total + 1))
    
    # Check if process is running
    if kill -0 "$pid" 2>/dev/null; then
        echo "✅ $agent_id (PID: $pid) - RUNNING"
        running=$((running + 1))
    else
        echo "❌ $agent_id (PID: $pid) - STOPPED"
    fi
done < logs/agents.pid

echo ""
echo "📈 SUMMARY:"
echo "   Total Agents: $total"
echo "   Running: $running"
echo "   Stopped: $((total - running))"
echo "   Success Rate: $(echo "scale=1; $running * 100 / $total" | bc -l)%"
echo ""

if [ $running -eq $total ]; then
    echo "🎉 All agents operational! Your autonomous business is running perfectly."
else
    echo "⚠️  Some agents are down. Consider running ./deploy_army.sh to restart them."
fi
