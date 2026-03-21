/**
 * Modal for joining or creating a collab room.
 * Collects display name and room code, calls onSubmit (async).
 * Dismisses only after onSubmit resolves.
 */
const DISPLAY_NAME_KEY = "esa.office.collab.displayName";

export class JoinModal {
  constructor({ parent = document.body, onSubmit } = {}) {
    this.onSubmit = onSubmit;
    this.parent = parent;
    this.root = null;
    this.mode = "create"; // "create" | "join"
  }

  show(initialRoomCode = null) {
    if (this.root) return;
    const savedName = localStorage.getItem(DISPLAY_NAME_KEY) || "";
    const urlRoom = typeof window !== "undefined" && window.location?.search
      ? new URLSearchParams(window.location.search).get("room")
      : null;
    const prefillRoom = initialRoomCode || urlRoom || "";

    this.root = document.createElement("div");
    this.root.className = "join-modal-overlay";
    this.root.innerHTML = `
      <div class="join-modal">
        <h2>Join Virtual Office</h2>
        <p class="join-modal-hint">Collaborate with your team in the same 3D space.</p>
        <div class="join-modal-field">
          <label for="join-display-name">Display name</label>
          <input id="join-display-name" type="text" placeholder="Your name" value="${savedName.replace(/"/g, "&quot;")}" maxlength="32" />
        </div>
        <div class="join-modal-mode">
          <button type="button" data-mode="create" class="active">Create room</button>
          <button type="button" data-mode="join">Join room</button>
        </div>
        <div class="join-modal-field join-modal-room" data-visible="join">
          <label for="join-room-code">Room code</label>
          <input id="join-room-code" type="text" placeholder="e.g. ABC123" maxlength="6" autocomplete="off" value="${(prefillRoom || "").toString().replace(/"/g, "&quot;")}" />
        </div>
        <div class="join-modal-error" data-role="error"></div>
        <div class="join-modal-actions">
          <button type="button" data-action="submit" class="join-modal-primary">Enter</button>
        </div>
      </div>
    `;

    this.parent.appendChild(this.root);

    const nameInput = this.root.querySelector("#join-display-name");
    const roomInput = this.root.querySelector("#join-room-code");
    const roomField = this.root.querySelector(".join-modal-room");
    const errorEl = this.root.querySelector("[data-role='error']");
    const modeBtns = this.root.querySelectorAll(".join-modal-mode button");
    const submitBtn = this.root.querySelector("[data-action='submit']");

    const updateRoomVisibility = () => {
      roomField.dataset.visible = this.mode;
      if (this.mode === "create") {
        roomInput.value = "";
        roomInput.required = false;
      } else {
        roomInput.required = true;
        if (prefillRoom && !roomInput.value) roomInput.value = prefillRoom;
      }
    };

    modeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.mode = btn.dataset.mode;
        modeBtns.forEach((b) => b.classList.toggle("active", b === btn));
        updateRoomVisibility();
      });
    });
    updateRoomVisibility();

    const runSubmit = async () => {
      const displayName = nameInput.value.trim();
      if (!displayName) {
        errorEl.textContent = "Please enter a display name.";
        errorEl.classList.add("visible");
        return;
      }

      let roomCode = null;
      if (this.mode === "join") {
        roomCode = roomInput.value.trim().toUpperCase();
        if (!roomCode || roomCode.length < 4) {
          errorEl.textContent = "Please enter a valid room code (4-6 characters).";
          errorEl.classList.add("visible");
          return;
        }
      }

      errorEl.textContent = "";
      errorEl.classList.remove("visible");
      submitBtn.disabled = true;
      submitBtn.textContent = "Connecting...";

      try {
        localStorage.setItem(DISPLAY_NAME_KEY, displayName);
        await this.onSubmit({
          displayName,
          roomCode: this.mode === "create" ? null : roomCode,
          isCreator: this.mode === "create",
        });
        this.close();
      } catch (e) {
        errorEl.textContent = e?.message || "Could not connect. Is the presence server running?";
        errorEl.classList.add("visible");
        submitBtn.disabled = false;
        submitBtn.textContent = "Enter";
      }
    };

    submitBtn.addEventListener("click", runSubmit);
    this.root.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runSubmit();
    });

    setTimeout(() => nameInput.focus(), 50);
  }

  close() {
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.root = null;
  }
}
