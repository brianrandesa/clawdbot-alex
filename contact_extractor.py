#!/usr/bin/env python3
"""
Mass Contact Extractor from Screenshots
Extracts names and phone numbers from uploaded spreadsheet screenshots
"""

import os
import re
import json
import csv
from datetime import datetime
import requests
import base64
from pathlib import Path

class ContactExtractor:
    def __init__(self):
        self.media_dir = "/Users/esai/.openclaw/media/inbound"
        self.output_dir = "/Users/esai/.openclaw/workspace"
        self.contacts = []
        self.processed_files = 0
        self.anthropic_key = os.getenv('ANTHROPIC_API_KEY')
        
    def get_image_files(self):
        """Get all uploaded image files"""
        image_files = []
        for ext in ['*.jpg', '*.jpeg', '*.png']:
            image_files.extend(Path(self.media_dir).glob(ext))
        
        print(f"📊 Found {len(image_files)} image files to process")
        return sorted(image_files, key=lambda x: x.stat().st_mtime, reverse=True)
    
    def extract_text_from_image(self, image_path):
        """Extract text from image using Claude Vision"""
        try:
            with open(image_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode()
            
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': self.anthropic_key,
                'anthropic-version': '2023-06-01'
            }
            
            payload = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 4000,
                "messages": [{
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": image_data
                            }
                        },
                        {
                            "type": "text", 
                            "text": """Extract ALL names and phone numbers from this image. Focus on spreadsheets, contact lists, or any data tables.

Return ONLY a JSON array like this:
[
    {"name": "John Smith", "phone": "555-123-4567"},
    {"name": "Jane Doe", "phone": "555-987-6543"}
]

If no contacts found, return: []"""
                        }
                    ]
                }]
            }
            
            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['content'][0]['text']
                
                # Extract JSON from response
                try:
                    json_start = content.find('[')
                    json_end = content.rfind(']') + 1
                    if json_start != -1 and json_end != 0:
                        contacts_data = json.loads(content[json_start:json_end])
                        return contacts_data
                except:
                    pass
            
            return []
            
        except Exception as e:
            print(f"❌ Error processing {image_path.name}: {e}")
            return []
    
    def clean_phone_number(self, phone):
        """Clean and standardize phone numbers"""
        if not phone:
            return ""
        
        # Remove all non-digit characters except +
        clean = re.sub(r'[^\d+]', '', phone)
        
        # Handle different formats
        if clean.startswith('1') and len(clean) == 11:
            return f"({clean[1:4]}) {clean[4:7]}-{clean[7:]}"
        elif len(clean) == 10:
            return f"({clean[:3]}) {clean[3:6]}-{clean[6:]}"
        else:
            return phone  # Return original if can't parse
    
    def process_all_images(self):
        """Process all uploaded images"""
        image_files = self.get_image_files()
        
        print("🚀 Starting mass contact extraction...")
        print("=" * 50)
        
        for i, image_file in enumerate(image_files, 1):
            print(f"📸 Processing {i}/{len(image_files)}: {image_file.name}")
            
            contacts = self.extract_text_from_image(image_file)
            
            if contacts:
                print(f"   ✅ Found {len(contacts)} contacts")
                for contact in contacts:
                    if 'name' in contact and 'phone' in contact:
                        cleaned_phone = self.clean_phone_number(contact['phone'])
                        if cleaned_phone:  # Only add if we got a valid phone
                            self.contacts.append({
                                'name': contact['name'].strip(),
                                'phone': cleaned_phone,
                                'source_file': image_file.name
                            })
            else:
                print(f"   ⚪ No contacts found")
            
            self.processed_files += 1
            
            # Progress update every 10 files
            if i % 10 == 0:
                print(f"📊 Progress: {i}/{len(image_files)} files processed, {len(self.contacts)} contacts extracted")
        
        print("\n🎯 Extraction complete!")
        print(f"📊 Final stats: {self.processed_files} files processed, {len(self.contacts)} contacts extracted")
    
    def remove_duplicates(self):
        """Remove duplicate contacts based on phone number"""
        seen_phones = set()
        unique_contacts = []
        
        for contact in self.contacts:
            phone_key = re.sub(r'[^\d]', '', contact['phone'])  # Remove formatting for comparison
            if phone_key not in seen_phones and phone_key:
                seen_phones.add(phone_key)
                unique_contacts.append(contact)
        
        duplicates_removed = len(self.contacts) - len(unique_contacts)
        self.contacts = unique_contacts
        
        print(f"🔄 Removed {duplicates_removed} duplicates, {len(self.contacts)} unique contacts remain")
    
    def export_contacts(self):
        """Export contacts to CSV and JSON"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # CSV Export
        csv_file = f"{self.output_dir}/extracted_contacts_{timestamp}.csv"
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['name', 'phone', 'source_file'])
            writer.writeheader()
            writer.writerows(self.contacts)
        
        # JSON Export
        json_file = f"{self.output_dir}/extracted_contacts_{timestamp}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(self.contacts, f, indent=2)
        
        # Summary Report
        report_file = f"{self.output_dir}/extraction_report_{timestamp}.txt"
        with open(report_file, 'w') as f:
            f.write("📊 CONTACT EXTRACTION REPORT\n")
            f.write("=" * 40 + "\n\n")
            f.write(f"Files Processed: {self.processed_files}\n")
            f.write(f"Total Contacts: {len(self.contacts)}\n")
            f.write(f"Extraction Date: {datetime.now()}\n\n")
            
            f.write("📁 Files Generated:\n")
            f.write(f"  • CSV: {os.path.basename(csv_file)}\n")
            f.write(f"  • JSON: {os.path.basename(json_file)}\n\n")
            
            f.write("🎯 Sample Contacts:\n")
            for i, contact in enumerate(self.contacts[:10], 1):
                f.write(f"  {i}. {contact['name']} - {contact['phone']}\n")
        
        print(f"\n💾 Exports complete:")
        print(f"   📊 CSV: {csv_file}")
        print(f"   📋 JSON: {json_file}")
        print(f"   📄 Report: {report_file}")
        
        return csv_file, json_file, report_file

def main():
    print("🎯 MASS CONTACT EXTRACTOR")
    print("=" * 40)
    
    extractor = ContactExtractor()
    
    # Check for API key
    if not extractor.anthropic_key:
        print("❌ ANTHROPIC_API_KEY not found in environment")
        return
    
    try:
        # Process all images
        extractor.process_all_images()
        
        # Remove duplicates
        extractor.remove_duplicates()
        
        # Export results
        csv_file, json_file, report_file = extractor.export_contacts()
        
        print("\n🚀 EXTRACTION COMPLETE!")
        print(f"✅ {len(extractor.contacts)} unique contacts extracted")
        print(f"📊 Ready for your outreach campaigns!")
        
    except KeyboardInterrupt:
        print("\n⛔ Extraction stopped by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()