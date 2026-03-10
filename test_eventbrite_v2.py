#!/usr/bin/env python3
"""
Test Eventbrite API token with different approach
"""

import urllib.request
import urllib.parse
import json
from datetime import datetime

def test_token_simple():
    """Test with simpler API call"""
    token = "BCFVDCNHOEVD7YUQD5DO"
    
    # Test with user info endpoint first
    url = "https://www.eventbriteapi.com/v3/users/me/"
    
    req = urllib.request.Request(url)
    req.add_header('Authorization', f'Bearer {token}')
    
    try:
        print("🔍 Testing Eventbrite API connection...")
        response = urllib.request.urlopen(req, timeout=10)
        
        if response.status == 200:
            data = json.loads(response.read().decode())
            name = data.get('name', 'Unknown')
            email = data.get('emails', [{}])[0].get('email', 'Unknown')
            
            print(f"✅ API TOKEN WORKS!")
            print(f"👤 Account: {name}")
            print(f"📧 Email: {email}")
            
            return True
        else:
            print(f"❌ API returned status: {response.status}")
            return False
            
    except urllib.error.HTTPError as e:
        if e.code == 401:
            print("❌ UNAUTHORIZED - Token might be invalid")
            print("   Check that you copied the full private token")
        elif e.code == 403:
            print("❌ FORBIDDEN - Token doesn't have required permissions")
        else:
            print(f"❌ HTTP Error: {e.code} - {e.reason}")
        return False
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return False

def test_events_search():
    """Test actual events search"""
    token = "BCFVDCNHOEVD7YUQD5DO"
    
    url = "https://www.eventbriteapi.com/v3/events/search/"
    params = {
        'q': 'business',
        'sort_by': 'date'
    }
    
    query_string = urllib.parse.urlencode(params)
    full_url = f"{url}?{query_string}"
    
    req = urllib.request.Request(full_url)
    req.add_header('Authorization', f'Bearer {token}')
    
    try:
        print("\n🔍 Testing events search...")
        response = urllib.request.urlopen(req, timeout=10)
        
        if response.status == 200:
            data = json.loads(response.read().decode())
            events = data.get('events', [])
            
            print(f"✅ EVENTS SEARCH WORKS! Found {len(events)} events")
            
            if events:
                print(f"\n📋 FIRST FEW EVENTS:")
                for i, event in enumerate(events[:3]):
                    name = event.get('name', {}).get('text', 'Unknown')
                    print(f"{i+1}. {name}")
                    
                    # Check if we can access organizer
                    org = event.get('organizer')
                    if org:
                        print(f"   Organizer: {org.get('name', 'Unknown')}")
                        print(f"   Organizer ID: {org.get('id', 'Unknown')}")
            
            return True
        else:
            print(f"❌ Search failed: {response.status}")
            return False
            
    except Exception as e:
        print(f"❌ Search error: {e}")
        return False

def main():
    print("🔥 EVENTBRITE API TEST v2")
    print("=" * 40)
    
    # Test 1: Basic auth
    if test_token_simple():
        print("\n" + "="*40)
        
        # Test 2: Events search  
        if test_events_search():
            print("\n🚀 SUCCESS! Your API token is fully working")
            print("🎯 Ready to find real prospects with contact info")
        else:
            print("\n⚠️ Token works but events search has issues")
    else:
        print("\n❌ Token authentication failed")

if __name__ == "__main__":
    main()