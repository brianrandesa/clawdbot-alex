#!/bin/bash
# ESA Agent Army Deployment Script - Master Controller

echo "🚀 DEPLOYING ESA AGENT ARMY"
echo "=========================="
echo "🎯 Target: 20+ business automation agents"
echo "💼 Business: Event Sales Agency (ESA)"
echo "🏆 Goal: $5M revenue through autonomous operations"
echo ""

cd /Users/henry/.openclaw/workspace/agent-army

# Function to spawn an agent
spawn_agent() {
    local agent_id="$1"
    local agent_name="$2" 
    local emoji="$3"
    local command="$4"
    
    if [[ "$command" == "# Already running"* ]]; then
        echo "✅ $emoji $agent_name - Already running"
        return 0
    fi
    
    echo "🚀 Starting $emoji $agent_name..."
    
    # Execute the spawn command
    eval "$command" &
    local pid=$!
    
    # Give it a moment to start
    sleep 2
    
    # Check if process is still running
    if kill -0 "$pid" 2>/dev/null; then
        echo "✅ $emoji $agent_name started successfully (PID: $pid)"
        echo "$agent_id:$pid:$(date)" >> logs/agents.pid
    else
        echo "❌ $emoji $agent_name failed to start"
    fi
}

# Clear previous PID file
echo "# ESA Agent Army - Process IDs" > logs/agents.pid
echo "# Format: agent_id:pid:timestamp" >> logs/agents.pid
echo "" >> logs/agents.pid

# Deploy agents in priority order

spawn_agent "henry" "Henry" "🦁" "openclaw sessions spawn --agent-id henry --label 'Henry CEO' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "rex" "Rex" "🐺" "openclaw sessions spawn --agent-id rex --label 'Rex Sales Manager' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "marketing_director" "Marketing Director" "📈" "openclaw sessions spawn --agent-id marketing_director --label 'Marketing Director' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "event_hunter" "Event Hunter" "🎯" "# Already running via bulletproof system"

spawn_agent "ops_director" "Operations Director" "⚙️" "openclaw sessions spawn --agent-id ops_director --label 'Operations Director' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "client_success" "Client Success Manager" "🤝" "openclaw sessions spawn --agent-id client_success --label 'Client Success Manager' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "finance_director" "Finance Director" "💰" "openclaw sessions spawn --agent-id finance_director --label 'Finance Director' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "content_creator" "Content Creator" "✍️" "openclaw sessions spawn --agent-id content_creator --label 'Content Creator' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "data_analyst" "Data Analyst" "📊" "openclaw sessions spawn --agent-id data_analyst --label 'Data Analyst' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "lead_qualifier" "Lead Qualifier" "🎯" "openclaw sessions spawn --agent-id lead_qualifier --label 'Lead Qualifier' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "social_media" "Social Media Manager" "📱" "openclaw sessions spawn --agent-id social_media --label 'Social Media Manager' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "customer_support" "Customer Support" "🎧" "openclaw sessions spawn --agent-id customer_support --label 'Customer Support' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "real_estate_specialist" "Real Estate Specialist" "🏠" "openclaw sessions spawn --agent-id real_estate_specialist --label 'Real Estate Specialist' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "business_coaching_specialist" "Business Coaching Specialist" "🎓" "openclaw sessions spawn --agent-id business_coaching_specialist --label 'Business Coaching Specialist' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "sales_training_specialist" "Sales Training Specialist" "💼" "openclaw sessions spawn --agent-id sales_training_specialist --label 'Sales Training Specialist' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "digital_marketing_specialist" "Digital Marketing Specialist" "💻" "openclaw sessions spawn --agent-id digital_marketing_specialist --label 'Digital Marketing Specialist' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "email_automation" "Email Automation" "📧" "openclaw sessions spawn --agent-id email_automation --label 'Email Automation' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "calendar_manager" "Calendar Manager" "📅" "openclaw sessions spawn --agent-id calendar_manager --label 'Calendar Manager' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "crm_manager" "CRM Manager" "🗃️" "openclaw sessions spawn --agent-id crm_manager --label 'CRM Manager' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "reporting_specialist" "Reporting Specialist" "📈" "openclaw sessions spawn --agent-id reporting_specialist --label 'Reporting Specialist' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "quality_assurance" "Quality Assurance" "🔍" "openclaw sessions spawn --agent-id quality_assurance --label 'Quality Assurance' --model anthropic/claude-sonnet-4-20250514"

spawn_agent "system_monitor" "System Monitor" "🖥️" "openclaw sessions spawn --agent-id system_monitor --label 'System Monitor' --model anthropic/claude-sonnet-4-20250514"

echo ""
echo "📊 DEPLOYMENT SUMMARY"
echo "==================="

# Count running agents
total_agents=$(wc -l < logs/agents.pid | xargs)
total_agents=$((total_agents - 3))  # Subtract header lines

echo "Total Agents Deployed: $total_agents"
echo "PID File: logs/agents.pid"
echo "Logs Directory: logs/"
echo ""

echo "🎉 ESA AGENT ARMY DEPLOYMENT COMPLETE!"
echo "📈 Your autonomous $5M business is now operational"
echo ""
echo "🔧 Management Commands:"
echo "   Status Check: ./check_army_status.sh"
echo "   Stop All: ./stop_army.sh"  
echo "   Monitor: tail -f logs/army.log"
