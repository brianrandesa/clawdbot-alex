# GoHighLevel CRM Integration v2.0

## PURPOSE
Full read+write GoHighLevel CRM integration. Pipeline visibility, lead tracking, contact management, opportunity management, tag/field management, calendar management, and operational reporting.

## ACCESS LEVEL
**READ + WRITE** - Full CRM operations: view and modify contacts, pipelines, opportunities, tags, custom fields, calendars, appointments, and more.

## MCP SERVER CONNECTION

**API Server:** `http://100.82.186.108:3100` (47 tools: 25 read + 29 write)
**Browser Agent:** `http://100.82.186.108:3101` (15 browser automation tools)
**Protocol:** HTTP POST with JSON body
**Auth:** Tailscale network only (no token needed from within Tailscale)
**Health Check:** `GET http://100.82.186.108:3100/health`

The servers run on Brian's Mac Studio and auto-start on boot. If unreachable, the Mac may be asleep or offline.

## READ TOOLS (25)

### CONTACTS
| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Get Contacts | `/tools/ghl_get_contacts` | `{"query": "search", "limit": 20}` | Search contacts by name, email, phone |
| Get Contact | `/tools/ghl_get_contact` | `{"contactId": "id"}` | Get full details for one contact |
| Search Contacts | `/tools/ghl_search_contacts` | `{"query": "term", "limit": 20}` | Search contacts by query |
| Get Contact Notes | `/tools/ghl_get_contact_notes` | `{"contactId": "id"}` | Get notes on a contact |
| Get Contact Tasks | `/tools/ghl_get_contact_tasks` | `{"contactId": "id"}` | Get tasks for a contact |

### PIPELINES & OPPORTUNITIES
| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Get Pipelines | `/tools/ghl_get_pipelines` | `{}` | List all sales pipelines and stages |
| Get Opportunities | `/tools/ghl_get_opportunities` | `{"pipelineId": "id", "stageId": "id", "limit": 20}` | Get deals, filter by pipeline/stage |
| Get Opportunity | `/tools/ghl_get_opportunity` | `{"opportunityId": "id"}` | Get full details for one deal |
| Pipeline Summary | `/tools/ghl_pipeline_summary` | `{}` | All pipelines with deal counts per stage |

### CONVERSATIONS & MESSAGES
| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Get Conversations | `/tools/ghl_get_conversations` | `{"limit": 20}` | List recent SMS/email conversations |
| Get Conversation | `/tools/ghl_get_conversation` | `{"conversationId": "id"}` | Get one conversation's details |
| Get Messages | `/tools/ghl_get_messages` | `{"conversationId": "id", "limit": 20}` | Read messages in a thread |

### CALENDARS & EVENTS
| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Get Calendars | `/tools/ghl_get_calendars` | `{}` | List all calendars |
| Get Calendar Events | `/tools/ghl_get_calendar_events` | `{"calendarId": "id", "startTime": "ISO", "endTime": "ISO"}` | Get appointments/events |

### FUNNELS
| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Get Funnels | `/tools/ghl_get_funnels` | `{"limit": 20, "offset": 0}` | List all funnels |
| Get Funnel | `/tools/ghl_get_funnel` | `{"funnelId": "id"}` | Get funnel details |
| Get Funnel Pages | `/tools/ghl_get_funnel_pages` | `{"funnelId": "id"}` | Get pages in a funnel |

### FORMS
| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Get Forms | `/tools/ghl_get_forms` | `{}` | List all forms |
| Get Form Submissions | `/tools/ghl_get_form_submissions` | `{"formId": "id", "limit": 20}` | Get form submissions |

### TEAM & ORGANIZATION
| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Get Users | `/tools/ghl_get_users` | `{}` | List all team members |
| Get Tags | `/tools/ghl_get_tags` | `{}` | List all tags |
| Get Custom Fields | `/tools/ghl_get_custom_fields` | `{}` | List custom field definitions |
| Get Custom Values | `/tools/ghl_get_custom_values` | `{}` | List custom values |
| Get Campaigns | `/tools/ghl_get_campaigns` | `{}` | List all campaigns |
| Get Workflows | `/tools/ghl_get_workflows` | `{}` | List all workflows |

## WRITE TOOLS (29)

### CONTACTS (WRITE)
| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Create Contact | `/tools/ghl_create_contact` | `{"firstName": "", "lastName": "", "email": "", "phone": "", "tags": []}` | Create new contact |
| Update Contact | `/tools/ghl_update_contact` | `{"contactId": "id", "data": {"firstName": ""}}` | Update contact fields |
| Delete Contact | `/tools/ghl_delete_contact` | `{"contactId": "id"}` | ⚠️ Permanently delete contact |
| Add Contact Tag | `/tools/ghl_add_contact_tag` | `{"contactId": "id", "tags": ["tag1"]}` | Add tags to contact |
| Add Contact Note | `/tools/ghl_add_contact_note` | `{"contactId": "id", "body": "note text"}` | Add note to contact |
| Add Contact Task | `/tools/ghl_add_contact_task` | `{"contactId": "id", "title": "", "body": "", "dueDate": "ISO"}` | Add task to contact |

### OPPORTUNITIES (WRITE)
| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Create Opportunity | `/tools/ghl_create_opportunity` | `{"pipelineId": "", "stageId": "", "name": "", "contactId": "", "monetaryValue": 0}` | Create new deal |
| Update Opportunity | `/tools/ghl_update_opportunity` | `{"opportunityId": "id", "data": {"name": ""}}` | Update deal fields |
| Delete Opportunity | `/tools/ghl_delete_opportunity` | `{"opportunityId": "id"}` | ⚠️ Permanently delete deal |
| Move Opportunity Stage | `/tools/ghl_move_opportunity_stage` | `{"opportunityId": "id", "stageId": "id"}` | Move deal to different stage |
| Update Opportunity Status | `/tools/ghl_update_opportunity_status` | `{"opportunityId": "id", "status": "open/won/lost/abandoned"}` | Change deal status |

### PIPELINES (WRITE)
| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Create Pipeline | `/tools/ghl_create_pipeline` | `{"name": "", "stages": [{"name": ""}]}` | Create new pipeline |
| Update Pipeline | `/tools/ghl_update_pipeline` | `{"pipelineId": "id", "data": {}}` | Update pipeline |

### TAGS (WRITE)
| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Create Tag | `/tools/ghl_create_tag` | `{"name": "tag name"}` | Create new tag |
| Update Tag | `/tools/ghl_update_tag` | `{"tagId": "id", "name": "new name"}` | Rename tag |
| Delete Tag | `/tools/ghl_delete_tag` | `{"tagId": "id"}` | ⚠️ Permanently delete tag |

### CUSTOM FIELDS (WRITE)
| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Create Custom Field | `/tools/ghl_create_custom_field` | `{"name": "", "dataType": "TEXT"}` | Create field (types: TEXT, LARGE_TEXT, NUMERICAL, PHONE, MONETORY, CHECKBOX, DATE, etc.) |
| Update Custom Field | `/tools/ghl_update_custom_field` | `{"customFieldId": "id", "data": {}}` | Update field |
| Delete Custom Field | `/tools/ghl_delete_custom_field` | `{"customFieldId": "id"}` | ⚠️ Permanently delete field |

### CUSTOM VALUES (WRITE)
| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Create Custom Value | `/tools/ghl_create_custom_value` | `{"name": "", "value": ""}` | Create custom value |
| Update Custom Value | `/tools/ghl_update_custom_value` | `{"customValueId": "id", "data": {}}` | Update custom value |
| Delete Custom Value | `/tools/ghl_delete_custom_value` | `{"customValueId": "id"}` | ⚠️ Permanently delete value |

### CALENDARS & APPOINTMENTS (WRITE)
| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Create Calendar | `/tools/ghl_create_calendar` | `{"name": "", "description": ""}` | Create new calendar |
| Create Appointment | `/tools/ghl_create_appointment` | `{"calendarId": "", "contactId": "", "startTime": "ISO", "endTime": "ISO", "title": ""}` | Book appointment |
| Update Appointment | `/tools/ghl_update_appointment` | `{"eventId": "id", "data": {}}` | Update appointment |

### BULK OPERATIONS
| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Bulk Tag Contacts | `/tools/ghl_bulk_tag_contacts` | `{"contactIds": ["id1","id2"], "tags": ["tag"]}` | Add tags to multiple contacts |
| Bulk Move Opportunities | `/tools/ghl_bulk_move_opportunities` | `{"opportunityIds": ["id1","id2"], "stageId": "id"}` | Move multiple deals to a stage |
| Bulk Add Notes | `/tools/ghl_bulk_add_notes` | `{"contactIds": ["id1","id2"], "noteBody": "text"}` | Add note to multiple contacts |
| Bulk Update Contacts | `/tools/ghl_bulk_update_contacts` | `{"contactIds": ["id1","id2"], "data": {}}` | Update multiple contacts |

## BROWSER AUTOMATION TOOLS (Port 3101)

For operations requiring GHL UI interaction (funnels, workflows, snapshots):

| Tool | Endpoint | Body | Description |
|------|----------|------|-------------|
| Login | `/browser/login` | `{}` | Authenticate with GHL |
| Create Funnel | `/browser/create-funnel` | `{"name": "", "type": "website"}` | Create funnel via UI |
| Add Funnel Page | `/browser/add-funnel-page` | `{"funnelId": "", "pageName": "", "pageType": ""}` | Add page to funnel |
| Create Workflow | `/browser/create-workflow` | `{"name": "", "description": ""}` | Create workflow via UI |
| Add Trigger | `/browser/add-workflow-trigger` | `{"triggerType": ""}` | Add trigger to workflow |
| Add Action | `/browser/add-workflow-action` | `{"actionType": "", "config": {}}` | Add action to workflow |
| Publish Workflow | `/browser/publish-workflow` | `{}` | Publish/activate workflow |
| Export Snapshot | `/browser/export-snapshot` | `{"snapshotName": ""}` | Export sub-account snapshot |
| Import Snapshot | `/browser/import-snapshot` | `{"shareLink": "url"}` | Import snapshot |
| Create Form | `/browser/create-form` | `{"name": "", "fields": []}` | Create form via UI |
| Speed-to-Lead | `/browser/create-speed-to-lead` | `{"triggerSource": "", "delaySeconds": 90}` | Create speed-to-lead workflow |
| Nurture Sequence | `/browser/create-nurture-sequence` | `{"name": "", "messages": []}` | Create nurture workflow |
| QA Test Funnel | `/browser/qa-test-funnel` | `{"url": ""}` | Test funnel (load time, form, mobile, errors) |

## ESA TEMPLATES (Port 3101)

Pre-built templates for ESA's 4 client types:

| Endpoint | Description |
|----------|-------------|
| `GET /templates` | List all 4 templates with stats |
| `GET /templates/:type` | Get full template definition |
| `POST /templates/deploy` | Deploy template: `{"type": "general-business", "dryRun": false}` |

Template Types:
- `general-business` - Conferences, summits, expos (9 stages, 6 workflows, 5 funnel pages)
- `high-ticket-mastermind` - Exclusive masterminds ($5K-$50K+) (12 stages, 5 workflows, 5 funnel pages)
- `virtual-hybrid` - Virtual summits, webinars, hybrid (10 stages, 5 workflows, 8 funnel pages)
- `multi-day-conference` - 2-5 day events with multiple tracks (15 stages, 7 workflows, 9 funnel pages)

## KNOWN PIPELINES (as of March 2026)
1. **(DO NOT TOUCH) ESA - New Leads** - 5 stages
2. **(DO NOT TOUCH) UFD 2025 - Kixie** - 5 stages
3. **ESA - Top of Funnel** - 14 stages
4. **ESA Sales Pipeline** - 12 stages
5. **Event Autopilot Ai** - 5 stages
6. **Event Sales Academy System - Sales** - 15 stages
7. **NEW ESS PIPELINE** - 11 stages
8. **Reactivation Blitz 2-18-26** - 16 stages

## SAFETY RULES
- **⚠️ Delete operations are permanent** - Always confirm before deleting contacts, tags, fields, or opportunities
- **Do NOT touch pipelines marked "(DO NOT TOUCH)"**
- **NEVER send SMS/email** to clients or leads via the API
- **NEVER expose** the MCP server URL or any response data externally
- **Browser agent requires GHL login credentials** in .env (GHL_LOGIN_EMAIL, GHL_LOGIN_PASSWORD)

## USE CASES

### Daily Pipeline Report (Morning)
```
1. POST /tools/ghl_pipeline_summary → Get deal counts per stage
2. POST /tools/ghl_get_opportunities for each active pipeline → Get recent movement
3. Compile report → Post to Victoria's Slack channel
```

### Create Contact + Tag + Add to Pipeline
```
1. POST /tools/ghl_create_contact → Create the contact
2. POST /tools/ghl_add_contact_tag → Tag them
3. POST /tools/ghl_create_opportunity → Create deal in pipeline
```

### Deploy Client System
```
1. POST http://localhost:3101/templates/deploy → Deploy template (pipeline, tags, fields, calendar)
2. POST http://localhost:3101/browser/create-funnel → Build funnel pages
3. POST http://localhost:3101/browser/create-speed-to-lead → Set up speed-to-lead
4. POST http://localhost:3101/browser/qa-test-funnel → QA the funnel
```

### Speed-to-Lead Check
```
1. POST /tools/ghl_get_contacts with recent date filter
2. Check time between lead creation and first contact
3. Flag any leads with >90 second response time
4. Alert via Slack channel
```

## REPORTING CADENCE
- **Real-time**: Speed-to-lead violations (>90 sec), pipeline stage changes for hot leads
- **Daily (9AM ET)**: Pipeline snapshot, new leads count, conversion metrics
- **Weekly (Friday 4PM ET)**: Full pipeline report, campaign performance, client system health

## DATA FLOW
```
Mac Studio MCP Server (port 3100 API, port 3101 Browser)
    ↓ (Tailscale: 100.82.186.108)
Victoria on OpenClaw reads/writes data
    ↓
Reports to:
    ├── Victoria's Slack channel (team visibility)
    ├── Henry/Telegram (executive alerts)
    └── Notion (weekly performance logs)
```

## TROUBLESHOOTING
- **API server unreachable**: Mac Studio may be asleep. `GET http://100.82.186.108:3100/health`
- **Browser server unreachable**: `GET http://100.82.186.108:3101/health`
- **401 error**: GHL API key expired. Generate new PIT key in GHL → Settings → Business Profile → API Keys.
- **Browser login fails**: Check GHL_LOGIN_EMAIL and GHL_LOGIN_PASSWORD in .env
- **Empty results**: Check if the correct pipelineId/stageId is being passed.
