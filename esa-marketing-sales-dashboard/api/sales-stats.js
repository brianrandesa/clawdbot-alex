/**
 * GET — aggregates from KV submissions only (sales board), filtered by ?range= like main dashboard.
 */
const { listDealSubmissions, kvConfigured } = require('./kvDeals');

const CLOSED_WON_ID = '47a0b7ad-a4e5-42cf-9bc8-44c6981a6254';

/** Parse sheet/form date (YYYY-MM-DD or ISO) to UTC midnight ms; invalid → null */
function parseDateMs(s) {
  if (s == null) return null;
  const t = String(s).trim();
  if (!t) return null;
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const y = +m[1];
    const mo = +m[2] - 1;
    const d = +m[3];
    return Date.UTC(y, mo, d);
  }
  const x = new Date(t).getTime();
  return Number.isNaN(x) ? null : x;
}

function isClosedWon(row) {
  const id = String(row.pipelineStageId || '').toLowerCase();
  if (id === CLOSED_WON_ID) return true;
  return String(row.stageName || '').trim().toLowerCase() === 'closed won';
}

function bucketKey(s) {
  const t = (s == null ? '' : String(s)).trim();
  return t || '—';
}

/** @param {Record<string, { count: number, paid: number, owed: number }>} map */
function bumpPayout(map, key, paid, owed) {
  const k = bucketKey(key);
  if (!map[k]) map[k] = { count: 0, paid: 0, owed: 0 };
  map[k].count++;
  map[k].paid += paid;
  map[k].owed += owed;
}

/** YYYY-MM from closing date string, or null */
function closingMonthKey(s) {
  const t = String(s || '').trim();
  const m = t.match(/^(\d{4}-\d{2})/);
  return m ? m[1] : null;
}

function summarizeDaySpans(startField, endField, rows) {
  const spans = [];
  for (const row of rows) {
    if (!isClosedWon(row)) continue;
    const a = parseDateMs(row[startField]);
    const b = parseDateMs(row[endField]);
    if (a == null || b == null) continue;
    if (b < a) continue;
    const days = Math.round((b - a) / 86400000);
    spans.push(days);
  }
  if (spans.length === 0) {
    return { avgDays: null, medianDays: null, count: 0 };
  }
  spans.sort((x, y) => x - y);
  const sum = spans.reduce((s, n) => s + n, 0);
  const avg = Math.round((sum / spans.length) * 10) / 10;
  const mid = Math.floor(spans.length / 2);
  const median =
    spans.length % 2 === 1 ? spans[mid] : Math.round(((spans[mid - 1] + spans[mid]) / 2) * 10) / 10;
  return { avgDays: avg, medianDays: median, count: spans.length };
}

function rangeBounds(q) {
  const now = Date.now();
  const r = (q.range || '30d').toLowerCase();

  if (r === 'custom' && q.start) {
    const start = new Date(String(q.start) + 'T00:00:00').getTime();
    const end = q.end ? new Date(String(q.end) + 'T23:59:59').getTime() : now;
    return { start, end, label: q.start + ' to ' + (q.end || 'now') };
  }

  if (r === 'all') {
    return { start: 0, end: now, label: 'all' };
  }

  const days = { '7d': 7, '30d': 30, '90d': 90 }[r] || 30;
  return { start: now - days * 86400000, end: now, label: r };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const q = req.query || {};
  const { start, end, label } = rangeBounds(q);
  let redisError = null;
  let all = [];
  try {
    const out = await listDealSubmissions();
    all = out.rows || [];
    redisError = out.error || null;
  } catch (e) {
    redisError = e && e.message ? e.message : String(e);
  }
  const rows = all.filter((r) => {
    const t = new Date(r.submittedAt || 0).getTime();
    return t >= start && t <= end;
  });

  let totalPaid = 0;
  let totalOwed = 0;
  let planCount = 0;
  let closedWonCount = 0;
  let closedWonPaid = 0;
  let closedWonOwed = 0;
  let setterCommEst = 0;
  let closerCommTotal = 0;

  const byProduct = {};
  const byStage = {};
  const bySetter = {};
  const byCloser = {};
  const bySourceTag = {};
  const byLeadSource = {};
  const byCampaign = {};
  const byAdset = {};
  const byClosingMonth = {};
  /** Closed Won only — for "where did wins come from" */
  const bySourceTagClosedWon = {};
  const byLeadSourceClosedWon = {};
  const closedWonDetails = [];

  for (const row of rows) {
    const paid = parseFloat(row.monetaryValue) || 0;
    const owed = parseFloat(row.amountOwed) || 0;
    totalPaid += paid;
    totalOwed += owed;
    if (row.paymentPlan) planCount++;

    const p = (row.product || 'Unknown').trim() || 'Unknown';
    if (!byProduct[p]) byProduct[p] = { count: 0, paid: 0, owed: 0 };
    byProduct[p].count++;
    byProduct[p].paid += paid;
    byProduct[p].owed += owed;

    const st = (row.stageName || row.pipelineStageId || '—').toString();
    if (!byStage[st]) byStage[st] = { count: 0, paid: 0 };
    byStage[st].count++;
    byStage[st].paid += paid;

    bumpPayout(bySetter, row.setter, paid, owed);

    const cl = bucketKey(row.closer);
    const comm = parseFloat(row.closerComm) || 0;
    closerCommTotal += comm;
    if (!byCloser[cl]) byCloser[cl] = { count: 0, paid: 0, owed: 0, comm: 0 };
    byCloser[cl].count++;
    byCloser[cl].paid += paid;
    byCloser[cl].owed += owed;
    byCloser[cl].comm += comm;

    const sp = parseFloat(String(row.setterPct || '').replace(/[^0-9.-]/g, '')) || 0;
    if (sp > 0) setterCommEst += (paid * sp) / 100;

    bumpPayout(bySourceTag, row.sourceTag, paid, owed);
    bumpPayout(byLeadSource, row.leadSource, paid, owed);
    bumpPayout(byCampaign, row.campaign, paid, owed);
    bumpPayout(byAdset, row.adset, paid, owed);

    if (isClosedWon(row)) {
      closedWonCount++;
      closedWonPaid += paid;
      closedWonOwed += owed;
      bumpPayout(bySourceTagClosedWon, row.sourceTag, paid, owed);
      bumpPayout(byLeadSourceClosedWon, row.leadSource, paid, owed);
      closedWonDetails.push({
        clientOrEvent: String(row.clientOrEvent || '').trim() || '—',
        paid,
        owed,
        closingDate: String(row.closingDate || '').trim() || '',
        submittedAt: String(row.submittedAt || '').trim() || '',
        sourceTag: String(row.sourceTag || '').trim() || '—',
        leadSource: String(row.leadSource || '').trim() || '—',
        campaign: String(row.campaign || '').trim() || '—',
        adset: String(row.adset || '').trim() || '—',
        ad: String(row.ad || '').trim() || '—',
        product: String(row.product || '').trim() || '—'
      });
      const ym = closingMonthKey(row.closingDate);
      if (ym) {
        if (!byClosingMonth[ym]) byClosingMonth[ym] = { count: 0, paid: 0, owed: 0 };
        byClosingMonth[ym].count++;
        byClosingMonth[ym].paid += paid;
        byClosingMonth[ym].owed += owed;
      }
    }
  }

  closedWonDetails.sort((a, b) => {
    const db = parseDateMs(b.closingDate);
    const da = parseDateMs(a.closingDate);
    const sb = db == null ? 0 : db;
    const sa = da == null ? 0 : da;
    if (sb !== sa) return sb - sa;
    const tb = new Date(b.submittedAt || 0).getTime();
    const ta = new Date(a.submittedAt || 0).getTime();
    return tb - ta;
  });

  const leadToClose = summarizeDaySpans('dateCreated', 'closingDate', rows);
  const firstCallToClose = summarizeDaySpans('dateFirstCall', 'closingDate', rows);

  const avgWon =
    closedWonCount > 0 ? Math.round((closedWonPaid / closedWonCount) * 100) / 100 : 0;
  const winRatePct =
    rows.length > 0 ? Math.round((closedWonCount / rows.length) * 1000) / 10 : 0;

  return res.status(200).json({
    kvEnabled: kvConfigured(),
    dateRange: label,
    count: rows.length,
    totalPaid,
    totalOwed,
    avgPaid: rows.length ? Math.round((totalPaid / rows.length) * 100) / 100 : 0,
    paymentPlanPct: rows.length ? Math.round((planCount / rows.length) * 1000) / 10 : 0,
    paymentPlanCount: planCount,
    closedWonCount,
    closedWonPaid,
    closedWonOwed,
    avgWonDeal: avgWon,
    winRatePct,
    setterCommEst: Math.round(setterCommEst * 100) / 100,
    closerCommTotal: Math.round(closerCommTotal * 100) / 100,
    leadToClose,
    firstCallToClose,
    byProduct,
    byStage,
    bySetter,
    byCloser,
    bySourceTag,
    byLeadSource,
    byCampaign,
    byAdset,
    byClosingMonth,
    bySourceTagClosedWon,
    byLeadSourceClosedWon,
    closedWonDetails,
    inRangeRows: rows.slice(0, 200),
    ...(redisError ? { redisError } : {})
  });
};
