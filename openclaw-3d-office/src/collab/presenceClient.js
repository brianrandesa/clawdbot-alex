/**
 * WebSocket client for presence and position sync.
 * Connects to presence server, joins rooms, broadcasts position, receives updates.
 */
const WS_URL = import.meta.env?.VITE_PRESENCE_WS_URL || "ws://localhost:3456";
const POSITION_THROTTLE_MS = 100;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

export class PresenceClient {
  constructor(wsUrl = WS_URL) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.userId = null;
    this.roomCode = null;
    this.displayName = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;

    this.onPresenceCb = null;
    this.onPositionCb = null;
    this.onConnectionChangeCb = null;

    this.lastPositionSent = 0;
    this.pendingJoin = null;
    this.lastUsers = [];
  }

  onPresence(callback) {
    this.onPresenceCb = callback;
  }

  onPosition(callback) {
    this.onPositionCb = callback;
  }

  onConnectionChange(callback) {
    this.onConnectionChangeCb = callback;
  }

  #setConnected(connected) {
    if (this.connected !== connected) {
      this.connected = connected;
      this.onConnectionChangeCb?.(connected);
    }
  }

  #connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);
      } catch (e) {
        reject(e);
        return;
      }

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.#setConnected(true);
        resolve();
      };

      this.ws.onclose = () => {
        this.#setConnected(false);
        this.ws = null;
        if (this.roomCode && this.displayName) {
          this.#scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        reject(err);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "joined") {
            this.userId = msg.userId;
            this.roomCode = msg.roomCode;
            this.lastUsers = msg.users || [];
            if (this.pendingJoin) {
              clearTimeout(this.pendingJoin.timeout);
              this.pendingJoin.resolve(msg);
              this.pendingJoin = null;
            }
            this.onPresenceCb?.(this.lastUsers);
          } else if (msg.type === "presence") {
            this.lastUsers = msg.users || [];
            this.onPresenceCb?.(this.lastUsers);
          } else if (msg.type === "position" && msg.userId !== this.userId) {
            this.onPositionCb?.({
              userId: msg.userId,
              x: msg.x,
              y: msg.y,
              z: msg.z,
              yaw: msg.yaw,
            });
          }
        } catch (_) {}
      };
    });
  }

  #scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(
      RECONNECT_BASE_MS * Math.pow(2, this.reconnectAttempts),
      RECONNECT_MAX_MS
    );
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        await this.#connect();
        await this.join(this.roomCode, this.displayName);
      } catch (_) {
        this.#scheduleReconnect();
      }
    }, delay);
  }

  async join(roomCode, displayName) {
    const name = String(displayName || "Anonymous").trim().slice(0, 32) || "Anonymous";
    this.displayName = name;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.#connect();
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.pendingJoin) {
          this.pendingJoin.reject(new Error("Join timeout"));
          this.pendingJoin = null;
        }
      }, 5000);
      this.pendingJoin = { resolve, reject, timeout };

      this.ws.send(
        JSON.stringify({
          type: "join",
          roomCode: roomCode || null,
          displayName: name,
        })
      );
    });
  }

  sendPosition(x, y, z, yaw = 0) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.roomCode) return;
    const now = Date.now();
    if (now - this.lastPositionSent < POSITION_THROTTLE_MS) return;
    this.lastPositionSent = now;
    this.ws.send(
      JSON.stringify({
        type: "position",
        x: typeof x === "number" ? x : 0,
        y: typeof y === "number" ? y : 0,
        z: typeof z === "number" ? z : 0,
        yaw: typeof yaw === "number" ? yaw : 0,
      })
    );
  }

  leave() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.roomCode = null;
    this.userId = null;
    this.displayName = null;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.#setConnected(false);
  }

  getUserId() {
    return this.userId;
  }

  getRoomCode() {
    return this.roomCode;
  }

  getDisplayName() {
    return this.displayName;
  }

  getLastUsers() {
    return [...this.lastUsers];
  }
}
