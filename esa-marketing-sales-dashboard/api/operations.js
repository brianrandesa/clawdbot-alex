/**
 * GET /api/operations -- Operations tab: Accounts Receivable, Follow-Up Queue, Pipeline Velocity.
 * Uses v2 GHL API. Same patterns as sales-stats-v2.js.
 */
var https = require('https');

var GHL_KEY_V2 = (process.env.GHL_API_KEY_V2 || '').trim();
var GHL_LOCATION_ID = (process.env.GHL_LOCATION_ID || '').trim();
var GHL_V2_BASE = 'https://services.leadconnectorhq.com';

// Both pipelines
var PIPELINE_BRIAN_DIAMOND = 'LlthtHqW8V4PA9AWN8g7';
var PIPELINE_HISTORICAL = 'I22qa1FMKo20yxY3Vcws';
var PIPELINES = [PIPELINE_BRIAN_DIAMOND, PIPELINE_HISTORICAL];

// Custom field IDs
var CF = {
  cash: 'Vsw1rOQAW9Pvjfh69dJA',
  product: 'hFhMIiR3sS8SeANm59Ke',
  setter: 'e3Ca8YEEcgIPHBjTRHOm',
  closer: 'kzM90BE4nZTqPiFUaq8U',
  dealNotes: '60tWWito5ohRf6pFlYWB',
  nextPaymentDate: 'zQDHZzZWF4xxUMUXBUwK'
};

// Won stages
var WON_STAGES = [
  '47a0b7ad-a4e5-42cf-9bc8-44c6981a6254',
  '5504b3fa-59c2-4eec-b299-1e38820c8de4'
];

// Refunded stages
var REFUNDED_STAGES = [
  '81dca2b1-f729-47ba-8a14-a8d3f873c9e5',
  'f9784964-a872-4d0e-be2d-b6aec25f5963'
];

// Follow-up stages (Brian & Diamond pipeline only)
var FU_STAGES = {
  '0b52c6ae-e2c7-40cc-879d-e0fbc1f90299': 'Offer Made / FU Needed',
  '2d87708c-4bf9-4bc0-9559-1592385ce02a': 'Contract Sent'
};

// Pipeline stages in order for velocity calculation (Brian & Diamond)
var STAGE_ORDER = [
  { id: 'new-lead', name: 'New Lead' },
  { id: 'booked', name: 'Booked' },
  { id: 'showed', name: 'Showed' },
  { id: '0b52c6ae-e2c7-40cc-879d-e0fbc1f90299', name: 'Offer Made / FU Needed' },
  { id: '2d87708c-4bf9-4bc0-9559-1592385ce02a', name: 'Contract Sent' },
  { id: '47a0b7ad-a4e5-42cf-9bc8-44c6981a6254', name: 'Closed Won' }
];

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

function round2(n) { return Math.round(n * 100) / 100; }

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

async function fetchAllOpps() {
  var seen = {};
  var all = [];
  for (var p = 0; p < PIPELINES.length; p++) {
    var opps = await fetchPipelineOpps(PIPELINES[p], seen);
    all = all.concat(opps);
  }
  return all;
}

// Enrich won/refunded opps from Brian & Diamond pipeline with detail fetch (search strips numeric custom fields)
async function enrichOppsWithDetail(opps) {
  var out = [];
  for (var i = 0; i < opps.length; i++) {
    var o = opps[i];
    var isWonOrRefunded = WON_STAGES.indexOf(o.pipelineStageId) !== -1 || REFUNDED_STAGES.indexOf(o.pipelineStageId) !== -1;
    if (isWonOrRefunded && o.id && o.pipelineId === PIPELINE_BRIAN_DIAMOND) {
      var detail = await v2Get('/opportunities/' + encodeURIComponent(o.id));
      if (detail._httpStatus === 200 && detail.opportunity) {
        var merged = Object.assign({}, o, { customFields: detail.opportunity.customFields || o.customFields });
        if (detail.opportunity.contact && !o.contact) {
          merged.contact = detail.opportunity.contact;
        }
        out.push(merged);
      } else {
        out.push(o);
      }
      await new Promise(function(r) { setTimeout(r, 120); });
    } else {
      out.push(o);
    }
  }
  return out;
}

function getContactInfo(opp) {
  var contact = opp.contact || {};
  if (!contact.name && opp.relations && opp.relations.length) {
    var rel = opp.relations[0];
    contact = {
      id: rel.recordId,
      name: rel.fullName || rel.contactName || '',
      email: rel.email || '',
      phone: rel.phone || '',
      tags: rel.tags || []
    };
  }
  return contact;
}

function parseCloseDate(opp) {
  var notesVal = cfStr(opp, CF.dealNotes);
  var dateMatch = notesVal.match(/Close date:\s*(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    return dateMatch[1];
  }
  return (opp.lastStatusChangeAt || opp.updatedAt || '').slice(0, 10);
}

function daysBetween(dateStr, now) {
  if (!dateStr) return 0;
  var d = new Date(dateStr + 'T00:00:00Z').getTime();
  if (!d || isNaN(d)) return 0;
  var diff = now - d;
  return Math.max(0, Math.floor(diff / 86400000));
}

// In-memory cache: 2-minute TTL
var _cache = null;
var _cacheTs = 0;
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

  // Serve from cache if fresh
  if (_cache && (Date.now() - _cacheTs) < CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 'public, max-age=120');
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(_cache);
  }
  res.setHeader('X-Cache', 'MISS');

  var now = Date.now();
  var rawOpps = await fetchAllOpps();
  var allOpps = await enrichOppsWithDetail(rawOpps);

  // ========== A. Accounts Receivable ==========
  var accountsReceivable = [];
  for (var i = 0; i < allOpps.length; i++) {
    var o = allOpps[i];
    var stageId = o.pipelineStageId || '';
    var isWon = WON_STAGES.indexOf(stageId) !== -1;
    if (!isWon) continue; // A/R only for won deals, not refunds

    var tcv = parseFloat(o.monetaryValue) || 0;
    var cash = cfNum(o, CF.cash);
    var owed = round2(tcv - cash);
    if (owed <= 0) continue;

    var contact = getContactInfo(o);
    var closeDate = parseCloseDate(o);
    var dsc = daysBetween(closeDate, now);

    accountsReceivable.push({
      name: contact.name || o.name || '--',
      email: contact.email || '',
      phone: contact.phone || '',
      product: cfStr(o, CF.product) || 'Unknown',
      closer: cfStr(o, CF.closer) || 'Unknown',
      setter: cfStr(o, CF.setter) || 'Unknown',
      tcv: round2(tcv),
      cashCollected: round2(cash),
      owed: owed,
      closeDate: closeDate,
      daysSinceClose: dsc,
      nextPaymentDate: cfStr(o, CF.nextPaymentDate) || '',
      oppId: o.id || ''
    });
  }
  // Sort by owed DESC
  accountsReceivable.sort(function (a, b) { return b.owed - a.owed; });

  // ========== B. Follow-Up Queue ==========
  var followUpQueue = [];
  for (var fi = 0; fi < allOpps.length; fi++) {
    var fo = allOpps[fi];
    if (fo.pipelineId !== PIPELINE_BRIAN_DIAMOND) continue;
    var fStage = fo.pipelineStageId || '';
    if (!FU_STAGES[fStage]) continue;

    var fContact = getContactInfo(fo);
    var stageChangeDate = (fo.lastStageChangeAt || fo.lastStatusChangeAt || fo.updatedAt || '').slice(0, 10);
    var daysInStage = daysBetween(stageChangeDate, now);

    followUpQueue.push({
      name: fContact.name || fo.name || '--',
      email: fContact.email || '',
      phone: fContact.phone || '',
      stageName: FU_STAGES[fStage],
      monetaryValue: round2(parseFloat(fo.monetaryValue) || 0),
      daysInStage: daysInStage,
      assignedTo: fo.assignedTo || '',
      oppId: fo.id || ''
    });
  }
  // Sort by daysInStage DESC (oldest/most stale first)
  followUpQueue.sort(function (a, b) { return b.daysInStage - a.daysInStage; });

  // ========== C. Pipeline Velocity ==========
  // For Brian & Diamond pipeline only
  // Build map: stageId -> index in STAGE_ORDER
  var stageIndexMap = {};
  for (var si = 0; si < STAGE_ORDER.length; si++) {
    stageIndexMap[STAGE_ORDER[si].id] = si;
  }

  // For each opp in B&D pipeline, determine current stage index
  // Then for each stage BEFORE current, estimate time spent
  // We only have createdAt and lastStageChangeAt, so we estimate:
  // - Total time from creation to last stage change
  // - Divide by number of stages traversed
  var stageDurations = {};
  for (var vi = 0; vi < allOpps.length; vi++) {
    var vo = allOpps[vi];
    if (vo.pipelineId !== PIPELINE_BRIAN_DIAMOND) continue;

    var currentStageId = vo.pipelineStageId || '';
    var currentIdx = stageIndexMap[currentStageId];
    if (currentIdx === undefined || currentIdx <= 0) continue; // must have moved past at least one stage

    var created = vo.createdAt ? new Date(vo.createdAt).getTime() : 0;
    var lastChange = vo.lastStageChangeAt ? new Date(vo.lastStageChangeAt).getTime() :
                     vo.lastStatusChangeAt ? new Date(vo.lastStatusChangeAt).getTime() : 0;
    if (!created || !lastChange || lastChange <= created) continue;

    var totalDays = (lastChange - created) / 86400000;
    var stagesTraversed = currentIdx; // number of stages moved through
    var avgPerStage = totalDays / stagesTraversed;

    // Credit each stage before current
    for (var sj = 0; sj < currentIdx; sj++) {
      var stageName = STAGE_ORDER[sj].name;
      if (!stageDurations[stageName]) stageDurations[stageName] = [];
      stageDurations[stageName].push(avgPerStage);
    }
  }

  var pipelineVelocity = [];
  for (var pk = 0; pk < STAGE_ORDER.length - 1; pk++) { // exclude Closed Won itself
    var sName = STAGE_ORDER[pk].name;
    var durations = stageDurations[sName] || [];
    if (durations.length === 0) {
      pipelineVelocity.push({
        stageName: sName,
        avgDays: null,
        medianDays: null,
        count: 0
      });
      continue;
    }
    durations.sort(function (a, b) { return a - b; });
    var sum = 0;
    for (var di = 0; di < durations.length; di++) sum += durations[di];
    var avg = round2(sum / durations.length);
    var mid = Math.floor(durations.length / 2);
    var median = durations.length % 2 === 1 ? round2(durations[mid]) : round2((durations[mid - 1] + durations[mid]) / 2);
    pipelineVelocity.push({
      stageName: sName,
      avgDays: avg,
      medianDays: median,
      count: durations.length
    });
  }

  var result = {
    accountsReceivable: accountsReceivable,
    followUpQueue: followUpQueue,
    pipelineVelocity: pipelineVelocity,
    fetchedAt: new Date().toISOString()
  };

  // Cache for 2 minutes
  _cache = result;
  _cacheTs = Date.now();
  res.setHeader('Cache-Control', 'public, max-age=120');
  return res.status(200).json(result);
};
