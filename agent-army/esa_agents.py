#!/usr/bin/env python3
"""
ESA Business Agent Definitions
All 20+ agents for complete business automation
"""

from agent_framework import AgentConfig, army
import asyncio
import logging

logger = logging.getLogger(__name__)

def create_esa_agent_army():
    """Create and register all ESA business agents"""
    
    # TIER 1: CORE LEADERSHIP (Priority 10)
    agents = [
        
        # Henry - CEO Coordinator (already me)
        AgentConfig(
            agent_id="henry",
            name="Henry",
            emoji="🦁",
            role="CEO & Coordinator",
            description="Master coordinator managing all agents, strategic decisions, client relationships",
            skills=["coordination", "strategy", "client_management", "problem_solving", "business_development"],
            memory_limit_mb=1000,
            startup_command="openclaw sessions spawn --agent-id henry --label 'Henry CEO'",
            dependencies=[],
            priority=10,
            auto_restart=True,
            max_restarts=10
        ),
        
        # Rex - Sales Manager (already built)
        AgentConfig(
            agent_id="rex",
            name="Rex",
            emoji="🐺",
            role="Sales Manager",
            description="Manages both high-ticket ESS closers and ticket sales teams, pipeline tracking",
            skills=["sales_management", "pipeline_tracking", "team_coaching", "deal_closing", "crm_management"],
            memory_limit_mb=800,
            startup_command="openclaw sessions spawn --agent-id rex --label 'Rex Sales Manager'",
            dependencies=["henry"],
            priority=10,
            auto_restart=True,
            max_restarts=8
        ),
        
        # Marketing Director - Ads & Campaigns
        AgentConfig(
            agent_id="marketing_director",
            name="Marketing Director",
            emoji="📈",
            role="Marketing Operations Director",
            description="Facebook/Google ads, funnel optimization, audience targeting, creative direction",
            skills=["facebook_ads", "google_ads", "funnel_optimization", "audience_targeting", "creative_strategy", "conversion_tracking"],
            memory_limit_mb=900,
            startup_command="openclaw sessions spawn --agent-id marketing_director --label 'Marketing Director'",
            dependencies=["henry"],
            priority=10,
            auto_restart=True,
            max_restarts=8
        ),
    ]
    
    # TIER 2: OPERATIONS SPECIALISTS (Priority 8-9)
    agents.extend([
        
        # Event Hunter (already built)
        AgentConfig(
            agent_id="event_hunter",
            name="Event Hunter",
            emoji="🎯",
            role="Event Discovery Specialist",
            description="24/7 automated event discovery, qualification, prospect generation",
            skills=["event_discovery", "prospect_qualification", "data_extraction", "lead_scoring", "pipeline_feeding"],
            memory_limit_mb=600,
            startup_command="python3 /Users/henry/.openclaw/workspace/event-hunter-system/bulletproof_hunter.py",
            dependencies=["henry"],
            priority=9,
            auto_restart=True,
            max_restarts=99  # Never give up
        ),
        
        # Operations Director
        AgentConfig(
            agent_id="ops_director",
            name="Operations Director",
            emoji="⚙️",
            role="Business Operations Manager",
            description="Team coordination, project management, process optimization, KPI tracking",
            skills=["project_management", "team_coordination", "process_optimization", "kpi_tracking", "workflow_automation"],
            memory_limit_mb=700,
            startup_command="openclaw sessions spawn --agent-id ops_director --label 'Operations Director'",
            dependencies=["henry"],
            priority=9,
            auto_restart=True,
            max_restarts=8
        ),
        
        # Client Success Manager
        AgentConfig(
            agent_id="client_success",
            name="Client Success Manager",
            emoji="🤝",
            role="Client Relationship Manager",
            description="Onboarding, retention, upsells, satisfaction tracking, support coordination",
            skills=["client_onboarding", "relationship_management", "upselling", "support_coordination", "retention_strategies"],
            memory_limit_mb=600,
            startup_command="openclaw sessions spawn --agent-id client_success --label 'Client Success Manager'",
            dependencies=["henry", "ops_director"],
            priority=8,
            auto_restart=True,
            max_restarts=5
        ),
        
        # Finance Director
        AgentConfig(
            agent_id="finance_director",
            name="Finance Director", 
            emoji="💰",
            role="Financial Operations Manager",
            description="Revenue tracking, expense management, profitability analysis, financial reporting",
            skills=["revenue_tracking", "expense_management", "financial_reporting", "profitability_analysis", "budget_planning"],
            memory_limit_mb=500,
            startup_command="openclaw sessions spawn --agent-id finance_director --label 'Finance Director'",
            dependencies=["henry"],
            priority=8,
            auto_restart=True,
            max_restarts=5
        ),
    ])
    
    # TIER 3: SPECIALIZED AGENTS (Priority 6-7)
    agents.extend([
        
        # Content Creator
        AgentConfig(
            agent_id="content_creator",
            name="Content Creator",
            emoji="✍️",
            role="Content & Copy Specialist",
            description="Ad copy, email sequences, landing pages, social media content, VSLs",
            skills=["copywriting", "email_sequences", "ad_copy", "landing_pages", "social_content", "vsl_creation"],
            memory_limit_mb=600,
            startup_command="openclaw sessions spawn --agent-id content_creator --label 'Content Creator'",
            dependencies=["marketing_director"],
            priority=7,
            auto_restart=True,
            max_restarts=5
        ),
        
        # Data Analyst
        AgentConfig(
            agent_id="data_analyst",
            name="Data Analyst",
            emoji="📊",
            role="Business Intelligence Analyst",
            description="Performance analytics, conversion tracking, ROI analysis, reporting dashboards",
            skills=["data_analysis", "performance_tracking", "roi_analysis", "dashboard_creation", "conversion_optimization"],
            memory_limit_mb=700,
            startup_command="openclaw sessions spawn --agent-id data_analyst --label 'Data Analyst'",
            dependencies=["henry", "marketing_director"],
            priority=7,
            auto_restart=True,
            max_restarts=5
        ),
        
        # Lead Qualifier
        AgentConfig(
            agent_id="lead_qualifier",
            name="Lead Qualifier",
            emoji="🎯",
            role="Lead Qualification Specialist",
            description="Pre-call qualification, lead scoring, appointment setting, CRM management",
            skills=["lead_qualification", "appointment_setting", "crm_management", "lead_scoring", "call_preparation"],
            memory_limit_mb=500,
            startup_command="openclaw sessions spawn --agent-id lead_qualifier --label 'Lead Qualifier'",
            dependencies=["rex", "event_hunter"],
            priority=7,
            auto_restart=True,
            max_restarts=5
        ),
        
        # Social Media Manager
        AgentConfig(
            agent_id="social_media",
            name="Social Media Manager",
            emoji="📱",
            role="Social Media Strategist",
            description="Social media campaigns, influencer outreach, community management, brand building",
            skills=["social_media_management", "community_building", "influencer_outreach", "brand_strategy", "content_scheduling"],
            memory_limit_mb=500,
            startup_command="openclaw sessions spawn --agent-id social_media --label 'Social Media Manager'",
            dependencies=["marketing_director", "content_creator"],
            priority=6,
            auto_restart=True,
            max_restarts=3
        ),
        
        # Customer Support
        AgentConfig(
            agent_id="customer_support",
            name="Customer Support",
            emoji="🎧",
            role="Customer Support Specialist",
            description="Ticket resolution, customer inquiries, technical support, satisfaction surveys",
            skills=["customer_support", "ticket_resolution", "technical_support", "customer_communication", "issue_escalation"],
            memory_limit_mb=400,
            startup_command="openclaw sessions spawn --agent-id customer_support --label 'Customer Support'",
            dependencies=["client_success"],
            priority=6,
            auto_restart=True,
            max_restarts=3
        ),
    ])
    
    # TIER 4: INDUSTRY SPECIALISTS (Priority 4-5)
    agents.extend([
        
        # Real Estate Specialist
        AgentConfig(
            agent_id="real_estate_specialist",
            name="Real Estate Specialist",
            emoji="🏠",
            role="Real Estate Industry Expert",
            description="Real estate coaching events, investor meetups, industry-specific outreach",
            skills=["real_estate_industry", "investor_relations", "property_events", "rei_marketing", "wholesaling_events"],
            memory_limit_mb=400,
            startup_command="openclaw sessions spawn --agent-id real_estate_specialist --label 'Real Estate Specialist'",
            dependencies=["henry", "event_hunter"],
            priority=5,
            auto_restart=True,
            max_restarts=3
        ),
        
        # Business Coaching Specialist
        AgentConfig(
            agent_id="business_coaching_specialist",
            name="Business Coaching Specialist",
            emoji="🎓",
            role="Business Coaching Expert",
            description="Business coaching events, consulting conferences, entrepreneur summits",
            skills=["business_coaching", "consulting_events", "entrepreneur_summits", "coaching_industry", "business_development"],
            memory_limit_mb=400,
            startup_command="openclaw sessions spawn --agent-id business_coaching_specialist --label 'Business Coaching Specialist'",
            dependencies=["henry", "event_hunter"],
            priority=5,
            auto_restart=True,
            max_restarts=3
        ),
        
        # Sales Training Specialist
        AgentConfig(
            agent_id="sales_training_specialist",
            name="Sales Training Specialist",
            emoji="💼",
            role="Sales Training Expert",
            description="Sales bootcamps, closing workshops, sales methodology events",
            skills=["sales_training", "closing_workshops", "sales_methodology", "sales_coaching", "sales_events"],
            memory_limit_mb=400,
            startup_command="openclaw sessions spawn --agent-id sales_training_specialist --label 'Sales Training Specialist'",
            dependencies=["henry", "event_hunter", "rex"],
            priority=5,
            auto_restart=True,
            max_restarts=3
        ),
        
        # Digital Marketing Specialist
        AgentConfig(
            agent_id="digital_marketing_specialist",
            name="Digital Marketing Specialist",
            emoji="💻",
            role="Digital Marketing Expert",
            description="Digital marketing conferences, online business summits, e-commerce events",
            skills=["digital_marketing", "ecommerce_events", "online_business", "digital_conferences", "marketing_automation"],
            memory_limit_mb=400,
            startup_command="openclaw sessions spawn --agent-id digital_marketing_specialist --label 'Digital Marketing Specialist'",
            dependencies=["henry", "event_hunter", "marketing_director"],
            priority=5,
            auto_restart=True,
            max_restarts=3
        ),
    ])
    
    # TIER 5: SUPPORT & AUTOMATION (Priority 2-3)
    agents.extend([
        
        # Email Automation
        AgentConfig(
            agent_id="email_automation",
            name="Email Automation",
            emoji="📧",
            role="Email Marketing Specialist",
            description="Email sequences, drip campaigns, newsletter management, automation workflows",
            skills=["email_automation", "drip_campaigns", "email_sequences", "newsletter_management", "automation_workflows"],
            memory_limit_mb=300,
            startup_command="openclaw sessions spawn --agent-id email_automation --label 'Email Automation'",
            dependencies=["marketing_director", "content_creator"],
            priority=4,
            auto_restart=True,
            max_restarts=3
        ),
        
        # Calendar Manager
        AgentConfig(
            agent_id="calendar_manager",
            name="Calendar Manager",
            emoji="📅",
            role="Scheduling & Calendar Specialist",
            description="Appointment scheduling, calendar optimization, meeting coordination, availability management",
            skills=["calendar_management", "appointment_scheduling", "meeting_coordination", "availability_optimization", "scheduling_automation"],
            memory_limit_mb=300,
            startup_command="openclaw sessions spawn --agent-id calendar_manager --label 'Calendar Manager'",
            dependencies=["rex", "client_success"],
            priority=4,
            auto_restart=True,
            max_restarts=3
        ),
        
        # CRM Manager
        AgentConfig(
            agent_id="crm_manager",
            name="CRM Manager",
            emoji="🗃️",
            role="CRM & Database Specialist",
            description="CRM maintenance, data hygiene, pipeline management, contact organization",
            skills=["crm_management", "data_hygiene", "pipeline_organization", "contact_management", "database_optimization"],
            memory_limit_mb=400,
            startup_command="openclaw sessions spawn --agent-id crm_manager --label 'CRM Manager'",
            dependencies=["rex", "lead_qualifier"],
            priority=4,
            auto_restart=True,
            max_restarts=3
        ),
        
        # Reporting Specialist
        AgentConfig(
            agent_id="reporting_specialist",
            name="Reporting Specialist",
            emoji="📈",
            role="Business Reporting Expert",
            description="Daily/weekly/monthly reports, KPI dashboards, performance summaries",
            skills=["business_reporting", "kpi_dashboards", "performance_summaries", "data_visualization", "report_automation"],
            memory_limit_mb=400,
            startup_command="openclaw sessions spawn --agent-id reporting_specialist --label 'Reporting Specialist'",
            dependencies=["data_analyst", "finance_director"],
            priority=3,
            auto_restart=True,
            max_restarts=3
        ),
        
        # Quality Assurance
        AgentConfig(
            agent_id="quality_assurance",
            name="Quality Assurance",
            emoji="🔍",
            role="Quality Control Specialist",
            description="Process auditing, quality checks, compliance monitoring, error detection",
            skills=["quality_control", "process_auditing", "compliance_monitoring", "error_detection", "quality_improvement"],
            memory_limit_mb=300,
            startup_command="openclaw sessions spawn --agent-id quality_assurance --label 'Quality Assurance'",
            dependencies=["ops_director"],
            priority=3,
            auto_restart=True,
            max_restarts=3
        ),
        
        # System Monitor
        AgentConfig(
            agent_id="system_monitor",
            name="System Monitor",
            emoji="🖥️",
            role="Technology & Infrastructure Monitor",
            description="System health monitoring, uptime tracking, performance optimization, tech support",
            skills=["system_monitoring", "performance_optimization", "uptime_tracking", "tech_support", "infrastructure_management"],
            memory_limit_mb=300,
            startup_command="openclaw sessions spawn --agent-id system_monitor --label 'System Monitor'",
            dependencies=["henry"],
            priority=2,
            auto_restart=True,
            max_restarts=5
        ),
    ])
    
    # Register all agents with the army
    for agent_config in agents:
        army.register_agent(agent_config)
    
    logger.info(f"✅ Registered {len(agents)} ESA business agents")
    return len(agents)

async def deploy_esa_army():
    """Deploy the complete ESA agent army"""
    print("🚀 DEPLOYING ESA AGENT ARMY")
    print("=" * 50)
    
    # Create and register all agents
    agent_count = create_esa_agent_army()
    print(f"📊 Total agents registered: {agent_count}")
    
    # Start the army
    success = await army.start_army(priority_order=True)
    
    if success:
        print("✅ ESA AGENT ARMY FULLY DEPLOYED!")
        print("🎯 All 20 business automation agents are now running")
        print("📈 Your business is now fully autonomous")
    else:
        print("⚠️ Some agents failed to start - check logs")
    
    return success

async def main():
    """Main deployment function"""
    await deploy_esa_army()
    
    # Keep army running
    try:
        while True:
            await asyncio.sleep(60)
            status = army.get_army_status()
            print(f"📊 Army Status: {status['running_agents']}/{status['total_agents']} agents running")
    except KeyboardInterrupt:
        print("\n🛑 Stopping ESA Agent Army...")
        await army.stop_army()

if __name__ == "__main__":
    asyncio.run(main())