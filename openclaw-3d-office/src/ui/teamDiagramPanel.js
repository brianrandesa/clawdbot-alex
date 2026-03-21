export class TeamDiagramPanel {
  constructor({ parent }) {
    this.root = document.createElement("aside");
    this.root.className = "team-diagram";
    this.botTaskEls = {};
    this.lastTaskKey = "";
    parent.appendChild(this.root);
    this.#render();
  }

  #render() {
    const sections = [
      {
        title: "Executive Leadership",
        people: [{ name: "Brian Rand (CEO)" }, { name: "Denise Brooks (COO)" }],
      },
      {
        title: "Sales Leadership + Ops",
        people: [
          { name: "Malachi Broadaway (Sales Lead)" },
        ],
      },
      {
        title: "Kim + Diamond Area",
        people: [{ name: "Kim Ortega (Sales Assistant)" }, { name: "Diamond (Setter)" }],
      },
      {
        title: "GHL + Delivery Support",
        people: [
          { name: "Shah Khan (GHL Lead)" },
          { name: "Hamza Akram (GHL Assistant)" },
          { name: "Jawad Hassan (GHL Assistant)" },
          { name: "Kim Pusa (Admin Assistant)" },
        ],
      },
      {
        title: "Marketing / Media Buying",
        people: [{ name: "Muhammad Zohaib" }, { name: "Sohaib Iqbal" }],
      },
      {
        title: "Core AI Bots",
        people: [
          { name: "Henry", id: "henry" },
          { name: "Victoria", id: "victoria" },
          { name: "Sebastian", id: "sebastian" },
          { name: "Rex", id: "rex" },
          { name: "Marcus", id: "marcus" },
        ],
      },
      {
        title: "DFY Ticket Sales Team",
        people: [
          { name: "James Mungai" },
          { name: "Emanuela" },
          { name: "Jeff Dazer" },
          { name: "Jacob Dawson" },
        ],
      },
      {
        title: "Finance",
        people: [{ name: "Amit (Bookkeeper)" }],
      },
    ];

    this.root.innerHTML = `
      <h3>Whole Company Diagram</h3>
      <p>Right-side company view across leadership, ops, and full DFY sales bench.</p>
      <div class="team-sections">
        ${sections
          .map(
            (section) => `
            <section class="team-section">
              <h4>${section.title}</h4>
              <div class="team-grid">
                ${section.people
                  .map(
                    (person) => `
                    <div class="team-node ${person.id ? "team-node-bot" : ""}">
                      <strong>${person.name}</strong>
                      ${person.id ? `<span data-role="bot-task" data-bot-id="${person.id}">At desk and ready for command</span>` : ""}
                    </div>
                  `
                  )
                  .join("")}
              </div>
            </section>
          `
          )
          .join("")}
      </div>
    `;
    this.botTaskEls = {};
    this.root.querySelectorAll("[data-role='bot-task']").forEach((node) => {
      this.botTaskEls[node.dataset.botId] = node;
    });
  }

  render({ agents = [] }) {
    const bots = agents.filter((agent) =>
      ["henry", "victoria", "sebastian", "rex", "marcus"].includes(agent.id)
    );
    const nextKey = bots.map((bot) => `${bot.id}:${bot.task || ""}`).join("|");
    if (nextKey === this.lastTaskKey) return;
    this.lastTaskKey = nextKey;

    bots.forEach((bot) => {
      const target = this.botTaskEls[bot.id];
      if (!target) return;
      target.textContent = bot.task || "At desk and ready for command";
    });
  }
}
