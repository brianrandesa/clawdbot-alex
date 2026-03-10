#!/usr/bin/env python3
"""
Map GHL user IDs to actual rep names
"""

import requests
import json
import datetime
from collections import defaultdict

def get_user_info(user_id, headers):
    """Try to get user info from GHL"""
    
    endpoints = [
        f"https://rest.gohighlevel.com/v1/users/{user_id}",
        f"https://rest.gohighlevel.com/v1/users/{user_id}/",
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, headers=headers, timeout=10)
            if response.status_code == 200:
                return response.json()
        except:
            continue
    
    return None

def main():
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IldkUHBMVTZqNGhMdFpKcmRtT1JXIiwiY29tcGFueV9pZCI6Im1neUIxblY5YVltanRCUm1wYnBrIiwidmVyc2lvbiI6MSwiaWF0IjoxNzA2NzQxMTQzMTY3LCJzdWIiOiJ1c2VyX2lkIn0.Ab-dmSbjizR_xim0IlCr_BKgM5haIcOTpM8gvFt4RHs"
    LOCATION_ID = "WdPpLU6j4hLtZJrdmORW"
    TARGET_TAG = "march 24-25- new opt ins"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    print("🔍 MAPPING USER IDs TO REP NAMES")
    print("=" * 50)
    
    # Get contacts to find all user IDs
    url = "https://rest.gohighlevel.com/v1/contacts/"
    params = {"locationId": LOCATION_ID, "limit": 100}
    
    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    all_contacts = data.get('contacts', [])
    
    # Filter by tag
    matching = []
    for contact in all_contacts:
        tags = contact.get('tags', [])
        if isinstance(tags, list) and TARGET_TAG in tags:
            matching.append(contact)
    
    print(f"📊 Found {len(matching)} contacts")
    
    # Collect all user IDs
    user_ids = set()
    for contact in matching:
        assigned_to = contact.get('assignedTo')
        if assigned_to:
            user_ids.add(assigned_to)
    
    print(f"🎯 Found {len(user_ids)} unique user IDs")
    
    # Try to get user info for each ID
    user_map = {}
    
    for user_id in user_ids:
        print(f"\n🔍 Looking up user: {user_id}")
        
        # Try different approaches to get user info
        user_info = get_user_info(user_id, headers)
        
        if user_info:
            print(f"✅ Found user info:")
            print(json.dumps(user_info, indent=2))
            
            # Extract name
            name = None
            if 'user' in user_info:
                user_data = user_info['user']
                name = f"{user_data.get('firstName', '')} {user_data.get('lastName', '')}".strip()
                if not name:
                    name = user_data.get('name', user_data.get('email', user_id))
            elif 'firstName' in user_info:
                name = f"{user_info.get('firstName', '')} {user_info.get('lastName', '')}".strip()
            elif 'name' in user_info:
                name = user_info.get('name')
            
            user_map[user_id] = name or f"User_{user_id[:8]}"
        else:
            print(f"❌ Could not fetch user info")
            # Try to infer from patterns or use fallback names
            user_map[user_id] = f"User_{user_id[:8]}"
    
    print(f"\n📋 USER ID MAPPING:")
    print("=" * 40)
    for user_id, name in user_map.items():
        print(f"{user_id} → {name}")
    
    # Now build speed-to-lead by actual rep
    rep_performance = defaultdict(list)
    
    print(f"\n🎯 SPEED-TO-LEAD BY ACTUAL REP")
    print("=" * 60)
    
    for contact in matching:
        name = f"{contact.get('firstName', '')} {contact.get('lastName', '')}".strip()
        assigned_to = contact.get('assignedTo', '')
        created_str = contact.get('dateAdded', '')
        updated_str = contact.get('dateUpdated', '')
        
        # Parse timestamps
        try:
            created_at = datetime.datetime.fromisoformat(created_str.replace('Z', '+00:00'))
        except:
            created_at = None
        
        try:
            updated_at = datetime.datetime.fromisoformat(updated_str.replace('Z', '+00:00'))
        except:
            updated_at = None
        
        # Calculate speed
        if updated_at and created_at and updated_at > created_at:
            speed_minutes = (updated_at - created_at).total_seconds() / 60
        else:
            speed_minutes = None
        
        # Calculate age
        if created_at:
            age_hours = (datetime.datetime.now(datetime.timezone.utc) - created_at).total_seconds() / 3600
        else:
            age_hours = 0
        
        rep_name = user_map.get(assigned_to, f"Unknown_{assigned_to[:8]}")
        
        contact_data = {
            'name': name,
            'phone': contact.get('phone', ''),
            'email': contact.get('email', ''),
            'speed_minutes': speed_minutes,
            'age_hours': age_hours,
            'created_at': created_at,
            'user_id': assigned_to
        }
        
        rep_performance[rep_name].append(contact_data)
    
    # Generate performance report
    all_speeds = []
    
    for rep, contacts in rep_performance.items():
        contacted = [c for c in contacts if c['speed_minutes'] is not None]
        not_contacted = [c for c in contacts if c['speed_minutes'] is None]
        
        print(f"\n👤 {rep.upper()}")
        print("-" * 50)
        print(f"📈 Total leads: {len(contacts)}")
        print(f"📞 Contacted: {len(contacted)}")
        print(f"🚨 Not contacted: {len(not_contacted)}")
        
        if contacted:
            speeds = [c['speed_minutes'] for c in contacted]
            all_speeds.extend(speeds)
            
            avg_speed = sum(speeds) / len(speeds)
            min_speed = min(speeds)
            max_speed = max(speeds)
            
            under_5 = len([s for s in speeds if s <= 5])
            under_30 = len([s for s in speeds if s <= 30])
            under_60 = len([s for s in speeds if s <= 60])
            
            contact_rate = len(contacted) / len(contacts) * 100
            under_5_pct = under_5 / len(contacted) * 100
            under_30_pct = under_30 / len(contacted) * 100
            
            print(f"⚡ Avg speed: {avg_speed:.1f} minutes")
            print(f"🔥 Fastest: {min_speed:.1f} minutes")
            print(f"🐌 Slowest: {max_speed:.1f} minutes")
            print(f"📈 Contact rate: {contact_rate:.1f}%")
            print(f"🎯 Under 5 min: {under_5}/{len(contacted)} ({under_5_pct:.1f}%)")
            print(f"✅ Under 30 min: {under_30}/{len(contacted)} ({under_30_pct:.1f}%)")
            
            # Performance grade
            if avg_speed <= 5 and under_5_pct >= 80:
                grade = "🏆 A+"
            elif avg_speed <= 15 and under_30_pct >= 70:
                grade = "🥇 A"  
            elif avg_speed <= 60 and under_30_pct >= 50:
                grade = "🥈 B"
            elif contact_rate >= 80:
                grade = "🥉 C"
            else:
                grade = "❌ D"
            
            print(f"🎯 Grade: {grade}")
            
            # Show examples
            contacted_sorted = sorted(contacted, key=lambda x: x['speed_minutes'])
            print(f"🔥 Best: {contacted_sorted[0]['name']} ({contacted_sorted[0]['speed_minutes']:.1f} min)")
            
            if max_speed > 60:
                print(f"⚠️ Slowest: {contacted_sorted[-1]['name']} ({max_speed:.1f} min)")
        
        if not_contacted:
            print(f"🚨 Need follow-up:")
            for contact in not_contacted[:3]:
                print(f"   • {contact['name']} ({contact['age_hours']:.1f}h old)")
    
    # Generate summary
    print(f"\n🏆 SUMMARY")
    print("=" * 30)
    print(f"📊 Total leads: {len(matching)}")
    print(f"📞 Total contacted: {len(all_speeds)}")
    
    if all_speeds:
        team_avg = sum(all_speeds) / len(all_speeds)
        print(f"⚡ Team avg: {team_avg:.1f} minutes")

if __name__ == "__main__":
    main()