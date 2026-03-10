#!/usr/bin/env python3
"""
Actually EXAMINE the GHL data to see what rep assignment info exists
Stop guessing and look at the real fields
"""

import requests
import json
import datetime

def main():
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IldkUHBMVTZqNGhMdFpKcmRtT1JXIiwiY29tcGFueV9pZCI6Im1neUIxblY5YVltanRCUm1wYnBrIiwidmVyc2lvbiI6MSwiaWF0IjoxNzA2NzQxMTQzMTY3LCJzdWIiOiJ1c2VyX2lkIn0.Ab-dmSbjizR_xim0IlCr_BKgM5haIcOTpM8gvFt4RHs"
    LOCATION_ID = "WdPpLU6j4hLtZJrdmORW"
    TARGET_TAG = "march 24-25- new opt ins"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    print("🔍 EXAMINING ACTUAL GHL DATA STRUCTURE")
    print("=" * 60)
    
    # Get contacts
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
    
    print(f"📊 Found {len(matching)} contacts with tag '{TARGET_TAG}'")
    print(f"📊 Total contacts in location: {len(all_contacts)}")
    
    if not matching:
        print("❌ No contacts found")
        return
    
    # Examine the first few contacts in detail
    print(f"\n🔬 DETAILED EXAMINATION OF FIRST 3 CONTACTS:")
    print("=" * 70)
    
    for i, contact in enumerate(matching[:3], 1):
        print(f"\n👤 CONTACT #{i}: {contact.get('firstName', '')} {contact.get('lastName', '')}")
        print("-" * 50)
        
        # Print ALL fields to see what's actually available
        print("📋 ALL CONTACT FIELDS:")
        for key, value in contact.items():
            if key == 'customFields' and isinstance(value, list):
                print(f"   {key}:")
                for field in value:
                    print(f"      • {field.get('name', 'No Name')}: {field.get('value', 'No Value')}")
            else:
                print(f"   {key}: {value}")
        
        # Get detailed contact info
        contact_id = contact.get('id')
        if contact_id:
            print(f"\n🔍 FETCHING DETAILED INFO FOR {contact_id}...")
            
            detail_url = f"https://rest.gohighlevel.com/v1/contacts/{contact_id}"
            detail_response = requests.get(detail_url, headers=headers)
            
            if detail_response.status_code == 200:
                detail_data = detail_response.json()
                contact_detail = detail_data.get('contact', {})
                
                print(f"📋 DETAILED CONTACT FIELDS:")
                for key, value in contact_detail.items():
                    if key == 'customFields' and isinstance(value, list):
                        print(f"   {key}:")
                        for field in value:
                            print(f"      • {field.get('name', 'No Name')}: {field.get('value', 'No Value')}")
                    elif key not in contact:  # Only show new fields
                        print(f"   {key}: {value}")
            
            # Check for activities/notes
            activities_url = f"https://rest.gohighlevel.com/v1/contacts/{contact_id}/activities/"
            activities_response = requests.get(activities_url, headers=headers)
            
            if activities_response.status_code == 200:
                activities_data = activities_response.json()
                activities = activities_data.get('activities', [])
                
                print(f"\n📝 ACTIVITIES ({len(activities)} found):")
                for j, activity in enumerate(activities[:3], 1):
                    print(f"   Activity #{j}:")
                    for key, value in activity.items():
                        print(f"      {key}: {value}")
            
            # Check for notes
            notes_url = f"https://rest.gohighlevel.com/v1/contacts/{contact_id}/notes/"
            notes_response = requests.get(notes_url, headers=headers)
            
            if notes_response.status_code == 200:
                notes_data = notes_response.json()
                notes = notes_data.get('notes', [])
                
                print(f"\n📝 NOTES ({len(notes)} found):")
                for j, note in enumerate(notes[:3], 1):
                    print(f"   Note #{j}:")
                    for key, value in note.items():
                        print(f"      {key}: {value}")
        
        print("\n" + "=" * 70)
    
    # Look for common assignment patterns across all contacts
    print(f"\n🔍 SCANNING ALL CONTACTS FOR REP ASSIGNMENT PATTERNS:")
    print("=" * 60)
    
    assignment_fields = set()
    custom_field_names = set()
    assigned_to_values = set()
    
    for contact in matching:
        # Check assignedTo field
        assigned_to = contact.get('assignedTo')
        if assigned_to:
            assigned_to_values.add(str(assigned_to))
        
        # Check all top-level fields that might indicate assignment
        for key, value in contact.items():
            if 'assign' in key.lower() or 'rep' in key.lower() or 'agent' in key.lower() or 'owner' in key.lower():
                assignment_fields.add(f"{key}: {value}")
        
        # Check custom fields
        custom_fields = contact.get('customFields', [])
        for field in custom_fields:
            field_name = field.get('name', '')
            custom_field_names.add(field_name)
            
            if any(keyword in field_name.lower() for keyword in ['assign', 'rep', 'agent', 'owner', 'sales']):
                assignment_fields.add(f"Custom Field - {field_name}: {field.get('value', '')}")
    
    print(f"\n📊 ASSIGNMENT ANALYSIS:")
    print(f"Unique assignedTo values: {len(assigned_to_values)}")
    for value in sorted(assigned_to_values):
        print(f"   • {value}")
    
    print(f"\nAssignment-related fields found: {len(assignment_fields)}")
    for field in sorted(assignment_fields):
        print(f"   • {field}")
    
    print(f"\nAll custom field names: {len(custom_field_names)}")
    for name in sorted(custom_field_names):
        print(f"   • {name}")
    
    print(f"\n💡 SUMMARY:")
    print("This shows exactly what assignment/rep data is available in your GHL setup.")
    print("Based on this, we can build accurate rep attribution for speed-to-lead analysis.")

if __name__ == "__main__":
    main()