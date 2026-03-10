#!/bin/bash
# Working ESA Agent Army Deployment

echo "🤖 DEPLOYING ESA AGENT ARMY"
echo "=========================="
echo "🎯 Creating your autonomous business system"
echo ""

cd /Users/henry/.openclaw/workspace/agent-army

# Create logs directory
mkdir -p logs

echo "📋 Current OpenClaw sessions:"
openclaw sessions list

echo ""
echo "🚀 Starting core business agents..."

# Start with spawning a few key agents that can actually work
echo "🦁 Henry (CEO) - Already running as main session"

echo "🐺 Starting Rex (Sales Manager)..."
openclaw sessions spawn --task "You are Rex 🐺, the Sales Manager for ESA. Your job is to manage the sales pipeline, coach the team, and track deals. You work directly with Henry to optimize sales operations. Focus on the goal of hitting $5M revenue." --label "Rex Sales Manager" &
REX_PID=$!

sleep 3

echo "📈 Starting Marketing Director..."
openclaw sessions spawn --task "You are the Marketing Director 📈 for ESA. Your job is to optimize Facebook/Google ads, manage funnels, and drive qualified leads. You work with Henry to achieve 4:1 ROAS and generate 500+ prospects monthly." --label "Marketing Director" &
MARKETING_PID=$!

sleep 3

echo "⚙️ Starting Operations Director..."
openclaw sessions spawn --task "You are the Operations Director ⚙️ for ESA. Your job is to optimize processes, manage projects, and coordinate the team. You work with Henry to streamline operations toward the $5M goal." --label "Operations Director" &
OPS_PID=$!

sleep 3

echo "🤝 Starting Client Success Manager..."
openclaw sessions spawn --task "You are the Client Success Manager 🤝 for ESA. Your job is to onboard clients, ensure satisfaction, identify upsells, and prevent churn. You work with Henry to maximize client lifetime value." --label "Client Success Manager" &
CLIENT_PID=$!

sleep 3

echo "💰 Starting Finance Director..."
openclaw sessions spawn --task "You are the Finance Director 💰 for ESA. Your job is to track revenue, manage expenses, analyze profitability, and provide financial reporting. You work with Henry to ensure financial health toward $5M." --label "Finance Director" &
FINANCE_PID=$!

sleep 3

echo "✍️ Starting Content Creator..."
openclaw sessions spawn --task "You are the Content Creator ✍️ for ESA. Your job is to write ad copy, email sequences, landing pages, and social content. You work with the Marketing Director to create high-converting content." --label "Content Creator" &
CONTENT_PID=$!

sleep 3

echo "📊 Starting Data Analyst..."
openclaw sessions spawn --task "You are the Data Analyst 📊 for ESA. Your job is to analyze performance, track conversions, create dashboards, and provide insights. You work with Henry to optimize based on data." --label "Data Analyst" &
DATA_PID=$!

sleep 5

echo ""
echo "📊 DEPLOYMENT SUMMARY"
echo "==================="

# Check what sessions are now running
echo "🔍 Checking active sessions..."
openclaw sessions list

echo ""
echo "🎯 Core agents deployed:"
echo "   🦁 Henry (CEO) - Main session"
echo "   🐺 Rex (Sales Manager) - PID $REX_PID"
echo "   📈 Marketing Director - PID $MARKETING_PID"
echo "   ⚙️ Operations Director - PID $OPS_PID"
echo "   🤝 Client Success Manager - PID $CLIENT_PID"
echo "   💰 Finance Director - PID $FINANCE_PID"
echo "   ✍️ Content Creator - PID $CONTENT_PID"
echo "   📊 Data Analyst - PID $DATA_PID"
echo ""

echo "🎉 ESA AGENT CORE TEAM DEPLOYED!"
echo "📈 Your key business functions are now autonomous"
echo ""

echo "📋 To interact with your agents:"
echo "   List all: openclaw sessions list"
echo "   Send message: openclaw sessions send --label 'Agent Name' --message 'Your message'"
echo ""

echo "🎯 Next steps:"
echo "   1. Test communication with your agents"
echo "   2. Set up coordination protocols"
echo "   3. Deploy additional specialist agents as needed"
echo ""

# Save deployment info
echo "# ESA Agent Deployment - $(date)" > logs/deployment.log
echo "Core agents deployed successfully" >> logs/deployment.log
echo "Rex PID: $REX_PID" >> logs/deployment.log
echo "Marketing PID: $MARKETING_PID" >> logs/deployment.log
echo "Operations PID: $OPS_PID" >> logs/deployment.log
echo "Client Success PID: $CLIENT_PID" >> logs/deployment.log
echo "Finance PID: $FINANCE_PID" >> logs/deployment.log
echo "Content PID: $CONTENT_PID" >> logs/deployment.log
echo "Data Analyst PID: $DATA_PID" >> logs/deployment.log

echo "💾 Deployment logged to: logs/deployment.log"