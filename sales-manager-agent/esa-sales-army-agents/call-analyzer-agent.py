#!/usr/bin/env python3
"""
ESA CALL ANALYZER AGENT
Processes Fathom recordings and extracts actionable sales intelligence
"""

import json
import re
import datetime
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple
import requests
import os

@dataclass
class CallInsight:
    """Extracted insights from sales call"""
    prospect_name: str
    company: str
    call_date: str
    call_duration: int
    
    # Key Intelligence
    pain_points: List[str]
    objections_raised: List[str]
    buying_signals: List[str]
    decision_makers: List[str]
    timeline: Optional[str]
    budget_signals: List[str]
    
    # Next Steps
    follow_up_priority: str  # HIGH, MEDIUM, LOW
    recommended_approach: str
    next_touch_timing: str
    close_probability: int
    
    # Context
    prospect_personality: str  # ANALYTICAL, DRIVER, EXPRESSIVE, AMIABLE
    communication_style: str
    key_quotes: List[str]

class CallAnalyzerAgent:
    """Intelligent call analysis and follow-up recommendations"""
    
    def __init__(self, fathom_api_key: str = None):
        self.fathom_api_key = fathom_api_key or os.getenv('FATHOM_API_KEY')
        
        # ESA-specific patterns to look for
        self.pain_point_patterns = [
            r"(?i)(unpredictable|uncertain|inconsistent).*(attendance|turnout)",
            r"(?i)(struggle|hard|difficult).*(fill|seats|registration)",
            r"(?i)(stress|worry|anxiety).*(event|marketing)",
            r"(?i)(last minute|procrastination).*(registration|signup)",
            r"(?i)(marketing|promotion).*(not working|failing|ineffective)"
        ]
        
        self.buying_signal_patterns = [
            r"(?i)(when|if we).*(start|begin|implement)",
            r"(?i)(what would|how does).*(process|timeline|work)",
            r"(?i)(our next event|upcoming|planning)",
            r"(?i)(budget|investment|cost).*(approved|available)",
            r"(?i)(need|want|looking for).*(solution|help|system)"
        ]
        
        self.objection_patterns = [
            r"(?i)(expensive|cost|price|money|budget)",
            r"(?i)(think about|consider|discuss)",
            r"(?i)(not sure|uncertain|doubt)",
            r"(?i)(tried before|didn't work|failed)",
            r"(?i)(too complicated|complex|difficult)"
        ]
    
    def analyze_fathom_transcript(self, transcript: str, metadata: Dict) -> CallInsight:
        """Main analysis function for Fathom transcript"""
        
        # Extract basic info
        prospect_name = metadata.get('prospect_name', 'Unknown')
        company = metadata.get('company', 'Unknown')
        call_date = metadata.get('date', datetime.datetime.now().strftime('%Y-%m-%d'))
        duration = metadata.get('duration', 0)
        
        # Analyze content
        pain_points = self._extract_pain_points(transcript)
        objections = self._extract_objections(transcript)
        buying_signals = self._extract_buying_signals(transcript)
        decision_makers = self._extract_decision_makers(transcript)
        timeline = self._extract_timeline(transcript)
        budget_signals = self._extract_budget_signals(transcript)
        
        # Personality assessment
        personality = self._assess_personality(transcript)
        communication_style = self._assess_communication_style(transcript)
        
        # Extract key quotes
        key_quotes = self._extract_key_quotes(transcript)
        
        # Calculate next steps
        priority = self._calculate_priority(pain_points, objections, buying_signals)
        approach = self._recommend_approach(personality, objections, buying_signals)
        timing = self._recommend_timing(timeline, buying_signals, objections)
        close_prob = self._calculate_close_probability(pain_points, buying_signals, objections)
        
        return CallInsight(
            prospect_name=prospect_name,
            company=company,
            call_date=call_date,
            call_duration=duration,
            pain_points=pain_points,
            objections_raised=objections,
            buying_signals=buying_signals,
            decision_makers=decision_makers,
            timeline=timeline,
            budget_signals=budget_signals,
            follow_up_priority=priority,
            recommended_approach=approach,
            next_touch_timing=timing,
            close_probability=close_prob,
            prospect_personality=personality,
            communication_style=communication_style,
            key_quotes=key_quotes
        )
    
    def _extract_pain_points(self, transcript: str) -> List[str]:
        """Find pain points mentioned in the call"""
        pain_points = []
        
        for pattern in self.pain_point_patterns:
            matches = re.findall(pattern, transcript)
            pain_points.extend(matches)
        
        # Also look for emotional language
        emotional_patterns = [
            r"(?i)(frustrated|annoyed|upset).*(marketing|attendance|events)",
            r"(?i)(losing money|revenue|profit).*(events|marketing)",
            r"(?i)(waste|wasting).*(time|money|effort)"
        ]
        
        for pattern in emotional_patterns:
            matches = re.findall(pattern, transcript)
            pain_points.extend(matches)
            
        return list(set(pain_points))[:5]  # Top 5 unique pain points
    
    def _extract_objections(self, transcript: str) -> List[str]:
        """Identify objections raised during call"""
        objections = []
        
        for pattern in self.objection_patterns:
            matches = re.findall(pattern, transcript)
            objections.extend(matches)
            
        return list(set(objections))[:3]  # Top 3 objections
    
    def _extract_buying_signals(self, transcript: str) -> List[str]:
        """Find positive buying signals"""
        signals = []
        
        for pattern in self.buying_signal_patterns:
            matches = re.findall(pattern, transcript)
            signals.extend(matches)
            
        return list(set(signals))[:5]  # Top 5 buying signals
    
    def _extract_decision_makers(self, transcript: str) -> List[str]:
        """Identify decision makers mentioned"""
        dm_patterns = [
            r"(?i)(my|our).*(boss|manager|director|ceo|owner)",
            r"(?i)(need to|have to).*(talk to|discuss with|check with)",
            r"(?i)(partner|co-owner|board|team)"
        ]
        
        decision_makers = []
        for pattern in dm_patterns:
            matches = re.findall(pattern, transcript)
            decision_makers.extend(matches)
            
        return list(set(decision_makers))[:3]
    
    def _extract_timeline(self, transcript: str) -> Optional[str]:
        """Extract timeline information"""
        timeline_patterns = [
            r"(?i)(next|upcoming|planning).*(month|quarter|year)",
            r"(?i)(march|april|may|june|july|august|september|october|november|december)",
            r"(?i)(90 days|3 months|6 months|this year)"
        ]
        
        for pattern in timeline_patterns:
            match = re.search(pattern, transcript)
            if match:
                return match.group(0)
        
        return None
    
    def _extract_budget_signals(self, transcript: str) -> List[str]:
        """Find budget-related signals"""
        budget_patterns = [
            r"(?i)(budget|allocated|approved).*(amount|dollar|money)",
            r"(?i)(spend|invest|investment).*(marketing|advertising)",
            r"(?i)(cost|price|expensive|affordable)"
        ]
        
        signals = []
        for pattern in budget_patterns:
            matches = re.findall(pattern, transcript)
            signals.extend(matches)
            
        return list(set(signals))[:3]
    
    def _assess_personality(self, transcript: str) -> str:
        """Assess prospect personality type"""
        # Simplified personality assessment
        analytical_words = len(re.findall(r'(?i)(data|analysis|numbers|metrics|results|proof)', transcript))
        driver_words = len(re.findall(r'(?i)(quick|fast|now|immediately|results|bottom line)', transcript))
        expressive_words = len(re.findall(r'(?i)(exciting|love|hate|feel|amazing|terrible)', transcript))
        amiable_words = len(re.findall(r'(?i)(team|together|relationship|trust|comfortable)', transcript))
        
        scores = {
            'ANALYTICAL': analytical_words,
            'DRIVER': driver_words,
            'EXPRESSIVE': expressive_words,
            'AMIABLE': amiable_words
        }
        
        return max(scores, key=scores.get)
    
    def _assess_communication_style(self, transcript: str) -> str:
        """Assess how they prefer to communicate"""
        if re.search(r'(?i)(email|send|forward)', transcript):
            return "Prefers email communication"
        elif re.search(r'(?i)(call|phone|talk)', transcript):
            return "Prefers phone communication"
        elif re.search(r'(?i)(meet|person|office)', transcript):
            return "Prefers in-person meetings"
        else:
            return "Mixed communication preference"
    
    def _extract_key_quotes(self, transcript: str) -> List[str]:
        """Extract the most important quotes from the call"""
        # Look for quoted text or important statements
        quote_patterns = [
            r'"([^"]*)"',  # Quoted text
            r"(?i)(the main|biggest|most important).{1,50}(problem|challenge|issue)",
            r"(?i)(what I really need|what would help|looking for).{1,30}"
        ]
        
        quotes = []
        for pattern in quote_patterns:
            matches = re.findall(pattern, transcript)
            quotes.extend(matches)
            
        return list(set(quotes))[:3]  # Top 3 quotes
    
    def _calculate_priority(self, pain_points: List, objections: List, buying_signals: List) -> str:
        """Calculate follow-up priority"""
        score = len(buying_signals) * 3 + len(pain_points) * 2 - len(objections)
        
        if score >= 8:
            return "HIGH"
        elif score >= 4:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _recommend_approach(self, personality: str, objections: List, buying_signals: List) -> str:
        """Recommend follow-up approach based on personality and call content"""
        if personality == "ANALYTICAL":
            return "Send detailed case study with ROI calculations and data"
        elif personality == "DRIVER":
            return "Direct approach - focus on results and timeline"
        elif personality == "EXPRESSIVE":
            return "Story-based follow-up with client success examples"
        elif personality == "AMIABLE":
            return "Relationship-building approach with team benefits"
        else:
            return "Balanced approach with logic and emotion"
    
    def _recommend_timing(self, timeline: str, buying_signals: List, objections: List) -> str:
        """Recommend when to follow up next"""
        if len(buying_signals) > 3:
            return "Within 24 hours - high interest"
        elif timeline and ("urgent" in timeline.lower() or "soon" in timeline.lower()):
            return "Within 48 hours - timeline pressure"
        elif len(objections) > 2:
            return "3-5 days - let objections settle"
        else:
            return "2-3 days - standard follow-up"
    
    def _calculate_close_probability(self, pain_points: List, buying_signals: List, objections: List) -> int:
        """Calculate probability of closing this prospect"""
        base_score = 30
        base_score += len(pain_points) * 10  # Each pain point adds 10%
        base_score += len(buying_signals) * 15  # Each buying signal adds 15%
        base_score -= len(objections) * 8  # Each objection reduces by 8%
        
        return max(5, min(95, base_score))  # Keep between 5-95%
    
    def format_call_summary(self, insight: CallInsight) -> str:
        """Format call analysis for review"""
        return f"""
📞 CALL ANALYSIS - {insight.prospect_name}
=========================================
Company: {insight.company}
Date: {insight.call_date} | Duration: {insight.call_duration} min
Close Probability: {insight.close_probability}% | Priority: {insight.follow_up_priority}

🎯 KEY INSIGHTS:
Pain Points: {', '.join(insight.pain_points[:3]) if insight.pain_points else 'None identified'}
Buying Signals: {', '.join(insight.buying_signals[:3]) if insight.buying_signals else 'None identified'}
Objections: {', '.join(insight.objections_raised) if insight.objections_raised else 'None raised'}

👤 PROSPECT PROFILE:
Personality: {insight.prospect_personality}
Communication Style: {insight.communication_style}
Timeline: {insight.timeline or 'Not specified'}

📋 RECOMMENDED NEXT STEPS:
Approach: {insight.recommended_approach}
Timing: {insight.next_touch_timing}

💬 KEY QUOTES:
{chr(10).join(f'• "{quote}"' for quote in insight.key_quotes[:2]) if insight.key_quotes else '• No key quotes captured'}
"""

if __name__ == "__main__":
    # Example usage
    agent = CallAnalyzerAgent()
    
    # Sample transcript (in production, this comes from Fathom API)
    sample_transcript = """
    Prospect: "We've been struggling with unpredictable attendance at our healthcare events. 
    Last year we had to cancel one because only 50 people registered when we needed 200."
    
    Sales Rep: "That sounds frustrating. What's your timeline for your next event?"
    
    Prospect: "We have a medical conference in March, and I'm already worried about it. 
    The budget is approved, but I need to see some data on how your system works."
    """
    
    metadata = {
        'prospect_name': 'Dr. Smith',
        'company': 'HealthCorp',
        'date': '2024-02-19',
        'duration': 45
    }
    
    insight = agent.analyze_fathom_transcript(sample_transcript, metadata)
    print(agent.format_call_summary(insight))