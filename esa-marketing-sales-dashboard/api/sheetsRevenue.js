/**
 * Read sales $ from a Google Sheet (Sheets API v4) using a service account.
 * Share the spreadsheet with the service account email (Editor or Viewer).
 */

const https = require('https');
const crypto = require('crypto');

const SPREADSHEET_ID_DEFAULT = '1PpmjfmolXIkrShtb5LD4ZIC6ESO77SpfSGeHyXjDYl8';

function httpsReq(url, { method = 'GET', headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: { ...headers, ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}) }
    };
    const req = https.request(opts, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: raw });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function signJwt(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url({ alg: 'RS256', typ: 'JWT' });
  const payload = b64url({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3500
  });
  const signInput = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  const sig = sign.sign(serviceAccount.private_key, 'base64url');
  return `${signInput}.${sig}`;
}

async function getAccessToken(serviceAccount) {
  const assertion = signJwt(serviceAccount);
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion
  }).toString();
  const { status, body: raw } = await httpsReq('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (status !== 200) {
    return { error: `token ${status}: ${raw.slice(0, 200)}` };
  }
  try {
    const j = JSON.parse(raw);
    if (!j.access_token) return { error: 'no access_token in response' };
    return { accessToken: j.access_token };
  } catch (e) {
    return { error: 'invalid token JSON' };
  }
}

function parseMoneyCell(s) {
  if (s == null || s === '') return null;
  if (typeof s === 'number' && !Number.isNaN(s)) return s;
  const t = String(s).replace(/[$£€,\s]/g, '').trim();
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

function parseDateCell(val) {
  if (val == null || val === '') return null;
  if (typeof val === 'number') {
    // Google Sheets serial date (days since 1899-12-30)
    if (val > 20000 && val < 60000) {
      const epoch = new Date(Date.UTC(1899, 11, 30));
      const ms = epoch.getTime() + Math.round(val * 86400000);
      return new Date(ms);
    }
  }
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

function colLetterToIndex(letter) {
  const L = String(letter || '').trim().toUpperCase();
  if (!L || !/^[A-Z]+$/.test(L)) return null;
  let n = 0;
  for (let i = 0; i < L.length; i++) {
    n = n * 26 + (L.charCodeAt(i) - 64);
  }
  return n - 1;
}

function findHeaderCols(row) {
  const lower = (row || []).map((c) => String(c || '').trim().toLowerCase());
  const datePatterns = ['date', 'close', 'closed', 'sold', 'sale'];
  const amtPatterns = ['amount', 'revenue', 'total', 'value', 'sale', 'collected', 'cash', '$'];

  let dateIdx = -1;
  let amtIdx = -1;
  for (let i = 0; i < lower.length; i++) {
    const h = lower[i];
    if (dateIdx < 0 && datePatterns.some((p) => h.includes(p))) dateIdx = i;
    if (amtIdx < 0 && (amtPatterns.some((p) => h === p || h.includes(p)) || /^\$/.test(h))) amtIdx = i;
  }
  return { dateIdx, amtIdx, looksLikeHeader: dateIdx >= 0 || amtIdx >= 0 };
}

/**
 * Map sheet header row to attribution column indices (ESA-style column names).
 * @returns {{ leadSource: number, sourceTag: number, campaign: number, adset: number, ad: number, product: number, labels: Record<string,string> }}
 */
function findAttributionIndices(headerRow) {
  const raw = (headerRow || []).map((c) => String(c || '').trim());
  const lower = raw.map((c) => c.toLowerCase());
  const out = {
    leadSource: -1,
    sourceTag: -1,
    campaign: -1,
    adset: -1,
    ad: -1,
    product: -1,
    labels: {}
  };

  const set = (key, i) => {
    if (out[key] < 0 && i >= 0) {
      out[key] = i;
      out.labels[key] = raw[i] || key;
    }
  };

  for (let i = 0; i < lower.length; i++) {
    const h = lower[i];
    if (h.includes('lead source')) set('leadSource', i);
    else if (h.includes('dashboard source') || h.includes('source tag') || h.includes('dashboard source tag'))
      set('sourceTag', i);
    else if (h.includes('adset') || h.includes('ad set')) set('adset', i);
    else if (h === 'ad' || (h.startsWith('ad ') && !h.includes('adset'))) set('ad', i);
    else if (h.includes('campaign') && !h.includes('adset')) set('campaign', i);
    else if (h.includes('product') && !h.includes('production')) set('product', i);
  }

  for (let i = 0; i < lower.length; i++) {
    const h = lower[i];
    if (out.leadSource < 0 && (h === 'source' || h === 'utm source')) set('leadSource', i);
  }

  return out;
}

function aggregateAttribution(rows) {
  /** @param {string} dim */
  function byDim(dim) {
    const map = new Map();
    for (const r of rows) {
      const raw = r[dim] == null ? '' : String(r[dim]).trim();
      const k = raw || '(blank)';
      const cur = map.get(k) || { key: k, revenue: 0, count: 0 };
      cur.revenue += r.amount;
      cur.count += 1;
      map.set(k, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }

  return {
    byLeadSource: byDim('leadSource'),
    bySourceTag: byDim('sourceTag'),
    byCampaign: byDim('campaign'),
    byAdset: byDim('adset'),
    byAd: byDim('ad'),
    byProduct: byDim('product')
  };
}

/**
 * @param {{ start: Date, end: Date }} dateRange
 * @returns {Promise<{ totalRevenue: number, dealCount: number, rows: Array<{date:string,amount:number}>, note: string, error?: string }>}
 */
async function fetchSheetsRevenueInRange(dateRange) {
  const rawJson = (process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '').trim();
  if (!rawJson) {
    return { totalRevenue: 0, dealCount: 0, rows: [], note: 'no GOOGLE_SERVICE_ACCOUNT_JSON', error: 'not_configured' };
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(rawJson);
  } catch (e) {
    return { totalRevenue: 0, dealCount: 0, rows: [], note: 'invalid JSON', error: 'bad_service_account_json' };
  }
  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    return { totalRevenue: 0, dealCount: 0, rows: [], note: 'missing client_email or private_key', error: 'bad_service_account_fields' };
  }

  const spreadsheetId = (process.env.GOOGLE_SHEETS_SPREADSHEET_ID || SPREADSHEET_ID_DEFAULT).trim();
  const range = (process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A1:Z2000').trim();

  const envDateCol = process.env.GOOGLE_SHEETS_DATE_COLUMN;
  const envAmtCol = process.env.GOOGLE_SHEETS_AMOUNT_COLUMN;
  const fixedDateIdx = envDateCol ? colLetterToIndex(envDateCol) : null;
  const fixedAmtIdx = envAmtCol ? colLetterToIndex(envAmtCol) : null;

  const tokenRes = await getAccessToken(serviceAccount);
  if (tokenRes.error) {
    return { totalRevenue: 0, dealCount: 0, rows: [], note: tokenRes.error, error: tokenRes.error };
  }

  const encRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encRange}`;
  const { status, body: raw } = await httpsReq(url, {
    headers: { Authorization: 'Bearer ' + tokenRes.accessToken }
  });

  if (status !== 200) {
    let msg = raw.slice(0, 300);
    try {
      const j = JSON.parse(raw);
      msg = j.error && j.error.message ? j.error.message : msg;
    } catch (e) { /* ignore */ }
    return { totalRevenue: 0, dealCount: 0, rows: [], note: msg, error: `sheets_api_${status}` };
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return { totalRevenue: 0, dealCount: 0, rows: [], note: 'bad sheets JSON', error: 'parse_error' };
  }

  const values = data.values || [];
  if (values.length === 0) {
    return { totalRevenue: 0, dealCount: 0, rows: [], note: 'empty range', error: null };
  }

  let startRow = 0;
  let dateIdx = fixedDateIdx != null ? fixedDateIdx : 0;
  let amtIdx = fixedAmtIdx != null ? fixedAmtIdx : 1;

  if (fixedDateIdx == null && fixedAmtIdx == null) {
    const h = findHeaderCols(values[0]);
    if (h.looksLikeHeader) {
      startRow = 1;
      if (h.dateIdx >= 0) dateIdx = h.dateIdx;
      if (h.amtIdx >= 0) amtIdx = h.amtIdx;
      if (dateIdx < 0) dateIdx = 0;
      if (amtIdx < 0) amtIdx = dateIdx === 0 ? 1 : 0;
    }
  }

  const headerLooks = values[0] ? findHeaderCols(values[0]).looksLikeHeader : false;
  const attrHeader =
    startRow === 1 || headerLooks
      ? findAttributionIndices(values[0] || [])
      : {
          leadSource: -1,
          sourceTag: -1,
          campaign: -1,
          adset: -1,
          ad: -1,
          product: -1,
          labels: {}
        };

  function cellAt(row, idx) {
    if (idx < 0) return '';
    const v = row[idx];
    return v == null ? '' : String(v).trim();
  }

  const startMs = dateRange.start.getTime();
  const endMs = dateRange.end ? dateRange.end.getTime() : Date.now();

  let totalRevenue = 0;
  const rows = [];
  const attributionDetail = [];
  for (let r = startRow; r < values.length; r++) {
    const row = values[r] || [];
    const d = parseDateCell(row[dateIdx]);
    const amt = parseMoneyCell(row[amtIdx]);
    if (!d || amt == null) continue;
    const t = d.getTime();
    if (t < startMs || t > endMs) continue;
    totalRevenue += amt;
    rows.push({ date: d.toISOString().slice(0, 10), amount: amt });
    attributionDetail.push({
      amount: amt,
      leadSource: cellAt(row, attrHeader.leadSource),
      sourceTag: cellAt(row, attrHeader.sourceTag),
      campaign: cellAt(row, attrHeader.campaign),
      adset: cellAt(row, attrHeader.adset),
      ad: cellAt(row, attrHeader.ad),
      product: cellAt(row, attrHeader.product)
    });
  }

  const attribution = aggregateAttribution(attributionDetail);
  const attributionColumnsDetected = {
    leadSource: attrHeader.leadSource >= 0,
    sourceTag: attrHeader.sourceTag >= 0,
    campaign: attrHeader.campaign >= 0,
    adset: attrHeader.adset >= 0,
    ad: attrHeader.ad >= 0,
    product: attrHeader.product >= 0
  };

  const note =
    fixedDateIdx != null || fixedAmtIdx != null
      ? `columns ${envDateCol || 'A'}/${envAmtCol || 'B'}, ${rows.length} rows in range`
      : `${rows.length} rows (auto date/amount columns)`;

  return {
    totalRevenue,
    dealCount: rows.length,
    rows,
    attribution,
    attributionColumnLabels: attrHeader.labels,
    attributionColumnsDetected,
    attributionRowCount: attributionDetail.length,
    note,
    error: null
  };
}

module.exports = {
  fetchSheetsRevenueInRange,
  SPREADSHEET_ID_DEFAULT
};
