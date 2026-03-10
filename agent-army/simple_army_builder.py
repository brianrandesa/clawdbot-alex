#!/usr/bin/env python3
"""
Simple ESA Agent Army Builder
Creates agent configs and deployment scripts for OpenClaw
"""

import os
import json
import logging
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - ARMY-BUILDER - %(message)s'
)
logger = logging.getLogger(__name__)

class SimpleAgentBuilder:
    """Simple agent army builder for OpenClaw"""
    
    def __init__(self):
        self.base_path = Path("/Users/henry/.openclaw/workspace/agent-army")
        self.agents_config = []
        
    def create_directory_structure(self):
        """Create directory structure for all agents"""
        logger.info("📁 Creating agent directory structure...")
        
        # Create base directories
        directories = [
            self.base_path,
            self.base_path / "configs",
            self.base_path / "scripts", 
            self.base_path / "logs"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
        
        logger.info("✅ Directory structure created")
    
    def create_agent_definitions(self):
        """Create all ESA agent definitions"""
        
        # Define all 20+ ESA agents
        agents = [
            # TIER 1: CORE LEADERSHIP
            {
                "id": "henry",
                "name": "Henry", 
                "emoji": "🦁",
                "role": "CEO & Coordinator",
                "description": "Master coordinator managing all agents, strategic decisions, client relationships",
                "priority": 10,
                "skills": ["coordination", "strategy", "client_management", "problem_solving", "business_development"],
                "spawn_command": "openclaw sessions spawn --agent-id henry --label 'Henry CEO' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "rex", 
                "name": "Rex",
                "emoji": "🐺",
                "role": "Sales Manager", 
                "description": "Manages both high-ticket ESS closers and ticket sales teams, pipeline tracking",
                "priority": 10,
                "skills": ["sales_management", "pipeline_tracking", "team_coaching", "deal_closing", "crm_management"],
                "spawn_command": "openclaw sessions spawn --agent-id rex --label 'Rex Sales Manager' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "marketing_director",
                "name": "Marketing Director",
                "emoji": "📈", 
                "role": "Marketing Operations Director",
                "description": "Facebook/Google ads, funnel optimization, audience targeting, creative direction",
                "priority": 10,
                "skills": ["facebook_ads", "google_ads", "funnel_optimization", "audience_targeting", "creative_strategy"],
                "spawn_command": "openclaw sessions spawn --agent-id marketing_director --label 'Marketing Director' --model anthropic/claude-sonnet-4-20250514"
            },
            
            # TIER 2: OPERATIONS SPECIALISTS  
            {
                "id": "event_hunter",
                "name": "Event Hunter",
                "emoji": "🎯",
                "role": "Event Discovery Specialist",
                "description": "24/7 automated event discovery, qualification, prospect generation",
                "priority": 9,
                "skills": ["event_discovery", "prospect_qualification", "data_extraction", "lead_scoring"],
                "spawn_command": "# Already running via bulletproof system"
            },
            {
                "id": "ops_director", 
                "name": "Operations Director",
                "emoji": "⚙️",
                "role": "Business Operations Manager",
                "description": "Team coordination, project management, process optimization, KPI tracking", 
                "priority": 9,
                "skills": ["project_management", "team_coordination", "process_optimization", "kpi_tracking"],
                "spawn_command": "openclaw sessions spawn --agent-id ops_director --label 'Operations Director' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "client_success",
                "name": "Client Success Manager", 
                "emoji": "🤝",
                "role": "Client Relationship Manager",
                "description": "Onboarding, retention, upsells, satisfaction tracking, support coordination",
                "priority": 8,
                "skills": ["client_onboarding", "relationship_management", "upselling", "support_coordination"],
                "spawn_command": "openclaw sessions spawn --agent-id client_success --label 'Client Success Manager' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "finance_director",
                "name": "Finance Director",
                "emoji": "💰", 
                "role": "Financial Operations Manager",
                "description": "Revenue tracking, expense management, profitability analysis, financial reporting",
                "priority": 8,
                "skills": ["revenue_tracking", "expense_management", "financial_reporting", "profitability_analysis"],
                "spawn_command": "openclaw sessions spawn --agent-id finance_director --label 'Finance Director' --model anthropic/claude-sonnet-4-20250514"
            },
            
            # TIER 3: SPECIALIZED AGENTS
            {
                "id": "content_creator",
                "name": "Content Creator",
                "emoji": "✍️",
                "role": "Content & Copy Specialist", 
                "description": "Ad copy, email sequences, landing pages, social media content, VSLs",
                "priority": 7,
                "skills": ["copywriting", "email_sequences", "ad_copy", "landing_pages", "social_content"],
                "spawn_command": "openclaw sessions spawn --agent-id content_creator --label 'Content Creator' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "data_analyst",
                "name": "Data Analyst", 
                "emoji": "📊",
                "role": "Business Intelligence Analyst",
                "description": "Performance analytics, conversion tracking, ROI analysis, reporting dashboards",
                "priority": 7,
                "skills": ["data_analysis", "performance_tracking", "roi_analysis", "dashboard_creation"],
                "spawn_command": "openclaw sessions spawn --agent-id data_analyst --label 'Data Analyst' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "lead_qualifier",
                "name": "Lead Qualifier",
                "emoji": "🎯", 
                "role": "Lead Qualification Specialist", 
                "description": "Pre-call qualification, lead scoring, appointment setting, CRM management",
                "priority": 7,
                "skills": ["lead_qualification", "appointment_setting", "crm_management", "lead_scoring"],
                "spawn_command": "openclaw sessions spawn --agent-id lead_qualifier --label 'Lead Qualifier' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "social_media",
                "name": "Social Media Manager",
                "emoji": "📱",
                "role": "Social Media Strategist",
                "description": "Social media campaigns, influencer outreach, community management, brand building",
                "priority": 6,
                "skills": ["social_media_management", "community_building", "influencer_outreach", "brand_strategy"],
                "spawn_command": "openclaw sessions spawn --agent-id social_media --label 'Social Media Manager' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "customer_support", 
                "name": "Customer Support",
                "emoji": "🎧",
                "role": "Customer Support Specialist",
                "description": "Ticket resolution, customer inquiries, technical support, satisfaction surveys", 
                "priority": 6,
                "skills": ["customer_support", "ticket_resolution", "technical_support", "customer_communication"],
                "spawn_command": "openclaw sessions spawn --agent-id customer_support --label 'Customer Support' --model anthropic/claude-sonnet-4-20250514"
            },
            
            # TIER 4: INDUSTRY SPECIALISTS
            {
                "id": "real_estate_specialist",
                "name": "Real Estate Specialist", 
                "emoji": "🏠",
                "role": "Real Estate Industry Expert",
                "description": "Real estate coaching events, investor meetups, industry-specific outreach",
                "priority": 5,
                "skills": ["real_estate_industry", "investor_relations", "property_events", "rei_marketing"],
                "spawn_command": "openclaw sessions spawn --agent-id real_estate_specialist --label 'Real Estate Specialist' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "business_coaching_specialist",
                "name": "Business Coaching Specialist",
                "emoji": "🎓",
                "role": "Business Coaching Expert",
                "description": "Business coaching events, consulting conferences, entrepreneur summits", 
                "priority": 5,
                "skills": ["business_coaching", "consulting_events", "entrepreneur_summits", "coaching_industry"],
                "spawn_command": "openclaw sessions spawn --agent-id business_coaching_specialist --label 'Business Coaching Specialist' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "sales_training_specialist", 
                "name": "Sales Training Specialist",
                "emoji": "💼",
                "role": "Sales Training Expert",
                "description": "Sales bootcamps, closing workshops, sales methodology events",
                "priority": 5,
                "skills": ["sales_training", "closing_workshops", "sales_methodology", "sales_coaching"],
                "spawn_command": "openclaw sessions spawn --agent-id sales_training_specialist --label 'Sales Training Specialist' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "digital_marketing_specialist",
                "name": "Digital Marketing Specialist",
                "emoji": "💻", 
                "role": "Digital Marketing Expert",
                "description": "Digital marketing conferences, online business summits, e-commerce events",
                "priority": 5,
                "skills": ["digital_marketing", "ecommerce_events", "online_business", "digital_conferences"],
                "spawn_command": "openclaw sessions spawn --agent-id digital_marketing_specialist --label 'Digital Marketing Specialist' --model anthropic/claude-sonnet-4-20250514"
            },
            
            # TIER 5: SUPPORT & AUTOMATION
            {
                "id": "email_automation",
                "name": "Email Automation",
                "emoji": "📧",
                "role": "Email Marketing Specialist", 
                "description": "Email sequences, drip campaigns, newsletter management, automation workflows",
                "priority": 4,
                "skills": ["email_automation", "drip_campaigns", "email_sequences", "newsletter_management"],
                "spawn_command": "openclaw sessions spawn --agent-id email_automation --label 'Email Automation' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "calendar_manager",
                "name": "Calendar Manager",
                "emoji": "📅",
                "role": "Scheduling & Calendar Specialist",
                "description": "Appointment scheduling, calendar optimization, meeting coordination, availability management",
                "priority": 4, 
                "skills": ["calendar_management", "appointment_scheduling", "meeting_coordination", "availability_optimization"],
                "spawn_command": "openclaw sessions spawn --agent-id calendar_manager --label 'Calendar Manager' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "crm_manager",
                "name": "CRM Manager", 
                "emoji": "🗃️",
                "role": "CRM & Database Specialist",
                "description": "CRM maintenance, data hygiene, pipeline management, contact organization",
                "priority": 4,
                "skills": ["crm_management", "data_hygiene", "pipeline_organization", "contact_management"],
                "spawn_command": "openclaw sessions spawn --agent-id crm_manager --label 'CRM Manager' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "reporting_specialist",
                "name": "Reporting Specialist",
                "emoji": "📈",
                "role": "Business Reporting Expert", 
                "description": "Daily/weekly/monthly reports, KPI dashboards, performance summaries",
                "priority": 3,
                "skills": ["business_reporting", "kpi_dashboards", "performance_summaries", "data_visualization"],
                "spawn_command": "openclaw sessions spawn --agent-id reporting_specialist --label 'Reporting Specialist' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "quality_assurance",
                "name": "Quality Assurance",
                "emoji": "🔍", 
                "role": "Quality Control Specialist",
                "description": "Process auditing, quality checks, compliance monitoring, error detection",
                "priority": 3,
                "skills": ["quality_control", "process_auditing", "compliance_monitoring", "error_detection"],
                "spawn_command": "openclaw sessions spawn --agent-id quality_assurance --label 'Quality Assurance' --model anthropic/claude-sonnet-4-20250514"
            },
            {
                "id": "system_monitor", 
                "name": "System Monitor",
                "emoji": "🖥️",
                "role": "Technology & Infrastructure Monitor",
                "description": "System health monitoring, uptime tracking, performance optimization, tech support",
                "priority": 2,
                "skills": ["system_monitoring", "performance_optimization", "uptime_tracking", "tech_support"],
                "spawn_command": "openclaw sessions spawn --agent-id system_monitor --label 'System Monitor' --model anthropic/claude-sonnet-4-20250514"
            }
        ]
        
        self.agents_config = agents
        logger.info(f"✅ Created {len(agents)} agent definitions")
        return agents
    
    def create_agent_identity_files(self):
        """Create IDENTITY.md and SOUL.md files for each agent"""
        logger.info("📝 Creating agent identity files...")
        
        for agent in self.agents_config:
            agent_dir = self.base_path / "configs" / agent["id"]
            agent_dir.mkdir(exist_ok=True)
            
            # Create IDENTITY.md
            identity_content = f"""# IDENTITY.md

- **Name:** {agent["name"]}
- **Creature:** AI agent - {agent["role"]}
- **Vibe:** {agent["description"]}
- **Emoji:** {agent["emoji"]}
- **Priority:** {agent["priority"]}/10
"""
            
            with open(agent_dir / "IDENTITY.md", "w") as f:
                f.write(identity_content)
            
            # Create SOUL.md
            soul_content = f"""# SOUL.md - Who You Are

## Primary Function
**{agent["role"]}** - {agent["description"]}

## Core Skills
{', '.join(agent["skills"])}

## ESA Business Context
- Company: Event Sales Agency (ESA)
- Revenue Goal: $5M in 2026
- Target Market: Business coaches with $2M-10M revenue
- Core Offer: Event Sales System (ESS) - $15K average deal
- Location: Miami, FL
- Founder: Brian Rand

## Team Structure
- Report to: Henry 🦁 (CEO & Coordinator)
- Work with: Other ESA agents as needed
- Priority: {agent["priority"]}/10 (higher = more critical)

## Communication Style
- Be direct and results-focused
- Think in terms of business impact
- Coordinate with other agents when needed
- Always consider the $5M revenue goal
- Prioritize efficiency and measurable outcomes

## Success Metrics
- Focus on measurable business results
- Contribute to ESA's growth objectives
- Maintain high standards of quality
- Support the autonomous business vision
- Help achieve 500+ qualified prospects monthly

## Agent Responsibilities
Your specific role in the ESA ecosystem:
{agent["description"]}

Remember: You're part of a 20+ agent autonomous business system. Every action should contribute to ESA's success and Brian's $5M revenue goal.
"""
            
            with open(agent_dir / "SOUL.md", "w") as f:
                f.write(soul_content)
        
        logger.info("✅ Agent identity files created")
    
    def create_deployment_scripts(self):
        """Create deployment scripts for the agent army"""
        logger.info("📜 Creating deployment scripts...")
        
        # Create master deployment script
        deploy_script = f'''#!/bin/bash
# ESA Agent Army Deployment Script - Master Controller

echo "🚀 DEPLOYING ESA AGENT ARMY"
echo "=========================="
echo "🎯 Target: 20+ business automation agents"
echo "💼 Business: Event Sales Agency (ESA)"
echo "🏆 Goal: $5M revenue through autonomous operations"
echo ""

cd {self.base_path}

# Function to spawn an agent
spawn_agent() {{
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
}}

# Clear previous PID file
echo "# ESA Agent Army - Process IDs" > logs/agents.pid
echo "# Format: agent_id:pid:timestamp" >> logs/agents.pid
echo "" >> logs/agents.pid

# Deploy agents in priority order
'''
        
        # Add each agent to the deployment script
        sorted_agents = sorted(self.agents_config, key=lambda x: x["priority"], reverse=True)
        
        for agent in sorted_agents:
            command = agent["spawn_command"]
            deploy_script += f'''
spawn_agent "{agent["id"]}" "{agent["name"]}" "{agent["emoji"]}" "{command}"
'''
        
        deploy_script += '''
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
'''
        
        with open(self.base_path / "deploy_army.sh", "w") as f:
            f.write(deploy_script)
        os.chmod(self.base_path / "deploy_army.sh", 0o755)
        
        # Create status checker
        status_script = f'''#!/bin/bash
# ESA Agent Army Status Checker

echo "📊 ESA AGENT ARMY STATUS"
echo "========================"

cd {self.base_path}

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
'''
        
        with open(self.base_path / "check_army_status.sh", "w") as f:
            f.write(status_script)
        os.chmod(self.base_path / "check_army_status.sh", 0o755)
        
        # Create stop script
        stop_script = f'''#!/bin/bash
# Stop ESA Agent Army

echo "🛑 STOPPING ESA AGENT ARMY"
echo "========================="

cd {self.base_path}

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
'''
        
        with open(self.base_path / "stop_army.sh", "w") as f:
            f.write(stop_script)
        os.chmod(self.base_path / "stop_army.sh", 0o755)
        
        logger.info("✅ Deployment scripts created")
    
    def create_army_summary(self):
        """Create a comprehensive army summary"""
        summary = {
            "army_name": "ESA Agent Army",
            "total_agents": len(self.agents_config),
            "creation_date": datetime.now().isoformat(),
            "business_context": {
                "company": "Event Sales Agency (ESA)",
                "revenue_goal": "$5M in 2026", 
                "target_market": "Business coaches with $2M-10M revenue",
                "core_offer": "Event Sales System (ESS) - $15K average",
                "location": "Miami, FL",
                "founder": "Brian Rand"
            },
            "agent_tiers": {
                "tier_1_leadership": [a for a in self.agents_config if a["priority"] >= 9],
                "tier_2_operations": [a for a in self.agents_config if 7 <= a["priority"] < 9],
                "tier_3_specialists": [a for a in self.agents_config if 5 <= a["priority"] < 7], 
                "tier_4_industry": [a for a in self.agents_config if 3 <= a["priority"] < 5],
                "tier_5_support": [a for a in self.agents_config if a["priority"] < 3]
            },
            "deployment_info": {
                "base_path": str(self.base_path),
                "deploy_command": "./deploy_army.sh",
                "status_command": "./check_army_status.sh",
                "stop_command": "./stop_army.sh"
            }
        }
        
        with open(self.base_path / "army_summary.json", "w") as f:
            json.dump(summary, f, indent=2)
        
        # Create human-readable summary
        readme_content = f"""# ESA Agent Army

## 🚀 Complete Business Automation System

**Total Agents:** {len(self.agents_config)}  
**Business Goal:** $5M revenue in 2026  
**Target Market:** Business coaches with $2M-10M revenue  

## 🎯 Agent Tiers

### Tier 1: Leadership (Priority 9-10)
{chr(10).join(f"- {a['emoji']} **{a['name']}** - {a['role']}" for a in self.agents_config if a['priority'] >= 9)}

### Tier 2: Operations (Priority 7-8) 
{chr(10).join(f"- {a['emoji']} **{a['name']}** - {a['role']}" for a in self.agents_config if 7 <= a['priority'] < 9)}

### Tier 3: Specialists (Priority 5-6)
{chr(10).join(f"- {a['emoji']} **{a['name']}** - {a['role']}" for a in self.agents_config if 5 <= a['priority'] < 7)}

### Tier 4: Industry Experts (Priority 3-4)
{chr(10).join(f"- {a['emoji']} **{a['name']}** - {a['role']}" for a in self.agents_config if 3 <= a['priority'] < 5)}

### Tier 5: Support & Automation (Priority 1-2)
{chr(10).join(f"- {a['emoji']} **{a['name']}** - {a['role']}" for a in self.agents_config if a['priority'] < 3)}

## 🛠️ Deployment Commands

**Deploy Army:** `./deploy_army.sh`  
**Check Status:** `./check_army_status.sh`  
**Stop Army:** `./stop_army.sh`  

## 📊 Business Impact

This autonomous agent army will:
- Generate 500+ qualified prospects monthly
- Manage complete sales pipeline 
- Handle all marketing operations
- Provide 24/7 customer support
- Optimize business processes continuously
- Scale operations toward $5M revenue goal

## 🎉 Ready for Autonomous Operations

Your ESA Agent Army is ready to deploy and run your business autonomously while you focus on high-level strategy and closing deals.
"""
        
        with open(self.base_path / "README.md", "w") as f:
            f.write(readme_content)
        
        logger.info("✅ Army summary and documentation created")
    
    def build_complete_army(self):
        """Build the complete ESA agent army"""
        logger.info("🚀 BUILDING COMPLETE ESA AGENT ARMY")
        logger.info("=" * 50)
        
        # Step 1: Create infrastructure
        self.create_directory_structure()
        
        # Step 2: Define all agents
        agents = self.create_agent_definitions()
        
        # Step 3: Create agent identity files
        self.create_agent_identity_files()
        
        # Step 4: Create deployment scripts
        self.create_deployment_scripts()
        
        # Step 5: Create summary documentation
        self.create_army_summary()
        
        logger.info("✅ ESA AGENT ARMY BUILD COMPLETE!")
        logger.info(f"📊 Total agents: {len(agents)}")
        logger.info(f"📁 Base path: {self.base_path}")
        logger.info("🚀 Ready for deployment!")
        
        return True

def main():
    """Main builder function"""
    print("🤖 ESA AGENT ARMY BUILDER")
    print("=" * 40)
    
    builder = SimpleAgentBuilder()
    success = builder.build_complete_army()
    
    if success:
        print("\n🎉 AGENT ARMY BUILD SUCCESSFUL!")
        print(f"📁 Location: {builder.base_path}")
        print("🚀 Next step: Run ./deploy_army.sh to deploy all agents")
        print("📊 Use ./check_army_status.sh to monitor your army")
    else:
        print("❌ Build failed - check logs")

if __name__ == "__main__":
    main()