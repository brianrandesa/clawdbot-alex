/**
 * GET — aggregates from KV submissions only (sales board), filtered by ?range= like main dashboard.
 */
const { listDealSubmissions, kvConfigured } = require('./kvDeals');

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
  const byProduct = {};
  const byStage = {};

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
  }

  const n = rows.length || 1;

  return res.status(200).json({
    kvEnabled: kvConfigured(),
    dateRange: label,
    count: rows.length,
    totalPaid,
    totalOwed,
    avgPaid: rows.length ? Math.round((totalPaid / rows.length) * 100) / 100 : 0,
    paymentPlanPct: rows.length ? Math.round((planCount / rows.length) * 1000) / 10 : 0,
    paymentPlanCount: planCount,
    byProduct,
    byStage,
    inRangeRows: rows.slice(0, 200),
    ...(redisError ? { redisError } : {})
  });
};
