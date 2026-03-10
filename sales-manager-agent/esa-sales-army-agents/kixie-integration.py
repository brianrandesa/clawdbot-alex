#!/usr/bin/env python3
"""
KIXIE INTEGRATION SYSTEM - ESA Sales Data Pipeline
Connects Rex to Kixie dial data for real-time sales management
"""

import os
import requests
import json
import datetime
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional

@dataclass
class KixieCall:
    """Kixie call data structure"""
    call_id: str
    phone_number: str
    user_name: str
    duration: int
    talk_time: int
    call_type: str  # inbound/outbound
    disposition: str
    call_date: str
    lead_source: Optional[str] = None
    notes: Optional[str] = None

@dataclass
class DailyDialMetrics:
    """Daily dial performance metrics"""
    user_name: str
    date: str
    total_dials: int
    total_talk_time: int  # seconds
    connections: int
    appointments: int
    interested_count: int
    not_interested_count: int
    callback_count: int
    target_dials: int = 200  # ESA daily target
    target_talk_time: int = 7200  # 2 hours in seconds

class KixieIntegration:
    """Kixie API integration for ESA sales management"""
    
    def __init__(self):
        self.api_key = os.getenv('KIXIE_API_KEY')
        self.account_id = os.getenv('KIXIE_ACCOUNT_ID')
        self.base_url = "https://api.kixie.com/v1"
        self.plivo_url = "https://api.plivo.com/v1"  # Alternative endpoint
        self.headers = self._get_headers()
        self.working_auth = None
        
    def _get_headers(self) -> Dict[str, str]:
        """Get API headers for Kixie requests"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    def test_connection(self) -> bool:
        """Test API connection to Kixie with multiple methods"""
        
        # Test different authentication methods and endpoints
        test_configs = [
            {
                "name": "Kixie API with Bearer Token",
                "url": f"{self.base_url}/account",
                "headers": {"Authorization": f"Bearer {self.api_key}"},
            },
            {
                "name": "Kixie API with Basic Auth",
                "url": f"{self.base_url}/account",
                "auth": (self.account_id, self.api_key),
                "headers": {}
            },
            {
                "name": "Plivo API with Basic Auth", 
                "url": f"{self.plivo_url}/Account/{self.account_id}",
                "auth": (self.account_id, self.api_key),
                "headers": {}
            },
            {
                "name": "Kixie Users Endpoint",
                "url": f"{self.base_url}/users",
                "headers": {"Authorization": f"Bearer {self.api_key}"},
            }
        ]
        
        for config in test_configs:
            print(f"\n🔧 Testing: {config['name']}")
            try:
                kwargs = {
                    "timeout": 10,
                    "headers": config.get("headers", {})
                }
                
                if "auth" in config:
                    kwargs["auth"] = config["auth"]
                
                response = requests.get(config["url"], **kwargs)
                
                print(f"   Status: {response.status_code}")
                
                if response.status_code == 200:
                    print(f"   ✅ SUCCESS with {config['name']}!")
                    # Update instance to use working config
                    if "plivo" in config["name"].lower():
                        self.base_url = self.plivo_url
                    self.working_auth = config
                    return True
                elif response.status_code == 401:
                    print(f"   ❌ Unauthorized - check credentials")
                elif response.status_code == 403:
                    print(f"   ❌ Forbidden - permission issue")
                elif response.status_code == 404:
                    print(f"   ❌ Not Found - wrong endpoint")
                else:
                    print(f"   ❌ Error: {response.status_code}")
                    if len(response.text) < 200:
                        print(f"   Response: {response.text}")
                        
            except requests.exceptions.RequestException as e:
                print(f"   ❌ Connection error: {e}")
        
        print("\n💡 KIXIE SUPPORT SAYS:")
        print("   • No IP whitelisting needed")
        print("   • Allow API domain: api.plivo.com") 
        print("   • May need firewall exception for api.plivo.com")
        
        return False
    
    def get_users(self) -> List[Dict]:
        """Get list of users/agents"""
        try:
            response = requests.get(
                f"{self.base_url}/users",
                headers=self.headers
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error getting users: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"Error: {e}")
            return []
    
    def get_calls(self, date: str = None, user_id: str = None, limit: int = 100) -> List[KixieCall]:
        """Get call data for specific date and/or user"""
        
        params = {"limit": limit}
        
        if date:
            params["date"] = date
        if user_id:
            params["user_id"] = user_id
            
        try:
            response = requests.get(
                f"{self.base_url}/calls",
                headers=self.headers,
                params=params
            )
            
            if response.status_code == 200:
                calls_data = response.json()
                
                # Convert to KixieCall objects
                calls = []
                for call_data in calls_data.get('data', []):
                    call = KixieCall(
                        call_id=call_data.get('id', ''),
                        phone_number=call_data.get('phone_number', ''),
                        user_name=call_data.get('user_name', ''),
                        duration=call_data.get('duration', 0),
                        talk_time=call_data.get('talk_time', 0),
                        call_type=call_data.get('call_type', 'outbound'),
                        disposition=call_data.get('disposition', 'unknown'),
                        call_date=call_data.get('created_at', ''),
                        lead_source=call_data.get('lead_source'),
                        notes=call_data.get('notes')
                    )
                    calls.append(call)
                
                return calls
            else:
                print(f"Error getting calls: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"Error: {e}")
            return []
    
    def calculate_daily_metrics(self, calls: List[KixieCall], user_name: str) -> DailyDialMetrics:
        """Calculate daily dial metrics for a user"""
        
        user_calls = [call for call in calls if call.user_name.lower() == user_name.lower()]
        
        total_dials = len(user_calls)
        total_talk_time = sum(call.talk_time for call in user_calls)
        connections = len([call for call in user_calls if call.talk_time > 0])
        
        # Count dispositions
        interested_count = len([call for call in user_calls if 'interest' in call.disposition.lower()])
        not_interested_count = len([call for call in user_calls if 'not interest' in call.disposition.lower()])
        callback_count = len([call for call in user_calls if 'callback' in call.disposition.lower()])
        appointments = len([call for call in user_calls if 'appointment' in call.disposition.lower() or 'scheduled' in call.disposition.lower()])
        
        return DailyDialMetrics(
            user_name=user_name,
            date=datetime.datetime.now().strftime('%Y-%m-%d'),
            total_dials=total_dials,
            total_talk_time=total_talk_time,
            connections=connections,
            appointments=appointments,
            interested_count=interested_count,
            not_interested_count=not_interested_count,
            callback_count=callback_count
        )
    
    def generate_daily_report(self, date: str = None) -> str:
        """Generate daily dial report for ESA team"""
        
        if not date:
            date = datetime.datetime.now().strftime('%Y-%m-%d')
        
        # Get today's calls
        calls = self.get_calls(date=date)
        
        if not calls:
            return f"❌ No call data available for {date}"
        
        # ESA team members
        team_members = ['Brian', 'Nick', 'Chris']
        
        report = f"""
🎯 ESA DAILY DIAL REPORT - {date}
{'=' * 50}

📊 TEAM PERFORMANCE:
"""
        
        team_totals = {
            'dials': 0,
            'talk_time': 0,
            'appointments': 0,
            'connections': 0
        }
        
        for member in team_members:
            metrics = self.calculate_daily_metrics(calls, member)
            
            # Add to team totals
            team_totals['dials'] += metrics.total_dials
            team_totals['talk_time'] += metrics.total_talk_time
            team_totals['appointments'] += metrics.appointments
            team_totals['connections'] += metrics.connections
            
            # Format talk time
            talk_time_hours = metrics.total_talk_time / 3600
            target_hours = metrics.target_talk_time / 3600
            
            # Performance indicators
            dial_status = "✅" if metrics.total_dials >= metrics.target_dials else "❌"
            talk_status = "✅" if metrics.total_talk_time >= metrics.target_talk_time else "❌"
            
            report += f"""
{member.upper()}:
  Dials: {metrics.total_dials}/{metrics.target_dials} {dial_status}
  Talk Time: {talk_time_hours:.1f}h/{target_hours}h {talk_status}
  Connections: {metrics.connections} ({metrics.connections/max(metrics.total_dials,1)*100:.1f}%)
  Appointments: {metrics.appointments}
  Dispositions:
    • Interested: {metrics.interested_count}
    • Not Interested: {metrics.not_interested_count}
    • Callback: {metrics.callback_count}
"""
        
        # Team summary
        team_talk_hours = team_totals['talk_time'] / 3600
        team_target_hours = len(team_members) * 2  # 2 hours each
        
        report += f"""
🏆 TEAM TOTALS:
  Total Dials: {team_totals['dials']}
  Total Talk Time: {team_talk_hours:.1f}h (Target: {team_target_hours}h)
  Total Appointments: {team_totals['appointments']}
  Connection Rate: {team_totals['connections']/max(team_totals['dials'],1)*100:.1f}%

🎯 TARGETS vs ACTUAL:
  Dial Target: {len(team_members) * 200} | Actual: {team_totals['dials']}
  Talk Target: {team_target_hours}h | Actual: {team_talk_hours:.1f}h
"""
        
        # Performance alerts
        report += "\n🚨 COACHING ALERTS:\n"
        
        for member in team_members:
            metrics = self.calculate_daily_metrics(calls, member)
            
            if metrics.total_dials < metrics.target_dials:
                gap = metrics.target_dials - metrics.total_dials
                report += f"  • {member}: {gap} dials behind target\n"
                
            if metrics.total_talk_time < metrics.target_talk_time:
                gap_hours = (metrics.target_talk_time - metrics.total_talk_time) / 3600
                report += f"  • {member}: {gap_hours:.1f}h behind talk time target\n"
        
        return report
    
    def get_hot_prospects(self, date: str = None) -> List[Dict]:
        """Get prospects with 'interested' disposition needing follow-up"""
        
        calls = self.get_calls(date=date)
        hot_prospects = []
        
        for call in calls:
            if 'interest' in call.disposition.lower() and 'not' not in call.disposition.lower():
                hot_prospects.append({
                    'phone_number': call.phone_number,
                    'user_name': call.user_name,
                    'call_date': call.call_date,
                    'disposition': call.disposition,
                    'notes': call.notes,
                    'priority': 'HIGH'
                })
        
        return hot_prospects
    
    def export_daily_data(self, date: str = None) -> str:
        """Export daily data to file"""
        
        if not date:
            date = datetime.datetime.now().strftime('%Y-%m-%d')
            
        report = self.generate_daily_report(date)
        hot_prospects = self.get_hot_prospects(date)
        
        filename = f"esa_dial_report_{date}.txt"
        
        with open(filename, 'w') as f:
            f.write(report)
            
            if hot_prospects:
                f.write("\n\n🔥 HOT PROSPECTS FOR FOLLOW-UP:\n")
                f.write("=" * 40 + "\n")
                
                for prospect in hot_prospects:
                    f.write(f"📞 {prospect['phone_number']}\n")
                    f.write(f"   Rep: {prospect['user_name']}\n")
                    f.write(f"   Date: {prospect['call_date']}\n")
                    f.write(f"   Disposition: {prospect['disposition']}\n")
                    if prospect['notes']:
                        f.write(f"   Notes: {prospect['notes']}\n")
                    f.write("\n")
        
        return filename

def main():
    """Test Kixie integration"""
    
    print("🎯 ESA KIXIE INTEGRATION TEST")
    print("=" * 40)
    
    # Initialize integration
    kixie = KixieIntegration()
    
    # Test connection
    if kixie.test_connection():
        print("\n📊 Generating daily report...")
        report = kixie.generate_daily_report()
        print(report)
        
        print("\n💾 Exporting data...")
        filename = kixie.export_daily_data()
        print(f"✅ Data exported to: {filename}")
        
    else:
        print("\n❌ Connection failed - check API credentials")
        print("\n🔧 TROUBLESHOOTING STEPS:")
        print("1. Login to Kixie → Settings → Integrations")
        print("2. Verify API key is active and has call data permissions")
        print("3. Check if IP whitelisting is required")
        print("4. Contact Kixie support if issues persist")

if __name__ == "__main__":
    main()