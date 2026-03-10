#!/usr/bin/env python3
"""
Speed-to-Lead Analysis BY SALES REP
Break down performance by individual team member
"""

import requests
import json
import datetime
from collections import defaultdict

def parse_timestamp(timestamp_str):
    """Parse timestamp"""
    try:
        return datetime.datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
    except:
        return None

def get_contact_details(contact_id, headers):
    """Get detailed contact info including rep assignment"""
    
    # Get contact details
    url = f"https://rest.gohighlevel.com/v1/contacts/{contact_id}"
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json().get('contact', {})
    except:
        pass
    
    return {}

def get_contact_activities(contact_id, headers):
    """Get activities to see which rep made contact"""
    
    activities = []
    
    # Try different endpoints
    endpoints = [
        f"https://rest.gohighlevel.com/v1/contacts/{contact_id}/activities/",
        f"https://rest.gohighlevel.com/v1/contacts/{contact_id}/notes/",
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                for key in ['activities', 'notes', 'data']:
                    if key in data:
                        activities.extend(data[key])
        except:
            continue
    
    return activities

def identify_rep_from_activity(activities):
    """Try to identify which rep made contact from activity data"""
    
    # Look for rep names in activity data
    rep_indicators = {
        'nick': ['nick', 'nicholas', 'towery'],
        'chloe': ['chloe', 'sands'], 
        'chris': ['chris', 'granberry'],
        'james': ['james'],
        'marceeta': ['marceeta', 'williams']
    }
    
    for activity in activities:
        # Check various fields for rep names
        text_fields = [
            activity.get('body', ''),
            activity.get('description', ''),
            activity.get('createdBy', ''),
            activity.get('assignedTo', ''),
            str(activity.get('user', {})),
            str(activity.get('agent', {}))
        ]
        
        full_text = ' '.join(text_fields).lower()
        
        for rep, indicators in rep_indicators.items():
            if any(indicator in full_text for indicator in indicators):
                return rep.title()
    
    return 'Unknown'

def main():
    """Analyze speed-to-lead by sales rep"""
    
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IldkUHBMVTZqNGhMdFpKcmRtT1JXIiwiY29tcGFueV9pZCI6Im1neUIxblY5YVltanRCUm1wYnBrIiwidmVyc2lvbiI6MSwiaWF0IjoxNzA2NzQxMTQzMTY3LCJzdWIiOiJ1c2VyX2lkIn0.Ab-dmSbjizR_xim0IlCr_BKgM5haIcOTpM8gvFt4RHs"
    LOCATION_ID = "WdPpLU6j4hLtZJrdmORW"
    TARGET_TAG = "march 24-25- new opt ins"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    print("🎯 ESA SPEED-TO-LEAD BY SALES REP")
    print("=" * 50)
    
    # Get contacts with tag
    url = "https://rest.gohighlevel.com/v1/contacts/"
    params = {"locationId": LOCATION_ID, "limit": 100}
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        print(f"❌ API Error: {response.status_code}")
        return
    
    data = response.json()
    all_contacts = data.get('contacts', [])
    
    # Filter by tag
    matching = []
    for contact in all_contacts:
        tags = contact.get('tags', [])
        if isinstance(tags, list) and TARGET_TAG in tags:
            matching.append(contact)
    
    print(f"📊 Analyzing {len(matching)} contacts with tag '{TARGET_TAG}'")
    
    # Analyze each contact and assign to rep
    rep_data = defaultdict(list)
    
    print(f"\n🔍 Analyzing rep assignments...")
    
    for i, contact in enumerate(matching, 1):
        name = f"{contact.get('firstName', '')} {contact.get('lastName', '')}".strip()
        created_str = contact.get('dateAdded', '')
        updated_str = contact.get('dateUpdated', '')
        contact_id = contact.get('id')
        
        print(f"   {i:2d}/{len(matching)}: {name}")
        
        created_at = parse_timestamp(created_str)
        updated_at = parse_timestamp(updated_str)
        
        # Calculate speed
        if updated_at and created_at and updated_at > created_at:
            speed_seconds = (updated_at - created_at).total_seconds()
            speed_minutes = speed_seconds / 60
        else:
            speed_minutes = None
        
        # Try to identify rep multiple ways
        rep_assigned = 'Unknown'
        
        # Method 1: Check assignedTo field
        assigned_to = contact.get('assignedTo', '')
        if assigned_to:
            assigned_lower = assigned_to.lower()
            if 'nick' in assigned_lower or 'towery' in assigned_lower:
                rep_assigned = 'Nick'
            elif 'chloe' in assigned_lower or 'sands' in assigned_lower:
                rep_assigned = 'Chloe'
            elif 'chris' in assigned_lower or 'granberry' in assigned_lower:
                rep_assigned = 'Chris'
            elif 'james' in assigned_lower:
                rep_assigned = 'James'
            elif 'marceeta' in assigned_lower:
                rep_assigned = 'Marceeta'
        
        # Method 2: Check custom fields
        if rep_assigned == 'Unknown':
            custom_fields = contact.get('customFields', [])
            for field in custom_fields:
                field_name = field.get('name', '').lower()
                field_value = str(field.get('value', '')).lower()
                
                if 'agent' in field_name or 'rep' in field_name or 'assigned' in field_name:
                    if 'nick' in field_value or 'towery' in field_value:
                        rep_assigned = 'Nick'
                    elif 'chloe' in field_value or 'sands' in field_value:
                        rep_assigned = 'Chloe'
                    elif 'chris' in field_value or 'granberry' in field_value:
                        rep_assigned = 'Chris'
                    elif 'james' in field_value:
                        rep_assigned = 'James'
                    elif 'marceeta' in field_value:
                        rep_assigned = 'Marceeta'
                    break
        
        # Method 3: Check activities (if still unknown)
        if rep_assigned == 'Unknown':
            activities = get_contact_activities(contact_id, headers)
            rep_assigned = identify_rep_from_activity(activities)
        
        # Method 4: If still unknown, use a simple distribution based on contact patterns
        if rep_assigned == 'Unknown':
            # Simple heuristic based on contact timing or other patterns
            if speed_minutes and speed_minutes < 1:
                # Very fast responses might indicate automated assignment
                rep_assigned = 'Automated/Unknown'
            else:
                rep_assigned = 'Unassigned'
        
        # Calculate age
        if created_at:
            age_hours = (datetime.datetime.now(datetime.timezone.utc) - created_at).total_seconds() / 3600
        else:
            age_hours = 0
        
        rep_data[rep_assigned].append({
            'name': name,
            'speed_minutes': speed_minutes,
            'age_hours': age_hours,
            'created_at': created_at,
            'phone': contact.get('phone', ''),
            'email': contact.get('email', '')
        })
    
    # Generate rep-by-rep report
    print(f"\n🏆 SPEED-TO-LEAD BY SALES REP")
    print("=" * 60)
    
    total_leads = 0
    total_contacted = 0
    all_speeds = []
    
    for rep, contacts in rep_data.items():
        contacted = [c for c in contacts if c['speed_minutes'] is not None]
        not_contacted = [c for c in contacts if c['speed_minutes'] is None]
        
        total_leads += len(contacts)
        total_contacted += len(contacted)
        
        print(f"\n👤 {rep.upper()}")
        print("-" * 30)
        print(f"📊 Total leads: {len(contacts)}")
        print(f"📞 Contacted: {len(contacted)}")
        print(f"🚨 Not contacted: {len(not_contacted)}")
        
        if contacted:
            speeds = [c['speed_minutes'] for c in contacted]
            all_speeds.extend(speeds)
            
            avg_speed = sum(speeds) / len(speeds)
            median_speed = sorted(speeds)[len(speeds) // 2]
            
            under_5 = len([s for s in speeds if s <= 5])
            under_30 = len([s for s in speeds if s <= 30])
            
            contact_rate = len(contacted) / len(contacts) * 100
            under_5_pct = under_5 / len(contacted) * 100
            under_30_pct = under_30 / len(contacted) * 100
            
            print(f"⚡ Avg speed: {avg_speed:.1f} min")
            print(f"📈 Median speed: {median_speed:.1f} min")
            print(f"📈 Contact rate: {contact_rate:.1f}%")
            print(f"🔥 Under 5 min: {under_5}/{len(contacted)} ({under_5_pct:.1f}%)")
            print(f"✅ Under 30 min: {under_30}/{len(contacted)} ({under_30_pct:.1f}%)")
            
            # Performance grade
            if avg_speed <= 5 and contact_rate >= 95:
                grade = "🏆 A+"
            elif avg_speed <= 15 and contact_rate >= 90:
                grade = "🥇 A"
            elif avg_speed <= 30 and contact_rate >= 80:
                grade = "🥈 B"
            elif contact_rate >= 70:
                grade = "🥉 C"
            else:
                grade = "❌ D"
            
            print(f"🎯 Grade: {grade}")
            
            # Show best/worst responses
            contacted_sorted = sorted(contacted, key=lambda x: x['speed_minutes'])
            
            if len(contacted_sorted) >= 3:
                print(f"🔥 Fastest: {contacted_sorted[0]['name']} ({contacted_sorted[0]['speed_minutes']:.1f} min)")
                if contacted_sorted[-1]['speed_minutes'] > 60:
                    print(f"🐌 Slowest: {contacted_sorted[-1]['name']} ({contacted_sorted[-1]['speed_minutes']:.1f} min)")
        
        if not_contacted:
            print(f"🚨 Need follow-up:")
            for contact in not_contacted[:3]:
                print(f"   • {contact['name']} - {contact['age_hours']:.1f}h old")
    
    # Overall team summary
    if total_contacted > 0:
        team_avg_speed = sum(all_speeds) / len(all_speeds)
        team_contact_rate = total_contacted / total_leads * 100
        
        print(f"\n🎯 TEAM SUMMARY")
        print("=" * 30)
        print(f"📊 Total leads: {total_leads}")
        print(f"📞 Team contact rate: {team_contact_rate:.1f}%")
        print(f"⚡ Team avg speed: {team_avg_speed:.1f} min")
        
        # Rep rankings
        rep_performance = []
        for rep, contacts in rep_data.items():
            if rep not in ['Unknown', 'Unassigned', 'Automated/Unknown']:
                contacted = [c for c in contacts if c['speed_minutes'] is not None]
                if contacted:
                    avg_speed = sum(c['speed_minutes'] for c in contacted) / len(contacted)
                    contact_rate = len(contacted) / len(contacts) * 100
                    rep_performance.append({
                        'rep': rep,
                        'avg_speed': avg_speed,
                        'contact_rate': contact_rate,
                        'total_leads': len(contacts)
                    })
        
        if rep_performance:
            # Sort by combined performance (speed + contact rate)
            rep_performance.sort(key=lambda x: (x['avg_speed'], -x['contact_rate']))
            
            print(f"\n🏆 REP RANKINGS (by speed):")
            for i, rep_data in enumerate(rep_performance, 1):
                print(f"{i}. {rep_data['rep']} - {rep_data['avg_speed']:.1f} min avg, {rep_data['contact_rate']:.1f}% contact rate")

if __name__ == "__main__":
    main()