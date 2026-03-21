const STATES = ["idle", "working", "meeting", "whiteboard", "executive", "fulfillment", "ticket_sales"];

const STATE_TO_ZONE = {
  idle: "lounge",
  working: "work",
  meeting: "meeting",
  whiteboard: "whiteboard",
  executive: "executive",
  fulfillment: "fulfillment",
  ticket_sales: "ticket_sales",
};

export class SimulationEngine {
  constructor(agentController, officeScene) {
    this.agentController = agentController;
    this.officeScene = officeScene;
    this.autopilot = false;
    this.simClockSeconds = 0;
    this.nextStateSwapAt = 2;
    this.messages = [
      {
        id: "system-command-only",
        from: "System",
        text: "Command-only mode active. Agents only move/respond when you message them.",
        at: new Date().toLocaleTimeString(),
      },
    ];
    this.maxMessages = 20;
    this.victoriaRequests = [];
    this.maxVictoriaRequests = 200;
  }

  start() {
    this.agentController.getAgents().forEach((agent) => {
      this.agentController.setTask(agent.id, "At desk and ready for command");
      this.agentController.setTarget(agent.id, agent.position, "working");
    });
  }

  setAutopilot(enabled) {
    this.autopilot = enabled;
  }

  getAutopilot() {
    return this.autopilot;
  }

  getSimClock() {
    return this.simClockSeconds;
  }

  setAgentState(agentId, state, options = {}) {
    if (options.manual === true) {
      this.autopilot = false;
    }
    const zone = STATE_TO_ZONE[state] ?? "transit";
    const target = options.target ?? this.officeScene.getRandomAnchor(zone);
    this.agentController.setTarget(agentId, target, state);
  }

  #assignDistributedTargets(recipients, state, task) {
    if (!Array.isArray(recipients) || recipients.length === 0) return;
    const zone = STATE_TO_ZONE[state] ?? "transit";
    const anchors = this.officeScene.getZoneAnchors(zone);
    if (anchors.length === 0) {
      recipients.forEach((agent) => {
        this.agentController.setTask(agent.id, task);
        this.setAgentState(agent.id, state, { manual: true });
      });
      return;
    }

    const used = new Set();
    recipients.forEach((agent) => {
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      anchors.forEach((anchor, index) => {
        if (used.has(index)) return;
        const distance = anchor.distanceTo(agent.position);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      used.add(bestIndex);
      const assignedAnchor = anchors[bestIndex].clone();
      const jitter = 0.06;
      assignedAnchor.x += (Math.random() - 0.5) * jitter;
      assignedAnchor.z += (Math.random() - 0.5) * jitter;

      this.agentController.setTask(agent.id, task);
      this.setAgentState(agent.id, state, { manual: true, target: assignedAnchor });
    });
  }

  #pushMessage(from, text) {
    this.messages.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      from,
      text,
      at: new Date().toLocaleTimeString(),
    });
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  getMessages() {
    return [...this.messages];
  }

  getVictoriaRequests() {
    return [...this.victoriaRequests];
  }

  clearVictoriaRequests() {
    this.victoriaRequests = [];
  }

  #trackVictoriaRequest({ task, targetId, source }) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      at: new Date().toLocaleTimeString(),
      task,
      targetId,
      source: source || "command",
    };
    this.victoriaRequests.push(entry);
    if (this.victoriaRequests.length > this.maxVictoriaRequests) {
      this.victoriaRequests = this.victoriaRequests.slice(-this.maxVictoriaRequests);
    }
  }

  #stateFromTask(task) {
    const normalized = task.toLowerCase();
    if (
      normalized.includes("ceo") ||
      normalized.includes("brian") ||
      normalized.includes("executive") ||
      normalized.includes("office")
    ) {
      return "executive";
    }
    if (
      normalized.includes("whiteboard") ||
      normalized.includes("brainstorm") ||
      normalized.includes("plan on board") ||
      normalized.includes("map this out")
    ) {
      return "whiteboard";
    }
    if (
      normalized.includes("fulfillment") ||
      normalized.includes("client fulfillment") ||
      normalized.includes("internal team") ||
      normalized.includes("denise office")
    ) {
      return "fulfillment";
    }
    if (
      normalized.includes("meeting") ||
      normalized.includes("call") ||
      normalized.includes("sync") ||
      normalized.includes("discuss")
    ) {
      return "meeting";
    }
    if (
      normalized.includes("tix sales") ||
      normalized.includes("ticket sales") ||
      normalized.includes("ticket team") ||
      normalized.includes("sales pit")
    ) {
      return "ticket_sales";
    }
    if (
      normalized.includes("break") ||
      normalized.includes("idle") ||
      normalized.includes("pause") ||
      normalized.includes("wait")
    ) {
      return "idle";
    }
    return "working";
  }

  issueCommand(targetId, taskText, meta = {}) {
    const task = taskText.trim();
    if (!task) return;

    this.autopilot = false;
    this.#pushMessage("You", task);

    const directToVictoria = String(targetId || "")
      .toLowerCase()
      .includes("victoria");
    const mentionsVictoria = task.toLowerCase().includes("victoria");
    if (directToVictoria || mentionsVictoria) {
      this.#trackVictoriaRequest({
        task,
        targetId,
        source: meta.source || "command",
      });
    }

    const agents = this.agentController.getAgents();
    const recipients =
      targetId === "all"
        ? agents
        : agents.filter((agent) => agent.id === targetId);

    const targetState = this.#stateFromTask(task);
    this.#assignDistributedTargets(recipients, targetState, task);
    recipients.forEach((agent) => {
      this.#pushMessage(agent.name, `On it. Working on: ${task}`);
    });
  }

  #randomNextState(currentState) {
    const choices = STATES.filter((value) => value !== currentState);
    return choices[Math.floor(Math.random() * choices.length)];
  }

  #runAutopilotTick() {
    const agents = this.agentController.getAgents();
    const pick = agents[Math.floor(Math.random() * agents.length)];
    if (!pick) return;
    const newState = this.#randomNextState(pick.status);
    const autoTask =
      newState === "meeting"
        ? "Team sync in progress"
        : newState === "executive"
        ? "Executive briefing in Brian's office"
        : newState === "whiteboard"
        ? "Whiteboard planning session"
        : newState === "idle"
        ? "Waiting for next task"
        : "Executing queued work";
    this.agentController.setTask(pick.id, autoTask);
    this.setAgentState(pick.id, newState);
  }

  update(deltaSeconds) {
    this.simClockSeconds += deltaSeconds;

    if (!this.autopilot) {
      return;
    }

    if (this.simClockSeconds >= this.nextStateSwapAt) {
      this.#runAutopilotTick();
      this.nextStateSwapAt =
        this.simClockSeconds + 1.8 + Math.random() * 2.2;
    }
  }
}
