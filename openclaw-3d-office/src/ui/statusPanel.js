const STATES = ["idle", "working", "meeting", "whiteboard", "executive", "fulfillment", "ticket_sales"];

export class StatusPanel {
  constructor({ parent, onSetState, onCommand }) {
    this.onSetState = onSetState;
    this.onCommand = onCommand;

    this.root = document.createElement("div");
    this.root.className = "hud";
    parent.appendChild(this.root);

    this.agentListEl = null;
    this.clockEl = null;
    this.commandInputEl = null;
    this.commandTargetEl = null;
    this.messagesEl = null;
    this.lastSnapshotKey = "";
    this.lastMessagesKey = "";
    this.lastAgentOptionsKey = "";

    this.#renderSkeleton();
    this.#bindEvents();
  }

  #renderSkeleton() {
    this.root.innerHTML = `
      <div class="brand-header">
        <img src="/logo.png" alt="ESA logo" class="brand-logo" />
        <div>
          <h1>Brian's Executive Office</h1>
          <p>Orbit camera with mouse. Direct your team from command desk.</p>
        </div>
      </div>
      <section class="agent-list" data-role="agent-list"></section>
      <section class="command-desk">
        <h2>Command Desk</h2>
        <div class="command-controls">
          <select data-role="command-target"></select>
          <button data-action="send-command">Send</button>
        </div>
        <div class="command-presets">
          <button data-action="gather-whiteboard">Gather at Whiteboard</button>
        </div>
        <div class="command-presets">
          <button data-action="start-brainstorm">Start Brainstorm Session</button>
        </div>
        <div class="command-presets">
          <button data-action="meet-ceo">Meet Brian (CEO Office)</button>
        </div>
        <textarea data-role="command-input" rows="2" placeholder="Tell them what to work on..."></textarea>
        <div class="command-feed" data-role="command-feed"></div>
      </section>
      <div class="hud-footer">
        <span class="mode-pill">Command-only mode</span>
        <span data-role="clock">Sim: 0.0s</span>
      </div>
    `;

    this.agentListEl = this.root.querySelector("[data-role='agent-list']");
    this.clockEl = this.root.querySelector("[data-role='clock']");
    this.commandInputEl = this.root.querySelector("[data-role='command-input']");
    this.commandTargetEl = this.root.querySelector("[data-role='command-target']");
    this.messagesEl = this.root.querySelector("[data-role='command-feed']");
  }

  #bindEvents() {
    this.root.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;

      const action = button.dataset.action;
      if (action === "state") {
        this.onSetState(button.dataset.agent, button.dataset.state);
        return;
      }

      if (action === "send-command") {
        const task = this.commandInputEl.value.trim();
        if (!task) return;
        this.onCommand(this.commandTargetEl.value, task);
        this.commandInputEl.value = "";
        return;
      }

      if (action === "gather-whiteboard") {
        this.onCommand("all", "Everyone meet at the whiteboard for planning");
        return;
      }

      if (action === "start-brainstorm") {
        this.onCommand(
          "all",
          "Brainstorm session: gather at the whiteboard and generate ideas"
        );
        return;
      }

      if (action === "meet-ceo") {
        this.onCommand("all", "Everyone meet Brian in the executive office for briefing");
      }
    });

    this.commandInputEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        const task = this.commandInputEl.value.trim();
        if (!task) return;
        this.onCommand(this.commandTargetEl.value, task);
        this.commandInputEl.value = "";
      }
    });
  }

  #renderAgentControls(agent) {
    const buttons = STATES.map((state) => {
      const className = state === agent.status ? "active" : "";
      return `<button data-action="state" data-agent="${agent.id}" data-state="${state}" class="${className}">${state}</button>`;
    }).join("");

    return `
      <article class="agent-card">
        <div class="agent-card-header">
          <strong>${agent.name}</strong>
          <span class="agent-state">${agent.status}</span>
        </div>
        <div class="agent-task">${agent.task ?? "No task set"}</div>
        <div class="agent-actions">${buttons}</div>
      </article>
    `;
  }

  #renderAgentCards(agents) {
    if (!Array.isArray(agents)) return;
    const nextKey = agents.map((agent) => `${agent.id}:${agent.status}`).join("|");
    if (nextKey === this.lastSnapshotKey) return;
    this.lastSnapshotKey = nextKey;
    const totals = {
      total: agents.length,
      working: agents.filter((agent) => agent.status === "working").length,
      meeting: agents.filter((agent) => agent.status === "meeting").length,
      executive: agents.filter((agent) => agent.status === "executive").length,
      ticketSales: agents.filter((agent) => agent.status === "ticket_sales").length,
    };
    this.agentListEl.innerHTML = `
      <article class="agent-card">
        <div class="agent-card-header">
          <strong>Team Snapshot</strong>
          <span class="agent-state">${totals.total} on floor</span>
        </div>
        <div class="agent-task">
          Working: ${totals.working} · Meeting: ${totals.meeting} · Executive: ${totals.executive} ·
          Ticket Sales Area: ${totals.ticketSales}
        </div>
      </article>
    `;
  }

  #renderAgentOptions(agents) {
    const optionsKey = agents.map((agent) => agent.id).join("|");
    if (optionsKey === this.lastAgentOptionsKey) return;
    this.lastAgentOptionsKey = optionsKey;
    const options = [
      `<option value="all">All agents</option>`,
      ...agents.map((agent) => `<option value="${agent.id}">${agent.name}</option>`),
    ].join("");
    this.commandTargetEl.innerHTML = options;
  }

  #renderMessages(messages) {
    const nextKey = messages.map((msg) => `${msg.id}:${msg.text}`).join("|");
    if (nextKey === this.lastMessagesKey) return;
    this.lastMessagesKey = nextKey;
    this.messagesEl.innerHTML = messages
      .map(
        (msg) => `
        <div class="feed-msg">
          <strong>${msg.from}</strong>
          <span>${msg.text}</span>
        </div>`
      )
      .join("");
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  render({ clock = 0, agents = [], messages = [] }) {
    this.#renderAgentCards(agents);
    this.#renderAgentOptions(agents);
    this.#renderMessages(messages);
    this.clockEl.textContent = `Sim: ${clock.toFixed(1)}s`;
  }
}
