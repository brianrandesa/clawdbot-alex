/**
 * GET /api/meta-ads-report — Meta Ads performance + ROAS from GHL sales data.
 * Combines Meta campaign spend/leads with closed deal revenue by source tag.
 */
const https = require('https');

const META_TOKEN = (process.env.META_ACCESS_TOKEN || '').trim();
const META_ACCT = (process.env.META_AD_ACCOUNT_ID || '').trim();
const GHL_KEY_V2 = (process.env.GHL_API_KEY_V2 || '').trim();
const GHL_LOCATION_ID = (process.env.GHL_LOCATION_ID || '').trim();

var PIPELINES = [
  { id: 'LlthtHqW8V4PA9AWN8g7', wonStage: '47a0b7ad-a4e5-42cf-9bc8-44c6981a6254' },
  { id: 'I22qa1FMKo20yxY3Vcws', wonStage: '5504b3fa-59c2-4eec-b299-1e38820c8de4' }
];
var ALL_WON_STAGES = PIPELINES.map(function(p) { return p.wonStage; });
var ALL_REFUNDED_STAGES = ['81dca2b1-f729-47ba-8a14-a8d3f873c9e5', 'f9784964-a872-4d0e-be2d-b6aec25f5963'];

var CF_CASH = 'Vsw1rOQAW9Pvjfh69dJA';
var CF_NOTES = '60tWWito5ohRf6pFlYWB';

// Meta source tags = deals attributable to paid Meta ads
var META_SOURCE_TAGS = ['src-fb-lead-form-ss', 'src-vsl'];

function httpsGet(url, headers) {
  return new Promise(function (resolve) {
    var parsed = new URL(url);
    https.get(parsed, { headers: headers || {} }, function (res) {
      var body = '';
      res.on('data', function (c) { body += c; });
      res.on('end', function () {
        try { resolve(JSON.parse(body)); } catch (e) { resolve({ error: body.slice(0, 200) }); }
      });
    }).on('error', function () { resolve({ error: 'network error' }); });
  });
}

function v2Get(path) {
  return httpsGet('https://services.leadconnectorhq.com' + path, {
    'Authorization': 'Bearer ' + GHL_KEY_V2,
    'Version': '2021-07-28',
    'Accept': 'application/json'
  });
}

function cfVal(opp, fieldId) {
  var fields = opp.customFields || [];
  for (var i = 0; i < fields.length; i++) {
    if (fields[i].id === fieldId) return fields[i].fieldValue || fields[i].fieldValueString || '';
  }
  return '';
}
function cfNum(opp, fieldId) {
  var n = parseFloat(String(cfVal(opp, fieldId)).replace(/[$,]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function resolveSource(opp) {
  var tags = [];
  if (opp.contact && opp.contact.tags) tags = opp.contact.tags;
  if (!tags.length && opp.relations && opp.relations[0] && opp.relations[0].tags) tags = opp.relations[0].tags;
  for (var i = 0; i < tags.length; i++) {
    var t = String(tags[i]).toLowerCase().trim();
    if (META_SOURCE_TAGS.indexOf(t) !== -1) return t;
  }
  return null;
}

function isRefundedOpp(o) {
  if (ALL_REFUNDED_STAGES.indexOf(o.pipelineStageId) !== -1) return true;
  if ((o.name || '').toUpperCase().indexOf('REFUNDED') !== -1) return true;
  return false;
}

function getCloseDateMs(o) {
  var notesVal = cfVal(o, CF_NOTES);
  var m = notesVal.match(/Close date:\s*(\d{4}-\d{2}-\d{2})/);
  if (m) return new Date(m[1] + 'T00:00:00Z').getTime();
  return new Date(o.lastStatusChangeAt || o.updatedAt || 0).getTime();
}

function round2(n) { return Math.round(n * 100) / 100; }

// Cache
var _cache = {};
var CACHE_TTL = 120000;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  var q = req.query || {};
  var cacheKey = 'meta-' + (q.since || '2025-05-01');
  var cached = _cache[cacheKey];
  if (cached && (Date.now() - cached.ts) < CACHE_TTL) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cached.data);
  }

  var since = q.since || '2025-05-01';
  var until = q.until || new Date().toISOString().slice(0, 10);

  // 1. Fetch Meta campaign data with monthly breakdown
  var metaMonthly = {};
  var metaCampaigns = [];
  var totalSpend = 0, totalLeads = 0, totalClicks = 0, totalImpressions = 0;

  if (META_TOKEN && META_ACCT) {
    var metaUrl = 'https://graph.facebook.com/v21.0/act_' + META_ACCT +
      '/campaigns?fields=name,insights.time_range({"since":"' + since + '","until":"' + until + '"}).time_increment(monthly){spend,impressions,clicks,actions}&limit=200&access_token=' + META_TOKEN;
    var metaData = await httpsGet(metaUrl);
    var campaigns = metaData.data || [];
    for (var ci = 0; ci < campaigns.length; ci++) {
      var camp = campaigns[ci];
      var insights = (camp.insights && camp.insights.data) || [];
      var campSpend = 0, campLeads = 0, campClicks = 0, campImpr = 0;
      for (var ii = 0; ii < insights.length; ii++) {
        var ins = insights[ii];
        var sp = parseFloat(ins.spend) || 0;
        var cl = parseInt(ins.clicks) || 0;
        var im = parseInt(ins.impressions) || 0;
        var ld = 0;
        (ins.actions || []).forEach(function (a) {
          if (a.action_type === 'lead' || a.action_type === 'offsite_conversion.fb_pixel_lead') ld += parseInt(a.value) || 0;
        });
        campSpend += sp;
        campLeads += ld;
        campClicks += cl;
        campImpr += im;
        // Monthly bucket
        var ym = (ins.date_start || '').slice(0, 7);
        if (ym) {
          if (!metaMonthly[ym]) metaMonthly[ym] = { spend: 0, leads: 0, clicks: 0, impressions: 0 };
          metaMonthly[ym].spend += sp;
          metaMonthly[ym].leads += ld;
          metaMonthly[ym].clicks += cl;
          metaMonthly[ym].impressions += im;
        }
      }
      if (campSpend > 0) {
        metaCampaigns.push({
          name: camp.name,
          spend: round2(campSpend),
          leads: campLeads,
          clicks: campClicks,
          impressions: campImpr,
          cpl: campLeads > 0 ? round2(campSpend / campLeads) : 0
        });
      }
      totalSpend += campSpend;
      totalLeads += campLeads;
      totalClicks += campClicks;
      totalImpressions += campImpr;
    }
    metaCampaigns.sort(function (a, b) { return b.spend - a.spend; });
  }

  // Round monthly
  Object.keys(metaMonthly).forEach(function (k) {
    metaMonthly[k].spend = round2(metaMonthly[k].spend);
  });

  // 2. Fetch GHL deals attributable to Meta (src-fb-lead-form-ss + src-vsl)
  var metaDeals = [];
  var metaTCV = 0, metaCash = 0, metaDealCount = 0;
  var dealsByMonth = {};

  var sinceMs = new Date(since + 'T00:00:00Z').getTime();
  var untilMs = new Date(until + 'T23:59:59Z').getTime();

  for (var pi = 0; pi < PIPELINES.length; pi++) {
    var seen = {};
    var startAfterId = '';
    var page = 0;
    while (page < 20) {
      var qs = '?location_id=' + encodeURIComponent(GHL_LOCATION_ID) +
        '&pipeline_id=' + encodeURIComponent(PIPELINES[pi].id) + '&limit=100' +
        (startAfterId ? '&startAfterId=' + encodeURIComponent(startAfterId) : '');
      var d = await v2Get('/opportunities/search' + qs);
      if (!d.opportunities) break;
      for (var oi = 0; oi < d.opportunities.length; oi++) {
        var o = d.opportunities[oi];
        if (seen[o.id]) continue;
        seen[o.id] = true;
        var stageId = o.pipelineStageId || '';
        var isWon = ALL_WON_STAGES.indexOf(stageId) !== -1;
        var isRef = isRefundedOpp(o);
        if (!isWon && !isRef) continue;

        var src = resolveSource(o);
        if (!src) continue; // not a Meta-sourced deal

        var closeMs = getCloseDateMs(o);
        if (closeMs < sinceMs || closeMs > untilMs) continue;

        var tcv = parseFloat(o.monetaryValue) || 0;
        var cash = cfNum(o, CF_CASH);
        var ym = new Date(closeMs).toISOString().slice(0, 7);
        var contactName = '';
        if (o.relations && o.relations[0]) contactName = o.relations[0].fullName || o.relations[0].contactName || '';
        if (!contactName && o.contact) contactName = o.contact.name || '';

        metaDeals.push({
          name: contactName || o.name,
          tcv: round2(tcv),
          cash: round2(cash),
          source: src === 'src-fb-lead-form-ss' ? 'FB Lead Form' : 'VSL Funnel',
          closeDate: new Date(closeMs).toISOString().slice(0, 10),
          month: ym,
          isRefunded: isRef
        });
        metaTCV += tcv;
        metaCash += cash;
        metaDealCount++;

        if (!dealsByMonth[ym]) dealsByMonth[ym] = { deals: 0, tcv: 0, cash: 0 };
        dealsByMonth[ym].deals++;
        dealsByMonth[ym].tcv += tcv;
        dealsByMonth[ym].cash += cash;
      }
      var nextId = (d.meta || {}).startAfterId || '';
      if (!nextId || d.opportunities.length < 100) break;
      startAfterId = nextId;
      page++;
    }
  }

  // Round deal monthly
  Object.keys(dealsByMonth).forEach(function (k) {
    dealsByMonth[k].tcv = round2(dealsByMonth[k].tcv);
    dealsByMonth[k].cash = round2(dealsByMonth[k].cash);
  });

  // 3. Build monthly ROAS table
  var allMonths = {};
  Object.keys(metaMonthly).forEach(function (k) { allMonths[k] = true; });
  Object.keys(dealsByMonth).forEach(function (k) { allMonths[k] = true; });
  var monthlyROAS = Object.keys(allMonths).sort().map(function (ym) {
    var ad = metaMonthly[ym] || { spend: 0, leads: 0 };
    var deal = dealsByMonth[ym] || { deals: 0, tcv: 0, cash: 0 };
    return {
      month: ym,
      spend: ad.spend,
      leads: ad.leads,
      deals: deal.deals,
      tcv: deal.tcv,
      cash: deal.cash,
      roas: ad.spend > 0 ? round2(deal.tcv / ad.spend) : 0,
      cashRoas: ad.spend > 0 ? round2(deal.cash / ad.spend) : 0
    };
  });

  var overallROAS = totalSpend > 0 ? round2(metaTCV / totalSpend) : 0;
  var cashROAS = totalSpend > 0 ? round2(metaCash / totalSpend) : 0;
  var cpl = totalLeads > 0 ? round2(totalSpend / totalLeads) : 0;
  var cpa = metaDealCount > 0 ? round2(totalSpend / metaDealCount) : 0;

  metaDeals.sort(function (a, b) { return (b.closeDate || '').localeCompare(a.closeDate || ''); });

  var result = {
    since: since,
    until: until,
    totalSpend: round2(totalSpend),
    totalLeads: totalLeads,
    totalClicks: totalClicks,
    totalImpressions: totalImpressions,
    cpl: cpl,
    metaDealCount: metaDealCount,
    metaTCV: round2(metaTCV),
    metaCash: round2(metaCash),
    cpa: cpa,
    overallROAS: overallROAS,
    cashROAS: cashROAS,
    campaigns: metaCampaigns,
    monthlyROAS: monthlyROAS,
    metaDeals: metaDeals,
    fetchedAt: new Date().toISOString()
  };

  _cache[cacheKey] = { ts: Date.now(), data: result };
  return res.status(200).json(result);
};
