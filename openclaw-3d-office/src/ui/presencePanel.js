/**
 * HUD panel showing who's in the room, room code, invite link, connection status.
 */
export class PresencePanel {
  constructor({ parent, roomCode, userId, users = [], connected = false, onCopyInvite }) {
    this.parent = parent;
    this.roomCode = roomCode;
    this.userId = userId;
    this.users = users;
    this.connected = connected;
    this.onCopyInvite = onCopyInvite;

    this.root = document.createElement("div");
    this.root.className = "presence-panel";
    parent.appendChild(this.root);
    this.collapsed = false;
    this.#render();
  }

  #render() {
    const statusText = this.connected ? "Connected" : "Disconnected";
    const statusClass = this.connected ? "presence-status-ok" : "presence-status-off";
    const inviteUrl = typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(this.roomCode || "")}`
      : "";

    this.root.innerHTML = `
      <div class="presence-header">
        <button type="button" class="presence-toggle" data-action="toggle" title="${this.collapsed ? "Expand" : "Collapse"}">
          <span class="presence-toggle-icon">${this.collapsed ? "▶" : "▼"}</span>
          <span class="presence-title">Who's here</span>
          <span class="presence-count">${this.users.length}</span>
        </button>
        <span class="presence-status ${statusClass}">${statusText}</span>
      </div>
      ${this.collapsed ? "" : `
        <div class="presence-body">
          ${this.roomCode ? `
            <div class="presence-room">
              <span class="presence-room-label">Room</span>
              <code class="presence-room-code">${this.roomCode}</code>
              <button type="button" class="presence-copy" data-action="copy" title="Copy invite link">Copy link</button>
            </div>
          ` : ""}
          <ul class="presence-list">
            ${this.users.map((u) => `
              <li class="presence-user ${u.id === this.userId ? "presence-user-you" : ""}">
                <span class="presence-user-dot"></span>
                <span class="presence-user-name">${escapeHtml(u.name || "Anonymous")}</span>
                ${u.id === this.userId ? '<span class="presence-you-badge">you</span>' : ""}
              </li>
            `).join("")}
          </ul>
        </div>
      `}
    `;

    if (!this.collapsed && inviteUrl) {
      this.root.dataset.inviteUrl = inviteUrl;
    }

    this.root.querySelector("[data-action='toggle']")?.addEventListener("click", () => {
      this.collapsed = !this.collapsed;
      this.#render();
    });

    this.root.querySelector("[data-action='copy']")?.addEventListener("click", () => {
      const url = this.root.dataset.inviteUrl || inviteUrl;
      if (url) {
        navigator.clipboard?.writeText(url).then(() => {
          const btn = this.root.querySelector("[data-action='copy']");
          if (btn) {
            const orig = btn.textContent;
            btn.textContent = "Copied!";
            setTimeout(() => { btn.textContent = orig; }, 1500);
          }
        });
        this.onCopyInvite?.(url);
      }
    });
  }

  update({ roomCode, userId, users, connected }) {
    if (roomCode !== undefined) this.roomCode = roomCode;
    if (userId !== undefined) this.userId = userId;
    if (users !== undefined) this.users = users;
    if (connected !== undefined) this.connected = connected;
    this.#render();
  }
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
