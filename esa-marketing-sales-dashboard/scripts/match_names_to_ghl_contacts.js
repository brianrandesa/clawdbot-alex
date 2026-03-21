#!/usr/bin/env node
/**
 * Match a plain-text list of names (one per line) to GHL contacts via REST v1.
 * Fills First, Last, Email, Phone from the best-scoring CRM match.
 *
 * Usage:
 *   export GHL_API_KEY="your_private_integration_token"
 *   node scripts/match_names_to_ghl_contacts.js path/to/names.txt > enriched.csv
 *
 * Or paste into stdin:
 *   pbpaste | node scripts/match_names_to_ghl_contacts.js > enriched.csv
 *
 * Requires: Node 18+ (built-in fetch) or use https below (Node 16).
 */

const https = require('https');
const fs = require('fs');

const GHL_KEY = (process.env.GHL_API_KEY || '').trim();
const GHL_BASE = 'https://rest.gohighlevel.com/v1';

if (!GHL_KEY) {
  console.error('ERROR: Set GHL_API_KEY in the environment.');
  process.exit(1);
}

function ghlGet(pathWithQuery) {
  return new Promise((resolve, reject) => {
    const url = GHL_BASE + pathWithQuery;
    https
      .get(url, { headers: { Authorization: 'Bearer ' + GHL_KEY } }, (res) => {
        let body = '';
        res.on('data', (c) => {
          body += c;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body || '{}'));
          } catch (e) {
            resolve({});
          }
        });
      })
      .on('error', reject);
  });
}

async function getAllContacts() {
  const contacts = [];
  let path = '/contacts/?limit=100';
  for (let page = 0; page < 80; page++) {
    const data = await ghlGet(path);
    const batch = data.contacts || [];
    contacts.push(...batch);
    const next = (data.meta || {}).nextPageUrl || '';
    if (!next) break;
    try {
      const u = new URL(String(next).replace(/^http:\/\//, 'https://'));
      path = u.pathname + u.search;
    } catch (_) {
      break;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  return contacts;
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[.,'"`]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Use for matching only: drop trailing " - something" (2nd payment, Summit, etc.) */
function matchKeyFromLine(line) {
  let t = String(line || '').trim();
  t = t.replace(/\s+-\s+.+$/i, '').trim();
  t = t.replace(/\s*2nd\s*payment\s*$/i, '').trim();
  return norm(t);
}

function fullName(c) {
  return norm([c.firstName, c.lastName].filter(Boolean).join(' '));
}

function score(targetNorm, c) {
  const fn = fullName(c);
  if (!fn || !targetNorm) return 0;
  if (fn === targetNorm) return 100;
  if (fn.includes(targetNorm) || targetNorm.includes(fn)) return 85;
  const tw = targetNorm.split(' ').filter((w) => w.length > 1);
  if (tw.length === 0) return 0;
  const hit = tw.filter((w) => fn.includes(w));
  if (hit.length === tw.length) return 70;
  if (hit.length >= Math.ceil(tw.length / 2) && tw.length >= 2) return 45;
  if (tw.length === 1 && fn.includes(tw[0])) return 50;
  return 0;
}

function bestMatch(targetNorm, contacts) {
  let best = null;
  let bestScore = 0;
  for (const c of contacts) {
    const s = score(targetNorm, c);
    if (s > bestScore) {
      bestScore = s;
      best = c;
    }
  }
  return bestScore >= 45 ? { contact: best, score: bestScore } : null;
}

function csvCell(x) {
  const s = x == null ? '' : String(x);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

async function main() {
  const arg = process.argv[2];
  let raw = '';
  if (arg && fs.existsSync(arg)) {
    raw = fs.readFileSync(arg, 'utf8');
  } else {
    try {
      raw = fs.readFileSync(0, 'utf8');
    } catch (_) {
      console.error('Usage: node match_names_to_ghl_contacts.js [names.txt] < names.txt');
      process.exit(1);
    }
  }

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !/^EVENT\/NAME/i.test(l) && !/^\t+$/.test(l));

  console.error('Fetching all contacts from GHL (paginated)...');
  const contacts = await getAllContacts();
  console.error('Loaded', contacts.length, 'contacts. Matching...\n');

  const header = [
    'EVENT_NAME_input',
    'First',
    'Last',
    'Email',
    'Phone',
    'match_score',
    'ghl_contact_id'
  ];
  console.log(header.map(csvCell).join(','));

  for (const line of lines) {
    const key = matchKeyFromLine(line);
    const m = key ? bestMatch(key, contacts) : null;
    if (m) {
      const c = m.contact;
      console.log(
        [
          line,
          c.firstName || '',
          c.lastName || '',
          c.email || '',
          c.phone || '',
          String(m.score),
          c.id || ''
        ]
          .map(csvCell)
          .join(',')
      );
    } else {
      console.log([line, '', '', '', '', '0', ''].map(csvCell).join(','));
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
