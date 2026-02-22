#!/usr/bin/env python3
"""
ESA SALES SYSTEM - Main Interface
Complete AI-powered sales management system for Brian, Nick, and Chris
"""

import asyncio
import json
import datetime
import sys
import os
from typing import Dict, List

# Import the sales army agents
from sales_army_orchestrator import SalesArmyOrchestrator, DailyBriefing
from lead_scorer_agent import LeadScoringAgent
from call_analyzer_agent import CallAnalyzerAgent
from followup_strategy_agent import FollowUpStrategyAgent
from content_creator_agent import ContentCreatorAgent

class ESASalesSystem:
    """Main interface for ESA Sales Army AI System"""
    
    def __init__(self, config_file: str = None):
        self.orchestrator = SalesArmyOrchestrator()
        self.config = self._load_config(config_file)
        self.session_active = True
        
    def _load_config(self, config_file: str = None) -> Dict:
        """Load system configuration"""
        default_config = {
            'team': {
                'closers': ['brian', 'nick', 'chris'],
                'daily_targets': {'brian': 8, 'nick': 7, 'chris': 7}
            },
            'integrations': {
                'fathom_api_key': os.getenv('FATHOM_API_KEY'),
                'ghl_api_key': os.getenv('GHL_API_KEY'),
                'kixie_api_key': os.getenv('KIXIE_API_KEY')
            },
            'automation': {
                'auto_approve_threshold': 0.85,
                'max_daily_auto_sends': 20,
                'working_hours': {'start': 8, 'end': 18}
            }
        }
        
        if config_file and os.path.exists(config_file):
            with open(config_file, 'r') as f:
                config = json.load(f)
                default_config.update(config)
        
        return default_config

    async def start_daily_session(self):
        """Start the daily sales session with briefing"""
        
        print("🎯 ESA SALES ARMY AI SYSTEM")
        print("=" * 50)
        print(f"Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}")
        print("Initializing AI agents...")
        
        # Generate daily briefing
        briefing = await self.orchestrator.generate_daily_briefing()
        
        # Display briefing
        print(self.orchestrator.format_daily_briefing(briefing))
        
        # Start interactive session
        await self._interactive_session(briefing)

    async def _interactive_session(self, briefing: DailyBriefing):
        """Run interactive session for sales team"""
        
        while self.session_active:
            print("\n" + "="*50)
            print("🤖 ESA SALES AI - Ready for Commands")
            print("="*50)
            
            # Show available commands
            self._show_commands()
            
            # Get user input
            command = input("\nEnter command (or 'help'): ").strip().lower()
            
            # Process command
            await self._process_command(command, briefing)

    def _show_commands(self):
        """Display available commands"""
        
        commands = {
            '1': 'Process completed call (Fathom → AI analysis → follow-up)',
            '2': 'Approve/reject pending content',
            '3': 'View updated hit list', 
            '4': 'Check follow-up queue',
            '5': 'Generate custom content',
            '6': 'View performance metrics',
            '7': 'Export daily report',
            'refresh': 'Refresh briefing data',
            'help': 'Show detailed help',
            'exit': 'End session'
        }
        
        print("\n📋 AVAILABLE COMMANDS:")
        for cmd, desc in commands.items():
            print(f"  {cmd}: {desc}")

    async def _process_command(self, command: str, briefing: DailyBriefing):
        """Process user commands"""
        
        if command == '1':
            await self._handle_call_processing()
        elif command == '2':
            await self._handle_content_approval()
        elif command == '3':
            await self._show_updated_hit_list()
        elif command == '4':
            await self._show_follow_up_queue()
        elif command == '5':
            await self._generate_custom_content()
        elif command == '6':
            await self._show_performance_metrics()
        elif command == '7':
            await self._export_daily_report()
        elif command == 'refresh':
            briefing = await self.orchestrator.generate_daily_briefing()
            print(self.orchestrator.format_daily_briefing(briefing))
        elif command == 'help':
            self._show_detailed_help()
        elif command == 'exit':
            self.session_active = False
            print("👋 Ending ESA Sales AI session. Great work today!")
        else:
            print(f"❌ Unknown command: {command}. Type 'help' for available commands.")

    async def _handle_call_processing(self):
        """Handle processing of completed calls"""
        
        print("\n📞 CALL PROCESSING")
        print("-" * 30)
        
        # In production, this would integrate with Fathom API
        print("Options:")
        print("1. Process Fathom recording (URL)")
        print("2. Manual call summary input")
        print("3. Bulk process recent calls")
        
        choice = input("Select option (1-3): ").strip()
        
        if choice == '1':
            fathom_url = input("Enter Fathom recording URL: ").strip()
            await self._process_fathom_recording(fathom_url)
        elif choice == '2':
            await self._manual_call_input()
        elif choice == '3':
            await self._bulk_process_calls()
        else:
            print("❌ Invalid choice")

    async def _process_fathom_recording(self, fathom_url: str):
        """Process a Fathom recording through the AI pipeline"""
        
        print(f"🔄 Processing Fathom recording: {fathom_url}")
        
        # Simulate call data (in production, this fetches from Fathom API)
        call_data = {
            'transcript': self._get_sample_transcript(),
            'metadata': {
                'prospect_name': input("Prospect name: ").strip(),
                'company': input("Company: ").strip(),
                'date': datetime.datetime.now().strftime('%Y-%m-%d'),
                'duration': 45,
                'fathom_url': fathom_url
            },
            'prospect_context': {
                'industry': input("Industry (healthcare/technology/business): ").strip(),
                'event_name': input("Event name: ").strip(),
                'event_capacity': int(input("Event capacity: ") or "400"),
                'ticket_price': int(input("Ticket price: ") or "500")
            }
        }
        
        # Process through AI pipeline
        print("🤖 AI analyzing call...")
        result = await self.orchestrator.process_completed_call(call_data)
        
        # Display results
        print(f"\n✅ CALL ANALYSIS COMPLETE")
        print(f"Close Probability: {result.call_insight.close_probability}%")
        print(f"Follow-up Priority: {result.call_insight.follow_up_priority}")
        print(f"Next Touch Timing: {result.call_insight.next_touch_timing}")
        print(f"Recommended Approach: {result.call_insight.recommended_approach}")
        
        print(f"\n📋 FOLLOW-UP SEQUENCE CREATED:")
        print(f"Total Touches: {result.follow_up_sequence.total_touches}")
        print(f"Sequence Type: {result.follow_up_sequence.sequence_type}")
        
        if result.content_queue:
            print(f"\n📝 CONTENT READY FOR APPROVAL:")
            for content in result.content_queue:
                print(f"• {content.method} - {content.subject}")
        
        # Ask for immediate actions
        if result.immediate_actions:
            print(f"\n⚡ IMMEDIATE ACTIONS RECOMMENDED:")
            for action in result.immediate_actions:
                print(f"• {action}")

    async def _manual_call_input(self):
        """Manual call summary input"""
        
        print("\n📝 MANUAL CALL SUMMARY")
        print("-" * 25)
        
        prospect_name = input("Prospect name: ").strip()
        company = input("Company: ").strip()
        
        print("\nCall outcome (select number):")
        print("1. Very interested - ready to close")
        print("2. Interested - needs follow-up")
        print("3. Some interest - longer nurture needed")
        print("4. Not interested - archive")
        print("5. Objections raised - needs objection handling")
        
        outcome = input("Select outcome (1-5): ").strip()
        
        # Convert to call insight format
        call_insight_data = self._convert_manual_input_to_insight(prospect_name, company, outcome)
        
        print(f"✅ Call logged for {prospect_name}")
        print("🤖 AI will generate appropriate follow-up sequence...")

    async def _handle_content_approval(self):
        """Handle content approval workflow"""
        
        print("\n📝 CONTENT APPROVAL")
        print("-" * 25)
        
        # Get pending content
        pending_content = await self.orchestrator._generate_pending_content()
        
        if not pending_content:
            print("✅ No content pending approval!")
            return
        
        # Display approval interface
        print(self.orchestrator.create_approval_interface(pending_content))
        
        # Get approvals
        approvals = []
        for i, content in enumerate(pending_content, 1):
            action = input(f"Action for item {i} (A/E/Alt/R): ").strip().upper()
            
            if action == 'A':
                approvals.append({'content': content, 'action': 'APPROVE'})
                print(f"✅ Approved: {content.method} to {content.prospect_name}")
            elif action == 'E':
                modifications = input("What changes needed? ").strip()
                approvals.append({'content': content, 'action': 'EDIT', 'modifications': modifications})
                print(f"✏️ Edit requested: {content.prospect_name}")
            elif action == 'ALT':
                approvals.append({'content': content, 'action': 'ALTERNATIVE'})
                print(f"🔄 Alternative version requested: {content.prospect_name}")
            elif action == 'R':
                approvals.append({'content': content, 'action': 'REJECT'})
                print(f"❌ Rejected: {content.prospect_name}")
            else:
                print(f"❓ Skipping item {i} (invalid action)")
        
        # Execute approved actions
        if approvals:
            print("\n🚀 Executing approved actions...")
            results = await self.orchestrator.execute_approved_follow_ups(approvals)
            
            print(f"✅ Executed {results['sms_sent']} SMS, {results['emails_sent']} emails")
            if results['errors']:
                print(f"❌ Errors: {len(results['errors'])}")

    async def _show_updated_hit_list(self):
        """Show updated daily hit list"""
        
        print("\n🎯 UPDATED HIT LIST")
        print("-" * 25)
        
        # Regenerate hit list
        briefing = await self.orchestrator.generate_daily_briefing()
        
        for closer in ['brian', 'nick', 'chris']:
            print(f"\n{closer.upper()}'S CALLS:")
            for i, lead in enumerate(briefing.priority_leads[closer][:10], 1):
                urgency = "🔥" if lead.urgency_score >= 80 else "⚡" if lead.urgency_score >= 60 else "📅"
                print(f"{i:2d}. {lead.name} ({lead.company}) - {lead.total_score:.0f} {urgency}")
                print(f"     {lead.event_name} ({lead.event_date})")

    async def _show_follow_up_queue(self):
        """Show follow-up queue status"""
        
        print("\n⚡ FOLLOW-UP QUEUE")
        print("-" * 25)
        
        pending_follow_ups = await self.orchestrator._process_pending_follow_ups()
        
        if not pending_follow_ups:
            print("✅ No pending follow-ups!")
            return
        
        for follow_up in pending_follow_ups[:15]:
            urgency_icon = "🚨" if follow_up['urgency'] == 'HIGH' else "⚠️"
            print(f"{urgency_icon} {follow_up['method']} to {follow_up['prospect_name']}")
            print(f"     Subject: {follow_up['subject']}")

    async def _generate_custom_content(self):
        """Generate custom content on demand"""
        
        print("\n✍️ CUSTOM CONTENT GENERATOR")
        print("-" * 35)
        
        prospect_name = input("Prospect name: ").strip()
        company = input("Company: ").strip()
        content_type = input("Content type (SMS/EMAIL/VIDEO): ").strip().upper()
        purpose = input("Purpose (NURTURE/CLOSE/OBJECTION_HANDLE): ").strip().upper()
        
        # Generate content
        content_creator = ContentCreatorAgent()
        
        prospect_info = {
            'name': prospect_name,
            'company': company,
            'personality': 'ANALYTICAL'  # Default
        }
        
        context = {
            'industry': 'business',
            'timing': 'immediate'
        }
        
        if content_type == 'SMS':
            content = content_creator.generate_personalized_sms(prospect_info, context, purpose)
        elif content_type == 'EMAIL':
            content = content_creator.generate_personalized_email(prospect_info, context, purpose)
        elif content_type == 'VIDEO':
            content = content_creator.generate_video_script(prospect_info, context, purpose)
        else:
            print("❌ Invalid content type")
            return
        
        print(f"\n📝 GENERATED CONTENT:")
        print(content_creator.format_content_for_approval(content))

    async def _show_performance_metrics(self):
        """Show current performance metrics"""
        
        print("\n📊 PERFORMANCE METRICS")
        print("-" * 30)
        
        metrics = await self.orchestrator._calculate_performance_metrics()
        
        print(f"Calls Completed Yesterday: {metrics['calls_completed_yesterday']}")
        print(f"Follow-ups Sent: {metrics['follow_ups_sent_yesterday']}")
        print(f"Response Rate: {metrics['avg_response_rate']:.1%}")
        print(f"Appointments Booked: {metrics['appointments_booked']}")
        print(f"Deals Closed This Week: {metrics['deals_closed_this_week']}")
        print(f"Pipeline Value: ${metrics['pipeline_value']:,}")
        print(f"Top Content Type: {metrics['top_performing_content_type']}")

    async def _export_daily_report(self):
        """Export daily report"""
        
        print("\n📄 EXPORTING DAILY REPORT")
        print("-" * 35)
        
        # Generate comprehensive report
        briefing = await self.orchestrator.generate_daily_briefing()
        
        report_filename = f"esa_sales_report_{briefing.date}.txt"
        
        with open(report_filename, 'w') as f:
            f.write(self.orchestrator.format_daily_briefing(briefing))
            f.write("\n\nDETAILED METRICS:\n")
            f.write(json.dumps(briefing.performance_metrics, indent=2))
        
        print(f"✅ Report exported: {report_filename}")

    def _show_detailed_help(self):
        """Show detailed help information"""
        
        help_text = """
🤖 ESA SALES ARMY AI - DETAILED HELP
=====================================

SYSTEM OVERVIEW:
This AI system automates your entire follow-up process so you can focus on calling and closing.

DAILY WORKFLOW:
1. Start session → AI generates hit list
2. Make calls → Process through AI after each call  
3. Approve content → AI sends follow-ups automatically
4. Review metrics → See what's working

KEY FEATURES:
• Intelligent lead scoring and prioritization
• Automatic call analysis (Fathom integration)
• Personalized follow-up sequence generation
• Content creation (SMS, emails, videos, LinkedIn)
• Performance tracking and optimization

BEST PRACTICES:
• Process calls immediately after completion
• Review and approve content in batches
• Check follow-up queue 2-3 times daily
• Use performance metrics to optimize approach

INTEGRATIONS:
• Fathom (call recording analysis)
• GoHighLevel (CRM and automation)  
• Kixie (dialing and call tracking)
• SMS/Email platforms

For technical support, contact: [support contact]
"""
        print(help_text)

    def _get_sample_transcript(self) -> str:
        """Get sample transcript for testing"""
        return """
        Prospect: "We've been struggling with unpredictable attendance at our events. 
        Last year we had to cancel one because only 50 people registered when we needed 200."
        
        Sales Rep: "That sounds frustrating. What's your timeline for your next event?"
        
        Prospect: "We have a conference in March, and I'm already worried about it. 
        The budget is approved for marketing, but I need to see some proof this works."
        
        Sales Rep: "I completely understand. Let me show you exactly how we helped..."
        """

    def _convert_manual_input_to_insight(self, prospect_name: str, company: str, outcome: str) -> Dict:
        """Convert manual input to call insight format"""
        
        outcome_mapping = {
            '1': {'priority': 'HIGH', 'close_prob': 85, 'signals': ['ready to close']},
            '2': {'priority': 'HIGH', 'close_prob': 70, 'signals': ['interested']},
            '3': {'priority': 'MEDIUM', 'close_prob': 45, 'signals': ['some interest']},
            '4': {'priority': 'LOW', 'close_prob': 5, 'signals': []},
            '5': {'priority': 'MEDIUM', 'close_prob': 35, 'signals': ['objections']}
        }
        
        mapping = outcome_mapping.get(outcome, outcome_mapping['3'])
        
        return {
            'prospect_name': prospect_name,
            'company': company,
            'priority': mapping['priority'],
            'close_probability': mapping['close_prob'],
            'buying_signals': mapping['signals']
        }

async def main():
    """Main entry point"""
    
    # Initialize system
    system = ESASalesSystem()
    
    # Start daily session
    await system.start_daily_session()

if __name__ == "__main__":
    print("🚀 Starting ESA Sales Army AI System...")
    asyncio.run(main())