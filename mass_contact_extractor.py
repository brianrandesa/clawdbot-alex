#!/usr/bin/env python3
"""
Mass Contact Extractor for All Screenshots
Processes both uploaded and Downloads screenshots
Uses OpenClaw image analysis for vision extraction
"""

import os
import re
import csv
import json
import subprocess
import time
from datetime import datetime
from pathlib import Path

class MassContactExtractor:
    def __init__(self):
        self.media_dir = "/Users/henry/.openclaw/media/inbound"
        self.downloads_dir = "/Users/henry/Downloads/New List"
        self.output_dir = "/Users/henry/.openclaw/workspace"
        self.all_contacts = []
        
    def get_all_screenshot_files(self):
        """Get all screenshot files from both locations"""
        files = []
        
        # Media inbound files (uploaded via OpenClaw)
        media_files = list(Path(self.media_dir).glob("*.jpg")) + list(Path(self.media_dir).glob("*.png"))
        print(f"📁 Media inbound: {len(media_files)} files")
        
        # Downloads files (excluding duplicates)
        downloads_files = []
        for file in Path(self.downloads_dir).glob("*Screenshot*2026-02-22*.png"):
            if " (2).png" not in str(file):  # Skip Brian's dual monitor duplicates
                downloads_files.append(file)
        print(f"📁 Downloads: {len(downloads_files)} files")
        
        files.extend(media_files)
        files.extend(downloads_files)
        
        print(f"📊 Total files to process: {len(files)}")
        return files
    
    def extract_contacts_from_image(self, image_path):
        """Extract contacts using OpenClaw's image analysis"""
        try:
            # Use openclaw command to analyze image
            cmd = [
                "openclaw", "image",
                "--image", str(image_path),
                "--prompt", "Extract ALL names and phone numbers from this spreadsheet screenshot. Return only: Name | Phone on each line. Focus on contact data in black boxes or tables."
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                return self.parse_extracted_text(result.stdout)
            else:
                print(f"   ❌ Vision extraction failed: {result.stderr}")
                return []
                
        except subprocess.TimeoutExpired:
            print(f"   ⏰ Vision extraction timed out")
            return []
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return []
    
    def parse_extracted_text(self, text):
        """Parse extracted text to find name|phone pairs"""
        contacts = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if '|' in line and len(line) > 5:
                parts = line.split('|', 1)
                if len(parts) == 2:
                    name = parts[0].strip()
                    phone = parts[1].strip()
                    
                    # Validate that we have reasonable name and phone
                    if len(name) > 1 and len(phone) > 5:
                        # Check if phone contains digits
                        if re.search(r'\d{3,}', phone):
                            contacts.append({
                                'name': name,
                                'phone': self.clean_phone_number(phone)
                            })
        
        return contacts
    
    def clean_phone_number(self, phone):
        """Clean and format phone numbers consistently"""
        if not phone:
            return ""
        
        # Remove all non-digit characters
        digits = re.sub(r'[^\d]', '', str(phone))
        
        # Handle different formats
        if digits.startswith('1') and len(digits) == 11:
            return f"({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
        elif len(digits) == 10:
            return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        else:
            return phone  # Return original if can't parse
    
    def process_files_batch(self, files, batch_size=5):
        """Process files in batches with progress tracking"""
        total_files = len(files)
        total_contacts = 0
        
        print(f"\n🚀 MASS EXTRACTION STARTING")
        print(f"📊 Processing {total_files} files in batches of {batch_size}")
        print("=" * 60)
        
        for i in range(0, total_files, batch_size):
            batch_files = files[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            total_batches = (total_files + batch_size - 1) // batch_size
            
            print(f"\n📦 BATCH {batch_num}/{total_batches}")
            print("-" * 40)
            
            batch_contacts = []
            
            for j, file_path in enumerate(batch_files, 1):
                print(f"🔍 {j}/{len(batch_files)}: {file_path.name}")
                
                contacts = self.extract_contacts_from_image(file_path)
                
                if contacts:
                    print(f"   ✅ Found {len(contacts)} contacts")
                    for contact in contacts:
                        contact['source_file'] = file_path.name
                        batch_contacts.append(contact)
                else:
                    print(f"   ⚪ No contacts found")
                
                # Small delay to avoid overwhelming the system
                time.sleep(0.5)
            
            # Export batch results
            if batch_contacts:
                batch_file = self.export_batch(batch_contacts, batch_num)
                print(f"💾 Batch exported: {len(batch_contacts)} contacts")
            
            batch_total = len(batch_contacts)
            total_contacts += batch_total
            
            print(f"✅ Batch {batch_num} complete: {batch_total} contacts")
            print(f"📊 Running total: {total_contacts} contacts")
            
            # Progress update
            progress = (batch_num / total_batches) * 100
            print(f"🎯 Progress: {progress:.1f}% complete")
        
        return total_contacts
    
    def export_batch(self, contacts, batch_num):
        """Export batch to CSV"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"extracted_contacts_batch_{batch_num}_{timestamp}.csv"
        filepath = os.path.join(self.output_dir, filename)
        
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['name', 'phone', 'source_file'])
            writer.writeheader()
            writer.writerows(contacts)
        
        self.all_contacts.extend(contacts)
        return filepath
    
    def export_final_results(self):
        """Export final consolidated results"""
        if not self.all_contacts:
            print("❌ No contacts to export")
            return
        
        # Remove duplicates based on phone number
        seen_phones = set()
        unique_contacts = []
        
        for contact in self.all_contacts:
            phone_key = re.sub(r'[^\d]', '', contact['phone'])
            if phone_key not in seen_phones and phone_key:
                seen_phones.add(phone_key)
                unique_contacts.append(contact)
        
        duplicates_removed = len(self.all_contacts) - len(unique_contacts)
        
        # Export final CSV
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        final_file = f"{self.output_dir}/FINAL_EXTRACTED_CONTACTS_{timestamp}.csv"
        
        with open(final_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['name', 'phone', 'source_file'])
            writer.writeheader()
            writer.writerows(unique_contacts)
        
        # Create summary report
        report_file = f"{self.output_dir}/EXTRACTION_REPORT_{timestamp}.txt"
        with open(report_file, 'w') as f:
            f.write("🎯 MASS CONTACT EXTRACTION REPORT\n")
            f.write("=" * 50 + "\n\n")
            f.write(f"Extraction Date: {datetime.now()}\n")
            f.write(f"Total Screenshots Processed: {len(set([c['source_file'] for c in self.all_contacts]))}\n")
            f.write(f"Total Contacts Found: {len(self.all_contacts)}\n") 
            f.write(f"Unique Contacts: {len(unique_contacts)}\n")
            f.write(f"Duplicates Removed: {duplicates_removed}\n\n")
            
            f.write("📁 Output Files:\n")
            f.write(f"  Main CSV: {os.path.basename(final_file)}\n")
            f.write(f"  Report: {os.path.basename(report_file)}\n\n")
            
            f.write("🎯 Sample Contacts:\n")
            for i, contact in enumerate(unique_contacts[:20], 1):
                f.write(f"  {i:2d}. {contact['name']} - {contact['phone']}\n")
            
            if len(unique_contacts) > 20:
                f.write(f"  ... and {len(unique_contacts) - 20} more\n")
        
        print(f"\n🎉 EXTRACTION COMPLETE!")
        print(f"📊 Final Results:")
        print(f"   Total Contacts: {len(unique_contacts)}")
        print(f"   Duplicates Removed: {duplicates_removed}")
        print(f"   Success Rate: {len(unique_contacts)/len(set([c['source_file'] for c in self.all_contacts]))*100:.1f}% avg contacts per file")
        print(f"📁 Files:")
        print(f"   CSV: {final_file}")
        print(f"   Report: {report_file}")
        
        return final_file, report_file

def main():
    print("🎯 MASS CONTACT EXTRACTOR")
    print("=" * 60)
    print("Extracting ALL contacts from Brian's uploaded screenshots")
    print("Target: 1000+ contacts from spreadsheet screenshots")
    
    extractor = MassContactExtractor()
    
    # Get all files
    all_files = extractor.get_all_screenshot_files()
    
    if not all_files:
        print("❌ No files found to process")
        return
    
    # Process all files
    total_extracted = extractor.process_files_batch(all_files)
    
    # Export final results
    if total_extracted > 0:
        extractor.export_final_results()
        
        # Trigger completion notification
        subprocess.run([
            "openclaw", "system", "event",
            "--text", f"Contact extraction complete: {len(extractor.all_contacts)} contacts extracted from {len(all_files)} screenshots",
            "--mode", "now"
        ], capture_output=True)
    
    print(f"\n🚀 MASS EXTRACTION COMPLETE: {total_extracted} contacts ready for outreach!")

if __name__ == "__main__":
    main()