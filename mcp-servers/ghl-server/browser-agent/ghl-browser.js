/**
 * GHL Browser Automation Agent
 *
 * Handles GoHighLevel operations that require browser UI interaction:
 * - Funnel building (page builder, templates, sections)
 * - Workflow creation (visual workflow builder)
 * - Snapshot deployment (importing/exporting sub-accounts)
 * - Form building
 * - Automation setup
 * - QA testing of built systems
 *
 * Uses Playwright for headless Chrome automation.
 * Runs locally on Mac Studio - never exposes credentials.
 */

import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = resolve(__dirname, 'screenshots');
const SESSION_DIR = resolve(__dirname, 'sessions');

// Ensure directories exist
if (!existsSync(SCREENSHOTS_DIR)) mkdirSync(SCREENSHOTS_DIR, { recursive: true });
if (!existsSync(SESSION_DIR)) mkdirSync(SESSION_DIR, { recursive: true });

const GHL_BASE = 'https://app.gohighlevel.com';
const GHL_V2 = 'https://app.leadconnectorhq.com/v2';

export class GHLBrowser {
  constructor(options = {}) {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.locationId = options.locationId;
    this.email = options.email;
    this.password = options.password;
    this.headless = options.headless !== false; // default headless
    this.slowMo = options.slowMo || 50;
    this.sessionFile = resolve(SESSION_DIR, 'ghl-session.json');
  }

  // ========== LIFECYCLE ==========

  async launch() {
    this.browser = await chromium.launch({
      headless: this.headless,
      slowMo: this.slowMo,
    });

    // Try to restore session cookies
    const storageState = existsSync(this.sessionFile) ? this.sessionFile : undefined;

    this.context = await this.browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      storageState,
    });

    this.page = await this.context.newPage();

    // Set default timeouts
    this.page.setDefaultTimeout(30000);
    this.page.setDefaultNavigationTimeout(60000);

    return this;
  }

  async close() {
    // Save session before closing
    if (this.context) {
      try {
        await this.context.storageState({ path: this.sessionFile });
      } catch (e) {
        console.error('Could not save session:', e.message);
      }
    }
    if (this.browser) await this.browser.close();
  }

  async screenshot(name = 'screenshot') {
    const path = resolve(SCREENSHOTS_DIR, `${name}-${Date.now()}.png`);
    await this.page.screenshot({ path, fullPage: false });
    return path;
  }

  // ========== AUTH ==========

  async login() {
    if (!this.email || !this.password) {
      throw new Error('GHL email and password required for browser login');
    }

    // Check if already logged in by trying to navigate to dashboard
    await this.page.goto(`${GHL_V2}/location/${this.locationId}/dashboard`, { waitUntil: 'networkidle' });

    // If we're on the dashboard, we're already logged in
    if (this.page.url().includes('/dashboard') || this.page.url().includes('/location/')) {
      console.log('Already logged in (session restored)');
      return true;
    }

    // Navigate to login page
    await this.page.goto(`${GHL_BASE}/login`, { waitUntil: 'networkidle' });

    // Fill login form
    await this.page.fill('input[type="email"], input[name="email"]', this.email);
    await this.page.fill('input[type="password"], input[name="password"]', this.password);

    // Click login button
    await this.page.click('button[type="submit"], .login-btn, button:has-text("Sign In")');

    // Wait for navigation to dashboard
    await this.page.waitForURL('**/location/**', { timeout: 30000 });

    // Save session
    await this.context.storageState({ path: this.sessionFile });

    console.log('Login successful');
    return true;
  }

  async ensureLoggedIn() {
    const url = this.page.url();
    if (!url.includes('/location/') && !url.includes('/dashboard')) {
      await this.login();
    }
  }

  // ========== NAVIGATION ==========

  async goToDashboard() {
    await this.page.goto(`${GHL_V2}/location/${this.locationId}/dashboard`, { waitUntil: 'networkidle' });
    await this.ensureLoggedIn();
  }

  async goToFunnels() {
    await this.page.goto(`${GHL_V2}/location/${this.locationId}/funnels-websites`, { waitUntil: 'networkidle' });
    await this.ensureLoggedIn();
  }

  async goToWorkflows() {
    await this.page.goto(`${GHL_V2}/location/${this.locationId}/workflows`, { waitUntil: 'networkidle' });
    await this.ensureLoggedIn();
  }

  async goToAutomations() {
    await this.page.goto(`${GHL_V2}/location/${this.locationId}/automation`, { waitUntil: 'networkidle' });
    await this.ensureLoggedIn();
  }

  async goToForms() {
    await this.page.goto(`${GHL_V2}/location/${this.locationId}/form-builder`, { waitUntil: 'networkidle' });
    await this.ensureLoggedIn();
  }

  async goToCalendars() {
    await this.page.goto(`${GHL_V2}/location/${this.locationId}/calendars`, { waitUntil: 'networkidle' });
    await this.ensureLoggedIn();
  }

  async goToSettings() {
    await this.page.goto(`${GHL_V2}/location/${this.locationId}/settings`, { waitUntil: 'networkidle' });
    await this.ensureLoggedIn();
  }

  async goToSnapshots() {
    await this.page.goto(`${GHL_V2}/location/${this.locationId}/settings/snapshots`, { waitUntil: 'networkidle' });
    await this.ensureLoggedIn();
  }

  // ========== FUNNEL OPERATIONS ==========

  async createFunnel(name, type = 'website') {
    await this.goToFunnels();
    await this.page.waitForTimeout(2000);

    // Click "Create Funnel" or "+ New" button
    const createBtn = await this.page.$('button:has-text("New Funnel"), button:has-text("Create"), button:has-text("+ New"), .create-funnel-btn');
    if (createBtn) {
      await createBtn.click();
      await this.page.waitForTimeout(1000);
    }

    // Look for "Start from scratch" or blank template option
    const scratchBtn = await this.page.$('button:has-text("Start from Scratch"), .blank-template, button:has-text("Blank")');
    if (scratchBtn) {
      await scratchBtn.click();
      await this.page.waitForTimeout(1000);
    }

    // Enter funnel name
    const nameInput = await this.page.$('input[placeholder*="name"], input[placeholder*="Name"], .funnel-name-input');
    if (nameInput) {
      await nameInput.fill(name);
    }

    // Select funnel type if available
    if (type !== 'website') {
      const typeOption = await this.page.$(`[data-value="${type}"], button:has-text("${type}")`);
      if (typeOption) await typeOption.click();
    }

    // Confirm creation
    const confirmBtn = await this.page.$('button:has-text("Create"), button:has-text("Save"), button:has-text("Continue")');
    if (confirmBtn) {
      await confirmBtn.click();
      await this.page.waitForTimeout(3000);
    }

    const screenshotPath = await this.screenshot('funnel-created');
    return { success: true, name, screenshot: screenshotPath, url: this.page.url() };
  }

  async addFunnelPage(funnelId, pageName, pageType = 'landing') {
    // Navigate to the funnel
    await this.page.goto(`${GHL_V2}/location/${this.locationId}/funnels-websites/funnel/${funnelId}`, { waitUntil: 'networkidle' });
    await this.ensureLoggedIn();
    await this.page.waitForTimeout(2000);

    // Click "Add New Step" or "Add Page"
    const addBtn = await this.page.$('button:has-text("Add New Step"), button:has-text("Add Page"), button:has-text("+ Step"), .add-step-btn');
    if (addBtn) {
      await addBtn.click();
      await this.page.waitForTimeout(1000);
    }

    // Enter page name
    const nameInput = await this.page.$('input[placeholder*="name"], input[placeholder*="step"], .step-name-input');
    if (nameInput) {
      await nameInput.fill(pageName);
    }

    // Confirm
    const confirmBtn = await this.page.$('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
    if (confirmBtn) {
      await confirmBtn.click();
      await this.page.waitForTimeout(2000);
    }

    const screenshotPath = await this.screenshot('funnel-page-added');
    return { success: true, pageName, pageType, screenshot: screenshotPath };
  }

  // ========== WORKFLOW OPERATIONS ==========

  async createWorkflow(name, description = '') {
    await this.goToWorkflows();
    await this.page.waitForTimeout(2000);

    // Click "Create Workflow"
    const createBtn = await this.page.$('button:has-text("Create Workflow"), button:has-text("+ Create"), .create-workflow-btn');
    if (createBtn) {
      await createBtn.click();
      await this.page.waitForTimeout(1000);
    }

    // Look for "Start from Scratch"
    const scratchBtn = await this.page.$('button:has-text("Start from Scratch"), .blank-workflow, button:has-text("Blank")');
    if (scratchBtn) {
      await scratchBtn.click();
      await this.page.waitForTimeout(2000);
    }

    // Set workflow name (usually in a header/title field)
    const nameInput = await this.page.$('.workflow-name-input, input[placeholder*="workflow"], .wf-title-input, [contenteditable]:has-text("Untitled")');
    if (nameInput) {
      await nameInput.click();
      await this.page.keyboard.selectAll();
      await this.page.keyboard.type(name);
    }

    const screenshotPath = await this.screenshot('workflow-created');
    return { success: true, name, screenshot: screenshotPath, url: this.page.url() };
  }

  async addWorkflowTrigger(triggerType) {
    // Click the trigger node/plus button at the start
    const triggerBtn = await this.page.$('.workflow-trigger, .add-trigger, button:has-text("Add Trigger"), [data-type="trigger"]');
    if (triggerBtn) {
      await triggerBtn.click();
      await this.page.waitForTimeout(1000);
    }

    // Search for trigger type
    const searchInput = await this.page.$('input[placeholder*="search"], input[placeholder*="Search"], .trigger-search');
    if (searchInput) {
      await searchInput.fill(triggerType);
      await this.page.waitForTimeout(1000);
    }

    // Click the matching trigger
    const triggerOption = await this.page.$(`[data-trigger*="${triggerType}"], .trigger-item:has-text("${triggerType}")`);
    if (triggerOption) {
      await triggerOption.click();
      await this.page.waitForTimeout(1000);
    }

    // Save trigger
    const saveBtn = await this.page.$('button:has-text("Save"), button:has-text("Done"), button:has-text("Apply")');
    if (saveBtn) {
      await saveBtn.click();
      await this.page.waitForTimeout(1000);
    }

    const screenshotPath = await this.screenshot('workflow-trigger-added');
    return { success: true, triggerType, screenshot: screenshotPath };
  }

  async addWorkflowAction(actionType, config = {}) {
    // Click the "+" to add an action
    const addBtn = await this.page.$('.add-action, button:has-text("+ Add Action"), .wf-add-node, [data-action="add"]');
    if (addBtn) {
      await addBtn.click();
      await this.page.waitForTimeout(1000);
    }

    // Search for action type
    const searchInput = await this.page.$('input[placeholder*="search"], input[placeholder*="Search"], .action-search');
    if (searchInput) {
      await searchInput.fill(actionType);
      await this.page.waitForTimeout(1000);
    }

    // Click matching action
    const actionOption = await this.page.$(`[data-action*="${actionType}"], .action-item:has-text("${actionType}")`);
    if (actionOption) {
      await actionOption.click();
      await this.page.waitForTimeout(1000);
    }

    // Apply config if provided
    for (const [key, value] of Object.entries(config)) {
      const input = await this.page.$(`input[name="${key}"], [data-field="${key}"], input[placeholder*="${key}"]`);
      if (input) {
        await input.fill(String(value));
      }
    }

    // Save action
    const saveBtn = await this.page.$('button:has-text("Save"), button:has-text("Done"), button:has-text("Apply")');
    if (saveBtn) {
      await saveBtn.click();
      await this.page.waitForTimeout(1000);
    }

    const screenshotPath = await this.screenshot('workflow-action-added');
    return { success: true, actionType, screenshot: screenshotPath };
  }

  async publishWorkflow() {
    // Toggle workflow to published/active
    const publishBtn = await this.page.$('.publish-toggle, button:has-text("Publish"), .workflow-status-toggle, [data-action="publish"]');
    if (publishBtn) {
      await publishBtn.click();
      await this.page.waitForTimeout(2000);
    }

    // Confirm publish if dialog appears
    const confirmBtn = await this.page.$('button:has-text("Publish"), button:has-text("Confirm"), button:has-text("Yes")');
    if (confirmBtn) {
      await confirmBtn.click();
      await this.page.waitForTimeout(1000);
    }

    const screenshotPath = await this.screenshot('workflow-published');
    return { success: true, screenshot: screenshotPath };
  }

  // ========== SNAPSHOT OPERATIONS ==========

  async exportSnapshot(snapshotName) {
    await this.goToSnapshots();
    await this.page.waitForTimeout(2000);

    // Click "Create Snapshot" or "Export"
    const createBtn = await this.page.$('button:has-text("Create Snapshot"), button:has-text("Export"), .create-snapshot-btn');
    if (createBtn) {
      await createBtn.click();
      await this.page.waitForTimeout(1000);
    }

    // Enter snapshot name
    const nameInput = await this.page.$('input[placeholder*="name"], input[placeholder*="snapshot"], .snapshot-name-input');
    if (nameInput) {
      await nameInput.fill(snapshotName);
    }

    // Select all components or specific ones
    const selectAllBtn = await this.page.$('button:has-text("Select All"), .select-all-checkbox');
    if (selectAllBtn) {
      await selectAllBtn.click();
    }

    // Confirm export
    const confirmBtn = await this.page.$('button:has-text("Create"), button:has-text("Export"), button:has-text("Save")');
    if (confirmBtn) {
      await confirmBtn.click();
      await this.page.waitForTimeout(5000); // Snapshots take time
    }

    const screenshotPath = await this.screenshot('snapshot-exported');
    return { success: true, snapshotName, screenshot: screenshotPath };
  }

  async importSnapshot(snapshotShareLink) {
    // Navigate to snapshot import
    await this.page.goto(snapshotShareLink, { waitUntil: 'networkidle' });
    await this.page.waitForTimeout(3000);

    // Click "Import" or "Load Snapshot"
    const importBtn = await this.page.$('button:has-text("Import"), button:has-text("Load"), .import-snapshot-btn');
    if (importBtn) {
      await importBtn.click();
      await this.page.waitForTimeout(5000); // Import takes time
    }

    const screenshotPath = await this.screenshot('snapshot-imported');
    return { success: true, screenshot: screenshotPath };
  }

  // ========== FORM OPERATIONS ==========

  async createForm(name, fields = []) {
    await this.goToForms();
    await this.page.waitForTimeout(2000);

    // Click create form
    const createBtn = await this.page.$('button:has-text("Create Form"), button:has-text("+ New"), .create-form-btn');
    if (createBtn) {
      await createBtn.click();
      await this.page.waitForTimeout(1000);
    }

    // Choose blank/scratch
    const scratchBtn = await this.page.$('button:has-text("Start from Scratch"), button:has-text("Blank"), .blank-form');
    if (scratchBtn) {
      await scratchBtn.click();
      await this.page.waitForTimeout(2000);
    }

    // Set form name
    const nameInput = await this.page.$('.form-name-input, input[placeholder*="form name"], input[placeholder*="Form Name"]');
    if (nameInput) {
      await nameInput.fill(name);
    }

    const screenshotPath = await this.screenshot('form-created');
    return { success: true, name, screenshot: screenshotPath, url: this.page.url() };
  }

  // ========== AUTOMATION / SPEED-TO-LEAD ==========

  async createSpeedToLeadWorkflow(triggerSource = 'Form Submission', delaySeconds = 90) {
    // Create the workflow
    const wf = await this.createWorkflow(`Speed-to-Lead (${triggerSource})`);

    // Add trigger
    await this.addWorkflowTrigger(triggerSource);

    // Add wait action
    await this.addWorkflowAction('Wait', { delay: delaySeconds, unit: 'seconds' });

    // Add SMS action
    await this.addWorkflowAction('Send SMS', {
      message: 'Hey {{contact.first_name}}! Thanks for reaching out. We just received your inquiry and wanted to connect right away. What time works best for a quick call?',
    });

    // Add internal notification
    await this.addWorkflowAction('Internal Notification', {
      message: 'New lead from {{trigger.source}}: {{contact.full_name}} - {{contact.phone}}',
    });

    const screenshotPath = await this.screenshot('speed-to-lead-workflow');
    return {
      success: true,
      workflowName: `Speed-to-Lead (${triggerSource})`,
      screenshot: screenshotPath,
      steps: ['Trigger', 'Wait', 'Send SMS', 'Internal Notification'],
    };
  }

  // ========== NURTURE SEQUENCE ==========

  async createNurtureSequence(name, messages = []) {
    const wf = await this.createWorkflow(name);

    // Add trigger
    await this.addWorkflowTrigger('Tag Added');

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      // Add wait between messages
      if (i > 0) {
        await this.addWorkflowAction('Wait', {
          delay: msg.delayDays || 1,
          unit: 'days',
        });
      }

      // Add message action (SMS or Email)
      if (msg.type === 'email') {
        await this.addWorkflowAction('Send Email', {
          subject: msg.subject,
          body: msg.body,
        });
      } else {
        await this.addWorkflowAction('Send SMS', {
          message: msg.body,
        });
      }
    }

    const screenshotPath = await this.screenshot('nurture-sequence');
    return { success: true, name, messageCount: messages.length, screenshot: screenshotPath };
  }

  // ========== QA TESTING ==========

  async qaTestFunnel(funnelUrl) {
    await this.page.goto(funnelUrl, { waitUntil: 'networkidle' });
    await this.page.waitForTimeout(3000);

    const results = {
      url: funnelUrl,
      loadTime: null,
      hasForm: false,
      formFields: [],
      hasCalendar: false,
      hasCTA: false,
      ctaText: '',
      mobileResponsive: false,
      errors: [],
      screenshot: null,
    };

    // Check page load
    const timing = await this.page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return perf ? perf.loadEventEnd - perf.startTime : null;
    });
    results.loadTime = timing ? `${Math.round(timing)}ms` : 'unknown';

    // Check for form
    const forms = await this.page.$$('form');
    results.hasForm = forms.length > 0;
    if (results.hasForm) {
      const fields = await this.page.$$eval('input, select, textarea', (els) =>
        els.map((el) => ({ type: el.type, name: el.name, placeholder: el.placeholder }))
      );
      results.formFields = fields;
    }

    // Check for calendar widget
    const calendarEls = await this.page.$$('[class*="calendar"], [id*="calendar"], iframe[src*="calendar"]');
    results.hasCalendar = calendarEls.length > 0;

    // Check for CTA buttons
    const ctaEls = await this.page.$$('button, a.btn, .cta-button, [class*="cta"], a[href*="book"], a[href*="apply"]');
    results.hasCTA = ctaEls.length > 0;
    if (results.hasCTA && ctaEls[0]) {
      results.ctaText = await ctaEls[0].textContent() || '';
    }

    // Check mobile responsiveness
    await this.page.setViewportSize({ width: 375, height: 812 });
    await this.page.waitForTimeout(1000);
    const mobileScreenshot = await this.screenshot('qa-mobile');

    // Check for horizontal scroll (indicates responsiveness issues)
    const hasOverflow = await this.page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    results.mobileResponsive = !hasOverflow;

    // Reset viewport
    await this.page.setViewportSize({ width: 1440, height: 900 });
    await this.page.waitForTimeout(500);

    // Check console errors
    const consoleErrors = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await this.page.reload({ waitUntil: 'networkidle' });
    await this.page.waitForTimeout(2000);
    results.errors = consoleErrors;

    results.screenshot = await this.screenshot('qa-desktop');
    results.mobileScreenshot = mobileScreenshot;

    return results;
  }

  // ========== UTILITY ==========

  async waitForElement(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  async clickAndWait(selector, waitMs = 2000) {
    await this.page.click(selector);
    await this.page.waitForTimeout(waitMs);
  }

  async typeInField(selector, text) {
    await this.page.click(selector);
    await this.page.keyboard.selectAll();
    await this.page.keyboard.type(text);
  }

  async getCurrentUrl() {
    return this.page.url();
  }

  async getPageTitle() {
    return this.page.title();
  }

  async extractText(selector) {
    try {
      return await this.page.$eval(selector, (el) => el.textContent.trim());
    } catch {
      return null;
    }
  }
}
