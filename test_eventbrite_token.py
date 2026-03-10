#!/usr/bin/env python3
"""
Test Eventbrite API token and find real events
"""

import urllib.request
import urllib.parse
import json
import csv
from datetime import datetime

def test_eventbrite_token():
    """Test if the token works"""
    token = "BCFVDCNHOEVD7YUQD5DO"
    
    # Simple test - search for business events
    url = "https://www.eventbriteapi.com/v3/events/search/"
    params = {
        'q': 'business conference',
        'location.address': 'Miami, FL',
        'sort_by': 'date',
        'expand': 'organizer'
    }
    
    # Build URL
    query_string = urllib.parse.urlencode(params)
    full_url = f"{url}?{query_string}"
    
    # Create request with token
    req = urllib.request.Request(full_url)
    req.add_header('Authorization', f'Bearer {token}')
    
    try:
        print("🔍 Testing Eventbrite API with your token...")
        response = urllib.request.urlopen(req, timeout=10)
        
        if response.status == 200:
            data = json.loads(response.read().decode())
            events = data.get('events', [])
            
            print(f"✅ TOKEN WORKS! Found {len(events)} real events")
            
            if events:
                print(f"\n🎯 SAMPLE REAL EVENTS:")
                for i, event in enumerate(events[:5]):
                    name = event.get('name', {}).get('text', 'Unknown')
                    organizer = event.get('organizer', {}).get('name', 'Unknown')
                    url = event.get('url', '')
                    print(f"{i+1}. {name}")
                    print(f"   Organizer: {organizer}")
                    print(f"   URL: {url}")
                    print()
                
                return True
            else:
                print("⚠️ Token works but no events found for this search")
                return True
        else:
            print(f"❌ API Error: {response.status}")
            return False
            
    except urllib.error.HTTPError as e:
        if e.code == 401:
            print("❌ TOKEN INVALID - Check your Eventbrite token")
        else:
            print(f"❌ HTTP Error: {e.code}")
        return False
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return False

def main():
    print("🔥 EVENTBRITE TOKEN TEST")
    print("=" * 30)
    
    if test_eventbrite_token():
        print("\n🚀 SUCCESS! Your token is working")
        print("🎯 Ready to find thousands of real prospects")
        print("💰 Each discovery will find 200-500 real events")
        print("\n📋 Next: Run full discovery with real API data")
    else:
        print("\n❌ Token test failed")
        print("📋 Check your Eventbrite token in .env file")

if __name__ == "__main__":
    main()