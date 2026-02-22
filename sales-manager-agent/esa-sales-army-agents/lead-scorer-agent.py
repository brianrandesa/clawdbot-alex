#!/usr/bin/env python3
"""
ESA LEAD SCORER AGENT
Analyzes 6,000+ leads and creates daily hit lists for Brian, Nick, and Chris
"""

import json
import datetime
from dataclasses import dataclass
from typing import List, Dict, Optional
import requests
import os

@dataclass
class Lead:
    """Lead data structure"""
    name: str
    company: str
    event_name: str
    event_date: str
    tier: str  # tier1, tier2, tier3, personal, ai_scraped
    last_contact: Optional[str] = None
    previous_interactions: List[Dict] = None
    urgency_score: int = 0
    fit_score: int = 0
    total_score: int = 0

class LeadScoringAgent:
    """Intelligent lead prioritization for daily hit lists"""
    
    def __init__(self, ghl_api_key: str = None):
        self.ghl_api_key = ghl_api_key or os.getenv('GHL_API_KEY')
        
    def calculate_urgency_score(self, lead: Lead) -> int:
        """Score based on event timeline urgency"""
        if not lead.event_date:
            return 0
            
        try:
            event_date = datetime.datetime.strptime(lead.event_date, '%Y-%m-%d')
            days_until_event = (event_date - datetime.datetime.now()).days
            
            # Scoring logic
            if days_until_event <= 30:
                return 100  # URGENT - Event in 30 days
            elif days_until_event <= 60:
                return 80   # HIGH - Event in 60 days
            elif days_until_event <= 90:
                return 60   # MEDIUM - Event in 90 days
            else:
                return 20   # LOW - Event distant
                
        except:
            return 0
    
    def calculate_fit_score(self, lead: Lead) -> int:
        """Score based on lead quality and tier"""
        tier_scores = {
            'personal': 100,      # Brian's personal network
            'ai_scraped': 90,     # AI-found dream clients
            'tier1': 70,          # High quality cold leads
            'tier2': 50,          # Medium quality
            'tier3': 30           # Lower quality
        }
        
        base_score = tier_scores.get(lead.tier, 30)
        
        # Boost for recent interactions
        if lead.last_contact:
            try:
                last_contact = datetime.datetime.strptime(lead.last_contact, '%Y-%m-%d')
                days_since_contact = (datetime.datetime.now() - last_contact).days
                
                if days_since_contact <= 7:
                    base_score += 20  # Recent interaction bonus
                elif days_since_contact <= 30:
                    base_score += 10
            except:
                pass
                
        return min(base_score, 100)
    
    def score_leads(self, leads: List[Lead]) -> List[Lead]:
        """Calculate total scores for all leads"""
        for lead in leads:
            lead.urgency_score = self.calculate_urgency_score(lead)
            lead.fit_score = self.calculate_fit_score(lead)
            lead.total_score = (lead.urgency_score * 0.6) + (lead.fit_score * 0.4)
            
        return sorted(leads, key=lambda x: x.total_score, reverse=True)
    
    def create_daily_hit_list(self, leads: List[Lead], total_calls: int = 20) -> Dict:
        """Generate prioritized daily call list"""
        scored_leads = self.score_leads(leads)
        
        # Distribution logic
        brian_calls = int(total_calls * 0.4)  # Brian gets 40% (tier A prospects)
        nick_calls = int(total_calls * 0.3)   # Nick gets 30%
        chris_calls = total_calls - brian_calls - nick_calls  # Chris gets remainder
        
        hit_list = {
            'date': datetime.datetime.now().strftime('%Y-%m-%d'),
            'brian': scored_leads[:brian_calls],
            'nick': scored_leads[brian_calls:brian_calls + nick_calls],
            'chris': scored_leads[brian_calls + nick_calls:total_calls],
            'total_leads_scored': len(leads),
            'average_score': sum(lead.total_score for lead in scored_leads[:total_calls]) / total_calls
        }
        
        return hit_list
    
    def format_hit_list_for_display(self, hit_list: Dict) -> str:
        """Format hit list for morning briefing"""
        output = f"""
🎯 DAILY HIT LIST - {hit_list['date']}
=====================================

BRIAN'S PRIORITY CALLS ({len(hit_list['brian'])}):
"""
        
        for i, lead in enumerate(hit_list['brian'], 1):
            urgency = "🔥 URGENT" if lead.urgency_score >= 80 else "⚡ HIGH" if lead.urgency_score >= 60 else "📅 MEDIUM"
            output += f"{i}. {lead.name} ({lead.company}) - Score: {lead.total_score:.0f}\n"
            output += f"   Event: {lead.event_name} ({lead.event_date}) - {urgency}\n"
            output += f"   Tier: {lead.tier.upper()} | Last Contact: {lead.last_contact or 'Never'}\n\n"
        
        output += f"\nNICK'S CALLS ({len(hit_list['nick'])}):\n"
        for i, lead in enumerate(hit_list['nick'], 1):
            output += f"{i}. {lead.name} ({lead.company}) - Score: {lead.total_score:.0f}\n"
            
        output += f"\nCHRIS'S CALLS ({len(hit_list['chris'])}):\n"
        for i, lead in enumerate(hit_list['chris'], 1):
            output += f"{i}. {lead.name} ({lead.company}) - Score: {lead.total_score:.0f}\n"
            
        return output
    
    def update_ghl_scores(self, hit_list: Dict):
        """Update GoHighLevel with lead scores"""
        if not self.ghl_api_key:
            print("No GHL API key - skipping score updates")
            return
            
        # GHL API integration would go here
        # This updates contact scores in GHL for pipeline visibility
        pass

if __name__ == "__main__":
    # Example usage
    agent = LeadScoringAgent()
    
    # Sample lead data (in production, this comes from your lead database)
    sample_leads = [
        Lead("John Smith", "HealthCorp", "Medical Conference 2024", "2024-03-15", "ai_scraped"),
        Lead("Sarah Johnson", "TechStart", "Innovation Summit", "2024-04-02", "personal"),
        Lead("Mike Wilson", "EventCo", "Business Expo", "2024-05-10", "tier1", "2024-02-15"),
    ]
    
    hit_list = agent.create_daily_hit_list(sample_leads)
    print(agent.format_hit_list_for_display(hit_list))