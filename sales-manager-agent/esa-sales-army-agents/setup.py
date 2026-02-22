#!/usr/bin/env python3
"""
ESA SALES ARMY - Setup and Installation Script
"""

import os
import sys
import subprocess
import json

def create_directory_structure():
    """Create necessary directory structure"""
    
    directories = [
        'data',
        'logs', 
        'exports',
        'config',
        'integrations'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def create_config_file():
    """Create default configuration file"""
    
    config = {
        "team": {
            "closers": ["brian", "nick", "chris"],
            "daily_targets": {
                "brian": 8,
                "nick": 7, 
                "chris": 7
            },
            "specializations": {
                "brian": "tier_a_prospects",
                "nick": "analytical_prospects", 
                "chris": "relationship_prospects"
            }
        },
        "integrations": {
            "fathom": {
                "api_key": "YOUR_FATHOM_API_KEY",
                "webhook_url": "YOUR_FATHOM_WEBHOOK",
                "enabled": True
            },
            "ghl": {
                "api_key": "YOUR_GHL_API_KEY", 
                "instances": {
                    "insurance_lab": "GHL_INSTANCE_1_ID",
                    "tax_maverick": "GHL_INSTANCE_2_ID",
                    "pyp": "GHL_INSTANCE_3_ID"
                },
                "enabled": True
            },
            "kixie": {
                "api_key": "YOUR_KIXIE_API_KEY",
                "enabled": True
            },
            "sms": {
                "provider": "twilio",
                "api_key": "YOUR_SMS_API_KEY",
                "enabled": True
            }
        },
        "automation": {
            "auto_approve_threshold": 0.85,
            "max_daily_auto_sends": 20,
            "working_hours": {
                "start": 8,
                "end": 18,
                "timezone": "America/New_York"
            },
            "backup_human_approval": True
        },
        "ai_settings": {
            "lead_scoring_weights": {
                "urgency": 0.6,
                "fit": 0.4
            },
            "content_personalization_level": "high",
            "follow_up_aggressiveness": "medium"
        },
        "data_sources": {
            "lead_tiers": {
                "tier1_count": 500,
                "tier2_count": 1000, 
                "tier3_count": 2500,
                "personal_leads": 200,
                "ai_scraped": 250
            }
        }
    }
    
    config_file = "config/esa_sales_config.json"
    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"✅ Created configuration file: {config_file}")
    print("⚠️  Please update API keys in the config file before using the system")

def create_environment_file():
    """Create environment variable template"""
    
    env_content = """# ESA SALES ARMY - Environment Variables
# Copy this to .env and fill in your actual values

# API Keys
FATHOM_API_KEY=your_fathom_api_key_here
GHL_API_KEY=your_ghl_api_key_here  
KIXIE_API_KEY=your_kixie_api_key_here
TWILIO_API_KEY=your_twilio_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_sid_here

# Database (if using)
DATABASE_URL=sqlite:///data/esa_sales.db

# System Settings
DEBUG=False
LOG_LEVEL=INFO
TIMEZONE=America/New_York

# Security
SECRET_KEY=generate_a_secure_secret_key_here
"""
    
    with open('.env.template', 'w') as f:
        f.write(env_content)
    
    print("✅ Created environment template: .env.template")
    print("⚠️  Copy .env.template to .env and fill in your values")

def install_dependencies():
    """Install Python dependencies"""
    
    dependencies = [
        'asyncio',
        'requests', 
        'python-dotenv',
        'sqlalchemy',
        'pandas'
    ]
    
    print("📦 Installing Python dependencies...")
    
    for dep in dependencies:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', dep])
            print(f"✅ Installed: {dep}")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install: {dep}")

def create_startup_scripts():
    """Create startup scripts for different operating systems"""
    
    # Unix/Linux/Mac startup script
    unix_script = """#!/bin/bash
# ESA Sales Army Startup Script

echo "🚀 Starting ESA Sales Army AI System..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
pip install -r requirements.txt

# Start the system
python esa-sales-system.py

echo "👋 ESA Sales Army session ended"
"""
    
    with open('start_esa_sales.sh', 'w') as f:
        f.write(unix_script)
    
    os.chmod('start_esa_sales.sh', 0o755)
    
    # Windows startup script  
    windows_script = """@echo off
REM ESA Sales Army Startup Script for Windows

echo 🚀 Starting ESA Sales Army AI System...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\\Scripts\\activate.bat

REM Install/update dependencies
pip install -r requirements.txt

REM Start the system
python esa-sales-system.py

echo 👋 ESA Sales Army session ended
pause
"""
    
    with open('start_esa_sales.bat', 'w') as f:
        f.write(windows_script)
    
    print("✅ Created startup scripts: start_esa_sales.sh (Unix) and start_esa_sales.bat (Windows)")

def create_requirements_file():
    """Create requirements.txt file"""
    
    requirements = """# ESA Sales Army Requirements
asyncio>=3.4.3
requests>=2.28.0
python-dotenv>=0.19.0
sqlalchemy>=1.4.0
pandas>=1.5.0
python-dateutil>=2.8.0
aiohttp>=3.8.0
pydantic>=1.10.0
"""
    
    with open('requirements.txt', 'w') as f:
        f.write(requirements)
    
    print("✅ Created requirements.txt")

def create_sample_data():
    """Create sample data files for testing"""
    
    # Sample leads data
    sample_leads = [
        {
            "name": "Dr. Sarah Johnson",
            "company": "HealthTech Solutions",
            "email": "sarah.johnson@healthtech.com",
            "phone": "555-0123",
            "event_name": "Medical Innovation Summit",
            "event_date": "2024-03-15",
            "event_capacity": 500,
            "ticket_price": 400,
            "tier": "ai_scraped",
            "industry": "healthcare",
            "last_contact": null,
            "notes": "Found via AI scraping - perfect fit for our system"
        },
        {
            "name": "Mike Chen",
            "company": "TechStart Inc", 
            "email": "mike@techstart.com",
            "phone": "555-0124",
            "event_name": "Startup Showcase 2024",
            "event_date": "2024-04-02",
            "event_capacity": 300,
            "ticket_price": 200,
            "tier": "personal",
            "industry": "technology",
            "last_contact": "2024-01-15",
            "notes": "Brian's personal connection - warm lead"
        }
    ]
    
    with open('data/sample_leads.json', 'w') as f:
        json.dump(sample_leads, f, indent=2)
    
    print("✅ Created sample data: data/sample_leads.json")

def create_quick_start_guide():
    """Create quick start guide"""
    
    guide = """# ESA SALES ARMY - QUICK START GUIDE

## 1. Initial Setup
1. Run: `python setup.py` (this file)
2. Copy `.env.template` to `.env` and fill in your API keys
3. Update `config/esa_sales_config.json` with your settings

## 2. API Key Setup
You'll need API keys for:
- Fathom (call recording analysis)
- GoHighLevel (CRM integration)  
- Kixie (dialing platform)
- Twilio (SMS sending)

## 3. Start the System
- Unix/Mac: `./start_esa_sales.sh`
- Windows: Double-click `start_esa_sales.bat`
- Manual: `python esa-sales-system.py`

## 4. Daily Workflow
1. System starts with AI-generated hit list
2. Make calls using your regular process
3. After each call, use "Process completed call" 
4. Approve AI-generated follow-up content
5. AI executes approved follow-ups automatically

## 5. Key Features
- **Lead Scoring**: AI ranks your 6,000+ leads daily
- **Call Analysis**: Fathom recordings → AI insights
- **Follow-Up Automation**: Custom sequences per prospect  
- **Content Generation**: Personalized SMS/emails/videos
- **Performance Tracking**: Real-time metrics and optimization

## 6. Getting Help
- Type 'help' in the system for detailed commands
- Check logs/ directory for system logs
- Review exports/ for daily reports

## 7. Troubleshooting
- Verify API keys in .env file
- Check internet connection for integrations
- Review logs/system.log for errors
- Test with sample data first

Ready to dominate sales! 🚀
"""
    
    with open('QUICK_START.md', 'w') as f:
        f.write(guide)
    
    print("✅ Created quick start guide: QUICK_START.md")

def main():
    """Main setup function"""
    
    print("🚀 ESA SALES ARMY - SETUP & INSTALLATION")
    print("=" * 50)
    
    print("\n1. Creating directory structure...")
    create_directory_structure()
    
    print("\n2. Creating configuration files...")
    create_config_file()
    create_environment_file()
    create_requirements_file()
    
    print("\n3. Creating startup scripts...")
    create_startup_scripts()
    
    print("\n4. Creating sample data...")
    create_sample_data()
    
    print("\n5. Creating documentation...")
    create_quick_start_guide()
    
    print("\n6. Installing dependencies...")
    install_dependencies()
    
    print("\n" + "=" * 50)
    print("✅ SETUP COMPLETE!")
    print("=" * 50)
    
    print("\n📋 NEXT STEPS:")
    print("1. Copy .env.template to .env and add your API keys")
    print("2. Update config/esa_sales_config.json with your settings")
    print("3. Run: ./start_esa_sales.sh (Unix) or start_esa_sales.bat (Windows)")
    print("4. Follow QUICK_START.md for detailed instructions")
    
    print("\n🎯 Ready to 10X your sales operation!")

if __name__ == "__main__":
    main()