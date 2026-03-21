const DASHBOARD_KEYS = [
  { key: "marketing", label: "Marketing Dashboard" },
  { key: "sales", label: "Sales Dashboard" },
  { key: "fulfillment", label: "Fulfillment Dashboard" },
  { key: "esabuilder", label: "ESABuilder Dashboard" },
  { key: "ar", label: "A/R Dashboard" },
];

const DASHBOARD_STORAGE_KEY = "esa.commandCenter.dashboardLinks.v1";
const DEPARTMENT_STORAGE_KEY = "esa.commandCenter.departments.v1";
const BIG_ROCKS_STORAGE_KEY = "esa.commandCenter.bigRocks.v1";
const ORG_CHART_STORAGE_KEY = "esa.commandCenter.orgChart.v1";
const OPS_HISTORY_STORAGE_KEY = "esa.commandCenter.opsHistory.v1";
const SPRINT_OS_STORAGE_KEY = "esa.commandCenter.sprintOS.v1";
const VICTORIA_AUTOMATIONS_STORAGE_KEY = "esa.commandCenter.victoriaAutomations.v1";
const COST_CENTER_STORAGE_KEY = "esa.commandCenter.costCenter.v1";
const OPS_HISTORY_MAX = 300;
const SPRINT_STATUSES = ["todo", "in_progress", "blocked", "done"];
const SCORECARD_FIELDS = [
  { key: "bookedCalls", label: "Booked Calls" },
  { key: "showRate", label: "Show Rate %" },
  { key: "offersMade", label: "Offers Made" },
  { key: "contractsSent", label: "Contracts Sent" },
  { key: "cashCollected", label: "Cash Collected $" },
  { key: "arOutstanding", label: "AR Outstanding $" },
  { key: "callToCloseDays", label: "Days: Call -> Close" },
  { key: "fulfillmentCompletion", label: "Fulfillment %" },
];
const DEPARTMENT_KEYS = [
  { key: "tof_marketing", label: "TOF Marketing" },
  { key: "paid_marketing", label: "Paid Marketing" },
  { key: "sales", label: "Sales" },
  { key: "esa_ops", label: "ESA Ops" },
  { key: "ghl_ops", label: "GHL Ops" },
  { key: "dfy_fulfillment", label: "DFY Fulfillment" },
  { key: "dwy_fulfillment", label: "DWY Fulfillment" },
  { key: "finance", label: "Finance" },
  { key: "admin_hr", label: "Admin + HR" },
];
const DEFAULT_BIG_ROCKS = `BIG ROCKS - AI Optimization

- Focus on revenue-generating activities for every role
- Reduce dependency on manual workflows and bottlenecks
- Improve close speed from 14 days to under 3 days
- Strengthen client handoff from sales to fulfillment
- Build stronger finance visibility and forecasting`;

const DEFAULT_DEPARTMENT_NOTES = {
  tof_marketing: `- Brian IG
- Brian Podcast
- Brian LinkedIn`,
  paid_marketing: `- Marketing Dashboard
- Sam running Meta
- Brian shooting new ads and routing to Marketing
- New Sales Submission Form (Kim + P)
- Shah clean out GHL
- Tie revenue back to Dashboard + META`,
  sales: `- Sales Dashboard
- New pipeline system (B + D)
- Shah built sales tracking dashboard
- Structured day
- Task management
- People management
- Upload all closing Fathoms to Victoria to build sales framework
- Update Skool and move everyone over`,
  esa_ops: `- Scope of work for each client
- Internal comms between Marketing and Tech
- SOP utilization for tasks
- Do not post online until client approves
- Feedback loop with Victoria
- Client handover: sales -> fulfillment team
- Client follow-up
- 3 weekly calls: verify they align with business`,
  dwy_fulfillment: `- Zo managing client accounts
- How to use ESA Builder per client
- How clients are being communicated to
- Avoid unapproved changes in ESA Builder
- Proactivity of client strategy
- ESA Builder + Victoria Brain integration with Slack and client channels
- Focus on Shah handling internal builds
- Match landing design in ESA Builder Funnel 2`,
  dfy_fulfillment: `- New final dashboard form
- Rep dialing capacity by account
- Tap Rex for dashboard data pulls
- Victoria + Shah dialing/AI agent support for clients`,
  finance: `- Diamond and Kim review internal sales submission form
- Accurate accounts receivable tracking
- Sales rep commission sheets visibility
- DFY invoicing cadence
- Submission sheet validation
- Weekly finance meeting with a full agenda
- Recover 2 hours/day from Amit
- Track overspend and receivables
- Define what is necessary to hit $5M this year`,
  admin_hr: `- New team member onboarding
- Quarterly review system in place
- Clear role/responsibility definitions
- Determine needed vs unneeded roles
- Hiring priorities
- Talent pipeline and nurturing
- Employee directory
- Signed contracts for all employees`,
};
const DEFAULT_DASHBOARD_LINKS = {
  marketing: "https://esa-marketing-sales-dashboard.vercel.app",
  sales: "https://esa-marketing-sales-dashboard.vercel.app",
  fulfillment: "https://esabuilder.com",
  esabuilder: "https://esabuilder.com",
  ar: "https://app.gohighlevel.com/",
};
const DEFAULT_ORG_CHART = `Source: March Salary.xlsx + All Week Commission Sheet - GFPO.xlsx

ESA ORG CHART (Operations + DFY Ticket Sales)

Executive Leadership
- Brian Rand (CEO)
- Denise Brooks (COO)

Sales Leadership + Core Sales Ops
- Malachi Broadaway (Sales Lead)
- James Mungai (Sales Ops)
- Kimberly Ortega (Sales Assistant)

GHL / Delivery Support
- Shah Khan (GHL Lead)
- Hamza Akram (GHL Assistant)
- Jawad Hassan (GHL Assistant)
- Kim Pusa (Admin Assistant)

Marketing / Media Buying
- Muhammad Zohaib (Junior Media Buyer)
- Sohaib Iqbal (Junior Media Buyer)

DFY Ticket Sales Rep Team (from commission workbook history)
- Emanuela
- Jeff Dazer
- Jacob Dawson`;
const CURRENT_SALES_TEAM_BLOCK = `DFY Ticket Sales Rep Team (from commission workbook history)
- Emanuela
- Jeff Dazer
- Jacob Dawson`;
const DEFAULT_MEETING_INGEST_SAMPLE = `Paste Fathom transcript excerpt here. Then click "Ingest Meeting Notes" to auto-create draft tasks.

Tip: include owner names in each line when possible (Brian, Denise, Shah, Kim, Diamond, James).`;
const VICTORIA_AUTOMATION_PLAYBOOKS = [
  {
    id: "client_pulse",
    title: "Daily Client Pulse Digest",
    every: "24h",
    message:
      "Review all active client channels and produce a daily pulse digest: client health (green/yellow/red), blockers, owner, and next action. Escalate red-risk accounts immediately.",
  },
  {
    id: "sales_followup",
    title: "Sales Follow-Up Queue",
    every: "4h",
    message:
      "Build the follow-up queue from recent offers/contracts. Rank by close probability, include talk tracks, and suggest next message by owner.",
  },
  {
    id: "ar_nudges",
    title: "A/R Collections Nudges",
    every: "24h",
    message:
      "Audit outstanding receivables and draft prioritized nudge messages grouped by due bucket and account risk. Include owner and expected collection date.",
  },
  {
    id: "handoff_qa",
    title: "Sales -> Fulfillment Handoff QA",
    every: "12h",
    message:
      "Check new client handoffs for missing assets, unclear scope, or absent owner. Return QA report with pass/fail and fixes required.",
  },
  {
    id: "sop_drift",
    title: "SOP Drift Detector",
    every: "24h",
    message:
      "Compare current execution notes against SOPs and flag drift. Recommend specific updates for SOPs and a training action list by department.",
  },
];
const PROJECT_FILTER_TAGS = ["all", "cursor", "claude", "openclaw"];

const createDefaultSprintOS = () => ({
  scorecard: {
    bookedCalls: "",
    showRate: "",
    offersMade: "",
    contractsSent: "",
    cashCollected: "",
    arOutstanding: "",
    callToCloseDays: "",
    fulfillmentCompletion: "",
  },
  followUpPolicy: {
    nudgesBeforeEscalation: "10",
    responseSlaHours: "24",
    escalationOwner: "Denise",
    autoUpdateCadence: "Daily",
  },
  rocks: [
    {
      id: "rock-1",
      title: "Automate client updates and reduce reactive fire drills",
      owner: "Denise",
      due: "",
      status: "in_progress",
    },
    {
      id: "rock-2",
      title: "Shorten sales cycle from 14 days to <= 3 days",
      owner: "Brian",
      due: "",
      status: "todo",
    },
    {
      id: "rock-3",
      title: "Build finance visibility for AR, commissions, and overspend",
      owner: "Kim + Amit",
      due: "",
      status: "todo",
    },
  ],
  projects: [
    {
      id: "project-1",
      rockId: "rock-1",
      title: "Client daily update workflow (Victoria + Slack)",
      owner: "Shah",
      due: "",
      status: "in_progress",
    },
    {
      id: "project-2",
      rockId: "rock-2",
      title: "Call-to-close instrumentation and one-call-close playbook",
      owner: "Diamond",
      due: "",
      status: "todo",
    },
    {
      id: "project-3",
      rockId: "rock-3",
      title: "Submission validation + AR dashboard + weekly finance agenda",
      owner: "Kim",
      due: "",
      status: "todo",
    },
  ],
  tasks: [
    {
      id: "task-1",
      projectId: "project-1",
      title: "Define client update template and trigger rules",
      owner: "Denise",
      due: "",
      status: "todo",
      blocker: "",
      doneDefinition: "Template approved and used in one live client channel",
    },
    {
      id: "task-2",
      projectId: "project-2",
      title: "Add first-call-date field and close-date KPI",
      owner: "James",
      due: "",
      status: "todo",
      blocker: "",
      doneDefinition: "Metric visible in scorecard and updated daily",
    },
  ],
});

export class CommandCenterPanel {
  constructor({
    parent,
    onRunClawbot,
    onOpenOffice,
    onCreateCronJob,
    onRefreshCronJobs,
    onRefreshSkills,
    onLoadSkillInfo,
    onClearVictoriaTracker,
    onMemoryHealth,
    onMemoryQuery,
    onMemoryBackfill,
    onLoadProjects,
    onOpenProjectPath,
    onOpenProjectInBrowser,
  }) {
    this.onRunClawbot = onRunClawbot;
    this.onOpenOffice = onOpenOffice;
    this.onCreateCronJob = onCreateCronJob;
    this.onRefreshCronJobs = onRefreshCronJobs;
    this.onRefreshSkills = onRefreshSkills;
    this.onLoadSkillInfo = onLoadSkillInfo;
    this.onClearVictoriaTracker = onClearVictoriaTracker;
    this.onMemoryHealth = onMemoryHealth;
    this.onMemoryQuery = onMemoryQuery;
    this.onMemoryBackfill = onMemoryBackfill;
    this.onLoadProjects = onLoadProjects;
    this.onOpenProjectPath = onOpenProjectPath;
    this.onOpenProjectInBrowser = onOpenProjectInBrowser;

    this.root = document.createElement("div");
    this.root.className = "command-center";
    parent.appendChild(this.root);

    this.activePanel = "ceo-home";
    this.dashboardLinks = this.#loadDashboardLinks();
    this.departmentNotes = this.#loadDepartmentNotes();
    this.bigRocks = this.#loadBigRocks();
    this.orgChart = this.#loadOrgChart();
    this.opsHistory = this.#loadOpsHistory();
    this.sprintOS = this.#loadSprintOS();
    this.victoriaAutomations = this.#loadVictoriaAutomations();
    this.costEntries = this.#loadCostEntries();
    this.agentOptions = [];
    this.latestAgents = [];
    this.latestCronJobs = [];
    this.activeSessions = [];
    this.latestVictoriaRequests = [];
    this.showAdvancedNav = false;

    this.commandInputEl = null;
    this.agentSelectEl = null;
    this.statusLineEl = null;
    this.responseBoxEl = null;

    this.cronNameEl = null;
    this.cronEveryEl = null;
    this.cronMessageEl = null;
    this.cronAgentEl = null;
    this.cronListEl = null;

    this.skillsSummaryEl = null;
    this.skillsListEl = null;
    this.skillInfoEl = null;
    this.historyListEl = null;
    this.victoriaListEl = null;
    this.victoriaCountEl = null;
    this.lastVictoriaKey = "";
    this.scorecardGridEl = null;
    this.followUpPolicyEl = null;
    this.sprintRocksEl = null;
    this.sprintProjectsEl = null;
    this.sprintTasksEl = null;
    this.meetingIngestEl = null;
    this.meetingIngestStatusEl = null;
    this.marketingSyncStatusEl = null;
    this.memoryHealthEl = null;
    this.memoryQueryInputEl = null;
    this.memoryQueryResultEl = null;
    this.memoryDeptEl = null;
    this.memoryClientEl = null;
    this.memoryHoursEl = null;
    this.projectListEl = null;
    this.projectStatusEl = null;
    this.projectSearchEl = null;
    this.projectIndex = [];
    this.projectFilterTag = "all";
    this.agentRosterEl = null;
    this.missionTrackerEl = null;
    this.activeSessionsEl = null;
    this.cronDashboardEl = null;
    this.costCenterListEl = null;
    this.ceoSummaryEl = null;
    this.ceoTasksEl = null;
    this.ceoSessionsEl = null;
    this.ceoCostsEl = null;
    this.ceoBotsEl = null;
    this.sidebarAdvancedEl = null;
    this.sidebarToggleEl = null;

    this.metricsEls = {};
    this.#renderSkeleton();
    this.#bindEvents();
  }

  #loadDashboardLinks() {
    try {
      const raw = localStorage.getItem(DASHBOARD_STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : {};
      const merged = { ...DEFAULT_DASHBOARD_LINKS, ...saved };

      // Migrate older defaults to the new shared Sales/Marketing dashboard URL.
      if (merged.marketing === "https://event-sales-funnel.vercel.app") {
        merged.marketing = DEFAULT_DASHBOARD_LINKS.marketing;
      }
      if (merged.sales === "https://esabuilder.com") {
        merged.sales = DEFAULT_DASHBOARD_LINKS.sales;
      }
      return merged;
    } catch {
      return { ...DEFAULT_DASHBOARD_LINKS };
    }
  }

  #persistDashboardLinks() {
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(this.dashboardLinks));
  }

  #loadDepartmentNotes() {
    try {
      const raw = localStorage.getItem(DEPARTMENT_STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : {};
      // Migrate older keys to current department naming.
      if (saved?.paid_training && !saved.paid_marketing) {
        saved.paid_marketing = saved.paid_training;
      }
      if (saved?.egy_fulfillment && !saved.dwy_fulfillment) {
        saved.dwy_fulfillment = saved.egy_fulfillment;
      }
      return { ...saved };
    } catch {
      return {};
    }
  }

  #persistDepartmentNotes() {
    localStorage.setItem(DEPARTMENT_STORAGE_KEY, JSON.stringify(this.departmentNotes));
  }

  #loadBigRocks() {
    const saved = localStorage.getItem(BIG_ROCKS_STORAGE_KEY);
    return saved || DEFAULT_BIG_ROCKS;
  }

  #persistBigRocks() {
    localStorage.setItem(BIG_ROCKS_STORAGE_KEY, this.bigRocks);
  }

  #loadOrgChart() {
    const saved = localStorage.getItem(ORG_CHART_STORAGE_KEY);
    if (!saved || !saved.trim()) return DEFAULT_ORG_CHART;
    const normalized = saved.replace(
      /DFY Ticket Sales Rep Team \(from commission workbook history\)[\s\S]*$/m,
      CURRENT_SALES_TEAM_BLOCK
    );
    return normalized.trim() ? normalized : DEFAULT_ORG_CHART;
  }

  #persistOrgChart() {
    localStorage.setItem(ORG_CHART_STORAGE_KEY, this.orgChart);
  }

  #loadOpsHistory() {
    try {
      const raw = localStorage.getItem(OPS_HISTORY_STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : [];
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  #persistOpsHistory() {
    localStorage.setItem(OPS_HISTORY_STORAGE_KEY, JSON.stringify(this.opsHistory));
  }

  #loadSprintOS() {
    try {
      const raw = localStorage.getItem(SPRINT_OS_STORAGE_KEY);
      if (!raw) return createDefaultSprintOS();
      const saved = JSON.parse(raw);
      const fallback = createDefaultSprintOS();
      const merged = {
        scorecard: { ...fallback.scorecard, ...(saved?.scorecard || {}) },
        followUpPolicy: { ...fallback.followUpPolicy, ...(saved?.followUpPolicy || {}) },
        rocks: Array.isArray(saved?.rocks) ? saved.rocks : fallback.rocks,
        projects: Array.isArray(saved?.projects) ? saved.projects : fallback.projects,
        tasks: Array.isArray(saved?.tasks) ? saved.tasks : fallback.tasks,
      };
      return merged;
    } catch {
      return createDefaultSprintOS();
    }
  }

  #persistSprintOS() {
    localStorage.setItem(SPRINT_OS_STORAGE_KEY, JSON.stringify(this.sprintOS));
  }

  #loadVictoriaAutomations() {
    try {
      const raw = localStorage.getItem(VICTORIA_AUTOMATIONS_STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : {};
      const merged = {};
      VICTORIA_AUTOMATION_PLAYBOOKS.forEach((playbook) => {
        merged[playbook.id] = {
          every: saved?.[playbook.id]?.every || playbook.every,
          message: saved?.[playbook.id]?.message || playbook.message,
        };
      });
      return merged;
    } catch {
      const fallback = {};
      VICTORIA_AUTOMATION_PLAYBOOKS.forEach((playbook) => {
        fallback[playbook.id] = { every: playbook.every, message: playbook.message };
      });
      return fallback;
    }
  }

  #persistVictoriaAutomations() {
    localStorage.setItem(
      VICTORIA_AUTOMATIONS_STORAGE_KEY,
      JSON.stringify(this.victoriaAutomations || {})
    );
  }

  #loadCostEntries() {
    try {
      const raw = localStorage.getItem(COST_CENTER_STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : [];
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  #persistCostEntries() {
    localStorage.setItem(COST_CENTER_STORAGE_KEY, JSON.stringify(this.costEntries));
  }

  #startSession(label, kind = "agent") {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
      kind,
      state: "running",
      startedAt: new Date().toISOString(),
      endedAt: null,
    };
    this.activeSessions = [entry, ...this.activeSessions].slice(0, 80);
    this.#renderActiveSessions();
    return entry.id;
  }

  #endSession(sessionId, state = "completed") {
    this.activeSessions = this.activeSessions.map((session) =>
      session.id === sessionId
        ? { ...session, state, endedAt: new Date().toISOString() }
        : session
    );
    this.#renderActiveSessions();
  }

  #renderAgentRoster(agents) {
    if (!this.agentRosterEl) return;
    if (!Array.isArray(agents) || agents.length === 0) {
      this.agentRosterEl.innerHTML = `<div class="cc-history-empty">No agents detected.</div>`;
      return;
    }
    this.agentRosterEl.innerHTML = agents
      .map(
        (agent) => `<div class="cc-history-item">
          <strong>${this.#escapeHtml(agent.name)} (${this.#escapeHtml(agent.id)})</strong>
          <span>status: ${this.#escapeHtml(agent.status || "unknown")}</span>
          <em>${this.#escapeHtml(agent.task || "No active task")}</em>
        </div>`
      )
      .join("");
  }

  #renderMissionTracker() {
    if (!this.missionTrackerEl) return;
    const tasks = Array.isArray(this.sprintOS?.tasks) ? this.sprintOS.tasks : [];
    const top = tasks.slice(0, 80);
    if (top.length === 0) {
      this.missionTrackerEl.innerHTML = `<div class="cc-history-empty">No mission tasks yet.</div>`;
      return;
    }
    this.missionTrackerEl.innerHTML = top
      .map(
        (task) => `<div class="cc-history-item">
          <strong>${this.#escapeHtml(task.title || "Untitled task")}</strong>
          <span>owner: ${this.#escapeHtml(task.owner || "Unassigned")} · status: ${this.#escapeHtml(
            task.status || "todo"
          )} · due: ${this.#escapeHtml(task.due || "n/a")}</span>
          <em>${this.#escapeHtml(task.doneDefinition || "No done definition")}</em>
        </div>`
      )
      .join("");
  }

  #renderActiveSessions() {
    if (!this.activeSessionsEl) return;
    if (!this.activeSessions.length) {
      this.activeSessionsEl.innerHTML = `<div class="cc-history-empty">No active sessions.</div>`;
      return;
    }
    this.activeSessionsEl.innerHTML = this.activeSessions
      .slice(0, 60)
      .map((session) => {
        const started = new Date(session.startedAt).toLocaleTimeString();
        const ended = session.endedAt ? new Date(session.endedAt).toLocaleTimeString() : "running";
        return `<div class="cc-history-item">
          <strong>${this.#escapeHtml(session.label)}</strong>
          <span>state: ${this.#escapeHtml(session.state)} · type: ${this.#escapeHtml(session.kind)}</span>
          <em>${started} -> ${ended}</em>
        </div>`;
      })
      .join("");
  }

  #renderCronDashboard() {
    if (!this.cronDashboardEl) return;
    if (!Array.isArray(this.latestCronJobs) || this.latestCronJobs.length === 0) {
      this.cronDashboardEl.innerHTML = `<div class="cc-history-empty">No cron jobs loaded.</div>`;
      return;
    }
    this.cronDashboardEl.innerHTML = this.latestCronJobs
      .map((job) => {
        const schedule =
          job?.schedule?.kind === "cron" ? job.schedule.expr : job?.schedule?.every || "custom";
        const status = job.enabled ? "enabled" : "disabled";
        return `<div class="cc-history-item">
          <strong>${this.#escapeHtml(job.name || job.id || "cron-job")}</strong>
          <span>agent: ${this.#escapeHtml(job.agentId || "unknown")} · every: ${this.#escapeHtml(
            schedule
          )}</span>
          <em>${status}</em>
        </div>`;
      })
      .join("");
  }

  #renderCostCenter() {
    if (!this.costCenterListEl) return;
    const entries = Array.isArray(this.costEntries) ? this.costEntries : [];
    if (!entries.length) {
      this.costCenterListEl.innerHTML = `<div class="cc-history-empty">No cost entries yet.</div>`;
      return;
    }
    const grouped = {};
    entries.forEach((entry) => {
      const department = entry.department || "unassigned";
      grouped[department] = (grouped[department] || 0) + Number(entry.amount || 0);
    });
    const summary = Object.entries(grouped)
      .map(([department, total]) => `${department}: $${Number(total).toFixed(2)}`)
      .join(" · ");
    this.costCenterListEl.innerHTML = `
      <div class="cc-history-item"><strong>Department Totals</strong><span>${this.#escapeHtml(
        summary
      )}</span></div>
      ${entries
        .slice(0, 80)
        .map(
          (entry) => `<div class="cc-history-item">
            <strong>${this.#escapeHtml(entry.tool || "Unknown tool")} · $${Number(
            entry.amount || 0
          ).toFixed(2)}</strong>
            <span>${this.#escapeHtml(entry.department || "unassigned")} · ${this.#escapeHtml(
            entry.date || "n/a"
          )}</span>
            <em>${this.#escapeHtml(entry.note || "")}</em>
          </div>`
        )
        .join("")}
    `;
  }

  #renderCeoHome() {
    if (
      !this.ceoSummaryEl ||
      !this.ceoTasksEl ||
      !this.ceoSessionsEl ||
      !this.ceoCostsEl ||
      !this.ceoBotsEl
    ) {
      return;
    }

    const tasks = Array.isArray(this.sprintOS?.tasks) ? this.sprintOS.tasks : [];
    const openTasks = tasks.filter((task) => task.status !== "done").length;
    const blockedTasks = tasks.filter((task) => task.status === "blocked").length;
    const runningSessions = this.activeSessions.filter((session) => session.state === "running").length;
    const victoriaCount = this.latestVictoriaRequests.length;
    const cronEnabled = (this.latestCronJobs || []).filter((job) => job.enabled).length;
    const spendTotal = (this.costEntries || []).reduce(
      (sum, entry) => sum + Number(entry.amount || 0),
      0
    );

    this.ceoSummaryEl.innerHTML = `
      <div class="cc-history-item"><strong>Open Tasks</strong><span>${openTasks}</span></div>
      <div class="cc-history-item"><strong>Blocked Tasks</strong><span>${blockedTasks}</span></div>
      <div class="cc-history-item"><strong>Running Sessions</strong><span>${runningSessions}</span></div>
      <div class="cc-history-item"><strong>Victoria Requests</strong><span>${victoriaCount}</span></div>
      <div class="cc-history-item"><strong>Enabled Cron Jobs</strong><span>${cronEnabled}</span></div>
      <div class="cc-history-item"><strong>Tracked Spend</strong><span>$${spendTotal.toFixed(2)}</span></div>
    `;

    const priorityTasks = tasks
      .filter((task) => task.status !== "done")
      .slice(0, 5)
      .map(
        (task) => `<div class="cc-history-item">
          <strong>${this.#escapeHtml(task.title || "Untitled task")}</strong>
          <span>${this.#escapeHtml(task.owner || "Unassigned")} · ${this.#escapeHtml(
            task.status || "todo"
          )}</span>
        </div>`
      )
      .join("");
    this.ceoTasksEl.innerHTML =
      priorityTasks || `<div class="cc-history-empty">No open tasks right now.</div>`;

    const recentSessions = this.activeSessions
      .slice(0, 5)
      .map(
        (session) => `<div class="cc-history-item">
          <strong>${this.#escapeHtml(session.label)}</strong>
          <span>${this.#escapeHtml(session.state)} · ${this.#escapeHtml(session.kind)}</span>
        </div>`
      )
      .join("");
    this.ceoSessionsEl.innerHTML =
      recentSessions || `<div class="cc-history-empty">No recent sessions yet.</div>`;

    const recentCosts = (this.costEntries || [])
      .slice(0, 5)
      .map(
        (entry) => `<div class="cc-history-item">
          <strong>${this.#escapeHtml(entry.tool || "Unknown tool")} · $${Number(
            entry.amount || 0
          ).toFixed(2)}</strong>
          <span>${this.#escapeHtml(entry.department || "unassigned")} · ${this.#escapeHtml(
            entry.date || "n/a"
          )}</span>
        </div>`
      )
      .join("");
    this.ceoCostsEl.innerHTML =
      recentCosts || `<div class="cc-history-empty">No spend entries tracked yet.</div>`;

    const botHealth = this.#deriveBotHealth();
    this.ceoBotsEl.innerHTML = botHealth
      .map(
        (bot) => `<div class="cc-bot-health-row">
          <strong>${this.#escapeHtml(bot.name)}</strong>
          <span class="cc-bot-health-state">
            <i class="cc-bot-dot ${this.#botHealthDotClass(bot.level)}" aria-hidden="true"></i>
            ${this.#escapeHtml(bot.stateLabel)}
          </span>
        </div>`
      )
      .join("");
  }

  #botHealthDotClass(level) {
    if (level === "bad") return "is-red";
    if (level === "warn") return "is-amber";
    return "is-green";
  }

  #deriveBotHealth() {
    const configured = Array.isArray(this.agentOptions) ? this.agentOptions : [];
    const runtime = Array.isArray(this.latestAgents) ? this.latestAgents : [];
    const jobs = Array.isArray(this.latestCronJobs) ? this.latestCronJobs : [];

    const runtimeById = new Map(runtime.map((agent) => [String(agent.id || "").toLowerCase(), agent]));
    const jobsByAgent = new Map();
    jobs.forEach((job) => {
      const key = String(job?.agentId || "").toLowerCase();
      if (!key) return;
      const existing = jobsByAgent.get(key) || [];
      existing.push(job);
      jobsByAgent.set(key, existing);
    });

    const rows = configured.map((agent) => {
      const idKey = String(agent.id || "").toLowerCase();
      const runtimeAgent = runtimeById.get(idKey);
      const agentJobs = jobsByAgent.get(idKey) || [];
      const enabledJobs = agentJobs.filter((job) => job?.enabled !== false);
      const failingCrons = enabledJobs.filter((job) => {
        const status = String(job?.state?.lastRunStatus || job?.status || "").toLowerCase();
        return status === "error" || status === "failed";
      });
      const hasCronFailure = failingCrons.length > 0;

      const runtimeBad =
        runtimeAgent &&
        ["error", "failed", "offline"].includes(String(runtimeAgent.status || "").toLowerCase());

      let level = "ok";
      let stateLabel = "live";

      if (runtimeBad) {
        level = "bad";
        stateLabel = `issue: ${runtimeAgent.status || "runtime"}`;
      } else if (hasCronFailure) {
        level = "warn";
        const n = failingCrons.length;
        stateLabel =
          n === 1
            ? "watch: 1 cron job failed last run"
            : `watch: ${n} cron jobs failed last run`;
      }

      return {
        id: agent.id,
        name: agent.name || agent.id || "unknown",
        level,
        stateLabel,
      };
    });

    const rank = (row) => (row.level === "bad" ? 0 : row.level === "warn" ? 1 : 2);
    return rows.sort((a, b) => {
      const diff = rank(a) - rank(b);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });
  }

  #renderNavDensity() {
    if (!this.sidebarAdvancedEl || !this.sidebarToggleEl) return;
    this.sidebarAdvancedEl.classList.toggle("is-collapsed", !this.showAdvancedNav);
    this.sidebarToggleEl.textContent = this.showAdvancedNav ? "Hide Modules" : "More Modules";
  }

  #escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  #newId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  #statusOptions(selected) {
    return SPRINT_STATUSES.map(
      (status) => `<option value="${status}" ${status === selected ? "selected" : ""}>${status}</option>`
    ).join("");
  }

  #ownerFromLine(line) {
    const ownerMap = [
      "Brian",
      "Denise",
      "Shah",
      "Kim",
      "Diamond",
      "James",
      "Malachi",
      "Amit",
      "Victoria",
    ];
    const hit = ownerMap.find((name) => new RegExp(`\\b${name}\\b`, "i").test(line));
    return hit || "Unassigned";
  }

  #ingestMeetingNotes(rawText) {
    const lines = String(rawText || "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 12);
    const candidateLines = lines.filter((line) => {
      const startsWithBullet = /^[-*]\s+/.test(line);
      const hasActionVerb =
        /(build|create|update|fix|audit|review|add|connect|track|define|improve|automate|upload|validate)/i.test(
          line
        );
      const hasTeamSignal = /(Brian|Denise|Shah|Kim|Diamond|James|Victoria|sales|finance|ops|fulfillment)/i.test(
        line
      );
      return startsWithBullet || (hasActionVerb && hasTeamSignal);
    });
    const unique = [];
    const seen = new Set();
    candidateLines.forEach((line) => {
      const clean = line.replace(/^[-*]\s+/, "");
      const key = clean.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(clean);
      }
    });
    const createdTasks = unique.slice(0, 20).map((line) => ({
      id: this.#newId("task"),
      projectId: this.sprintOS.projects[0]?.id || "",
      title: line,
      owner: this.#ownerFromLine(line),
      due: "",
      status: "todo",
      blocker: "",
      doneDefinition: "Marked done by owner in Sprint OS",
    }));
    if (createdTasks.length === 0) return 0;
    this.sprintOS.tasks = [...createdTasks, ...this.sprintOS.tasks].slice(0, 220);
    this.#persistSprintOS();
    this.#renderSprintOS();
    return createdTasks.length;
  }

  #collectSprintFromDom() {
    if (!this.root) return;
    const next = createDefaultSprintOS();

    this.root.querySelectorAll("[data-sprint-scope='scorecard']").forEach((input) => {
      next.scorecard[input.dataset.field] = String(input.value || "").trim();
    });
    this.root.querySelectorAll("[data-sprint-scope='policy']").forEach((input) => {
      next.followUpPolicy[input.dataset.field] = String(input.value || "").trim();
    });

    const rocksById = new Map();
    this.root.querySelectorAll("[data-sprint-scope='rock']").forEach((node) => {
      const id = node.dataset.id;
      const field = node.dataset.field;
      const current = rocksById.get(id) || { id, title: "", owner: "", due: "", status: "todo" };
      current[field] = String(node.value || "").trim();
      rocksById.set(id, current);
    });
    next.rocks = Array.from(rocksById.values()).filter((rock) => rock.title);

    const projectsById = new Map();
    this.root.querySelectorAll("[data-sprint-scope='project']").forEach((node) => {
      const id = node.dataset.id;
      const field = node.dataset.field;
      const current = projectsById.get(id) || {
        id,
        rockId: "",
        title: "",
        owner: "",
        due: "",
        status: "todo",
      };
      current[field] = String(node.value || "").trim();
      projectsById.set(id, current);
    });
    next.projects = Array.from(projectsById.values()).filter((project) => project.title);

    const tasksById = new Map();
    this.root.querySelectorAll("[data-sprint-scope='task']").forEach((node) => {
      const id = node.dataset.id;
      const field = node.dataset.field;
      const current = tasksById.get(id) || {
        id,
        projectId: "",
        title: "",
        owner: "",
        due: "",
        status: "todo",
        blocker: "",
        doneDefinition: "",
      };
      current[field] = String(node.value || "").trim();
      tasksById.set(id, current);
    });
    next.tasks = Array.from(tasksById.values()).filter((task) => task.title);

    this.sprintOS = next;
  }

  #renderSprintOS() {
    if (!this.scorecardGridEl || !this.followUpPolicyEl || !this.sprintRocksEl) return;

    this.scorecardGridEl.innerHTML = SCORECARD_FIELDS.map(
      (field) => `<label class="cc-sprint-score">
        <span>${field.label}</span>
        <input data-sprint-scope="scorecard" data-field="${field.key}" type="text" value="${this.#escapeHtml(
          this.sprintOS.scorecard[field.key]
        )}" />
      </label>`
    ).join("");

    this.followUpPolicyEl.innerHTML = `
      <label class="cc-sprint-score">
        <span>Nudges Before Escalation</span>
        <input data-sprint-scope="policy" data-field="nudgesBeforeEscalation" type="number" min="1" value="${this.#escapeHtml(
          this.sprintOS.followUpPolicy.nudgesBeforeEscalation
        )}" />
      </label>
      <label class="cc-sprint-score">
        <span>Response SLA Hours</span>
        <input data-sprint-scope="policy" data-field="responseSlaHours" type="number" min="1" value="${this.#escapeHtml(
          this.sprintOS.followUpPolicy.responseSlaHours
        )}" />
      </label>
      <label class="cc-sprint-score">
        <span>Escalation Owner</span>
        <input data-sprint-scope="policy" data-field="escalationOwner" type="text" value="${this.#escapeHtml(
          this.sprintOS.followUpPolicy.escalationOwner
        )}" />
      </label>
      <label class="cc-sprint-score">
        <span>Auto Update Cadence</span>
        <input data-sprint-scope="policy" data-field="autoUpdateCadence" type="text" value="${this.#escapeHtml(
          this.sprintOS.followUpPolicy.autoUpdateCadence
        )}" />
      </label>
    `;

    const rockRows = this.sprintOS.rocks
      .map(
        (rock) => `<div class="cc-sprint-row">
          <input data-sprint-scope="rock" data-id="${rock.id}" data-field="title" type="text" value="${this.#escapeHtml(
            rock.title
          )}" />
          <input data-sprint-scope="rock" data-id="${rock.id}" data-field="owner" type="text" value="${this.#escapeHtml(
            rock.owner
          )}" />
          <input data-sprint-scope="rock" data-id="${rock.id}" data-field="due" type="date" value="${this.#escapeHtml(
            rock.due
          )}" />
          <select data-sprint-scope="rock" data-id="${rock.id}" data-field="status">
            ${this.#statusOptions(rock.status)}
          </select>
          <button data-action="delete-sprint-item" data-type="rock" data-id="${rock.id}">Delete</button>
        </div>`
      )
      .join("");
    this.sprintRocksEl.innerHTML = rockRows || `<div class="cc-history-empty">No rocks yet.</div>`;

    const projectRows = this.sprintOS.projects
      .map(
        (project) => `<div class="cc-sprint-row">
          <select data-sprint-scope="project" data-id="${project.id}" data-field="rockId">
            <option value="">No rock</option>
            ${this.sprintOS.rocks
              .map(
                (rock) =>
                  `<option value="${rock.id}" ${project.rockId === rock.id ? "selected" : ""}>${this.#escapeHtml(
                    rock.title || rock.id
                  )}</option>`
              )
              .join("")}
          </select>
          <input data-sprint-scope="project" data-id="${project.id}" data-field="title" type="text" value="${this.#escapeHtml(
            project.title
          )}" />
          <input data-sprint-scope="project" data-id="${project.id}" data-field="owner" type="text" value="${this.#escapeHtml(
            project.owner
          )}" />
          <input data-sprint-scope="project" data-id="${project.id}" data-field="due" type="date" value="${this.#escapeHtml(
            project.due
          )}" />
          <select data-sprint-scope="project" data-id="${project.id}" data-field="status">
            ${this.#statusOptions(project.status)}
          </select>
          <button data-action="delete-sprint-item" data-type="project" data-id="${project.id}">Delete</button>
        </div>`
      )
      .join("");
    this.sprintProjectsEl.innerHTML = projectRows || `<div class="cc-history-empty">No projects yet.</div>`;

    const taskRows = this.sprintOS.tasks
      .slice(0, 120)
      .map(
        (task) => `<div class="cc-sprint-row cc-sprint-row-task">
          <select data-sprint-scope="task" data-id="${task.id}" data-field="projectId">
            <option value="">No project</option>
            ${this.sprintOS.projects
              .map(
                (project) =>
                  `<option value="${project.id}" ${task.projectId === project.id ? "selected" : ""}>${this.#escapeHtml(
                    project.title || project.id
                  )}</option>`
              )
              .join("")}
          </select>
          <input data-sprint-scope="task" data-id="${task.id}" data-field="title" type="text" value="${this.#escapeHtml(
            task.title
          )}" />
          <input data-sprint-scope="task" data-id="${task.id}" data-field="owner" type="text" value="${this.#escapeHtml(
            task.owner
          )}" />
          <input data-sprint-scope="task" data-id="${task.id}" data-field="due" type="date" value="${this.#escapeHtml(
            task.due
          )}" />
          <select data-sprint-scope="task" data-id="${task.id}" data-field="status">
            ${this.#statusOptions(task.status)}
          </select>
          <input data-sprint-scope="task" data-id="${task.id}" data-field="blocker" type="text" placeholder="Blocker" value="${this.#escapeHtml(
            task.blocker
          )}" />
          <input data-sprint-scope="task" data-id="${task.id}" data-field="doneDefinition" type="text" placeholder="Done definition" value="${this.#escapeHtml(
            task.doneDefinition
          )}" />
          <button data-action="delete-sprint-item" data-type="task" data-id="${task.id}">Delete</button>
        </div>`
      )
      .join("");
    this.sprintTasksEl.innerHTML = taskRows || `<div class="cc-history-empty">No tasks yet.</div>`;
    if (!this.meetingIngestEl.value.trim()) {
      this.meetingIngestEl.value = DEFAULT_MEETING_INGEST_SAMPLE;
    }
  }

  #buildMarketingApiUrl() {
    const base = String(this.dashboardLinks?.marketing || "").trim();
    if (!base) return "";
    try {
      const parsed = new URL(base);
      parsed.pathname = "/api/data";
      parsed.search = "?range=30d";
      parsed.hash = "";
      return parsed.toString();
    } catch {
      return "";
    }
  }

  async #pullMarketingScorecard() {
    const apiUrl = this.#buildMarketingApiUrl();
    if (!apiUrl) {
      if (this.marketingSyncStatusEl) {
        this.marketingSyncStatusEl.textContent =
          "Set a valid Marketing Dashboard URL in Dashboards first.";
      }
      this.#addOpsHistory("pull-marketing-scorecard:failed", "Missing/invalid marketing URL");
      return;
    }

    if (this.marketingSyncStatusEl) {
      this.marketingSyncStatusEl.textContent = "Syncing from Marketing Dashboard...";
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const statusCounts = data?.statusCounts || {};

      this.sprintOS.scorecard.bookedCalls = String(
        statusCounts.booked ?? data?.bookedCalls ?? this.sprintOS.scorecard.bookedCalls
      );
      this.sprintOS.scorecard.showRate = String(
        data?.showRate ?? this.sprintOS.scorecard.showRate
      );
      this.sprintOS.scorecard.offersMade = String(
        statusCounts.offered ?? data?.offersMade ?? this.sprintOS.scorecard.offersMade
      );
      this.sprintOS.scorecard.contractsSent = String(
        statusCounts.contractSent ?? data?.contractsSent ?? this.sprintOS.scorecard.contractsSent
      );
      this.sprintOS.scorecard.cashCollected = String(
        data?.revenue ?? this.sprintOS.scorecard.cashCollected
      );

      this.#persistSprintOS();
      this.#renderSprintOS();
      if (this.marketingSyncStatusEl) {
        const fetchedAt = data?.fetchedAt ? new Date(data.fetchedAt).toLocaleString() : "now";
        this.marketingSyncStatusEl.textContent = `Synced from Marketing Dashboard (${fetchedAt}).`;
      }
      this.#addOpsHistory("pull-marketing-scorecard", apiUrl);
    } catch (error) {
      const message = String(error?.message || error);
      if (this.marketingSyncStatusEl) {
        this.marketingSyncStatusEl.textContent = `Sync failed: ${message}`;
      }
      this.#addOpsHistory("pull-marketing-scorecard:failed", message);
    }
  }

  async #refreshMemoryHealth() {
    if (!this.onMemoryHealth || !this.memoryHealthEl) return;
    this.memoryHealthEl.textContent = "Checking unified brain status...";
    try {
      const status = await this.onMemoryHealth();
      this.renderMemoryHealth(status);
      this.#addOpsHistory("memory-health", `${status?.mode || "unknown"} mode`);
    } catch (error) {
      this.memoryHealthEl.textContent = `Health check failed: ${String(error?.message || error)}`;
      this.#addOpsHistory("memory-health:failed", String(error?.message || error));
    }
  }

  renderMemoryHealth(status) {
    if (!this.memoryHealthEl) return;
    if (!status) {
      this.memoryHealthEl.textContent = "Unified brain status unavailable.";
      return;
    }
    const mode = status.mode || "unknown";
    const docs = status.documents ?? "--";
    const chunks = status.chunks ?? "--";
    const checkedAt = status.checkedAt ? new Date(status.checkedAt).toLocaleString() : "now";
    const sourceCount = status.sources ?? "--";
    const error = status.error ? ` | error: ${status.error}` : "";
    this.memoryHealthEl.textContent = `mode=${mode} | sources=${sourceCount} | docs=${docs} | chunks=${chunks} | checked=${checkedAt}${error}`;
  }

  async #runMemoryQuery() {
    if (!this.onMemoryQuery || !this.memoryQueryInputEl || !this.memoryQueryResultEl) return;
    const question = String(this.memoryQueryInputEl.value || "").trim();
    if (!question) {
      this.memoryQueryResultEl.textContent = "Ask a question to query unified brain.";
      return;
    }
    this.memoryQueryResultEl.textContent = "Querying unified brain...";
    try {
      const result = await this.onMemoryQuery({
        question,
        department: String(this.memoryDeptEl?.value || "").trim() || undefined,
        client: String(this.memoryClientEl?.value || "").trim() || undefined,
        timeWindowHours: Number(this.memoryHoursEl?.value || 0) || undefined,
        topK: 8,
      });
      const citations = Array.isArray(result?.citations) ? result.citations : [];
      const citationLines = citations
        .slice(0, 8)
        .map((item) => `- ${item.title} [${item.department}] (${item.source})`)
        .join("\n");
      this.memoryQueryResultEl.textContent = `${result?.answerContext || "No context returned."}\n\nCitations:\n${citationLines || "- none"}`;
      this.#addOpsHistory("memory-query", question.slice(0, 140));
    } catch (error) {
      this.memoryQueryResultEl.textContent = `Query failed: ${String(error?.message || error)}`;
      this.#addOpsHistory("memory-query:failed", String(error?.message || error));
    }
  }

  async #runMemoryBackfill() {
    if (!this.onMemoryBackfill || !this.memoryQueryResultEl) return;
    this.memoryQueryResultEl.textContent = "Running memory backfill...";
    try {
      const result = await this.onMemoryBackfill({
        workspacePath: "/Users/esai/.openclaw/workspace",
        marketingUrl: this.dashboardLinks.marketing,
        salesUrl: this.dashboardLinks.sales,
        commandCenterSnapshot: {
          capturedAt: new Date().toISOString(),
          sprintOS: this.sprintOS,
          departments: this.departmentNotes,
          bigRocks: this.bigRocks,
          orgChart: this.orgChart,
          opsHistory: this.opsHistory.slice(0, 100),
        },
      });
      this.memoryQueryResultEl.textContent = JSON.stringify(result, null, 2);
      this.#addOpsHistory("memory-backfill", "Unified brain ingestion triggered");
      await this.#refreshMemoryHealth();
    } catch (error) {
      this.memoryQueryResultEl.textContent = `Backfill failed: ${String(error?.message || error)}`;
      this.#addOpsHistory("memory-backfill:failed", String(error?.message || error));
    }
  }

  async #refreshProjectIndex() {
    if (!this.onLoadProjects || !this.projectListEl || !this.projectStatusEl) return;
    this.projectStatusEl.textContent = "Scanning workspace projects...";
    try {
      const projects = await this.onLoadProjects();
      this.renderProjectIndex(projects);
      this.projectStatusEl.textContent = `Loaded ${projects.length} projects`;
      this.#addOpsHistory("project-index:refresh", `${projects.length} projects`);
    } catch (error) {
      this.projectStatusEl.textContent = `Project scan failed: ${String(error?.message || error)}`;
      this.#addOpsHistory("project-index:failed", String(error?.message || error));
    }
  }

  renderProjectIndex(projects) {
    this.projectIndex = Array.isArray(projects) ? projects : [];
    this.#renderFilteredProjectIndex();
  }

  #renderFilteredProjectIndex() {
    if (!this.projectListEl) return;
    const term = String(this.projectSearchEl?.value || "").trim().toLowerCase();
    const items = this.projectIndex.filter((project) => {
      const tags = Array.isArray(project.tags) ? project.tags : [];
      const byTag =
        this.projectFilterTag === "all" ? true : tags.includes(this.projectFilterTag);
      if (!byTag) return false;
      if (!term) return true;
      const haystack = `${project.name || ""} ${project.path || ""} ${(tags || []).join(" ")}`.toLowerCase();
      return haystack.includes(term);
    });
    if (items.length === 0) {
      this.projectListEl.innerHTML = `<div class="cc-history-empty">No projects detected.</div>`;
      return;
    }
    this.projectListEl.innerHTML = items
      .map((project) => {
        const tags = Array.isArray(project.tags) ? project.tags : [];
        const tagHtml = tags.map((tag) => `<span class="cc-project-tag">${this.#escapeHtml(tag)}</span>`).join("");
        const projectPath = String(project.path || "");
        return `<div class="cc-project-item">
          <strong>${this.#escapeHtml(project.name)}</strong>
          <span>${this.#escapeHtml(projectPath)}</span>
          <span>${this.#escapeHtml(project.liveUrl || "No live URL detected")}</span>
          <div class="cc-project-actions">
            <button data-action="open-project-cursor" data-project-path="${this.#escapeHtml(
              projectPath
            )}">Open in Cursor</button>
            <button data-action="open-project-browser" data-project-path="${this.#escapeHtml(
              projectPath
            )}">Open Live</button>
            <button data-action="copy-project-path" data-project-path="${this.#escapeHtml(
              projectPath
            )}">Copy Path</button>
          </div>
          <div class="cc-project-tags">${tagHtml}</div>
        </div>`;
      })
      .join("");
  }

  #addOpsHistory(action, detail = "") {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: new Date().toISOString(),
      action,
      detail,
    };
    this.opsHistory = [entry, ...this.opsHistory].slice(0, OPS_HISTORY_MAX);
    this.#persistOpsHistory();
    this.#renderOpsHistory();
  }

  #renderOpsHistory() {
    if (!this.historyListEl) return;
    if (!Array.isArray(this.opsHistory) || this.opsHistory.length === 0) {
      this.historyListEl.innerHTML = `<div class="cc-history-empty">No command center actions logged yet.</div>`;
      return;
    }
    this.historyListEl.innerHTML = this.opsHistory
      .slice(0, 120)
      .map((entry) => {
        const label = new Date(entry.at).toLocaleString();
        const detail = entry.detail ? `<span>${entry.detail}</span>` : "";
        return `<div class="cc-history-item">
          <strong>${entry.action}</strong>
          ${detail}
          <em>${label}</em>
        </div>`;
      })
      .join("");
  }

  #dashboardCard({ key, label }) {
    const value = this.dashboardLinks[key] || "";
    return `
      <article class="cc-db-card">
        <h4>${label}</h4>
        <input data-role="dashboard-url" data-dashboard="${key}" type="url" placeholder="Paste dashboard URL" value="${value}" />
        <div class="cc-db-actions">
          <button data-action="save-dashboard" data-dashboard="${key}">Save URL</button>
          <button data-action="open-dashboard" data-dashboard="${key}" ${value ? "" : "disabled"}>Open</button>
        </div>
      </article>
    `;
  }

  #departmentCard({ key, label }) {
    const value = this.departmentNotes[key] || "";
    return `
      <article class="cc-dept-card">
        <h4>${label}</h4>
        <textarea data-role="dept-notes" data-department="${key}" rows="5" placeholder="Issues, projects, owner, next action...">${value}</textarea>
        <div class="cc-dept-actions">
          <button data-action="save-dept" data-department="${key}">Save</button>
        </div>
      </article>
    `;
  }

  #victoriaAutomationCard(playbook) {
    const state = this.victoriaAutomations?.[playbook.id] || {
      every: playbook.every,
      message: playbook.message,
    };
    return `
      <article class="cc-dept-card">
        <h4>${playbook.title}</h4>
        <div class="cc-cron-grid">
          <input data-role="victoria-every" data-playbook-id="${playbook.id}" type="text" value="${this.#escapeHtml(
            state.every
          )}" />
          <input data-role="victoria-name" data-playbook-id="${playbook.id}" type="text" value="${this.#escapeHtml(
            `Victoria - ${playbook.title}`
          )}" />
          <button data-action="run-victoria-playbook" data-playbook-id="${playbook.id}">Run Now</button>
        </div>
        <textarea data-role="victoria-message" data-playbook-id="${playbook.id}" rows="4">${this.#escapeHtml(
          state.message
        )}</textarea>
        <div class="cc-dept-actions">
          <button data-action="save-victoria-playbook" data-playbook-id="${playbook.id}">Save</button>
          <button data-action="create-victoria-playbook-cron" data-playbook-id="${playbook.id}">Create Cron</button>
        </div>
      </article>
    `;
  }

  #getVictoriaAgentId() {
    const options = Array.isArray(this.agentOptions) ? this.agentOptions : [];
    const victoria = options.find((agent) =>
      String(agent.id || "").toLowerCase().includes("victoria")
    );
    return victoria?.id || options[0]?.id || "victoria";
  }

  #renderSkeleton() {
    this.root.innerHTML = `
      <header class="cc-header">
        <div>
          <h2>ESA Command Center</h2>
          <p>Left-rail control center for ops, dashboards, and agent execution</p>
        </div>
        <div class="cc-header-actions">
          <a
            href="https://esa-marketing-sales-dashboard.vercel.app/tech-stack.html"
            target="_blank"
            rel="noopener noreferrer"
            class="cc-tech-stack-link"
          >Tech stack</a>
          <button data-action="open-office">Open Virtual Office</button>
        </div>
      </header>

      <div class="cc-builder-layout">
        <aside class="cc-sidebar">
          <div class="cc-sidebar-kpis">
            <div><span>Memory</span><strong data-metric="memory">--</strong></div>
            <div><span>CPU</span><strong data-metric="cpu">--</strong></div>
            <div><span>Active Agents</span><strong data-metric="agents">--</strong></div>
            <div><span>Open Tasks</span><strong data-metric="tasks">--</strong></div>
          </div>
          <button data-action="switch-panel" data-panel="ceo-home" class="active">CEO Home</button>
          <button data-action="switch-panel" data-panel="runner">Run Clawbot</button>
          <button data-action="switch-panel" data-panel="sprint">Sprint OS</button>
          <button data-action="switch-panel" data-panel="dashboards">Dashboards</button>
          <button data-action="switch-panel" data-panel="quick">Quick Actions</button>
          <button data-action="toggle-advanced-nav" data-role="advanced-nav-toggle">More Modules</button>
          <div class="cc-sidebar-group is-collapsed" data-role="advanced-nav">
            <button data-action="switch-panel" data-panel="org">Org Chart</button>
            <button data-action="switch-panel" data-panel="departments">Departments</button>
            <button data-action="switch-panel" data-panel="memory-browser">Memory Browser</button>
            <button data-action="switch-panel" data-panel="mission-tracker">Mission Tracker</button>
            <button data-action="switch-panel" data-panel="agent-roster">Agent Roster</button>
            <button data-action="switch-panel" data-panel="active-sessions">Active Sessions</button>
            <button data-action="switch-panel" data-panel="cron-dashboard">Cron Dashboard</button>
            <button data-action="switch-panel" data-panel="cost-center">Cost Center</button>
            <button data-action="switch-panel" data-panel="memory">Unified Brain</button>
            <button data-action="switch-panel" data-panel="projects">Project Index</button>
            <button data-action="switch-panel" data-panel="victoria-ops">Victoria Automations</button>
            <button data-action="switch-panel" data-panel="cron">Cron Jobs</button>
            <button data-action="switch-panel" data-panel="skills">Skills</button>
            <button data-action="switch-panel" data-panel="victoria">Victoria Tracker</button>
            <button data-action="switch-panel" data-panel="history">Ops History</button>
          </div>
        </aside>

        <section class="cc-content">
          <div class="cc-panel active" data-panel-view="ceo-home">
            <h3>CEO Home</h3>
            <p>Single-page company snapshot with direct navigation to deeper modules when needed.</p>
            <div class="cc-history-actions">
              <button data-action="switch-panel" data-panel="sprint">Open Sprint OS</button>
              <button data-action="switch-panel" data-panel="runner">Run Clawbot</button>
              <button data-action="switch-panel" data-panel="memory">Open Unified Brain</button>
            </div>
            <article class="cc-sprint-card cc-bot-health-sticky">
              <div class="cc-bot-health-header">
                <h4>Bot Health</h4>
                <button type="button" data-action="switch-panel" data-panel="cron-dashboard" class="cc-bot-health-link">
                  Cron detail
                </button>
              </div>
              <div class="cc-bot-health-list" data-role="ceo-bot-health"></div>
            </article>
            <article class="cc-sprint-card">
              <h4>Business Snapshot</h4>
              <div class="cc-db-grid" data-role="ceo-summary"></div>
            </article>
            <article class="cc-sprint-card">
              <h4>Priority Tasks</h4>
              <div class="cc-history-list" data-role="ceo-priority-tasks"></div>
            </article>
            <article class="cc-sprint-card">
              <h4>Recent Sessions</h4>
              <div class="cc-history-list" data-role="ceo-sessions"></div>
            </article>
            <article class="cc-sprint-card">
              <h4>Recent Spend Entries</h4>
              <div class="cc-history-list" data-role="ceo-costs"></div>
            </article>
          </div>

          <div class="cc-panel" data-panel-view="dashboards">
            <h3>Dashboard Wall</h3>
            <p>Store and launch your core company dashboards from one place.</p>
            <div class="cc-db-grid">
              ${DASHBOARD_KEYS.map((item) => this.#dashboardCard(item)).join("")}
            </div>
          </div>

          <div class="cc-panel" data-panel-view="sprint">
            <h3>Sprint OS (Execution Command)</h3>
            <p>Run Rocks -> Projects -> Tasks with one scorecard and meeting-to-action ingest.</p>
            <article class="cc-sprint-card">
              <h4>Company Scorecard</h4>
              <div class="cc-sprint-score-grid" data-role="scorecard-grid"></div>
              <div class="cc-sprint-actions">
                <button data-action="pull-marketing-scorecard">Pull from Marketing Dashboard</button>
                <span data-role="marketing-sync-status">Ready</span>
              </div>
            </article>
            <article class="cc-sprint-card">
              <h4>Client Follow-Up Policy</h4>
              <div class="cc-sprint-score-grid" data-role="followup-policy-grid"></div>
            </article>
            <article class="cc-sprint-card">
              <h4>Meeting Ingest (Fathom -> Draft Tasks)</h4>
              <textarea data-role="meeting-ingest" rows="6"></textarea>
              <div class="cc-sprint-actions">
                <button data-action="ingest-meeting-notes">Ingest Meeting Notes</button>
                <span data-role="meeting-ingest-status">Ready</span>
              </div>
            </article>
            <article class="cc-sprint-card">
              <div class="cc-sprint-heading">
                <h4>Big Rocks</h4>
                <button data-action="add-sprint-item" data-type="rock">+ Add Rock</button>
              </div>
              <div class="cc-sprint-labels">
                <span>Title</span><span>Owner</span><span>Due</span><span>Status</span><span></span>
              </div>
              <div data-role="sprint-rocks"></div>
            </article>
            <article class="cc-sprint-card">
              <div class="cc-sprint-heading">
                <h4>Projects</h4>
                <button data-action="add-sprint-item" data-type="project">+ Add Project</button>
              </div>
              <div class="cc-sprint-labels cc-sprint-labels-projects">
                <span>Rock</span><span>Project</span><span>Owner</span><span>Due</span><span>Status</span><span></span>
              </div>
              <div data-role="sprint-projects"></div>
            </article>
            <article class="cc-sprint-card">
              <div class="cc-sprint-heading">
                <h4>Tasks</h4>
                <button data-action="add-sprint-item" data-type="task">+ Add Task</button>
              </div>
              <div class="cc-sprint-labels cc-sprint-labels-tasks">
                <span>Project</span><span>Task</span><span>Owner</span><span>Due</span><span>Status</span><span>Blocker</span><span>Done Definition</span><span></span>
              </div>
              <div data-role="sprint-tasks"></div>
            </article>
            <div class="cc-sprint-actions">
              <button data-action="save-sprint-os">Save Sprint OS</button>
            </div>
          </div>

          <div class="cc-panel" data-panel-view="org">
            <h3>Company Org Chart</h3>
            <p>Live org chart for leadership, ops, and DFY ticket-sales reps.</p>
            <article class="cc-dept-card">
              <h4>Org Structure</h4>
              <textarea data-role="org-chart" rows="30">${this.orgChart}</textarea>
              <div class="cc-dept-actions">
                <button data-action="save-org-chart">Save Org Chart</button>
              </div>
            </article>
          </div>

          <div class="cc-panel" data-panel-view="departments">
            <h3>Department Ops Board</h3>
            <p>Capture active issues and projects by ESA department.</p>
            <article class="cc-big-rocks">
              <h4>Big Rocks (AI Optimization)</h4>
              <textarea data-role="big-rocks" rows="6">${this.bigRocks}</textarea>
              <div class="cc-dept-actions">
                <button data-action="save-big-rocks">Save Big Rocks</button>
              </div>
            </article>
            <div class="cc-dept-grid">
              ${DEPARTMENT_KEYS.map((item) => this.#departmentCard(item)).join("")}
            </div>
          </div>

          <div class="cc-panel" data-panel-view="runner">
            <h3>Run Clawbot</h3>
            <div class="cc-runner-row">
              <select data-role="clawbot-agent">
                <option value="all">All configured agents</option>
              </select>
            </div>
            <div class="cc-runner-row">
              <input data-role="clawbot-input" type="text" placeholder="ex: Build a campaign plan for this week" />
              <button data-action="run-clawbot">Run</button>
            </div>
            <p class="cc-status" data-role="status-line">Ready</p>
            <pre class="cc-response" data-role="response-box">No responses yet.</pre>
          </div>

          <div class="cc-panel" data-panel-view="memory-browser">
            <h3>Memory Browser</h3>
            <p>Browse what Unified Brain has ingested and inspect citations quickly.</p>
            <div class="cc-history-actions">
              <button data-action="switch-panel" data-panel="memory">Go to Unified Brain Query</button>
            </div>
            <div class="cc-history-list">
              <div class="cc-history-item">
                <strong>Use this with Unified Brain</strong>
                <span>Run a question in Unified Brain tab to inspect cited snippets and source context.</span>
              </div>
            </div>
          </div>

          <div class="cc-panel" data-panel-view="mission-tracker">
            <h3>Mission Tracker</h3>
            <p>Execution view of active Sprint tasks and ownership.</p>
            <div class="cc-history-list" data-role="mission-tracker-list"></div>
          </div>

          <div class="cc-panel" data-panel-view="agent-roster">
            <h3>Agent Roster</h3>
            <p>Live roster of all configured agents with status and task.</p>
            <div class="cc-history-list" data-role="agent-roster-list"></div>
          </div>

          <div class="cc-panel" data-panel-view="active-sessions">
            <h3>Active Sessions</h3>
            <p>Recent and in-progress command sessions from Command Center actions.</p>
            <div class="cc-history-list" data-role="active-sessions-list"></div>
          </div>

          <div class="cc-panel" data-panel-view="cron-dashboard">
            <h3>Cron Dashboard</h3>
            <p>Recurring automation jobs and schedules.</p>
            <div class="cc-history-list" data-role="cron-dashboard-list"></div>
          </div>

          <div class="cc-panel" data-panel-view="cost-center">
            <h3>Cost Center</h3>
            <p>Track AI/tool spend by department and maintain visibility on scaling costs.</p>
            <div class="cc-cron-grid">
              <input data-role="cost-tool" type="text" placeholder="Tool / vendor (e.g. OpenAI)" />
              <input data-role="cost-department" type="text" placeholder="Department" />
              <input data-role="cost-date" type="date" />
            </div>
            <div class="cc-cron-grid">
              <input data-role="cost-amount" type="number" step="0.01" placeholder="Amount USD" />
              <input data-role="cost-note" type="text" placeholder="Note" />
              <button data-action="add-cost-entry">Add Cost Entry</button>
            </div>
            <div class="cc-history-list" data-role="cost-center-list"></div>
          </div>

          <div class="cc-panel" data-panel-view="memory">
            <h3>Unified Brain</h3>
            <p>Single company memory for all ESA AI surfaces.</p>
            <div class="cc-history-actions">
              <button data-action="memory-refresh">Refresh Health</button>
              <button data-action="memory-backfill">Run Backfill</button>
            </div>
            <div class="cc-history-list">
              <div class="cc-history-item">
                <strong>Service Health</strong>
                <span data-role="memory-health">Not checked yet.</span>
              </div>
            </div>
            <article class="cc-dept-card" style="margin-top: 10px;">
              <h4>Query Unified Brain</h4>
              <div class="cc-cron-grid">
                <input data-role="memory-department" type="text" placeholder="Department (optional)" />
                <input data-role="memory-client" type="text" placeholder="Client (optional)" />
                <input data-role="memory-hours" type="number" min="1" placeholder="Hours window (optional)" />
              </div>
              <textarea data-role="memory-query-input" rows="2" placeholder="Ask ESA brain a question..."></textarea>
              <div class="cc-history-actions">
                <button data-action="memory-query">Run Query</button>
              </div>
              <pre class="cc-response" data-role="memory-query-result">No query run yet.</pre>
            </article>
          </div>

          <div class="cc-panel" data-panel-view="projects">
            <h3>All Projects Index</h3>
            <p>Workspace projects detected with Cursor, Claude, and OpenClaw signals.</p>
            <div class="cc-history-actions">
              <button data-action="refresh-projects">Refresh Project List</button>
              <span data-role="project-status">Ready</span>
            </div>
            <div class="cc-project-toolbar">
              <input data-role="project-search" type="text" placeholder="Search project name/path..." />
              <div class="cc-project-filter-buttons">
                ${PROJECT_FILTER_TAGS.map(
                  (tag) =>
                    `<button data-action="filter-projects" data-project-tag="${tag}" ${
                      tag === "all" ? "class=\"active\"" : ""
                    }>${tag}</button>`
                ).join("")}
              </div>
            </div>
            <div class="cc-project-list" data-role="project-list"></div>
          </div>

          <div class="cc-panel" data-panel-view="victoria-ops">
            <h3>Victoria Automations</h3>
            <p>Automate recurring work so Victoria helps run client success, sales, and ops daily.</p>
            <div class="cc-dept-grid">
              ${VICTORIA_AUTOMATION_PLAYBOOKS.map((playbook) =>
                this.#victoriaAutomationCard(playbook)
              ).join("")}
            </div>
          </div>

          <div class="cc-panel" data-panel-view="cron">
            <h3>Cron Jobs</h3>
            <div class="cc-cron-grid">
              <input data-role="cron-name" type="text" placeholder="Job name" />
              <select data-role="cron-agent"></select>
              <input data-role="cron-every" type="text" placeholder="Every (e.g. 30m, 2h)" />
            </div>
            <textarea data-role="cron-message" rows="2" placeholder="What should this cron job ask the agent to do?"></textarea>
            <div class="cc-cron-actions">
              <button data-action="add-cron">Add Cron Job</button>
              <button data-action="refresh-cron">Refresh Jobs</button>
            </div>
            <div class="cc-cron-list" data-role="cron-list">No cron jobs loaded.</div>
          </div>

          <div class="cc-panel" data-panel-view="skills">
            <h3>Skills Center</h3>
            <div class="cc-skills-summary" data-role="skills-summary">Loading skills summary...</div>
            <div class="cc-skills-layout">
              <div class="cc-skills-list" data-role="skills-list">No skills loaded.</div>
              <pre class="cc-skills-info" data-role="skills-info">Select a skill to inspect details.</pre>
            </div>
            <div class="cc-skills-actions">
              <button data-action="refresh-skills">Refresh Skills</button>
            </div>
          </div>

          <div class="cc-panel" data-panel-view="victoria">
            <h3>Victoria Tracker</h3>
            <p>Flow of all requests routed to Victoria.</p>
            <div class="cc-history-actions">
              <button data-action="clear-victoria">Clear Tracker</button>
            </div>
            <div class="cc-victoria-summary">
              <strong data-role="victoria-count">0</strong> tracked requests
            </div>
            <div class="cc-history-list" data-role="victoria-list"></div>
          </div>

          <div class="cc-panel" data-panel-view="history">
            <h3>Ops History</h3>
            <p>Timeline of command center actions and operator events.</p>
            <div class="cc-history-actions">
              <button data-action="clear-history">Clear History</button>
            </div>
            <div class="cc-history-list" data-role="history-list"></div>
          </div>

          <div class="cc-panel" data-panel-view="quick">
            <h3>Quick Actions</h3>
            <div class="cc-module-grid">
              <button data-action="preset" data-command="Check all agent status and return summary">Agent Roster</button>
              <button data-action="preset" data-command="Run mission tracker update for all active tasks">Mission Tracker</button>
              <button data-action="preset" data-command="Open whiteboard brainstorm with the team">Whiteboard Session</button>
              <button data-action="preset" data-command="Everyone meet Brian in the executive office for briefing">CEO Briefing</button>
            </div>
          </div>
        </section>
      </div>
    `;

    this.commandInputEl = this.root.querySelector("[data-role='clawbot-input']");
    this.agentSelectEl = this.root.querySelector("[data-role='clawbot-agent']");
    this.statusLineEl = this.root.querySelector("[data-role='status-line']");
    this.responseBoxEl = this.root.querySelector("[data-role='response-box']");

    this.metricsEls.memory = this.root.querySelector("[data-metric='memory']");
    this.metricsEls.cpu = this.root.querySelector("[data-metric='cpu']");
    this.metricsEls.agents = this.root.querySelector("[data-metric='agents']");
    this.metricsEls.tasks = this.root.querySelector("[data-metric='tasks']");

    this.cronNameEl = this.root.querySelector("[data-role='cron-name']");
    this.cronEveryEl = this.root.querySelector("[data-role='cron-every']");
    this.cronMessageEl = this.root.querySelector("[data-role='cron-message']");
    this.cronAgentEl = this.root.querySelector("[data-role='cron-agent']");
    this.cronListEl = this.root.querySelector("[data-role='cron-list']");

    this.skillsSummaryEl = this.root.querySelector("[data-role='skills-summary']");
    this.skillsListEl = this.root.querySelector("[data-role='skills-list']");
    this.skillInfoEl = this.root.querySelector("[data-role='skills-info']");
    this.historyListEl = this.root.querySelector("[data-role='history-list']");
    this.victoriaListEl = this.root.querySelector("[data-role='victoria-list']");
    this.victoriaCountEl = this.root.querySelector("[data-role='victoria-count']");
    this.scorecardGridEl = this.root.querySelector("[data-role='scorecard-grid']");
    this.followUpPolicyEl = this.root.querySelector("[data-role='followup-policy-grid']");
    this.sprintRocksEl = this.root.querySelector("[data-role='sprint-rocks']");
    this.sprintProjectsEl = this.root.querySelector("[data-role='sprint-projects']");
    this.sprintTasksEl = this.root.querySelector("[data-role='sprint-tasks']");
    this.meetingIngestEl = this.root.querySelector("[data-role='meeting-ingest']");
    this.meetingIngestStatusEl = this.root.querySelector("[data-role='meeting-ingest-status']");
    this.marketingSyncStatusEl = this.root.querySelector("[data-role='marketing-sync-status']");
    this.memoryHealthEl = this.root.querySelector("[data-role='memory-health']");
    this.memoryQueryInputEl = this.root.querySelector("[data-role='memory-query-input']");
    this.memoryQueryResultEl = this.root.querySelector("[data-role='memory-query-result']");
    this.memoryDeptEl = this.root.querySelector("[data-role='memory-department']");
    this.memoryClientEl = this.root.querySelector("[data-role='memory-client']");
    this.memoryHoursEl = this.root.querySelector("[data-role='memory-hours']");
    this.projectListEl = this.root.querySelector("[data-role='project-list']");
    this.projectStatusEl = this.root.querySelector("[data-role='project-status']");
    this.projectSearchEl = this.root.querySelector("[data-role='project-search']");
    this.agentRosterEl = this.root.querySelector("[data-role='agent-roster-list']");
    this.missionTrackerEl = this.root.querySelector("[data-role='mission-tracker-list']");
    this.activeSessionsEl = this.root.querySelector("[data-role='active-sessions-list']");
    this.cronDashboardEl = this.root.querySelector("[data-role='cron-dashboard-list']");
    this.costCenterListEl = this.root.querySelector("[data-role='cost-center-list']");
    this.ceoSummaryEl = this.root.querySelector("[data-role='ceo-summary']");
    this.ceoTasksEl = this.root.querySelector("[data-role='ceo-priority-tasks']");
    this.ceoSessionsEl = this.root.querySelector("[data-role='ceo-sessions']");
    this.ceoCostsEl = this.root.querySelector("[data-role='ceo-costs']");
    this.ceoBotsEl = this.root.querySelector("[data-role='ceo-bot-health']");
    this.sidebarAdvancedEl = this.root.querySelector("[data-role='advanced-nav']");
    this.sidebarToggleEl = this.root.querySelector("[data-role='advanced-nav-toggle']");
    if (this.meetingIngestEl) {
      this.meetingIngestEl.value = DEFAULT_MEETING_INGEST_SAMPLE;
    }
    this.#renderSprintOS();
    this.#renderOpsHistory();
    this.#renderMissionTracker();
    this.#renderActiveSessions();
    this.#renderCronDashboard();
    this.#renderCostCenter();
    this.#renderCeoHome();
    this.#renderNavDensity();
  }

  #switchPanel(panel) {
    this.activePanel = panel;
    const primaryPanels = new Set(["ceo-home", "runner", "sprint", "dashboards", "quick"]);
    if (!primaryPanels.has(panel)) {
      this.showAdvancedNav = true;
      this.#renderNavDensity();
    }
    this.root.querySelectorAll("[data-panel-view]").forEach((node) => {
      node.classList.toggle("active", node.dataset.panelView === panel);
    });
    this.root.querySelectorAll("[data-action='switch-panel']").forEach((node) => {
      node.classList.toggle("active", node.dataset.panel === panel);
    });
    if (panel === "sprint") {
      this.#renderSprintOS();
      void this.#pullMarketingScorecard();
    }
    if (panel === "memory") {
      void this.#refreshMemoryHealth();
    }
    if (panel === "projects") {
      void this.#refreshProjectIndex();
    }
    this.#addOpsHistory("switch-panel", panel);
  }

  #setStatus(message) {
    this.statusLineEl.textContent = message;
  }

  #setResponse(message) {
    this.responseBoxEl.textContent = message;
  }

  async #dispatchCommand(command) {
    const trimmed = command.trim();
    if (!trimmed) return;
    this.#addOpsHistory("run-clawbot:start", `${this.agentSelectEl.value} :: ${trimmed}`);
    const sessionId = this.#startSession(`Clawbot: ${trimmed.slice(0, 80)}`, "command");
    this.#setStatus(`Clawbot running: ${trimmed}`);
    this.#setResponse("Running...");
    try {
      const result = await this.onRunClawbot({
        command: trimmed,
        agentId: this.agentSelectEl.value,
      });
      this.#setStatus(result.statusLine);
      this.#setResponse(result.responseText);
      this.#addOpsHistory("run-clawbot:success", result.statusLine);
      this.#endSession(sessionId, "completed");
    } catch (error) {
      this.#setStatus("Run failed");
      this.#setResponse(String(error?.message || error));
      this.#addOpsHistory("run-clawbot:failed", String(error?.message || error));
      this.#endSession(sessionId, "failed");
    }
  }

  #renderDashboardButtons() {
    this.root.querySelectorAll("[data-role='dashboard-url']").forEach((input) => {
      const key = input.dataset.dashboard;
      const openButton = this.root.querySelector(
        `[data-action='open-dashboard'][data-dashboard='${key}']`
      );
      if (openButton) {
        openButton.disabled = !String(input.value || "").trim();
      }
    });
  }

  setAgentOptions(agents) {
    this.agentOptions = agents;
    const current = this.agentSelectEl.value || "all";
    const options = [
      `<option value="all">All configured agents</option>`,
      ...agents.map(
        (agent) => `<option value="${agent.id}">${agent.name} (${agent.id})</option>`
      ),
    ];
    this.agentSelectEl.innerHTML = options.join("");
    this.agentSelectEl.value = options.some((opt) => opt.includes(`value="${current}"`))
      ? current
      : "all";

    const cronCurrent = this.cronAgentEl.value || agents[0]?.id || "";
    const cronOptions = agents.map(
      (agent) => `<option value="${agent.id}">${agent.name} (${agent.id})</option>`
    );
    this.cronAgentEl.innerHTML = cronOptions.join("");
    if (cronOptions.length > 0) {
      this.cronAgentEl.value = cronOptions.some((opt) => opt.includes(`value="${cronCurrent}"`))
        ? cronCurrent
        : agents[0].id;
    }
    this.#renderCeoHome();
  }

  #bindEvents() {
    this.root.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const action = button.dataset.action;

      if (action === "switch-panel") {
        this.#switchPanel(button.dataset.panel);
        return;
      }
      if (action === "toggle-advanced-nav") {
        this.showAdvancedNav = !this.showAdvancedNav;
        this.#renderNavDensity();
        return;
      }
      if (action === "open-office") {
        this.#addOpsHistory("open-office", "Switched from command center to office");
        this.onOpenOffice();
        return;
      }
      if (action === "run-clawbot") {
        void this.#dispatchCommand(this.commandInputEl.value);
        return;
      }
      if (action === "preset") {
        void this.#dispatchCommand(button.dataset.command);
        return;
      }
      if (action === "add-cron") {
        void this.#dispatchCronCreate();
        return;
      }
      if (action === "refresh-cron") {
        void this.#refreshCronJobs();
        return;
      }
      if (action === "refresh-skills") {
        void this.#refreshSkills();
        return;
      }
      if (action === "skill-info") {
        this.#addOpsHistory("skill-info", button.dataset.skill || "");
        void this.#loadSkillInfo(button.dataset.skill);
        return;
      }
      if (action === "clear-history") {
        this.opsHistory = [];
        this.#persistOpsHistory();
        this.#renderOpsHistory();
        this.#addOpsHistory("history-cleared", "Ops history reset");
        return;
      }
      if (action === "clear-victoria") {
        this.onClearVictoriaTracker?.();
        this.#addOpsHistory("victoria-tracker-cleared", "Victoria request flow reset");
        return;
      }
      if (action === "save-sprint-os") {
        this.#collectSprintFromDom();
        this.#persistSprintOS();
        this.#renderSprintOS();
        this.#addOpsHistory("save-sprint-os", "Sprint OS updated");
        return;
      }
      if (action === "add-sprint-item") {
        const type = button.dataset.type;
        this.#collectSprintFromDom();
        if (type === "rock") {
          this.sprintOS.rocks.push({
            id: this.#newId("rock"),
            title: "",
            owner: "",
            due: "",
            status: "todo",
          });
        } else if (type === "project") {
          this.sprintOS.projects.push({
            id: this.#newId("project"),
            rockId: this.sprintOS.rocks[0]?.id || "",
            title: "",
            owner: "",
            due: "",
            status: "todo",
          });
        } else if (type === "task") {
          this.sprintOS.tasks.unshift({
            id: this.#newId("task"),
            projectId: this.sprintOS.projects[0]?.id || "",
            title: "",
            owner: "",
            due: "",
            status: "todo",
            blocker: "",
            doneDefinition: "",
          });
        }
        this.#persistSprintOS();
        this.#renderSprintOS();
        this.#addOpsHistory("add-sprint-item", type || "");
        return;
      }
      if (action === "delete-sprint-item") {
        const type = button.dataset.type;
        const id = button.dataset.id;
        this.#collectSprintFromDom();
        if (type === "rock") {
          this.sprintOS.rocks = this.sprintOS.rocks.filter((item) => item.id !== id);
          this.sprintOS.projects = this.sprintOS.projects.map((project) =>
            project.rockId === id ? { ...project, rockId: "" } : project
          );
        } else if (type === "project") {
          this.sprintOS.projects = this.sprintOS.projects.filter((item) => item.id !== id);
          this.sprintOS.tasks = this.sprintOS.tasks.map((task) =>
            task.projectId === id ? { ...task, projectId: "" } : task
          );
        } else if (type === "task") {
          this.sprintOS.tasks = this.sprintOS.tasks.filter((item) => item.id !== id);
        }
        this.#persistSprintOS();
        this.#renderSprintOS();
        this.#addOpsHistory("delete-sprint-item", `${type}:${id}`);
        return;
      }
      if (action === "ingest-meeting-notes") {
        const count = this.#ingestMeetingNotes(this.meetingIngestEl?.value || "");
        this.#persistSprintOS();
        this.#renderSprintOS();
        if (this.meetingIngestStatusEl) {
          this.meetingIngestStatusEl.textContent =
            count > 0 ? `Created ${count} draft task${count > 1 ? "s" : ""}` : "No actionable lines found";
        }
        this.#addOpsHistory("ingest-meeting-notes", `${count} tasks`);
        return;
      }
      if (action === "pull-marketing-scorecard") {
        void this.#pullMarketingScorecard();
        return;
      }
      if (action === "memory-refresh") {
        void this.#refreshMemoryHealth();
        return;
      }
      if (action === "memory-query") {
        void this.#runMemoryQuery();
        return;
      }
      if (action === "memory-backfill") {
        void this.#runMemoryBackfill();
        return;
      }
      if (action === "refresh-projects") {
        void this.#refreshProjectIndex();
        return;
      }
      if (action === "filter-projects") {
        this.projectFilterTag = String(button.dataset.projectTag || "all");
        this.root.querySelectorAll("[data-action='filter-projects']").forEach((node) => {
          node.classList.toggle("active", node.dataset.projectTag === this.projectFilterTag);
        });
        this.#renderFilteredProjectIndex();
        return;
      }
      if (action === "copy-project-path") {
        const projectPath = String(button.dataset.projectPath || "").trim();
        if (projectPath) {
          navigator.clipboard?.writeText(projectPath).catch(() => {});
          this.#addOpsHistory("project-index:copy-path", projectPath);
        }
        return;
      }
      if (action === "open-project-cursor") {
        const projectPath = String(button.dataset.projectPath || "").trim();
        if (!projectPath) return;
        if (!this.onOpenProjectPath) {
          this.projectStatusEl.textContent = "Open action unavailable.";
          return;
        }
        this.projectStatusEl.textContent = `Opening ${projectPath}...`;
        void this.onOpenProjectPath(projectPath)
          .then(() => {
            this.projectStatusEl.textContent = `Opened ${projectPath}`;
            this.#addOpsHistory("project-index:open-cursor", projectPath);
          })
          .catch((error) => {
            this.projectStatusEl.textContent = `Open failed: ${String(error?.message || error)}`;
            this.#addOpsHistory("project-index:open-cursor-failed", String(error?.message || error));
          });
        return;
      }
      if (action === "open-project-browser") {
        const projectPath = String(button.dataset.projectPath || "").trim();
        if (!projectPath) return;
        if (!this.onOpenProjectInBrowser) {
          this.projectStatusEl.textContent = "Browser open action unavailable.";
          return;
        }
        this.projectStatusEl.textContent = `Opening in browser: ${projectPath}...`;
        void this.onOpenProjectInBrowser(projectPath)
          .then((result) => {
            const target = result?.browserTarget || projectPath;
            this.projectStatusEl.textContent = `Opened live target: ${target}`;
            this.#addOpsHistory("project-index:open-browser", target);
          })
          .catch((error) => {
            this.projectStatusEl.textContent = `Open failed: ${String(error?.message || error)}`;
            this.#addOpsHistory("project-index:open-browser-failed", String(error?.message || error));
          });
        return;
      }
      if (action === "save-victoria-playbook") {
        const id = button.dataset.playbookId;
        const everyInput = this.root.querySelector(`[data-role='victoria-every'][data-playbook-id='${id}']`);
        const messageInput = this.root.querySelector(
          `[data-role='victoria-message'][data-playbook-id='${id}']`
        );
        this.victoriaAutomations[id] = {
          every: String(everyInput?.value || "24h").trim(),
          message: String(messageInput?.value || "").trim(),
        };
        this.#persistVictoriaAutomations();
        this.#addOpsHistory("victoria-playbook:saved", id || "");
        return;
      }
      if (action === "run-victoria-playbook") {
        const id = button.dataset.playbookId;
        const messageInput = this.root.querySelector(
          `[data-role='victoria-message'][data-playbook-id='${id}']`
        );
        const message = String(messageInput?.value || "").trim();
        const targetAgentId = this.#getVictoriaAgentId();
        this.agentSelectEl.value = targetAgentId;
        void this.#dispatchCommand(message || "Run Victoria automation playbook.");
        this.#addOpsHistory("victoria-playbook:run", `${id || ""} -> ${targetAgentId}`);
        return;
      }
      if (action === "create-victoria-playbook-cron") {
        const id = button.dataset.playbookId;
        const everyInput = this.root.querySelector(`[data-role='victoria-every'][data-playbook-id='${id}']`);
        const messageInput = this.root.querySelector(
          `[data-role='victoria-message'][data-playbook-id='${id}']`
        );
        const nameInput = this.root.querySelector(`[data-role='victoria-name'][data-playbook-id='${id}']`);
        const every = String(everyInput?.value || "24h").trim();
        const message = String(messageInput?.value || "").trim();
        const name = String(nameInput?.value || `Victoria - ${id}`).trim();
        const agentId = this.#getVictoriaAgentId();
        this.victoriaAutomations[id] = { every, message };
        this.#persistVictoriaAutomations();
        void this.onCreateCronJob({ name, agentId, every, message })
          .then((jobs) => {
            this.#renderCronList(jobs);
            this.#addOpsHistory("victoria-playbook:cron-created", `${id || ""} (${every})`);
          })
          .catch((error) => {
            this.#addOpsHistory(
              "victoria-playbook:cron-failed",
              String(error?.message || error)
            );
          });
        return;
      }
      if (action === "save-dashboard") {
        const key = button.dataset.dashboard;
        const input = this.root.querySelector(`[data-role='dashboard-url'][data-dashboard='${key}']`);
        this.dashboardLinks[key] = String(input?.value || "").trim();
        this.#persistDashboardLinks();
        this.#renderDashboardButtons();
        this.#addOpsHistory("save-dashboard", key);
        return;
      }
      if (action === "add-cost-entry") {
        const toolInput = this.root.querySelector("[data-role='cost-tool']");
        const deptInput = this.root.querySelector("[data-role='cost-department']");
        const dateInput = this.root.querySelector("[data-role='cost-date']");
        const amountInput = this.root.querySelector("[data-role='cost-amount']");
        const noteInput = this.root.querySelector("[data-role='cost-note']");
        const tool = String(toolInput?.value || "").trim();
        const department = String(deptInput?.value || "").trim();
        const date = String(dateInput?.value || "").trim();
        const amount = Number(amountInput?.value || 0);
        const note = String(noteInput?.value || "").trim();
        if (!tool || !department || !date || !Number.isFinite(amount) || amount <= 0) {
          this.#addOpsHistory("cost-center:add-failed", "Missing required cost entry fields");
          return;
        }
        this.costEntries = [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            tool,
            department,
            date,
            amount,
            note,
          },
          ...this.costEntries,
        ].slice(0, 300);
        this.#persistCostEntries();
        this.#renderCostCenter();
        this.#addOpsHistory("cost-center:add", `${tool} $${amount.toFixed(2)} (${department})`);
        if (amountInput) amountInput.value = "";
        if (noteInput) noteInput.value = "";
        return;
      }
      if (action === "save-dept") {
        const key = button.dataset.department;
        const input = this.root.querySelector(`[data-role='dept-notes'][data-department='${key}']`);
        this.departmentNotes[key] = String(input?.value || "").trim();
        this.#persistDepartmentNotes();
        this.#addOpsHistory("save-department", key);
        return;
      }
      if (action === "save-big-rocks") {
        const input = this.root.querySelector("[data-role='big-rocks']");
        this.bigRocks = String(input?.value || "").trim();
        this.#persistBigRocks();
        this.#addOpsHistory("save-big-rocks", "Updated AI optimization priorities");
        return;
      }
      if (action === "save-org-chart") {
        const input = this.root.querySelector("[data-role='org-chart']");
        this.orgChart = String(input?.value || "").trim();
        this.#persistOrgChart();
        this.#addOpsHistory("save-org-chart", "Org structure updated");
        return;
      }
      if (action === "open-dashboard") {
        const key = button.dataset.dashboard;
        const url = this.dashboardLinks[key];
        if (url) {
          this.#addOpsHistory("open-dashboard", `${key} -> ${url}`);
          window.open(url, "_blank", "noopener,noreferrer");
        }
      }
    });

    this.commandInputEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void this.#dispatchCommand(this.commandInputEl.value);
      }
    });

    this.root.querySelectorAll("[data-role='dashboard-url']").forEach((input) => {
      input.addEventListener("input", () => this.#renderDashboardButtons());
    });
    this.projectSearchEl?.addEventListener("input", () => this.#renderFilteredProjectIndex());
  }

  render({ agents, clock }) {
    this.latestAgents = Array.isArray(agents) ? agents : [];
    const workingCount = agents.filter((agent) => agent.status === "working").length;
    const activeCount = agents.filter((agent) => agent.status !== "idle").length;
    const cpu = Math.min(92, 18 + workingCount * 14);
    const memory = Math.min(95, 34 + activeCount * 9);
    const tasks = agents.filter(
      (agent) => agent.task && !agent.task.toLowerCase().includes("waiting")
    ).length;

    this.metricsEls.memory.textContent = `${memory}%`;
    this.metricsEls.cpu.textContent = `${cpu}%`;
    this.metricsEls.agents.textContent = `${activeCount}/${agents.length}`;
    this.metricsEls.tasks.textContent = `${tasks}`;

    if (clock < 2) {
      this.statusLineEl.textContent = "System check complete. Clawbot standing by.";
    }

    this.#renderAgentRoster(this.latestAgents);
    this.#renderMissionTracker();
    this.#renderActiveSessions();
    this.#renderCronDashboard();
    this.#renderCostCenter();
    this.#renderCeoHome();
  }

  renderVictoriaTracker(requests) {
    if (!this.victoriaListEl || !this.victoriaCountEl) return;
    const items = Array.isArray(requests) ? requests : [];
    this.latestVictoriaRequests = items;
    const nextKey = items.map((entry) => `${entry.id}:${entry.task}`).join("|");
    if (nextKey === this.lastVictoriaKey) return;
    this.lastVictoriaKey = nextKey;

    this.victoriaCountEl.textContent = String(items.length);
    if (items.length === 0) {
      this.victoriaListEl.innerHTML =
        `<div class="cc-history-empty">No requests to Victoria tracked yet.</div>`;
      return;
    }

    this.victoriaListEl.innerHTML = items
      .slice()
      .reverse()
      .map((entry) => {
        const source = entry.source || "command";
        return `<div class="cc-history-item">
          <strong>${source}</strong>
          <span>${entry.task}</span>
          <em>${entry.at} · target: ${entry.targetId}</em>
        </div>`;
      })
      .join("");
  }

  renderCronJobs(jobs) {
    this.latestCronJobs = Array.isArray(jobs) ? jobs : [];
    this.#renderCronList(jobs);
    this.#renderCronDashboard();
    this.#renderCeoHome();
  }

  renderSkills({ summary, list }) {
    const s = summary?.summary || summary || {};
    this.skillsSummaryEl.innerHTML = `
      <strong>${s.eligible ?? 0}</strong> eligible ·
      <strong>${s.total ?? list?.length ?? 0}</strong> total ·
      <strong>${s.missingRequirements ?? 0}</strong> missing requirements
    `;
    if (!Array.isArray(list) || list.length === 0) {
      this.skillsListEl.textContent = "No skills found.";
      return;
    }
    this.skillsListEl.innerHTML = list
      .slice(0, 100)
      .map((skill) => {
        const state = skill.eligible ? "ready" : "missing";
        return `<button data-action="skill-info" data-skill="${skill.name}" class="cc-skill-row">
          <span>${skill.name}</span>
          <em>${state}</em>
        </button>`;
      })
      .join("");
  }

  #renderCronList(jobs) {
    if (!Array.isArray(jobs) || jobs.length === 0) {
      this.cronListEl.textContent = "No cron jobs yet.";
      return;
    }
    this.cronListEl.innerHTML = jobs
      .map((job) => {
        const schedule =
          job?.schedule?.kind === "cron" ? job.schedule.expr : job?.schedule?.every || "custom";
        const status = job.enabled ? "enabled" : "disabled";
        return `<div class="cc-cron-item"><strong>${job.name || job.id}</strong><span>${job.agentId} • ${schedule} • ${status}</span></div>`;
      })
      .join("");
  }

  async #refreshCronJobs() {
    try {
      const jobs = await this.onRefreshCronJobs();
      this.#renderCronList(jobs);
      this.#addOpsHistory("refresh-cron", `${Array.isArray(jobs) ? jobs.length : 0} jobs`);
    } catch (error) {
      this.cronListEl.textContent = String(error?.message || error);
      this.#addOpsHistory("refresh-cron:failed", String(error?.message || error));
    }
  }

  async #refreshSkills() {
    try {
      const data = await this.onRefreshSkills();
      this.renderSkills(data);
      const total = data?.summary?.summary?.total ?? data?.summary?.total ?? data?.list?.length ?? 0;
      this.#addOpsHistory("refresh-skills", `${total} skills`);
    } catch (error) {
      this.skillsSummaryEl.textContent = String(error?.message || error);
      this.#addOpsHistory("refresh-skills:failed", String(error?.message || error));
    }
  }

  async #loadSkillInfo(skillName) {
    try {
      const info = await this.onLoadSkillInfo(skillName);
      this.skillInfoEl.textContent = JSON.stringify(info, null, 2);
      this.#addOpsHistory("skill-info:loaded", skillName);
    } catch (error) {
      this.skillInfoEl.textContent = String(error?.message || error);
      this.#addOpsHistory("skill-info:failed", `${skillName} :: ${String(error?.message || error)}`);
    }
  }

  async #dispatchCronCreate() {
    const name = this.cronNameEl.value.trim();
    const agentId = this.cronAgentEl.value;
    const every = this.cronEveryEl.value.trim();
    const message = this.cronMessageEl.value.trim();
    if (!name || !agentId || !every || !message) {
      this.#setStatus("Cron requires name, agent, every, and message");
      return;
    }
    this.#setStatus(`Creating cron: ${name}`);
    try {
      const jobs = await this.onCreateCronJob({ name, agentId, every, message });
      this.cronNameEl.value = "";
      this.cronEveryEl.value = "";
      this.cronMessageEl.value = "";
      this.#renderCronList(jobs);
      this.#setStatus(`Cron created: ${name}`);
      this.#addOpsHistory("create-cron", `${name} (${agentId} / ${every})`);
    } catch (error) {
      this.#setStatus("Cron create failed");
      this.cronListEl.textContent = String(error?.message || error);
      this.#addOpsHistory("create-cron:failed", `${name} :: ${String(error?.message || error)}`);
    }
  }
}
