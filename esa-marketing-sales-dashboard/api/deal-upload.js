/**
 * POST — find/create GHL contact + create opportunity (Brian & Diamond pipeline).
 * Body includes all Sales sheet-style fields; full row is stored on the opportunity notes/description.
 * Env: GHL_API_KEY (write), DEAL_UPLOAD_SECRET.
 */
const https = require('https');
const { appendDealSubmission } = require('./kvDeals');
const {
  PIPELINE_ID,
  GHL_BASE,
  PIPELINE_STAGES,
  STAGE_TO_STATUS_TAG,
  SOURCES
} = require('./ghlDealConstants');

const GHL_KEY = (process.env.GHL_API_KEY || '').trim();
const UPLOAD_SECRET = (process.env.DEAL_UPLOAD_SECRET || '').trim();

const ALLOWED_STAGE = new Set(PIPELINE_STAGES.map((s) => s.id));
const ALLOWED_SOURCE = new Set(SOURCES.map((s) => s.tag));

function trimStr(s, max) {
  if (s == null || s === '') return '';
  return String(s)
    .trim()
    .slice(0, max == null ? 2000 : max);
}

function slugTag(s, maxLen) {
  const t = trimStr(s, maxLen || 48)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return t.slice(0, maxLen || 48);
}

function ghlRequest(method, pathWithQuery, bodyObj) {
  const url = GHL_BASE + pathWithQuery;
  const u = new URL(url);
  const payload = bodyObj != null ? JSON.stringify(bodyObj) : null;
  return new Promise((resolve) => {
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: {
        Authorization: 'Bearer ' + GHL_KEY,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload, 'utf8') } : {})
      }
    };
    const req = https.request(opts, (res) => {
      let raw = '';
      res.on('data', (c) => {
        raw += c;
      });
      res.on('end', () => {
        let json = {};
        try {
          json = raw ? JSON.parse(raw) : {};
        } catch (_) {
          json = { _parseError: true, _raw: raw.slice(0, 500) };
        }
        resolve({ status: res.statusCode, json });
      });
    });
    req.on('error', (e) => resolve({ status: 0, json: { error: e.message } }));
    if (payload) req.write(payload);
    req.end();
  });
}

function tagString(t) {
  if (!t) return '';
  if (typeof t === 'string') return t.trim().toLowerCase();
  if (t.name) return String(t.name).trim().toLowerCase();
  return String(t).trim().toLowerCase();
}

function normalizeEmail(s) {
  return String(s || '')
    .trim()
    .toLowerCase();
}

function pickContactId(json) {
  if (json.contact && json.contact.id) return json.contact.id;
  if (json.id && (json.email || json.firstName)) return json.id;
  const list = json.contacts || [];
  if (list.length && list[0].id) return list[0].id;
  return null;
}

async function findContactByEmail(email) {
  const q = encodeURIComponent(email);
  const { status, json } = await ghlRequest('GET', '/contacts/?email=' + q + '&limit=10', null);
  if (status === 200 && json.contacts && json.contacts.length) {
    return json.contacts[0].id;
  }
  return null;
}

async function mergeContactTagsAndPatch(contactId, newTagList, patchFields) {
  const gc = await ghlRequest('GET', '/contacts/' + contactId, null);
  if (gc.status !== 200) return;
  const c = gc.json.contact || gc.json;
  const existing = (c.tags || []).map(tagString).filter(Boolean);
  const add = newTagList.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
  const merged = [...new Set([...existing, ...add])];
  const body = { tags: merged };
  if (patchFields.firstName) body.firstName = patchFields.firstName;
  if (patchFields.lastName) body.lastName = patchFields.lastName;
  if (patchFields.phone) body.phone = patchFields.phone;
  if (patchFields.source) body.source = patchFields.source;
  await ghlRequest('PUT', '/contacts/' + contactId, body);
}

function buildSheetNotes(b) {
  const line = (k, v) => {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    if (s === '') return null;
    return `${k}: ${s}`;
  };
  const rows = [
    line('Fathom 1', b.fathom1),
    line('Fathom 2', b.fathom2),
    line('Date Created', b.dateCreated),
    line('1st Sales Call Done', b.dateFirstCall),
    line('Date of Payment', b.datePayment),
    line('EVENT/NAME', b.clientOrEvent),
    line('Product', b.product),
    line('Email', b.email),
    line('Phone', b.phone),
    line('Amount Paid', b.amountPaidDisplay),
    line('Amount Owed', b.amountOwedDisplay),
    line('Setter', b.setter),
    line('Setter 5%', b.setterPct),
    line('Closer', b.closer),
    line('Closer commission', b.closerComm),
    line('Lead Source', b.leadSource),
    line('Campaign', b.campaign),
    line('Adset', b.adset),
    line('Ad', b.ad),
    line('Dashboard source tag', b.sourceTag),
    line('Notes', b.notes),
    line('Payment plan', b.paymentPlan ? 'Yes' : '')
  ].filter(Boolean);
  return 'ESA sales sheet (Command Center)\n' + rows.join('\n');
}

async function createOpportunityTry(baseOpp, title, noteBlock) {
  const tries = [
    { ...baseOpp, title, notes: noteBlock },
    { ...baseOpp, name: title, notes: noteBlock },
    { ...baseOpp, title, description: noteBlock },
    { ...baseOpp, name: title, description: noteBlock },
    { ...baseOpp, title },
    { ...baseOpp, name: title }
  ];
  for (const p of tries) {
    const r = await ghlRequest('POST', '/opportunities/', p);
    if (r.status === 200 || r.status === 201) return r;
  }
  return { status: 400, json: { error: 'all opportunity payloads failed' } };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GHL_KEY) {
    return res.status(500).json({ error: 'GHL_API_KEY not configured' });
  }
  if (!UPLOAD_SECRET) {
    return res.status(503).json({
      error: 'Deal upload disabled',
      hint: 'Set DEAL_UPLOAD_SECRET on Vercel and enter it below as the team password.'
    });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  } catch (_) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  if (body.secret !== UPLOAD_SECRET) {
    return res.status(401).json({ error: 'Invalid team password' });
  }

  const email = normalizeEmail(body.email);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const clientOrEvent = trimStr(body.clientOrEvent, 300);
  if (!clientOrEvent) {
    return res.status(400).json({ error: 'Event / name is required' });
  }

  const product = trimStr(body.product, 200);
  if (!product) {
    return res.status(400).json({ error: 'Product is required' });
  }

  const stageId = String(body.pipelineStageId || '').trim();
  if (!ALLOWED_STAGE.has(stageId)) {
    return res.status(400).json({ error: 'Invalid pipeline stage' });
  }

  const valueNum = parseFloat(body.monetaryValue);
  if (Number.isNaN(valueNum) || valueNum < 0) {
    return res.status(400).json({ error: 'Amount paid must be a number ≥ 0' });
  }

  let owedNum = parseFloat(body.amountOwed);
  if (Number.isNaN(owedNum) || owedNum < 0) owedNum = 0;

  let first = trimStr(body.firstName, 80);
  let last = trimStr(body.lastName, 80);
  const parts = clientOrEvent.split(/\s+/).filter(Boolean);
  if (!first && parts.length) first = parts[0];
  if (!last && parts.length > 1) last = parts.slice(1).join(' ');
  if (!first) first = 'Unknown';
  if (!last) last = parts.length <= 1 ? 'Client' : '—';

  const phone = trimStr(body.phone, 40);
  const sourceTag = String(body.sourceTag || 'src-organic').trim();
  if (!ALLOWED_SOURCE.has(sourceTag)) {
    return res.status(400).json({ error: 'Invalid source tag' });
  }

  const title =
    trimStr(body.dealTitle, 200) || clientOrEvent;

  const fathom1 = trimStr(body.fathom1, 500);
  const fathom2 = trimStr(body.fathom2, 500);
  const dateCreated = trimStr(body.dateCreated, 20);
  const dateFirstCall = trimStr(body.dateFirstCall, 20);
  const datePayment = trimStr(body.datePayment, 20);
  const setter = trimStr(body.setter, 80);
  const setterPct = trimStr(body.setterPct, 40);
  const closer = trimStr(body.closer, 80);
  const closerComm = trimStr(body.closerComm, 40);
  const leadSource = trimStr(body.leadSource, 200);
  const campaign = trimStr(body.campaign, 300);
  const adset = trimStr(body.adset, 300);
  const ad = trimStr(body.ad, 300);
  const notes = trimStr(body.notes, 2000);

  const noteBlock = buildSheetNotes({
    fathom1,
    fathom2,
    dateCreated,
    dateFirstCall,
    datePayment,
    clientOrEvent,
    product,
    email,
    phone,
    amountPaidDisplay: valueNum,
    amountOwedDisplay: owedNum,
    setter,
    setterPct,
    closer,
    closerComm,
    leadSource,
    campaign,
    adset,
    ad,
    sourceTag,
    notes,
    paymentPlan: !!body.paymentPlan
  });

  const tags = [sourceTag];
  const st = STAGE_TO_STATUS_TAG[stageId];
  if (st) tags.push(st);
  tags.push('deal-logged-command-center');
  if (body.paymentPlan) tags.push('payment plan');

  const pslug = slugTag(product, 40);
  if (pslug) tags.push('esa-product-' + pslug);

  if (owedNum > 0) tags.push('esa-owed-' + String(Math.round(owedNum)));

  const lsslug = slugTag(leadSource, 32);
  if (lsslug) tags.push('esa-leadsrc-' + lsslug);

  if (notes) {
    const short = notes.slice(0, 72).replace(/\n/g, ' ');
    tags.push('deal-note: ' + short + (notes.length > 72 ? '…' : ''));
  }

  let contactId = await findContactByEmail(email);
  let createdNewContact = false;

  const contactSource = leadSource || undefined;

  if (!contactId) {
    const contactPayload = {
      firstName: first || 'Unknown',
      lastName: last || '',
      email,
      tags
    };
    if (phone) contactPayload.phone = phone;
    if (contactSource) contactPayload.source = contactSource;

    const cr = await ghlRequest('POST', '/contacts/', contactPayload);
    contactId = pickContactId(cr.json);

    if (!contactId && (cr.status === 400 || cr.status === 422)) {
      contactId = await findContactByEmail(email);
    }

    if (!contactId) {
      return res.status(502).json({
        error: 'GHL contact create failed',
        ghlStatus: cr.status,
        ghl: cr.json
      });
    }
    createdNewContact = true;
  }

  if (!createdNewContact) {
    await mergeContactTagsAndPatch(contactId, tags, {
      firstName: first,
      lastName: last,
      phone: phone,
      source: contactSource
    });
  }

  const baseOpp = {
    contactId,
    pipelineId: PIPELINE_ID,
    pipelineStageId: stageId,
    monetaryValue: valueNum
  };

  const or = await createOpportunityTry(baseOpp, title, noteBlock);

  if (or.status !== 200 && or.status !== 201) {
    return res.status(502).json({
      error: 'GHL opportunity create failed',
      ghlStatus: or.status,
      ghl: or.json,
      contactId
    });
  }

  const oppId =
    (or.json.opportunity && or.json.opportunity.id) || or.json.id || or.json._id || null;

  const stageName = (PIPELINE_STAGES.find((s) => s.id === stageId) || {}).name || '';

  const kvRow = {
    submittedAt: new Date().toISOString(),
    contactId,
    opportunityId: oppId,
    fathom1,
    fathom2,
    dateCreated,
    dateFirstCall,
    datePayment,
    clientOrEvent,
    firstName: first,
    lastName: last,
    email,
    phone,
    product,
    monetaryValue: valueNum,
    amountOwed: owedNum,
    setter,
    setterPct,
    closer,
    closerComm,
    leadSource,
    campaign,
    adset,
    ad,
    sourceTag,
    pipelineStageId: stageId,
    stageName,
    paymentPlan: !!body.paymentPlan,
    notes,
    dealTitle: title
  };
  const kvSaved = await appendDealSubmission(kvRow);

  return res.status(201).json({
    ok: true,
    contactId,
    opportunityId: oppId,
    kvSaved,
    message:
      'Deal logged in GHL (sheet fields in opportunity notes). ' +
      (kvSaved ? 'Also saved to Submissions list.' : 'Connect Vercel KV to keep a sheet-style history on this site.') +
      ' Refresh the dashboard in ~2 minutes.'
  });
};
