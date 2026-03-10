#!/usr/bin/env python3
"""
Deploy the real Event Hunter system
Run this after getting Eventbrite API token
"""

import os
import subprocess
import sys
from datetime import datetime

def check_token():
    """Check if Eventbrite token is configured"""
    try:
        with open('.env', 'r') as f:
            content = f.read()
            if 'your_eventbrite_token_here' in content:
                print("❌ Eventbrite token not configured yet")
                print("📋 Steps to get token:")
                print("   1. Go to: https://www.eventbrite.com/platform/api/")
                print("   2. Create app: 'ESA Event Hunter'")
                print("   3. Copy private token")
                print("   4. Replace 'your_eventbrite_token_here' in .env file")
                return False
            else:
                print("✅ Eventbrite token configured")
                return True
    except Exception as e:
        print(f"❌ Error reading .env: {e}")
        return False

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    packages = ['requests', 'python-dotenv']
    
    for package in packages:
        try:
            subprocess.run([sys.executable, '-m', 'pip', 'install', package], 
                         check=True, capture_output=True)
            print(f"✅ Installed {package}")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install {package}")

def test_real_system():
    """Test the real Event Hunter"""
    print("🧪 Testing real Event Hunter...")
    try:
        result = subprocess.run([sys.executable, 'real_event_hunter.py'], 
                              capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ Real Event Hunter working!")
            print("📄 Check for new CSV file with real prospects")
            return True
        else:
            print("❌ Real Event Hunter failed:")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Error testing system: {e}")
        return False

def main():
    print("🚀 ESA REAL EVENT HUNTER DEPLOYMENT")
    print("=" * 40)
    
    # Check token
    if not check_token():
        print("\n⚠️ Setup incomplete. Get Eventbrite token first.")
        return
    
    # Install packages
    install_requirements()
    
    # Test system
    if test_real_system():
        print("\n🎯 SUCCESS! Real Event Hunter is deployed")
        print("📋 Next steps:")
        print("   1. Check CSV file for real prospects")
        print("   2. Set up daily discovery schedule")
        print("   3. Start contacting real prospects")
    else:
        print("\n❌ Deployment failed. Check logs above.")

if __name__ == "__main__":
    main()