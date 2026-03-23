# OpenClaw 3D Office (Custom V1)

Local 3D virtual office with walking agents and simulation-driven status changes.

## Run

```bash
npm install
npm run dev
```

Open: `http://localhost:5173`

## Deploy to Vercel

1. Push the repo to GitHub.
2. In [Vercel](https://vercel.com): New Project → Import your repo.
3. Set **Root Directory** to `openclaw-3d-office` if the app lives in a subfolder.
4. Build command: `npm run build` (default). Output: `dist` (default).
5. Deploy.

On the live site, use **Continue without collab** to view the office when the presence server is not available. The 3D office and AI agents work fully; human presence/avatars require a separately deployed presence server.

### Production presence (optional)

To enable human collab on the live site:

1. Deploy the presence server (`server/presenceServer.js`) to Railway, Render, Fly.io, or similar.
2. In Vercel: Project Settings → Environment Variables → add `VITE_PRESENCE_WS_URL` = `wss://your-presence-host.example.com`.
3. Redeploy so the client uses the production WebSocket URL.

### Human collaboration (local)

To see other humans in the office (avatars and presence):

1. Start the presence server: `npm run server` (runs on ws://localhost:3456)
2. In one terminal: `npm run dev`
3. Open two browser tabs, enter a display name, create or join a room
4. Share the room code or invite link so others can join
5. Move the camera (orbit/zoom) to update your avatar position; others see you move

## What V1 Includes

- 3D office scene (work area, lounge, meeting room, transit lane)
- 5 agents rendered in scene
- Continuous walking movement to zone waypoints (no teleporting)
- Status panel controls (`idle`, `working`, `meeting`)
- Autopilot simulation mode for automatic state changes
- Phase-2 adapter skeleton for live OpenClaw data integration

## Controls

- Mouse drag: orbit camera
- Mouse wheel: zoom
- Top-left panel buttons: force status per agent
- Toggle button: pause/resume autopilot

## Phase 2 Hookup Outline

`src/integrations/openclawAdapter.js` is the integration skeleton.
Planned next step:

1. Read agent/session state from OpenClaw local state or gateway.
2. Map activity to office states:
   - active task -> `working`
   - idle/no recent activity -> `idle`
   - coordination/collaboration markers -> `meeting`
3. Feed mapped states into `SimulationEngine.setAgentState(...)`.
