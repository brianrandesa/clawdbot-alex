#!/usr/bin/env node

import { WebSocketServer } from "ws";

const PORT = parseInt(process.env.PRESENCE_PORT || "3456", 10);

/** @type {Map<string, Set<{ id: string; name: string; socket: import("ws").WebSocket }>>} */
const rooms = new Map();

function randomId() {
  return `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function broadcastToRoom(roomCode, message, excludeSocket = null) {
  const room = rooms.get(roomCode);
  if (!room) return;
  const payload = JSON.stringify(message);
  for (const member of room) {
    if (member.socket !== excludeSocket && member.socket.readyState === 1) {
      member.socket.send(payload);
    }
  }
}

function getPresenceList(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return [];
  return Array.from(room).map((m) => ({ id: m.id, name: m.name }));
}

function leaveRoom(member, roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;
  room.delete(member);
  if (room.size === 0) {
    rooms.delete(roomCode);
  } else {
    broadcastToRoom(roomCode, {
      type: "presence",
      users: getPresenceList(roomCode),
    });
  }
}

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (socket) => {
  let member = null;
  let roomCode = null;

  socket.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      const { type } = msg;

      if (type === "join") {
        const { roomCode: reqRoom, displayName } = msg;
        const name = String(displayName || "Anonymous").trim().slice(0, 32) || "Anonymous";
        let code = reqRoom ? String(reqRoom).toUpperCase().trim() : null;

        if (!code) {
          code = generateRoomCode();
          rooms.set(code, new Set());
        } else if (!rooms.has(code)) {
          rooms.set(code, new Set());
        }

        const id = randomId();
        member = { id, name, socket };
        roomCode = code;
        rooms.get(code).add(member);

        socket.send(
          JSON.stringify({
            type: "joined",
            userId: id,
            roomCode: code,
            users: getPresenceList(code),
          })
        );

        broadcastToRoom(code, { type: "presence", users: getPresenceList(code) }, socket);
        return;
      }

      if (type === "position" && member && roomCode) {
        const { x, y, z, yaw } = msg;
        broadcastToRoom(
          roomCode,
          {
            type: "position",
            userId: member.id,
            x: typeof x === "number" ? x : 0,
            y: typeof y === "number" ? y : 0,
            z: typeof z === "number" ? z : 0,
            yaw: typeof yaw === "number" ? yaw : 0,
          },
          socket
        );
      }
    } catch (e) {
      console.warn("Presence server message error:", e?.message);
    }
  });

  socket.on("close", () => {
    if (member && roomCode) {
      leaveRoom(member, roomCode);
    }
  });

  socket.on("error", () => {
    if (member && roomCode) {
      leaveRoom(member, roomCode);
    }
  });
});

console.log(`Presence server listening on ws://localhost:${PORT}`);
