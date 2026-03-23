/**
 * Shared pipeline + source options for deal form and GHL writes.
 * Keep in sync with api/data.js (SALES_SYSTEM).
 */
const PIPELINE_ID = 'LlthtHqW8V4PA9AWN8g7';
const GHL_BASE = 'https://rest.gohighlevel.com/v1';

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

/** Map stage id → canonical status-* tag for dashboard funnel. */
const STAGE_TO_STATUS_TAG = {
  '26fd4f29-96c2-419d-ad31-df4079ce209c': 'status-new-lead',
  '260f69ca-0e4e-4ef8-a0c8-d7e60aafd056': 'status-booked',
  'a54c1154-7b40-41cd-8ada-e14be4d64dd9': 'status-showed',
  '0b52c6ae-e2c7-40cc-879d-e0fbc1f90299': 'status-offer-made',
  '2d87708c-4bf9-4bc0-9559-1592385ce02a': 'status-contract-sent',
  '47a0b7ad-a4e5-42cf-9bc8-44c6981a6254': 'status-closed-won',
  '6670681d-724b-4457-a38b-c7998939f3da': 'status-closed-lost',
  'ac2413fd-9afd-48b4-9a0b-96937b342807': 'status-no-show',
  '290bf7ab-3155-4c10-9865-9ec765026b14': 'status-nurture'
};

const SOURCES = [
  { tag: 'src-fb-lead-form-ss', label: 'FB Lead Form' },
  { tag: 'src-vsl', label: 'VSL Funnel' },
  { tag: 'src-returning', label: 'Returning client' },
  { tag: 'src-outbound', label: 'Outbound Dialer' },
  { tag: 'src-coldcall', label: 'Cold Call Events' },
  { tag: 'src-organic', label: 'Organic' },
  { tag: 'src-brian-direct', label: "Brian's Network" }
];

module.exports = {
  PIPELINE_ID,
  GHL_BASE,
  PIPELINE_STAGES,
  STAGE_TO_STATUS_TAG,
  SOURCES
};
