#!/usr/bin/env python3
"""
Streamlined Speed-to-Lead Analysis
Fast analysis of the march 24-25 opt-ins
"""

import requests
import json
import datetime
import sys

def parse_timestamp(timestamp_str):
    """Parse timestamp"""
    try:
        return datetime.datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
    except:
        return None

def main():
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IldkUHBMVTZqNGhMdFpKcmRtT1JXIiwiY29tcGFueV9pZCI6Im1neUIxblY5YVltanRCUm1wYnBrIiwidmVyc2lvbiI6MSwiaWF0IjoxNzA2NzQxMTQzMTY3LCJzdWIiOiJ1c2VyX2lkIn0.Ab-dmSbjizR_xim0IlCr_BKgM5haIcOTpM8gvFt4RHs"
    LOCATION_ID = "WdPpLU6j4hLtZJrdmORW"
    TARGET_TAG = "march 24-25- new opt ins"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    print("🚀 ESA SPEED-TO-LEAD ANALYSIS")
    print("=" * 40)
    
    # Get contacts
    print("📡 Fetching contacts...")
    url = "https://rest.gohighlevel.com/v1/contacts/"
    params = {"locationId": LOCATION_ID, "limit": 100}
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=15)
        print(f"✅ API Response: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Error: {response.text}")
            return
        
        data = response.json()
        all_contacts = data.get('contacts', [])
        print(f"📊 Total contacts: {len(all_contacts)}")
        
        # Filter by tag
        matching = []
        for contact in all_contacts:
            tags = contact.get('tags', [])
            if isinstance(tags, list) and TARGET_TAG in tags:
                matching.append(contact)
        
        print(f"🎯 Contacts with tag '{TARGET_TAG}': {len(matching)}")
        
        if not matching:
            print("❌ No matching contacts found")
            return
        
        # Quick analysis without deep API calls
        results = []
        contacted_count = 0
        not_contacted_count = 0
        
        print(f"\n📋 LEAD ANALYSIS:")
        print("-" * 40)
        
        for i, contact in enumerate(matching, 1):
            name = f"{contact.get('firstName', '')} {contact.get('lastName', '')}".strip()
            email = contact.get('email', '')
            phone = contact.get('phone', '')
            created_str = contact.get('dateAdded', '')
            updated_str = contact.get('dateUpdated', '')
            
            created_at = parse_timestamp(created_str)
            updated_at = parse_timestamp(updated_str)
            
            # Simple heuristic: if updated != created, likely contacted
            if updated_at and created_at and updated_at > created_at:
                speed_seconds = (updated_at - created_at).total_seconds()
                speed_minutes = speed_seconds / 60
                status = "📞 CONTACTED"
                contacted_count += 1
                
                if speed_minutes <= 5:
                    priority = "🔥 EXCELLENT"
                elif speed_minutes <= 30:
                    priority = "✅ GOOD"
                elif speed_minutes <= 60:
                    priority = "⏰ OKAY"
                else:
                    priority = "🐌 SLOW"
            else:
                speed_minutes = None
                status = "🚨 NOT CONTACTED"
                priority = "❌ URGENT"
                not_contacted_count += 1
            
            # Calculate age
            if created_at:
                age_hours = (datetime.datetime.now(datetime.timezone.utc) - created_at).total_seconds() / 3600
            else:
                age_hours = 0
            
            print(f"{i:2d}. {name[:25]:<25} | {status} | {priority}")
            if speed_minutes is not None:
                print(f"     Speed: {speed_minutes:.1f} min | Age: {age_hours:.1f}h")
            else:
                print(f"     NO CONTACT YET | Age: {age_hours:.1f}h | 📱 {phone}")
            
            results.append({
                'name': name,
                'email': email,
                'phone': phone,
                'speed_minutes': speed_minutes,
                'age_hours': age_hours,
                'status': status,
                'priority': priority
            })
        
        # Summary
        print(f"\n🎯 SUMMARY REPORT:")
        print("=" * 40)
        print(f"📊 Total leads: {len(matching)}")
        print(f"📞 Contacted: {contacted_count}")
        print(f"🚨 Not contacted: {not_contacted_count}")
        
        if contacted_count > 0:
            contacted_results = [r for r in results if r['speed_minutes'] is not None]
            speeds = [r['speed_minutes'] for r in contacted_results]
            avg_speed = sum(speeds) / len(speeds)
            
            under_5 = len([s for s in speeds if s <= 5])
            under_30 = len([s for s in speeds if s <= 30])
            
            print(f"⚡ Avg speed: {avg_speed:.1f} minutes")
            print(f"🔥 Under 5 min: {under_5} ({under_5/contacted_count*100:.1f}%)")
            print(f"✅ Under 30 min: {under_30} ({under_30/contacted_count*100:.1f}%)")
        
        if not_contacted_count > 0:
            print(f"\n🚨 URGENT ACTION NEEDED:")
            print(f"❌ {not_contacted_count} leads need immediate attention!")
            
            # Show oldest uncontacted leads
            not_contacted = [r for r in results if r['speed_minutes'] is None]
            not_contacted.sort(key=lambda x: x['age_hours'], reverse=True)
            
            print(f"\n📞 PRIORITY CALLBACKS:")
            for contact in not_contacted[:5]:
                print(f"• {contact['name']} - {contact['age_hours']:.1f}h old - {contact['phone']}")
        
        # Performance assessment
        print(f"\n🏆 PERFORMANCE ASSESSMENT:")
        if contacted_count == 0:
            print("🚨 CRITICAL: No leads have been contacted!")
        elif not_contacted_count > contacted_count:
            print("❌ POOR: More leads uncontacted than contacted")
        elif contacted_count > 0:
            contacted_pct = (contacted_count / len(matching)) * 100
            if contacted_pct >= 80:
                print(f"✅ GOOD: {contacted_pct:.1f}% of leads contacted")
            elif contacted_pct >= 50:
                print(f"⚠️ FAIR: {contacted_pct:.1f}% of leads contacted")
            else:
                print(f"❌ POOR: Only {contacted_pct:.1f}% of leads contacted")
        
        # Save results
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"speed_to_lead_summary_{timestamp}.json"
        
        report = {
            'analysis_time': datetime.datetime.now().isoformat(),
            'tag': TARGET_TAG,
            'total_leads': len(matching),
            'contacted': contacted_count,
            'not_contacted': not_contacted_count,
            'details': results
        }
        
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        print(f"\n💾 Report saved: {filename}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()