#!/usr/bin/env node

/**
 * Quick test to verify GHL API connection works.
 */

import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GHLClient } from './ghl-client.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const apiKey = process.env.GHL_API_KEY;
const locationId = process.env.GHL_LOCATION_ID;

console.log('Testing GHL connection...');
console.log(`Location ID: ${locationId}`);
console.log(`API Key: ${apiKey?.substring(0, 20)}...`);
console.log('---');

const ghl = new GHLClient(apiKey, locationId);

try {
  // Test 1: Get pipelines
  console.log('\n1. Testing pipelines...');
  const pipelines = await ghl.getPipelines();
  console.log(`   ✅ Found ${pipelines.pipelines?.length || 0} pipelines`);
  if (pipelines.pipelines) {
    pipelines.pipelines.forEach(p => {
      console.log(`   - ${p.name} (${p.stages?.length || 0} stages)`);
    });
  }

  // Test 2: Get contacts
  console.log('\n2. Testing contacts...');
  const contacts = await ghl.getContacts({ limit: 5 });
  console.log(`   ✅ Found ${contacts.contacts?.length || 0} contacts (showing first 5)`);

  // Test 3: Get users
  console.log('\n3. Testing users...');
  const users = await ghl.getUsers();
  console.log(`   ✅ Found ${users.users?.length || 0} team members`);

  // Test 4: Get tags
  console.log('\n4. Testing tags...');
  const tags = await ghl.getTags();
  console.log(`   ✅ Found ${tags.tags?.length || 0} tags`);

  console.log('\n🎉 All tests passed! GHL connection is working.\n');
} catch (error) {
  console.error(`\n❌ Connection failed: ${error.message}\n`);
  if (error.message.includes('401')) {
    console.error('   → API key is invalid or expired. Generate a new one in GHL.');
  } else if (error.message.includes('422')) {
    console.error('   → Location ID may be incorrect. Check GHL Settings.');
  }
  process.exit(1);
}
