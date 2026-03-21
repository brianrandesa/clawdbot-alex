/**
 * GET — all logged deal rows from KV (newest first).
 */
const { listDealSubmissions, kvConfigured } = require('./kvDeals');

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

  try {
    const { rows, error: redisError } = await listDealSubmissions();
    return res.status(200).json({
      kvEnabled: kvConfigured(),
      count: rows.length,
      rows,
      ...(redisError ? { redisError } : {})
    });
  } catch (e) {
    return res.status(500).json({
      error: e && e.message ? e.message : String(e),
      kvEnabled: kvConfigured(),
      rows: [],
      count: 0
    });
  }
};
