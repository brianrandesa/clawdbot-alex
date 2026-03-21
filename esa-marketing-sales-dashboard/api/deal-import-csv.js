/**
 * POST — bulk import deal rows into Redis from CSV (same shape as Submissions export).
 * Auth: body.secret === DEAL_UPLOAD_SECRET
 */
const { appendDealSubmission, listDealSubmissions, kvConfigured, MAX_ITEMS } = require('./kvDeals');
const { PIPELINE_STAGES, SOURCES } = require('./ghlDealConstants');

const UPLOAD_SECRET = (process.env.DEAL_UPLOAD_SECRET || '').trim();
const ALLOWED_STAGE = new Set(PIPELINE_STAGES.map((s) => s.id));
const ALLOWED_SOURCE = new Set(SOURCES.map((s) => s.tag));
const STAGE_BY_NAME = new Map(
  PIPELINE_STAGES.map((s) => [s.name.trim().toLowerCase(), s])
);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** @returns {string[][]} */
function parseCsv(text) {
  const t = String(text || '').replace(/^\uFEFF/, '');
  const lines = [];
  let row = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inQuote) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuote = true;
    } else if (c === ',') {
      row.push(cur);
      cur = '';
    } else if (c === '\n') {
      row.push(cur);
      cur = '';
      if (row.some((cell) => String(cell).trim() !== '')) lines.push(row);
      row = [];
    } else if (c === '\r') {
      /* skip */
    } else {
      cur += c;
    }
  }
  row.push(cur);
  if (row.some((cell) => String(cell).trim() !== '')) lines.push(row);
  return lines;
}

function normHeader(h) {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ');
}

/** Map normalized header -> internal field name */
const HEADER_TO_FIELD = new Map([
  ['submitted', 'submittedAt'],
  ['fathom 1', 'fathom1'],
  ['fathom 2', 'fathom2'],
  ['date created', 'dateCreated'],
  ['1st call', 'dateFirstCall'],
  ['payment date', 'datePayment'],
  ['closing date', 'closingDate'],
  ['event name', 'clientOrEvent'],
  ['event/name', 'clientOrEvent'],
  ['first', 'firstName'],
  ['last', 'lastName'],
  ['email', 'email'],
  ['phone', 'phone'],
  ['product', 'product'],
  ['paid', 'monetaryValue'],
  ['amount paid', 'monetaryValue'],
  ['owed', 'amountOwed'],
  ['amount owed', 'amountOwed'],
  ['setter', 'setter'],
  ['setter 5pct', 'setterPct'],
  ['setter 5%', 'setterPct'],
  ['closer', 'closer'],
  ['closer comm', 'closerComm'],
  ['closer commission', 'closerComm'],
  ['closer $', 'closerComm'],
  ['lead source', 'leadSource'],
  ['campaign', 'campaign'],
  ['adset', 'adset'],
  ['ad set', 'adset'],
  ['ad', 'ad'],
  ['source tag', 'sourceTag'],
  ['src tag', 'sourceTag'],
  ['stage', 'stageRaw'],
  ['pipeline stage', 'stageRaw'],
  ['payment plan', 'paymentPlanRaw'],
  ['notes', 'notes'],
  ['contact id', 'contactId'],
  ['contact', 'contactId'],
  ['opp id', 'opportunityId'],
  ['opportunity id', 'opportunityId'],
  ['opp', 'opportunityId']
]);

function mapHeaderToField(norm) {
  if (HEADER_TO_FIELD.has(norm)) return HEADER_TO_FIELD.get(norm);
  if (norm === 'monetary value' || norm === 'amount') return 'monetaryValue';
  return null;
}

function parseMoney(s) {
  if (s == null || s === '') return null;
  if (typeof s === 'number' && !Number.isNaN(s)) return s;
  const t = String(s).replace(/[$£€,\s]/g, '').trim();
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

function parseSubmittedAt(s) {
  if (s == null || String(s).trim() === '') return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function resolveStageId(raw) {
  const t = String(raw || '').trim();
  if (!t) return null;
  if (UUID_RE.test(t) && ALLOWED_STAGE.has(t)) return t;
  const st = STAGE_BY_NAME.get(t.toLowerCase());
  return st ? st.id : null;
}

function resolveSourceTag(raw) {
  const t = String(raw || '').trim();
  if (!t) return 'src-organic';
  if (ALLOWED_SOURCE.has(t)) return t;
  const lower = t.toLowerCase();
  for (const s of SOURCES) {
    if (s.tag.toLowerCase() === lower) return s.tag;
  }
  return 'src-organic';
}

function parseBoolPlan(s) {
  const x = String(s || '')
    .trim()
    .toLowerCase();
  return x === 'y' || x === 'yes' || x === 'true' || x === '1';
}

function stageNameFromId(id) {
  const st = PIPELINE_STAGES.find((s) => s.id === id);
  return st ? st.name : '';
}

/**
 * @param {string[]} cells
 * @param {Record<string, number>} colMap
 */
function rowObjectFromCells(cells, colMap) {
  const o = {};
  for (const [field, idx] of Object.entries(colMap)) {
    if (idx >= 0 && idx < cells.length) o[field] = cells[idx];
    else o[field] = '';
  }
  return o;
}

function buildKvRow(o, lineIndex, baseTimeMs, totalRows) {
  const email = String(o.email || '')
    .trim()
    .toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Line ' + (lineIndex + 2) + ': valid Email required' };
  }
  const clientOrEvent = String(o.clientOrEvent || '').trim();
  if (!clientOrEvent) {
    return { error: 'Line ' + (lineIndex + 2) + ': EVENT_NAME / client name required' };
  }
  const product = String(o.product || '').trim();
  if (!product) {
    return { error: 'Line ' + (lineIndex + 2) + ': Product required' };
  }
  const valueNum = parseMoney(o.monetaryValue);
  if (valueNum == null || valueNum < 0) {
    return { error: 'Line ' + (lineIndex + 2) + ': Paid / amount must be a number ≥ 0' };
  }
  let owedNum = parseMoney(o.amountOwed);
  if (owedNum == null || owedNum < 0) owedNum = 0;

  const stageId = resolveStageId(o.stageRaw);
  if (!stageId) {
    return {
      error:
        'Line ' +
        (lineIndex + 2) +
        ': Stage must be a pipeline stage name (e.g. Closed Won) or valid stage UUID'
    };
  }

  let submittedAt = parseSubmittedAt(o.submittedAt);
  if (!submittedAt) {
    const offset = (totalRows - 1 - lineIndex) * 1000;
    submittedAt = new Date(baseTimeMs - offset).toISOString();
  }

  const sourceTag = resolveSourceTag(o.sourceTag);
  const firstName = String(o.firstName || '').trim();
  const lastName = String(o.lastName || '').trim();
  const title = clientOrEvent;

  return {
    row: {
      submittedAt,
      contactId: String(o.contactId || '').trim(),
      opportunityId: String(o.opportunityId || '').trim(),
      fathom1: String(o.fathom1 || '').trim(),
      fathom2: String(o.fathom2 || '').trim(),
      dateCreated: String(o.dateCreated || '').trim(),
      dateFirstCall: String(o.dateFirstCall || '').trim(),
      datePayment: String(o.datePayment || '').trim(),
      closingDate: String(o.closingDate || '').trim(),
      clientOrEvent,
      firstName: firstName || 'Unknown',
      lastName: lastName || (clientOrEvent.split(/\s+/).length > 1 ? clientOrEvent.split(/\s+/).slice(1).join(' ') : 'Client'),
      email,
      phone: String(o.phone || '').trim(),
      product,
      monetaryValue: valueNum,
      amountOwed: owedNum,
      setter: String(o.setter || '').trim(),
      setterPct: String(o.setterPct || '').trim(),
      closer: String(o.closer || '').trim(),
      closerComm: String(o.closerComm || '').trim(),
      leadSource: String(o.leadSource || '').trim(),
      campaign: String(o.campaign || '').trim(),
      adset: String(o.adset || '').trim(),
      ad: String(o.ad || '').trim(),
      sourceTag,
      pipelineStageId: stageId,
      stageName: stageNameFromId(stageId),
      paymentPlan: parseBoolPlan(o.paymentPlanRaw),
      notes: String(o.notes || '').trim(),
      dealTitle: title
    }
  };
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

  if (!UPLOAD_SECRET) {
    return res.status(503).json({
      error: 'Import disabled',
      hint: 'Set DEAL_UPLOAD_SECRET on Vercel (same as Sales tab team password).'
    });
  }

  if (!kvConfigured()) {
    return res.status(503).json({
      error: 'Redis not configured',
      hint: 'Link Redis on Vercel (REDIS_URL or REST KV vars) and redeploy.'
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

  const csvText = String(body.csv || '');
  if (!csvText.trim()) {
    return res.status(400).json({ error: 'Missing csv string in body' });
  }

  const lines = parseCsv(csvText);
  if (lines.length < 2) {
    return res.status(400).json({ error: 'CSV must have a header row and at least one data row' });
  }

  const headerCells = lines[0].map((c) => String(c).trim());
  const colMap = {};
  for (let i = 0; i < headerCells.length; i++) {
    const field = mapHeaderToField(normHeader(headerCells[i]));
    if (field && colMap[field] === undefined) colMap[field] = i;
  }

  const requiredFields = ['email', 'clientOrEvent', 'product', 'monetaryValue', 'stageRaw'];
  const missing = requiredFields.filter((f) => colMap[f] === undefined);
  if (missing.length) {
    return res.status(400).json({
      error: 'CSV missing required columns',
      missingHeaders: missing,
      hint:
        'Export a sample from Submissions or see SUBMISSIONS_IMPORT_CSV.md. Required: Email, EVENT_NAME, Product, Paid, Stage (plus optional columns).'
    });
  }

  const dataLines = lines.slice(1).filter((cells) => cells.some((c) => String(c).trim() !== ''));
  if (dataLines.length === 0) {
    return res.status(400).json({ error: 'No data rows after header' });
  }

  const { rows: existing } = await listDealSubmissions();
  const space = MAX_ITEMS - existing.length;
  if (dataLines.length > space) {
    return res.status(400).json({
      error: 'Import would exceed saved row limit',
      maxItems: MAX_ITEMS,
      currentCount: existing.length,
      importRows: dataLines.length,
      freeSlots: space,
      hint: 'Remove old rows or raise MAX_ITEMS in code after ops review.'
    });
  }

  const baseTimeMs = Date.now();
  const kvRows = [];
  for (let i = 0; i < dataLines.length; i++) {
    const o = rowObjectFromCells(dataLines[i], colMap);
    const built = buildKvRow(o, i, baseTimeMs, dataLines.length);
    if (built.error) {
      return res.status(400).json({ error: built.error });
    }
    kvRows.push(built.row);
  }

  let saved = 0;
  for (const row of kvRows) {
    const ok = await appendDealSubmission(row);
    if (!ok) {
      return res.status(502).json({
        error: 'Redis write failed partway',
        imported: saved,
        hint: 'Check Redis limits and redeploy.'
      });
    }
    saved++;
  }

  return res.status(200).json({
    ok: true,
    imported: saved,
    message: saved + ' row(s) imported. Open Submissions to verify or export CSV.'
  });
};
