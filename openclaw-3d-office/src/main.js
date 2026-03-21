import "./style.css";
import { OfficeScene } from "./scene/officeScene.js";
import { AgentController } from "./agents/agentController.js";
import { SimulationEngine } from "./sim/simulationEngine.js";
import { StatusPanel } from "./ui/statusPanel.js";
import { CommandCenterPanel } from "./ui/commandCenterPanel.js";
import { TeamDiagramPanel } from "./ui/teamDiagramPanel.js";
import { PresencePanel } from "./ui/presencePanel.js";
import { JoinModal } from "./collab/joinModal.js";
import { PresenceClient } from "./collab/presenceClient.js";
import { HumanAvatarController } from "./collab/humanAvatarController.js";
import { OpenClawAdapter } from "./integrations/openclawAdapter.js";
import {
  createCronJob,
  backfillUnifiedMemory,
  fetchClawbotAgents,
  fetchCronJobs,
  fetchProjectIndex,
  openProjectInEditor,
  openProjectInBrowser,
  fetchMemoryHealth,
  fetchSkillInfo,
  fetchSkillsCheck,
  fetchSkillsList,
  queryUnifiedMemory,
  runClawbotAgent,
} from "./api/clawbotClient.js";

const app = document.querySelector("#app");
app.innerHTML = `
  <div class="top-bar-wrap">
    <nav class="top-tabs">
      <button data-tab="office" class="active">Virtual Office</button>
      <button data-tab="command-center">Command Center</button>
    </nav>
    <a
      class="top-bar-tech-stack"
      href="https://esa-marketing-sales-dashboard.vercel.app/tech-stack.html"
      target="_blank"
      rel="noopener noreferrer"
    >Tech stack</a>
  </div>
  <section id="office-view" class="view active">
    <div id="scene-root"></div>
    <div id="hud-root"></div>
  </section>
  <section id="command-center-view" class="view">
    <div id="command-center-root"></div>
  </section>
`;

const sceneRoot = document.querySelector("#scene-root");
const hudRoot = document.querySelector("#hud-root");
const officeView = document.querySelector("#office-view");
const commandCenterView = document.querySelector("#command-center-view");
const tabButtons = Array.from(document.querySelectorAll(".top-tabs button"));
const commandCenterRoot = document.querySelector("#command-center-root");

const officeScene = new OfficeScene(sceneRoot);
const agentController = new AgentController(officeScene);
const simulation = new SimulationEngine(agentController, officeScene);
const openclawAdapter = new OpenClawAdapter();

const statusPanel = new StatusPanel({
  parent: hudRoot,
  onSetState: (agentId, state) =>
    simulation.setAgentState(agentId, state, { manual: true }),
  onCommand: (targetId, taskText) =>
    simulation.issueCommand(targetId, taskText, { source: "command-desk" }),
});
const teamDiagramPanel = new TeamDiagramPanel({ parent: officeView });

const presenceClient = new PresenceClient();
const humanAvatarController = new HumanAvatarController(officeScene);
let presencePanel = null;

function setupCollabUI() {
  if (presencePanel) return;
  const initialUsers = presenceClient.getLastUsers();
  presencePanel = new PresencePanel({
    parent: hudRoot,
    roomCode: presenceClient.getRoomCode(),
    userId: presenceClient.getUserId(),
    users: initialUsers,
    connected: true,
  });

  const myId = presenceClient.getUserId();
  for (const u of initialUsers) {
    if (u.id !== myId) humanAvatarController.addUser(u.id, u.name);
  }

  presenceClient.onPresence((users) => {
    const ids = new Set(users.map((u) => u.id));
    for (const id of [...humanAvatarController.avatars.keys()]) {
      if (!ids.has(id)) humanAvatarController.removeUser(id);
    }
    for (const u of users) {
      if (u.id !== myId) humanAvatarController.addUser(u.id, u.name);
    }
    presencePanel?.update({
      roomCode: presenceClient.getRoomCode(),
      userId: presenceClient.getUserId(),
      users,
      connected: true,
    });
  });

  presenceClient.onPosition(({ userId, x, y, z, yaw }) => {
    humanAvatarController.updatePosition(userId, x, y, z, yaw);
  });

  presenceClient.onConnectionChange((connected) => {
    presencePanel?.update({ connected });
  });
}

const joinModal = new JoinModal({
  onSubmit: async (opts) => {
    await presenceClient.join(opts.roomCode, opts.displayName);
    setupCollabUI();
  },
});

const commandCenterPanel = new CommandCenterPanel({
  parent: commandCenterRoot,
  onRunClawbot: async ({ command, agentId }) => {
    const targets =
      agentId === "all"
        ? configuredAgents.map((agent) => agent.id)
        : [agentId];

    if (targets.length === 0) {
      return {
        statusLine: "No configured agents available",
        responseText: "OpenClaw config returned no agents to run.",
      };
    }

    simulation.issueCommand(
      agentId === "all" ? "all" : agentId,
      `Clawbot run: ${command}`,
      { source: "command-center" }
    );

    const responses = [];
    for (const target of targets) {
      const result = await runClawbotAgent({ agentId: target, message: command });
      responses.push(`[${target}] ${result.responseText}`);
    }

    return {
      statusLine: `Completed on ${targets.length} agent${targets.length > 1 ? "s" : ""}`,
      responseText: responses.join("\n\n"),
    };
  },
  onOpenOffice: () => setActiveTab("office"),
  onCreateCronJob: async ({ name, agentId, every, message }) =>
    createCronJob({ name, agentId, every, message }),
  onRefreshCronJobs: async () => fetchCronJobs(),
  onRefreshSkills: async () => {
    const [summary, list] = await Promise.all([fetchSkillsCheck(), fetchSkillsList()]);
    return { summary, list };
  },
  onLoadSkillInfo: async (skillName) => fetchSkillInfo(skillName),
  onClearVictoriaTracker: () => simulation.clearVictoriaRequests(),
  onMemoryHealth: async () => fetchMemoryHealth(),
  onMemoryQuery: async (input) => queryUnifiedMemory(input),
  onMemoryBackfill: async (input) => backfillUnifiedMemory(input),
  onLoadProjects: async () => fetchProjectIndex(),
  onOpenProjectPath: async (projectPath) => openProjectInEditor(projectPath),
  onOpenProjectInBrowser: async (projectPath) => openProjectInBrowser(projectPath),
});

let configuredAgents = [];
const bootstrapAgentOptions = async () => {
  try {
    configuredAgents = await fetchClawbotAgents();
    commandCenterPanel.setAgentOptions(configuredAgents);
  } catch (error) {
    console.error(error);
  }
};

const bootstrapCronJobs = async () => {
  try {
    const jobs = await fetchCronJobs();
    commandCenterPanel.renderCronJobs?.(jobs);
  } catch (error) {
    console.error(error);
  }
};

const bootstrapSkills = async () => {
  try {
    const [summary, list] = await Promise.all([fetchSkillsCheck(), fetchSkillsList()]);
    commandCenterPanel.renderSkills?.({ summary, list });
  } catch (error) {
    console.error(error);
  }
};

const bootstrapMemoryHealth = async () => {
  try {
    const status = await fetchMemoryHealth();
    commandCenterPanel.renderMemoryHealth?.(status);
  } catch (error) {
    console.error(error);
  }
};

const setActiveTab = (tabId) => {
  const officeActive = tabId === "office";
  officeView.classList.toggle("active", officeActive);
  commandCenterView.classList.toggle("active", !officeActive);
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });
};

tabButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab));
});

simulation.start();
openclawAdapter.start();
void bootstrapAgentOptions();
void bootstrapCronJobs();
void bootstrapSkills();
void bootstrapMemoryHealth();

joinModal.show();

let lastTime = performance.now();
const loop = (time) => {
  const deltaSeconds = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;

  simulation.update(deltaSeconds);
  agentController.update(deltaSeconds);
  humanAvatarController.update(deltaSeconds);

  if (presenceClient.getRoomCode()) {
    const t = officeScene.controls.target;
    const cam = officeScene.camera;
    const yaw = Math.atan2(cam.position.x - t.x, cam.position.z - t.z);
    presenceClient.sendPosition(t.x, t.y, t.z, yaw);
  }

  officeScene.update(deltaSeconds);
  statusPanel.render({
    clock: simulation.getSimClock(),
    agents: agentController.getAgents(),
    messages: simulation.getMessages(),
  });
  teamDiagramPanel.render({
    agents: agentController.getAgents(),
  });
  commandCenterPanel.render({
    clock: simulation.getSimClock(),
    agents: agentController.getAgents(),
  });
  commandCenterPanel.renderVictoriaTracker?.(simulation.getVictoriaRequests());
  officeScene.render();

  requestAnimationFrame(loop);
};

requestAnimationFrame(loop);

window.addEventListener("resize", () => {
  officeScene.resize();
});
