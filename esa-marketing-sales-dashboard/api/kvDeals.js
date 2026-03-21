/**
 * Optional persistence for Sales form rows (Vercel Redis / Upstash).
 *
 * Mode A — REST (fetch):
 *   KV_REST_API_URL + KV_REST_API_TOKEN
 *   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *
 * Mode B — TCP (Vercel Storage often injects this only):
 *   REDIS_URL (redis:// or rediss://) via ioredis
 */
const LIST_KEY = 'esa_deal_submissions';
const MAX_ITEMS = 500;

function restUrl() {
  const u = (
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    ''
  ).trim();
  return u ? u.replace(/\/$/, '') : '';
}

function restToken() {
  return (
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    ''
  ).trim();
}

function tcpUrl() {
  return (process.env.REDIS_URL || '').trim();
}

function useRest() {
  return !!(restUrl() && restToken());
}

function useTcp() {
  const u = tcpUrl();
  if (!u) return false;
  return u.startsWith('redis://') || u.startsWith('rediss://');
}

function kvConfigured() {
  return useRest() || useTcp();
}

let tcpClient = null;

function getTcpClient() {
  if (!useTcp()) return null;
  if (tcpClient) return tcpClient;
  let Redis;
  try {
    Redis = require('ioredis');
  } catch (e) {
    return null;
  }
  tcpClient = new Redis(tcpUrl(), {
    maxRetriesPerRequest: 2,
    connectTimeout: 10000,
    lazyConnect: false
  });
  return tcpClient;
}

/**
 * @returns {Promise<{ ok: true, result: unknown } | { ok: false, error: string }>}
 */
async function redisCommand(args) {
  if (useRest()) {
    const b = restUrl();
    const t = restToken();
    let res;
    try {
      res = await fetch(b, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + t,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(args)
      });
    } catch (e) {
      return { ok: false, error: 'Redis HTTP fetch failed: ' + (e && e.message ? e.message : String(e)) };
    }
    const text = await res.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        return {
          ok: false,
          error: 'Redis returned non-JSON (HTTP ' + res.status + '): ' + text.slice(0, 200)
        };
      }
    }
    if (!res.ok) {
      const msg = data.error || data.message || 'HTTP ' + res.status;
      return { ok: false, error: typeof msg === 'string' ? msg : JSON.stringify(msg) };
    }
    if (data.error != null && data.error !== '') {
      const msg = data.error;
      return { ok: false, error: typeof msg === 'string' ? msg : JSON.stringify(msg) };
    }
    return { ok: true, result: data.result };
  }

  if (useTcp()) {
    const client = getTcpClient();
    if (!client) {
      return {
        ok: false,
        error:
          'REDIS_URL is set but ioredis failed to load. Run npm install in the project root on Vercel.'
      };
    }
    const cmd = String(args[0] || '').toUpperCase();
    try {
      if (cmd === 'LPUSH') {
        const key = args[1];
        const vals = args.slice(2);
        const n = await client.lpush(key, ...vals);
        return { ok: true, result: n };
      }
      if (cmd === 'LTRIM') {
        const key = args[1];
        const start = parseInt(args[2], 10);
        const stop = parseInt(args[3], 10);
        await client.ltrim(key, start, stop);
        return { ok: true, result: 'OK' };
      }
      if (cmd === 'LRANGE') {
        const key = args[1];
        const start = parseInt(args[2], 10);
        const stop = parseInt(args[3], 10);
        const arr = await client.lrange(key, start, stop);
        return { ok: true, result: arr };
      }
      return { ok: false, error: 'Unsupported command for TCP mode: ' + cmd };
    } catch (e) {
      return { ok: false, error: e && e.message ? e.message : String(e) };
    }
  }

  return { ok: false, error: 'Redis not configured' };
}

async function appendDealSubmission(row) {
  if (!kvConfigured()) return false;
  const jsonStr = JSON.stringify(row);
  try {
    const r1 = await redisCommand(['LPUSH', LIST_KEY, jsonStr]);
    if (!r1.ok) return false;
    const r2 = await redisCommand(['LTRIM', LIST_KEY, '0', String(MAX_ITEMS - 1)]);
    return r2.ok;
  } catch (e) {
    return false;
  }
}

/**
 * @returns {Promise<{ rows: object[], error: string | null }>}
 */
async function listDealSubmissions() {
  if (!kvConfigured()) return { rows: [], error: null };
  try {
    const data = await redisCommand(['LRANGE', LIST_KEY, '0', String(MAX_ITEMS - 1)]);
    if (!data.ok) return { rows: [], error: data.error || 'LRANGE failed' };
    const arr = Array.isArray(data.result) ? data.result : [];
    const rows = arr
      .map((s) => {
        try {
          return typeof s === 'string' ? JSON.parse(s) : null;
        } catch (_) {
          return null;
        }
      })
      .filter(Boolean);
    rows.sort(function (a, b) {
      const ta = new Date(a.submittedAt || 0).getTime();
      const tb = new Date(b.submittedAt || 0).getTime();
      return tb - ta;
    });
    return { rows, error: null };
  } catch (e) {
    return { rows: [], error: e && e.message ? e.message : String(e) };
  }
}

module.exports = {
  kvConfigured,
  appendDealSubmission,
  listDealSubmissions,
  LIST_KEY,
  MAX_ITEMS
};
