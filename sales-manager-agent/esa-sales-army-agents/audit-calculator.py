#!/usr/bin/env python3
"""
ESA EVENT AUDIT CALCULATOR
Real-time scoring tool for conducting event audits
"""

import datetime
from dataclasses import dataclass
from typing import Dict, List, Optional

@dataclass
class AuditResult:
    """Complete audit results"""
    prospect_name: str
    company: str
    event_name: str
    event_date: str
    auditor: str
    audit_date: str
    
    # Category scores
    category_scores: Dict[str, int]
    total_score: int
    
    # Analysis
    tier: str
    close_probability: int
    recommended_package: str
    revenue_potential: int
    
    # Strategic insights
    top_strengths: List[str]
    top_gaps: List[str]
    key_insights: List[str]
    custom_talking_points: List[str]

class ESAEventAuditCalculator:
    """Interactive audit calculator for real-time scoring"""
    
    def __init__(self):
        self.categories = {
            "Event Type": {
                "Business Seminar/Conference": 5,
                "Workshop/Training Session": 4,
                "Trade Show/Expo": 3,
                "Networking Event": 2,
                "Webinar/Virtual Event": 2,
                "Product Launch": 2,
                "Charity/Fundraiser Event": 1,
                "Social Event": 1,
                "Other": 0
            },
            "Website Quality": {
                "Professional Website (Up-to-date, detailed)": 5,
                "Basic Website (Functional but limited)": 3,
                "Minimal Website (Outdated or incomplete)": 1,
                "No Website": 0
            },
            "Event Experience": {
                "10+ Times": 5,
                "5-9 Times": 4,
                "2-4 Times": 2,
                "0-1 Time": 0
            },
            "Historical Attendance": {
                "500+ Attendees": 5,
                "200-499 Attendees": 4,
                "50-199 Attendees": 2,
                "Less than 50 Attendees": 0
            },
            "Target Attendance": {
                "500+ Attendees": 5,
                "200-499 Attendees": 4,
                "50-199 Attendees": 2,
                "Less than 50 Attendees": 0
            },
            "Ticket Pricing": {
                "$500+": 5,
                "$200-$499": 4,
                "$99-$199": 2,
                "Free or under $99": 0
            },
            "Backend Monetization": {
                "Yes": 5,
                "No": 0
            },
            "Marketing Budget": {
                "$20,000+": 5,
                "$10,000-$19,999": 4,
                "$5,000-$9,999": 2,
                "$1,000-$4,999": 1,
                "Less than $1,000": 0
            },
            "Lead Database": {
                "500+ Leads": 5,
                "200-499 Leads": 4,
                "50-199 Leads": 2,
                "Less than 50 Leads": 0
            },
            "Pre-Sales Performance": {
                "300+ Tickets": 5,
                "100-299 Tickets": 4,
                "50-99 Tickets": 2,
                "Less than 50 Tickets": 0
            },
            "Sales Infrastructure": {
                "5+ Reps": 5,
                "3-4 Reps": 4,
                "1-2 Reps": 2,
                "No Sales Reps": 0
            },
            "Decision Authority": {
                "Yes": 5,
                "No": 0
            },
            "CRM System": {
                "Yes": 5,
                "No": 0
            },
            "Marketing Management": {
                "Professional Agency": 5,
                "In-House Team": 3,
                "Freelancer": 1,
                "No One": 0
            },
            "Social Media Presence": {
                "10,000+ Followers": 5,
                "5,000-9,999 Followers": 4,
                "1,000-4,999 Followers": 2,
                "Less than 1,000 Followers": 0
            },
            "Email Marketing": {
                "10,000+ Subscribers": 5,
                "5,000-9,999 Subscribers": 4,
                "1,000-4,999 Subscribers": 2,
                "Less than 1,000 Subscribers": 0
            },
            "Primary Bottleneck": {
                "Marketing and Sales": 5,
                "Event Management": 4,
                "Content and Speakers": 2,
                "Logistics and Operations": 1
            }
        }
        
        self.current_audit = {}
        self.category_scores = {}

    def start_interactive_audit(self):
        """Start interactive audit session"""
        print("🎯 ESA EVENT AUDIT CALCULATOR")
        print("=" * 40)
        
        # Get basic info
        prospect_name = input("Prospect Name: ").strip()
        company = input("Company: ").strip()
        event_name = input("Event Name: ").strip()
        event_date = input("Event Date (YYYY-MM-DD): ").strip()
        auditor = input("Auditor (Brian/Nick/Chris): ").strip()
        
        self.current_audit = {
            'prospect_name': prospect_name,
            'company': company,
            'event_name': event_name,
            'event_date': event_date,
            'auditor': auditor,
            'audit_date': datetime.datetime.now().strftime('%Y-%m-%d')
        }
        
        print(f"\n🔍 Starting audit for {prospect_name} - {event_name}")
        print("Answer each question during the call:\n")
        
        # Run through categories
        self._conduct_audit()
        
        # Calculate results
        result = self._calculate_results()
        
        # Display results
        self._display_results(result)
        
        # Export results
        self._export_results(result)

    def _conduct_audit(self):
        """Conduct the audit category by category"""
        
        for i, (category, options) in enumerate(self.categories.items(), 1):
            print(f"\n{i}. {category.upper()}")
            print("-" * 30)
            
            # Display options
            for j, (option, points) in enumerate(options.items(), 1):
                print(f"   {j}. {option} ({points} points)")
            
            # Get selection
            while True:
                try:
                    choice = int(input(f"Select option (1-{len(options)}): "))
                    if 1 <= choice <= len(options):
                        selected_option = list(options.keys())[choice-1]
                        points = options[selected_option]
                        self.category_scores[category] = points
                        print(f"   ✅ {selected_option} ({points} points)")
                        break
                    else:
                        print("Invalid choice, try again.")
                except ValueError:
                    print("Please enter a number.")

    def _calculate_results(self) -> AuditResult:
        """Calculate audit results and analysis"""
        
        total_score = sum(self.category_scores.values())
        
        # Determine tier
        if total_score >= 65:
            tier = "TIER A - HIGHLY QUALIFIED"
            close_probability = 85
            recommended_package = "6-Month Premium ($25K)"
        elif total_score >= 50:
            tier = "TIER B - MODERATELY QUALIFIED"
            close_probability = 65
            recommended_package = "6-Month Standard ($25K) or 3-Month Starter ($15K)"
        elif total_score >= 35:
            tier = "TIER C - NEEDS EVALUATION"
            close_probability = 35
            recommended_package = "3-Month Starter ($15K)"
        else:
            tier = "NOT QUALIFIED"
            close_probability = 10
            recommended_package = "Not recommended"
        
        # Calculate revenue potential
        revenue_potential = self._calculate_revenue_potential(total_score)
        
        # Analyze strengths and gaps
        top_strengths = self._identify_strengths()
        top_gaps = self._identify_gaps()
        
        # Generate insights
        key_insights = self._generate_insights(total_score)
        
        # Create talking points
        talking_points = self._create_talking_points(total_score, top_strengths, top_gaps)
        
        return AuditResult(
            prospect_name=self.current_audit['prospect_name'],
            company=self.current_audit['company'],
            event_name=self.current_audit['event_name'],
            event_date=self.current_audit['event_date'],
            auditor=self.current_audit['auditor'],
            audit_date=self.current_audit['audit_date'],
            category_scores=self.category_scores.copy(),
            total_score=total_score,
            tier=tier,
            close_probability=close_probability,
            recommended_package=recommended_package,
            revenue_potential=revenue_potential,
            top_strengths=top_strengths,
            top_gaps=top_gaps,
            key_insights=key_insights,
            custom_talking_points=talking_points
        )

    def _identify_strengths(self) -> List[str]:
        """Identify top 3 strengths based on high scores"""
        
        strengths = []
        strength_mapping = {
            "Event Type": "High-value event format",
            "Website Quality": "Professional digital presence",
            "Event Experience": "Extensive event hosting experience",
            "Historical Attendance": "Strong past event attendance",
            "Target Attendance": "Ambitious attendance goals", 
            "Ticket Pricing": "Premium pricing strategy",
            "Backend Monetization": "Revenue monetization in place",
            "Marketing Budget": "Substantial marketing investment",
            "Lead Database": "Large lead database",
            "Pre-Sales Performance": "Strong pre-event sales",
            "Sales Infrastructure": "Dedicated sales team",
            "Decision Authority": "Direct decision-making authority",
            "CRM System": "Lead management system in place",
            "Marketing Management": "Professional marketing support",
            "Social Media Presence": "Strong social media following",
            "Email Marketing": "Large email subscriber base",
            "Primary Bottleneck": "Sales-focused growth needs"
        }
        
        # Get categories with 4+ points
        strong_categories = [(cat, score) for cat, score in self.category_scores.items() if score >= 4]
        strong_categories.sort(key=lambda x: x[1], reverse=True)
        
        for category, score in strong_categories[:3]:
            if category in strength_mapping:
                strengths.append(strength_mapping[category])
        
        return strengths

    def _identify_gaps(self) -> List[str]:
        """Identify top 3 gaps based on low scores"""
        
        gaps = []
        gap_mapping = {
            "Event Type": "Limited event format value",
            "Website Quality": "Website needs professional upgrade", 
            "Event Experience": "Limited event hosting experience",
            "Historical Attendance": "Below-potential past attendance",
            "Target Attendance": "Conservative attendance goals",
            "Ticket Pricing": "Undervalued ticket pricing",
            "Backend Monetization": "Missing backend revenue opportunity",
            "Marketing Budget": "Insufficient marketing budget",
            "Lead Database": "Small lead database",
            "Pre-Sales Performance": "Slow pre-event sales",
            "Sales Infrastructure": "No dedicated sales support",
            "Decision Authority": "Need decision maker involvement",
            "CRM System": "Missing lead management system",
            "Marketing Management": "Unprofessional marketing approach",
            "Social Media Presence": "Weak social media presence",
            "Email Marketing": "Small email subscriber base",
            "Primary Bottleneck": "Operations-focused vs. growth-focused"
        }
        
        # Get categories with 0-2 points
        weak_categories = [(cat, score) for cat, score in self.category_scores.items() if score <= 2]
        weak_categories.sort(key=lambda x: x[1])
        
        for category, score in weak_categories[:3]:
            if category in gap_mapping:
                gaps.append(gap_mapping[category])
        
        return gaps

    def _calculate_revenue_potential(self, total_score: int) -> int:
        """Calculate revenue potential based on score"""
        
        # Base calculation on ticket pricing and attendance
        ticket_price_score = self.category_scores.get("Ticket Pricing", 0)
        attendance_score = self.category_scores.get("Target Attendance", 0)
        backend_score = self.category_scores.get("Backend Monetization", 0)
        
        # Estimate base revenue
        if ticket_price_score >= 4:
            avg_ticket = 600
        elif ticket_price_score >= 2:
            avg_ticket = 300
        else:
            avg_ticket = 100
        
        if attendance_score >= 4:
            attendance = 400
        elif attendance_score >= 2:
            attendance = 125
        else:
            attendance = 50
        
        base_revenue = avg_ticket * attendance
        
        # Add backend potential if they have it
        if backend_score >= 4:
            backend_revenue = base_revenue * 0.8  # 80% additional from backend
        else:
            backend_revenue = 0
        
        # Apply optimization multiplier based on total score
        if total_score >= 65:
            optimization_factor = 2.5  # Can 2.5X their results
        elif total_score >= 50:
            optimization_factor = 2.0  # Can double results
        elif total_score >= 35:
            optimization_factor = 1.5  # Can improve 50%
        else:
            optimization_factor = 1.2  # Limited upside
        
        total_potential = int((base_revenue + backend_revenue) * optimization_factor)
        
        return total_potential

    def _generate_insights(self, total_score: int) -> List[str]:
        """Generate key insights based on audit results"""
        
        insights = []
        
        # Score-based insights
        if total_score >= 65:
            insights.append("Strong foundation ready for immediate optimization and scale")
        elif total_score >= 50:
            insights.append("Solid foundation with clear optimization opportunities")
        elif total_score >= 35:
            insights.append("Potential exists but requires foundation development")
        else:
            insights.append("Significant development needed before optimization")
        
        # Backend monetization insight
        if self.category_scores.get("Backend Monetization", 0) == 0:
            if self.category_scores.get("Ticket Pricing", 0) >= 3:
                insights.append("Missing backend offer = $100K-$300K+ revenue opportunity")
            else:
                insights.append("Backend monetization could triple revenue potential")
        
        # Sales infrastructure insight
        if (self.category_scores.get("Lead Database", 0) >= 3 and 
            self.category_scores.get("Sales Infrastructure", 0) <= 2):
            insights.append("Good leads but poor sales infrastructure = conversion problem")
        
        # Marketing efficiency insight
        if (self.category_scores.get("Marketing Budget", 0) >= 3 and 
            self.category_scores.get("Pre-Sales Performance", 0) <= 2):
            insights.append("High marketing spend with low results = efficiency problem")
        
        return insights[:4]  # Top 4 insights

    def _create_talking_points(self, total_score: int, strengths: List[str], gaps: List[str]) -> List[str]:
        """Create custom talking points for presentation call"""
        
        points = []
        
        # Lead with strongest asset
        if strengths:
            points.append(f"Lead with their strength: {strengths[0]}")
        
        # Address main gap
        if gaps:
            points.append(f"Address primary gap: {gaps[0]}")
        
        # Revenue opportunity focus
        points.append(f"Revenue potential: ${self._calculate_revenue_potential(total_score):,}")
        
        # Package positioning
        if total_score >= 65:
            points.append("Position as scaling/optimization play")
        elif total_score >= 50:
            points.append("Position as growth/development opportunity") 
        else:
            points.append("Position as foundation-building with upside")
        
        # Decision maker strategy
        if self.category_scores.get("Decision Authority", 0) == 0:
            points.append("Must involve decision maker in presentation call")
        
        return points

    def _display_results(self, result: AuditResult):
        """Display audit results to screen"""
        
        print("\n" + "="*50)
        print("🎯 AUDIT RESULTS")
        print("="*50)
        
        print(f"\nPROSPECT: {result.prospect_name}")
        print(f"COMPANY: {result.company}")
        print(f"EVENT: {result.event_name}")
        print(f"SCORE: {result.total_score}/75 POINTS")
        print(f"TIER: {result.tier}")
        print(f"CLOSE PROBABILITY: {result.close_probability}%")
        print(f"RECOMMENDED PACKAGE: {result.recommended_package}")
        print(f"REVENUE POTENTIAL: ${result.revenue_potential:,}")
        
        print(f"\n💪 TOP STRENGTHS:")
        for strength in result.top_strengths:
            print(f"  ✅ {strength}")
        
        print(f"\n🎯 TOP GAPS:")
        for gap in result.top_gaps:
            print(f"  📋 {gap}")
        
        print(f"\n💡 KEY INSIGHTS:")
        for insight in result.key_insights:
            print(f"  • {insight}")
        
        print(f"\n📞 PRESENTATION CALL TALKING POINTS:")
        for point in result.custom_talking_points:
            print(f"  • {point}")
        
        print("\n" + "="*50)

    def _export_results(self, result: AuditResult):
        """Export results to file"""
        
        filename = f"audit_{result.prospect_name.replace(' ', '_')}_{result.audit_date}.txt"
        
        with open(filename, 'w') as f:
            f.write("ESA EVENT AUDIT RESULTS\n")
            f.write("="*30 + "\n\n")
            
            f.write(f"PROSPECT: {result.prospect_name}\n")
            f.write(f"COMPANY: {result.company}\n")
            f.write(f"EVENT: {result.event_name}\n")
            f.write(f"EVENT DATE: {result.event_date}\n")
            f.write(f"AUDITOR: {result.auditor}\n")
            f.write(f"AUDIT DATE: {result.audit_date}\n\n")
            
            f.write("CATEGORY BREAKDOWN:\n")
            for category, score in result.category_scores.items():
                f.write(f"  {category}: {score}/5\n")
            
            f.write(f"\nTOTAL SCORE: {result.total_score}/75\n")
            f.write(f"TIER: {result.tier}\n")
            f.write(f"CLOSE PROBABILITY: {result.close_probability}%\n")
            f.write(f"RECOMMENDED PACKAGE: {result.recommended_package}\n")
            f.write(f"REVENUE POTENTIAL: ${result.revenue_potential:,}\n\n")
            
            f.write("TOP STRENGTHS:\n")
            for strength in result.top_strengths:
                f.write(f"  - {strength}\n")
            
            f.write(f"\nTOP GAPS:\n")
            for gap in result.top_gaps:
                f.write(f"  - {gap}\n")
            
            f.write(f"\nKEY INSIGHTS:\n")
            for insight in result.key_insights:
                f.write(f"  - {insight}\n")
            
            f.write(f"\nPRESENTATION CALL TALKING POINTS:\n")
            for point in result.custom_talking_points:
                f.write(f"  - {point}\n")
        
        print(f"\n💾 Results exported to: {filename}")

    def quick_score_lookup(self, category: str, response: str) -> int:
        """Quick lookup for scoring during calls"""
        
        if category in self.categories:
            return self.categories[category].get(response, 0)
        return 0

def main():
    """Main function"""
    
    calculator = ESAEventAuditCalculator()
    
    while True:
        print("\n🎯 ESA EVENT AUDIT SYSTEM")
        print("1. Start Interactive Audit")
        print("2. Quick Score Lookup")
        print("3. Exit")
        
        choice = input("\nSelect option: ").strip()
        
        if choice == "1":
            calculator.start_interactive_audit()
        elif choice == "2":
            category = input("Category: ").strip()
            response = input("Response: ").strip()
            score = calculator.quick_score_lookup(category, response)
            print(f"Score: {score} points")
        elif choice == "3":
            break
        else:
            print("Invalid choice")

if __name__ == "__main__":
    main()