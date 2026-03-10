#!/usr/bin/env python3
"""
Cross-reference Kixie webhook data with GHL leads
Get accurate rep attribution for speed-to-lead analysis
"""

import requests
import json
import datetime
import csv
from collections import defaultdict
import re

def normalize_phone(phone):
    """Normalize phone number for matching"""
    if not phone:
        return ""
    
    # Remove all non-digits
    digits = re.sub(r'\D', '', str(phone))
    
    # Remove leading 1 if present (US numbers)
    if len(digits) == 11 and digits.startswith('1'):
        digits = digits[1:]
    
    return digits

def parse_timestamp(timestamp_str):
    """Parse timestamp"""
    try:
        return datetime.datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
    except:
        return None

def get_kixie_data():
    """Get Kixie call data from webhook sheet"""
    
    print("📞 Fetching Kixie call data from webhook...")
    
    try:
        # Get the CSV data from the webhook sheet
        sheet_url = "https://docs.google.com/spreadsheets/d/1wdLjYf5QgAOMLt8Ihp-ZEoPuwXd2wzYY3otL8KAyt2s/export?format=csv&gid=0"
        
        response = requests.get(sheet_url, timeout=30)
        
        if response.status_code == 200:
            # Parse CSV content
            csv_content = response.text
            lines = csv_content.strip().split('\n')
            
            if len(lines) < 2:
                print("❌ No data in webhook sheet")
                return []
            
            # Parse header
            headers = [h.strip() for h in lines[0].split(',')]
            
            calls = []
            for line in lines[1:]:
                # Basic CSV parsing (assumes no commas in values)
                values = [v.strip() for v in line.split(',')]
                
                if len(values) >= len(headers):
                    call_data = dict(zip(headers, values))
                    
                    # Extract key fields
                    date = call_data.get('Date', '')
                    agent_first = call_data.get('Agent First Name', '')
                    agent_last = call_data.get('Agent Last Name', '')
                    to_number = call_data.get('To Number', '')
                    status = call_data.get('Status', '')
                    duration = call_data.get('Duration', '0')
                    
                    if agent_first and to_number and date:
                        calls.append({
                            'date': date,
                            'agent_name': f"{agent_first} {agent_last}".strip(),
                            'phone_to': normalize_phone(to_number),
                            'status': status,
                            'duration': duration
                        })
            
            print(f"✅ Loaded {len(calls)} calls from Kixie webhook")
            return calls
        else:
            print(f"❌ Error fetching webhook data: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"❌ Error processing Kixie data: {e}")
        return []

def main():
    """Cross-reference analysis"""
    
    API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IldkUHBMVTZqNGhMdFpKcmRtT1JXIiwiY29tcGFueV9pZCI6Im1neUIxblY5YVltanRCUm1wYnBrIiwidmVyc2lvbiI6MSwiaWF0IjoxNzA2NzQxMTQzMTY3LCJzdWIiOiJ1c2VyX2lkIn0.Ab-dmSbjizR_xim0IlCr_BKgM5haIcOTpM8gvFt4RHs"
    LOCATION_ID = "WdPpLU6j4hLtZJrdmORW"
    TARGET_TAG = "march 24-25- new opt ins"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    print("🎯 KIXIE ↔ GHL CROSS-REFERENCE ANALYSIS")
    print("=" * 60)
    
    # Get GHL contacts
    print("📋 Fetching GHL contacts...")
    url = "https://rest.gohighlevel.com/v1/contacts/"
    params = {"locationId": LOCATION_ID, "limit": 100}
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        print(f"❌ GHL API Error: {response.status_code}")
        return
    
    data = response.json()
    all_contacts = data.get('contacts', [])
    
    # Filter by tag
    matching_contacts = []
    for contact in all_contacts:
        tags = contact.get('tags', [])
        if isinstance(tags, list) and TARGET_TAG in tags:
            matching_contacts.append(contact)
    
    print(f"✅ Found {len(matching_contacts)} GHL contacts with tag")
    
    # Get Kixie data
    kixie_calls = get_kixie_data()
    
    if not kixie_calls:
        print("❌ No Kixie data available for cross-reference")
        return
    
    # Build phone number index from Kixie calls
    phone_to_rep = {}
    for call in kixie_calls:
        phone = call['phone_to']
        agent = call['agent_name']
        
        if phone and agent:
            # Track the most recent agent for each phone
            if phone not in phone_to_rep:
                phone_to_rep[phone] = {}
            
            call_date = call['date']
            if agent not in phone_to_rep[phone] or call_date > phone_to_rep[phone][agent]:
                phone_to_rep[phone][agent] = call_date
    
    # Now match GHL contacts to reps
    rep_performance = defaultdict(list)
    unmatched_contacts = []
    
    print(f"\n🔍 Cross-referencing {len(matching_contacts)} contacts with Kixie calls...")
    
    for contact in matching_contacts:
        name = f"{contact.get('firstName', '')} {contact.get('lastName', '')}".strip()
        phone = normalize_phone(contact.get('phone', ''))
        created_str = contact.get('dateAdded', '')
        updated_str = contact.get('dateUpdated', '')
        
        created_at = parse_timestamp(created_str)
        updated_at = parse_timestamp(updated_str)
        
        # Calculate speed
        if updated_at and created_at and updated_at > created_at:
            speed_minutes = (updated_at - created_at).total_seconds() / 60
        else:
            speed_minutes = None
        
        # Calculate age
        if created_at:
            age_hours = (datetime.datetime.now(datetime.timezone.utc) - created_at).total_seconds() / 3600
        else:
            age_hours = 0
        
        # Find matching rep from Kixie data
        matched_rep = None
        
        if phone and phone in phone_to_rep:
            # Find the agent who called this phone number
            agents = phone_to_rep[phone]
            
            # Use the most recent agent (assuming that's who handled the lead)
            if agents:
                matched_rep = max(agents.keys(), key=lambda x: agents[x])
        
        contact_data = {
            'name': name,
            'phone': contact.get('phone', ''),
            'normalized_phone': phone,
            'speed_minutes': speed_minutes,
            'age_hours': age_hours,
            'created_at': created_at,
            'email': contact.get('email', '')
        }
        
        if matched_rep:
            rep_performance[matched_rep].append(contact_data)
        else:
            unmatched_contacts.append(contact_data)
            rep_performance['Unmatched/Unknown'].append(contact_data)
    
    # Generate comprehensive rep report
    print(f"\n🏆 SPEED-TO-LEAD BY ACTUAL SALES REP")
    print("=" * 70)
    
    total_leads = len(matching_contacts)
    total_matched = total_leads - len(unmatched_contacts)
    
    print(f"📊 Total leads: {total_leads}")
    print(f"✅ Matched to reps: {total_matched}")
    print(f"❓ Unmatched: {len(unmatched_contacts)}")
    
    all_speeds = []
    rep_summaries = []
    
    for rep, contacts in rep_performance.items():
        if not contacts:
            continue
        
        contacted = [c for c in contacts if c['speed_minutes'] is not None]
        not_contacted = [c for c in contacts if c['speed_minutes'] is None]
        
        print(f"\n👤 {rep.upper()}")
        print("-" * 50)
        print(f"📈 Total leads: {len(contacts)}")
        print(f"📞 Contacted: {len(contacted)}")
        print(f"🚨 Not contacted: {len(not_contacted)}")
        
        if contacted:
            speeds = [c['speed_minutes'] for c in contacted]
            all_speeds.extend(speeds)
            
            avg_speed = sum(speeds) / len(speeds)
            median_speed = sorted(speeds)[len(speeds) // 2]
            min_speed = min(speeds)
            max_speed = max(speeds)
            
            under_5 = len([s for s in speeds if s <= 5])
            under_30 = len([s for s in speeds if s <= 30])
            under_60 = len([s for s in speeds if s <= 60])
            
            contact_rate = len(contacted) / len(contacts) * 100
            under_5_pct = under_5 / len(contacted) * 100
            under_30_pct = under_30 / len(contacted) * 100
            under_60_pct = under_60 / len(contacted) * 100
            
            print(f"⚡ Average speed: {avg_speed:.1f} minutes")
            print(f"📈 Median speed: {median_speed:.1f} minutes")
            print(f"🔥 Fastest: {min_speed:.1f} minutes")
            print(f"🐌 Slowest: {max_speed:.1f} minutes")
            print(f"📈 Contact rate: {contact_rate:.1f}%")
            print(f"🎯 Under 5 min: {under_5}/{len(contacted)} ({under_5_pct:.1f}%)")
            print(f"✅ Under 30 min: {under_30}/{len(contacted)} ({under_30_pct:.1f}%)")
            print(f"⏰ Under 60 min: {under_60}/{len(contacted)} ({under_60_pct:.1f}%)")
            
            # Performance grade
            if avg_speed <= 5 and under_5_pct >= 80:
                grade = "🏆 A+"
            elif avg_speed <= 15 and under_30_pct >= 70:
                grade = "🥇 A"
            elif avg_speed <= 30 and under_60_pct >= 60:
                grade = "🥈 B"
            elif contact_rate >= 80:
                grade = "🥉 C"
            else:
                grade = "❌ D"
            
            print(f"🎯 Performance Grade: {grade}")
            
            # Top/bottom examples
            contacted_sorted = sorted(contacted, key=lambda x: x['speed_minutes'])
            print(f"🔥 Best: {contacted_sorted[0]['name']} ({contacted_sorted[0]['speed_minutes']:.1f} min)")
            
            if max_speed > 60:
                print(f"⚠️ Slowest: {contacted_sorted[-1]['name']} ({max_speed:.1f} min)")
            
            rep_summaries.append({
                'rep': rep,
                'total': len(contacts),
                'contacted': len(contacted),
                'avg_speed': avg_speed,
                'contact_rate': contact_rate,
                'under_5_pct': under_5_pct,
                'grade': grade
            })
    
    # Final team summary and rankings
    if rep_summaries:
        rep_summaries = [r for r in rep_summaries if r['rep'] != 'Unmatched/Unknown']
        rep_summaries.sort(key=lambda x: (x['avg_speed'], -x['contact_rate']))
        
        print(f"\n🏆 REP RANKINGS")
        print("=" * 40)
        for i, rep in enumerate(rep_summaries, 1):
            print(f"{i}. {rep['rep']} - {rep['avg_speed']:.1f} min avg, {rep['contact_rate']:.1f}% contact, {rep['grade']}")
    
    print(f"\n💡 INSIGHTS:")
    if total_matched < total_leads * 0.8:
        print(f"⚠️ Only {total_matched/total_leads*100:.1f}% of leads matched to Kixie calls")
        print("   Consider improving phone number consistency between systems")
    else:
        print(f"✅ Good match rate: {total_matched/total_leads*100:.1f}% of leads matched to reps")
    
    if unmatched_contacts:
        print(f"\n🔍 UNMATCHED LEADS SAMPLE:")
        for contact in unmatched_contacts[:5]:
            print(f"• {contact['name']} - {contact['phone']} ({contact['age_hours']:.1f}h old)")

if __name__ == "__main__":
    main()