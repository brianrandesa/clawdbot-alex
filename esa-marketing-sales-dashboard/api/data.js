const https = require('https');
const { fetchSheetsRevenueInRange, SPREADSHEET_ID_DEFAULT } = require('./sheetsRevenue');

const GHL_KEY = (process.env.GHL_API_KEY || '').trim();
const GHL_BASE = 'https://rest.gohighlevel.com/v1';
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
  'source:esa': 'src-brian-direct'
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
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { resolve({}); } });
    }).on('error', () => resolve({}));
  });
}

function ghlGet(url) { return httpsGet(url, { 'Authorization': 'Bearer ' + GHL_KEY }); }
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

async function getUsers() {
  const data = await ghlGet(GHL_BASE + '/users/');
  const map = {};
  (data.users || []).forEach(u => { map[u.id] = u.name || (u.firstName + ' ' + u.lastName); });
  map['t5zOyXE5NPIvYXFqzuRb'] = 'Brian Rand';
  return map;
}

async function getAllContacts() {
  const contacts = [];
  let url = GHL_BASE + '/contacts/?limit=100';
  let page = 0;
  while (url && page < 50) {
    const data = await ghlGet(url);
    contacts.push(...(data.contacts || []));
    const next = (data.meta || {}).nextPageUrl || '';
    url = next ? next.replace('http://', 'https://') : null;
    page++;
    await new Promise(r => setTimeout(r, 150));
  }
  return contacts;
}

async function getAllPipelineOpportunities() {
  const all = [];
  let url = GHL_BASE + '/pipelines/' + PIPELINE_ID + '/opportunities?limit=100';
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
function computeClosedWonDealMetrics(allOpps, dateRange, allContacts) {
  const startMs = dateRange.start.getTime();
  const endMs = dateRange.end ? dateRange.end.getTime() : Date.now();
  const fallback = parseFloat(process.env.GHL_DEAL_VALUE_FALLBACK || '0') || 0;

  const contactById = {};
  (allContacts || []).forEach(c => { if (c.id) contactById[c.id] = c; });

  let totalRevenue = 0;
  let dealCount = 0;
  let dealsUsingFallback = 0;
  const bySourceRevenue = {};
  const bySourceDealCount = {};
  const teamDealRevenue = {};
  const teamDealCount = {};

  for (const o of allOpps) {
    if (o.pipelineStageId !== CLOSED_WON_STAGE_ID) continue;
    const closedAt = new Date(o.lastStatusChangeAt || o.updatedAt || 0).getTime();
    if (closedAt < startMs || closedAt > endMs) continue;

    let amount = parseFloat(o.monetaryValue);
    if (!amount || amount <= 0) {
      if (fallback > 0) {
        amount = fallback;
        dealsUsingFallback++;
      } else {
        continue;
      }
    }

    dealCount++;
    totalRevenue += amount;

    const cid = (o.contact && o.contact.id) ? o.contact.id : null;
    const c = cid ? contactById[cid] : null;
    const tags = c ? (c.tags || []).map(t => t.toLowerCase().trim()) : [];
    const src = (c && isESAContact(tags)) ? (resolveSource(tags) || 'unknown') : 'unknown';
    bySourceRevenue[src] = (bySourceRevenue[src] || 0) + amount;
    bySourceDealCount[src] = (bySourceDealCount[src] || 0) + 1;

    const aid = c ? (c.assignedTo || 'unassigned') : 'unassigned';
    teamDealRevenue[aid] = (teamDealRevenue[aid] || 0) + amount;
    teamDealCount[aid] = (teamDealCount[aid] || 0) + 1;
  }

  return {
    totalRevenue,
    dealCount,
    dealsUsingFallback,
    bySourceRevenue,
    bySourceDealCount,
    teamDealRevenue,
    teamDealCount
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
  const dealMetrics = computeClosedWonDealMetrics(allOpps || [], dateRange, allContacts);

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
    const tags = (c.tags || []).map(t => t.toLowerCase().trim());
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
    cashCollectedPct: 0,
    avgUpfrontCash: 0,
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
    rawData: rawRows,
    fetchedAt: new Date().toISOString()
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
    const [allContacts, userMap, metaData, allOpps, sheetSnap] = await Promise.all([
      getAllContacts(),
      getUsers(),
      getMetaAdSpend(dateRange),
      getAllPipelineOpportunities(),
      fetchSheet ? fetchSheetsRevenueInRange(dateRange) : Promise.resolve(null)
    ]);
    const stageData = buildStageDataFromOpps(allOpps);

    let metrics = buildMetrics(allContacts, stageData, userMap, metaData, dateRange, allOpps);

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

    return res.status(200).json(metrics);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
