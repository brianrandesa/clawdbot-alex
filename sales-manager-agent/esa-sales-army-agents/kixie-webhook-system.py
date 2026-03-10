#!/usr/bin/env python3
"""
KIXIE WEBHOOK SYSTEM - Real-Time Call Data Processing
Receives live call data from Kixie webhooks for instant Rex reporting
"""

import os
import json
import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading
import sqlite3

@dataclass
class WebhookCallData:
    """Webhook call data structure"""
    timestamp: str
    event_type: str
    disposition: str
    phone_number: str
    user_name: str
    duration: Optional[int] = None
    lead_source: Optional[str] = None  # ESS, IGC, etc.
    call_direction: str = "outbound"
    notes: Optional[str] = None

class KixieWebhookProcessor:
    """Process incoming Kixie webhook data for ESA sales reporting"""
    
    def __init__(self):
        self.db_path = "esa_call_data.db"
        self.init_database()
        
    def init_database(self):
        """Initialize SQLite database for call storage"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS calls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                event_type TEXT,
                disposition TEXT,
                phone_number TEXT,
                user_name TEXT,
                duration INTEGER,
                lead_source TEXT,
                call_direction TEXT,
                notes TEXT,
                processed_date DATE
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ Database initialized")

    def process_webhook_data(self, webhook_payload: Dict) -> WebhookCallData:
        """Process incoming webhook payload into call data"""
        
        # Extract data based on Kixie webhook format
        call_data = WebhookCallData(
            timestamp=datetime.datetime.now().isoformat(),
            event_type=webhook_payload.get('event', 'unknown'),
            disposition=webhook_payload.get('call_outcome', 'unknown'),
            phone_number=webhook_payload.get('phone_number', ''),
            user_name=webhook_payload.get('user_name', ''),
            duration=webhook_payload.get('duration', 0),
            lead_source=self._extract_lead_source(webhook_payload),
            call_direction=webhook_payload.get('direction', 'outbound'),
            notes=webhook_payload.get('notes', '')
        )
        
        # Store in database
        self.store_call_data(call_data)
        
        return call_data

    def _extract_lead_source(self, payload: Dict) -> str:
        """Extract lead source from webhook data"""
        
        # Check for ESS/IGC in disposition or event name
        disposition = payload.get('call_outcome', '').upper()
        event = payload.get('event', '').upper()
        
        if 'ESS' in disposition or 'ESS' in event:
            return 'ESS'
        elif 'IGC' in disposition or 'IGC' in event:
            return 'IGC'
        else:
            return 'UNKNOWN'

    def store_call_data(self, call_data: WebhookCallData):
        """Store call data in database"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO calls (
                timestamp, event_type, disposition, phone_number, 
                user_name, duration, lead_source, call_direction, 
                notes, processed_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            call_data.timestamp,
            call_data.event_type,
            call_data.disposition,
            call_data.phone_number,
            call_data.user_name,
            call_data.duration,
            call_data.lead_source,
            call_data.call_direction,
            call_data.notes,
            datetime.date.today().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        print(f"📞 Stored call: {call_data.user_name} → {call_data.disposition}")

    def get_daily_stats(self, date: str = None) -> Dict:
        """Get daily call statistics"""
        
        if not date:
            date = datetime.date.today().isoformat()
            
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get calls by user for the date
        cursor.execute('''
            SELECT user_name, disposition, COUNT(*) as count, 
                   SUM(duration) as total_duration, lead_source
            FROM calls 
            WHERE processed_date = ? 
            GROUP BY user_name, disposition, lead_source
        ''', (date,))
        
        results = cursor.fetchall()
        conn.close()
        
        # Process into team stats
        team_stats = {}
        for user_name, disposition, count, total_duration, lead_source in results:
            if user_name not in team_stats:
                team_stats[user_name] = {
                    'total_calls': 0,
                    'total_duration': 0,
                    'dispositions': {},
                    'lead_sources': {}
                }
            
            team_stats[user_name]['total_calls'] += count
            team_stats[user_name]['total_duration'] += total_duration or 0
            team_stats[user_name]['dispositions'][disposition] = count
            team_stats[user_name]['lead_sources'][lead_source] = count
        
        return team_stats

    def generate_rex_daily_report(self, date: str = None) -> str:
        """Generate Rex-style daily report from webhook data"""
        
        if not date:
            date = datetime.date.today().isoformat()
            
        stats = self.get_daily_stats(date)
        
        if not stats:
            return f"📊 No call data for {date} (webhook data may still be processing)"
        
        report = f"""
🎯 ESA DAILY CALL REPORT - {date}
{'=' * 50}

📞 TEAM PERFORMANCE (Live Webhook Data):
"""
        
        team_totals = {'calls': 0, 'duration': 0, 'appointments': 0}
        
        for user_name, data in stats.items():
            duration_hours = data['total_duration'] / 3600 if data['total_duration'] else 0
            
            # Count appointments from dispositions
            appointments = 0
            interested = 0
            for disp, count in data['dispositions'].items():
                if 'appt' in disp.lower() or 'booked' in disp.lower():
                    appointments += count
                if 'interested' in disp.lower():
                    interested += count
            
            team_totals['calls'] += data['total_calls']
            team_totals['duration'] += data['total_duration'] or 0
            team_totals['appointments'] += appointments
            
            # Status indicators
            call_status = "✅" if data['total_calls'] >= 200 else "❌"
            talk_status = "✅" if duration_hours >= 2.0 else "❌"
            
            report += f"""
{user_name.upper()}:
  Total Calls: {data['total_calls']} {call_status}
  Talk Time: {duration_hours:.1f}h {talk_status}
  Appointments Booked: {appointments}
  Interested Responses: {interested}
  
  Dispositions:"""
            
            for disposition, count in data['dispositions'].items():
                report += f"\n    • {disposition}: {count}"
            
            report += f"\n  Lead Sources:"
            for source, count in data['lead_sources'].items():
                report += f"\n    • {source}: {count}"
            
            report += "\n"
        
        # Team summary
        team_talk_hours = team_totals['duration'] / 3600
        
        report += f"""
🏆 TEAM TOTALS:
  Total Calls: {team_totals['calls']}
  Total Talk Time: {team_talk_hours:.1f}h
  Total Appointments: {team_totals['appointments']}

🎯 REAL-TIME INSIGHTS:
  • Data updated live via Kixie webhooks
  • ESS vs IGC performance tracked
  • Instant disposition notifications
  • Hot prospect alerts active
"""
        
        return report

    def get_hot_prospects(self, hours_back: int = 24) -> List[Dict]:
        """Get hot prospects from recent webhook data"""
        
        cutoff_time = datetime.datetime.now() - datetime.timedelta(hours=hours_back)
        cutoff_str = cutoff_time.isoformat()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT phone_number, user_name, disposition, timestamp, notes
            FROM calls 
            WHERE timestamp > ? 
            AND (disposition LIKE '%interested%' OR disposition LIKE '%appt%')
            ORDER BY timestamp DESC
        ''', (cutoff_str,))
        
        results = cursor.fetchall()
        conn.close()
        
        hot_prospects = []
        for phone, user, disp, timestamp, notes in results:
            hot_prospects.append({
                'phone_number': phone,
                'user_name': user,
                'disposition': disp,
                'timestamp': timestamp,
                'notes': notes,
                'priority': 'HIGH' if 'appt' in disp.lower() else 'MEDIUM'
            })
        
        return hot_prospects

class WebhookServer(BaseHTTPRequestHandler):
    """HTTP server to receive Kixie webhooks"""
    
    def __init__(self, processor: KixieWebhookProcessor):
        self.processor = processor
        super().__init__()
    
    def do_POST(self):
        """Handle incoming webhook POST requests"""
        
        try:
            # Read the POST data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Parse JSON payload
            webhook_data = json.loads(post_data.decode('utf-8'))
            
            # Process the webhook data
            call_data = self.processor.process_webhook_data(webhook_data)
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {"status": "success", "processed": True}
            self.wfile.write(json.dumps(response).encode())
            
            print(f"✅ Processed webhook: {call_data.user_name} → {call_data.disposition}")
            
        except Exception as e:
            print(f"❌ Webhook processing error: {e}")
            self.send_response(500)
            self.end_headers()
    
    def do_GET(self):
        """Handle GET requests (health check)"""
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(b"ESA Kixie Webhook Receiver - Active")

def start_webhook_server(port: int = 8080):
    """Start the webhook server"""
    
    processor = KixieWebhookProcessor()
    
    class WebhookHandler(BaseHTTPRequestHandler):
        def do_POST(self):
            WebhookServer(processor).do_POST()
        def do_GET(self):
            WebhookServer(processor).do_GET()
    
    server = HTTPServer(('localhost', port), WebhookHandler)
    print(f"🚀 Webhook server starting on port {port}")
    print(f"📡 Ready to receive Kixie webhook data!")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Webhook server stopped")
        server.shutdown()

def main():
    """Main function for testing"""
    
    processor = KixieWebhookProcessor()
    
    print("🎯 ESA KIXIE WEBHOOK SYSTEM")
    print("=" * 40)
    
    # Generate report from existing data
    report = processor.generate_rex_daily_report()
    print(report)
    
    # Show hot prospects
    hot_prospects = processor.get_hot_prospects()
    if hot_prospects:
        print("\n🔥 HOT PROSPECTS:")
        for prospect in hot_prospects[:5]:
            print(f"📞 {prospect['phone_number']} - {prospect['disposition']}")
    
    # Start webhook server
    print(f"\n🚀 Starting webhook server...")
    print(f"📡 Add this URL to Kixie: http://your-domain.com:8080/webhook")
    
    start_webhook_server()

if __name__ == "__main__":
    main()