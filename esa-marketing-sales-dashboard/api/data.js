const https = require('https');
const { fetchSheetsRevenueInRange, SPREADSHEET_ID_DEFAULT } = require('./sheetsRevenue');

const GHL_KEY = (process.env.GHL_API_KEY || '').trim();
const GHL_KEY_V2 = (process.env.GHL_API_KEY_V2 || '').trim();
const GHL_LOCATION_ID = (process.env.GHL_LOCATION_ID || '').trim();
const GHL_BASE = 'https://rest.gohighlevel.com/v1';
const GHL_V2_BASE = 'https://services.leadconnectorhq.com';
const PIPELINE_ID = 'LlthtHqW8V4PA9AWN8g7';

const META_TOKEN = (process.env.META_ACCESS_TOKEN || '').trim();
const META_ACCT = (process.env.META_AD_ACCOUNT_ID || '').trim();

/** GHL workflow tag for Meta instant-form leads (marketer: Sam Sauter). Single source of truth for “this came from Meta lead form.” */
const CANONICAL_META_LEAD_FORM_GHL_TAG = 'new lead - meta - lead form (sam)';

// SS + pipeline New Lead = Meta lead form, not booked yet; Diamond dials. See ESA_SALES_SYSTEM.md (booking/show rate defs).
// Also: CANONICAL_META_LEAD_FORM_GHL_TAG, src-fb-lead-form-ss, meta ss, or meta+lead form in same tag.
const SOURCES = [
  { tag: 'src-fb-lead-form-ss', label: 'FB Lead Form' },
  { tag: 'src-vsl',             label: 'VSL Funnel' },
  { tag: 'src-returning',       label: 'Returning client' },
  { tag: 'src-outbound',        label: 'Outbound Dialer' },
  { tag: 'src-coldcall',        label: 'Cold Call Events' },
  { tag: 'src-organic',         label: 'Organic' },
  { tag: 'src-brian-direct',    label: "Brian's Network" }
];

const LEGACY_SOURCE_MAP = {
  'source - fb lead form': 'src-fb-lead-form-ss',
  [CANONICAL_META_LEAD_FORM_GHL_TAG]: 'src-fb-lead-form-ss',
  'facebook ad': 'src-fb-lead-form-ss',
  'fb lead form - ss': 'src-fb-lead-form-ss',
  'source - fresh landing page': 'src-vsl',
  'source - landing page': 'src-vsl',
  'ess vsl lead form': 'src-vsl',
  'fresh lead vsl': 'src-vsl',
  'quiz completed': 'src-vsl',
  'source - setter outbound': 'src-outbound',
  '2/18/26 - esa rep booked call manually': 'src-outbound',
  'source - organic': 'src-organic',
  'organic website opt in': 'src-organic',
  'chat widget': 'src-organic',
  'fresh chat widget': 'src-organic',
  'instagram dm': 'src-organic',
  'facebook messenger': 'src-organic',
  'fb messenger': 'src-organic',
  'source:direct': 'src-brian-direct',
  'source:esa': 'src-brian-direct',
  'returning client': 'src-returning',
  'reactivation': 'src-returning',
  'winback': 'src-returning',
  'past client': 'src-returning',
  'old client': 'src-returning',
  'client comeback': 'src-returning'
};

const LEGACY_STATUS_MAP = {
  'closed won - ess client': 'status-closed-won',
  'qualified - ess $15k': 'status-closed-won',
  'closed lost': 'status-closed-lost',
  'closed lost - not ready': 'status-closed-lost',
  'ess - not qualified': 'status-closed-lost',
  'not qualified': 'status-closed-lost',
  'dnc': 'status-closed-lost',
  'appt booked by diamond': 'status-booked',
  'booked by diamond': 'status-booked',
  'diamond appt sets': 'status-booked',
  'self booked': 'status-booked',
  'lead form self book': 'status-booked',
  'ess - appt booked by setter': 'status-booked',
  'ess- booked closing call with brian': 'status-booked',
  'no-show': 'status-no-show',
  'no show': 'status-no-show',
  'appointment cancelled': 'status-no-show',
  'appt cancelled': 'status-no-show',
  'cancelled appointment': 'status-no-show',
  'status - nurture': 'status-nurture'
};

// Keep in sync with api/ghlDealConstants.js (Log deal form).
const PIPELINE_STAGES = [
  { id: '26fd4f29-96c2-419d-ad31-df4079ce209c', name: 'New Lead' },
  { id: '260f69ca-0e4e-4ef8-a0c8-d7e60aafd056', name: 'Booked' },
  { id: 'a54c1154-7b40-41cd-8ada-e14be4d64dd9', name: 'Showed' },
  { id: '0b52c6ae-e2c7-40cc-879d-e0fbc1f90299', name: 'Offer Made / FU Needed' },
  { id: '2d87708c-4bf9-4bc0-9559-1592385ce02a', name: 'Contract Sent' },
  { id: '47a0b7ad-a4e5-42cf-9bc8-44c6981a6254', name: 'Closed Won' },
  { id: '6670681d-724b-4457-a38b-c7998939f3da', name: 'Closed Lost' },
  { id: 'ac2413fd-9afd-48b4-9a0b-96937b342807', name: 'No-Show' },
  { id: '290bf7ab-3155-4c10-9865-9ec765026b14', name: 'Nurture' }
];

const CLOSED_WON_STAGE_ID = '47a0b7ad-a4e5-42cf-9bc8-44c6981a6254';

/** Strip merge tags so `{{ opportunity.cash_collected_to_date }}` works in env. */
function normalizeOppCashFieldToken(s) {
  let t = String(s || '').trim();
  const merge = t.match(/\{\{\s*opportunity\.([^}]+?)\s*\}\}/i);
  if (merge) return merge[1].trim();
  if (/^\{\{/.test(t)) t = t.replace(/^\{\{\s*|\s*\}\}$/g, '').trim();
  if (t.toLowerCase().startsWith('opportunity.')) t = t.slice('opportunity.'.length).trim();
  return t;
}

/**
 * Comma-separated opportunity custom field **IDs or field keys** (Settings → Custom fields → Opportunities).
 * Keys match merge tags: e.g. `cash_collected_to_date` for `{{ opportunity.cash_collected_to_date }}`.
 * First matching field with a numeric value wins.
 */
const GHL_OPP_CASH_CUSTOM_FIELD_IDS = (process.env.GHL_OPP_CASH_CUSTOM_FIELD_ID || '')
  .split(',')
  .map((s) => normalizeOppCashFieldToken(s))
  .filter(Boolean);

function customFieldEntryMatchesToken(cf, w) {
  if (!cf || typeof cf !== 'object') return false;
  const want = String(w).trim();
  if (!want) return false;
  const id = String(cf.id ?? cf.customFieldId ?? cf.fieldId ?? '').trim();
  if (id && id === want) return true;
  const rawKeys = [
    cf.fieldKey,
    cf.key,
    cf.name,
    cf.field_name,
    cf.slug,
    cf.label
  ].filter((x) => x != null && String(x).trim());
  const keyCandidates = [];
  for (const x of rawKeys) {
    const k = String(x).trim();
    keyCandidates.push(k);
    if (k.includes('.')) keyCandidates.push(k.split('.').pop());
  }
  return keyCandidates.some(
    (k) =>
      k === want ||
      k.toLowerCase() === want.toLowerCase() ||
      k.replace(/^.*\./, '').toLowerCase() === want.toLowerCase()
  );
}

/** Pipeline list responses often omit custom fields; fetch GET /opportunities/:id for Closed Won when cash still 0. Set 0 to disable. */
const GHL_OPP_FETCH_CASH_DETAILS = !['0', 'false', 'no', 'off'].includes(
  String(process.env.GHL_OPP_FETCH_CASH_DETAILS || '1').toLowerCase()
);

const GHL_OPP_CASH_ENRICH_MAX = (() => {
  const v = parseInt(process.env.GHL_OPP_CASH_ENRICH_MAX || '50', 10);
  return Number.isFinite(v) && v >= 0 ? v : 50;
})();

const GHL_OPP_DETAIL_DELAY_MS = (() => {
  const v = parseInt(process.env.GHL_OPP_DETAIL_DELAY_MS || '120', 10);
  return Number.isFinite(v) && v >= 0 ? v : 120;
})();

function parseMoneyish(raw) {
  if (raw == null || raw === '') return null;
  const n = parseFloat(String(raw).replace(/[$,]/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function snakeToCamel(s) {
  return String(s).replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function tryJsonArray(s) {
  if (typeof s !== 'string') return null;
  const t = s.trim();
  if (!t.startsWith('[')) return null;
  try {
    const j = JSON.parse(t);
    return Array.isArray(j) ? j : null;
  } catch {
    return null;
  }
}

function keyVariants(want) {
  const w = String(want).trim();
  return [...new Set([w, w.toLowerCase(), snakeToCamel(w), snakeToCamel(w).toLowerCase()])];
}

function collectCustomFieldArrays(o) {
  if (!o || typeof o !== 'object') return [];
  const lists = [];
  const push = (x) => {
    if (Array.isArray(x)) lists.push(x);
  };
  push(o.customField);
  push(o.customFields);
  push(o.customData);
  const p1 = tryJsonArray(o.customField);
  if (p1) lists.push(p1);
  const p2 = tryJsonArray(o.customFields);
  if (p2) lists.push(p2);
  return lists;
}

function rootKeyCash(o, want) {
  for (const v of keyVariants(want)) {
    if (Object.prototype.hasOwnProperty.call(o, v)) {
      const n = parseMoneyish(o[v]);
      if (n !== null) return n;
    }
  }
  const wl = String(want).trim().toLowerCase();
  const wc = snakeToCamel(want).toLowerCase();
  for (const k of Object.keys(o)) {
    const kl = String(k).toLowerCase();
    if (kl === wl || kl === wc || kl.replace(/.*\./, '') === wl) {
      const n = parseMoneyish(o[k]);
      if (n !== null) return n;
    }
  }
  return null;
}

function findCashInCustomFieldArray(list, wantId) {
  if (!Array.isArray(list)) return null;
  const w = String(wantId).trim();
  for (const cf of list) {
    if (!customFieldEntryMatchesToken(cf, w)) continue;
    const raw =
      cf.value ??
      cf.fieldValue ??
      cf.fieldValueString ??
      cf.answer ??
      cf.text ??
      cf.content ??
      cf.selectedValue ??
      '';
    const n = parseMoneyish(raw);
    if (n !== null) return n;
  }
  return null;
}

/** Last resort: bounded walk for nested custom field shapes GHL returns on some accounts. */
function deepScanCashCollected(o) {
  const tokens = GHL_OPP_CASH_CUSTOM_FIELD_IDS;
  let nodes = 0;
  const MAX_NODES = 120;

  function walk(node, depth) {
    if (node == null || depth > 14) return null;
    if (++nodes > MAX_NODES) return null;

    if (Array.isArray(node)) {
      for (const el of node) {
        const r = walk(el, depth + 1);
        if (r !== null) return r;
      }
      return null;
    }

    if (typeof node === 'object') {
      const valRaw =
        node.value ??
        node.fieldValue ??
        node.fieldValueString ??
        node.answer ??
        node.text ??
        node.content ??
        node.selectedValue ??
        '';
      const n = parseMoneyish(valRaw);
      if (n !== null) {
        for (const w of tokens) {
          if (customFieldEntryMatchesToken(node, w)) return n;
        }
      }
      for (const v of Object.values(node)) {
        const r = walk(v, depth + 1);
        if (r !== null) return r;
      }
    }
    return null;
  }

  return walk(o, 0);
}

/**
 * Read numeric cash collected from opportunity custom fields (GHL v1 shapes vary; pipeline list may omit these).
 */
function getCashCollectedFromOpp(o) {
  if (!GHL_OPP_CASH_CUSTOM_FIELD_IDS.length || !o || typeof o !== 'object') return 0;

  for (const want of GHL_OPP_CASH_CUSTOM_FIELD_IDS) {
    const rk = rootKeyCash(o, want);
    if (rk !== null) return rk;
  }

  for (const want of GHL_OPP_CASH_CUSTOM_FIELD_IDS) {
    const w = String(want).trim();
    const lists = collectCustomFieldArrays(o);
    for (const list of lists) {
      const hit = findCashInCustomFieldArray(list, w);
      if (hit !== null) return hit;
    }
    const cfObj = o.customFields;
    if (cfObj && typeof cfObj === 'object' && !Array.isArray(cfObj)) {
      for (const kv of keyVariants(want)) {
        const n = parseMoneyish(cfObj[kv]);
        if (n !== null) return n;
      }
      const wl = w.toLowerCase();
      for (const [k, val] of Object.entries(cfObj)) {
        const kl = String(k).toLowerCase();
        const short = kl.replace(/.*\./, '');
        if (kl === wl || short === wl || kl.endsWith(`.${wl}`)) {
          const nn = parseMoneyish(val);
          if (nn !== null) return nn;
        }
      }
    }
  }

  const deep = deepScanCashCollected(o);
  if (deep !== null) return deep;

  return 0;
}

function cashCollectionMode() {
  if (GHL_OPP_CASH_CUSTOM_FIELD_IDS.length) return 'custom_field';
  const v = String(process.env.GHL_CASH_MATCHES_CONTRACT || '').toLowerCase();
  if (v === '1' || v === 'true' || v === 'yes') return 'matches_contract';
  return 'none';
}

/** Contacts with these tags + status-booked count as "Booked by Diamond" for SS lead form QA. */
const TAG_LEAD_FORM_DIAMOND_BOOKED = new Set([
  'appt booked by diamond',
  'booked by diamond',
  'diamond appt sets'
]);

function httpsGet(url, headers) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const opts = { hostname: parsed.hostname, path: parsed.pathname + parsed.search, headers: headers || {} };
    https.get(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const j = JSON.parse(body);
          j._httpStatus = res.statusCode;
          resolve(j);
        } catch (e) {
          resolve({
            _httpStatus: res.statusCode,
            _nonJsonBody: String(body).slice(0, 240)
          });
        }
      });
    }).on('error', () => resolve({ _httpStatus: 0 }));
  });
}

/**
 * GHL sometimes returns tags as string[]; newer shapes use objects. Normalize so isESAContact keeps working.
 */
function ghlTagStrings(contact) {
  const raw = contact && contact.tags;
  if (!raw || !Array.isArray(raw)) return [];
  return raw
    .map((t) => {
      if (typeof t === 'string') return t.toLowerCase().trim();
      if (t && typeof t === 'object') {
        const s = t.tag || t.name || t.label || t.value || '';
        return String(s).toLowerCase().trim();
      }
      return '';
    })
    .filter(Boolean);
}

function ghlGet(url) { return httpsGet(url, { 'Authorization': 'Bearer ' + GHL_KEY }); }
function ghlV2Get(url) { return httpsGet(url, { 'Authorization': 'Bearer ' + GHL_KEY_V2, 'Version': '2021-07-28', 'Accept': 'application/json' }); }
function metaGet(url) { return httpsGet(url); }

function getDateRange(range, startStr, endStr) {
  const now = new Date();
  let start, end, metaPreset, metaCustom;

  if (range === 'custom' && startStr) {
    start = new Date(startStr + 'T00:00:00');
    end = endStr ? new Date(endStr + 'T23:59:59') : now;
    metaPreset = null;
    metaCustom = { since: startStr, until: endStr || now.toISOString().slice(0, 10) };
    return { start, end, metaPreset, metaCustom, label: startStr + ' to ' + (endStr || 'now') };
  }

  end = now;
  switch (range) {
    case '7d':  start = new Date(now - 7 * 86400000);  metaPreset = 'last_7d'; break;
    case '90d': start = new Date(now - 90 * 86400000); metaPreset = 'last_90d'; break;
    case 'all': start = new Date('2020-01-01');         metaPreset = 'maximum'; break;
    default:    start = new Date(now - 30 * 86400000);  metaPreset = 'last_30d'; break;
  }
  return { start, end, metaPreset, metaCustom: null, label: range || '30d' };
}

function ghlLocationQuery() {
  return GHL_LOCATION_ID ? '&locationId=' + encodeURIComponent(GHL_LOCATION_ID) : '';
}

async function getUsers() {
  const path = GHL_LOCATION_ID
    ? '/users/?locationId=' + encodeURIComponent(GHL_LOCATION_ID)
    : '/users/';
  const data = await ghlGet(GHL_BASE + path);
  const map = {};
  (data.users || []).forEach(u => { map[u.id] = u.name || (u.firstName + ' ' + u.lastName); });
  map['t5zOyXE5NPIvYXFqzuRb'] = 'Brian Rand';
  return map;
}

async function getAllContacts() {
  const contacts = [];
  let apiError = null;
  let url = GHL_BASE + '/contacts/?limit=100' + ghlLocationQuery();
  let page = 0;
  while (url && page < 50) {
    const data = await ghlGet(url);
    if (page === 0) {
      const st = data._httpStatus || 0;
      if (st >= 400) {
        apiError = data.msg || data.message || data.error || ('GHL HTTP ' + st);
      } else if (data._nonJsonBody) {
        apiError = 'GHL returned non-JSON (check API key / network)';
      } else if (!Array.isArray(data.contacts) && (data.msg || data.message)) {
        apiError = data.msg || data.message;
      }
    }
    contacts.push(...(data.contacts || []));
    const next = (data.meta || {}).nextPageUrl || '';
    url = next ? next.replace('http://', 'https://') : null;
    page++;
    await new Promise(r => setTimeout(r, 150));
  }
  return { contacts, apiError };
}

async function getAllPipelineOpportunitiesV2() {
  if (!GHL_KEY_V2 || !GHL_LOCATION_ID) return null;
  const all = [];
  const seenIds = new Set();
  let startAfterId = '';
  let page = 0;
  while (page < 80) {
    const qs = `?location_id=${encodeURIComponent(GHL_LOCATION_ID)}&pipeline_id=${encodeURIComponent(PIPELINE_ID)}&limit=100` +
      (startAfterId ? `&startAfterId=${encodeURIComponent(startAfterId)}` : '');
    const data = await ghlV2Get(GHL_V2_BASE + '/opportunities/search' + qs);
    if (data._httpStatus !== 200 || !data.opportunities) return null; // fall back to v1
    let added = 0;
    for (const opp of data.opportunities) {
      if (opp.id && !seenIds.has(opp.id)) {
        seenIds.add(opp.id);
        all.push(opp);
        added++;
      }
    }
    // v2 search: use startAfterId from meta for pagination; stop on empty page or no new items.
    const nextId = data.meta?.startAfterId || '';
    if (!nextId || added === 0 || data.opportunities.length < 100) break;
    startAfterId = nextId;
    page++;
    await new Promise(r => setTimeout(r, 150));
  }
  return all;
}

async function getAllPipelineOpportunitiesV1List() {
  const all = [];
  let url = GHL_BASE + '/pipelines/' + PIPELINE_ID + '/opportunities?limit=100' + ghlLocationQuery();
  let page = 0;
  while (url && page < 80) {
    const data = await ghlGet(url);
    all.push(...(data.opportunities || []));
    const next = (data.meta || {}).nextPageUrl || '';
    url = next ? next.replace('http://', 'https://') : null;
    page++;
    await new Promise(r => setTimeout(r, 150));
  }
  return all;
}

/** @returns {{ opportunities: unknown[], opportunitiesFetchedVia: 'v2' | 'v1' }} */
async function getAllPipelineOpportunities() {
  // Prefer v2 — it returns customFields inline on every opportunity (no per-opp detail fetch needed).
  const v2 = await getAllPipelineOpportunitiesV2();
  if (v2 && v2.length > 0) {
    return { opportunities: v2, opportunitiesFetchedVia: 'v2' };
  }

  const all = await getAllPipelineOpportunitiesV1List();
  return { opportunities: all, opportunitiesFetchedVia: 'v1' };
}

function opportunityDetailUrl(oppId) {
  const q = GHL_LOCATION_ID ? '?locationId=' + encodeURIComponent(GHL_LOCATION_ID) : '';
  return `${GHL_BASE}/opportunities/${encodeURIComponent(oppId)}${q}`;
}

function opportunityDetailUrlPlain(oppId) {
  return `${GHL_BASE}/opportunities/${encodeURIComponent(oppId)}`;
}

function opportunityDetailUrlV2(oppId) {
  return `${GHL_V2_BASE}/opportunities/${encodeURIComponent(oppId)}`;
}

async function ghlGetOpportunityDetailBestEffort(oppId) {
  // Prefer v2 API — it returns opportunity custom fields (v1 does not).
  if (GHL_KEY_V2) {
    const v2 = await ghlV2Get(opportunityDetailUrlV2(oppId));
    if (v2._httpStatus === 200 && !v2._nonJsonBody) return v2;
  }
  // Fall back to v1.
  let raw = await ghlGet(opportunityDetailUrl(oppId));
  if (raw._httpStatus === 200 && !raw._nonJsonBody) return raw;
  if (GHL_LOCATION_ID) {
    const alt = await ghlGet(opportunityDetailUrlPlain(oppId));
    if (alt._httpStatus === 200 && !alt._nonJsonBody) return alt;
  }
  return raw;
}

function mergeOpportunityDetail(base, rawJson) {
  if (!rawJson || typeof rawJson !== 'object') return base;
  const d = rawJson.opportunity || rawJson;
  if (!d || typeof d !== 'object' || !d.id) return base;
  return { ...base, ...d };
}

/**
 * Pipeline opportunity lists often omit customField data. Pull full opportunity for Closed Won when cash is still 0.
 */
async function enrichOpportunitiesWithCashDetails(opps, meta) {
  const m = meta || {};
  m.fetches = 0;
  if ((!GHL_KEY && !GHL_KEY_V2) || !GHL_OPP_CASH_CUSTOM_FIELD_IDS.length || !GHL_OPP_FETCH_CASH_DETAILS) {
    return opps;
  }

  const out = opps.map((o) => ({ ...o }));
  const maxFetches = GHL_OPP_CASH_ENRICH_MAX === 0 ? Infinity : GHL_OPP_CASH_ENRICH_MAX;

  for (let i = 0; i < out.length; i++) {
    if (m.fetches >= maxFetches) break;
    const o = out[i];
    if (o.pipelineStageId !== CLOSED_WON_STAGE_ID || !o.id) continue;
    if (getCashCollectedFromOpp(o) > 0) continue;

    const raw = await ghlGetOpportunityDetailBestEffort(o.id);
    m.fetches++;
    m.lastOppDetailHttpStatus = raw._httpStatus;
    if (raw._httpStatus === 200 && !raw._nonJsonBody) {
      out[i] = mergeOpportunityDetail(o, raw);
    }
    if (GHL_OPP_DETAIL_DELAY_MS) {
      await new Promise((r) => setTimeout(r, GHL_OPP_DETAIL_DELAY_MS));
    }
  }
  return out;
}

function buildStageDataFromOpps(opps) {
  const stageMap = {};
  PIPELINE_STAGES.forEach(s => { stageMap[s.id] = { stage: s.name, count: 0, value: 0 }; });
  opps.forEach(o => {
    const sid = o.pipelineStageId;
    if (stageMap[sid]) {
      stageMap[sid].count++;
      stageMap[sid].value += parseFloat(o.monetaryValue) || 0;
    }
  });
  return PIPELINE_STAGES.map(s => stageMap[s.id]);
}

/**
 * Revenue + ROAS from GHL opportunities: Closed Won, closed in date range (lastStatusChangeAt).
 * monetaryValue on the opp is the source of truth. Optional GHL_DEAL_VALUE_FALLBACK if value not set.
 */
function computeClosedWonDealMetrics(allOpps, dateRange, allContacts, userMap) {
  const startMs = dateRange.start.getTime();
  const endMs = dateRange.end ? dateRange.end.getTime() : Date.now();
  const fallback = parseFloat(process.env.GHL_DEAL_VALUE_FALLBACK || '0') || 0;
  const umap = userMap || {};

  const contactById = {};
  (allContacts || []).forEach(c => { if (c.id) contactById[c.id] = c; });

  let totalRevenue = 0;
  let dealCount = 0;
  let dealsUsingFallback = 0;
  const bySourceRevenue = {};
  const bySourceDealCount = {};
  const teamDealRevenue = {};
  const teamDealCount = {};
  const closedWonDeals = [];
  const bySourceCash = {};
  let totalCashCollected = 0;
  const cashMode = cashCollectionMode();

  for (const o of allOpps) {
    if (o.pipelineStageId !== CLOSED_WON_STAGE_ID) continue;
    const closedAt = new Date(o.lastStatusChangeAt || o.updatedAt || 0).getTime();
    if (closedAt < startMs || closedAt > endMs) continue;

    let amount = parseFloat(o.monetaryValue);
    let usedFallback = false;
    if (!amount || amount <= 0) {
      if (fallback > 0) {
        amount = fallback;
        usedFallback = true;
        dealsUsingFallback++;
      } else {
        continue;
      }
    }

    dealCount++;
    totalRevenue += amount;

    let cashVal = 0;
    if (cashMode === 'custom_field') cashVal = getCashCollectedFromOpp(o);
    else if (cashMode === 'matches_contract') cashVal = amount;
    totalCashCollected += cashVal;

    const cid = (o.contact && o.contact.id) ? o.contact.id : null;
    const c = cid ? contactById[cid] : null;
    const tags = c ? ghlTagStrings(c) : [];
    const src = (c && isESAContact(tags)) ? (resolveSource(tags) || 'unknown') : 'unknown';
    bySourceRevenue[src] = (bySourceRevenue[src] || 0) + amount;
    bySourceDealCount[src] = (bySourceDealCount[src] || 0) + 1;
    bySourceCash[src] = (bySourceCash[src] || 0) + cashVal;

    const aid = c ? (c.assignedTo || 'unassigned') : 'unassigned';
    teamDealRevenue[aid] = (teamDealRevenue[aid] || 0) + amount;
    teamDealCount[aid] = (teamDealCount[aid] || 0) + 1;

    const srcLabel =
      src === 'unknown'
        ? 'Untagged / Other'
        : (SOURCES.find(s => s.tag === src) || { label: 'Untagged / Other' }).label;
    const contactName = c
      ? (c.contactName || `${c.firstName || ''} ${c.lastName || ''}`.trim()) || '—'
      : '—';

    closedWonDeals.push({
      opportunityId: o.id || '',
      opportunityName: (o.name || '').trim(),
      amount: Math.round(amount * 100) / 100,
      cashCollected: Math.round(cashVal * 100) / 100,
      usedFallback,
      closedAt: new Date(closedAt).toISOString(),
      contactId: cid || '',
      contactName,
      email: (c && c.email) || '',
      sourceTag: src,
      sourceLabel: srcLabel,
      assignedTo: umap[aid] || aid,
      tagsPreview: tags.slice(0, 25).join(', ')
    });
  }

  closedWonDeals.sort((a, b) => b.amount - a.amount || new Date(b.closedAt) - new Date(a.closedAt));

  const topCashBySource = Object.entries(bySourceCash)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([tag, amt]) => ({
      tag,
      label:
        tag === 'unknown'
          ? 'Untagged / Other'
          : (SOURCES.find((s) => s.tag === tag) || { label: 'Untagged / Other' }).label,
      cash: Math.round(amt * 100) / 100
    }));
  while (topCashBySource.length < 2) {
    topCashBySource.push({ tag: '', label: '—', cash: 0 });
  }

  /** Row C: top 2 lead sources by Closed Won TCV, each with cash collected on those opps (same tags). */
  const topTcvBySource = Object.entries(bySourceRevenue)
    .filter(([, rev]) => rev > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([tag, rev]) => ({
      tag,
      label:
        tag === 'unknown'
          ? 'Untagged / Other'
          : (SOURCES.find((s) => s.tag === tag) || { label: 'Untagged / Other' }).label,
      tcv: Math.round(rev * 100) / 100,
      cash: Math.round((bySourceCash[tag] || 0) * 100) / 100
    }));
  while (topTcvBySource.length < 2) {
    topTcvBySource.push({ tag: '', label: '—', tcv: 0, cash: 0 });
  }

  return {
    totalRevenue,
    totalContractValue: totalRevenue,
    totalCashCollected: Math.round(totalCashCollected * 100) / 100,
    cashCollectionMode: cashMode,
    topCashBySource,
    topTcvBySource,
    dealCount,
    dealsUsingFallback,
    bySourceRevenue,
    bySourceDealCount,
    bySourceCash,
    teamDealRevenue,
    teamDealCount,
    closedWonDeals
  };
}

function actionsToMap(actions) {
  const m = {};
  (actions || []).forEach(a => { m[a.action_type] = parseInt(a.value, 10) || 0; });
  return m;
}

/** Match Ads Manager "Results": form leads vs website custom conversions (e.g. Schedule). */
function metaPrimaryResult(am, objective) {
  const lead = am.lead || 0;
  const leadGrouped = am['onsite_conversion.lead_grouped'] || 0;
  const pixelCustom = am['offsite_conversion.fb_pixel_custom'] || 0;
  const completeReg = am.complete_registration || am['offsite_conversion.fb_pixel_complete_registration'] || 0;
  const obj = (objective || '').toUpperCase();

  if (pixelCustom >= 15 && lead > pixelCustom * 1.15) {
    return pixelCustom;
  }

  if (obj === 'OUTCOME_SALES' || obj === 'OUTCOME_TRAFFIC') {
    if (pixelCustom > 0) return pixelCustom;
    if (completeReg > 0) return completeReg;
    return leadGrouped || lead;
  }
  if (obj === 'OUTCOME_LEADS' || obj === 'LEAD_GENERATION') {
    if (leadGrouped > 0 && leadGrouped >= lead * 0.7) return leadGrouped;
    return lead;
  }
  if (leadGrouped > 0) return leadGrouped;
  return lead || pixelCustom || completeReg;
}

async function getMetaCampaignObjectives(acct, token) {
  const map = {};
  let url = 'https://graph.facebook.com/v19.0/' + acct + '/campaigns?fields=id,objective&limit=500&access_token=' + token;
  let guard = 0;
  while (url && guard < 20) {
    const data = await metaGet(url);
    (data.data || []).forEach(c => { map[c.id] = c.objective || ''; });
    url = (data.paging && data.paging.next) ? data.paging.next : null;
    guard++;
    await new Promise(r => setTimeout(r, 80));
  }
  return map;
}

/** Meta campaigns that match “SS | Lead Form …” style (for apples-to-apples vs GHL SS tag). */
function isMetaSSLeadFormCampaignName(name) {
  const t = (name || '').trim();
  if (!/lead\s*form/i.test(t)) return false;
  return /^ss\s*\|/i.test(t) || /^ss\s+lead/i.test(t);
}

/** Paginate campaign insights so rows are not truncated at Meta’s first page. */
async function fetchAllCampaignInsightRows(acct, dateParam, token) {
  const rows = [];
  let url = 'https://graph.facebook.com/v19.0/' + acct + '/insights?fields=campaign_id,campaign_name,spend,impressions,clicks,actions&level=campaign&' + dateParam + '&limit=500&access_token=' + token;
  let guard = 0;
  while (url && guard < 20) {
    const data = await metaGet(url);
    rows.push(...(data.data || []));
    url = (data.paging && data.paging.next) ? data.paging.next : null;
    guard++;
    await new Promise(r => setTimeout(r, 100));
  }
  return rows;
}

async function getMetaAdSpend(dateRange) {
  const emptyBundle = { results: 0, spend: 0, impressions: 0, clicks: 0 };
  if (!META_TOKEN || !META_ACCT) {
    return { spend: 0, impressions: 0, clicks: 0, campaigns: [], metaSSLeadFormBundle: emptyBundle, source: 'none' };
  }
  const acct = META_ACCT.startsWith('act_') ? META_ACCT : 'act_' + META_ACCT;
  const base = 'https://graph.facebook.com/v19.0/' + acct;

  let dateParam;
  if (dateRange.metaCustom) {
    dateParam = 'time_range={"since":"' + dateRange.metaCustom.since + '","until":"' + dateRange.metaCustom.until + '"}';
  } else {
    dateParam = 'date_preset=' + (dateRange.metaPreset || 'last_30d');
  }

  const [accountData, campaignRows, objectiveById] = await Promise.all([
    metaGet(base + '/insights?fields=spend,impressions,clicks&' + dateParam + '&access_token=' + META_TOKEN),
    fetchAllCampaignInsightRows(acct, dateParam, META_TOKEN),
    getMetaCampaignObjectives(acct, META_TOKEN)
  ]);

  let spend = 0, impressions = 0, clicks = 0;
  if (accountData.data && accountData.data[0]) {
    const d = accountData.data[0];
    spend = parseFloat(d.spend) || 0;
    impressions = parseInt(d.impressions) || 0;
    clicks = parseInt(d.clicks) || 0;
  }

  const campaigns = [];
  campaignRows.forEach(c => {
    const am = actionsToMap(c.actions);
    const objective = objectiveById[c.campaign_id] || '';
    const leads = metaPrimaryResult(am, objective);
    campaigns.push({
      name: c.campaign_name,
      spend: parseFloat(c.spend) || 0,
      impressions: parseInt(c.impressions) || 0,
      clicks: parseInt(c.clicks) || 0,
      leads
    });
  });

  let metaSSLeadFormResults = 0;
  let metaSSLeadFormSpend = 0;
  let metaSSLeadFormImpressions = 0;
  let metaSSLeadFormClicks = 0;
  campaigns.forEach(c => {
    if (!isMetaSSLeadFormCampaignName(c.name)) return;
    metaSSLeadFormResults += c.leads || 0;
    metaSSLeadFormSpend += c.spend || 0;
    metaSSLeadFormImpressions += c.impressions || 0;
    metaSSLeadFormClicks += c.clicks || 0;
  });

  return {
    spend,
    impressions,
    clicks,
    campaigns: campaigns.sort((a, b) => b.spend - a.spend),
    metaSSLeadFormBundle: {
      results: metaSSLeadFormResults,
      spend: metaSSLeadFormSpend,
      impressions: metaSSLeadFormImpressions,
      clicks: metaSSLeadFormClicks
    },
    source: spend > 0 ? 'meta_api' : 'none'
  };
}

const ESA_INDICATOR_TAGS = new Set(Object.keys(LEGACY_SOURCE_MAP).concat([
  'appt booked by diamond', 'booked by diamond', 'diamond appt sets', 'lead form self book',
  'ess - appt booked by setter', 'ess- booked closing call with brian',
  'closed won - ess client', 'qualified - ess $15k', 'ess - not qualified'
]));

/** True if tag indicates Meta (Facebook) instant / lead-form traffic (not “metadata” generic). */
function tagLooksLikeMetaLeadForm(t) {
  if (t === CANONICAL_META_LEAD_FORM_GHL_TAG) return true;
  if (t.startsWith('new lead - meta - lead form')) return true;
  if (t.includes('meta ss')) return true;
  if (t.includes('meta') && t.includes('lead form')) return true;
  return false;
}

function isESAContact(tags) {
  for (const t of tags) {
    if (t.startsWith('src-') || t.startsWith('status-')) return true;
    if (tagLooksLikeMetaLeadForm(t)) return true;
    if (ESA_INDICATOR_TAGS.has(t)) return true;
  }
  return false;
}

function resolveSource(tags) {
  for (const t of tags) { if (t.startsWith('src-')) return t; }
  for (const t of tags) { if (LEGACY_SOURCE_MAP[t]) return LEGACY_SOURCE_MAP[t]; }
  for (const t of tags) { if (tagLooksLikeMetaLeadForm(t)) return 'src-fb-lead-form-ss'; }
  return null;
}

function resolveStatuses(tags) {
  const found = new Set();
  for (const t of tags) {
    if (t.startsWith('status-')) found.add(t);
    if (LEGACY_STATUS_MAP[t]) found.add(LEGACY_STATUS_MAP[t]);
  }
  return found;
}

function buildMetrics(allContacts, stageData, userMap, metaData, dateRange, allOpps) {
  const dealMetrics = computeClosedWonDealMetrics(allOpps || [], dateRange, allContacts, userMap);

  const startMs = dateRange.start.getTime();
  const endMs = dateRange.end ? dateRange.end.getTime() : Date.now();
  const contacts = allContacts.filter(c => {
    const added = new Date(c.dateAdded || c.createdAt || 0).getTime();
    return added >= startMs && added <= endMs;
  });

  const bySource = {};
  SOURCES.forEach(s => { bySource[s.tag] = { tag: s.tag, label: s.label, leads: 0, booked: 0, showed: 0, offered: 0, closed: 0, revenue: 0 }; });
  bySource['unknown'] = { tag: 'unknown', label: 'Untagged / Other', leads: 0, booked: 0, showed: 0, offered: 0, closed: 0, revenue: 0 };

  const totals = { leads: 0, booked: 0, showed: 0, offered: 0, contractSent: 0, closedWon: 0, closedLost: 0, noShow: 0, nurture: 0, revenue: dealMetrics.totalRevenue };
  const leadFormMarketing = { total: 0, booked: 0, bookedByDiamond: 0, selfBookTagged: 0 };
  const teamMap = {};
  const rawRows = [];

  for (const c of contacts) {
    const tags = ghlTagStrings(c);
    if (!isESAContact(tags)) continue;

    const statuses = resolveStatuses(tags);
    const src = resolveSource(tags) || 'unknown';
    const srcLabel = (SOURCES.find(s => s.tag === src) || { label: 'Untagged' }).label;
    const bucket = bySource[src] || bySource['unknown'];

    totals.leads++; bucket.leads++;
    if (statuses.has('status-booked'))        { totals.booked++; bucket.booked++; }
    if (statuses.has('status-showed'))         { totals.showed++; bucket.showed++; }
    if (statuses.has('status-offer-made'))     { totals.offered++; bucket.offered++; }
    if (statuses.has('status-contract-sent'))    totals.contractSent++;
    if (statuses.has('status-closed-won'))     { totals.closedWon++; }
    if (statuses.has('status-closed-lost'))      totals.closedLost++;
    if (statuses.has('status-no-show'))          totals.noShow++;
    if (statuses.has('status-nurture'))          totals.nurture++;

    const aid = c.assignedTo || 'unassigned';
    const name = userMap[aid] || aid;
    if (!teamMap[aid]) teamMap[aid] = { id: aid, name, callsSet: 0, shows: 0, offers: 0, closes: 0, revenue: 0 };
    if (statuses.has('status-booked'))      teamMap[aid].callsSet++;
    if (statuses.has('status-showed'))       teamMap[aid].shows++;
    if (statuses.has('status-offer-made'))   teamMap[aid].offers++;

    if (src === 'src-fb-lead-form-ss') {
      leadFormMarketing.total++;
      if (statuses.has('status-booked')) {
        leadFormMarketing.booked++;
        if (tags.some(t => TAG_LEAD_FORM_DIAMOND_BOOKED.has(t))) leadFormMarketing.bookedByDiamond++;
        if (tags.includes('lead form self book')) leadFormMarketing.selfBookTagged++;
      }
    }

    const statusList = Array.from(statuses).map(s => s.replace('status-', '')).join(', ');
    rawRows.push({
      name: c.contactName || ((c.firstName || '') + ' ' + (c.lastName || '')).trim() || '(no name)',
      email: c.email || '',
      phone: c.phone || '',
      source: srcLabel,
      sourceTag: src,
      statuses: statusList,
      assignedTo: name,
      dateAdded: c.dateAdded || c.createdAt || '',
      lastActivity: c.lastActivity ? new Date(c.lastActivity).toISOString() : '',
      allTags: tags.join(', ')
    });
  }

  SOURCES.forEach(s => {
    bySource[s.tag].revenue = dealMetrics.bySourceRevenue[s.tag] || 0;
    bySource[s.tag].closed = dealMetrics.bySourceDealCount[s.tag] || 0;
  });
  bySource['unknown'].revenue = dealMetrics.bySourceRevenue['unknown'] || 0;
  bySource['unknown'].closed = dealMetrics.bySourceDealCount['unknown'] || 0;

  Object.keys(dealMetrics.teamDealCount).forEach(aid => {
    if (!teamMap[aid]) {
      teamMap[aid] = { id: aid, name: userMap[aid] || aid, callsSet: 0, shows: 0, offers: 0, closes: 0, revenue: 0 };
    }
    teamMap[aid].closes = dealMetrics.teamDealCount[aid];
    teamMap[aid].revenue = dealMetrics.teamDealRevenue[aid] || 0;
  });

  const AD_SPEND = metaData.spend > 0 ? metaData.spend : 0;
  const adSource = metaData.source === 'meta_api' ? 'Meta API (live)' : 'No Meta data';
  const leads = totals.leads || 1;
  const booked = totals.booked || 1;
  const r = (n, d = 2) => Math.round(n * 10**d) / 10**d;

  const mss = metaData.metaSSLeadFormBundle || { results: 0, spend: 0, impressions: 0, clicks: 0 };
  const lfTotal = leadFormMarketing.total;
  const lfBooked = leadFormMarketing.booked;
  const lfUnbooked = Math.max(0, lfTotal - lfBooked);
  const lfBookRate = lfTotal > 0 ? r((lfBooked / lfTotal) * 100) : 0;
  const lfDiamondOfBooked = lfBooked > 0 ? r((leadFormMarketing.bookedByDiamond / lfBooked) * 100) : 0;

  return {
    contractVersion: "esa.metrics.v1",
    sourceSystems: ["ghl", "meta"],
    dateRange: dateRange.label,
    adSpend: AD_SPEND,
    adSource,
    metaImpressions: metaData.impressions || 0,
    metaClicks: metaData.clicks || 0,
    metaCampaigns: metaData.campaigns || [],
    metaLeads: (metaData.campaigns || []).reduce((s, c) => s + (c.leads || 0), 0),
    leadFormMarketing: {
      canonicalGhlMetaLeadFormTag: CANONICAL_META_LEAD_FORM_GHL_TAG,
      total: lfTotal,
      booked: lfBooked,
      bookedByDiamond: leadFormMarketing.bookedByDiamond,
      unbooked: lfUnbooked,
      selfBookTagged: leadFormMarketing.selfBookTagged,
      bookRatePct: lfBookRate,
      diamondShareOfBookedPct: lfDiamondOfBooked,
      metaSSLeadFormResults: mss.results || 0,
      metaSSLeadFormSpend: mss.spend || 0,
      metaSSLeadFormImpressions: mss.impressions || 0,
      metaSSLeadFormClicks: mss.clicks || 0
    },
    leads: totals.leads,
    bookedCalls: totals.booked,
    leadBookPct: r((totals.booked / leads) * 100),
    liveCalls: totals.showed,
    cpl: AD_SPEND > 0 ? r(AD_SPEND / leads) : 0,
    costPerBooking: AD_SPEND > 0 ? r(AD_SPEND / booked) : 0,
    costPerLive: AD_SPEND > 0 && totals.showed > 0 ? r(AD_SPEND / totals.showed) : 0,
    showRate: r((totals.showed / booked) * 100),
    offerRate: totals.showed > 0 ? r((totals.offered / totals.showed) * 100) : 0,
    closeRate: totals.showed > 0 ? r((totals.closedWon / totals.showed) * 100) : 0,
    cpa: AD_SPEND > 0 && dealMetrics.dealCount > 0 ? r(AD_SPEND / dealMetrics.dealCount) : 0,
    aov: dealMetrics.dealCount > 0 ? r(dealMetrics.totalRevenue / dealMetrics.dealCount) : 0,
    cashCollectedPct:
      dealMetrics.totalContractValue > 0
        ? r((100 * dealMetrics.totalCashCollected) / dealMetrics.totalContractValue)
        : 0,
    avgUpfrontCash:
      dealMetrics.dealCount > 0 ? r(dealMetrics.totalCashCollected / dealMetrics.dealCount) : 0,
    upfrontRoas: AD_SPEND > 0 && dealMetrics.totalRevenue > 0 ? r(dealMetrics.totalRevenue / AD_SPEND) : 0,
    revenue: totals.revenue,
    pipelineValue: stageData.reduce((sum, s) => sum + s.value, 0),
    totalContacts: allContacts.length,
    contactsInRange: contacts.length,
    bySource: SOURCES.map(s => bySource[s.tag]).concat([bySource['unknown']]).filter(s => s.leads > 0 || s.revenue > 0 || s.closed > 0),
    byStage: stageData,
    team: Object.values(teamMap).filter(t => t.callsSet > 0 || t.shows > 0 || t.closes > 0).sort((a, b) => (b.closes + b.shows + b.callsSet) - (a.closes + a.shows + a.callsSet)),
    statusCounts: {
      newLead: totals.leads,
      booked: totals.booked,
      showed: totals.showed,
      offered: totals.offered,
      contractSent: totals.contractSent,
      closedWon: totals.closedWon,
      closedWonDeals: dealMetrics.dealCount,
      closedLost: totals.closedLost,
      noShow: totals.noShow,
      nurture: totals.nurture
    },
    revenueModel: {
      source: 'ghl_opportunities',
      pipelineId: PIPELINE_ID,
      closedWonStageId: CLOSED_WON_STAGE_ID,
      attribution: 'Opportunity lastStatusChangeAt in selected date range; sum of monetaryValue.',
      dealCount: dealMetrics.dealCount,
      dealsUsingFallback: dealMetrics.dealsUsingFallback
    },
    marketingKpiStrip: {
      totalContractValue: dealMetrics.totalContractValue,
      totalCashCollected: dealMetrics.totalCashCollected,
      cashMode: dealMetrics.cashCollectionMode,
      cashCustomFieldCount: GHL_OPP_CASH_CUSTOM_FIELD_IDS.length,
      topCashBySource: dealMetrics.topCashBySource,
      topTcvBySource: dealMetrics.topTcvBySource,
      tcvSource: 'ghl_closed_won'
    },
    closedWonDeals: dealMetrics.closedWonDeals || [],
    rawData: rawRows,
    fetchedAt: new Date().toISOString()
  };
}

function summarizeOppCashShape(o) {
  if (!o || !o.id) return null;
  const lists = collectCustomFieldArrays(o);
  const flat = lists.flat();
  const fieldShapePreview = flat
    .filter((x) => x && typeof x === 'object')
    .slice(0, 25)
    .map((cf) => ({
      id: cf.id ?? cf.customFieldId ?? null,
      fieldKey: cf.fieldKey ?? cf.key ?? null,
      name: cf.name ?? cf.label ?? null,
      hasValue: !(
        (cf.value == null || cf.value === '') &&
        (cf.fieldValue == null || cf.fieldValue === '')
      )
    }));
  const topLevelKeysMatchingFieldNames = Object.keys(o).filter((k) =>
    /custom|field|data|meta|attr|payment|cash/i.test(k)
  );
  return {
    opportunityId: o.id,
    topLevelKeysMatchingFieldNames: topLevelKeysMatchingFieldNames.slice(0, 35),
    mergedFieldEntryCount: flat.length,
    fieldShapePreview
  };
}

function buildGhlCashDiagnostic(allOpps, meta, dateRange, opportunitiesFetchedVia) {
  const startMs = dateRange.start.getTime();
  const endMs = dateRange.end ? dateRange.end.getTime() : Date.now();
  const inRangeWon = allOpps.filter((o) => {
    if (o.pipelineStageId !== CLOSED_WON_STAGE_ID || !o.id) return false;
    const closedAt = new Date(o.lastStatusChangeAt || o.updatedAt || 0).getTime();
    return closedAt >= startMs && closedAt <= endMs;
  });
  const first = inRangeWon[0];
  let sample = null;
  if (first) sample = summarizeOppCashShape(first);
  if (!sample) {
    for (const o of allOpps) {
      if (o.pipelineStageId === CLOSED_WON_STAGE_ID && o.id) {
        sample = summarizeOppCashShape(o);
        break;
      }
    }
  }
  return {
    hint: 'Remove ?ghlCashDebug=1 after fixing. Dollar amounts not listed; only field shapes.',
    configuredTokens: GHL_OPP_CASH_CUSTOM_FIELD_IDS,
    cashMode: cashCollectionMode(),
    opportunitiesFetchedVia: opportunitiesFetchedVia || null,
    enrichFetches: meta.fetches,
    lastOppDetailHttpStatus: meta.lastOppDetailHttpStatus,
    closedWonInSelectedRange: inRangeWon.length,
    firstInRangeOpportunityId: first ? first.id : null,
    parsedCashOnFirstInRangeDeal: first != null ? getCashCollectedFromOpp(first) : null,
    sampleOppFieldShape: sample
  };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');

  if (!GHL_KEY) return res.status(500).json({ error: 'GHL_API_KEY not configured' });

  const q = req.query || {};
  const range = q.range || '30d';
  const dateRange = getDateRange(range, q.start, q.end);

  const sheetsMode = String(process.env.SHEETS_REVENUE_MODE || 'off').toLowerCase();
  const sheetsAttrOn = ['1', 'true', 'yes', 'on'].includes(
    String(process.env.GOOGLE_SHEETS_ATTRIBUTION || '').toLowerCase()
  );
  const fetchSheet = sheetsMode === 'replace' || sheetsAttrOn;

  try {
    const [contactFetch, userMap, metaData, oppBundle, sheetSnap] = await Promise.all([
      getAllContacts(),
      getUsers(),
      getMetaAdSpend(dateRange),
      getAllPipelineOpportunities(),
      fetchSheet ? fetchSheetsRevenueInRange(dateRange) : Promise.resolve(null)
    ]);
    const allOppsRaw = (oppBundle && oppBundle.opportunities) || [];
    const opportunitiesFetchedVia =
      (oppBundle && oppBundle.opportunitiesFetchedVia) || 'v1';
    const allContacts = contactFetch.contacts || [];
    const cashEnrichMeta = { fetches: 0 };
    const allOpps = await enrichOpportunitiesWithCashDetails(allOppsRaw, cashEnrichMeta);
    const stageData = buildStageDataFromOpps(allOpps);

    let metrics = buildMetrics(allContacts, stageData, userMap, metaData, dateRange, allOpps);

    if (metrics.marketingKpiStrip) {
      metrics.marketingKpiStrip.opportunitiesFetchedVia = opportunitiesFetchedVia;
      if (cashEnrichMeta.fetches > 0) {
        metrics.marketingKpiStrip.ghlOpportunityCashFetches = cashEnrichMeta.fetches;
      }
    }

    if (contactFetch.apiError) {
      metrics.ghlContactsApiError = contactFetch.apiError;
    }
    if (!allContacts.length) {
      metrics.ghlDataWarning =
        contactFetch.apiError ||
        (GHL_LOCATION_ID
          ? 'GHL returned no contacts for this location. Verify GHL_API_KEY and GHL_LOCATION_ID match the same sub-account.'
          : 'GHL returned no contacts. If your key is agency-wide or contacts are under a sub-account, set GHL_LOCATION_ID on Vercel (Location ID from GHL Settings).');
    } else if (metrics.leads === 0 && metrics.contactsInRange >= 15) {
      metrics.ghlDataWarning =
        'GHL returned ' +
        metrics.contactsInRange +
        ' contacts added in this date range, but none matched ESA tagging rules (src-*, status-*, or Meta lead-form tags). Check tags on new leads.';
    }

    const sheetId = (process.env.GOOGLE_SHEETS_SPREADSHEET_ID || SPREADSHEET_ID_DEFAULT).trim();
    metrics.sheetRevenue = {
      mode: sheetsMode,
      spreadsheetId: sheetId,
      attributionFromSheet: sheetsAttrOn,
      ...(sheetSnap
        ? {
            totalRevenue: sheetSnap.totalRevenue,
            dealCount: sheetSnap.dealCount,
            rowCountInRange: sheetSnap.rows.length,
            note: sheetSnap.note,
            error: sheetSnap.error
          }
        : {
            enabled: false,
            hint:
              sheetsMode === 'replace' || sheetsAttrOn
                ? 'Add GOOGLE_SERVICE_ACCOUNT_JSON in Vercel'
                : null
          })
    };

    if (sheetSnap && sheetSnap.error == null && sheetSnap.attribution) {
      metrics.sheetAttribution = {
        ...sheetSnap.attribution,
        columnLabels: sheetSnap.attributionColumnLabels || {},
        columnsDetected: sheetSnap.attributionColumnsDetected || {},
        rowsInRange: sheetSnap.attributionRowCount || 0
      };
    } else {
      metrics.sheetAttribution = null;
    }

    if (sheetsMode === 'replace' && sheetSnap && sheetSnap.error == null) {
      const AD_SPEND = metrics.adSpend > 0 ? metrics.adSpend : 0;
      const r = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
      metrics.revenue = sheetSnap.totalRevenue;
      metrics.upfrontRoas = AD_SPEND > 0 && sheetSnap.totalRevenue > 0 ? r(sheetSnap.totalRevenue / AD_SPEND) : 0;
      metrics.aov = sheetSnap.dealCount > 0 ? r(sheetSnap.totalRevenue / sheetSnap.dealCount) : 0;
      metrics.cpa = AD_SPEND > 0 && sheetSnap.dealCount > 0 ? r(AD_SPEND / sheetSnap.dealCount) : 0;
      metrics.statusCounts = { ...metrics.statusCounts, closedWonDeals: sheetSnap.dealCount };
      metrics.revenueModel = {
        source: 'google_sheets',
        spreadsheetId: sheetId,
        range: (process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A1:Z2000').trim(),
        attribution:
          'Rows in sheet whose date column falls in selected dashboard range; amount column summed. Sheet attribution tables use Lead Source, Campaign, Adset, Ad, Product, Dashboard source columns when headers match.',
        dealCount: sheetSnap.dealCount,
        dealsUsingFallback: 0,
        sheetsNote: sheetSnap.note,
        ghlNote: 'GHL opp revenue replaced by sheet total; by-source $ cleared below.'
      };
      if (metrics.marketingKpiStrip) {
        metrics.marketingKpiStrip.totalContractValue = sheetSnap.totalRevenue;
        metrics.marketingKpiStrip.tcvSource = 'google_sheet';
        const tcv = metrics.marketingKpiStrip.totalContractValue;
        metrics.cashCollectedPct =
          tcv > 0 ? r((100 * metrics.marketingKpiStrip.totalCashCollected) / tcv) : 0;
      }
      metrics.bySource = metrics.bySource.map((s) => ({ ...s, revenue: 0 }));
      metrics.team = metrics.team.map((t) => ({ ...t, revenue: 0 }));
      metrics.sourceSystems = metrics.sourceSystems.concat(['google_sheets']);
    } else if (sheetsMode === 'replace' && sheetSnap && sheetSnap.error && sheetSnap.error !== 'not_configured') {
      metrics.sheetRevenue.warning = (sheetSnap.note || sheetSnap.error) + ' (GHL revenue kept.)';
    }

    if (sheetsMode !== 'replace' && sheetSnap && sheetSnap.error && sheetSnap.error !== 'not_configured') {
      metrics.sheetRevenue.warning = sheetSnap.note || sheetSnap.error;
    }

    if (sheetsAttrOn && sheetsMode !== 'replace' && sheetSnap && sheetSnap.error == null) {
      metrics.sheetRevenue.attributionOnlyNote =
        'Revenue still from GHL; sheet was read for attribution breakdowns below.';
    }

    if (String(q.ghlCashDebug || '').trim() === '1') {
      metrics.ghlCashDiagnostic = buildGhlCashDiagnostic(
        allOpps,
        cashEnrichMeta,
        dateRange,
        opportunitiesFetchedVia
      );
    }

    return res.status(200).json(metrics);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
