#!/usr/bin/env python3
"""
Setup Real API Tokens for Event Hunter
Walk through getting actual API access for real data sources
"""

def setup_eventbrite_api():
    print("🎟️ EVENTBRITE API SETUP")
    print("=" * 40)
    print("1. Go to: https://www.eventbrite.com/platform/api-keys")
    print("2. Sign in to your Eventbrite account (or create one)")  
    print("3. Click 'Create API Key'")
    print("4. Name it: 'ESA Event Hunter'")
    print("5. Copy the 'Private Token'")
    print("6. Paste it in the .env file as EVENTBRITE_TOKEN=your_token_here")
    print("\n✅ Eventbrite gives access to:")
    print("   - Real events with real organizers")
    print("   - Contact emails for many organizers")
    print("   - Event details, pricing, capacity")
    print("   - Venue information")
    print()

def setup_facebook_api():
    print("📘 FACEBOOK EVENTS API SETUP") 
    print("=" * 40)
    print("1. Go to: https://developers.facebook.com/")
    print("2. Create Facebook Developer Account")
    print("3. Create New App -> 'Business' type")
    print("4. Add 'Facebook Login' product")
    print("5. Get Access Token from Graph API Explorer")
    print("6. Request 'events' permission")
    print("7. Copy Access Token to .env as FACEBOOK_ACCESS_TOKEN")
    print("\n✅ Facebook Events gives access to:")
    print("   - Public events with large audiences")
    print("   - Event organizer pages") 
    print("   - Attendee counts")
    print("   - Social media engagement data")
    print()

def setup_meetup_api():
    print("🤝 MEETUP API SETUP")
    print("=" * 40) 
    print("1. Go to: https://secure.meetup.com/meetup_api/key/")
    print("2. Sign in to Meetup account")
    print("3. Copy your API Key")
    print("4. Add to .env as MEETUP_API_KEY")
    print("\n✅ Meetup gives access to:")
    print("   - Business networking events")
    print("   - Professional meetups")
    print("   - Group organizer contact info")
    print()

def create_env_file():
    print("📁 CREATING .env FILE")
    print("=" * 40)
    
    # Check if .env already exists
    if os.path.exists('.env'):
        print("⚠️ .env file already exists")
        overwrite = input("Overwrite? (y/n): ").lower()
        if overwrite != 'y':
            print("Keeping existing .env file")
            return
    
    # Copy template
    import shutil
    if os.path.exists('.env.real'):
        shutil.copy('.env.real', '.env')
        print("✅ Created .env file from template")
        print("📝 Edit .env file and add your API tokens")
    else:
        print("❌ .env.real template not found")

def test_api_connections():
    print("🧪 TESTING API CONNECTIONS")
    print("=" * 40)
    
    from dotenv import load_dotenv
    import os
    import requests
    
    load_dotenv()
    
    # Test Eventbrite
    eventbrite_token = os.getenv('EVENTBRITE_TOKEN')
    if eventbrite_token and eventbrite_token != 'your_eventbrite_token_here':
        try:
            response = requests.get(
                'https://www.eventbriteapi.com/v3/users/me/',
                headers={'Authorization': f'Bearer {eventbrite_token}'},
                timeout=10
            )
            if response.status_code == 200:
                print("✅ Eventbrite API: Connected")
            else:
                print(f"❌ Eventbrite API: Error {response.status_code}")
        except Exception as e:
            print(f"❌ Eventbrite API: Connection failed - {e}")
    else:
        print("⏸️ Eventbrite API: Not configured")
    
    # Test Facebook (basic check)
    facebook_token = os.getenv('FACEBOOK_ACCESS_TOKEN')
    if facebook_token and facebook_token != 'your_facebook_token_here':
        try:
            response = requests.get(
                f'https://graph.facebook.com/me?access_token={facebook_token}',
                timeout=10
            )
            if response.status_code == 200:
                print("✅ Facebook API: Connected")
            else:
                print(f"❌ Facebook API: Error {response.status_code}")
        except Exception as e:
            print(f"❌ Facebook API: Connection failed - {e}")
    else:
        print("⏸️ Facebook API: Not configured")
    
    # Test Meetup
    meetup_key = os.getenv('MEETUP_API_KEY')
    if meetup_key and meetup_key != 'your_meetup_key_here':
        print("⏸️ Meetup API: Ready to test (requires specific implementation)")
    else:
        print("⏸️ Meetup API: Not configured")

def main():
    print("🔧 REAL EVENT HUNTER API SETUP")
    print("=" * 50)
    print("This will help you get REAL API access for finding actual events")
    print()
    
    import os
    
    while True:
        print("OPTIONS:")
        print("1. Setup Eventbrite API (recommended first)")
        print("2. Setup Facebook Events API")  
        print("3. Setup Meetup API")
        print("4. Create/Update .env file")
        print("5. Test API connections")
        print("6. Run real event discovery")
        print("0. Exit")
        
        choice = input("\nEnter choice (0-6): ").strip()
        
        if choice == '1':
            setup_eventbrite_api()
        elif choice == '2':
            setup_facebook_api()
        elif choice == '3':
            setup_meetup_api()
        elif choice == '4':
            create_env_file()
        elif choice == '5':
            test_api_connections()
        elif choice == '6':
            print("🚀 Running real event discovery...")
            os.system('python3 real_event_hunter.py')
        elif choice == '0':
            print("👋 Setup complete!")
            break
        else:
            print("❌ Invalid choice")
        
        input("\nPress Enter to continue...")
        print()

if __name__ == "__main__":
    main()