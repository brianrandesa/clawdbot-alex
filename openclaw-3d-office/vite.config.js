import { defineConfig } from "vite";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const MEMORY_BASE_URL = process.env.ESA_MEMORY_BASE_URL || "http://127.0.0.1:8787";
const MEMORY_API_KEY = process.env.ESA_MEMORY_KEY || "";

const readJsonBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
};

const normalizeAgentResponse = (rawOutput) => {
  const parsed = JSON.parse(rawOutput);
  const payloads = parsed?.result?.payloads ?? parsed?.payloads ?? [];
  const firstText = payloads.find((item) => typeof item?.text === "string")?.text ?? "";
  return {
    raw: parsed,
    text: firstText || "No text response returned.",
  };
};

const runOpenClawAgent = async ({ agentId, message }) => {
  const args = ["openclaw", "agent", "--agent", agentId, "--message", message, "--json"];
  const { stdout, stderr } = await execFileAsync("npx", args, {
    cwd: process.cwd(),
    timeout: 180000,
    maxBuffer: 1024 * 1024 * 10,
  });
  if (stderr && stderr.trim()) {
    // Keep stderr available for troubleshooting while still returning stdout.
    console.warn(stderr.trim());
  }
  return normalizeAgentResponse(stdout);
};

const listCronJobs = async () => {
  const args = ["openclaw", "cron", "list", "--all", "--json"];
  const { stdout } = await execFileAsync("npx", args, {
    cwd: process.cwd(),
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 10,
  });
  const parsed = JSON.parse(stdout);
  return parsed?.jobs ?? [];
};

const addCronJob = async ({ agentId, name, every, message }) => {
  const args = [
    "openclaw",
    "cron",
    "add",
    "--agent",
    agentId,
    "--name",
    name,
    "--every",
    every,
    "--message",
    message,
    "--session",
    "isolated",
    "--no-deliver",
    "--json",
  ];
  const { stdout } = await execFileAsync("npx", args, {
    cwd: process.cwd(),
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 10,
  });
  return JSON.parse(stdout);
};

const listSkills = async () => {
  const args = ["openclaw", "skills", "list", "--json"];
  const { stdout } = await execFileAsync("npx", args, {
    cwd: process.cwd(),
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 20,
  });
  const parsed = JSON.parse(stdout);
  return parsed?.skills ?? [];
};

const checkSkills = async () => {
  const args = ["openclaw", "skills", "check", "--json"];
  const { stdout } = await execFileAsync("npx", args, {
    cwd: process.cwd(),
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 20,
  });
  return JSON.parse(stdout);
};

const skillInfo = async (name) => {
  const args = ["openclaw", "skills", "info", name, "--json"];
  const { stdout } = await execFileAsync("npx", args, {
    cwd: process.cwd(),
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 20,
  });
  return JSON.parse(stdout);
};

const loadConfiguredAgents = async () => {
  const configPath = path.join(os.homedir(), ".openclaw", "openclaw.json");
  const raw = await fs.readFile(configPath, "utf8");
  const config = JSON.parse(raw);
  const agents = config?.agents?.list ?? [];
  return agents.map((agent) => ({
    id: agent.id,
    name: agent.identity?.name || agent.name || agent.id,
  }));
};

const discoverWorkspaceProjects = async () => {
  const workspaceRoot = path.resolve(process.cwd(), "..");
  const entries = await fs.readdir(workspaceRoot, { withFileTypes: true });
  const projects = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;

    const projectPath = path.join(workspaceRoot, entry.name);
    let files = [];
    try {
      files = await fs.readdir(projectPath);
    } catch {
      continue;
    }

    const signalCursor =
      files.includes(".cursor") || files.includes(".cursorrules") || files.includes(".cursorignore");
    const signalClaude = files.some((name) => name.toLowerCase().includes("claude"));
    const signalOpenClaw =
      files.includes("openclaw.json") ||
      files.includes("AGENTS.md") ||
      entry.name.toLowerCase().includes("openclaw");

    const likelyProject =
      files.includes(".git") ||
      files.includes("package.json") ||
      files.includes("requirements.txt") ||
      files.includes("pyproject.toml") ||
      files.includes("README.md");

    if (!likelyProject && !signalCursor && !signalClaude && !signalOpenClaw) {
      continue;
    }

    const tags = [];
    if (signalCursor) tags.push("cursor");
    if (signalClaude) tags.push("claude");
    if (signalOpenClaw) tags.push("openclaw");
    if (tags.length === 0) tags.push("general");

    let liveUrl = "";
    if (entry.name === "openclaw-3d-office") {
      liveUrl = "http://localhost:4173/";
    } else if (entry.name === "esa-marketing-sales-dashboard") {
      liveUrl = "https://esa-marketing-sales-dashboard.vercel.app/";
    } else if (files.includes("vercel.json")) {
      liveUrl = `https://${entry.name}.vercel.app/`;
    }

    projects.push({
      id: entry.name,
      name: entry.name,
      path: projectPath,
      tags,
      liveUrl,
      hasGit: files.includes(".git"),
      hasPackageJson: files.includes("package.json"),
      hasReadme: files.includes("README.md"),
    });
  }

  projects.sort((a, b) => a.name.localeCompare(b.name));
  return projects;
};

const resolveWorkspaceProjectPath = (projectPathRaw) => {
  const workspaceRoot = path.resolve(process.cwd(), "..");
  const projectPath = path.resolve(String(projectPathRaw || ""));
  if (!projectPath.startsWith(workspaceRoot)) {
    throw new Error("Project path must stay inside workspace");
  }
  return projectPath;
};

const openWorkspaceProjectInCursor = async (projectPathRaw) => {
  const projectPath = resolveWorkspaceProjectPath(projectPathRaw);
  await execFileAsync("open", ["-a", "Cursor", projectPath], {
    cwd: process.cwd(),
    timeout: 20000,
  });
  return { path: projectPath };
};

const openWorkspaceProjectInBrowser = async (projectPathRaw) => {
  const projectPath = resolveWorkspaceProjectPath(projectPathRaw);
  const projectName = path.basename(projectPath);
  let browserTarget = "";
  if (projectName === "openclaw-3d-office") {
    browserTarget = "http://localhost:4173/";
  } else if (projectName === "esa-marketing-sales-dashboard") {
    browserTarget = "https://esa-marketing-sales-dashboard.vercel.app/";
  } else {
    try {
      await fs.access(path.join(projectPath, "vercel.json"));
      browserTarget = `https://${projectName}.vercel.app/`;
    } catch {
      browserTarget = `file://${projectPath}`;
    }
  }
  await execFileAsync("open", [browserTarget], {
    cwd: process.cwd(),
    timeout: 20000,
  });
  return { path: projectPath, browserTarget };
};

const requestMemoryService = async ({ pathName, method = "GET", body, role = "operator", actor = "command-center" }) => {
  const response = await fetch(`${MEMORY_BASE_URL}${pathName}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(MEMORY_API_KEY ? { "x-memory-key": MEMORY_API_KEY } : {}),
      "x-memory-role": role,
      "x-memory-actor": actor,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || `Memory service request failed (${response.status})`);
  }
  return payload;
};

const clawbotApiPlugin = () => ({
  name: "clawbot-api",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === "/api/clawbot/agents" && req.method === "GET") {
        try {
          const agents = await loadConfiguredAgents();
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, agents }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
        }
        return;
      }

      if (req.url === "/api/clawbot/run" && req.method === "POST") {
        try {
          const body = await readJsonBody(req);
          const message = String(body?.message || "").trim();
          const agentId = String(body?.agentId || "").trim();
          if (!message || !agentId) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: "agentId and message are required" }));
            return;
          }
          const result = await runOpenClawAgent({ agentId, message });
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              ok: true,
              agentId,
              responseText: result.text,
            })
          );
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
        }
        return;
      }

      if (req.url === "/api/clawbot/cron/list" && req.method === "GET") {
        try {
          const jobs = await listCronJobs();
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, jobs }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
        }
        return;
      }

      if (req.url === "/api/clawbot/cron/add" && req.method === "POST") {
        try {
          const body = await readJsonBody(req);
          const agentId = String(body?.agentId || "").trim();
          const name = String(body?.name || "").trim();
          const every = String(body?.every || "").trim();
          const message = String(body?.message || "").trim();
          if (!agentId || !name || !every || !message) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({ ok: false, error: "agentId, name, every, and message are required" })
            );
            return;
          }
          const result = await addCronJob({ agentId, name, every, message });
          const jobs = await listCronJobs();
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, result, jobs }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
        }
        return;
      }

      if (req.url === "/api/clawbot/skills/list" && req.method === "GET") {
        try {
          const skills = await listSkills();
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, skills }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
        }
        return;
      }

      if (req.url === "/api/clawbot/skills/check" && req.method === "GET") {
        try {
          const summary = await checkSkills();
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, summary }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
        }
        return;
      }

      if (req.url?.startsWith("/api/clawbot/skills/info") && req.method === "GET") {
        try {
          const url = new URL(req.url, "http://localhost");
          const name = String(url.searchParams.get("name") || "").trim();
          if (!name) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: "name query parameter is required" }));
            return;
          }
          const info = await skillInfo(name);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, info }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
        }
        return;
      }

      if (req.url === "/api/projects/index" && req.method === "GET") {
        try {
          const projects = await discoverWorkspaceProjects();
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, projects }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
        }
        return;
      }

      if (req.url === "/api/projects/open-cursor" && req.method === "POST") {
        try {
          const body = await readJsonBody(req);
          const projectPath = String(body?.projectPath || "").trim();
          if (!projectPath) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: "projectPath is required" }));
            return;
          }
          const result = await openWorkspaceProjectInCursor(projectPath);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, result }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
        }
        return;
      }

      if (req.url === "/api/projects/open-browser" && req.method === "POST") {
        try {
          const body = await readJsonBody(req);
          const projectPath = String(body?.projectPath || "").trim();
          if (!projectPath) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: "projectPath is required" }));
            return;
          }
          const result = await openWorkspaceProjectInBrowser(projectPath);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, result }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
        }
        return;
      }

      if (req.url === "/api/memory/health" && req.method === "GET") {
        try {
          const status = await requestMemoryService({
            pathName: "/health",
            method: "GET",
            role: "operator",
            actor: "command-center",
          });
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, status }));
        } catch (error) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              ok: true,
              status: {
                ok: false,
                mode: "offline",
                error: String(error?.message || error),
                checkedAt: new Date().toISOString(),
              },
            })
          );
        }
        return;
      }

      if (req.url === "/api/memory/query" && req.method === "POST") {
        try {
          const body = await readJsonBody(req);
          const result = await requestMemoryService({
            pathName: "/query",
            method: "POST",
            body,
            role: "operator",
            actor: "command-center",
          });
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, result }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
        }
        return;
      }

      if (req.url === "/api/memory/ingest/backfill" && req.method === "POST") {
        try {
          const body = await readJsonBody(req);
          const result = await requestMemoryService({
            pathName: "/ingest/backfill",
            method: "POST",
            body,
            role: "owner",
            actor: "command-center",
          });
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, result }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
        }
        return;
      }

      next();
    });
  },
});

export default defineConfig({
  plugins: [clawbotApiPlugin()],
});
