#!/usr/bin/env python3
"""
GHL API Connection Test & Troubleshooting
"""

import requests
import json
import base64
from datetime import datetime

def decode_jwt_payload(jwt_token):
    """Decode JWT payload to see what's inside"""
    try:
        # JWT format: header.payload.signature
        parts = jwt_token.split('.')
        if len(parts) != 3:
            return "Invalid JWT format"
        
        # Decode payload (add padding if needed)
        payload = parts[1]
        payload += '=' * (4 - len(payload) % 4)  # Add padding
        decoded = base64.b64decode(payload)
        return json.loads(decoded)
    except Exception as e:
        return f"Error decoding JWT: {e}"

def test_ghl_api_connection():
    """Test different GHL API endpoints and authentication methods"""
    
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IldkUHBMVTZqNGhMdFpKcmRtT1JXIiwiY29tcGFueV9pZCI6Im1neUIxblY5YVltanRCUm1wYnBrIiwidmVyc2lvbiI6MSwiaWF0IjoxNzA2NzQxMTQzMTY3LCJzdWIiOiJ1c2VyX2lkIn0.Ab-dmSbjizR_xim0IlCr_BKgM5haIcOTpM8gvFt4RHs"
    LOCATION_ID = "WdPpLU6j4hLtZJrdmORW"
    
    print("🔍 GHL API CONNECTION TEST")
    print("=" * 40)
    
    # Decode the JWT to see what's inside
    print("\n📋 JWT PAYLOAD ANALYSIS:")
    payload = decode_jwt_payload(API_KEY)
    print(json.dumps(payload, indent=2))
    
    if isinstance(payload, dict):
        # Check if token is expired
        iat = payload.get('iat')
        if iat:
            issued_date = datetime.fromtimestamp(iat / 1000)  # Convert from milliseconds
            print(f"🕐 Token issued: {issued_date}")
            print(f"🕐 Days ago: {(datetime.now() - issued_date).days}")
    
    # Test different API endpoints and auth methods
    test_configs = [
        {
            "name": "GHL API v2 (services.leadconnectorhq.com)",
            "base_url": "https://services.leadconnectorhq.com",
            "headers": {
                "Authorization": f"Bearer {API_KEY}",
                "Version": "2021-07-28",
                "Content-Type": "application/json"
            }
        },
        {
            "name": "GHL API v1 (rest.gohighlevel.com)",  
            "base_url": "https://rest.gohighlevel.com/v1",
            "headers": {
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            }
        },
        {
            "name": "GHL API v2 Alternative",
            "base_url": "https://services.leadconnectorhq.com",
            "headers": {
                "Authorization": f"Bearer {API_KEY}",
                "Version": "2021-04-15",
                "Content-Type": "application/json"
            }
        }
    ]
    
    for config in test_configs:
        print(f"\n🧪 TESTING: {config['name']}")
        print("-" * 50)
        
        # Test contacts endpoint
        try:
            url = f"{config['base_url']}/contacts/"
            params = {"locationId": LOCATION_ID, "limit": 1}
            
            response = requests.get(url, headers=config['headers'], params=params, timeout=10)
            
            print(f"📡 Status Code: {response.status_code}")
            print(f"📡 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                print("✅ SUCCESS! API connection working")
                data = response.json()
                print(f"📊 Sample response keys: {list(data.keys())}")
                if 'contacts' in data:
                    print(f"📊 Contacts found: {len(data['contacts'])}")
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"📝 Response: {response.text[:500]}...")
                
        except Exception as e:
            print(f"❌ Exception: {e}")
    
    # Test location-specific endpoints
    print(f"\n🏢 TESTING LOCATION-SPECIFIC ENDPOINTS")
    print("-" * 50)
    
    location_endpoints = [
        f"https://services.leadconnectorhq.com/locations/{LOCATION_ID}",
        f"https://services.leadconnectorhq.com/locations/{LOCATION_ID}/contacts",
        f"https://rest.gohighlevel.com/v1/contacts/?locationId={LOCATION_ID}",
    ]
    
    for endpoint in location_endpoints:
        try:
            headers = {
                "Authorization": f"Bearer {API_KEY}",
                "Version": "2021-07-28",
                "Content-Type": "application/json"
            }
            
            response = requests.get(endpoint, headers=headers, timeout=10)
            print(f"📡 {endpoint}")
            print(f"   Status: {response.status_code}")
            if response.status_code != 200:
                print(f"   Error: {response.text[:200]}...")
            else:
                print("   ✅ Success!")
                
        except Exception as e:
            print(f"   ❌ Exception: {e}")

if __name__ == "__main__":
    test_ghl_api_connection()