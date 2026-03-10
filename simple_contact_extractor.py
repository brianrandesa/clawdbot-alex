#!/usr/bin/env python3
"""
Simple Contact Extractor using OpenClaw image tool
Processes uploaded screenshots to extract contact information
"""

import os
import re
import csv
import json
from datetime import datetime
from pathlib import Path

class SimpleContactExtractor:
    def __init__(self):
        self.media_dir = "/Users/esai/.openclaw/media/inbound"
        self.output_dir = "/Users/esai/.openclaw/workspace"
        self.contacts = []
        self.batch_size = 5  # Process in small batches
        
    def get_image_files(self):
        """Get all uploaded image files"""
        image_files = []
        for ext in ['*.jpg', '*.jpeg', '*.png']:
            image_files.extend(Path(self.media_dir).glob(ext))
        
        # Sort by modification time (newest first)
        return sorted(image_files, key=lambda x: x.stat().st_mtime, reverse=True)
    
    def clean_phone_number(self, phone):
        """Clean and standardize phone numbers"""
        if not phone:
            return ""
        
        # Remove all non-digit characters except +
        clean = re.sub(r'[^\d+]', '', str(phone))
        
        # Handle different formats
        if clean.startswith('1') and len(clean) == 11:
            return f"({clean[1:4]}) {clean[4:7]}-{clean[7:]}"
        elif len(clean) == 10:
            return f"({clean[:3]}) {clean[3:6]}-{clean[6:]}"
        else:
            return phone  # Return original if can't parse
    
    def parse_contact_text(self, text):
        """Parse contact information from extracted text"""
        contacts = []
        lines = text.split('\n')
        
        # Look for patterns with names and phone numbers
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Skip empty lines or headers
            if not line or len(line) < 5:
                continue
            
            # Look for phone patterns
            phone_patterns = [
                r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b',  # 123-456-7890 or 123.456.7890 or 123 456 7890
                r'\(\d{3}\)\s?\d{3}[-.\s]?\d{4}',      # (123) 456-7890
                r'\b\d{10,11}\b'                        # 1234567890 or 12345678901
            ]
            
            phone_match = None
            for pattern in phone_patterns:
                match = re.search(pattern, line)
                if match:
                    phone_match = match.group()
                    break
            
            if phone_match:
                # Extract name (text before phone number)
                name_text = line.replace(phone_match, '').strip()
                # Clean up common separators
                name_text = re.sub(r'[|,\t]+', ' ', name_text).strip()
                
                if name_text and len(name_text) > 1:
                    contacts.append({
                        'name': name_text,
                        'phone': self.clean_phone_number(phone_match)
                    })
        
        return contacts
    
    def export_batch(self, batch_contacts, batch_num):
        """Export a batch of contacts"""
        if not batch_contacts:
            return
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_file = f"{self.output_dir}/contacts_batch_{batch_num}_{timestamp}.csv"
        
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['name', 'phone', 'source_file'])
            writer.writeheader()
            writer.writerows(batch_contacts)
        
        print(f"💾 Batch {batch_num}: {len(batch_contacts)} contacts exported to {os.path.basename(csv_file)}")
        return csv_file
    
    def get_batch_files(self, batch_num, total_batches):
        """Get files for a specific batch"""
        all_files = self.get_image_files()
        files_per_batch = len(all_files) // total_batches
        
        start_idx = batch_num * files_per_batch
        end_idx = start_idx + files_per_batch
        
        if batch_num == total_batches - 1:  # Last batch gets remaining files
            end_idx = len(all_files)
        
        return all_files[start_idx:end_idx]

def main():
    print("📊 SIMPLE CONTACT EXTRACTOR")
    print("=" * 40)
    
    extractor = SimpleContactExtractor()
    image_files = extractor.get_image_files()
    
    print(f"📸 Found {len(image_files)} image files")
    print(f"📋 Processing in batches for manual review...")
    print(f"🎯 Ready to extract contacts from spreadsheet screenshots")
    
    return extractor, image_files

if __name__ == "__main__":
    main()