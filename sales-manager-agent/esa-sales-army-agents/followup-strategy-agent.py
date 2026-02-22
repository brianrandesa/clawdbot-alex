#!/usr/bin/env python3
"""
ESA FOLLOW-UP STRATEGY AGENT
Creates custom follow-up sequences based on call analysis
"""

import json
import datetime
from dataclasses import dataclass
from typing import List, Dict, Optional
import random

@dataclass
class FollowUpTouch:
    """Individual follow-up touchpoint"""
    touch_number: int
    method: str  # SMS, EMAIL, LINKEDIN, VIDEO, CALL
    timing: str  # e.g., "24 hours", "3 days", "1 week"
    subject: str
    content: str
    purpose: str  # NURTURE, OBJECTION_HANDLE, VALUE_ADD, CLOSE
    requires_approval: bool = True

@dataclass
class FollowUpSequence:
    """Complete follow-up strategy for a prospect"""
    prospect_name: str
    company: str
    sequence_type: str  # HOT, WARM, COLD, OBJECTION_HEAVY
    total_touches: int
    estimated_close_date: str
    touches: List[FollowUpTouch]
    success_metrics: Dict[str, str]

class FollowUpStrategyAgent:
    """Intelligent follow-up sequence creation"""
    
    def __init__(self):
        # ESA case studies and proof points
        self.case_studies = {
            'healthcare': {
                'client': 'MedCon 2023',
                'before': '150 attendees (30% capacity)',
                'after': '475 attendees (95% capacity)', 
                'timeline': '90 days',
                'revenue_impact': '$320,000 additional revenue'
            },
            'technology': {
                'client': 'TechSummit Pro',
                'before': '200 attendees (40% capacity)',
                'after': '485 attendees (97% capacity)',
                'timeline': '75 days',
                'revenue_impact': '$285,000 additional revenue'
            },
            'business': {
                'client': 'Business Growth Expo',
                'before': '100 attendees (25% capacity)',
                'after': '380 attendees (95% capacity)',
                'timeline': '60 days',
                'revenue_impact': '$420,000 additional revenue'
            }
        }
        
        # ROI calculator templates
        self.roi_templates = {
            'small_event': 'For a 200-capacity event, going from 40% to 95% attendance = $150K additional revenue',
            'medium_event': 'For a 400-capacity event, going from 50% to 95% attendance = $300K additional revenue',
            'large_event': 'For a 800-capacity event, going from 60% to 95% attendance = $500K additional revenue'
        }

    def create_follow_up_sequence(self, call_insight, prospect_context: Dict) -> FollowUpSequence:
        """Main function to create custom follow-up sequence"""
        
        # Determine sequence type based on call analysis
        sequence_type = self._determine_sequence_type(call_insight)
        
        # Choose appropriate strategy
        if sequence_type == "HOT":
            touches = self._create_hot_prospect_sequence(call_insight, prospect_context)
        elif sequence_type == "WARM":
            touches = self._create_warm_prospect_sequence(call_insight, prospect_context)
        elif sequence_type == "OBJECTION_HEAVY":
            touches = self._create_objection_handling_sequence(call_insight, prospect_context)
        else:
            touches = self._create_cold_nurture_sequence(call_insight, prospect_context)
        
        # Calculate estimated close date
        close_date = self._estimate_close_date(call_insight, sequence_type)
        
        return FollowUpSequence(
            prospect_name=call_insight.prospect_name,
            company=call_insight.company,
            sequence_type=sequence_type,
            total_touches=len(touches),
            estimated_close_date=close_date,
            touches=touches,
            success_metrics=self._define_success_metrics(sequence_type)
        )
    
    def _determine_sequence_type(self, call_insight) -> str:
        """Analyze call to determine follow-up strategy type"""
        buying_signals = len(call_insight.buying_signals)
        objections = len(call_insight.objections_raised)
        pain_points = len(call_insight.pain_points)
        
        if buying_signals >= 3 and objections <= 1:
            return "HOT"
        elif buying_signals >= 2 and pain_points >= 2:
            return "WARM" 
        elif objections >= 3:
            return "OBJECTION_HEAVY"
        else:
            return "COLD"
    
    def _create_hot_prospect_sequence(self, call_insight, context: Dict) -> List[FollowUpTouch]:
        """Create sequence for hot prospects with high buying intent"""
        
        industry = context.get('industry', 'business').lower()
        event_size = context.get('event_capacity', 400)
        
        touches = [
            FollowUpTouch(
                touch_number=1,
                method="SMS",
                timing="4 hours",
                subject="Quick follow-up from our call",
                content=f"Hi {call_insight.prospect_name}! Great talking today about {context.get('event_name', 'your upcoming event')}. "
                       f"As discussed, I'm sending the {industry} case study that shows exactly how we took a similar event "
                       f"from {int(event_size * 0.4)} to {int(event_size * 0.95)} attendees. Check your email in 5 minutes!",
                purpose="IMMEDIATE_VALUE",
                requires_approval=True
            ),
            
            FollowUpTouch(
                touch_number=2,
                method="EMAIL",
                timing="4 hours 5 minutes",
                subject=f"Case Study: How We Filled {self.case_studies[industry]['client']} to 95% Capacity",
                content=self._generate_case_study_email(call_insight, industry, context),
                purpose="PROOF_DELIVERY",
                requires_approval=True
            ),
            
            FollowUpTouch(
                touch_number=3,
                method="VIDEO",
                timing="24 hours",
                subject="Personal video about your event success",
                content=f"Record personal video: 'Hi {call_insight.prospect_name}, after our call yesterday, "
                       f"I kept thinking about {context.get('event_name')} and how we can guarantee 90%+ attendance. "
                       f"Here's exactly what the first 30 days would look like...'",
                purpose="PERSONAL_CONNECTION",
                requires_approval=True
            ),
            
            FollowUpTouch(
                touch_number=4,
                method="CALL",
                timing="48 hours",
                subject="Follow-up call to discuss next steps",
                content="CALL SCRIPT: 'Hi [Name], I wanted to follow up on the case study and video I sent. "
                       "Based on your timeline for [event], when would you like to move forward to guarantee those results?'",
                purpose="CLOSE",
                requires_approval=False
            )
        ]
        
        return touches
    
    def _create_warm_prospect_sequence(self, call_insight, context: Dict) -> List[FollowUpTouch]:
        """Create sequence for warm prospects who need more nurturing"""
        
        industry = context.get('industry', 'business').lower()
        
        touches = [
            FollowUpTouch(
                touch_number=1,
                method="EMAIL",
                timing="24 hours",
                subject="Thank you + next steps for your event success",
                content=self._generate_warm_email_1(call_insight, context),
                purpose="NURTURE",
                requires_approval=True
            ),
            
            FollowUpTouch(
                touch_number=2,
                method="SMS",
                timing="3 days",
                subject="Quick question about your event timeline",
                content=f"Hi {call_insight.prospect_name}! Hope you had a chance to review the information I sent. "
                       f"Quick question - is {context.get('event_date', 'your event')} still the target date? "
                       f"Want to make sure we have enough time to optimize everything 📅",
                purpose="ENGAGEMENT",
                requires_approval=True
            ),
            
            FollowUpTouch(
                touch_number=3,
                method="EMAIL",
                timing="1 week",
                subject="ROI Calculator: Your Event Revenue Opportunity",
                content=self._generate_roi_calculator_email(call_insight, context),
                purpose="VALUE_DEMONSTRATION",
                requires_approval=True
            ),
            
            FollowUpTouch(
                touch_number=4,
                method="LINKEDIN",
                timing="10 days",
                subject="LinkedIn connection with value",
                content=f"Hi {call_insight.prospect_name}, saw your recent post about [industry topic]. "
                       f"Based on our conversation about {context.get('event_name')}, thought you'd find this "
                       f"relevant: [attach industry-specific insight]. Still thinking about our discussion?",
                purpose="SOCIAL_TOUCH",
                requires_approval=True
            ),
            
            FollowUpTouch(
                touch_number=5,
                method="CALL",
                timing="2 weeks",
                subject="Check-in call",
                content="CALL SCRIPT: 'Hi [Name], wanted to check in about [event]. Have you had a chance to "
                       "think about our conversation? Any questions come up that I can help with?'",
                purpose="SOFT_CLOSE",
                requires_approval=False
            )
        ]
        
        return touches
    
    def _create_objection_handling_sequence(self, call_insight, context: Dict) -> List[FollowUpTouch]:
        """Create sequence focused on handling specific objections"""
        
        main_objections = call_insight.objections_raised[:2]  # Focus on top 2 objections
        
        touches = [
            FollowUpTouch(
                touch_number=1,
                method="EMAIL",
                timing="24 hours",
                subject="Addressing your concerns about event marketing",
                content=self._generate_objection_handling_email(call_insight, main_objections, context),
                purpose="OBJECTION_HANDLE",
                requires_approval=True
            ),
            
            FollowUpTouch(
                touch_number=2,
                method="SMS",
                timing="4 days",
                subject="Quick thought about our conversation",
                content=f"Hi {call_insight.prospect_name}! Been thinking about your concerns regarding "
                       f"{main_objections[0] if main_objections else 'the investment'}. "
                       f"Actually helped a client with the exact same situation last month. Mind if I share what happened?",
                purpose="STORY_BRIDGE",
                requires_approval=True
            ),
            
            FollowUpTouch(
                touch_number=3,
                method="EMAIL",
                timing="1 week",
                subject="Client story: Overcoming the same challenge you mentioned",
                content=self._generate_objection_story_email(call_insight, main_objections, context),
                purpose="SOCIAL_PROOF",
                requires_approval=True
            ),
            
            FollowUpTouch(
                touch_number=4,
                method="VIDEO",
                timing="10 days",
                subject="Personal message about moving forward",
                content=f"Record video: 'Hi {call_insight.prospect_name}, I know you had some concerns about [main objection]. "
                       f"I respect that. Here's what I'd do if I were in your position...'",
                purpose="PERSONAL_ADDRESS",
                requires_approval=True
            ),
            
            FollowUpTouch(
                touch_number=5,
                method="CALL",
                timing="2 weeks",
                subject="Final check-in call",
                content="CALL SCRIPT: 'Hi [Name], I don't want to be pushy, but I also don't want you to miss out "
                       "on solving [main pain point]. What would need to happen for this to make sense for you?'",
                purpose="FINAL_ATTEMPT",
                requires_approval=False
            )
        ]
        
        return touches
    
    def _create_cold_nurture_sequence(self, call_insight, context: Dict) -> List[FollowUpTouch]:
        """Create long-term nurture sequence for cold prospects"""
        
        touches = [
            FollowUpTouch(
                touch_number=1,
                method="EMAIL",
                timing="2 days",
                subject="Thank you + helpful resource",
                content=self._generate_cold_nurture_email_1(call_insight, context),
                purpose="NURTURE",
                requires_approval=True
            ),
            
            FollowUpTouch(
                touch_number=2,
                method="SMS",
                timing="1 week",
                subject="Industry insight you might find valuable",
                content=f"Hi {call_insight.prospect_name}! Came across this article about event trends in "
                       f"{context.get('industry', 'your industry')} - thought you'd find it interesting. "
                       f"[Link] Hope your planning is going well!",
                purpose="VALUE_ADD",
                requires_approval=True
            ),
            
            FollowUpTouch(
                touch_number=3,
                method="EMAIL",
                timing="3 weeks",
                subject="Event marketing checklist for your upcoming event",
                content=self._generate_checklist_email(call_insight, context),
                purpose="HELPFUL_RESOURCE",
                requires_approval=True
            ),
            
            FollowUpTouch(
                touch_number=4,
                method="CALL",
                timing="6 weeks",
                subject="Gentle check-in call",
                content="CALL SCRIPT: 'Hi [Name], just wanted to see how your event planning is progressing. "
                       "Any new challenges come up that I might be able to help with?'",
                purpose="SOFT_TOUCH",
                requires_approval=False
            )
        ]
        
        return touches
    
    def _generate_case_study_email(self, call_insight, industry: str, context: Dict) -> str:
        """Generate case study email content"""
        case_study = self.case_studies.get(industry, self.case_studies['business'])
        
        return f"""Hi {call_insight.prospect_name},

Great talking with you today about {context.get('event_name', 'your upcoming event')}!

As promised, here's the case study that directly relates to your situation:

🎯 CLIENT: {case_study['client']}
📊 BEFORE: {case_study['before']}
🚀 AFTER: {case_study['after']}
⏱️ TIMELINE: {case_study['timeline']}
💰 REVENUE IMPACT: {case_study['revenue_impact']}

The key breakthrough came when we implemented our 3-part system:
1. Psychology-based ad targeting (found their perfect attendees)
2. Conversion-optimized registration process (45% higher conversion rate)
3. Automated follow-up sequences (reduced no-shows from 40% to 8%)

Based on your event size and timeline, I'm confident we can achieve similar results for {context.get('event_name', 'your event')}.

Ready to discuss next steps?

Best regards,
[Closer Name]

P.S. I'm recording a quick video showing exactly how this would work for your specific event. Will send it tomorrow!"""

    def _generate_roi_calculator_email(self, call_insight, context: Dict) -> str:
        """Generate ROI calculator email"""
        event_capacity = context.get('event_capacity', 400)
        ticket_price = context.get('ticket_price', 500)
        current_attendance = int(event_capacity * 0.6)  # Assume 60% current
        target_attendance = int(event_capacity * 0.95)   # Target 95%
        revenue_gap = (target_attendance - current_attendance) * ticket_price
        
        return f"""Hi {call_insight.prospect_name},

I've been thinking about our conversation regarding {context.get('event_name', 'your event')}.

Here's a quick ROI analysis based on what you shared:

📊 YOUR EVENT ECONOMICS:
• Current average attendance: {current_attendance} people
• Event capacity: {event_capacity} people
• Ticket price: ${ticket_price}
• Current revenue: ${current_attendance * ticket_price:,}

🚀 WITH ESA SYSTEM:
• Target attendance: {target_attendance} people (95% capacity)
• Projected revenue: ${target_attendance * ticket_price:,}
• ADDITIONAL REVENUE: ${revenue_gap:,}

💡 INVESTMENT COMPARISON:
• ESA System Investment: $25,000 (6 months)
• Additional Revenue Generated: ${revenue_gap:,}
• ROI: {int((revenue_gap - 25000) / 25000 * 100)}%

The math speaks for itself - this pays for itself with just ONE successful event.

Want to discuss how we can guarantee these results for your {context.get('industry', 'industry')} event?

Best,
[Closer Name]"""

    def _generate_objection_handling_email(self, call_insight, objections: List, context: Dict) -> str:
        """Generate email that addresses specific objections"""
        
        # Common objection responses
        objection_responses = {
            'expensive': f"""I understand the investment feels significant. Let me put this in perspective:

If {context.get('event_name', 'your event')} doesn't reach capacity, you're potentially losing $50,000-$200,000 in revenue. Our $25,000 investment protects against that loss and actually generates additional revenue.

It's not an expense - it's revenue insurance with guaranteed upside.""",
            
            'tried before': """I hear this a lot - "We've tried marketing before and it didn't work."

Here's the difference: Most event marketing is amateur hour - posting on social media and hoping for the best. We use psychology-based systems that predictably convert browsers into buyers.

The clients who say "we tried marketing before" become our biggest success stories because they finally see what professional event marketing looks like.""",
            
            'think about': """I completely respect your need to think this through. This is an important decision.

While you're considering it, let me ask: What's the cost of thinking about it for too long? With your event timeline, we need to start the system soon to achieve optimal results.

What specific information would help you make a confident decision?"""
        }
        
        main_objection = objections[0] if objections else 'investment'
        response = objection_responses.get(main_objection, objection_responses['expensive'])
        
        return f"""Hi {call_insight.prospect_name},

Thank you for the honest conversation today about {context.get('event_name', 'your event')}.

I wanted to address your concern about {main_objection}:

{response}

I've helped dozens of event organizers who had the exact same concern. Happy to share specific examples if that would be helpful.

What questions can I answer to help you move forward with confidence?

Best regards,
[Closer Name]"""

    def _estimate_close_date(self, call_insight, sequence_type: str) -> str:
        """Estimate when this prospect might close"""
        base_days = {
            'HOT': 5,
            'WARM': 14,
            'OBJECTION_HEAVY': 21,
            'COLD': 45
        }
        
        days = base_days.get(sequence_type, 30)
        close_date = datetime.datetime.now() + datetime.timedelta(days=days)
        return close_date.strftime('%Y-%m-%d')
    
    def _define_success_metrics(self, sequence_type: str) -> Dict[str, str]:
        """Define what success looks like for this sequence"""
        return {
            'primary_goal': 'Schedule closing call' if sequence_type in ['HOT', 'WARM'] else 'Generate engagement',
            'engagement_target': '60%+ email opens, 40%+ response rate',
            'timeline_goal': f'Close within {self._estimate_close_date(None, sequence_type)} days',
            'fallback_goal': 'Move to long-term nurture sequence'
        }

    def format_sequence_for_approval(self, sequence: FollowUpSequence) -> str:
        """Format follow-up sequence for Brian/Nick/Chris approval"""
        
        output = f"""
🎯 FOLLOW-UP STRATEGY: {sequence.prospect_name} ({sequence.company})
================================================================
Sequence Type: {sequence.sequence_type}
Total Touches: {sequence.total_touches}
Estimated Close: {sequence.estimated_close_date}

SEQUENCE OVERVIEW:
"""
        
        for touch in sequence.touches:
            output += f"""
Touch #{touch.touch_number} - {touch.method} ({touch.timing})
Subject: {touch.subject}
Purpose: {touch.purpose}
{'🔴 REQUIRES APPROVAL' if touch.requires_approval else '🟢 AUTO-SEND'}

Content Preview:
{touch.content[:200]}{"..." if len(touch.content) > 200 else ""}

---"""
        
        output += f"""

SUCCESS METRICS:
• Primary Goal: {sequence.success_metrics['primary_goal']}
• Engagement Target: {sequence.success_metrics['engagement_target']}
• Timeline Goal: {sequence.success_metrics['timeline_goal']}
"""
        
        return output

if __name__ == "__main__":
    # Example usage
    from call_analyzer_agent import CallInsight
    
    agent = FollowUpStrategyAgent()
    
    # Sample call insight
    sample_insight = CallInsight(
        prospect_name="Dr. Smith",
        company="HealthCorp",
        call_date="2024-02-19",
        call_duration=45,
        pain_points=["unpredictable attendance", "marketing not working"],
        objections_raised=["expensive"],
        buying_signals=["need solution", "timeline pressure", "budget approved"],
        decision_makers=["board approval needed"],
        timeline="March event",
        budget_signals=["budget allocated"],
        follow_up_priority="HIGH",
        recommended_approach="analytical with data",
        next_touch_timing="24 hours",
        close_probability=75,
        prospect_personality="ANALYTICAL",
        communication_style="prefers email",
        key_quotes=["We need predictable results"]
    )
    
    context = {
        'industry': 'healthcare',
        'event_name': 'Medical Conference 2024',
        'event_capacity': 500,
        'ticket_price': 400,
        'event_date': '2024-03-15'
    }
    
    sequence = agent.create_follow_up_sequence(sample_insight, context)
    print(agent.format_sequence_for_approval(sequence))