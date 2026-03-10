#!/usr/bin/env python3
"""
List ALL users in the GHL location to see the complete team
"""

import requests
import json

def main():
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IldkUHBMVTZqNGhMdFpKcmRtT1JXIiwiY29tcGFueV9pZCI6Im1neUIxblY5YVltanRCUm1wYnBrIiwidmVyc2lvbiI6MSwiaWF0IjoxNzA2NzQxMTQzMTY3LCJzdWIiOiJ1c2VyX2lkIn0.Ab-dmSbjizR_xim0IlCr_BKgM5haIcOTpM8gvFt4RHs"
    LOCATION_ID = "WdPpLU6j4hLtZJrdmORW"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    print("👥 ALL USERS IN YOUR GHL LOCATION")
    print("=" * 50)
    
    # Try different endpoints to get users
    endpoints_to_try = [
        f"https://rest.gohighlevel.com/v1/locations/{LOCATION_ID}/users",
        f"https://rest.gohighlevel.com/v1/locations/{LOCATION_ID}/users/",
        "https://rest.gohighlevel.com/v1/users/",
        f"https://rest.gohighlevel.com/v1/users/?locationId={LOCATION_ID}",
    ]
    
    users_found = False
    
    for endpoint in endpoints_to_try:
        print(f"\n🔍 Trying endpoint: {endpoint}")
        
        try:
            response = requests.get(endpoint, headers=headers, timeout=15)
            print(f"📡 Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success! Response keys: {list(data.keys())}")
                
                # Look for users in different possible keys
                users = None
                for key in ['users', 'data', 'results', 'members']:
                    if key in data:
                        users = data[key]
                        break
                
                if users:
                    print(f"👥 Found {len(users)} users:")
                    print("-" * 40)
                    
                    for i, user in enumerate(users, 1):
                        name = user.get('name', 'No Name')
                        first_name = user.get('firstName', '')
                        last_name = user.get('lastName', '') 
                        email = user.get('email', 'No Email')
                        phone = user.get('phone', 'No Phone')
                        user_id = user.get('id', 'No ID')
                        role = user.get('role', user.get('roles', {}).get('role', 'No Role'))
                        
                        full_name = f"{first_name} {last_name}".strip() if first_name or last_name else name
                        
                        print(f"{i:2d}. {full_name}")
                        print(f"    📧 {email}")
                        print(f"    📱 {phone}")
                        print(f"    🎭 Role: {role}")
                        print(f"    🆔 ID: {user_id}")
                        print()
                    
                    users_found = True
                    break
                else:
                    print(f"⚠️ No users array found. Response structure: {data}")
            else:
                print(f"❌ Error: {response.text[:200]}...")
                
        except Exception as e:
            print(f"❌ Exception: {e}")
    
    if not users_found:
        print("\n🔍 Let me try a different approach - checking company level...")
        
        # Try company-level endpoint
        company_endpoints = [
            "https://rest.gohighlevel.com/v1/users/",
            f"https://rest.gohighlevel.com/v1/companies/mgyB1nV9aYmjtBRmpbpk/users",
        ]
        
        for endpoint in company_endpoints:
            print(f"\n🔍 Trying: {endpoint}")
            try:
                response = requests.get(endpoint, headers=headers, timeout=15)
                print(f"📡 Status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"Response: {data}")
                    break
                else:
                    print(f"Error: {response.text[:200]}...")
            except Exception as e:
                print(f"Exception: {e}")
    
    # If still no luck, show the specific users we found from assignedTo fields
    if not users_found:
        print(f"\n📋 USERS FOUND FROM CONTACT ASSIGNMENTS:")
        print("=" * 50)
        
        known_users = [
            {
                "id": "X1gKbmr5btOXN7YPws3a",
                "name": "James Mungai",
                "email": "james@taxmaverick.com",
                "phone": "+19548066025",
                "role": "admin"
            },
            {
                "id": "WRBIx26iWbvdyJhlyjRh", 
                "name": "Emanuela Braj",
                "email": "emanuela@taxmaverick.com",
                "phone": "+18188588585",
                "role": "user"
            },
            {
                "id": "csVxARLIctVDe1onfgM5",
                "name": "Alisha West", 
                "email": "alisha@eventsalesagency.com",
                "phone": "+18137270381",
                "role": "admin"
            },
            {
                "id": "GSW5Ro5DN9Pi9WRXYCnw",
                "name": "Jacob Dawson",
                "email": "Jacob@eventsalesagency.com", 
                "phone": "Not provided",
                "role": "user"
            }
        ]
        
        for i, user in enumerate(known_users, 1):
            print(f"{i}. {user['name']}")
            print(f"   📧 {user['email']}")
            print(f"   📱 {user['phone']}")
            print(f"   🎭 Role: {user['role']}")
            print(f"   🆔 ID: {user['id']}")
            print()
    
    print(f"\n💡 These are the reps I can see assigned to your leads in GHL.")
    print("If you're expecting to see Nick Towery, Chloe Sands, etc., they might be:")
    print("• Using Kixie but not assigned in GHL")
    print("• In a different GHL location/account")
    print("• Using different names in the system")

if __name__ == "__main__":
    main()