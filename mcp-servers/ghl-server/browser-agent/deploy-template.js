#!/usr/bin/env node

/**
 * ESA Template Deployment Engine
 *
 * Deploys a complete ESA template to a GHL sub-account.
 * Uses the API for what it can (tags, custom fields, pipelines, contacts)
 * and falls back to browser automation for UI-only operations (funnels, workflows).
 *
 * Usage:
 *   node deploy-template.js --template general-business [--dry-run]
 *   node deploy-template.js --template high-ticket-mastermind
 *   node deploy-template.js --template virtual-hybrid
 *   node deploy-template.js --template multi-day-conference
 */

import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GHLClient } from '../ghl-client.js';
import { getTemplate, listTemplates } from './esa-templates.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../../.env') });

const apiKey = process.env.GHL_API_KEY;
const locationId = process.env.GHL_LOCATION_ID;

if (!apiKey || !locationId) {
  console.error('ERROR: GHL_API_KEY and GHL_LOCATION_ID must be set in .env');
  process.exit(1);
}

const ghl = new GHLClient(apiKey, locationId);

// Parse CLI args
const args = process.argv.slice(2);
const templateType = args.find((a, i) => args[i - 1] === '--template') || args[0];
const dryRun = args.includes('--dry-run');
const listOnly = args.includes('--list');

async function deployTemplate(type) {
  const template = getTemplate(type);
  const results = {
    template: template.name,
    dryRun,
    pipeline: null,
    tags: [],
    customFields: [],
    calendar: null,
    funnelNote: null,
    workflowNotes: [],
    errors: [],
  };

  console.log(`\n🚀 Deploying: ${template.name}`);
  console.log(`   ${template.description}`);
  if (dryRun) console.log('   ⚠️  DRY RUN - no changes will be made\n');
  else console.log('');

  // ========== 1. CREATE PIPELINE ==========
  console.log('📊 Creating pipeline...');
  try {
    if (!dryRun) {
      const pipeline = await ghl.createPipeline({
        name: template.pipeline.name,
        stages: template.pipeline.stages,
      });
      results.pipeline = { success: true, id: pipeline.pipeline?.id, name: template.pipeline.name, stages: template.pipeline.stages.length };
      console.log(`   ✅ Pipeline "${template.pipeline.name}" created (${template.pipeline.stages.length} stages)`);
    } else {
      console.log(`   [DRY RUN] Would create pipeline "${template.pipeline.name}" with ${template.pipeline.stages.length} stages`);
    }
  } catch (e) {
    results.errors.push({ step: 'pipeline', error: e.message });
    console.log(`   ❌ Pipeline error: ${e.message}`);
  }

  // ========== 2. CREATE TAGS ==========
  console.log('\n🏷️  Creating tags...');
  let tagCount = 0;
  for (const tagName of template.tags) {
    try {
      if (!dryRun) {
        await ghl.createTag(tagName);
        tagCount++;
      }
      results.tags.push({ name: tagName, success: true });
    } catch (e) {
      // Tags may already exist - that's OK
      if (e.message.includes('already exists') || e.message.includes('duplicate') || e.message.includes('422')) {
        results.tags.push({ name: tagName, success: true, note: 'already exists' });
      } else {
        results.tags.push({ name: tagName, success: false, error: e.message });
        results.errors.push({ step: 'tag', name: tagName, error: e.message });
      }
    }
  }
  if (dryRun) {
    console.log(`   [DRY RUN] Would create ${template.tags.length} tags`);
  } else {
    console.log(`   ✅ Created ${tagCount} tags (${template.tags.length - tagCount} already existed)`);
  }

  // ========== 3. CREATE CUSTOM FIELDS ==========
  console.log('\n📝 Creating custom fields...');
  let fieldCount = 0;
  for (const field of template.customFields) {
    try {
      if (!dryRun) {
        await ghl.createCustomField(field);
        fieldCount++;
      }
      results.customFields.push({ name: field.name, success: true });
    } catch (e) {
      if (e.message.includes('already exists') || e.message.includes('duplicate') || e.message.includes('422')) {
        results.customFields.push({ name: field.name, success: true, note: 'already exists' });
      } else {
        results.customFields.push({ name: field.name, success: false, error: e.message });
        results.errors.push({ step: 'customField', name: field.name, error: e.message });
      }
    }
  }
  if (dryRun) {
    console.log(`   [DRY RUN] Would create ${template.customFields.length} custom fields`);
  } else {
    console.log(`   ✅ Created ${fieldCount} custom fields (${template.customFields.length - fieldCount} already existed)`);
  }

  // ========== 4. CREATE CALENDAR ==========
  if (template.calendar) {
    console.log('\n📅 Creating calendar...');
    try {
      if (!dryRun) {
        const cal = await ghl.createCalendar({
          name: template.calendar.name,
          description: template.calendar.description,
        });
        results.calendar = { success: true, id: cal.calendar?.id, name: template.calendar.name };
        console.log(`   ✅ Calendar "${template.calendar.name}" created`);
      } else {
        console.log(`   [DRY RUN] Would create calendar "${template.calendar.name}"`);
      }
    } catch (e) {
      results.calendar = { success: false, error: e.message };
      results.errors.push({ step: 'calendar', error: e.message });
      console.log(`   ❌ Calendar error: ${e.message}`);
    }
  }

  // ========== 5. FUNNEL (BROWSER REQUIRED) ==========
  console.log('\n🌐 Funnel setup...');
  console.log(`   ℹ️  Funnel "${template.funnel.name}" requires browser automation`);
  console.log(`   Pages needed:`);
  for (const page of template.funnel.pages) {
    console.log(`     - ${page.name} (${page.type})`);
  }
  results.funnelNote = `Funnel "${template.funnel.name}" requires browser automation. ${template.funnel.pages.length} pages defined.`;
  console.log(`   💡 Use: POST http://localhost:3101/browser/create-funnel with {"name": "${template.funnel.name}"}`);

  // ========== 6. WORKFLOWS (BROWSER REQUIRED) ==========
  console.log('\n⚡ Workflow setup...');
  console.log(`   ℹ️  ${template.workflows.length} workflows require browser automation:`);
  for (const wf of template.workflows) {
    console.log(`     - ${wf.name} (trigger: ${wf.trigger}, ${wf.actions.length} actions)`);
    results.workflowNotes.push(`Workflow "${wf.name}" - trigger: ${wf.trigger}, ${wf.actions.length} actions`);
  }
  console.log(`   💡 Use: POST http://localhost:3101/browser/create-workflow for each`);

  // ========== SUMMARY ==========
  console.log('\n' + '='.repeat(60));
  console.log(`📋 DEPLOYMENT SUMMARY: ${template.name}`);
  console.log('='.repeat(60));
  console.log(`   Pipeline:      ${results.pipeline?.success ? '✅' : '⏳'} ${template.pipeline.name} (${template.pipeline.stages.length} stages)`);
  console.log(`   Tags:          ✅ ${results.tags.filter(t => t.success).length}/${template.tags.length}`);
  console.log(`   Custom Fields: ✅ ${results.customFields.filter(f => f.success).length}/${template.customFields.length}`);
  console.log(`   Calendar:      ${results.calendar?.success ? '✅' : '⏳'} ${template.calendar?.name || 'N/A'}`);
  console.log(`   Funnel:        🌐 Needs browser (${template.funnel.pages.length} pages)`);
  console.log(`   Workflows:     🌐 Needs browser (${template.workflows.length} workflows)`);
  console.log(`   Forms:         🌐 Needs browser (${template.forms.length} forms)`);
  if (results.errors.length > 0) {
    console.log(`\n   ⚠️  ${results.errors.length} errors occurred`);
    for (const err of results.errors) {
      console.log(`      - ${err.step}: ${err.error}`);
    }
  }
  console.log('='.repeat(60) + '\n');

  return results;
}

// ========== MAIN ==========

async function main() {
  if (listOnly) {
    console.log('\n📋 Available ESA Templates:\n');
    const templates = listTemplates();
    for (const t of templates) {
      console.log(`  ${t.id}`);
      console.log(`    Name: ${t.name}`);
      console.log(`    ${t.description}`);
      console.log(`    Pipeline: ${t.pipelineStages} stages | Tags: ${t.tags} | Fields: ${t.customFields}`);
      console.log(`    Funnel: ${t.funnelPages} pages | Workflows: ${t.workflows} | Forms: ${t.forms}`);
      console.log('');
    }
    return;
  }

  if (!templateType) {
    console.error('Usage: node deploy-template.js --template <type> [--dry-run] [--list]');
    console.error('Types: general-business, high-ticket-mastermind, virtual-hybrid, multi-day-conference');
    process.exit(1);
  }

  const result = await deployTemplate(templateType);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
