#!/usr/bin/env python3
"""
ESA SPEED-TO-LEAD TRACKER - GHL API v1
Fixed to work with Brian's API token using the v1 endpoints
"""

import requests
import json
import datetime
from typing import List, Dict, Any
import time

class GHLSpeedToLeadTracker:
    """Track speed-to-lead metrics using GoHighLevel API v1"""
    
    def __init__(self, api_key: str, location_id: str):
        self.api_key = api_key
        self.location_id = location_id
        self.base_url = "https://rest.gohighlevel.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
    def get_contacts_by_tag(self, tag: str, limit: int = 100) -> List[Dict]:
        """Get contacts with specific tag using v1 API"""
        
        print(f"🔍 Fetching contacts with tag: '{tag}'")
        
        url = f"{self.base_url}/contacts/"
        params = {
            "locationId": self.location_id,
            "limit": limit
        }
        
        try:
            response = requests.get(url, headers=self.headers, params=params)
            print(f"📡 API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                all_contacts = data.get('contacts', [])
                
                # Filter by tag since v1 API doesn't support tag filtering directly
                tagged_contacts = []
                for contact in all_contacts:
                    contact_tags = contact.get('tags', [])
                    if isinstance(contact_tags, list):
                        # Check if tag exists in contact's tags
                        if tag in contact_tags:
                            tagged_contacts.append(contact)
                    elif isinstance(contact_tags, str):
                        # Sometimes tags come as comma-separated string
                        if tag in contact_tags.split(','):
                            tagged_contacts.append(contact)
                
                print(f"✅ Found {len(all_contacts)} total contacts")
                print(f"🎯 Found {len(tagged_contacts)} contacts with tag '{tag}'")
                return tagged_contacts
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"Response: {response.text}")
                return []
                
        except Exception as e:
            print(f"❌ Error fetching contacts: {e}")
            return []

    def get_contact_notes(self, contact_id: str) -> List[Dict]:
        """Get notes for a contact using v1 API"""
        
        url = f"{self.base_url}/contacts/{contact_id}/notes/"
        
        try:
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('notes', [])
            else:
                # Notes endpoint might not exist in v1, try activities
                return []
                
        except Exception as e:
            return []

    def get_contact_timeline(self, contact_id: str) -> List[Dict]:
        """Get timeline/activities for a contact"""
        
        url = f"{self.base_url}/contacts/{contact_id}/activities/"
        
        try:
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('activities', [])
            else:
                return []
                
        except Exception as e:
            return []

    def parse_timestamp(self, timestamp_str: str) -> datetime.datetime:
        """Parse various timestamp formats to datetime object"""
        
        try:
            # Try different timestamp formats
            for fmt in [
                "%Y-%m-%dT%H:%M:%S.%fZ",
                "%Y-%m-%dT%H:%M:%SZ", 
                "%Y-%m-%d %H:%M:%S",
                "%Y-%m-%dT%H:%M:%S.%f",
                "%Y-%m-%dT%H:%M:%S"
            ]:
                try:
                    return datetime.datetime.strptime(timestamp_str, fmt)
                except ValueError:
                    continue
                    
            # Try unix timestamp (milliseconds)
            if isinstance(timestamp_str, (int, float)) or (isinstance(timestamp_str, str) and timestamp_str.isdigit()):
                timestamp_num = float(timestamp_str)
                # Check if it's milliseconds (> year 2000 in seconds)
                if timestamp_num > 946684800000:
                    timestamp_num = timestamp_num / 1000
                return datetime.datetime.fromtimestamp(timestamp_num)
                
            print(f"⚠️ Could not parse timestamp: {timestamp_str}")
            return None
            
        except Exception as e:
            print(f"❌ Error parsing timestamp {timestamp_str}: {e}")
            return None

    def find_first_outreach(self, contact: Dict) -> tuple:
        """Find first outreach attempt for a contact"""
        
        contact_id = contact.get('id')
        first_outreach = None
        outreach_type = None
        
        # Check if there's a dateUpdated vs dateAdded difference (indicates activity)
        date_added = contact.get('dateAdded')
        date_updated = contact.get('dateUpdated')
        
        if date_added and date_updated and date_added != date_updated:
            updated_dt = self.parse_timestamp(date_updated)
            if updated_dt:
                first_outreach = updated_dt
                outreach_type = "Contact Updated"
        
        # Check notes
        notes = self.get_contact_notes(contact_id)
        for note in notes:
            note_date_str = note.get('dateAdded') or note.get('createdAt')
            if note_date_str:
                note_date = self.parse_timestamp(note_date_str)
                if note_date:
                    if first_outreach is None or note_date < first_outreach:
                        first_outreach = note_date
                        outreach_type = f"Note: {note.get('body', 'Activity')[:30]}..."
        
        # Check timeline/activities  
        activities = self.get_contact_timeline(contact_id)
        for activity in activities:
            activity_date_str = activity.get('dateAdded') or activity.get('createdAt')
            if activity_date_str:
                activity_date = self.parse_timestamp(activity_date_str)
                if activity_date:
                    if first_outreach is None or activity_date < first_outreach:
                        first_outreach = activity_date
                        activity_type = activity.get('type', 'Activity')
                        outreach_type = f"Activity: {activity_type}"
        
        # Check for any custom fields that might indicate calls/outreach
        custom_fields = contact.get('customFields', [])
        for field in custom_fields:
            if 'call' in field.get('name', '').lower() or 'contact' in field.get('name', '').lower():
                field_date_str = field.get('value')
                if field_date_str:
                    field_date = self.parse_timestamp(field_date_str)
                    if field_date:
                        if first_outreach is None or field_date < first_outreach:
                            first_outreach = field_date
                            outreach_type = f"Custom Field: {field.get('name')}"
        
        return first_outreach, outreach_type

    def calculate_speed_to_lead(self, contact: Dict) -> Dict:
        """Calculate speed-to-lead metrics for a single contact"""
        
        contact_id = contact.get('id')
        contact_name = f"{contact.get('firstName', '')} {contact.get('lastName', '')}".strip()
        contact_email = contact.get('email', '')
        contact_phone = contact.get('phone', '')
        
        # Get contact creation time
        created_at_str = contact.get('dateAdded')
        if not created_at_str:
            print(f"⚠️ No creation date for contact {contact_id}")
            return None
            
        created_at = self.parse_timestamp(created_at_str)
        if not created_at:
            return None
            
        # Find first outreach attempt
        first_outreach, outreach_type = self.find_first_outreach(contact)
        
        if first_outreach is None:
            # No outreach found
            speed_minutes = None
            status = "NO_CONTACT"
        else:
            # Calculate speed in minutes
            speed_delta = first_outreach - created_at
            speed_minutes = speed_delta.total_seconds() / 60
            
            if speed_minutes < 0:
                # Negative speed - use absolute value
                speed_minutes = abs(speed_minutes)
                status = "INSTANT"
            elif speed_minutes <= 5:
                status = "EXCELLENT"
            elif speed_minutes <= 30:
                status = "GOOD"
            elif speed_minutes <= 60:
                status = "OKAY"
            else:
                status = "SLOW"
        
        return {
            'contact_id': contact_id,
            'name': contact_name or 'No Name',
            'email': contact_email,
            'phone': contact_phone,
            'created_at': created_at,
            'first_outreach': first_outreach,
            'outreach_type': outreach_type,
            'speed_minutes': speed_minutes,
            'status': status,
            'tags': contact.get('tags', [])
        }

    def analyze_speed_to_lead(self, tag: str) -> Dict:
        """Analyze speed-to-lead for all contacts with given tag"""
        
        print(f"🎯 ESA SPEED-TO-LEAD ANALYSIS")
        print(f"==============================")
        print(f"📊 Tag: '{tag}'")
        print(f"📅 Analysis Time: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Get contacts
        contacts = self.get_contacts_by_tag(tag)
        if not contacts:
            # If no exact tag match, try broader search
            print(f"🔄 No exact tag matches. Trying broader search...")
            all_contacts = self.get_contacts_by_tag("", limit=200)
            
            # Manual fuzzy search for the tag
            fuzzy_matches = []
            tag_lower = tag.lower()
            for contact in all_contacts:
                contact_tags = contact.get('tags', [])
                if isinstance(contact_tags, list):
                    for ctag in contact_tags:
                        if tag_lower in str(ctag).lower():
                            fuzzy_matches.append(contact)
                            break
                elif isinstance(contact_tags, str):
                    if tag_lower in contact_tags.lower():
                        fuzzy_matches.append(contact)
            
            contacts = fuzzy_matches
            print(f"🎯 Found {len(contacts)} contacts with fuzzy tag matching")
        
        if not contacts:
            print("❌ No contacts found with this tag or similar")
            return {}
        
        # Analyze each contact
        results = []
        for i, contact in enumerate(contacts):
            print(f"🔄 Analyzing contact {i+1}/{len(contacts)}: {contact.get('firstName', '')} {contact.get('lastName', '')}")
            result = self.calculate_speed_to_lead(contact)
            if result:
                results.append(result)
            time.sleep(0.1)  # Rate limiting
        
        if not results:
            print("❌ No valid results generated")
            return {}
        
        # Calculate overall metrics
        valid_speeds = [r['speed_minutes'] for r in results if r['speed_minutes'] is not None]
        
        if valid_speeds:
            avg_speed = sum(valid_speeds) / len(valid_speeds)
            median_speed = sorted(valid_speeds)[len(valid_speeds) // 2]
            
            under_5min = len([s for s in valid_speeds if s <= 5])
            under_30min = len([s for s in valid_speeds if s <= 30])
            under_60min = len([s for s in valid_speeds if s <= 60])
            
            under_5min_pct = (under_5min / len(valid_speeds)) * 100
            under_30min_pct = (under_30min / len(valid_speeds)) * 100
            under_60min_pct = (under_60min / len(valid_speeds)) * 100
        else:
            avg_speed = median_speed = 0
            under_5min_pct = under_30min_pct = under_60min_pct = 0
        
        no_contact = len([r for r in results if r['status'] == 'NO_CONTACT'])
        
        analysis = {
            'tag_searched': tag,
            'total_leads': len(contacts),
            'analyzed_leads': len(results),
            'contacted_leads': len(valid_speeds),
            'no_contact_leads': no_contact,
            'avg_speed_minutes': round(avg_speed, 1) if valid_speeds else None,
            'median_speed_minutes': round(median_speed, 1) if valid_speeds else None,
            'under_5min_count': under_5min if valid_speeds else 0,
            'under_5min_pct': round(under_5min_pct, 1) if valid_speeds else 0,
            'under_30min_pct': round(under_30min_pct, 1) if valid_speeds else 0,
            'under_60min_pct': round(under_60min_pct, 1) if valid_speeds else 0,
            'details': results
        }
        
        return analysis

    def generate_report(self, analysis: Dict) -> str:
        """Generate human-readable speed-to-lead report"""
        
        if not analysis:
            return "❌ No analysis data available"
        
        report = f"""
🚀 ESA SPEED-TO-LEAD REPORT
===========================
📊 Tag Analyzed: "{analysis['tag_searched']}"

📈 OVERALL METRICS:
✅ Total Leads Analyzed: {analysis['analyzed_leads']}
✅ Leads Contacted: {analysis['contacted_leads']}
❌ Never Contacted: {analysis['no_contact_leads']}

⚡ SPEED METRICS:
🔥 Average Speed-to-Lead: {analysis['avg_speed_minutes']} minutes
📈 Median Speed-to-Lead: {analysis['median_speed_minutes']} minutes
🎯 Under 5 minutes: {analysis['under_5min_count']} leads ({analysis['under_5min_pct']}%)
✅ Under 30 minutes: {analysis['under_30min_pct']}%
⏰ Under 60 minutes: {analysis['under_60min_pct']}%

"""
        
        # Sort by speed (fastest first)
        details = analysis['details']
        contacted = [d for d in details if d['speed_minutes'] is not None]
        contacted.sort(key=lambda x: x['speed_minutes'])
        
        # Show top 5 fastest
        report += "⚡ FASTEST RESPONSES:\n"
        for i, contact in enumerate(contacted[:5], 1):
            speed_str = f"{contact['speed_minutes']:.1f} min"
            report += f"{i}. {contact['name']} - {speed_str} ({contact['status']})\n"
            if contact['outreach_type']:
                report += f"   📝 {contact['outreach_type']}\n"
        
        # Show slowest responders
        if len(contacted) > 5:
            report += "\n🐌 SLOWEST RESPONSES:\n"
            slowest = contacted[-3:]
            slowest.reverse()
            for i, contact in enumerate(slowest, 1):
                speed_str = f"{contact['speed_minutes']:.1f} min"
                report += f"{i}. {contact['name']} - {speed_str} ({contact['status']})\n"
        
        # Show never contacted
        never_contacted = [d for d in details if d['status'] == 'NO_CONTACT']
        if never_contacted:
            report += f"\n🚨 NEVER CONTACTED ({len(never_contacted)} leads):\n"
            for contact in never_contacted[:5]:
                created_str = contact['created_at'].strftime('%m/%d %H:%M')
                report += f"• {contact['name']} - Created {created_str}\n"
            if len(never_contacted) > 5:
                report += f"   ... and {len(never_contacted) - 5} more\n"
        
        return report

def main():
    """Main analysis function"""
    
    # Brian's API details
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IldkUHBMVTZqNGhMdFpKcmRtT1JXIiwiY29tcGFueV9pZCI6Im1neUIxblY5YVltanRCUm1wYnBrIiwidmVyc2lvbiI6MSwiaWF0IjoxNzA2NzQxMTQzMTY3LCJzdWIiOiJ1c2VyX2lkIn0.Ab-dmSbjizR_xim0IlCr_BKgM5haIcOTpM8gvFt4RHs"
    LOCATION_ID = "WdPpLU6j4hLtZJrdmORW"
    TAG = "march 24-25- new opt ins"
    
    print("🎯 ESA SPEED-TO-LEAD TRACKER STARTING...")
    print(f"🔧 Using GHL API v1 (compatible with your token)")
    
    # Initialize tracker
    tracker = GHLSpeedToLeadTracker(API_KEY, LOCATION_ID)
    
    # Run analysis
    analysis = tracker.analyze_speed_to_lead(TAG)
    
    # Generate report
    report = tracker.generate_report(analysis)
    print(report)
    
    # Save detailed results
    if analysis:
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"speed_to_lead_analysis_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(analysis, f, indent=2, default=str)
        
        print(f"\n💾 Detailed results saved to: {filename}")
    
    return analysis

if __name__ == "__main__":
    main()