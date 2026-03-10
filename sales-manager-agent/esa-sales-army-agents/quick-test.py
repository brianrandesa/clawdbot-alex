#!/usr/bin/env python3
"""
Quick Kixie API Test - Run after support enables access
"""

import requests
import os

def quick_test():
    api_key = "6ea958789c216713f9e6a18fbab0a5a8"
    account_id = "36719"
    
    print("🚀 QUICK KIXIE API TEST")
    print("=" * 30)
    
    # Test main endpoint
    try:
        response = requests.get(
            "https://api.kixie.com/v1/account",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=5
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS! API access enabled!")
            print("🎯 Rex can now pull your dial data!")
        elif response.status_code == 403:
            print("❌ Still forbidden - ask support to enable API access")
        elif response.status_code == 401:
            print("❌ Unauthorized - check API key")
        else:
            print(f"❌ Status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    quick_test()