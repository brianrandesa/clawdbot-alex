#!/usr/bin/env node

/**
 * GHL Browser Automation Server
 *
 * HTTP API for browser-based GHL operations.
 * Runs alongside the main MCP server.
 *
 * Port: 3101 (main API server is 3100)
 * Auth: Same Tailscale network check
 */

import express from 'express';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GHLBrowser } from './ghl-browser.js';
import { GHLClient } from '../ghl-client.js';
import { listTemplates, getTemplate } from './esa-templates.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../../.env') });

const app = express();
app.use(express.json());

const PORT = process.env.GHL_BROWSER_PORT || 3101;
const locationId = process.env.GHL_LOCATION_ID;
const ghlEmail = process.env.GHL_LOGIN_EMAIL;
const ghlPassword = process.env.GHL_LOGIN_PASSWORD;

// Shared browser instance (reused across requests)
let browserInstance = null;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = new GHLBrowser({
      locationId,
      email: ghlEmail,
      password: ghlPassword,
      headless: true,
      slowMo: 50,
    });
    await browserInstance.launch();
  }
  return browserInstance;
}

// ========== AUTH MIDDLEWARE ==========

function authMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const isTailscale = ip.startsWith('100.') || ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  if (!isTailscale) {
    return res.status(403).json({ error: 'Access denied - Tailscale only' });
  }
  next();
}

app.use(authMiddleware);

// ========== HEALTH CHECK ==========

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'ghl-browser-agent',
    version: '1.0.0',
    browserActive: !!browserInstance,
    locationId,
    hasCredentials: !!(ghlEmail && ghlPassword),
    uptime: process.uptime(),
  });
});

// ========== HELPER ==========

async function withBrowser(handler) {
  const browser = await getBrowser();
  try {
    return await handler(browser);
  } catch (e) {
    // Take error screenshot
    try { await browser.screenshot('error'); } catch {}
    throw e;
  }
}

function route(method, path, handler) {
  app[method](path, async (req, res) => {
    try {
      const result = await withBrowser((browser) => handler(browser, req.body));
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}

// ========== LOGIN ==========

route('post', '/browser/login', async (browser) => {
  await browser.login();
  return { success: true, message: 'Logged into GHL' };
});

// ========== FUNNEL ENDPOINTS ==========

route('post', '/browser/create-funnel', async (browser, body) => {
  return await browser.createFunnel(body.name, body.type);
});

route('post', '/browser/add-funnel-page', async (browser, body) => {
  return await browser.addFunnelPage(body.funnelId, body.pageName, body.pageType);
});

// ========== WORKFLOW ENDPOINTS ==========

route('post', '/browser/create-workflow', async (browser, body) => {
  return await browser.createWorkflow(body.name, body.description);
});

route('post', '/browser/add-workflow-trigger', async (browser, body) => {
  return await browser.addWorkflowTrigger(body.triggerType);
});

route('post', '/browser/add-workflow-action', async (browser, body) => {
  return await browser.addWorkflowAction(body.actionType, body.config || {});
});

route('post', '/browser/publish-workflow', async (browser) => {
  return await browser.publishWorkflow();
});

// ========== SNAPSHOT ENDPOINTS ==========

route('post', '/browser/export-snapshot', async (browser, body) => {
  return await browser.exportSnapshot(body.snapshotName);
});

route('post', '/browser/import-snapshot', async (browser, body) => {
  return await browser.importSnapshot(body.shareLink);
});

// ========== FORM ENDPOINTS ==========

route('post', '/browser/create-form', async (browser, body) => {
  return await browser.createForm(body.name, body.fields || []);
});

// ========== AUTOMATION ENDPOINTS ==========

route('post', '/browser/create-speed-to-lead', async (browser, body) => {
  return await browser.createSpeedToLeadWorkflow(body.triggerSource || 'Form Submission', body.delaySeconds || 90);
});

route('post', '/browser/create-nurture-sequence', async (browser, body) => {
  return await browser.createNurtureSequence(body.name, body.messages || []);
});

// ========== QA ENDPOINTS ==========

route('post', '/browser/qa-test-funnel', async (browser, body) => {
  return await browser.qaTestFunnel(body.url);
});

// ========== NAVIGATION / UTILITY ==========

route('post', '/browser/navigate', async (browser, body) => {
  await browser.page.goto(body.url, { waitUntil: 'networkidle' });
  const screenshotPath = await browser.screenshot('navigate');
  return { success: true, url: browser.page.url(), screenshot: screenshotPath };
});

route('post', '/browser/screenshot', async (browser, body) => {
  const screenshotPath = await browser.screenshot(body.name || 'manual');
  return { success: true, screenshot: screenshotPath };
});

route('post', '/browser/click', async (browser, body) => {
  await browser.clickAndWait(body.selector, body.waitMs || 2000);
  const screenshotPath = await browser.screenshot('after-click');
  return { success: true, screenshot: screenshotPath };
});

route('post', '/browser/type', async (browser, body) => {
  await browser.typeInField(body.selector, body.text);
  return { success: true };
});

route('post', '/browser/extract-text', async (browser, body) => {
  const text = await browser.extractText(body.selector);
  return { text };
});

// ========== TEMPLATE ENDPOINTS ==========

app.get('/templates', (req, res) => {
  res.json({ templates: listTemplates() });
});

app.get('/templates/:type', (req, res) => {
  try {
    const template = getTemplate(req.params.type);
    res.json(template);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

route('post', '/templates/deploy', async (browser, body) => {
  const { type, dryRun } = body;
  const template = getTemplate(type);
  const apiKey = process.env.GHL_API_KEY;
  const ghl = new GHLClient(apiKey, locationId);

  const results = {
    template: template.name,
    type,
    dryRun: !!dryRun,
    steps: [],
    errors: [],
  };

  // 1. Pipeline (API)
  try {
    if (!dryRun) {
      const pipeline = await ghl.createPipeline({
        name: template.pipeline.name,
        stages: template.pipeline.stages,
      });
      results.steps.push({ step: 'pipeline', success: true, name: template.pipeline.name, id: pipeline.pipeline?.id });
    } else {
      results.steps.push({ step: 'pipeline', dryRun: true, name: template.pipeline.name });
    }
  } catch (e) {
    results.steps.push({ step: 'pipeline', success: false, error: e.message });
    results.errors.push(e.message);
  }

  // 2. Tags (API)
  let tagSuccess = 0;
  for (const tagName of template.tags) {
    try {
      if (!dryRun) await ghl.createTag(tagName);
      tagSuccess++;
    } catch (e) {
      // Ignore duplicate tag errors
      if (!e.message.includes('already') && !e.message.includes('422')) {
        results.errors.push(`Tag "${tagName}": ${e.message}`);
      } else {
        tagSuccess++;
      }
    }
  }
  results.steps.push({ step: 'tags', success: true, created: tagSuccess, total: template.tags.length });

  // 3. Custom Fields (API)
  let fieldSuccess = 0;
  for (const field of template.customFields) {
    try {
      if (!dryRun) await ghl.createCustomField(field);
      fieldSuccess++;
    } catch (e) {
      if (!e.message.includes('already') && !e.message.includes('422')) {
        results.errors.push(`Field "${field.name}": ${e.message}`);
      } else {
        fieldSuccess++;
      }
    }
  }
  results.steps.push({ step: 'customFields', success: true, created: fieldSuccess, total: template.customFields.length });

  // 4. Calendar (API)
  if (template.calendar) {
    try {
      if (!dryRun) {
        const cal = await ghl.createCalendar({
          name: template.calendar.name,
          description: template.calendar.description,
        });
        results.steps.push({ step: 'calendar', success: true, name: template.calendar.name, id: cal.calendar?.id });
      } else {
        results.steps.push({ step: 'calendar', dryRun: true, name: template.calendar.name });
      }
    } catch (e) {
      results.steps.push({ step: 'calendar', success: false, error: e.message });
      results.errors.push(e.message);
    }
  }

  // 5. Funnel (Browser - just report what's needed)
  results.steps.push({
    step: 'funnel',
    requiresBrowser: true,
    name: template.funnel.name,
    pages: template.funnel.pages,
    instruction: 'Use POST /browser/create-funnel to build',
  });

  // 6. Workflows (Browser - just report what's needed)
  results.steps.push({
    step: 'workflows',
    requiresBrowser: true,
    count: template.workflows.length,
    workflows: template.workflows.map(w => ({ name: w.name, trigger: w.trigger, actionCount: w.actions.length })),
    instruction: 'Use POST /browser/create-workflow for each',
  });

  return results;
});

// ========== CLEANUP ==========

app.post('/browser/close', async (req, res) => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
  res.json({ success: true, message: 'Browser closed' });
});

// ========== START ==========

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌐 GHL Browser Automation Server v1.0`);
  console.log(`   Local:     http://localhost:${PORT}`);
  console.log(`   Tailscale: http://100.82.186.108:${PORT}`);
  console.log(`   GHL Login: ${ghlEmail ? 'Configured' : '⚠️ GHL_LOGIN_EMAIL not set'}`);
  console.log(`   Location:  ${locationId}`);
  console.log(`   Endpoints: 15 browser automation tools\n`);
});
