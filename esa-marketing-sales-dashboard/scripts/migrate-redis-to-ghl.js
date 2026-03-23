#!/usr/bin/env node
/**
 * Migrate Redis submission deals to GHL opportunities.
 *
 * Usage:
 *   export GHL_API_KEY_V2="pit-..."
 *   export GHL_LOCATION_ID="l7J6..."
 *   node scripts/migrate-redis-to-ghl.js [--dry-run]
 *
 * Reads from the live /api/deal-submissions endpoint, groups by email
 * (multiple rows = payment plan), and creates one GHL opportunity per client
 * in the Brian & Diamond pipeline as Closed Won.
 */

const https = require('https');

const GHL_KEY_V2 = process.env.GHL_API_KEY_V2 || '';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '';
// Historical Sales (Import) pipeline -- no automations
const PIPELINE_ID = 'I22qa1FMKo20yxY3Vcws';
const CLOSED_WON_STAGE = '5504b3fa-59c2-4eec-b299-1e38820c8de4';
const DRY_RUN = process.argv.includes('--dry-run');

// Custom field IDs
const CF_CASH = 'Vsw1rOQAW9Pvjfh69dJA';
const CF_PRODUCT = 'hFhMIiR3sS8SeANm59Ke';
const CF_SETTER = 'e3Ca8YEEcgIPHBjTRHOm';
const CF_CLOSER = 'kzM90BE4nZTqPiFUaq8U';
const CF_SETTER_COMM_PCT = 'P4L609odpMmlumdQZq0S';
const CF_CLOSER_COMM_PCT = '9J36dFinm9Fx67I6Rt8x';
const CF_FATHOM = 'X6oVJega05lWyyLuiCty';
const CF_NOTES = '60tWWito5ohRf6pFlYWB';
const CF_NEXT_STEPS = 'faepoQCRUUMuiWnJhfcO';
const CF_DATE_FIRST_APPT = 'Ww86ESt6WpntHynEN8Iw';
const CF_DATE_FIRST_PAYMENT = 'gnrAHfUyb2By3kYJlArc';

// Emails to skip
const SKIP_EMAILS = new Set(['brian@test.com']);
// Email typo merges
const EMAIL_FIXES = { 'mike@pinkharbor.cm': 'mike@pinkharbor.com' };

const SUBMISSIONS_URL = 'https://esa-marketing-sales-dashboard.vercel.app/api/deal-submissions';

function httpGet(url) {
  return new Promise(function(resolve, reject) {
    https.get(url, function(res) {
      var d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() { resolve(JSON.parse(d)); });
    }).on('error', reject);
  });
}

function httpReq(method, url, body, headers) {
  return new Promise(function(resolve, reject) {
    var parsed = new URL(url);
    var postData = JSON.stringify(body);
    var opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: method,
      headers: Object.assign({
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }, headers)
    };
    var req = https.request(opts, function(res) {
      var d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch(e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function v2Headers() {
  return {
    'Authorization': 'Bearer ' + GHL_KEY_V2,
    'Version': '2021-07-28',
    'Accept': 'application/json'
  };
}

// Search for existing contact by email
async function findContactByEmail(email) {
  var url = 'https://services.leadconnectorhq.com/contacts/search/duplicate?locationId=' +
    encodeURIComponent(GHL_LOCATION_ID) + '&email=' + encodeURIComponent(email);
  var res = await httpReq('GET', url, null, v2Headers());
  // GET doesn't send body, use httpGet-like approach
  return null; // We'll use the v1 API for contact lookup
}

// Find contact via v1 API
async function findContactV1(email) {
  var url = 'https://rest.gohighlevel.com/v1/contacts/lookup?email=' + encodeURIComponent(email);
  var res = await new Promise(function(resolve, reject) {
    https.get(url, { headers: { 'Authorization': 'Bearer ' + (process.env.GHL_API_KEY || '') } }, function(r) {
      var d = '';
      r.on('data', function(c) { d += c; });
      r.on('end', function() {
        try { resolve(JSON.parse(d)); } catch(e) { resolve(null); }
      });
    }).on('error', function() { resolve(null); });
  });
  if (res && res.contacts && res.contacts.length) return res.contacts[0];
  return null;
}

// Create opportunity via v2
async function createOpportunity(data) {
  var url = 'https://services.leadconnectorhq.com/opportunities/';
  return await httpReq('POST', url, data, v2Headers());
}

// Update opportunity custom fields via v2
async function updateOppCustomFields(oppId, customFields) {
  var url = 'https://services.leadconnectorhq.com/opportunities/' + oppId;
  return await httpReq('PUT', url, { customFields: customFields }, v2Headers());
}

function clean(s) { return (s || '').trim(); }
function num(s) { return parseFloat(String(s || '').replace(/[$,]/g, '')) || 0; }

// Parse messy date formats: 2026-03-17, 03/16/2026, 3/18, 3/6/26, 1/20/2026
function parseDate(s) {
  var t = (s || '').trim();
  if (!t) return null;
  // YYYY-MM-DD
  var m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  // M/D/YYYY or M/D/YY or M/D
  var m2 = t.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (m2) {
    var month = +m2[1], day = +m2[2];
    var year = m2[3] ? +m2[3] : new Date().getFullYear();
    if (year < 100) year += 2000;
    return new Date(Date.UTC(year, month - 1, day));
  }
  // Try native parse
  var d = new Date(t);
  return isNaN(d.getTime()) ? null : d;
}

function toISO(d) { return d ? d.toISOString() : null; }

async function main() {
  if (!GHL_KEY_V2) { console.error('Set GHL_API_KEY_V2'); process.exit(1); }
  if (!GHL_LOCATION_ID) { console.error('Set GHL_LOCATION_ID'); process.exit(1); }

  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== LIVE MIGRATION ===');

  // 1. Fetch submissions
  console.log('Fetching submissions...');
  var data = await httpGet(SUBMISSIONS_URL);
  var rows = data.rows || [];
  console.log('Total rows:', rows.length);

  // 2. Group by email
  var byEmail = {};
  rows.forEach(function(r) {
    var e = clean(r.email).toLowerCase();
    if (EMAIL_FIXES[e]) e = EMAIL_FIXES[e];
    if (SKIP_EMAILS.has(e)) return;
    if (!e) return;
    if (!byEmail[e]) byEmail[e] = [];
    byEmail[e].push(r);
  });

  var clients = Object.keys(byEmail).sort();
  console.log('Unique clients:', clients.length);
  console.log('');

  var created = 0, skipped = 0, errors = 0;

  for (var i = 0; i < clients.length; i++) {
    var email = clients[i];
    var entries = byEmail[email];
    var first = entries[0];

    // Consolidate payment plan entries
    var totalPaid = 0;
    entries.forEach(function(r) { totalPaid += num(r.monetaryValue); });
    var lastOwed = num(entries[entries.length - 1].amountOwed);
    var tcv = totalPaid + lastOwed; // Total contract value
    var cashCollected = totalPaid;
    var isPaymentPlan = entries.length > 1 || lastOwed > 0;

    // Use first entry for metadata
    var clientName = clean(first.clientOrEvent)
      .replace(/ - 2nd payment$/i, '')
      .replace(/ 2nd payment$/i, '')
      .replace(/ - Summit At Sea$/i, ' - Summit At Sea');
    var product = clean(first.product) || 'Event Autopilot';
    var setter = clean(first.setter) || '';
    var closer = clean(first.closer) || '';
    var setterPct = num(first.setterPct);
    var closerComm = num(first.closerComm);
    var sourceTag = clean(first.sourceTag) || 'src-organic';
    var notes = entries.map(function(r) {
      return (r.notes || '').trim();
    }).filter(Boolean).join(' | ');
    var fathom = clean(first.fathom1) || clean(first.fathom2) || '';

    // Capitalize setter/closer
    function capitalize(s) {
      return s.split(' ').map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }).join(' ');
    }
    if (setter) setter = capitalize(setter);
    if (closer) closer = capitalize(closer);

    console.log((i + 1) + '/' + clients.length + ' | ' + clientName + ' <' + email + '>');
    // Use closing date from first entry (or dateCreated as fallback)
    var closeDate = parseDate(first.closingDate) || parseDate(first.dateCreated) || null;
    var closeDateISO = toISO(closeDate);

    console.log('  TCV: $' + tcv + ' | Cash: $' + cashCollected + ' | Owed: $' + lastOwed + (isPaymentPlan ? ' [PAYMENT PLAN]' : ' [PAID]'));
    console.log('  Product: ' + product + ' | Setter: ' + setter + ' | Closer: ' + closer + ' | Close: ' + (closeDateISO || 'no date'));

    if (DRY_RUN) {
      created++;
      continue;
    }

    try {
      // Find existing contact
      var contact = await findContactV1(email);
      var contactId = contact ? contact.id : null;

      if (!contactId) {
        // Create a minimal contact so the opp has something to link to
        console.log('  No contact found -- creating one...');
        var createContactRes = await httpReq('POST', 'https://services.leadconnectorhq.com/contacts/', {
          locationId: GHL_LOCATION_ID,
          email: email,
          firstName: clean(first.firstName) || clientName.split(' ')[0] || '',
          lastName: clean(first.lastName) || clientName.split(' ').slice(1).join(' ') || '',
          source: 'REDIS IMPORT'
        }, v2Headers());
        if ((createContactRes.status === 200 || createContactRes.status === 201) && createContactRes.body.contact) {
          contactId = createContactRes.body.contact.id;
          console.log('  Created contact: ' + contactId);
        } else {
          console.log('  WARNING: Could not create contact (HTTP ' + createContactRes.status + ') -- skipping opp');
          errors++;
          continue;
        }
      }

      // Create opportunity with actual close date
      var oppData = {
        pipelineId: PIPELINE_ID,
        pipelineStageId: CLOSED_WON_STAGE,
        locationId: GHL_LOCATION_ID,
        name: clientName,
        monetaryValue: tcv,
        status: 'won',
        source: entries.length > 1 ? 'REDIS IMPORT (payment plan)' : 'REDIS IMPORT'
      };
      if (contactId) oppData.contactId = contactId;

      var res = await createOpportunity(oppData);

      if (res.status === 200 || res.status === 201) {
        var oppId = (res.body.opportunity || res.body).id;
        console.log('  Created opp: ' + oppId);

        // Set custom fields
        var cfData = [
          { id: CF_CASH, fieldValue: String(cashCollected) },
          { id: CF_PRODUCT, fieldValue: product },
          { id: CF_SETTER, fieldValue: setter || 'Unknown' },
          { id: CF_CLOSER, fieldValue: closer || 'Unknown' },
          { id: CF_NOTES, fieldValue: 'Close date: ' + (closeDateISO ? closeDateISO.slice(0, 10) : 'unknown') + (notes ? ' | ' + notes : '') + ' | Imported from Redis' + (isPaymentPlan ? ' (' + entries.length + ' payments)' : '') }
        ];
        if (setterPct > 0) cfData.push({ id: CF_SETTER_COMM_PCT, fieldValue: String(setterPct) });
        if (closerComm > 0) cfData.push({ id: CF_CLOSER_COMM_PCT, fieldValue: String(closerComm) });
        if (fathom) cfData.push({ id: CF_FATHOM, fieldValue: fathom });
        // Date fields
        var firstApptDate = parseDate(first.dateFirstCall);
        var firstPayDate = parseDate(first.datePayment);
        if (firstApptDate) cfData.push({ id: CF_DATE_FIRST_APPT, fieldValue: toISO(firstApptDate).slice(0, 10) });
        if (firstPayDate) cfData.push({ id: CF_DATE_FIRST_PAYMENT, fieldValue: toISO(firstPayDate).slice(0, 10) });

        var cfRes = await updateOppCustomFields(oppId, cfData);
        if (cfRes.status === 200 || cfRes.status === 201) {
          console.log('  Custom fields set');
        } else {
          console.log('  WARNING: Custom field update failed (HTTP ' + cfRes.status + ')');
        }

        created++;
      } else {
        console.log('  ERROR creating opp: HTTP ' + res.status + ' ' + JSON.stringify(res.body).slice(0, 200));
        errors++;
      }

      // Rate limit: 150ms between creates
      await new Promise(function(r) { setTimeout(r, 150); });

    } catch (e) {
      console.log('  ERROR: ' + e.message);
      errors++;
    }
  }

  console.log('\n=== DONE ===');
  console.log('Created: ' + created);
  console.log('Skipped: ' + skipped);
  console.log('Errors: ' + errors);
}

main().catch(function(e) { console.error(e); process.exit(1); });
