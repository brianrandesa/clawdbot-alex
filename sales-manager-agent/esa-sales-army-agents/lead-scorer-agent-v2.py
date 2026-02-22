#!/usr/bin/env python3
"""
ESA LEAD SCORER AGENT V2 - 2-Call Audit System Integration
Analyzes 6,000+ leads and creates daily hit lists with audit-based prioritization
"""

import json
import datetime
from dataclasses import dataclass
from typing import List, Dict, Optional
import requests
import os

@dataclass
class LeadScore:
    """Enhanced lead scoring with audit integration"""
    name: str
    company: str
    event_name: str
    event_date: str
    
    # Scoring components
    total_score: float
    urgency_score: float
    fit_score: float
    priority: str
    
    # Audit-specific fields
    audit_score: Optional[int] = None  # 0-75 point audit score
    audit_tier: Optional[str] = None   # TIER_A, TIER_B, TIER_C, NOT_QUALIFIED
    audit_completed: bool = False
    presentation_scheduled: bool = False
    call_status: str = "not_contacted"  # not_contacted, audit_scheduled, audit_completed, presentation_scheduled, presentation_completed, closed_won, closed_lost
    
    # Additional context
    tier: str = ""  # Original tier (personal, ai_scraped, tier1, tier2, tier3)
    last_contact: Optional[str] = None
    recommended_approach: str = ""
    next_action: str = ""

class LeadScoringAgentV2:
    """Enhanced lead scoring with 2-call audit system"""
    
    def __init__(self, ghl_api_key: str = None):
        self.ghl_api_key = ghl_api_key or os.getenv('GHL_API_KEY')
        
        # Brian's audit scoring criteria (75-point system)
        self.audit_criteria = {
            'event_type': {
                'Business Seminar/Conference': 5,
                'Workshop/Training Session': 4,
                'Trade Show/Expo': 3,
                'Networking Event': 2,
                'Webinar/Virtual Event': 2,
                'Product Launch': 2,
                'Charity/Fundraiser Event': 1,
                'Social Event': 1,
                'Other': 0
            },
            'website': {
                'Professional Website (Up-to-date, detailed)': 5,
                'Basic Website (Functional but limited)': 3,
                'Minimal Website (Outdated or incomplete)': 1,
                'No Website': 0
            },
            'experience': {
                '10+ Times': 5,
                '5-9 Times': 4,
                '2-4 Times': 2,
                '0-1 Time': 0
            },
            'past_attendance': {
                '500+ Attendees': 5,
                '200-499 Attendees': 4,
                '50-199 Attendees': 2,
                'Less than 50 Attendees': 0
            },
            'target_attendance': {
                '500+ Attendees': 5,
                '200-499 Attendees': 4,
                '50-199 Attendees': 2,
                'Less than 50 Attendees': 0
            },
            'ticket_price': {
                '$500+': 5,
                '$200-$499': 4,
                '$99-$199': 2,
                'Free or under $99': 0
            },
            'offer_at_event': {'Yes': 5, 'No': 0},
            'ad_spend': {
                '$20,000+': 5,
                '$10,000-$19,999': 4,
                '$5,000-$9,999': 2,
                '$1,000-$4,999': 1,
                'Less than $1,000': 0
            },
            'leads': {
                '500+ Leads': 5,
                '200-499 Leads': 4,
                '50-199 Leads': 2,
                'Less than 50 Leads': 0
            },
            'tickets_sold': {
                '300+ Tickets': 5,
                '100-299 Tickets': 4,
                '50-99 Tickets': 2,
                'Less than 50 Tickets': 0
            },
            'sales_reps': {
                '5+ Reps': 5,
                '3-4 Reps': 4,
                '1-2 Reps': 2,
                'No Sales Reps': 0
            },
            'decision_maker': {'Yes': 5, 'No': 0},
            'crm': {'Yes': 5, 'No': 0},
            'ad_management': {
                'Professional Agency': 5,
                'In-House Team': 3,
                'Freelancer': 1,
                'No One': 0
            },
            'instagram': {
                '10,000+ Followers': 5,
                '5,000-9,999 Followers': 4,
                '1,000-4,999 Followers': 2,
                'Less than 1,000 Followers': 0
            },
            'email_list': {
                '10,000+ Subscribers': 5,
                '5,000-9,999 Subscribers': 4,
                '1,000-4,999 Subscribers': 2,
                'Less than 1,000 Subscribers': 0
            },
            'bottleneck': {
                'Marketing and Sales': 5,
                'Event Management': 4,
                'Content and Speakers': 2,
                'Logistics and Operations': 1
            }
        }
    
    def calculate_lead_score(self, lead_data: Dict) -> LeadScore:
        """Calculate comprehensive lead score with 2-call system"""
        
        # Check if this lead has completed audit
        if lead_data.get('audit_completed', False) and 'audit_score' in lead_data:
            return self._score_audited_lead(lead_data)
        else:
            return self._score_pre_audit_lead(lead_data)

    def _score_audited_lead(self, lead_data: Dict) -> LeadScore:
        """Score lead based on completed event audit"""
        
        audit_score = lead_data['audit_score']
        
        # Convert 75-point audit to 100-point scale  
        total_score = min(100, (audit_score / 75) * 100)
        
        # Event urgency scoring
        urgency_score = self._calculate_urgency_score(lead_data)
        
        # Audit score IS the fit score
        fit_score = total_score
        
        # Determine tier based on Brian's qualification ranges
        if audit_score >= 65:
            priority = "TIER_A_HIGHLY_QUALIFIED"
            audit_tier = "TIER_A"
        elif audit_score >= 50:
            priority = "TIER_B_MODERATELY_QUALIFIED" 
            audit_tier = "TIER_B"
        elif audit_score >= 35:
            priority = "TIER_C_NEEDS_EVALUATION"
            audit_tier = "TIER_C"
        else:
            priority = "NOT_QUALIFIED"
            audit_tier = "NOT_QUALIFIED"
        
        # Determine approach and next action
        approach = self._get_presentation_approach(audit_score)
        next_action = self._get_audit_next_action(lead_data, audit_score)
        
        return LeadScore(
            name=lead_data.get('name', ''),
            company=lead_data.get('company', ''),
            event_name=lead_data.get('event_name', ''),
            event_date=lead_data.get('event_date', ''),
            total_score=total_score,
            urgency_score=urgency_score,
            fit_score=fit_score,
            priority=priority,
            audit_score=audit_score,
            audit_tier=audit_tier,
            audit_completed=True,
            presentation_scheduled=lead_data.get('presentation_scheduled', False),
            call_status=lead_data.get('call_status', 'audit_completed'),
            tier=lead_data.get('tier', ''),
            last_contact=lead_data.get('last_contact'),
            recommended_approach=approach,
            next_action=next_action
        )

    def _score_pre_audit_lead(self, lead_data: Dict) -> LeadScore:
        """Score lead for audit qualification"""
        
        # Event urgency (70% weight pre-audit)
        urgency_score = self._calculate_urgency_score(lead_data)
        
        # Tier-based fit scoring (30% weight)
        fit_score = self._calculate_tier_fit_score(lead_data)
        
        # Weighted total emphasizes urgency for audit qualification
        total_score = (urgency_score * 0.7) + (fit_score * 0.3)
        
        # Audit qualification thresholds
        if total_score >= 75:
            priority = "AUDIT_READY_HIGH"
        elif total_score >= 50:
            priority = "AUDIT_READY_MEDIUM"
        else:
            priority = "NURTURE_TO_AUDIT"
        
        # Pre-audit approach
        approach = "SCHEDULE_AUDIT_CALL"
        next_action = "AUDIT_CALL" if total_score >= 50 else "NURTURE_SEQUENCE"
        
        return LeadScore(
            name=lead_data.get('name', ''),
            company=lead_data.get('company', ''),
            event_name=lead_data.get('event_name', ''),
            event_date=lead_data.get('event_date', ''),
            total_score=total_score,
            urgency_score=urgency_score,
            fit_score=fit_score,
            priority=priority,
            audit_completed=False,
            presentation_scheduled=False,
            call_status=lead_data.get('call_status', 'not_contacted'),
            tier=lead_data.get('tier', ''),
            last_contact=lead_data.get('last_contact'),
            recommended_approach=approach,
            next_action=next_action
        )

    def _calculate_urgency_score(self, lead_data: Dict) -> float:
        """Calculate urgency based on event timeline"""
        
        event_date = lead_data.get('event_date')
        if not event_date:
            return 20  # Low priority if no event date
        
        try:
            event_dt = datetime.datetime.strptime(event_date, '%Y-%m-%d')
            days_until = (event_dt - datetime.datetime.now()).days
            
            if days_until <= 30:
                return 100  # CRITICAL - Event in 30 days
            elif days_until <= 60:
                return 85   # URGENT - Event in 60 days  
            elif days_until <= 90:
                return 70   # HIGH - Event in 90 days
            elif days_until <= 180:
                return 50   # MEDIUM - Event in 6 months
            else:
                return 25   # LOW - Event distant
                
        except ValueError:
            return 20

    def _calculate_tier_fit_score(self, lead_data: Dict) -> float:
        """Calculate fit based on original lead tier"""
        
        tier_scores = {
            'personal': 95,       # Brian's personal network
            'ai_scraped': 85,     # AI-found prospects  
            'tier1': 70,          # High-quality cold leads
            'tier2': 50,          # Medium quality
            'tier3': 35           # Lower quality
        }
        
        base_score = tier_scores.get(lead_data.get('tier', 'tier3'), 35)
        
        # Recent contact bonus
        if lead_data.get('last_contact'):
            try:
                last_contact = datetime.datetime.strptime(lead_data['last_contact'], '%Y-%m-%d')
                days_ago = (datetime.datetime.now() - last_contact).days
                
                if days_ago <= 7:
                    base_score += 15  # Recent interaction
                elif days_ago <= 30:
                    base_score += 8
            except ValueError:
                pass
        
        return min(base_score, 100)

    def _get_presentation_approach(self, audit_score: int) -> str:
        """Get presentation approach based on audit score"""
        
        if audit_score >= 65:
            return "CONFIDENT_CLOSE"  # Strong prospects, push for close
        elif audit_score >= 50:
            return "CONSULTATIVE"    # Good prospects, consultative close
        elif audit_score >= 35:
            return "EDUCATIONAL"     # Weak prospects, education-focused
        else:
            return "DO_NOT_PURSUE"

    def _get_audit_next_action(self, lead_data: Dict, audit_score: int) -> str:
        """Get next action based on audit results"""
        
        if audit_score < 35:
            return "DISQUALIFY"
        
        call_status = lead_data.get('call_status', 'audit_completed')
        
        if call_status == 'audit_completed':
            if lead_data.get('presentation_scheduled', False):
                return "DELIVER_PRESENTATION"
            else:
                return "SCHEDULE_PRESENTATION"
        else:
            return "COMPLETE_AUDIT_PROCESS"

    def calculate_audit_score(self, audit_data: Dict) -> int:
        """Calculate 75-point audit score from call data"""
        
        total_score = 0
        
        for category, responses in audit_data.items():
            if category in self.audit_criteria:
                criteria = self.audit_criteria[category]
                response = responses if isinstance(responses, str) else str(responses)
                total_score += criteria.get(response, 0)
        
        return min(total_score, 75)

    def create_daily_hit_lists(self, leads: List[Dict]) -> Dict:
        """Generate audit-optimized daily hit lists"""
        
        # Score all leads
        scored_leads = []
        for lead_data in leads:
            score = self.calculate_lead_score(lead_data)
            scored_leads.append(score)
        
        # Sort by priority and score
        scored_leads.sort(key=lambda x: (
            self._priority_weight(x.priority),
            x.urgency_score,
            x.total_score
        ), reverse=True)
        
        # Separate by call types and audit status
        audit_ready = [l for l in scored_leads if not l.audit_completed and l.total_score >= 50]
        presentation_ready = [l for l in scored_leads if l.audit_completed and l.audit_score >= 35 and not l.presentation_scheduled]
        closing_ready = [l for l in scored_leads if l.audit_completed and l.presentation_scheduled]
        
        # Distribute across team (Brian gets premium prospects)
        brian_leads = self._get_brian_leads(audit_ready, presentation_ready, closing_ready)
        nick_leads = self._get_nick_leads(audit_ready, presentation_ready, closing_ready) 
        chris_leads = self._get_chris_leads(audit_ready, presentation_ready, closing_ready)
        
        return {
            'date': datetime.datetime.now().strftime('%Y-%m-%d'),
            'brian': brian_leads[:8],  # Brian's daily target
            'nick': nick_leads[:7],    # Nick's daily target
            'chris': chris_leads[:7],  # Chris's daily target
            'audit_pipeline': len(audit_ready),
            'presentation_pipeline': len(presentation_ready),
            'closing_pipeline': len(closing_ready),
            'total_qualified': len([l for l in scored_leads if l.audit_completed and l.audit_score >= 50])
        }

    def _priority_weight(self, priority: str) -> int:
        """Convert priority to numeric weight"""
        weights = {
            'TIER_A_HIGHLY_QUALIFIED': 1000,
            'TIER_B_MODERATELY_QUALIFIED': 800,
            'TIER_C_NEEDS_EVALUATION': 600,
            'AUDIT_READY_HIGH': 400,
            'AUDIT_READY_MEDIUM': 200,
            'NURTURE_TO_AUDIT': 100,
            'NOT_QUALIFIED': 0
        }
        return weights.get(priority, 0)

    def _get_brian_leads(self, audit_ready: List, presentation_ready: List, closing_ready: List) -> List:
        """Brian gets Tier A prospects and personal/AI-scraped leads"""
        
        brian_leads = []
        
        # Priority 1: Closing calls (Tier A)
        tier_a_closing = [l for l in closing_ready if l.audit_tier == 'TIER_A']
        brian_leads.extend(tier_a_closing[:3])
        
        # Priority 2: Tier A presentations
        tier_a_presentations = [l for l in presentation_ready if l.audit_tier == 'TIER_A']
        brian_leads.extend(tier_a_presentations[:3])
        
        # Priority 3: High-value audit calls
        premium_audits = [l for l in audit_ready if l.tier in ['personal', 'ai_scraped']]
        brian_leads.extend(premium_audits[:4])
        
        return brian_leads

    def _get_nick_leads(self, audit_ready: List, presentation_ready: List, closing_ready: List) -> List:
        """Nick gets Tier A/B prospects"""
        
        nick_leads = []
        
        # Tier A/B closing calls
        quality_closing = [l for l in closing_ready if l.audit_tier in ['TIER_A', 'TIER_B']]
        nick_leads.extend(quality_closing[:2])
        
        # Tier B presentations  
        tier_b_presentations = [l for l in presentation_ready if l.audit_tier == 'TIER_B']
        nick_leads.extend(tier_b_presentations[:3])
        
        # Quality audit calls
        quality_audits = [l for l in audit_ready if l.tier in ['tier1', 'ai_scraped']]
        nick_leads.extend(quality_audits[:3])
        
        return nick_leads

    def _get_chris_leads(self, audit_ready: List, presentation_ready: List, closing_ready: List) -> List:
        """Chris gets remaining qualified prospects"""
        
        chris_leads = []
        
        # Any remaining closing calls
        remaining_closing = [l for l in closing_ready if l not in self._get_brian_leads([], [], closing_ready) + self._get_nick_leads([], [], closing_ready)]
        chris_leads.extend(remaining_closing[:2])
        
        # Tier B/C presentations
        remaining_presentations = [l for l in presentation_ready if l.audit_tier in ['TIER_B', 'TIER_C']]
        chris_leads.extend(remaining_presentations[:3])
        
        # Standard audit calls
        standard_audits = [l for l in audit_ready if l.tier in ['tier1', 'tier2']]
        chris_leads.extend(standard_audits[:3])
        
        return chris_leads

    def format_daily_briefing(self, hit_lists: Dict) -> str:
        """Format hit lists for daily briefing"""
        
        output = f"""
🎯 DAILY SALES BRIEFING - {hit_lists['date']}
==================================================

📊 PIPELINE OVERVIEW:
• Audit Pipeline: {hit_lists['audit_pipeline']} leads ready
• Presentation Pipeline: {hit_lists['presentation_pipeline']} audits completed
• Closing Pipeline: {hit_lists['closing_pipeline']} presentations scheduled  
• Total Qualified: {hit_lists['total_qualified']} prospects

🔥 BRIAN'S PRIORITY CALLS ({len(hit_lists['brian'])}):
"""
        
        for i, lead in enumerate(hit_lists['brian'], 1):
            status_icon = self._get_status_icon(lead)
            audit_info = f" | Audit: {lead.audit_score}/75" if lead.audit_completed else ""
            
            output += f"{i}. {lead.name} ({lead.company}) - {lead.total_score:.0f} {status_icon}\n"
            output += f"   Event: {lead.event_name} ({lead.event_date}){audit_info}\n"
            output += f"   Next Action: {lead.next_action}\n\n"
        
        output += f"\n⚡ NICK'S CALLS ({len(hit_lists['nick'])}):\n"
        for i, lead in enumerate(hit_lists['nick'], 1):
            status_icon = self._get_status_icon(lead)
            output += f"{i}. {lead.name} ({lead.company}) - {lead.total_score:.0f} {status_icon}\n"
            output += f"   Next: {lead.next_action}\n\n"
            
        output += f"\n📞 CHRIS'S CALLS ({len(hit_lists['chris'])}):\n"
        for i, lead in enumerate(hit_lists['chris'], 1):
            status_icon = self._get_status_icon(lead)
            output += f"{i}. {lead.name} ({lead.company}) - {lead.total_score:.0f} {status_icon}\n"
            output += f"   Next: {lead.next_action}\n\n"
            
        return output

    def _get_status_icon(self, lead: LeadScore) -> str:
        """Get visual status icon"""
        
        if lead.audit_completed:
            if lead.audit_score >= 65:
                return "🔥"  # Tier A
            elif lead.audit_score >= 50:
                return "⚡"  # Tier B  
            elif lead.audit_score >= 35:
                return "📋"  # Tier C
            else:
                return "❌"  # Not qualified
        else:
            if lead.urgency_score >= 80:
                return "🚨"  # Urgent audit needed
            else:
                return "📅"  # Standard audit

if __name__ == "__main__":
    # Example usage
    agent = LeadScoringAgentV2()
    
    # Sample leads data
    sample_leads = [
        {
            'name': 'Dr. Sarah Johnson',
            'company': 'HealthTech Solutions', 
            'event_name': 'Medical Innovation Summit',
            'event_date': '2024-03-15',
            'tier': 'ai_scraped',
            'audit_completed': True,
            'audit_score': 68,
            'presentation_scheduled': False,
            'call_status': 'audit_completed'
        },
        {
            'name': 'Mike Chen',
            'company': 'TechStart Inc',
            'event_name': 'Startup Showcase',  
            'event_date': '2024-04-02',
            'tier': 'personal',
            'audit_completed': False,
            'call_status': 'not_contacted'
        }
    ]
    
    # Generate hit lists
    hit_lists = agent.create_daily_hit_lists(sample_leads)
    
    # Display results  
    print(agent.format_daily_briefing(hit_lists))