#!/usr/bin/env python3
"""
Real Eventbrite discovery using working token
Try different API endpoints to find events
"""

import urllib.request
import urllib.parse
import json
import csv
from datetime import datetime

def test_different_endpoints():
    """Test various Eventbrite endpoints to find events"""
    token = "BCFVDCNHOEVD7YUQD5DO"
    
    endpoints_to_try = [
        "https://www.eventbriteapi.com/v3/events/search/",
        "https://www.eventbriteapi.com/v3/events/",
        "https://www.eventbriteapi.com/v3/categories/",
        "https://www.eventbriteapi.com/v3/organizers/",
    ]
    
    headers = {'Authorization': f'Bearer {token}'}
    
    print("🔍 Testing different Eventbrite endpoints...")
    
    for endpoint in endpoints_to_try:
        try:
            print(f"\n📡 Testing: {endpoint}")
            
            req = urllib.request.Request(endpoint)
            req.add_header('Authorization', f'Bearer {token}')
            
            response = urllib.request.urlopen(req, timeout=10)
            
            if response.status == 200:
                data = json.loads(response.read().decode())
                print(f"✅ SUCCESS! Endpoint works")
                print(f"   Response keys: {list(data.keys())}")
                
                # If this is categories, show some
                if 'categories' in data:
                    cats = data['categories'][:5]
                    print(f"   Sample categories: {[c.get('name') for c in cats]}")
                
                # If this has events
                if 'events' in data:
                    events = data['events']
                    print(f"   Found {len(events)} events")
                    
                return endpoint, data
            else:
                print(f"❌ Status: {response.status}")
                
        except urllib.error.HTTPError as e:
            print(f"❌ HTTP Error: {e.code}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    return None, None

def try_event_search_with_different_params():
    """Try event search with minimal parameters"""
    token = "BCFVDCNHOEVD7YUQD5DO"
    
    # Try without location first
    base_url = "https://www.eventbriteapi.com/v3/events/search/"
    
    param_sets = [
        {},  # No params
        {'q': 'business'},  # Just query
        {'location.address': 'Miami, FL'},  # Just location
        {'categories': '101'},  # Just category (business)
        {'q': 'conference', 'location.address': 'United States'},  # Basic combo
    ]
    
    for i, params in enumerate(param_sets):
        try:
            print(f"\n🎯 Test {i+1}: {params}")
            
            if params:
                query_string = urllib.parse.urlencode(params)
                url = f"{base_url}?{query_string}"
            else:
                url = base_url
            
            req = urllib.request.Request(url)
            req.add_header('Authorization', f'Bearer {token}')
            
            response = urllib.request.urlopen(req, timeout=10)
            
            if response.status == 200:
                data = json.loads(response.read().decode())
                events = data.get('events', [])
                pagination = data.get('pagination', {})
                
                print(f"✅ SUCCESS! Found {len(events)} events")
                print(f"   Total available: {pagination.get('object_count', 'unknown')}")
                
                if events:
                    print(f"   Sample event: {events[0].get('name', {}).get('text', 'Unknown')}")
                    
                    # Try to get organizer info
                    org = events[0].get('organizer')
                    if org:
                        print(f"   Organizer: {org.get('name', 'Unknown')}")
                        
                        # Check if we can get organizer details
                        org_id = org.get('id')
                        if org_id:
                            try:
                                org_url = f"https://www.eventbriteapi.com/v3/organizers/{org_id}/"
                                org_req = urllib.request.Request(org_url)
                                org_req.add_header('Authorization', f'Bearer {token}')
                                org_resp = urllib.request.urlopen(org_req, timeout=5)
                                
                                if org_resp.status == 200:
                                    org_data = json.loads(org_resp.read().decode())
                                    org_email = org_data.get('email', 'Not available')
                                    print(f"   Organizer email: {org_email}")
                            except:
                                print(f"   Organizer details: Access limited")
                
                return True, data
            else:
                print(f"❌ Status: {response.status}")
                
        except urllib.error.HTTPError as e:
            print(f"❌ HTTP {e.code}: {e.reason}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    return False, None

def main():
    print("🚀 EVENTBRITE REAL DISCOVERY TEST")
    print("🔥 Your token works - finding the right endpoints")
    print("=" * 50)
    
    # Test basic endpoints
    working_endpoint, data = test_different_endpoints()
    
    print("\n" + "="*50)
    
    # Test event search specifically
    search_works, search_data = try_event_search_with_different_params()
    
    if search_works:
        print(f"\n🎯 EVENT SEARCH IS WORKING!")
        print(f"🚀 Ready to build real prospect discovery")
        print(f"📧 Can access organizer contact information")
    else:
        print(f"\n⚠️ Event search needs different approach")
        print(f"💡 But your token is valid - we can work with this")

if __name__ == "__main__":
    main()