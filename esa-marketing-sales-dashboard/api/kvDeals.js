/**
 * Optional persistence for Sales form rows (Vercel KV / Upstash REST).
 * Uses POST to REST root with JSON command array (handles JSON values safely).
 * Env (any pair works):
 * - KV_REST_API_URL + KV_REST_API_TOKEN (legacy Vercel KV / some dashboards)
 * - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (Marketplace Upstash Redis)
 */
const LIST_KEY = 'esa_deal_submissions';
const MAX_ITEMS = 500;

function baseUrl() {
  const u = (
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    ''
  ).trim();
  return u ? u.replace(/\/$/, '') : null;
}

function token() {
  return (
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    ''
  ).trim();
}

function kvConfigured() {
  return !!(baseUrl() && token());
}

async function redisCommand(args) {
  const b = baseUrl();
  const t = token();
  const res = await fetch(b, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + t,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  });
  return res.json();
}

async function appendDealSubmission(row) {
  if (!kvConfigured()) return false;
  const jsonStr = JSON.stringify(row);
  try {
    const r1 = await redisCommand(['LPUSH', LIST_KEY, jsonStr]);
    if (r1.error) return false;
    await redisCommand(['LTRIM', LIST_KEY, '0', String(MAX_ITEMS - 1)]);
    return true;
  } catch (e) {
    return false;
  }
}

async function listDealSubmissions() {
  if (!kvConfigured()) return [];
  try {
    const data = await redisCommand(['LRANGE', LIST_KEY, '0', String(MAX_ITEMS - 1)]);
    if (data.error) return [];
    const arr = data.result || [];
    return arr
      .map((s) => {
        try {
          return typeof s === 'string' ? JSON.parse(s) : null;
        } catch (_) {
          return null;
        }
      })
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

module.exports = {
  kvConfigured,
  appendDealSubmission,
  listDealSubmissions,
  LIST_KEY,
  MAX_ITEMS
};
