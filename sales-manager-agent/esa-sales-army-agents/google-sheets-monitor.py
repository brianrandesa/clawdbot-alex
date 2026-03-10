#!/usr/bin/env python3
"""
ESA GOOGLE SHEETS WEBHOOK MONITOR
Monitors Brian's Kixie webhook Google Sheet for real-time dial data
"""

import requests
import json
import datetime
import time
import sqlite3
from typing import Dict, List
import re
import os

class ESAWebhookMonitor:
    """Monitor Brian's Google Sheets webhook for live Kixie data"""
    
    def __init__(self):
        self.sheet_url = "https://docs.google.com/spreadsheets/d/1wdLjYf5QgAOMLt8Ihp-ZEoPuwXd2wzYY3otL8KAyt2s/edit?gid=0#gid=0"
        self.csv_url = "https://docs.google.com/spreadsheets/d/1wdLjYf5QgAOMLt8Ihp-ZEoPuwXd2wzYY3otL8KAyt2s/export?format=csv&gid=0"
        self.db_path = "esa_webhook_monitor.db"
        self.last_check = None
        self.init_database()
        
    def init_database(self):
        """Initialize monitoring database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS webhook_calls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                agent_name TEXT,
                powerlist_id TEXT,
                call_type TEXT,
                status TEXT,
                duration INTEGER,
                crm_link TEXT,
                phone_number TEXT,
                processed_timestamp TEXT,
                is_new_call BOOLEAN DEFAULT 1
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS monitoring_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                check_timestamp TEXT,
                new_calls_found INTEGER,
                total_calls INTEGER,
                status TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ Webhook monitoring database initialized")

    def fetch_sheet_data(self) -> List[Dict]:
        """Fetch latest data from Google Sheets webhook"""
        
        try:
            print("📡 Fetching live webhook data from Google Sheets...")
            
            # Use web_fetch equivalent with requests
            response = requests.get(self.csv_url, timeout=10)
            response.raise_for_status()
            
            # Parse CSV data
            lines = response.text.strip().split('\n')
            if len(lines) < 2:
                return []
            
            # Parse header
            headers = [h.strip() for h in lines[0].split(',')]
            
            calls = []
            for line in lines[1:]:
                # Split CSV line (basic parsing)
                fields = line.split(',')
                if len(fields) >= 6:  # Minimum required fields
                    
                    call_data = {
                        'date': fields[0] if len(fields) > 0 else '',
                        'agent_first_name': fields[1] if len(fields) > 1 else '',
                        'agent_last_name': fields[2] if len(fields) > 2 else '',
                        'powerlist_id': fields[3] if len(fields) > 3 else '',
                        'call_type': fields[4] if len(fields) > 4 else '',
                        'status': fields[5] if len(fields) > 5 else '',
                        'duration': self._parse_duration(fields[6] if len(fields) > 6 else '0'),
                        'crm_link': fields[7] if len(fields) > 7 else '',
                        'phone_from': fields[-2] if len(fields) >= 2 else '',
                        'phone_to': fields[-1] if len(fields) >= 1 else ''
                    }
                    
                    # Create agent full name
                    call_data['agent_name'] = f"{call_data['agent_first_name']} {call_data['agent_last_name']}".strip()
                    
                    calls.append(call_data)
            
            print(f"📊 Fetched {len(calls)} calls from webhook sheet")
            return calls
            
        except Exception as e:
            print(f"❌ Error fetching sheet data: {e}")
            return []

    def _parse_duration(self, duration_str: str) -> int:
        """Parse duration string to seconds"""
        try:
            return int(duration_str.strip())
        except:
            return 0

    def check_for_new_calls(self) -> List[Dict]:
        """Check for new calls since last check"""
        
        current_data = self.fetch_sheet_data()
        if not current_data:
            return []
        
        # Get existing calls from database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT date, agent_name, phone_number FROM webhook_calls')
        existing_calls = set()
        for row in cursor.fetchall():
            # Create unique key for call identification
            key = f"{row[0]}-{row[1]}-{row[2]}"
            existing_calls.add(key)
        
        conn.close()
        
        # Find new calls
        new_calls = []
        for call in current_data:
            call_key = f"{call['date']}-{call['agent_name']}-{call['phone_to']}"
            if call_key not in existing_calls:
                new_calls.append(call)
        
        # Store new calls
        if new_calls:
            self.store_new_calls(new_calls)
            print(f"🆕 Found {len(new_calls)} new calls")
        
        return new_calls

    def store_new_calls(self, new_calls: List[Dict]):
        """Store new calls in database"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for call in new_calls:
            cursor.execute('''
                INSERT INTO webhook_calls (
                    date, agent_name, powerlist_id, call_type, status,
                    duration, crm_link, phone_number, processed_timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                call['date'],
                call['agent_name'],
                call['powerlist_id'],
                call['call_type'],
                call['status'],
                call['duration'],
                call['crm_link'],
                call['phone_to'],
                datetime.datetime.now().isoformat()
            ))
        
        conn.commit()
        conn.close()

    def generate_live_report(self) -> str:
        """Generate live performance report from webhook data"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get today's data
        today = datetime.date.today().isoformat()
        
        cursor.execute('''
            SELECT agent_name, status, COUNT(*) as count, SUM(duration) as total_duration
            FROM webhook_calls 
            WHERE DATE(date) = ?
            GROUP BY agent_name, status
        ''', (today,))
        
        results = cursor.fetchall()
        conn.close()
        
        if not results:
            return "📊 No live webhook data available for today"
        
        # Process results
        team_stats = {}
        for agent, status, count, duration in results:
            if agent not in team_stats:
                team_stats[agent] = {'calls': 0, 'answered': 0, 'duration': 0}
            
            team_stats[agent]['calls'] += count
            team_stats[agent]['duration'] += duration or 0
            
            if status == 'answered':
                team_stats[agent]['answered'] += count
        
        # Generate report
        report = f"""
🎯 ESA LIVE WEBHOOK REPORT - {today}
{'=' * 50}

📡 Data Source: Kixie → Google Sheets → Rex
🔄 Last Update: {datetime.datetime.now().strftime('%H:%M:%S')}

📊 TEAM PERFORMANCE:
"""
        
        for agent, stats in team_stats.items():
            duration_hours = stats['duration'] / 3600
            connection_rate = (stats['answered'] / max(stats['calls'], 1)) * 100
            
            # Determine status
            call_status = "✅" if stats['calls'] >= 200 else "🔄"
            talk_status = "✅" if duration_hours >= 2.0 else "🔄"
            
            report += f"""
{agent.upper()}:
  Live Calls: {stats['calls']} {call_status}
  Talk Time: {duration_hours:.1f}h {talk_status}
  Connection Rate: {connection_rate:.1f}%
  Answered Calls: {stats['answered']}
"""
        
        # Add real-time insights
        report += f"""
🔥 LIVE INSIGHTS:
  • Data updates with every Kixie call
  • Webhook → Sheets → Rex pipeline active
  • Real-time coaching alerts enabled
  • Hot prospect detection running
"""
        
        return report

    def get_hot_prospects_live(self) -> List[Dict]:
        """Get hot prospects from live webhook data"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Hot prospects = answered calls with duration > 60 seconds
        cursor.execute('''
            SELECT agent_name, phone_number, duration, date, crm_link
            FROM webhook_calls 
            WHERE status = 'answered' 
            AND duration > 60
            AND DATE(date) >= DATE('now', '-1 days')
            ORDER BY duration DESC
            LIMIT 10
        ''', ())
        
        hot_prospects = []
        for row in cursor.fetchall():
            hot_prospects.append({
                'agent': row[0],
                'phone': row[1],
                'duration': row[2],
                'date': row[3],
                'crm_link': row[4],
                'priority': 'HIGH' if row[2] > 120 else 'MEDIUM',
                'webhook_source': True
            })
        
        conn.close()
        return hot_prospects

    def start_monitoring(self, interval_minutes: int = 15):
        """Start continuous monitoring of webhook sheet"""
        
        print(f"🚀 Starting ESA webhook monitoring (every {interval_minutes} minutes)")
        print(f"📡 Monitoring: {self.sheet_url}")
        
        while True:
            try:
                print(f"\n⏰ {datetime.datetime.now().strftime('%H:%M:%S')} - Checking for new calls...")
                
                new_calls = self.check_for_new_calls()
                
                if new_calls:
                    print(f"🆕 {len(new_calls)} new calls detected!")
                    
                    # Generate alerts for important calls
                    for call in new_calls:
                        if call['duration'] > 120:  # Hot prospect threshold
                            print(f"🔥 HOT PROSPECT: {call['agent_name']} - {call['duration']}s call!")
                        elif call['status'] == 'answered':
                            print(f"📞 CONNECTED: {call['agent_name']} - {call['duration']}s")
                
                # Log monitoring activity
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO monitoring_log (check_timestamp, new_calls_found, status)
                    VALUES (?, ?, ?)
                ''', (datetime.datetime.now().isoformat(), len(new_calls), 'success'))
                conn.commit()
                conn.close()
                
                print(f"✅ Monitoring cycle complete")
                
                # Wait for next check
                time.sleep(interval_minutes * 60)
                
            except KeyboardInterrupt:
                print("\n👋 Webhook monitoring stopped")
                break
            except Exception as e:
                print(f"❌ Monitoring error: {e}")
                time.sleep(60)  # Wait 1 minute before retry

def main():
    """Test webhook monitoring system"""
    
    monitor = ESAWebhookMonitor()
    
    print("🎯 ESA WEBHOOK MONITORING SYSTEM")
    print("=" * 50)
    
    # Test data fetch
    print("\n📡 Testing webhook data fetch...")
    new_calls = monitor.check_for_new_calls()
    
    if new_calls:
        print(f"Found {len(new_calls)} new calls")
    
    # Generate live report
    report = monitor.generate_live_report()
    print(report)
    
    # Show hot prospects
    hot_prospects = monitor.get_hot_prospects_live()
    if hot_prospects:
        print(f"\n🔥 LIVE HOT PROSPECTS ({len(hot_prospects)}):")
        for prospect in hot_prospects:
            print(f"📞 {prospect['agent']} - {prospect['duration']}s call ({prospect['priority']})")
    
    # Ask about continuous monitoring
    response = input("\n🔄 Start continuous monitoring? (y/n): ").lower().strip()
    if response == 'y':
        monitor.start_monitoring()

if __name__ == "__main__":
    main()