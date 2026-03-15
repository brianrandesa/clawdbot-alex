#!/usr/bin/env node
/**
 * Slack Digest for Victoria
 *
 * Fetches recent messages from all Slack channels the bot is in,
 * writes a markdown digest to memory/slack-digest-latest.md.
 * Run on a schedule (e.g. hourly or before Victoria's 5 PM report).
 *
 * Requires: SLACK_BOT_TOKEN_VICTORIA (or SLACK_BOT_TOKEN) in env or .env
 * Scopes: channels:read, channels:history, groups:read, groups:history, users:read
 */

import { WebClient } from '@slack/web-api';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const WORKSPACE_ROOT = resolve(ROOT, '../..');
const OUT_PATH = resolve(__dirname, '../memory/slack-digest-latest.md');

// Load .env from workspace root if present
function loadEnv() {
  const envPath = resolve(WORKSPACE_ROOT, '.env');
  if (existsSync(envPath)) {
    const buf = readFileSync(envPath, 'utf8');
    for (const line of buf.split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

loadEnv();

const token = process.env.SLACK_BOT_TOKEN_VICTORIA || process.env.SLACK_BOT_TOKEN;
if (!token) {
  console.error('Missing SLACK_BOT_TOKEN_VICTORIA or SLACK_BOT_TOKEN');
  process.exit(1);
}

const web = new WebClient(token);
const HOURS_AGO = 24;
const oldestTs = String(Math.floor((Date.now() - HOURS_AGO * 60 * 60 * 1000) / 1000));
const MAX_CHANNELS = 30;
const MESSAGES_PER_CHANNEL = 50;

async function getChannels() {
  const channels = [];
  let cursor;
  do {
    const res = await web.conversations.list({
      types: 'public_channel,private_channel',
      exclude_archived: true,
      limit: 200,
      cursor,
    });
    if (!res.ok) throw new Error(res.error || 'conversations.list failed');
    for (const ch of res.channels || []) {
      if (ch.is_member) channels.push({ id: ch.id, name: ch.name || ch.id });
    }
    cursor = res.response_metadata?.next_cursor;
  } while (cursor);
  return channels;
}

async function getHistory(channelId) {
  try {
    const res = await web.conversations.history({
      channel: channelId,
      oldest: oldestTs,
      limit: MESSAGES_PER_CHANNEL,
    });
    if (!res.ok) return [];
    return (res.messages || []).filter((m) => !m.bot_id && m.text);
  } catch (e) {
    return [];
  }
}

async function getUserName(userId) {
  if (!userId || userId === 'USLACKBOT') return 'Slack';
  try {
    const res = await web.users.info({ user: userId });
    return res.user?.real_name || res.user?.name || userId;
  } catch {
    return userId;
  }
}

async function main() {
  const channels = await getChannels();
  const limited = channels.slice(0, MAX_CHANNELS);
  const lines = [
    `# Slack digest (last ${HOURS_AGO}h)`,
    `Generated: ${new Date().toISOString()}`,
    `Channels: ${limited.length} (of ${channels.length} joined)`,
    '',
  ];

  for (const ch of limited) {
    const messages = await getHistory(ch.id);
    if (messages.length === 0) continue;
    lines.push(`## #${ch.name}`);
    for (const m of messages.slice(0, 25)) {
      const user = await getUserName(m.user);
      const text = (m.text || '').replace(/\n/g, ' ').slice(0, 300);
      const ts = m.ts ? new Date(parseFloat(m.ts) * 1000).toISOString().slice(0, 16) : '';
      lines.push(`- **${user}** (${ts}): ${text}`);
    }
    lines.push('');
  }

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, lines.join('\n'), 'utf8');
  console.log('Wrote', OUT_PATH);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
