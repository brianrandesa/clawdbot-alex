#!/usr/bin/env python3
"""
ESA Agent Army Deployment System
Complete deployment and management of 20+ business agents
"""

import asyncio
import os
import json
import shutil
from datetime import datetime
from pathlib import Path
import subprocess
import logging

from agent_framework import army, AgentArmy
from esa_agents import create_esa_agent_army

logger = logging.getLogger(__name__)

class ESAAgentDeployer:
    """Handles complete deployment of ESA agent army"""
    
    def __init__(self):
        self.base_path = Path("/Users/henry/.openclaw/workspace/agent-army")
        self.deployed_agents = {}
        
    def create_directory_structure(self):
        """Create directory structure for all agents"""
        logger.info("📁 Creating agent directory structure...")
        
        # Create base directories
        directories = [
            self.base_path,
            self.base_path / "logs",
            self.base_path / "configs", 
            self.base_path / "shared",
            self.base_path / "templates"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
        
        # Create individual agent directories
        agent_ids = [
            "henry", "rex", "marketing_director", "event_hunter", "ops_director",
            "client_success", "finance_director", "content_creator", "data_analyst",
            "lead_qualifier", "social_media", "customer_support", "real_estate_specialist",
            "business_coaching_specialist", "sales_training_specialist", "digital_marketing_specialist",
            "email_automation", "calendar_manager", "crm_manager", "reporting_specialist",
            "quality_assurance", "system_monitor"
        ]
        
        for agent_id in agent_ids:
            agent_dir = self.base_path / agent_id
            agent_dir.mkdir(exist_ok=True)
            
            # Create agent subdirectories
            (agent_dir / "memory").mkdir(exist_ok=True)
            (agent_dir / "logs").mkdir(exist_ok=True)
            (agent_dir / "configs").mkdir(exist_ok=True)
            (agent_dir / "scripts").mkdir(exist_ok=True)
        
        logger.info("✅ Directory structure created")
    
    def create_agent_configs(self):
        """Create individual configuration files for each agent"""
        logger.info("⚙️ Creating agent configuration files...")
        
        # Create shared configuration template
        shared_config = {
            "openclaw_version": "latest",
            "model": "anthropic/claude-sonnet-4-20250514",
            "workspace": str(self.base_path),
            "memory_system": "enhanced",
            "tools_enabled": True,
            "heartbeat_interval": 300,
            "auto_restart": True
        }
        
        with open(self.base_path / "configs" / "shared_config.json", "w") as f:
            json.dump(shared_config, f, indent=2)
        
        # Create individual agent SOUL.md files
        agent_personalities = {
            "henry": {
                "name": "Henry",
                "emoji": "🦁",
                "personality": "Sharp, loyal CEO who gets stuff done. Strategic thinker with warm but direct communication style.",
                "role": "Coordinate all agents, make strategic decisions, handle client relationships",
                "traits": ["leadership", "strategy", "decisiveness", "loyalty", "efficiency"]
            },
            "rex": {
                "name": "Rex", 
                "emoji": "🐺",
                "personality": "Alpha sales leader. Competitive, driven, protective of his team. High energy closer.",
                "role": "Manage all sales teams, track pipeline, coach closers, optimize conversion rates",
                "traits": ["competitive", "protective", "high_energy", "results_driven", "team_focused"]
            },
            "marketing_director": {
                "name": "Marketing Director",
                "emoji": "📈", 
                "personality": "Data-driven creative strategist. Obsessed with ROI and conversion optimization.",
                "role": "Manage all paid advertising, optimize funnels, audience targeting, creative strategy",
                "traits": ["analytical", "creative", "roi_focused", "strategic", "optimization_obsessed"]
            },
            "ops_director": {
                "name": "Operations Director",
                "emoji": "⚙️",
                "personality": "Process optimization expert. Systems thinker who eliminates inefficiencies.",
                "role": "Streamline operations, manage projects, optimize workflows, track KPIs",
                "traits": ["systematic", "efficient", "detail_oriented", "problem_solver", "process_focused"]
            },
            "client_success": {
                "name": "Client Success Manager", 
                "emoji": "🤝",
                "personality": "Relationship builder focused on client satisfaction and retention.",
                "role": "Onboard clients, ensure satisfaction, identify upsell opportunities, prevent churn",
                "traits": ["empathetic", "relationship_focused", "proactive", "service_oriented", "retention_minded"]
            }
        }
        
        # Create SOUL.md files for key agents
        for agent_id, personality in agent_personalities.items():
            soul_content = f"""# SOUL.md - {personality['name']} {personality['emoji']}

## Primary Function
{personality['role']}

## Personality
{personality['personality']}

## Core Traits
{', '.join(personality['traits'])}

## Communication Style
- Be {personality['traits'][0]} and {personality['traits'][1]}
- Always think in terms of {personality['role'].lower()}
- Coordinate with other agents when needed
- Report important updates to Henry

## Success Metrics
- Focus on measurable business outcomes
- Prioritize efficiency and results
- Maintain high standards of quality
- Contribute to $5M revenue goal

## Agent Network
- Report to Henry (CEO) for strategic decisions
- Collaborate with other agents as needed
- Maintain awareness of overall business objectives
- Support the autonomous business vision
"""
            
            agent_dir = self.base_path / agent_id
            with open(agent_dir / "SOUL.md", "w") as f:
                f.write(soul_content)
        
        logger.info("✅ Agent configurations created")
    
    def create_shared_resources(self):
        """Create shared resources and tools"""
        logger.info("🛠️ Creating shared resources...")
        
        # Create shared business context
        business_context = {
            "company": "Event Sales Agency (ESA)",
            "revenue_goal": 5000000,
            "target_market": "Business coaches with $2M-10M revenue",
            "core_offer": "Event Sales System (ESS) - $15K average",
            "team_size": 13,
            "location": "Miami, FL",
            "founder": "Brian Rand",
            "key_metrics": {
                "close_rate_target": "15%",
                "lead_cost_target": "$25",
                "roas_target": "4:1",
                "prospects_monthly": 2000
            },
            "tech_stack": {
                "crm": "GoHighLevel",
                "ads": "Facebook/Google",
                "email": "GoHighLevel", 
                "calendar": "Calendly",
                "tracking": "Stape"
            }
        }
        
        with open(self.base_path / "shared" / "business_context.json", "w") as f:
            json.dump(business_context, f, indent=2)
        
        # Create agent communication protocols
        comm_protocols = {
            "escalation_rules": {
                "critical_issues": "Immediately notify Henry",
                "client_complaints": "Notify Client Success Manager and Henry",
                "system_failures": "Notify System Monitor and Henry",
                "revenue_opportunities": "Notify Rex and Henry"
            },
            "reporting_schedule": {
                "daily": ["lead_counts", "revenue", "system_status"],
                "weekly": ["performance_summary", "goal_progress"],
                "monthly": ["comprehensive_review", "optimization_recommendations"]
            },
            "inter_agent_apis": {
                "lead_handoff": "/api/v1/lead/handoff",
                "status_update": "/api/v1/status/update",
                "task_assignment": "/api/v1/task/assign"
            }
        }
        
        with open(self.base_path / "shared" / "communication_protocols.json", "w") as f:
            json.dump(comm_protocols, f, indent=2)
        
        logger.info("✅ Shared resources created")
    
    def create_deployment_scripts(self):
        """Create deployment and management scripts"""
        logger.info("📜 Creating deployment scripts...")
        
        # Create master deployment script
        deploy_script = '''#!/bin/bash
# ESA Agent Army Deployment Script

echo "🚀 DEPLOYING ESA AGENT ARMY"
echo "=========================="

cd /Users/henry/.openclaw/workspace/agent-army

# Activate OpenClaw environment if needed
export PATH="/opt/homebrew/bin:$PATH"

# Start master controller
echo "🎯 Starting Agent Army Controller..."
python3 deploy_army.py --deploy

# Monitor deployment
echo "👁️ Monitoring deployment..."
python3 deploy_army.py --monitor

echo "✅ ESA Agent Army deployed successfully!"
echo "📊 Use 'python3 deploy_army.py --status' to check agent status"
'''
        
        with open(self.base_path / "deploy.sh", "w") as f:
            f.write(deploy_script)
        os.chmod(self.base_path / "deploy.sh", 0o755)
        
        # Create status checker script
        status_script = '''#!/bin/bash
# Agent Army Status Checker

cd /Users/henry/.openclaw/workspace/agent-army
python3 deploy_army.py --status
'''
        
        with open(self.base_path / "status.sh", "w") as f:
            f.write(status_script)
        os.chmod(self.base_path / "status.sh", 0o755)
        
        # Create emergency stop script
        stop_script = '''#!/bin/bash
# Emergency Agent Army Stop

echo "🛑 STOPPING ALL AGENTS"
cd /Users/henry/.openclaw/workspace/agent-army
python3 deploy_army.py --stop-all

echo "👋 All agents stopped"
'''
        
        with open(self.base_path / "stop_all.sh", "w") as f:
            f.write(stop_script)
        os.chmod(self.base_path / "stop_all.sh", 0o755)
        
        logger.info("✅ Deployment scripts created")
    
    async def deploy_complete_army(self):
        """Deploy the complete ESA agent army"""
        logger.info("🚀 STARTING COMPLETE ESA AGENT ARMY DEPLOYMENT")
        
        # Step 1: Create infrastructure
        self.create_directory_structure()
        self.create_agent_configs()
        self.create_shared_resources()
        self.create_deployment_scripts()
        
        # Step 2: Register all agents
        agent_count = create_esa_agent_army()
        logger.info(f"📊 Registered {agent_count} agents")
        
        # Step 3: Save army configuration
        army.save_army_config(str(self.base_path / "configs" / "army_config.json"))
        
        # Step 4: Deploy agents in priority order
        logger.info("🎯 Deploying agents by priority...")
        
        success = await army.start_army(priority_order=True)
        
        if success:
            logger.info("✅ ESA AGENT ARMY FULLY OPERATIONAL!")
            
            # Create status summary
            status = army.get_army_status()
            logger.info(f"📊 Army Status: {status['running_agents']}/{status['total_agents']} agents running")
            logger.info(f"💾 Total Memory: {status['total_memory_mb']:.1f} MB")
            logger.info(f"🖥️ Total CPU: {status['total_cpu_percent']:.1f}%")
            
            return True
        else:
            logger.error("❌ Agent deployment failed")
            return False
    
    def get_deployment_status(self):
        """Get comprehensive deployment status"""
        status = army.get_army_status()
        
        # Add deployment-specific information
        status['deployment_info'] = {
            'base_path': str(self.base_path),
            'deployment_time': datetime.now().isoformat(),
            'total_directories': len(list(self.base_path.rglob("*"))) if self.base_path.exists() else 0,
            'config_files': len(list((self.base_path / "configs").glob("*.json"))) if (self.base_path / "configs").exists() else 0
        }
        
        return status

async def main():
    """Main deployment function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="ESA Agent Army Deployment System")
    parser.add_argument("--deploy", action="store_true", help="Deploy the complete agent army")
    parser.add_argument("--status", action="store_true", help="Show army status")
    parser.add_argument("--stop-all", action="store_true", help="Stop all agents")
    parser.add_argument("--monitor", action="store_true", help="Monitor army continuously")
    
    args = parser.parse_args()
    
    deployer = ESAAgentDeployer()
    
    if args.deploy:
        print("🚀 DEPLOYING ESA AGENT ARMY")
        print("=" * 50)
        success = await deployer.deploy_complete_army()
        if success:
            print("🎉 DEPLOYMENT COMPLETE!")
            print("📊 Your autonomous business is now operational")
        else:
            print("❌ Deployment failed - check logs")
    
    elif args.status:
        status = deployer.get_deployment_status()
        print("📊 ESA AGENT ARMY STATUS")
        print("=" * 30)
        print(f"Total Agents: {status['total_agents']}")
        print(f"Running: {status['running_agents']}")
        print(f"Stopped: {status['stopped_agents']}")
        print(f"Memory Usage: {status['total_memory_mb']:.1f} MB")
        print(f"CPU Usage: {status['total_cpu_percent']:.1f}%")
        print(f"Uptime: {status['uptime']}")
        
        print("\n🤖 AGENT STATUS:")
        for agent_id, agent_info in status['agents'].items():
            status_emoji = "✅" if agent_info['status'] == 'running' else "❌"
            print(f"   {status_emoji} {agent_info['emoji']} {agent_info['name']} - {agent_info['status']}")
    
    elif args.stop_all:
        print("🛑 STOPPING ALL AGENTS")
        await army.stop_army()
        print("👋 All agents stopped")
    
    elif args.monitor:
        print("👁️ MONITORING AGENT ARMY")
        print("Press Ctrl+C to stop monitoring")
        try:
            while True:
                await asyncio.sleep(30)
                status = army.get_army_status()
                print(f"📊 {datetime.now().strftime('%H:%M:%S')} - {status['running_agents']}/{status['total_agents']} agents running")
        except KeyboardInterrupt:
            print("\n👋 Monitoring stopped")
    
    else:
        print("🤖 ESA Agent Army Deployment System")
        print("Use --deploy to deploy the complete agent army")
        print("Use --status to check current status")
        print("Use --stop-all to stop all agents")
        print("Use --monitor to monitor continuously")

if __name__ == "__main__":
    asyncio.run(main())