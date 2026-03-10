#!/usr/bin/env python3
"""
ESA SPEED-TO-LEAD FINAL ANALYSIS
Analyze the 16 contacts found with "march 24-25- new opt ins" tag
"""

import requests
import json
import datetime
from typing import List, Dict, Any
import time

def parse_timestamp(timestamp_str: str) -> datetime.datetime:
    """Parse GHL timestamp"""
    try:
        return datetime.datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
    except:
        try:
            return datetime.datetime.strptime(timestamp_str, "%Y-%m-%dT%H:%M:%S.%fZ")
        except:
            return None

def get_contact_activities(contact_id: str, headers: dict) -> List[Dict]:
    """Get all activities for a contact"""
    activities = []
    
    # Try different endpoint variations
    endpoints = [
        f"https://rest.gohighlevel.com/v1/contacts/{contact_id}/activities/",
        f"https://rest.gohighlevel.com/v1/contacts/{contact_id}/notes/",
        f"https://rest.gohighlevel.com/v1/contacts/{contact_id}/timeline/"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                # Try different response keys
                for key in ['activities', 'notes', 'timeline', 'data']:
                    if key in data and data[key]:
                        activities.extend(data[key])
        except:
            continue
    
    return activities

def analyze_contact_speed(contact: Dict, headers: dict) -> Dict:
    """Analyze speed-to-lead for a single contact"""
    
    contact_id = contact.get('id')
    name = f"{contact.get('firstName', '')} {contact.get('lastName', '')}".strip()
    email = contact.get('email', '')
    phone = contact.get('phone', '')
    
    # Parse creation time
    created_str = contact.get('dateAdded')
    created_at = parse_timestamp(created_str)
    
    if not created_at:
        return None
    
    # Look for first contact attempt
    first_contact = None
    contact_method = "None"
    
    # Check if contact was updated after creation (indicates activity)
    updated_str = contact.get('dateUpdated')
    if updated_str and updated_str != created_str:
        updated_at = parse_timestamp(updated_str)
        if updated_at and updated_at > created_at:
            first_contact = updated_at
            contact_method = "Contact Updated"
    
    # Get activities/notes
    activities = get_contact_activities(contact_id, headers)
    
    for activity in activities:
        # Try different date fields
        for date_field in ['dateAdded', 'createdAt', 'date', 'timestamp']:
            activity_date_str = activity.get(date_field)
            if activity_date_str:
                activity_date = parse_timestamp(activity_date_str)
                if activity_date and activity_date > created_at:
                    if first_contact is None or activity_date < first_contact:
                        first_contact = activity_date
                        # Determine activity type
                        activity_type = activity.get('type', '')
                        body = activity.get('body', '')
                        if 'call' in activity_type.lower() or 'call' in body.lower():
                            contact_method = "Phone Call"
                        elif 'email' in activity_type.lower() or 'email' in body.lower():
                            contact_method = "Email"
                        elif 'sms' in activity_type.lower() or 'text' in body.lower():
                            contact_method = "SMS"
                        else:
                            contact_method = f"Activity: {activity_type}"
                break
    
    # Calculate speed
    if first_contact:
        speed_delta = first_contact - created_at
        speed_minutes = speed_delta.total_seconds() / 60
        
        # Classify speed
        if speed_minutes <= 5:
            status = "🔥 EXCELLENT"
        elif speed_minutes <= 30:
            status = "✅ GOOD"
        elif speed_minutes <= 60:
            status = "⏰ OKAY"
        elif speed_minutes <= 1440:  # 24 hours
            status = "🐌 SLOW"
        else:
            status = "❌ VERY SLOW"
    else:
        speed_minutes = None
        status = "🚨 NO CONTACT"
    
    return {
        'id': contact_id,
        'name': name or 'No Name',
        'email': email,
        'phone': phone,
        'created_at': created_at,
        'first_contact': first_contact,
        'speed_minutes': speed_minutes,
        'contact_method': contact_method,
        'status': status,
        'lead_age_hours': (datetime.datetime.now(datetime.timezone.utc) - created_at).total_seconds() / 3600
    }

def main():
    """Run speed-to-lead analysis on the march 24-25 opt-ins"""
    
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IldkUHBMVTZqNGhMdFpKcmRtT1JXIiwiY29tcGFueV9pZCI6Im1neUIxblY5YVltanRCUm1wYnBrIiwidmVyc2lvbiI6MSwiaWF0IjoxNzA2NzQxMTQzMTY3LCJzdWIiOiJ1c2VyX2lkIn0.Ab-dmSbjizR_xim0IlCr_BKgM5haIcOTpM8gvFt4RHs"
    LOCATION_ID = "WdPpLU6j4hLtZJrdmORW"
    TARGET_TAG = "march 24-25- new opt ins"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    print("🚀 ESA SPEED-TO-LEAD FINAL REPORT")
    print("=" * 50)
    print(f"📊 Analyzing tag: '{TARGET_TAG}'")
    print(f"📅 Report time: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Get contacts with the target tag
    url = "https://rest.gohighlevel.com/v1/contacts/"
    params = {"locationId": LOCATION_ID, "limit": 50}
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        print(f"❌ API Error: {response.status_code}")
        return
    
    data = response.json()
    all_contacts = data.get('contacts', [])
    
    # Filter for our target tag
    matching_contacts = []
    for contact in all_contacts:
        tags = contact.get('tags', [])
        if isinstance(tags, list) and TARGET_TAG in tags:
            matching_contacts.append(contact)
    
    print(f"✅ Found {len(matching_contacts)} contacts with target tag")
    
    # Analyze each contact
    results = []
    print(f"\n🔄 Analyzing speed-to-lead for each contact...")
    
    for i, contact in enumerate(matching_contacts, 1):
        print(f"   {i}/{len(matching_contacts)}: {contact.get('firstName', '')} {contact.get('lastName', '')}")
        result = analyze_contact_speed(contact, headers)
        if result:
            results.append(result)
        time.sleep(0.5)  # Rate limiting
    
    # Generate comprehensive report
    if not results:
        print("❌ No results to analyze")
        return
    
    # Calculate metrics
    contacted = [r for r in results if r['speed_minutes'] is not None]
    not_contacted = [r for r in results if r['speed_minutes'] is None]
    
    if contacted:
        speeds = [r['speed_minutes'] for r in contacted]
        avg_speed = sum(speeds) / len(speeds)
        median_speed = sorted(speeds)[len(speeds) // 2]
        
        under_5min = len([s for s in speeds if s <= 5])
        under_30min = len([s for s in speeds if s <= 30])
        under_60min = len([s for s in speeds if s <= 60])
    
    print(f"\n🎯 SPEED-TO-LEAD REPORT RESULTS")
    print("=" * 50)
    
    print(f"\n📊 OVERALL METRICS:")
    print(f"✅ Total leads analyzed: {len(results)}")
    print(f"📞 Leads contacted: {len(contacted)}")
    print(f"🚨 Leads NOT contacted: {len(not_contacted)}")
    
    if contacted:
        print(f"\n⚡ SPEED METRICS:")
        print(f"🔥 Average speed-to-lead: {avg_speed:.1f} minutes")
        print(f"📈 Median speed-to-lead: {median_speed:.1f} minutes")
        print(f"🎯 Under 5 minutes: {under_5min} ({under_5min/len(contacted)*100:.1f}%)")
        print(f"✅ Under 30 minutes: {under_30min} ({under_30min/len(contacted)*100:.1f}%)")
        print(f"⏰ Under 60 minutes: {under_60min} ({under_60min/len(contacted)*100:.1f}%)")
        
        print(f"\n🏆 TOP PERFORMERS (Fastest Response):")
        contacted_sorted = sorted(contacted, key=lambda x: x['speed_minutes'])
        for i, contact in enumerate(contacted_sorted[:5], 1):
            print(f"{i}. {contact['name']} - {contact['speed_minutes']:.1f} min ({contact['contact_method']}) {contact['status']}")
        
        if len(contacted) > 5:
            print(f"\n🐌 SLOW RESPONDERS:")
            slow_contacts = contacted_sorted[-3:]
            for contact in reversed(slow_contacts):
                print(f"• {contact['name']} - {contact['speed_minutes']:.1f} min ({contact['contact_method']})")
    
    if not_contacted:
        print(f"\n🚨 NEVER CONTACTED ({len(not_contacted)} leads):")
        for contact in not_contacted[:10]:
            age_str = f"{contact['lead_age_hours']:.1f}h ago"
            print(f"• {contact['name']} - Created {age_str}")
            print(f"  📧 {contact['email']}")
            print(f"  📱 {contact['phone']}")
    
    # Save detailed report
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    report_data = {
        'analysis_time': datetime.datetime.now().isoformat(),
        'tag_analyzed': TARGET_TAG,
        'total_leads': len(results),
        'contacted_leads': len(contacted),
        'not_contacted_leads': len(not_contacted),
        'avg_speed_minutes': avg_speed if contacted else None,
        'median_speed_minutes': median_speed if contacted else None,
        'details': results
    }
    
    filename = f"speed_to_lead_report_{timestamp}.json"
    with open(filename, 'w') as f:
        json.dump(report_data, f, indent=2, default=str)
    
    print(f"\n💾 Detailed report saved to: {filename}")
    
    # Summary for Brian
    print(f"\n🎯 SUMMARY FOR BRIAN:")
    if contacted:
        if avg_speed <= 30:
            print(f"✅ GOOD: Average response time is {avg_speed:.1f} minutes")
        else:
            print(f"⚠️ SLOW: Average response time is {avg_speed:.1f} minutes - need improvement")
    
    if not_contacted:
        print(f"🚨 URGENT: {len(not_contacted)} leads have NOT been contacted yet!")
        print(f"💰 Revenue at risk: These leads are getting cold")
    
    print(f"\n🔥 Next step: Set up automated alerts for leads >15 minutes old!")

if __name__ == "__main__":
    main()