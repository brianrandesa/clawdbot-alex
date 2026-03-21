/**
 * Phase-2 skeleton for live OpenClaw wiring.
 *
 * This file intentionally does not write to OpenClaw. It only outlines the
 * read-side contract so V1 can remain simulation-first and local.
 */
export class OpenClawAdapter {
  constructor() {
    this.pollMs = 3000;
    this.timer = null;
    this.lastSnapshot = null;
  }

  start() {
    // Placeholder polling loop for future live status sync.
    this.timer = setInterval(() => {
      this.poll().catch(() => {
        // Keep adapter non-fatal in V1.
      });
    }, this.pollMs);
  }

  stop() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  async poll() {
    // Phase 2 target:
    // - Read local session/state data from ~/.openclaw
    // - Optionally read gateway health/status endpoints
    // - Convert to movement-friendly statuses
    this.lastSnapshot = {
      timestamp: Date.now(),
      agents: [],
    };
    return this.lastSnapshot;
  }
}
