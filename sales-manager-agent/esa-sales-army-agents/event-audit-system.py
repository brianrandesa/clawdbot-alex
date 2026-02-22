#!/usr/bin/env python3
"""
ESA EVENT AUDIT SYSTEM - 2-Call Close Framework
Call 1: Event Audit (Qualification + Value Building)
Call 2: Presentation (Solution + Close)
"""

import json
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
import datetime

@dataclass
class EventAuditScore:
    """Complete event audit scoring results"""
    prospect_name: str
    company: str
    event_name: str
    
    # Individual category scores
    event_type_score: int
    website_score: int
    experience_score: int
    past_attendance_score: int
    target_attendance_score: int
    ticket_price_score: int
    offer_at_event_score: int
    ad_spend_score: int
    leads_score: int
    tickets_sold_score: int
    sales_reps_score: int
    decision_maker_score: int
    crm_score: int
    ad_management_score: int
    instagram_score: int
    email_list_score: int
    bottleneck_score: int
    
    # Calculated totals
    total_score: int
    qualification_tier: str
    
    # Additional intelligence
    strongest_assets: List[str]
    biggest_gaps: List[str]
    revenue_potential: int
    recommended_package: str
    audit_insights: List[str]

class EventAuditSystem:
    """2-Call close system with event audit qualification"""
    
    def __init__(self):
        self.scoring_criteria = {
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
            'offer_at_event': {
                'Yes': 5,
                'No': 0
            },
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
            'decision_maker': {
                'Yes': 5,
                'No': 0
            },
            'crm': {
                'Yes': 5,
                'No': 0
            },
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
    
    def calculate_event_audit_score(self, audit_data: Dict) -> EventAuditScore:
        """Calculate complete event audit score"""
        
        # Calculate individual scores
        scores = {}
        for category, value in audit_data.items():
            if category in self.scoring_criteria:
                scores[f"{category}_score"] = self.scoring_criteria[category].get(value, 0)
        
        # Calculate total
        total_score = sum(scores.values())
        
        # Determine qualification tier
        if total_score >= 65:
            tier = "HIGHLY_QUALIFIED"
        elif total_score >= 50:
            tier = "MODERATELY_QUALIFIED"
        elif total_score >= 35:
            tier = "NEEDS_EVALUATION"
        else:
            tier = "NOT_QUALIFIED"
        
        # Analyze strengths and gaps
        strongest_assets = self._identify_strongest_assets(scores)
        biggest_gaps = self._identify_biggest_gaps(scores)
        
        # Calculate revenue potential
        revenue_potential = self._calculate_revenue_potential(audit_data, total_score)
        
        # Recommend package
        recommended_package = self._recommend_package(audit_data, total_score)
        
        # Generate audit insights
        audit_insights = self._generate_audit_insights(audit_data, scores, total_score)
        
        return EventAuditScore(
            prospect_name=audit_data.get('prospect_name', ''),
            company=audit_data.get('company', ''),
            event_name=audit_data.get('event_name', ''),
            total_score=total_score,
            qualification_tier=tier,
            strongest_assets=strongest_assets,
            biggest_gaps=biggest_gaps,
            revenue_potential=revenue_potential,
            recommended_package=recommended_package,
            audit_insights=audit_insights,
            **scores
        )
    
    def _identify_strongest_assets(self, scores: Dict) -> List[str]:
        """Identify the prospect's strongest assets"""
        
        assets = []
        strong_areas = {k: v for k, v in scores.items() if v >= 4}
        
        asset_mapping = {
            'event_type_score': 'High-value event type',
            'website_score': 'Professional web presence',
            'experience_score': 'Extensive event experience',
            'past_attendance_score': 'Strong historical attendance',
            'target_attendance_score': 'Ambitious attendance goals',
            'ticket_price_score': 'Premium ticket pricing',
            'offer_at_event_score': 'Monetization strategy in place',
            'ad_spend_score': 'Substantial marketing budget',
            'leads_score': 'Large lead database',
            'tickets_sold_score': 'Strong pre-event sales',
            'sales_reps_score': 'Dedicated sales team',
            'decision_maker_score': 'Direct decision authority',
            'crm_score': 'CRM infrastructure in place',
            'ad_management_score': 'Professional marketing support',
            'instagram_score': 'Strong social media presence',
            'email_list_score': 'Large email subscriber base',
            'bottleneck_score': 'Marketing-focused growth needs'
        }
        
        for score_key in strong_areas:
            if score_key in asset_mapping:
                assets.append(asset_mapping[score_key])
        
        return assets[:5]  # Top 5 assets
    
    def _identify_biggest_gaps(self, scores: Dict) -> List[str]:
        """Identify the biggest gaps/opportunities"""
        
        gaps = []
        weak_areas = {k: v for k, v in scores.items() if v <= 2}
        
        gap_mapping = {
            'website_score': 'Website needs professional upgrade',
            'experience_score': 'Limited event experience - needs guidance',
            'past_attendance_score': 'Historical attendance below potential',
            'target_attendance_score': 'Conservative attendance goals',
            'ticket_price_score': 'Undervalued ticket pricing',
            'offer_at_event_score': 'Missing monetization opportunity',
            'ad_spend_score': 'Insufficient marketing budget',
            'leads_score': 'Needs lead generation system',
            'tickets_sold_score': 'Slow pre-event sales',
            'sales_reps_score': 'No dedicated sales support',
            'crm_score': 'Missing CRM infrastructure',
            'ad_management_score': 'Unprofessional marketing approach',
            'instagram_score': 'Weak social media presence',
            'email_list_score': 'Small email subscriber base'
        }
        
        for score_key in weak_areas:
            if score_key in gap_mapping:
                gaps.append(gap_mapping[score_key])
        
        return gaps[:5]  # Top 5 gaps
    
    def _calculate_revenue_potential(self, audit_data: Dict, total_score: int) -> int:
        """Calculate potential revenue impact"""
        
        # Extract key revenue factors
        target_attendance = audit_data.get('target_attendance', '50-199 Attendees')
        ticket_price = audit_data.get('ticket_price', '$99-$199')
        
        # Estimate current capacity
        attendance_multiplier = {
            '500+ Attendees': 750,
            '200-499 Attendees': 350,
            '50-199 Attendees': 125,
            'Less than 50 Attendees': 25
        }.get(target_attendance, 125)
        
        # Estimate ticket price
        price_estimate = {
            '$500+': 750,
            '$200-$499': 350,
            '$99-$199': 150,
            'Free or under $99': 50
        }.get(ticket_price, 150)
        
        # Calculate potential revenue (assuming we can improve attendance by 50-100%)
        base_revenue = attendance_multiplier * price_estimate
        improvement_factor = 1.5 if total_score >= 50 else 1.3
        
        return int(base_revenue * improvement_factor)
    
    def _recommend_package(self, audit_data: Dict, total_score: int) -> str:
        """Recommend appropriate ESA package"""
        
        if total_score >= 65:
            return "6-Month Premium ($25K) - Full optimization and scaling"
        elif total_score >= 50:
            return "6-Month Standard ($25K) - Complete system implementation"
        elif total_score >= 35:
            return "3-Month Starter ($15K) - Foundation building"
        else:
            return "Not recommended - needs pre-qualification work"
    
    def _generate_audit_insights(self, audit_data: Dict, scores: Dict, total_score: int) -> List[str]:
        """Generate specific insights from the audit"""
        
        insights = []
        
        # High-level assessment
        if total_score >= 65:
            insights.append("EXCELLENT: Strong foundation for immediate scaling")
        elif total_score >= 50:
            insights.append("GOOD: Solid base with optimization opportunities")
        elif total_score >= 35:
            insights.append("POTENTIAL: Needs foundation work before scaling")
        else:
            insights.append("CHALLENGE: Significant development required")
        
        # Specific insights based on scoring patterns
        if scores.get('ad_spend_score', 0) >= 4 and scores.get('leads_score', 0) <= 2:
            insights.append("INSIGHT: High ad spend but low leads = conversion problem")
        
        if scores.get('leads_score', 0) >= 4 and scores.get('tickets_sold_score', 0) <= 2:
            insights.append("INSIGHT: Good leads but poor sales = closing problem")
        
        if scores.get('experience_score', 0) <= 2 and scores.get('target_attendance_score', 0) >= 4:
            insights.append("INSIGHT: Ambitious goals need experienced guidance")
        
        if scores.get('ticket_price_score', 0) <= 2:
            insights.append("OPPORTUNITY: Ticket pricing has significant upside")
        
        if scores.get('offer_at_event_score', 0) == 0:
            insights.append("OPPORTUNITY: Backend monetization could 3X revenue")
        
        # Decision maker assessment
        if scores.get('decision_maker_score', 0) == 0:
            insights.append("PROCESS: Need to involve decision maker in Call 2")
        
        return insights

    def create_audit_call_script(self, prospect_name: str) -> str:
        """Generate audit call script for Call 1"""
        
        script = f"""
🎯 EVENT AUDIT CALL SCRIPT - {prospect_name}
=============================================

OPENING (2 minutes):
"Hi {prospect_name}, thanks for taking time today. As discussed, I'm going to do a complete audit of your event to identify exactly where the biggest opportunities are for growth. This isn't a sales call - it's a diagnostic session to see if we're even the right fit for each other.

I'll ask you about 15 questions that cover everything from your current marketing to your revenue model. At the end, I'll give you a complete scorecard showing your strengths, gaps, and potential. Sound good?"

AUDIT QUESTIONS (20-25 minutes):

1. EVENT TYPE & EXPERIENCE:
"Tell me about this event - is this a business conference, workshop, trade show, or what type of event?"
"How many times have you hosted events like this?"

2. AUDIENCE & ATTENDANCE:
"What was your attendance at your last event?"
"What's your goal for this upcoming event?"

3. PRICING & MONETIZATION:
"What are you charging for tickets?"
"Do you sell anything at the event itself - coaching, products, services?"

4. MARKETING & LEADS:
"How much are you planning to spend on marketing between now and the event?"
"How many leads do you currently have for this event?"
"Who's running your ads right now?"

5. SALES & CONVERSION:
"How many tickets have you already sold?"
"Do you have sales reps calling leads, or is it all self-serve?"

6. INFRASTRUCTURE:
"Do you use a CRM to manage your leads?"
"Tell me about your website - professional, basic, or minimal?"

7. AUDIENCE BUILDING:
"How many Instagram followers do you have?"
"What's your email list size?"

8. DECISION MAKING:
"Are you the person who makes the final decision on marketing investments?"

9. BOTTLENECKS:
"What's your biggest bottleneck right now - marketing and sales, event management, content, or logistics?"

SCORING & FEEDBACK (10-15 minutes):
"Okay, let me score this and give you the results..."

[Calculate score in real-time]

"Here's your Event Success Score: [X] out of 75 points.

Your STRONGEST assets are:
• [Asset 1]
• [Asset 2] 
• [Asset 3]

Your BIGGEST opportunities are:
• [Gap 1]
• [Gap 2]
• [Gap 3]

Based on this audit, here's what I see:
[Share 2-3 specific insights]

TRANSITION TO CALL 2:
"Now, there are definitely ways to optimize this event and potentially [revenue opportunity impact]. But rather than throw information at you, let me put together a custom strategy based on your specific situation.

Can we schedule 30 minutes later this week where I'll show you exactly how we'd address these gaps and scale your strongest assets? I'll have a complete plan designed specifically for your event."

[Schedule Call 2]

CLOSING:
"Perfect. In the meantime, I'm going to send you a summary of today's audit plus a case study of someone with a very similar profile to yours. Look for that in about an hour."

NOTES FOR FOLLOW-UP:
• Qualification Tier: [TIER]
• Recommended Package: [PACKAGE]
• Key Talking Points for Call 2: [INSIGHTS]
• Follow-up content needed: Scorecard summary + relevant case study
"""
        return script

    def create_presentation_call_script(self, audit_score: EventAuditScore) -> str:
        """Generate presentation call script for Call 2"""
        
        script = f"""
🚀 PRESENTATION CALL SCRIPT - {audit_score.prospect_name}
========================================================

PRE-CALL PREP:
• Audit Score: {audit_score.total_score}/75 ({audit_score.qualification_tier})
• Revenue Potential: ${audit_score.revenue_potential:,}
• Recommended Package: {audit_score.recommended_package}
• Key Assets: {', '.join(audit_score.strongest_assets[:3])}
• Main Gaps: {', '.join(audit_score.biggest_gaps[:3])}

OPENING - RECAP AUDIT (3 minutes):
"Hi {audit_score.prospect_name}, great to reconnect. Last week we did the complete audit of {audit_score.event_name}, and you scored {audit_score.total_score} out of 75 - which puts you in the {audit_score.qualification_tier.replace('_', ' ')} category.

Just to recap, your strongest assets were {', '.join(audit_score.strongest_assets[:2])}, and your biggest opportunities were {', '.join(audit_score.biggest_gaps[:2])}.

Today I want to show you exactly how we'd address those gaps and scale what's already working."

CUSTOM STRATEGY PRESENTATION (15-20 minutes):

PROBLEM AGITATION:
"Based on your audit, here's what I see happening if nothing changes:
[Reference specific audit insights]

But here's what's possible when we optimize your system..."

SOLUTION FRAMEWORK:
"The Event Sales System we'd build for you has three components:

1. AUDIENCE OPTIMIZATION:
[Address their specific lead/audience gaps]
'Your current [weak area] becomes [strength] through [specific solution]'

2. CONVERSION SYSTEM:
[Address their sales/conversion gaps]
'Instead of [current situation], you'll have [optimized outcome]'

3. SCALE INFRASTRUCTURE:
[Address their systems/process gaps]
'Rather than [manual process], everything runs [automated system]'

PROOF & VALIDATION:
"Let me show you someone with almost identical audit results..."
[Share matching case study based on their score/profile]

VALUE STACKING:
"Here's everything you get in the {audit_score.recommended_package}:
[Customized based on their specific gaps and needs]

INVESTMENT & ROI:
"The investment for this complete system is {self._extract_package_price(audit_score.recommended_package)}.

Based on your audit, here's the math:
• Current potential: [Current capacity × ticket price]
• With our system: [Optimized capacity × ticket price]  
• Additional revenue: ${audit_score.revenue_potential - self._calculate_current_revenue(audit_score):,}
• ROI: {self._calculate_roi(audit_score)}%

This pays for itself with just this one event."

CLOSE:
"Based on your audit results and the revenue potential we identified, does it make sense to move forward with the {audit_score.recommended_package.split()[0]} system?"

OBJECTION HANDLING:
[Specific objections based on audit profile]

If DECISION MAKER = No:
"I understand you need to discuss this. Based on your audit, what do you think [decision maker] will be most concerned about?"

If BUDGET concerns:
"I get it - {self._extract_package_price(audit_score.recommended_package)} is a significant investment. But you're currently leaving ${audit_score.revenue_potential - self._calculate_current_revenue(audit_score):,} on the table with every event. Can you afford NOT to fix this?"

NEXT STEPS:
"Great decision. Here's what happens next:
1. I'll send the agreement today
2. We'll schedule our kickoff call within 48 hours  
3. Your first campaigns will be live within 2 weeks
4. You'll see results before your event

Any questions about the process?"
"""
        return script

    def create_nurture_sequence(self, audit_score: EventAuditScore) -> List[Dict]:
        """Create nurture sequence between Call 1 and Call 2"""
        
        sequence = []
        
        # Touch 1: Audit Summary (Same day)
        sequence.append({
            'timing': '2 hours after Call 1',
            'method': 'EMAIL',
            'subject': f'Your Event Audit Results - {audit_score.event_name}',
            'content': f"""Hi {audit_score.prospect_name},

Great talking with you today about {audit_score.event_name}!

As promised, here's your complete Event Success Scorecard:

🎯 YOUR SCORE: {audit_score.total_score}/75 points
📊 QUALIFICATION: {audit_score.qualification_tier.replace('_', ' ')}
💰 REVENUE POTENTIAL: ${audit_score.revenue_potential:,}

STRONGEST ASSETS:
{chr(10).join(f'✅ {asset}' for asset in audit_score.strongest_assets)}

BIGGEST OPPORTUNITIES:
{chr(10).join(f'🎯 {gap}' for gap in audit_score.biggest_gaps)}

KEY INSIGHTS:
{chr(10).join(f'💡 {insight}' for insight in audit_score.audit_insights)}

I'm excited to show you the custom strategy I'm building for {audit_score.event_name} on our call {audit_score.recommended_package}.

Looking forward to our presentation call!

Best,
[Your name]"""
        })
        
        # Touch 2: Relevant Case Study (Next day)
        sequence.append({
            'timing': '24 hours after Call 1',
            'method': 'EMAIL', 
            'subject': f'Case Study: Similar Event to {audit_score.event_name}',
            'content': f"""Hi {audit_score.prospect_name},

I was reviewing similar events to {audit_score.event_name} and found a perfect case study to share.

This client had a very similar audit profile to yours:
• Score: {audit_score.total_score - 3} out of 75 (almost identical)
• Similar strengths: {audit_score.strongest_assets[0] if audit_score.strongest_assets else 'Strong foundation'}
• Same challenge: {audit_score.biggest_gaps[0] if audit_score.biggest_gaps else 'Growth opportunities'}

RESULTS AFTER 90 DAYS:
• Attendance increased from {self._get_estimated_current_attendance(audit_score)} to [optimized number]
• Revenue grew by ${audit_score.revenue_potential - self._calculate_current_revenue(audit_score):,}
• System now runs automatically

The complete case study is attached.

Can't wait to show you how we'd apply these same strategies to {audit_score.event_name}!

Best,
[Your name]"""
        })
        
        # Touch 3: Pre-Call 2 Reminder (Day before Call 2)
        sequence.append({
            'timing': '24 hours before Call 2',
            'method': 'SMS',
            'content': f"""Hi {audit_score.prospect_name}! Looking forward to our call tomorrow where I'll show you the custom strategy for {audit_score.event_name}. I think you're going to love what I've put together based on your audit results! 🎯"""
        })
        
        return sequence

    def format_audit_briefing(self, audit_score: EventAuditScore) -> str:
        """Format audit results for team briefing"""
        
        return f"""
📋 EVENT AUDIT COMPLETED - {audit_score.prospect_name}
====================================================
Company: {audit_score.company}
Event: {audit_score.event_name}
Audit Date: {datetime.datetime.now().strftime('%Y-%m-%d')}

🎯 QUALIFICATION RESULTS:
Score: {audit_score.total_score}/75 points
Tier: {audit_score.qualification_tier}
Package Rec: {audit_score.recommended_package}
Revenue Potential: ${audit_score.revenue_potential:,}

💪 STRONGEST ASSETS:
{chr(10).join(f'• {asset}' for asset in audit_score.strongest_assets)}

🎯 BIGGEST OPPORTUNITIES:
{chr(10).join(f'• {gap}' for gap in audit_score.biggest_gaps)}

💡 KEY INSIGHTS:
{chr(10).join(f'• {insight}' for insight in audit_score.audit_insights)}

📞 NEXT STEPS:
• Call 2 scheduled: [DATE/TIME]
• Nurture sequence: ACTIVATED
• Custom presentation: IN DEVELOPMENT
• Expected close probability: {self._calculate_close_probability(audit_score)}%

NOTES FOR CALL 2:
• Focus on revenue gap: ${audit_score.revenue_potential - self._calculate_current_revenue(audit_score):,}
• Lead with strongest asset: {audit_score.strongest_assets[0] if audit_score.strongest_assets else 'N/A'}
• Address main gap: {audit_score.biggest_gaps[0] if audit_score.biggest_gaps else 'N/A'}
• Use {audit_score.qualification_tier} positioning approach
"""

    # Helper methods
    def _extract_package_price(self, package_rec: str) -> str:
        """Extract price from package recommendation"""
        if "$25K" in package_rec:
            return "$25,000"
        elif "$15K" in package_rec:
            return "$15,000"
        else:
            return "Contact for pricing"
    
    def _calculate_current_revenue(self, audit_score: EventAuditScore) -> int:
        """Estimate current revenue based on audit"""
        return int(audit_score.revenue_potential * 0.6)  # Assume 60% of potential
    
    def _calculate_roi(self, audit_score: EventAuditScore) -> int:
        """Calculate ROI percentage"""
        package_cost = 25000 if "$25K" in audit_score.recommended_package else 15000
        additional_revenue = audit_score.revenue_potential - self._calculate_current_revenue(audit_score)
        return int((additional_revenue - package_cost) / package_cost * 100)
    
    def _get_estimated_current_attendance(self, audit_score: EventAuditScore) -> str:
        """Get estimated current attendance for case study"""
        if audit_score.revenue_potential > 200000:
            return "180 people"
        elif audit_score.revenue_potential > 100000:
            return "120 people"
        else:
            return "75 people"
    
    def _calculate_close_probability(self, audit_score: EventAuditScore) -> int:
        """Calculate close probability based on audit score"""
        if audit_score.qualification_tier == "HIGHLY_QUALIFIED":
            return 85
        elif audit_score.qualification_tier == "MODERATELY_QUALIFIED":
            return 65
        elif audit_score.qualification_tier == "NEEDS_EVALUATION":
            return 35
        else:
            return 15

if __name__ == "__main__":
    # Example usage
    audit_system = EventAuditSystem()
    
    # Sample audit data
    sample_audit = {
        'prospect_name': 'Dr. Sarah Johnson',
        'company': 'HealthTech Solutions',
        'event_name': 'Medical Innovation Summit 2024',
        'event_type': 'Business Seminar/Conference',
        'website': 'Professional Website (Up-to-date, detailed)',
        'experience': '5-9 Times',
        'past_attendance': '200-499 Attendees',
        'target_attendance': '500+ Attendees',
        'ticket_price': '$200-$499',
        'offer_at_event': 'Yes',
        'ad_spend': '$10,000-$19,999',
        'leads': '200-499 Leads',
        'tickets_sold': '100-299 Tickets',
        'sales_reps': '3-4 Reps',
        'decision_maker': 'Yes',
        'crm': 'Yes',
        'ad_management': 'Freelancer',
        'instagram': '5,000-9,999 Followers',
        'email_list': '5,000-9,999 Subscribers',
        'bottleneck': 'Marketing and Sales'
    }
    
    # Calculate audit score
    audit_score = audit_system.calculate_event_audit_score(sample_audit)
    
    # Display results
    print(audit_system.format_audit_briefing(audit_score))
    
    # Generate call scripts
    print("\n" + "="*50)
    print(audit_system.create_audit_call_script(audit_score.prospect_name))