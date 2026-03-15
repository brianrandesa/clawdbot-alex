#!/usr/bin/env node

/**
 * ESA GoHighLevel MCP Server v2.0 - READ + WRITE
 *
 * Full GHL CRM operations via MCP stdio transport.
 * For local Claude Code / Claude Desktop usage.
 * For remote access via OpenClaw, use server-http.js instead.
 *
 * 47 tools: 22 read + 25 write
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GHLClient } from './ghl-client.js';

// Load .env from workspace root
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const apiKey = process.env.GHL_API_KEY;
const locationId = process.env.GHL_LOCATION_ID;

if (!apiKey || !locationId || apiKey.includes('YOUR_')) {
  console.error('ERROR: GHL_API_KEY and GHL_LOCATION_ID must be set in .env');
  process.exit(1);
}

const ghl = new GHLClient(apiKey, locationId);

// ========== TOOL DEFINITIONS ==========

const TOOLS = [
  // ===== READ TOOLS (22) =====

  {
    name: 'ghl_get_contacts',
    description: 'Get a list of contacts from GoHighLevel CRM. Can search by name, email, or phone.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (name, email, or phone)' },
        limit: { type: 'number', description: 'Max results (default 20, max 100)', default: 20 },
        startAfterId: { type: 'string', description: 'Pagination cursor - contact ID to start after' },
      },
    },
  },
  {
    name: 'ghl_get_contact',
    description: 'Get detailed info for a specific contact by their ID.',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'The GHL contact ID' },
      },
      required: ['contactId'],
    },
  },
  {
    name: 'ghl_search_contacts',
    description: 'Search contacts by query string. Returns matching contacts.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term' },
        limit: { type: 'number', description: 'Max results (default 20)', default: 20 },
      },
      required: ['query'],
    },
  },
  {
    name: 'ghl_get_pipelines',
    description: 'List all sales pipelines and their stages in GoHighLevel.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ghl_get_opportunities',
    description: 'Get opportunities (deals) from a pipeline. Can filter by pipeline and stage.',
    inputSchema: {
      type: 'object',
      properties: {
        pipelineId: { type: 'string', description: 'Pipeline ID to filter by' },
        stageId: { type: 'string', description: 'Stage ID to filter by' },
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', description: 'Max results (default 20)', default: 20 },
        startAfterId: { type: 'string', description: 'Pagination cursor' },
      },
    },
  },
  {
    name: 'ghl_get_opportunity',
    description: 'Get detailed info for a specific opportunity/deal by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        opportunityId: { type: 'string', description: 'The opportunity ID' },
      },
      required: ['opportunityId'],
    },
  },
  {
    name: 'ghl_get_conversations',
    description: 'List recent conversations (SMS, email, etc.) in GoHighLevel.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max results (default 20)', default: 20 },
        startAfterId: { type: 'string', description: 'Pagination cursor' },
      },
    },
  },
  {
    name: 'ghl_get_conversation',
    description: 'Get a specific conversation and its details.',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string', description: 'The conversation ID' },
      },
      required: ['conversationId'],
    },
  },
  {
    name: 'ghl_get_messages',
    description: 'Get messages from a specific conversation. View SMS/email threads.',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string', description: 'The conversation ID' },
        limit: { type: 'number', description: 'Max messages (default 20)', default: 20 },
      },
      required: ['conversationId'],
    },
  },
  {
    name: 'ghl_get_calendars',
    description: 'List all calendars in GoHighLevel.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ghl_get_calendar_events',
    description: 'Get events/appointments from a specific calendar.',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: { type: 'string', description: 'The calendar ID' },
        startTime: { type: 'string', description: 'Start time (ISO 8601)' },
        endTime: { type: 'string', description: 'End time (ISO 8601)' },
      },
      required: ['calendarId'],
    },
  },
  {
    name: 'ghl_get_campaigns',
    description: 'List all campaigns in GoHighLevel.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ghl_get_workflows',
    description: 'List all workflows in GoHighLevel.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ghl_get_users',
    description: 'List all team members/users in the GHL location.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ghl_get_tags',
    description: 'List all tags used in GoHighLevel.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ghl_get_custom_fields',
    description: 'List all custom fields defined in GoHighLevel.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ghl_get_custom_values',
    description: 'List all custom values defined in GoHighLevel.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ghl_get_funnels',
    description: 'List all funnels in GoHighLevel.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max results (default 20)', default: 20 },
        offset: { type: 'number', description: 'Pagination offset', default: 0 },
      },
    },
  },
  {
    name: 'ghl_get_funnel',
    description: 'Get detailed info for a specific funnel by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        funnelId: { type: 'string', description: 'The funnel ID' },
      },
      required: ['funnelId'],
    },
  },
  {
    name: 'ghl_get_funnel_pages',
    description: 'Get pages within a specific funnel.',
    inputSchema: {
      type: 'object',
      properties: {
        funnelId: { type: 'string', description: 'The funnel ID' },
        limit: { type: 'number', description: 'Max results (default 20)', default: 20 },
        offset: { type: 'number', description: 'Pagination offset', default: 0 },
      },
      required: ['funnelId'],
    },
  },
  {
    name: 'ghl_get_forms',
    description: 'List all forms in GoHighLevel.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ghl_get_form_submissions',
    description: 'Get form submissions for a specific form.',
    inputSchema: {
      type: 'object',
      properties: {
        formId: { type: 'string', description: 'The form ID' },
        limit: { type: 'number', description: 'Max results (default 20)', default: 20 },
        startAfterId: { type: 'string', description: 'Pagination cursor' },
      },
      required: ['formId'],
    },
  },
  {
    name: 'ghl_get_contact_notes',
    description: 'Get notes for a specific contact.',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'The contact ID' },
      },
      required: ['contactId'],
    },
  },
  {
    name: 'ghl_get_contact_tasks',
    description: 'Get tasks for a specific contact.',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'The contact ID' },
      },
      required: ['contactId'],
    },
  },
  {
    name: 'ghl_pipeline_summary',
    description: 'Get a high-level summary of all pipelines with opportunity counts per stage. Great for daily reports.',
    inputSchema: { type: 'object', properties: {} },
  },

  // ===== WRITE TOOLS (25) =====

  {
    name: 'ghl_create_contact',
    description: 'Create a new contact in GoHighLevel CRM.',
    inputSchema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', description: 'First name' },
        lastName: { type: 'string', description: 'Last name' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags to apply' },
        source: { type: 'string', description: 'Lead source' },
        customFields: { type: 'array', description: 'Custom field values' },
      },
    },
  },
  {
    name: 'ghl_update_contact',
    description: 'Update an existing contact in GoHighLevel.',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'The contact ID to update' },
        data: {
          type: 'object',
          description: 'Fields to update: firstName, lastName, email, phone, tags, customFields, etc.',
        },
      },
      required: ['contactId', 'data'],
    },
  },
  {
    name: 'ghl_delete_contact',
    description: 'Delete a contact from GoHighLevel. WARNING: This is permanent.',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'The contact ID to delete' },
      },
      required: ['contactId'],
    },
  },
  {
    name: 'ghl_add_contact_tag',
    description: 'Add tags to a contact.',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'The contact ID' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags to add' },
      },
      required: ['contactId', 'tags'],
    },
  },
  {
    name: 'ghl_add_contact_note',
    description: 'Add a note to a contact.',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'The contact ID' },
        body: { type: 'string', description: 'Note content' },
      },
      required: ['contactId', 'body'],
    },
  },
  {
    name: 'ghl_add_contact_task',
    description: 'Add a task to a contact.',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'The contact ID' },
        title: { type: 'string', description: 'Task title' },
        body: { type: 'string', description: 'Task description' },
        dueDate: { type: 'string', description: 'Due date (ISO 8601)' },
        completed: { type: 'boolean', description: 'Whether task is completed', default: false },
      },
      required: ['contactId', 'title'],
    },
  },
  {
    name: 'ghl_create_opportunity',
    description: 'Create a new opportunity/deal in a pipeline.',
    inputSchema: {
      type: 'object',
      properties: {
        pipelineId: { type: 'string', description: 'Pipeline ID' },
        stageId: { type: 'string', description: 'Stage ID to place the deal in' },
        name: { type: 'string', description: 'Deal name' },
        contactId: { type: 'string', description: 'Associated contact ID' },
        monetaryValue: { type: 'number', description: 'Deal value in dollars' },
        source: { type: 'string', description: 'Lead source' },
      },
      required: ['pipelineId', 'name'],
    },
  },
  {
    name: 'ghl_update_opportunity',
    description: 'Update an existing opportunity/deal.',
    inputSchema: {
      type: 'object',
      properties: {
        opportunityId: { type: 'string', description: 'The opportunity ID' },
        data: {
          type: 'object',
          description: 'Fields to update: stageId, name, monetaryValue, status, etc.',
        },
      },
      required: ['opportunityId', 'data'],
    },
  },
  {
    name: 'ghl_delete_opportunity',
    description: 'Delete an opportunity/deal. WARNING: This is permanent.',
    inputSchema: {
      type: 'object',
      properties: {
        opportunityId: { type: 'string', description: 'The opportunity ID to delete' },
      },
      required: ['opportunityId'],
    },
  },
  {
    name: 'ghl_move_opportunity_stage',
    description: 'Move an opportunity to a different pipeline stage.',
    inputSchema: {
      type: 'object',
      properties: {
        opportunityId: { type: 'string', description: 'The opportunity ID' },
        stageId: { type: 'string', description: 'Target stage ID' },
      },
      required: ['opportunityId', 'stageId'],
    },
  },
  {
    name: 'ghl_update_opportunity_status',
    description: 'Update an opportunity status (open, won, lost, abandoned).',
    inputSchema: {
      type: 'object',
      properties: {
        opportunityId: { type: 'string', description: 'The opportunity ID' },
        status: { type: 'string', enum: ['open', 'won', 'lost', 'abandoned'], description: 'New status' },
      },
      required: ['opportunityId', 'status'],
    },
  },
  {
    name: 'ghl_create_pipeline',
    description: 'Create a new sales pipeline with stages.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Pipeline name' },
        stages: {
          type: 'array',
          items: { type: 'object', properties: { name: { type: 'string' } } },
          description: 'Array of stage objects with name property',
        },
      },
      required: ['name', 'stages'],
    },
  },
  {
    name: 'ghl_update_pipeline',
    description: 'Update an existing pipeline.',
    inputSchema: {
      type: 'object',
      properties: {
        pipelineId: { type: 'string', description: 'The pipeline ID' },
        data: { type: 'object', description: 'Fields to update: name, stages, etc.' },
      },
      required: ['pipelineId', 'data'],
    },
  },
  {
    name: 'ghl_create_tag',
    description: 'Create a new tag in GoHighLevel.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Tag name' },
      },
      required: ['name'],
    },
  },
  {
    name: 'ghl_update_tag',
    description: 'Update/rename a tag.',
    inputSchema: {
      type: 'object',
      properties: {
        tagId: { type: 'string', description: 'The tag ID' },
        name: { type: 'string', description: 'New tag name' },
      },
      required: ['tagId', 'name'],
    },
  },
  {
    name: 'ghl_delete_tag',
    description: 'Delete a tag. WARNING: This is permanent.',
    inputSchema: {
      type: 'object',
      properties: {
        tagId: { type: 'string', description: 'The tag ID to delete' },
      },
      required: ['tagId'],
    },
  },
  {
    name: 'ghl_create_custom_field',
    description: 'Create a new custom field in GoHighLevel.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Field name' },
        dataType: { type: 'string', enum: ['TEXT', 'LARGE_TEXT', 'NUMERICAL', 'PHONE', 'MONETORY', 'CHECKBOX', 'SINGLE_OPTIONS', 'MULTIPLE_OPTIONS', 'FLOAT', 'DATE', 'TEXTBOX_LIST', 'FILE_UPLOAD', 'SIGNATURE'], description: 'Field data type' },
        placeholder: { type: 'string', description: 'Placeholder text' },
        position: { type: 'number', description: 'Display position' },
      },
      required: ['name', 'dataType'],
    },
  },
  {
    name: 'ghl_update_custom_field',
    description: 'Update a custom field.',
    inputSchema: {
      type: 'object',
      properties: {
        customFieldId: { type: 'string', description: 'The custom field ID' },
        data: { type: 'object', description: 'Fields to update' },
      },
      required: ['customFieldId', 'data'],
    },
  },
  {
    name: 'ghl_delete_custom_field',
    description: 'Delete a custom field. WARNING: This is permanent.',
    inputSchema: {
      type: 'object',
      properties: {
        customFieldId: { type: 'string', description: 'The custom field ID to delete' },
      },
      required: ['customFieldId'],
    },
  },
  {
    name: 'ghl_create_custom_value',
    description: 'Create a new custom value in GoHighLevel.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Value name' },
        value: { type: 'string', description: 'The value' },
      },
      required: ['name', 'value'],
    },
  },
  {
    name: 'ghl_update_custom_value',
    description: 'Update a custom value.',
    inputSchema: {
      type: 'object',
      properties: {
        customValueId: { type: 'string', description: 'The custom value ID' },
        data: { type: 'object', description: 'Fields to update' },
      },
      required: ['customValueId', 'data'],
    },
  },
  {
    name: 'ghl_delete_custom_value',
    description: 'Delete a custom value. WARNING: This is permanent.',
    inputSchema: {
      type: 'object',
      properties: {
        customValueId: { type: 'string', description: 'The custom value ID to delete' },
      },
      required: ['customValueId'],
    },
  },
  {
    name: 'ghl_create_calendar',
    description: 'Create a new calendar in GoHighLevel.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Calendar name' },
        description: { type: 'string', description: 'Calendar description' },
        slug: { type: 'string', description: 'Calendar URL slug' },
      },
      required: ['name'],
    },
  },
  {
    name: 'ghl_create_appointment',
    description: 'Create a new appointment on a calendar.',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: { type: 'string', description: 'Calendar ID' },
        contactId: { type: 'string', description: 'Contact ID' },
        startTime: { type: 'string', description: 'Start time (ISO 8601)' },
        endTime: { type: 'string', description: 'End time (ISO 8601)' },
        title: { type: 'string', description: 'Appointment title' },
      },
      required: ['calendarId', 'startTime', 'endTime'],
    },
  },
  {
    name: 'ghl_update_appointment',
    description: 'Update an existing appointment.',
    inputSchema: {
      type: 'object',
      properties: {
        eventId: { type: 'string', description: 'The appointment/event ID' },
        data: { type: 'object', description: 'Fields to update: startTime, endTime, title, etc.' },
      },
      required: ['eventId', 'data'],
    },
  },
  {
    name: 'ghl_bulk_tag_contacts',
    description: 'Add tags to multiple contacts at once.',
    inputSchema: {
      type: 'object',
      properties: {
        contactIds: { type: 'array', items: { type: 'string' }, description: 'Array of contact IDs' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags to add' },
      },
      required: ['contactIds', 'tags'],
    },
  },
  {
    name: 'ghl_bulk_move_opportunities',
    description: 'Move multiple opportunities to a different stage at once.',
    inputSchema: {
      type: 'object',
      properties: {
        opportunityIds: { type: 'array', items: { type: 'string' }, description: 'Array of opportunity IDs' },
        stageId: { type: 'string', description: 'Target stage ID' },
      },
      required: ['opportunityIds', 'stageId'],
    },
  },
  {
    name: 'ghl_bulk_add_notes',
    description: 'Add the same note to multiple contacts at once.',
    inputSchema: {
      type: 'object',
      properties: {
        contactIds: { type: 'array', items: { type: 'string' }, description: 'Array of contact IDs' },
        noteBody: { type: 'string', description: 'Note content to add to each contact' },
      },
      required: ['contactIds', 'noteBody'],
    },
  },
  {
    name: 'ghl_bulk_update_contacts',
    description: 'Update multiple contacts with the same data at once.',
    inputSchema: {
      type: 'object',
      properties: {
        contactIds: { type: 'array', items: { type: 'string' }, description: 'Array of contact IDs' },
        data: { type: 'object', description: 'Fields to update on all contacts' },
      },
      required: ['contactIds', 'data'],
    },
  },
];

// ========== TOOL HANDLERS ==========

async function handleTool(name, args) {
  try {
    switch (name) {
      // ===== READ HANDLERS =====
      case 'ghl_get_contacts':
        return await ghl.getContacts({ query: args.query, limit: args.limit, startAfterId: args.startAfterId });

      case 'ghl_get_contact':
        return await ghl.getContact(args.contactId);

      case 'ghl_search_contacts':
        return await ghl.searchContacts(args.query, args.limit);

      case 'ghl_get_pipelines':
        return await ghl.getPipelines();

      case 'ghl_get_opportunities':
        return await ghl.getOpportunities({
          pipelineId: args.pipelineId,
          stageId: args.stageId,
          query: args.query,
          limit: args.limit,
          startAfterId: args.startAfterId,
        });

      case 'ghl_get_opportunity':
        return await ghl.getOpportunity(args.opportunityId);

      case 'ghl_get_conversations':
        return await ghl.getConversations({ limit: args.limit, startAfterId: args.startAfterId });

      case 'ghl_get_conversation':
        return await ghl.getConversation(args.conversationId);

      case 'ghl_get_messages':
        return await ghl.getMessages(args.conversationId, { limit: args.limit });

      case 'ghl_get_calendars':
        return await ghl.getCalendars();

      case 'ghl_get_calendar_events':
        return await ghl.getCalendarEvents(args.calendarId, {
          startTime: args.startTime,
          endTime: args.endTime,
        });

      case 'ghl_get_campaigns':
        return await ghl.getCampaigns();

      case 'ghl_get_workflows':
        return await ghl.getWorkflows();

      case 'ghl_get_users':
        return await ghl.getUsers();

      case 'ghl_get_tags':
        return await ghl.getTags();

      case 'ghl_get_custom_fields':
        return await ghl.getCustomFields();

      case 'ghl_get_custom_values':
        return await ghl.getCustomValues();

      case 'ghl_get_funnels':
        return await ghl.getFunnels({ limit: args.limit, offset: args.offset });

      case 'ghl_get_funnel':
        return await ghl.getFunnel(args.funnelId);

      case 'ghl_get_funnel_pages':
        return await ghl.getFunnelPages(args.funnelId, { limit: args.limit, offset: args.offset });

      case 'ghl_get_forms':
        return await ghl.getForms();

      case 'ghl_get_form_submissions':
        return await ghl.getFormSubmissions(args.formId, { limit: args.limit, startAfterId: args.startAfterId });

      case 'ghl_get_contact_notes':
        return await ghl.getContactNotes(args.contactId);

      case 'ghl_get_contact_tasks':
        return await ghl.getContactTasks(args.contactId);

      case 'ghl_pipeline_summary': {
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
        return { pipelines: summary };
      }

      // ===== WRITE HANDLERS =====
      case 'ghl_create_contact':
        return await ghl.createContact(args);

      case 'ghl_update_contact':
        return await ghl.updateContact(args.contactId, args.data);

      case 'ghl_delete_contact':
        return await ghl.deleteContact(args.contactId);

      case 'ghl_add_contact_tag':
        return await ghl.addContactTag(args.contactId, args.tags);

      case 'ghl_add_contact_note':
        return await ghl.addContactNote(args.contactId, args.body);

      case 'ghl_add_contact_task':
        return await ghl.addContactTask(args.contactId, args);

      case 'ghl_create_opportunity':
        return await ghl.createOpportunity(args);

      case 'ghl_update_opportunity':
        return await ghl.updateOpportunity(args.opportunityId, args.data);

      case 'ghl_delete_opportunity':
        return await ghl.deleteOpportunity(args.opportunityId);

      case 'ghl_move_opportunity_stage':
        return await ghl.moveOpportunityStage(args.opportunityId, args.stageId);

      case 'ghl_update_opportunity_status':
        return await ghl.updateOpportunityStatus(args.opportunityId, args.status);

      case 'ghl_create_pipeline':
        return await ghl.createPipeline(args);

      case 'ghl_update_pipeline':
        return await ghl.updatePipeline(args.pipelineId, args.data);

      case 'ghl_create_tag':
        return await ghl.createTag(args.name);

      case 'ghl_update_tag':
        return await ghl.updateTag(args.tagId, args.name);

      case 'ghl_delete_tag':
        return await ghl.deleteTag(args.tagId);

      case 'ghl_create_custom_field':
        return await ghl.createCustomField(args);

      case 'ghl_update_custom_field':
        return await ghl.updateCustomField(args.customFieldId, args.data);

      case 'ghl_delete_custom_field':
        return await ghl.deleteCustomField(args.customFieldId);

      case 'ghl_create_custom_value':
        return await ghl.createCustomValue(args);

      case 'ghl_update_custom_value':
        return await ghl.updateCustomValue(args.customValueId, args.data);

      case 'ghl_delete_custom_value':
        return await ghl.deleteCustomValue(args.customValueId);

      case 'ghl_create_calendar':
        return await ghl.createCalendar(args);

      case 'ghl_create_appointment':
        return await ghl.createAppointment(args);

      case 'ghl_update_appointment':
        return await ghl.updateAppointment(args.eventId, args.data);

      case 'ghl_bulk_tag_contacts':
        return await ghl.bulkTagContacts(args.contactIds, args.tags);

      case 'ghl_bulk_move_opportunities':
        return await ghl.bulkMoveOpportunities(args.opportunityIds, args.stageId);

      case 'ghl_bulk_add_notes':
        return await ghl.bulkAddNotes(args.contactIds, args.noteBody);

      case 'ghl_bulk_update_contacts':
        return await ghl.bulkUpdateContacts(args.contactIds, args.data);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return { error: error.message };
  }
}

// ========== MCP SERVER ==========

const server = new Server(
  {
    name: 'esa-ghl-server',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const result = await handleTool(name, args || {});

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
});

// ========== START ==========

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ESA GHL MCP Server v2.0 running (stdio transport)');
  console.error(`Location: ${locationId}`);
  console.error(`Tools available: ${TOOLS.length} (read + write)`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
