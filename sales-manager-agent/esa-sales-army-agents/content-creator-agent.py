#!/usr/bin/env python3
"""
ESA CONTENT CREATOR AGENT
Generates personalized SMS, emails, and messages for follow-up sequences
"""

import json
import datetime
from dataclasses import dataclass
from typing import List, Dict, Optional
import random

@dataclass
class GeneratedContent:
    """Generated content for a specific touchpoint"""
    prospect_name: str
    company: str
    method: str  # SMS, EMAIL, LINKEDIN, VIDEO_SCRIPT
    subject: str
    content: str
    personalization_elements: List[str]
    approval_required: bool
    send_timing: str
    backup_versions: List[str]  # Alternative versions for A/B testing

class ContentCreatorAgent:
    """Intelligent content generation for sales follow-up"""
    
    def __init__(self):
        # Personality-based writing styles
        self.writing_styles = {
            'ANALYTICAL': {
                'tone': 'professional, data-driven, logical',
                'structure': 'problem → data → solution → next step',
                'language': 'precise, factual, metrics-focused'
            },
            'DRIVER': {
                'tone': 'direct, results-focused, urgent',
                'structure': 'bottom line → benefits → action required',
                'language': 'concise, powerful, action-oriented'
            },
            'EXPRESSIVE': {
                'tone': 'enthusiastic, story-driven, emotional',
                'structure': 'story → connection → excitement → invitation',
                'language': 'vivid, engaging, inspiring'
            },
            'AMIABLE': {
                'tone': 'friendly, relationship-focused, supportive',
                'structure': 'rapport → understanding → collaboration → partnership',
                'language': 'warm, inclusive, team-oriented'
            }
        }
        
        # Industry-specific language and examples
        self.industry_context = {
            'healthcare': {
                'terminology': ['patient outcomes', 'medical professionals', 'healthcare innovation', 'clinical excellence'],
                'pain_points': ['physician attendance', 'CE credits', 'research presentation', 'medical advancement'],
                'motivators': ['better patient care', 'latest treatments', 'networking with specialists', 'career development']
            },
            'technology': {
                'terminology': ['innovation', 'disruption', 'scalability', 'digital transformation'],
                'pain_points': ['staying competitive', 'latest trends', 'technical skills gap', 'market changes'],
                'motivators': ['cutting-edge insights', 'network expansion', 'competitive advantage', 'tech leadership']
            },
            'business': {
                'terminology': ['growth strategy', 'market opportunity', 'competitive advantage', 'business development'],
                'pain_points': ['revenue growth', 'market share', 'operational efficiency', 'team development'],
                'motivators': ['business growth', 'industry leadership', 'professional development', 'strategic networking']
            }
        }

    def generate_personalized_sms(self, prospect_info: Dict, context: Dict, purpose: str) -> GeneratedContent:
        """Generate personalized SMS based on prospect and context"""
        
        name = prospect_info.get('name', 'there')
        company = prospect_info.get('company', 'your company')
        personality = prospect_info.get('personality', 'DRIVER')
        industry = context.get('industry', 'business')
        
        if purpose == "IMMEDIATE_VALUE":
            content = self._generate_immediate_value_sms(name, company, personality, industry, context)
        elif purpose == "ENGAGEMENT":
            content = self._generate_engagement_sms(name, company, personality, industry, context)
        elif purpose == "STORY_BRIDGE":
            content = self._generate_story_bridge_sms(name, company, personality, industry, context)
        elif purpose == "VALUE_ADD":
            content = self._generate_value_add_sms(name, company, personality, industry, context)
        else:
            content = self._generate_generic_sms(name, company, personality, industry, context)
        
        return GeneratedContent(
            prospect_name=name,
            company=company,
            method="SMS",
            subject="Follow-up SMS",
            content=content,
            personalization_elements=self._extract_personalization_elements(content, prospect_info, context),
            approval_required=True,
            send_timing=context.get('timing', 'immediate'),
            backup_versions=self._generate_sms_variations(content, name, personality)
        )

    def generate_personalized_email(self, prospect_info: Dict, context: Dict, purpose: str) -> GeneratedContent:
        """Generate personalized email based on prospect and context"""
        
        name = prospect_info.get('name', 'there')
        company = prospect_info.get('company', 'your company')
        personality = prospect_info.get('personality', 'ANALYTICAL')
        industry = context.get('industry', 'business')
        
        if purpose == "CASE_STUDY":
            subject, content = self._generate_case_study_email(name, company, personality, industry, context)
        elif purpose == "ROI_CALCULATOR":
            subject, content = self._generate_roi_email(name, company, personality, industry, context)
        elif purpose == "OBJECTION_HANDLE":
            subject, content = self._generate_objection_email(name, company, personality, industry, context)
        elif purpose == "NURTURE":
            subject, content = self._generate_nurture_email(name, company, personality, industry, context)
        else:
            subject, content = self._generate_generic_email(name, company, personality, industry, context)
        
        return GeneratedContent(
            prospect_name=name,
            company=company,
            method="EMAIL",
            subject=subject,
            content=content,
            personalization_elements=self._extract_personalization_elements(content, prospect_info, context),
            approval_required=True,
            send_timing=context.get('timing', 'immediate'),
            backup_versions=self._generate_email_variations(subject, content, name, personality)
        )

    def generate_video_script(self, prospect_info: Dict, context: Dict, purpose: str) -> GeneratedContent:
        """Generate personalized video script"""
        
        name = prospect_info.get('name', 'there')
        company = prospect_info.get('company', 'your company')
        personality = prospect_info.get('personality', 'EXPRESSIVE')
        industry = context.get('industry', 'business')
        
        script = self._generate_video_script_content(name, company, personality, industry, context, purpose)
        
        return GeneratedContent(
            prospect_name=name,
            company=company,
            method="VIDEO_SCRIPT",
            subject=f"Personal video for {name}",
            content=script,
            personalization_elements=self._extract_personalization_elements(script, prospect_info, context),
            approval_required=True,
            send_timing=context.get('timing', 'immediate'),
            backup_versions=self._generate_video_script_variations(script, name, personality)
        )

    def generate_linkedin_message(self, prospect_info: Dict, context: Dict, purpose: str) -> GeneratedContent:
        """Generate personalized LinkedIn message"""
        
        name = prospect_info.get('name', 'there')
        company = prospect_info.get('company', 'your company')
        personality = prospect_info.get('personality', 'AMIABLE')
        industry = context.get('industry', 'business')
        
        content = self._generate_linkedin_content(name, company, personality, industry, context, purpose)
        
        return GeneratedContent(
            prospect_name=name,
            company=company,
            method="LINKEDIN",
            subject="LinkedIn connection message",
            content=content,
            personalization_elements=self._extract_personalization_elements(content, prospect_info, context),
            approval_required=True,
            send_timing=context.get('timing', 'immediate'),
            backup_versions=self._generate_linkedin_variations(content, name, personality)
        )

    # SMS Generation Methods
    def _generate_immediate_value_sms(self, name: str, company: str, personality: str, industry: str, context: Dict) -> str:
        event_name = context.get('event_name', 'your upcoming event')
        
        if personality == 'DRIVER':
            return f"Hi {name}! Sending that {industry} case study now - shows exactly how we took a similar event from 40% to 95% capacity in 75 days. Check email in 3 min! 🚀"
        elif personality == 'ANALYTICAL':
            return f"Hi {name}, as discussed, I'm sending the data on how we increased {industry} event attendance by 138% using our 3-part system. Email arriving shortly with full metrics."
        elif personality == 'EXPRESSIVE':
            return f"{name}! SO excited to share this success story with you - it's going to blow your mind how we transformed this {industry} event! Check your email in 2 minutes! 🎯"
        else:  # AMIABLE
            return f"Hi {name}, hope you're having a great day! As promised, I'm sending over that case study about {event_name}. Think you'll really connect with this client's journey."

    def _generate_engagement_sms(self, name: str, company: str, personality: str, industry: str, context: Dict) -> str:
        event_date = context.get('event_date', 'your event date')
        
        templates = [
            f"Hi {name}! Quick question - is {event_date} still locked in? Want to make sure we have enough runway to maximize attendance 📅",
            f"{name}, been thinking about our conversation. How's the planning going for {event_date}? Any new challenges pop up? 🤔",
            f"Hey {name}! Saw an article about {industry} trends that reminded me of our chat. Still targeting {event_date}? 📊"
        ]
        
        return random.choice(templates)

    def _generate_story_bridge_sms(self, name: str, company: str, personality: str, industry: str, context: Dict) -> str:
        objection = context.get('main_objection', 'the investment')
        
        return f"Hi {name}! Been thinking about your concerns with {objection}. Actually helped a {industry} client with the EXACT same worry last month. Mind if I share what happened? 💡"

    def _generate_value_add_sms(self, name: str, company: str, personality: str, industry: str, context: Dict) -> str:
        return f"Hi {name}! Came across this {industry} industry report - thought you'd find the event attendance trends interesting. [Link] Hope your planning is going smoothly! 📈"

    def _generate_generic_sms(self, name: str, company: str, personality: str, industry: str, context: Dict) -> str:
        return f"Hi {name}, wanted to check in about {context.get('event_name', 'your event')}. Any questions come up since our chat? Happy to help! 👍"

    # Email Generation Methods
    def _generate_case_study_email(self, name: str, company: str, personality: str, industry: str, context: Dict) -> tuple:
        event_name = context.get('event_name', 'your upcoming event')
        
        # Sample case study data (in production, this would come from a database)
        case_study = {
            'healthcare': {
                'client': 'Regional Medical Conference',
                'before': '180 attendees (36% capacity)',
                'after': '470 attendees (94% capacity)',
                'timeline': '85 days',
                'revenue': '$290,000 additional revenue'
            },
            'technology': {
                'client': 'Tech Innovation Summit',
                'before': '220 attendees (44% capacity)',
                'after': '485 attendees (97% capacity)',
                'timeline': '70 days',
                'revenue': '$315,000 additional revenue'
            },
            'business': {
                'client': 'Executive Growth Conference',
                'before': '150 attendees (30% capacity)',
                'after': '475 attendees (95% capacity)',
                'timeline': '90 days',
                'revenue': '$425,000 additional revenue'
            }
        }
        
        cs = case_study.get(industry, case_study['business'])
        
        subject = f"Case Study: How We Filled {cs['client']} to 94% Capacity"
        
        if personality == 'ANALYTICAL':
            content = f"""Hi {name},

As discussed, here's the detailed case study that directly parallels your situation with {event_name}:

CASE STUDY: {cs['client']}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BASELINE PERFORMANCE:
• {cs['before']}
• Registration conversion: 2.1%
• No-show rate: 42%
• Total revenue: Below projections by 64%

IMPLEMENTATION TIMELINE: {cs['timeline']}
• Week 1-2: Audience analysis and targeting optimization
• Week 3-6: Funnel development and testing
• Week 7-12: Campaign execution and optimization

FINAL RESULTS:
• {cs['after']}
• Registration conversion: 8.7% (314% improvement)
• No-show rate: 6% (85% reduction)
• {cs['revenue']}

KEY SUCCESS FACTORS:
1. Psychology-based ad targeting (found the right attendees)
2. Optimized registration funnel (4x higher conversion)
3. Automated follow-up sequences (drastically reduced no-shows)

Based on your event size and timeline, I'm confident we can replicate these results for {event_name}.

The data doesn't lie - this system works.

Would you like to schedule a call to discuss implementation for your event?

Best regards,
[Your Name]

P.S. I have the detailed metrics and campaign screenshots if you'd like to see the specifics."""

        elif personality == 'DRIVER':
            content = f"""Hi {name},

Bottom line up front: Here's proof our system works.

{cs['client']} - {cs['timeline']} - {cs['revenue']}

BEFORE: {cs['before']}
AFTER: {cs['after']}

That's it. Numbers don't lie.

Your {event_name} can have the same results. Same system, same outcome.

Ready to move forward?

[Your Name]

P.S. This client started 12 weeks before their event. What's your timeline?"""

        elif personality == 'EXPRESSIVE':
            content = f"""Hi {name},

I am SO excited to share this success story with you!

Picture this: {cs['client']} organizer calls me, stressed out of her mind. Sound familiar? 😊

She's got this AMAZING event planned - incredible speakers, perfect venue, life-changing content. But only {cs['before']}. She's about to cancel everything.

Fast forward {cs['timeline']} later...

{cs['after']}! The venue is packed, energy is electric, attendees are raving, and she just generated {cs['revenue']} MORE than expected!

She called me in tears (happy ones!) saying it was the most successful event they'd ever hosted.

{name}, I see the EXACT same potential with {event_name}. Your passion for this event deserves a packed house of engaged attendees.

Want to chat about creating your own success story?

Cheering you on,
[Your Name]

P.S. She still sends me photos from that event - the room was absolutely buzzing with energy!"""

        else:  # AMIABLE
            content = f"""Hi {name},

Hope you're doing well! I wanted to share this client story because I think you'll really connect with their journey.

The organizer of {cs['client']} reached out to us in a situation very similar to yours. She was passionate about her event but struggling with attendance - they had {cs['before']} and were feeling overwhelmed.

Working together over {cs['timeline']}, we were able to help them achieve {cs['after']} and generate {cs['revenue']}.

But more than the numbers, what made me proud was seeing her confidence return. She went from stressed and worried to excited and proud. Her event became something the whole {industry} community looked forward to.

I'd love to help you have that same experience with {event_name}. Your vision deserves to reach the right people.

Would you be open to discussing how we could work together?

Warm regards,
[Your Name]

P.S. The best part was seeing her team's confidence grow too. When the system works, everyone benefits."""

        return subject, content

    def _generate_roi_email(self, name: str, company: str, personality: str, industry: str, context: Dict) -> tuple:
        event_capacity = context.get('event_capacity', 400)
        ticket_price = context.get('ticket_price', 500)
        current_rate = context.get('current_attendance_rate', 0.6)
        
        current_attendance = int(event_capacity * current_rate)
        target_attendance = int(event_capacity * 0.95)
        revenue_gap = (target_attendance - current_attendance) * ticket_price
        
        subject = f"ROI Analysis: ${revenue_gap:,} Revenue Opportunity for {context.get('event_name', 'Your Event')}"
        
        content = f"""Hi {name},

I spent some time thinking about our conversation and ran the numbers for {context.get('event_name', 'your event')}.

Here's what I discovered:

CURRENT SITUATION ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Event Capacity: {event_capacity} attendees
• Historical Attendance: ~{current_attendance} people ({int(current_rate*100)}% capacity)
• Ticket Price: ${ticket_price}
• Current Revenue: ${current_attendance * ticket_price:,}

OPTIMIZED SCENARIO (95% capacity):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Target Attendance: {target_attendance} people
• Projected Revenue: ${target_attendance * ticket_price:,}
• ADDITIONAL REVENUE: ${revenue_gap:,}

INVESTMENT ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• ESA System Investment: $25,000
• Additional Revenue Generated: ${revenue_gap:,}
• Net Profit Increase: ${revenue_gap - 25000:,}
• Return on Investment: {int((revenue_gap - 25000) / 25000 * 100)}%

The math is clear: this system pays for itself with ONE optimized event, then generates pure profit on every subsequent event.

But beyond the numbers, imagine the confidence of knowing your event will be packed, the energy of a full room, and the impact of reaching your maximum audience.

Ready to turn this projection into reality?

Best regards,
[Your Name]

P.S. This calculation doesn't even include the long-term value of having a proven system for all future events. The ROI compounds."""
        
        return subject, content

    def _generate_video_script_content(self, name: str, company: str, personality: str, industry: str, context: Dict, purpose: str) -> str:
        event_name = context.get('event_name', 'your upcoming event')
        
        if purpose == "PERSONAL_CONNECTION":
            return f"""[PERSONAL VIDEO SCRIPT - 60-90 seconds]

"Hi {name},

After our conversation yesterday, I couldn't stop thinking about {event_name} and the incredible impact it could have with the right attendance.

I keep picturing that moment when you walk into a packed room - every seat filled, energy buzzing, people excited to be there. That's what your event deserves.

Here's exactly what the first 30 days would look like:

Week 1: We analyze your target audience and build psychology-based ads
Week 2: Launch optimized registration funnel (we typically see 4x better conversion rates)
Week 3-4: Deploy our automated follow-up sequences that turn browsers into buyers

By day 30, you'd see a predictable flow of registrations instead of hoping people show up.

{name}, you've put too much passion into this event to leave attendance to chance. 

Are you ready to guarantee your event's success?

Talk soon,
[Your Name]"

[VIDEO NOTES: 
- Warm, confident tone
- Maintain eye contact with camera
- Use hand gestures to emphasize key points
- Smile when mentioning their success
- End with slight forward lean to show engagement]"""

        elif purpose == "OBJECTION_ADDRESS":
            main_objection = context.get('main_objection', 'investment concerns')
            
            return f"""[OBJECTION HANDLING VIDEO SCRIPT - 45-60 seconds]

"Hi {name},

I've been thinking about your concerns regarding {main_objection}, and I completely understand where you're coming from.

Let me share something that might help put this in perspective...

[Share relevant story about similar client with same objection]

Here's what I'd do if I were in your position: I'd ask myself, 'What's the real cost of not solving this problem?'

If {event_name} doesn't reach capacity, you're not just losing ticket revenue - you're missing the opportunity to impact the maximum number of people with your message.

Your content, your speakers, your vision - they deserve a packed house.

{name}, I'm confident we can solve this challenge for you. The question is: are you ready to move past the fear and into the solution?

Let's chat soon.
[Your Name]"

[VIDEO NOTES:
- Serious but supportive tone
- Address camera directly as if speaking to them personally
- Pause after key questions
- Lean in slightly when making important points
- End with reassuring smile]"""

        return "Basic video script template"

    def _extract_personalization_elements(self, content: str, prospect_info: Dict, context: Dict) -> List[str]:
        """Extract personalization elements for tracking"""
        elements = []
        
        name = prospect_info.get('name', '')
        company = prospect_info.get('company', '')
        
        if name and name.lower() in content.lower():
            elements.append(f"Name: {name}")
        if company and company.lower() in content.lower():
            elements.append(f"Company: {company}")
        if context.get('event_name', '') and context['event_name'].lower() in content.lower():
            elements.append(f"Event: {context['event_name']}")
        if context.get('industry', '') and context['industry'] in content.lower():
            elements.append(f"Industry: {context['industry']}")
        if 'pain_points' in prospect_info and prospect_info['pain_points']:
            for pain in prospect_info['pain_points']:
                if pain.lower() in content.lower():
                    elements.append(f"Pain Point: {pain}")
        
        return elements

    def _generate_sms_variations(self, original_content: str, name: str, personality: str) -> List[str]:
        """Generate alternative SMS versions for A/B testing"""
        # This would generate 2-3 variations of the original SMS
        return [
            original_content,
            original_content.replace("Hi", "Hey").replace("!", "."),
            original_content.replace(name, name.split()[0] if ' ' in name else name)
        ]

    def _generate_email_variations(self, subject: str, content: str, name: str, personality: str) -> List[str]:
        """Generate alternative email versions"""
        return [
            f"ORIGINAL SUBJECT: {subject}",
            f"VARIATION 1: Quick question about {name.split()[0] if ' ' in name else name}'s event",
            f"VARIATION 2: {name}, this might interest you..."
        ]

    def format_content_for_approval(self, content: GeneratedContent) -> str:
        """Format generated content for Brian/Nick/Chris approval"""
        
        return f"""
📝 CONTENT APPROVAL REQUEST
================================
Prospect: {content.prospect_name} ({content.company})
Method: {content.method}
Send Timing: {content.send_timing}

SUBJECT/TITLE:
{content.subject}

CONTENT:
{content.content}

PERSONALIZATION USED:
{', '.join(content.personalization_elements) if content.personalization_elements else 'None'}

ALTERNATIVE VERSIONS AVAILABLE:
{len(content.backup_versions)} variations ready for A/B testing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ APPROVE & SEND
❌ REJECT
✏️  EDIT CONTENT
🔄 REQUEST ALTERNATIVE VERSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

if __name__ == "__main__":
    # Example usage
    agent = ContentCreatorAgent()
    
    prospect_info = {
        'name': 'Dr. Smith',
        'company': 'HealthCorp',
        'personality': 'ANALYTICAL',
        'pain_points': ['unpredictable attendance', 'marketing not working']
    }
    
    context = {
        'industry': 'healthcare',
        'event_name': 'Medical Innovation Conference 2024',
        'event_capacity': 500,
        'ticket_price': 400,
        'timing': '24 hours'
    }
    
    # Generate case study email
    email_content = agent.generate_personalized_email(prospect_info, context, "CASE_STUDY")
    print(agent.format_content_for_approval(email_content))