#!/usr/bin/env python3
"""
Quick GHL API Test - Just pull basic contact data
"""

import requests
import json
import datetime

def quick_ghl_test():
    """Simple test to pull contacts and find tag matches"""
    
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IldkUHBMVTZqNGhMdFpKcmRtT1JXIiwiY29tcGFueV9pZCI6Im1neUIxblY5YVltanRCUm1wYnBrIiwidmVyc2lvbiI6MSwiaWF0IjoxNzA2NzQxMTQzMTY3LCJzdWIiOiJ1c2VyX2lkIn0.Ab-dmSbjizR_xim0IlCr_BKgM5haIcOTpM8gvFt4RHs"
    LOCATION_ID = "WdPpLU6j4hLtZJrdmORW"
    TARGET_TAG = "march 24-25- new opt ins"
    
    print("🔍 GHL QUICK SPEED-TO-LEAD TEST")
    print("=" * 50)
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Get first 20 contacts
    url = "https://rest.gohighlevel.com/v1/contacts/"
    params = {"locationId": LOCATION_ID, "limit": 20}
    
    try:
        print("📡 Fetching contacts...")
        response = requests.get(url, headers=headers, params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            contacts = data.get('contacts', [])
            
            print(f"✅ Successfully fetched {len(contacts)} contacts")
            
            # Look for our target tag
            matching_contacts = []
            all_tags = set()
            
            for contact in contacts:
                # Get contact info
                name = f"{contact.get('firstName', '')} {contact.get('lastName', '')}".strip()
                email = contact.get('email', '')
                phone = contact.get('phone', '')
                date_added = contact.get('dateAdded', '')
                
                # Get tags
                tags = contact.get('tags', [])
                if isinstance(tags, list):
                    all_tags.update(tags)
                    # Check for exact or partial match
                    for tag in tags:
                        if TARGET_TAG.lower() in str(tag).lower():
                            matching_contacts.append({
                                'name': name or 'No Name',
                                'email': email,
                                'phone': phone,
                                'date_added': date_added,
                                'matching_tag': tag,
                                'all_tags': tags
                            })
                            break
                elif isinstance(tags, str):
                    all_tags.add(tags)
                    if TARGET_TAG.lower() in tags.lower():
                        matching_contacts.append({
                            'name': name or 'No Name', 
                            'email': email,
                            'phone': phone,
                            'date_added': date_added,
                            'matching_tag': tags,
                            'all_tags': [tags]
                        })
            
            print(f"\n📊 ANALYSIS RESULTS:")
            print(f"🎯 Target tag: '{TARGET_TAG}'")
            print(f"✅ Total contacts scanned: {len(contacts)}")
            print(f"🔍 Contacts with matching tag: {len(matching_contacts)}")
            
            if matching_contacts:
                print(f"\n🎯 MATCHING CONTACTS:")
                for i, contact in enumerate(matching_contacts[:10], 1):
                    print(f"{i}. {contact['name']}")
                    print(f"   📧 {contact['email']}")
                    print(f"   📱 {contact['phone']}")
                    print(f"   📅 Added: {contact['date_added']}")
                    print(f"   🏷️  Matched tag: '{contact['matching_tag']}'")
                    print()
                
                # Try to analyze speed-to-lead for first matching contact
                if len(matching_contacts) > 0:
                    test_contact = matching_contacts[0]
                    print(f"🔬 SPEED-TO-LEAD SAMPLE ANALYSIS:")
                    print(f"Contact: {test_contact['name']}")
                    print(f"Created: {test_contact['date_added']}")
                    
                    # Parse the creation date
                    try:
                        if test_contact['date_added']:
                            # Try to parse the date
                            created_dt = datetime.datetime.fromisoformat(test_contact['date_added'].replace('Z', '+00:00'))
                            print(f"✅ Parsed creation time: {created_dt}")
                            
                            # Calculate time since creation
                            now = datetime.datetime.now(datetime.timezone.utc)
                            age_hours = (now - created_dt).total_seconds() / 3600
                            print(f"📊 Lead age: {age_hours:.1f} hours")
                            
                            # For now, just show that we can access the data
                            print(f"✅ Ready for full speed-to-lead analysis!")
                        else:
                            print("⚠️  No creation date found")
                    except Exception as e:
                        print(f"❌ Error parsing date: {e}")
            
            else:
                print(f"\n⚠️  No contacts found with tag matching '{TARGET_TAG}'")
                print(f"\n📋 ALL TAGS FOUND (first 20):")
                sorted_tags = sorted(list(all_tags))[:20]
                for tag in sorted_tags:
                    print(f"   • {tag}")
                
                if len(all_tags) > 20:
                    print(f"   ... and {len(all_tags) - 20} more tags")
                    
                print(f"\n🔍 SUGGESTIONS:")
                print(f"1. Check if the tag name is exact: '{TARGET_TAG}'")
                print(f"2. Try searching a broader date range")
                print(f"3. Check if tag is in a different GHL location")
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    quick_ghl_test()