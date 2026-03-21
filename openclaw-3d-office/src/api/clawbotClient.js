export const fetchClawbotAgents = async () => {
  const response = await fetch("/api/clawbot/agents");
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Failed to load agents");
  }
  return payload.agents;
};

export const runClawbotAgent = async ({ agentId, message }) => {
  const response = await fetch("/api/clawbot/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId, message }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || `Failed to run ${agentId}`);
  }
  return payload;
};

export const fetchCronJobs = async () => {
  const response = await fetch("/api/clawbot/cron/list");
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Failed to load cron jobs");
  }
  return payload.jobs;
};

export const createCronJob = async ({ agentId, name, every, message }) => {
  const response = await fetch("/api/clawbot/cron/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId, name, every, message }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Failed to create cron job");
  }
  return payload.jobs;
};

export const fetchSkillsList = async () => {
  const response = await fetch("/api/clawbot/skills/list");
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Failed to load skills");
  }
  return payload.skills;
};

export const fetchSkillsCheck = async () => {
  const response = await fetch("/api/clawbot/skills/check");
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Failed to check skills");
  }
  return payload.summary;
};

export const fetchSkillInfo = async (name) => {
  const response = await fetch(`/api/clawbot/skills/info?name=${encodeURIComponent(name)}`);
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || `Failed to load skill info for ${name}`);
  }
  return payload.info;
};

export const fetchMemoryHealth = async () => {
  const response = await fetch("/api/memory/health");
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Failed to load memory health");
  }
  return payload.status;
};

export const queryUnifiedMemory = async ({ question, department, client, timeWindowHours, topK = 8 }) => {
  const response = await fetch("/api/memory/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, department, client, timeWindowHours, topK }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Failed to query unified memory");
  }
  return payload.result;
};

export const backfillUnifiedMemory = async ({
  workspacePath,
  marketingUrl,
  salesUrl,
  commandCenterSnapshot,
}) => {
  const response = await fetch("/api/memory/ingest/backfill", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspacePath, marketingUrl, salesUrl, commandCenterSnapshot }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Failed to backfill unified memory");
  }
  return payload.result;
};

export const fetchProjectIndex = async () => {
  const response = await fetch("/api/projects/index");
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Failed to load project index");
  }
  return payload.projects;
};

export const openProjectInEditor = async (projectPath) => {
  const response = await fetch("/api/projects/open-cursor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectPath }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Failed to open project");
  }
  return payload.result;
};

export const openProjectInBrowser = async (projectPath) => {
  const response = await fetch("/api/projects/open-browser", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectPath }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Failed to open project in browser");
  }
  return payload.result;
};
