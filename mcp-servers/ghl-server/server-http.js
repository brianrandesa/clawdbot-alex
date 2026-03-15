#!/usr/bin/env node

/**
 * ESA GoHighLevel MCP Server - HTTP Transport (READ + WRITE)
 *
 * Full GHL CRM operations via HTTP. Runs locally on Mac Studio.
 * Victoria (OpenClaw) uses read-only endpoints.
 * Claude Code / Henry uses full read+write endpoints.
 *
 * Only accessible via Tailscale IP (100.82.186.108) - not exposed to internet.
 */

import express from 'express';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GHLClient } from './ghl-client.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const app = express();
app.use(express.json());

const PORT = process.env.MCP_GHL_PORT || 3100;
const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN;
const apiKey = process.env.GHL_API_KEY;
const locationId = process.env.GHL_LOCATION_ID;

if (!apiKey || !locationId || apiKey.includes('YOUR_')) {
  console.error('ERROR: GHL_API_KEY and GHL_LOCATION_ID must be set in .env');
  process.exit(1);
}

const ghl = new GHLClient(apiKey, locationId);

// ========== AUTH MIDDLEWARE ==========

function authMiddleware(req, res, next) {
  if (!AUTH_TOKEN) {
    const ip = req.ip || req.connection.remoteAddress;
    const isTailscale = ip.startsWith('100.') || ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
    if (!isTailscale) {
      return res.status(403).json({ error: 'Access denied - Tailscale only' });
    }
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.use(authMiddleware);

// ========== HELPER ==========

function route(method, path, handler) {
  app[method](path, async (req, res) => {
    try {
      const result = await handler(req.body);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}

// ========== HEALTH CHECK ==========

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'esa-ghl-mcp',
    version: '2.0.0',
    mode: 'read-write',
    locationId,
    uptime: process.uptime(),
    tools: { read: 22, write: 25, total: 47 },
  });
});

// ========== LIST TOOLS ==========

app.get('/tools', (req, res) => {
  res.json({
    read: [
      'ghl_get_contacts', 'ghl_get_contact', 'ghl_search_contacts',
      'ghl_get_pipelines', 'ghl_get_opportunities', 'ghl_get_opportunity',
      'ghl_get_conversations', 'ghl_get_conversation', 'ghl_get_messages',
      'ghl_get_calendars', 'ghl_get_calendar_events',
      'ghl_get_campaigns', 'ghl_get_workflows',
      'ghl_get_users', 'ghl_get_tags', 'ghl_get_custom_fields', 'ghl_get_custom_values',
      'ghl_get_funnels', 'ghl_get_funnel', 'ghl_get_funnel_pages',
      'ghl_get_forms', 'ghl_get_form_submissions',
      'ghl_get_contact_notes', 'ghl_get_contact_tasks',
      'ghl_pipeline_summary',
    ],
    write: [
      'ghl_create_contact', 'ghl_update_contact', 'ghl_delete_contact',
      'ghl_add_contact_tag', 'ghl_add_contact_note', 'ghl_add_contact_task',
      'ghl_create_opportunity', 'ghl_update_opportunity', 'ghl_delete_opportunity',
      'ghl_move_opportunity_stage', 'ghl_update_opportunity_status',
      'ghl_create_pipeline', 'ghl_update_pipeline',
      'ghl_create_tag', 'ghl_update_tag', 'ghl_delete_tag',
      'ghl_create_custom_field', 'ghl_update_custom_field', 'ghl_delete_custom_field',
      'ghl_create_custom_value', 'ghl_update_custom_value', 'ghl_delete_custom_value',
      'ghl_create_calendar', 'ghl_create_appointment', 'ghl_update_appointment',
      'ghl_bulk_tag_contacts', 'ghl_bulk_move_opportunities', 'ghl_bulk_add_notes',
      'ghl_bulk_update_contacts',
    ],
  });
});

// ==========================================================
// READ ENDPOINTS
// ==========================================================

// Contacts
route('post', '/tools/ghl_get_contacts', (b) => ghl.getContacts(b));
route('post', '/tools/ghl_get_contact', (b) => ghl.getContact(b.contactId));
route('post', '/tools/ghl_search_contacts', (b) => ghl.searchContacts(b.query, b.limit));

// Pipelines & Opportunities
route('post', '/tools/ghl_get_pipelines', () => ghl.getPipelines());
route('post', '/tools/ghl_get_opportunities', (b) => ghl.getOpportunities(b));
route('post', '/tools/ghl_get_opportunity', (b) => ghl.getOpportunity(b.opportunityId));

// Conversations
route('post', '/tools/ghl_get_conversations', (b) => ghl.getConversations(b));
route('post', '/tools/ghl_get_conversation', (b) => ghl.getConversation(b.conversationId));
route('post', '/tools/ghl_get_messages', (b) => ghl.getMessages(b.conversationId, { limit: b.limit }));

// Calendars
route('post', '/tools/ghl_get_calendars', () => ghl.getCalendars());
route('post', '/tools/ghl_get_calendar_events', (b) => ghl.getCalendarEvents(b.calendarId, b));

// Campaigns & Workflows
route('post', '/tools/ghl_get_campaigns', () => ghl.getCampaigns());
route('post', '/tools/ghl_get_workflows', () => ghl.getWorkflows());

// Users
route('post', '/tools/ghl_get_users', () => ghl.getUsers());

// Tags, Custom Fields, Custom Values
route('post', '/tools/ghl_get_tags', () => ghl.getTags());
route('post', '/tools/ghl_get_custom_fields', () => ghl.getCustomFields());
route('post', '/tools/ghl_get_custom_values', () => ghl.getCustomValues());

// Funnels
route('post', '/tools/ghl_get_funnels', (b) => ghl.getFunnels(b));
route('post', '/tools/ghl_get_funnel', (b) => ghl.getFunnel(b.funnelId));
route('post', '/tools/ghl_get_funnel_pages', (b) => ghl.getFunnelPages(b.funnelId, b));

// Forms
route('post', '/tools/ghl_get_forms', () => ghl.getForms());
route('post', '/tools/ghl_get_form_submissions', (b) => ghl.getFormSubmissions(b.formId, b));

// Contact Notes & Tasks
route('post', '/tools/ghl_get_contact_notes', (b) => ghl.getContactNotes(b.contactId));
route('post', '/tools/ghl_get_contact_tasks', (b) => ghl.getContactTasks(b.contactId));

// Pipeline Summary
app.post('/tools/ghl_pipeline_summary', async (req, res) => {
  try {
    const pipelines = await ghl.getPipelines();
    const summary = [];
    if (pipelines.pipelines) {
      for (const pipeline of pipelines.pipelines) {
        const ps = { name: pipeline.name, id: pipeline.id, stages: [] };
        if (pipeline.stages) {
          for (const stage of pipeline.stages) {
            const opps = await ghl.getOpportunities({ pipelineId: pipeline.id, stageId: stage.id, limit: 1 });
            ps.stages.push({ name: stage.name, id: stage.id, count: opps.meta?.total || 0 });
          }
        }
        summary.push(ps);
      }
    }
    res.json({ pipelines: summary });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==========================================================
// WRITE ENDPOINTS
// ==========================================================

// --- Contacts ---
route('post', '/tools/ghl_create_contact', (b) => ghl.createContact(b));
route('post', '/tools/ghl_update_contact', (b) => ghl.updateContact(b.contactId, b.data));
route('post', '/tools/ghl_delete_contact', (b) => ghl.deleteContact(b.contactId));
route('post', '/tools/ghl_add_contact_tag', (b) => ghl.addContactTag(b.contactId, b.tags));
route('post', '/tools/ghl_add_contact_note', (b) => ghl.addContactNote(b.contactId, b.body));
route('post', '/tools/ghl_add_contact_task', (b) => ghl.addContactTask(b.contactId, b));

// --- Opportunities ---
route('post', '/tools/ghl_create_opportunity', (b) => ghl.createOpportunity(b));
route('post', '/tools/ghl_update_opportunity', (b) => ghl.updateOpportunity(b.opportunityId, b.data));
route('post', '/tools/ghl_delete_opportunity', (b) => ghl.deleteOpportunity(b.opportunityId));
route('post', '/tools/ghl_move_opportunity_stage', (b) => ghl.moveOpportunityStage(b.opportunityId, b.stageId));
route('post', '/tools/ghl_update_opportunity_status', (b) => ghl.updateOpportunityStatus(b.opportunityId, b.status));

// --- Pipelines ---
route('post', '/tools/ghl_create_pipeline', (b) => ghl.createPipeline(b));
route('post', '/tools/ghl_update_pipeline', (b) => ghl.updatePipeline(b.pipelineId, b.data));

// --- Tags ---
route('post', '/tools/ghl_create_tag', (b) => ghl.createTag(b.name));
route('post', '/tools/ghl_update_tag', (b) => ghl.updateTag(b.tagId, b.name));
route('post', '/tools/ghl_delete_tag', (b) => ghl.deleteTag(b.tagId));

// --- Custom Fields ---
route('post', '/tools/ghl_create_custom_field', (b) => ghl.createCustomField(b));
route('post', '/tools/ghl_update_custom_field', (b) => ghl.updateCustomField(b.customFieldId, b.data));
route('post', '/tools/ghl_delete_custom_field', (b) => ghl.deleteCustomField(b.customFieldId));

// --- Custom Values ---
route('post', '/tools/ghl_create_custom_value', (b) => ghl.createCustomValue(b));
route('post', '/tools/ghl_update_custom_value', (b) => ghl.updateCustomValue(b.customValueId, b.data));
route('post', '/tools/ghl_delete_custom_value', (b) => ghl.deleteCustomValue(b.customValueId));

// --- Calendars & Appointments ---
route('post', '/tools/ghl_create_calendar', (b) => ghl.createCalendar(b));
route('post', '/tools/ghl_create_appointment', (b) => ghl.createAppointment(b));
route('post', '/tools/ghl_update_appointment', (b) => ghl.updateAppointment(b.eventId, b.data));

// --- Bulk Operations ---
route('post', '/tools/ghl_bulk_tag_contacts', (b) => ghl.bulkTagContacts(b.contactIds, b.tags));
route('post', '/tools/ghl_bulk_move_opportunities', (b) => ghl.bulkMoveOpportunities(b.opportunityIds, b.stageId));
route('post', '/tools/ghl_bulk_add_notes', (b) => ghl.bulkAddNotes(b.contactIds, b.noteBody));
route('post', '/tools/ghl_bulk_update_contacts', (b) => ghl.bulkUpdateContacts(b.contactIds, b.data));

// ========== CATCH-ALL ==========

app.post('/tools/:toolName', (req, res) => {
  res.status(404).json({ error: `Unknown tool: ${req.params.toolName}` });
});

// ========== START ==========

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🔧 ESA GHL MCP Server v2.0 (READ + WRITE)`);
  console.log(`   Local:     http://localhost:${PORT}`);
  console.log(`   Tailscale: http://100.82.186.108:${PORT}`);
  console.log(`   Auth:      ${AUTH_TOKEN ? 'Bearer token required' : 'Tailscale IP check only'}`);
  console.log(`   GHL Location: ${locationId}`);
  console.log(`   Read tools:  22`);
  console.log(`   Write tools: 25`);
  console.log(`   Total: 47 endpoints\n`);
});
