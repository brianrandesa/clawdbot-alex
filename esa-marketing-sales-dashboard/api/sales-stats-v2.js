/**
 * GET /api/sales-stats-v2 — Sales Board powered by GHL Opportunities (v2 API).
 * Reads pipeline opps, custom fields (product, setter, closer, commissions, cash, notes),
 * and contact source tags. No Redis dependency.
 */
const https = require('https');

const GHL_KEY_V2 = (process.env.GHL_API_KEY_V2 || '').trim();
const GHL_LOCATION_ID = (process.env.GHL_LOCATION_ID || '').trim();
const GHL_V2_BASE = 'https://services.leadconnectorhq.com';
// Read from both active and historical pipelines
var PIPELINES = [
  { id: 'LlthtHqW8V4PA9AWN8g7', wonStage: '47a0b7ad-a4e5-42cf-9bc8-44c6981a6254', lostStage: '6670681d-724b-4457-a38b-c7998939f3da' },
  { id: 'I22qa1FMKo20yxY3Vcws', wonStage: '5504b3fa-59c2-4eec-b299-1e38820c8de4', lostStage: '0f0ed104-3f07-46c9-a892-9829f68c511a' }
];
var ALL_WON_STAGES = PIPELINES.map(function(p) { return p.wonStage; });
var ALL_LOST_STAGES = PIPELINES.map(function(p) { return p.lostStage; });
var ALL_REFUNDED_STAGES = ['81dca2b1-f729-47ba-8a14-a8d3f873c9e5'];

// Opportunity custom field IDs
const CF = {
  cash:           'Vsw1rOQAW9Pvjfh69dJA',
  product:        'hFhMIiR3sS8SeANm59Ke',
  setter:         'e3Ca8YEEcgIPHBjTRHOm',
  closer:         'kzM90BE4nZTqPiFUaq8U',
  setterCommPct:  'P4L609odpMmlumdQZq0S',
  closerCommPct:  '9J36dFinm9Fx67I6Rt8x',
  fathomUrl:      'X6oVJega05lWyyLuiCty',
  dealNotes:      '60tWWito5ohRf6pFlYWB',
  nextSteps:      'faepoQCRUUMuiWnJhfcO'
};

const SOURCE_LABELS = {
  'src-fb-lead-form-ss': 'FB Lead Form',
  'src-vsl': 'VSL Funnel',
  'src-returning': 'Returning Client',
  'src-outbound': 'Outbound Dialer',
  'src-coldcall': 'Cold Call',
  'src-organic': 'Organic',
  'src-brian-direct': "Brian's Network"
};

function httpsGet(url, headers) {
  return new Promise(function (resolve) {
    var parsed = new URL(url);
    var opts = { hostname: parsed.hostname, path: parsed.pathname + parsed.search, headers: headers || {} };
    https.get(opts, function (res) {
      var body = '';
      res.on('data', function (chunk) { body += chunk; });
      res.on('end', function () {
        try {
          var j = JSON.parse(body);
          j._httpStatus = res.statusCode;
          resolve(j);
        } catch (e) {
          resolve({ _httpStatus: res.statusCode, _parseError: true });
        }
      });
    }).on('error', function () { resolve({ _httpStatus: 0 }); });
  });
}

function v2Get(path) {
  return httpsGet(GHL_V2_BASE + path, {
    'Authorization': 'Bearer ' + GHL_KEY_V2,
    'Version': '2021-07-28',
    'Accept': 'application/json'
  });
}

// Extract custom field value by ID from opportunity customFields array
function cfVal(opp, fieldId) {
  var fields = opp.customFields || [];
  for (var i = 0; i < fields.length; i++) {
    if (fields[i].id === fieldId) {
      return fields[i].fieldValue || fields[i].fieldValueString || '';
    }
  }
  return '';
}

function cfNum(opp, fieldId) {
  var raw = cfVal(opp, fieldId);
  var n = parseFloat(String(raw).replace(/[$,]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function cfStr(opp, fieldId) {
  return String(cfVal(opp, fieldId)).trim();
}

// Resolve source tag from contact tags
function resolveSource(opp) {
  var contact = opp.contact || {};
  var tags = contact.tags || [];
  // v2 search uses relations array instead of contact
  if (!tags.length && opp.relations) {
    for (var r = 0; r < opp.relations.length; r++) {
      if (opp.relations[r].tags) { tags = opp.relations[r].tags; break; }
    }
  }
  for (var i = 0; i < tags.length; i++) {
    var t = String(tags[i]).toLowerCase().trim();
    if (t.startsWith('src-') && SOURCE_LABELS[t]) return t;
  }
  return 'unknown';
}

function sourceLabel(tag) {
  return SOURCE_LABELS[tag] || 'Untagged / Other';
}

// Fetch ALL opps from a single pipeline via v2 search with pagination + dedup
async function fetchPipelineOpps(pipelineId, seen) {
  var all = [];
  var startAfterId = '';
  var page = 0;
  while (page < 80) {
    var qs = '?location_id=' + encodeURIComponent(GHL_LOCATION_ID) +
      '&pipeline_id=' + encodeURIComponent(pipelineId) +
      '&limit=100' +
      (startAfterId ? '&startAfterId=' + encodeURIComponent(startAfterId) : '');
    var data = await v2Get('/opportunities/search' + qs);
    if (data._httpStatus !== 200 || !data.opportunities) break;
    var added = 0;
    for (var i = 0; i < data.opportunities.length; i++) {
      var o = data.opportunities[i];
      if (o.id && !seen[o.id]) {
        seen[o.id] = true;
        all.push(o);
        added++;
      }
    }
    var nextId = (data.meta || {}).startAfterId || '';
    if (!nextId || added === 0 || data.opportunities.length < 100) break;
    startAfterId = nextId;
    page++;
  }
  return all;
}

// Fetch from ALL pipelines
async function fetchAllOpps() {
  var seen = {};
  var all = [];
  for (var p = 0; p < PIPELINES.length; p++) {
    var opps = await fetchPipelineOpps(PIPELINES[p].id, seen);
    all = all.concat(opps);
  }
  return all;
}

// v2 search strips numeric custom fields. Enrich Closed Won opps with detail fetch.
async function enrichClosedWonWithDetail(opps) {
  var out = [];
  for (var i = 0; i < opps.length; i++) {
    var o = opps[i];
    if ((ALL_WON_STAGES.indexOf(o.pipelineStageId) !== -1 || ALL_REFUNDED_STAGES.indexOf(o.pipelineStageId) !== -1) && o.id) {
      var detail = await v2Get('/opportunities/' + encodeURIComponent(o.id));
      if (detail._httpStatus === 200 && detail.opportunity) {
        // Merge detail custom fields over search results
        var merged = Object.assign({}, o, { customFields: detail.opportunity.customFields || o.customFields });
        // Also carry over contact from detail if search didn't have it
        if (detail.opportunity.contact && !o.contact) {
          merged.contact = detail.opportunity.contact;
        }
        out.push(merged);
      } else {
        out.push(o);
      }
      // Small delay to avoid rate limits
      await new Promise(function(r) { setTimeout(r, 120); });
    } else {
      out.push(o);
    }
  }
  return out;
}

function rangeBounds(q) {
  var now = Date.now();
  var r = (q.range || '30d').toLowerCase();
  if (r === 'custom' && q.start) {
    var s = new Date(String(q.start) + 'T00:00:00').getTime();
    var e = q.end ? new Date(String(q.end) + 'T23:59:59').getTime() : now;
    return { start: s, end: e, label: q.start + ' to ' + (q.end || 'now') };
  }
  if (r === 'all') return { start: 0, end: now + 365 * 86400000, label: 'all' };
  var days = { '7d': 7, '30d': 30, '90d': 90 }[r] || 30;
  return { start: now - days * 86400000, end: now, label: r };
}

function round2(n) { return Math.round(n * 100) / 100; }

// In-memory cache: keyed by range string, 2-minute TTL
var _cache = {};
var CACHE_TTL_MS = 120000;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!GHL_KEY_V2 || !GHL_LOCATION_ID) {
    return res.status(503).json({ error: 'GHL_API_KEY_V2 and GHL_LOCATION_ID required' });
  }

  var q = req.query || {};
  var bounds = rangeBounds(q);

  // Serve from cache if fresh
  var cacheKey = bounds.label + '|' + (q.start || '') + '|' + (q.end || '');
  var cached = _cache[cacheKey];
  if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 'public, max-age=120');
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cached.data);
  }
  res.setHeader('X-Cache', 'MISS');
  var rawOpps = await fetchAllOpps();
  // Enrich Closed Won opps with v2 detail to get numeric custom fields (search strips them)
  var allOpps = await enrichClosedWonWithDetail(rawOpps);

  // Separate won, lost, and refunded for metrics
  var wonInRange = [];
  var lostInRange = [];
  var refundedInRange = [];
  var allTerminal = [];

  // Historical pipeline ID -- use close date from Deal Notes for range filtering instead of lastStatusChangeAt
  var HISTORICAL_PIPELINE = 'I22qa1FMKo20yxY3Vcws';

  for (var i = 0; i < allOpps.length; i++) {
    var o = allOpps[i];
    var stageId = o.pipelineStageId || '';

    // Determine the effective close date for range filtering
    var changedAt;
    if (o.pipelineId === HISTORICAL_PIPELINE) {
      // Historical deals: parse close date from Deal Notes ("Close date: YYYY-MM-DD | ...")
      var notesVal = cfStr(o, CF.dealNotes);
      var dateMatch = notesVal.match(/Close date:\s*(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        changedAt = new Date(dateMatch[1] + 'T00:00:00Z').getTime();
      } else {
        changedAt = new Date(o.lastStatusChangeAt || o.updatedAt || 0).getTime();
      }
    } else {
      changedAt = new Date(o.lastStatusChangeAt || o.updatedAt || 0).getTime();
    }
    var inRange = changedAt >= bounds.start && changedAt <= bounds.end;

    if (ALL_WON_STAGES.indexOf(stageId) !== -1 && inRange) {
      wonInRange.push(o);
      allTerminal.push(o);
    } else if (ALL_REFUNDED_STAGES.indexOf(stageId) !== -1 && inRange) {
      refundedInRange.push(o);
      allTerminal.push(o);
    } else if (ALL_LOST_STAGES.indexOf(stageId) !== -1 && inRange) {
      lostInRange.push(o);
      allTerminal.push(o);
    }
  }

  // Build closed won deals array + aggregates
  var totalTCV = 0, totalCash = 0;
  var byProduct = {}, bySource = {}, bySetter = {}, byCloser = {}, byMonth = {};
  var totalSetterComm = 0, totalCloserComm = 0;
  var closedWonDeals = [];

  for (var w = 0; w < wonInRange.length; w++) {
    var opp = wonInRange[w];
    var tcv = parseFloat(opp.monetaryValue) || 0;
    var cash = cfNum(opp, CF.cash);
    var owed = round2(tcv - cash);
    if (owed < 0) owed = 0;
    var product = cfStr(opp, CF.product) || 'Unknown';
    var setter = cfStr(opp, CF.setter) || 'Unknown';
    var closer = cfStr(opp, CF.closer) || 'Unknown';
    var setterPct = cfNum(opp, CF.setterCommPct);
    var closerPct = cfNum(opp, CF.closerCommPct);
    var setterAmt = round2(tcv * setterPct / 100);
    var closerAmt = round2(tcv * closerPct / 100);
    var src = resolveSource(opp);
    var contact = opp.contact || {};
    // v2 search puts contact info in relations
    if (!contact.name && opp.relations && opp.relations.length) {
      var rel = opp.relations[0];
      contact = { id: rel.recordId, name: rel.fullName || rel.contactName || '', email: rel.email || '', phone: rel.phone || '', tags: rel.tags || [] };
    }
    // Use effective close date (parsed from notes for historical, lastStatusChangeAt for active)
    var closeDate;
    if (opp.pipelineId === HISTORICAL_PIPELINE) {
      var nd = cfStr(opp, CF.dealNotes).match(/Close date:\s*(\d{4}-\d{2}-\d{2})/);
      closeDate = nd ? nd[1] : (opp.lastStatusChangeAt || opp.updatedAt || '').slice(0, 10);
    } else {
      closeDate = (opp.lastStatusChangeAt || opp.updatedAt || '').slice(0, 10);
    }
    var paymentStatus = cash >= tcv ? 'Paid in Full' : cash > 0 ? 'Payment Plan' : 'Outstanding';
    var ym = closeDate.slice(0, 7);

    totalTCV += tcv;
    totalCash += cash;
    totalSetterComm += setterAmt;
    totalCloserComm += closerAmt;

    closedWonDeals.push({
      name: contact.name || opp.name || '--',
      email: contact.email || '',
      phone: contact.phone || '',
      closeDate: closeDate,
      product: product,
      tcv: round2(tcv),
      cashCollected: round2(cash),
      owed: owed,
      paymentStatus: paymentStatus,
      source: sourceLabel(src),
      sourceTag: src,
      setter: setter,
      closer: closer,
      setterCommPct: setterPct,
      setterCommAmt: setterAmt,
      closerCommPct: closerPct,
      closerCommAmt: closerAmt,
      fathomUrl: cfStr(opp, CF.fathomUrl),
      notes: cfStr(opp, CF.dealNotes),
      nextSteps: cfStr(opp, CF.nextSteps),
      oppId: opp.id || '',
      contactId: contact.id || opp.contactId || ''
    });

    // By Product
    if (!byProduct[product]) byProduct[product] = { deals: 0, tcv: 0, cash: 0, owed: 0 };
    byProduct[product].deals++;
    byProduct[product].tcv += tcv;
    byProduct[product].cash += cash;
    byProduct[product].owed += owed;

    // By Source
    var sl = sourceLabel(src);
    if (!bySource[sl]) bySource[sl] = { deals: 0, tcv: 0, cash: 0, owed: 0, won: 0, lost: 0 };
    bySource[sl].deals++;
    bySource[sl].won++;
    bySource[sl].tcv += tcv;
    bySource[sl].cash += cash;
    bySource[sl].owed += owed;

    // By Closer
    if (!byCloser[closer]) byCloser[closer] = { deals: 0, tcv: 0, commission: 0, won: 0, lost: 0 };
    byCloser[closer].deals++;
    byCloser[closer].won++;
    byCloser[closer].tcv += tcv;
    byCloser[closer].commission += closerAmt;

    // By Setter
    if (!bySetter[setter]) bySetter[setter] = { sets: 0, converted: 0, commission: 0 };
    bySetter[setter].sets++;
    bySetter[setter].converted++;
    bySetter[setter].commission += setterAmt;

    // By Month
    if (ym) {
      if (!byMonth[ym]) byMonth[ym] = { deals: 0, tcv: 0, cash: 0 };
      byMonth[ym].deals++;
      byMonth[ym].tcv += tcv;
      byMonth[ym].cash += cash;
    }
  }

  // Add lost deals to source/closer/setter for close rate calculation
  for (var l = 0; l < lostInRange.length; l++) {
    var lOpp = lostInRange[l];
    var lSrc = sourceLabel(resolveSource(lOpp));
    var lCloser = cfStr(lOpp, CF.closer) || 'Unknown';
    var lSetter = cfStr(lOpp, CF.setter) || 'Unknown';

    if (!bySource[lSrc]) bySource[lSrc] = { deals: 0, tcv: 0, cash: 0, owed: 0, won: 0, lost: 0 };
    bySource[lSrc].lost++;

    if (!byCloser[lCloser]) byCloser[lCloser] = { deals: 0, tcv: 0, commission: 0, won: 0, lost: 0 };
    byCloser[lCloser].lost++;

    if (!bySetter[lSetter]) bySetter[lSetter] = { sets: 0, converted: 0, commission: 0 };
    bySetter[lSetter].sets++;
  }

  // Compute close rates
  Object.keys(bySource).forEach(function (k) {
    var s = bySource[k];
    var total = (s.won || 0) + (s.lost || 0);
    s.closeRate = total > 0 ? round2(s.won / total * 100) : 0;
  });
  Object.keys(byCloser).forEach(function (k) {
    var c = byCloser[k];
    var total = (c.won || 0) + (c.lost || 0);
    c.closeRate = total > 0 ? round2(c.won / total * 100) : 0;
  });
  Object.keys(bySetter).forEach(function (k) {
    var s = bySetter[k];
    s.setToClosePct = s.sets > 0 ? round2(s.converted / s.sets * 100) : 0;
  });

  // Round aggregates
  Object.keys(byProduct).forEach(function (k) { var p = byProduct[k]; p.tcv = round2(p.tcv); p.cash = round2(p.cash); p.owed = round2(p.owed); });
  Object.keys(bySource).forEach(function (k) { var s = bySource[k]; s.tcv = round2(s.tcv); s.cash = round2(s.cash); s.owed = round2(s.owed); });
  Object.keys(byCloser).forEach(function (k) { var c = byCloser[k]; c.tcv = round2(c.tcv); c.commission = round2(c.commission); });
  Object.keys(bySetter).forEach(function (k) { var s = bySetter[k]; s.commission = round2(s.commission); });
  Object.keys(byMonth).forEach(function (k) { var m = byMonth[k]; m.tcv = round2(m.tcv); m.cash = round2(m.cash); });

  var totalOwed = round2(totalTCV - totalCash);
  if (totalOwed < 0) totalOwed = 0;
  var dealCount = closedWonDeals.length;

  closedWonDeals.sort(function (a, b) { return (b.closeDate || '').localeCompare(a.closeDate || ''); });

  var result = {
    dateRange: bounds.label,
    totalTCV: round2(totalTCV),
    totalCash: round2(totalCash),
    totalOwed: totalOwed,
    dealCount: dealCount,
    avgDeal: dealCount > 0 ? round2(totalTCV / dealCount) : 0,
    collectionRate: totalTCV > 0 ? round2(totalCash / totalTCV * 100) : 0,
    commissions: {
      totalSetterComm: round2(totalSetterComm),
      totalCloserComm: round2(totalCloserComm),
      totalComm: round2(totalSetterComm + totalCloserComm),
      avgPerDeal: dealCount > 0 ? round2((totalSetterComm + totalCloserComm) / dealCount) : 0
    },
    closedWonDeals: closedWonDeals,
    byProduct: byProduct,
    bySource: bySource,
    byCloser: byCloser,
    bySetter: bySetter,
    byMonth: byMonth,
    refunds: (function() {
      var totalRefundTCV = 0, totalRefundCashBack = 0;
      var refundDeals = [];
      for (var ri = 0; ri < refundedInRange.length; ri++) {
        var ro = refundedInRange[ri];
        var rtcv = parseFloat(ro.monetaryValue) || 0;
        var rcash = cfNum(ro, CF.cash);
        var rback = rtcv - rcash; // amount refunded
        if (rback < 0) rback = 0;
        totalRefundTCV += rtcv;
        totalRefundCashBack += rback;
        var rcontact = ro.contact || {};
        if (!rcontact.name && ro.relations && ro.relations.length) rcontact = { name: ro.relations[0].fullName || ro.relations[0].contactName || '' };
        refundDeals.push({
          name: rcontact.name || ro.name || '--',
          tcv: round2(rtcv),
          refundAmount: round2(rback),
          netCash: round2(rcash),
          notes: cfStr(ro, CF.dealNotes),
          oppId: ro.id
        });
      }
      return {
        count: refundedInRange.length,
        totalTCV: round2(totalRefundTCV),
        totalRefundedBack: round2(totalRefundCashBack),
        deals: refundDeals
      };
    })(),
    totalOppsInPipeline: allOpps.length,
    wonInRange: wonInRange.length,
    lostInRange: lostInRange.length,
    refundedInRange: refundedInRange.length,
    fetchedAt: new Date().toISOString()
  };

  // Cache for 2 minutes
  _cache[cacheKey] = { ts: Date.now(), data: result };
  res.setHeader('Cache-Control', 'public, max-age=120');
  return res.status(200).json(result);
};
