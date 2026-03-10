#!/usr/bin/env python3
"""
ESA Real Prospect Machine - One-Click Installer and Runner
Installs dependencies and runs the prospect discovery
"""

import subprocess
import sys
import os
import time
from datetime import datetime

def install_package(package):
    """Install a Python package"""
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', package], 
                      check=True, capture_output=True, text=True)
        print(f"✅ Installed {package}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install {package}: {e}")
        return False

def setup_environment():
    """Set up the environment"""
    print("📦 Setting up environment...")
    
    required_packages = [
        'requests',
        'beautifulsoup4',
        'python-dotenv',
        'lxml'
    ]
    
    success = True
    for package in required_packages:
        if not install_package(package):
            success = False
    
    return success

def check_env_file():
    """Check and create .env file if needed"""
    if not os.path.exists('.env'):
        env_content = """# ESA REAL PROSPECT MACHINE - CONFIGURATION
# Optional: Add Eventbrite token for enhanced discovery
EVENTBRITE_TOKEN=your_eventbrite_token_here

# ESA Settings
ESA_MIN_SCORE=40
ESA_TARGET_LOCATIONS=Miami,Los Angeles,New York,Dallas
ESA_TARGET_KEYWORDS=business conference,sales training,entrepreneur summit
"""
        with open('.env', 'w') as f:
            f.write(env_content)
        print("📝 Created .env configuration file")
    else:
        print("✅ .env file exists")

def run_prospect_machine():
    """Run the prospect discovery machine"""
    print("\n🚀 STARTING ESA REAL PROSPECT MACHINE")
    print("=" * 50)
    
    try:
        # Run the main prospect machine
        result = subprocess.run([sys.executable, 'esa_real_prospect_machine.py'], 
                              capture_output=False, text=True)
        
        if result.returncode == 0:
            print("\n✅ PROSPECT DISCOVERY COMPLETED SUCCESSFULLY!")
            
            # List generated files
            files = [f for f in os.listdir('.') if f.startswith('ESA_REAL_PROSPECTS_') or f.startswith('ESA_Discovery_Report_')]
            
            if files:
                print("\n📁 Generated Files:")
                for file in files:
                    print(f"   📄 {file}")
                    
            print(f"\n🎯 Check CSV files for your real prospects!")
            
        else:
            print("❌ Prospect discovery failed")
            
    except Exception as e:
        print(f"❌ Error running prospect machine: {e}")

def main():
    """Main setup and execution"""
    print("🏗️  ESA REAL PROSPECT MACHINE - SETUP & RUN")
    print("🔥 Building your real prospect discovery system...")
    print("=" * 60)
    
    # Step 1: Install dependencies
    if not setup_environment():
        print("❌ Failed to install required packages")
        return
    
    # Step 2: Check environment
    check_env_file()
    
    # Step 3: Run the machine
    print("\n⏳ Starting discovery in 3 seconds...")
    time.sleep(3)
    
    run_prospect_machine()
    
    print("\n" + "=" * 60)
    print("🎯 ESA REAL PROSPECT MACHINE DEPLOYMENT COMPLETE")
    print("💰 Your pipeline of real prospects is ready!")

if __name__ == "__main__":
    main()