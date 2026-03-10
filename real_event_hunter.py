#!/usr/bin/env python3
"""
REAL Event Hunter - Finds actual events with real contact information
No fake data. Only real prospects you can actually contact.
"""

import requests
import json
import csv
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import re
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class RealEventHunter:
    """Finds real events from real sources"""
    
    def __init__(self):
        self.eventbrite_token = os.getenv('EVENTBRITE_TOKEN')
        self.csv_file = f"REAL_Event_Prospects_{datetime.now().strftime('%Y%m%d')}.csv"
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {self.eventbrite_token}' if self.eventbrite_token else '',
            'User-Agent': 'ESA-EventHunter/1.0'
        })
        
        self.initialize_csv()
    
    def initialize_csv(self):
        """Create CSV file for real prospects"""
        headers = [
            'Event Name', 'Event ID', 'Organizer Name', 'Organizer Email', 
            'Event URL', 'Event Date', 'Location', 'Venue', 'Ticket Price',
            'Event Category', 'Description', 'Attendee Count', 'Organizer Profile',
            'Contact Website', 'Social Links', 'Phone Number', 'ESS Opportunity Score',
            'Discovery Date', 'Data Source', 'Verified Contact'
        ]
        
        with open(self.csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(headers)
        
        print(f"📋 Created REAL prospects file: {self.csv_file}")
    
    def search_eventbrite_events(self, query: str, location: str = None) -> List[Dict]:
        """Search real Eventbrite events"""
        if not self.eventbrite_token:
            print("❌ No Eventbrite token configured")
            return []
        
        url = "https://www.eventbriteapi.com/v3/events/search/"
        params = {
            'q': query,
            'sort_by': 'date',
            'location.address': location or 'United States',
            'start_date.range_start': datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
            'categories': '101,102,103,113', # Business, Finance, Health, Technology
            'expand': 'organizer,venue,ticket_classes',
            'price': 'paid'  # Only paid events (more serious)
        }
        
        try:
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 401:
                print("❌ Eventbrite API: Invalid token")
                return []
            elif response.status_code != 200:
                print(f"❌ Eventbrite API error: {response.status_code}")
                return []
            
            data = response.json()
            events = data.get('events', [])
            
            print(f"✅ Found {len(events)} real events from Eventbrite")
            return events
            
        except Exception as e:
            print(f"❌ Error searching Eventbrite: {e}")
            return []
    
    def extract_contact_info(self, event: Dict) -> Dict:
        """Extract real contact information from event"""
        organizer = event.get('organizer', {})
        venue = event.get('venue', {}) or {}
        
        # Extract basic info
        contact_info = {
            'organizer_name': organizer.get('name', 'Unknown'),
            'organizer_email': organizer.get('email', ''),
            'organizer_id': organizer.get('id', ''),
            'event_url': event.get('url', ''),
            'venue_name': venue.get('name', ''),
            'location': self._format_location(venue),
        }
        
        # Try to find additional contact methods
        description = event.get('description', {}).get('text', '') or ''
        
        # Extract phone numbers from description
        phone_pattern = r'(?:\+?1[-.\s]?)?(?:\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}'
        phones = re.findall(phone_pattern, description)
        contact_info['phone'] = phones[0] if phones else ''
        
        # Extract website URLs
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        urls = re.findall(url_pattern, description)
        contact_info['website'] = urls[0] if urls else ''
        
        # Extract social media handles
        social_pattern = r'@([a-zA-Z0-9_]+)'
        social_handles = re.findall(social_pattern, description)
        contact_info['social_handles'] = ', '.join(social_handles[:3]) if social_handles else ''
        
        return contact_info
    
    def _format_location(self, venue: Dict) -> str:
        """Format venue location"""
        if not venue:
            return 'Online/TBD'
        
        address = venue.get('address', {}) or {}
        parts = [
            address.get('city', ''),
            address.get('region', ''),
            address.get('country', '')
        ]
        
        location = ', '.join([p for p in parts if p])
        return location or 'Location TBD'
    
    def calculate_ess_opportunity_score(self, event: Dict, contact_info: Dict) -> int:
        """Calculate real ESS opportunity score based on actual event data"""
        score = 0
        
        # Event category scoring
        category_id = event.get('category_id')
        if category_id in ['101', '102']:  # Business, Finance
            score += 25
        elif category_id in ['113', '103']:  # Technology, Health
            score += 20
        
        # Ticket price scoring (real prices)
        ticket_classes = event.get('ticket_classes', []) or []
        if ticket_classes:
            max_price = max([float(tc.get('cost', {}).get('display', '0').replace('$', '').replace(',', '') or 0) 
                           for tc in ticket_classes])
            if max_price >= 500:
                score += 20
            elif max_price >= 200:
                score += 15
            elif max_price >= 100:
                score += 10
            elif max_price >= 50:
                score += 5
        
        # Event capacity/popularity
        capacity = event.get('capacity')
        if capacity:
            if capacity >= 1000:
                score += 15
            elif capacity >= 500:
                score += 12
            elif capacity >= 200:
                score += 8
        
        # Organizer profile completeness
        organizer = event.get('organizer', {})
        if organizer.get('description'):
            score += 10
        if contact_info.get('website'):
            score += 10
        if contact_info.get('phone'):
            score += 10
        if contact_info.get('organizer_email'):
            score += 10
        
        # Professional event indicators
        name = event.get('name', {}).get('text', '').lower()
        pro_keywords = ['conference', 'summit', 'workshop', 'masterclass', 'training', 'seminar']
        if any(keyword in name for keyword in pro_keywords):
            score += 10
        
        return min(score, 100)
    
    def save_real_prospects(self, events: List[Dict]):
        """Save real prospects to CSV"""
        if not events:
            print("📭 No real events to save")
            return
        
        real_prospects = []
        
        for event in events:
            try:
                contact_info = self.extract_contact_info(event)
                score = self.calculate_ess_opportunity_score(event, contact_info)
                
                # Only save if we have some way to contact them
                if contact_info['organizer_email'] or contact_info['phone'] or contact_info['website']:
                    
                    # Extract ticket price
                    ticket_classes = event.get('ticket_classes', []) or []
                    max_price = 0
                    if ticket_classes:
                        prices = [float(tc.get('cost', {}).get('display', '0').replace('$', '').replace(',', '') or 0) 
                                for tc in ticket_classes]
                        max_price = max(prices) if prices else 0
                    
                    prospect = {
                        'event_name': event.get('name', {}).get('text', 'Unknown Event'),
                        'event_id': event.get('id', ''),
                        'organizer_name': contact_info['organizer_name'],
                        'organizer_email': contact_info['organizer_email'],
                        'event_url': contact_info['event_url'],
                        'event_date': event.get('start', {}).get('local', ''),
                        'location': contact_info['location'],
                        'venue': contact_info['venue_name'],
                        'ticket_price': f"${max_price:.2f}" if max_price > 0 else 'Free',
                        'category': event.get('category', {}).get('name', '') if event.get('category') else '',
                        'description': event.get('description', {}).get('text', '')[:200] + '...' if event.get('description', {}).get('text') else '',
                        'attendee_count': event.get('capacity') or 'Unknown',
                        'organizer_profile': f"https://www.eventbrite.com/o/{contact_info['organizer_id']}" if contact_info['organizer_id'] else '',
                        'website': contact_info['website'],
                        'social_links': contact_info['social_handles'],
                        'phone': contact_info['phone'],
                        'ess_score': score,
                        'discovery_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                        'source': 'Eventbrite API',
                        'verified': 'Yes' if contact_info['organizer_email'] else 'Partial'
                    }
                    
                    real_prospects.append(prospect)
                    
            except Exception as e:
                print(f"❌ Error processing event {event.get('id', 'unknown')}: {e}")
                continue
        
        # Save to CSV
        if real_prospects:
            with open(self.csv_file, 'a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                for prospect in real_prospects:
                    writer.writerow([
                        prospect['event_name'], prospect['event_id'], prospect['organizer_name'],
                        prospect['organizer_email'], prospect['event_url'], prospect['event_date'],
                        prospect['location'], prospect['venue'], prospect['ticket_price'],
                        prospect['category'], prospect['description'], prospect['attendee_count'],
                        prospect['organizer_profile'], prospect['website'], prospect['social_links'],
                        prospect['phone'], prospect['ess_score'], prospect['discovery_date'],
                        prospect['source'], prospect['verified']
                    ])
            
            print(f"✅ Saved {len(real_prospects)} REAL prospects with contact info")
            
            # Show summary
            with_email = sum(1 for p in real_prospects if p['organizer_email'])
            with_phone = sum(1 for p in real_prospects if p['phone'])
            with_website = sum(1 for p in real_prospects if p['website'])
            high_score = sum(1 for p in real_prospects if p['ess_score'] >= 70)
            
            print(f"📊 REAL PROSPECT SUMMARY:")
            print(f"   📧 With Email: {with_email}")
            print(f"   📞 With Phone: {with_phone}")
            print(f"   🌐 With Website: {with_website}")
            print(f"   🏆 High Score (70+): {high_score}")
            
        return len(real_prospects)
    
    def run_real_discovery(self):
        """Run real event discovery"""
        print("🎯 REAL EVENT HUNTER - Finding actual prospects")
        print("=" * 50)
        
        # Business event search queries
        queries = [
            'business conference',
            'sales training',
            'real estate investing',
            'entrepreneur summit',
            'marketing workshop',
            'wealth building',
            'business coaching',
            'sales mastery'
        ]
        
        # Major business-friendly cities
        locations = [
            'Miami, FL',
            'Los Angeles, CA',
            'New York, NY',
            'Dallas, TX',
            'Atlanta, GA',
            'Chicago, IL',
            'Phoenix, AZ',
            'Las Vegas, NV'
        ]
        
        total_found = 0
        
        for query in queries[:3]:  # Start with 3 queries to avoid rate limits
            for location in locations[:4]:  # Start with 4 cities
                print(f"🔍 Searching: '{query}' in {location}")
                
                events = self.search_eventbrite_events(query, location)
                
                if events:
                    qualified = self.save_real_prospects(events)
                    total_found += qualified
                    
                    print(f"   ✅ Found {qualified} qualified prospects")
                else:
                    print(f"   📭 No events found")
                
                # Rate limiting - be respectful to APIs
                time.sleep(1)
        
        print(f"\n🎯 DISCOVERY COMPLETE")
        print(f"📋 Total real prospects found: {total_found}")
        print(f"💾 Saved to: {self.csv_file}")
        
        if total_found == 0:
            print("\n⚠️ No prospects found. Possible issues:")
            print("   - Eventbrite API token missing/invalid")
            print("   - Rate limits hit")
            print("   - No events match criteria")
            print("   - Events don't have contact info")

def main():
    """Main function"""
    print("🚀 Starting REAL Event Hunter")
    print("🔒 NO FAKE DATA - Only real prospects you can contact")
    
    hunter = RealEventHunter()
    hunter.run_real_discovery()

if __name__ == "__main__":
    main()