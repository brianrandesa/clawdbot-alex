# Security Audit Results - March 14, 2026

## Summary

Ran `openclaw security audit --deep` and `openclaw status`.

**Critical: 2 | Warn: 2 | Info: 2**

---

## CRITICAL Items

### 1. Slack groupPolicy="open" with elevated tools
- **Finding:** Victoria and default Slack accounts have groupPolicy="open"
- **Risk:** Prompt injection in any channel could trigger high-impact actions
- **Fix:** Set groupPolicy="allowlist", add channels.slack.channels with allowed channel IDs
- **Blocker:** Need Slack channel IDs. Victoria is active in channels (c0... visible in sessions). Run `openclaw status --all` or get IDs from Slack (right-click channel → View channel details → copy ID) for #proposals, #client-success once created.
- **Ref:** OpenClaw Slack docs - channels.slack.channels: {"C123": {"allow": true}}

### 2. Slack security warning (duplicate)
- Same as above - no channel allowlist

---

## WARN Items

### 1. Reverse proxy headers not trusted
- **Finding:** gateway.trustedProxies empty
- **Risk:** If exposing Control UI through reverse proxy, spoofing possible
- **Fix:** Only needed if using reverse proxy. Control UI is loopback-only - low priority

### 2. Multi-user setup heuristic
- **Finding:** Telegram allowlist + Slack open = potential multi-user pattern
- **Fix:** Document that this is single-operator (Brian). No action if intentional.

---

## INFO Items

### 1. Attack surface summary
- groups: open=0, allowlist=2 (Telegram)
- tools.elevated: enabled
- trust model: personal assistant

### 2. Tailscale Serve
- Gateway exposed to tailnet - expected for remote access

---

## OpenClaw Status (Healthy)

- Gateway: Running, reachable, LaunchAgent active
- Agents: 6 configured
- Victoria: Active in multiple Slack channels
- Update available: 2026.3.13

---

## Action Items

1. **Slack allowlist:** Once #client-success created, add channel IDs to openclaw.json:
   - Get ID: Slack → right-click channel → View channel details
   - Add to channels.slack.channels: {"C_ID": {"allow": true, "requireMention": true}}
   - Set groupPolicy: "allowlist" for victoria and default

2. **Anthropic API key:** Still need to rotate (exposed in git) - see MEMORY.md CRITICAL TODO

3. **Optional:** Run `openclaw update` for 2026.3.13

4. **Telegram privacy mode (5 bots):** Status reported requireMention=false with privacy mode - group messages may be blocked. Fix: BotFather → /setprivacy → Disable for henry, rex, sebastian, marcus, victoria bots. Then restart gateway.
