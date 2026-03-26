const { db } = require('../db/database');

async function syncMarketingSnapshot() {
  const INTEGRATION_MODE = process.env.INTEGRATION_MODE || 'mock';

  try {
    if (INTEGRATION_MODE === 'mock') {
      db.prepare("INSERT INTO sync_log (source, status, error_message) VALUES ('marketing', 'skipped', 'Mock mode')").run();
      console.log('[SYNC] Marketing: mock mode, skipped');
      return;
    }

    const axios = require('axios');
    const url = process.env.MARKETING_APP_URL;
    const key = process.env.MARKETING_API_KEY;

    const { data } = await axios.get(`${url}/api/summary`, {
      headers: { Authorization: `Bearer ${key}` },
      timeout: 10000,
    });

    db.prepare(`
      INSERT OR REPLACE INTO marketing_snapshots (snapshot_date, cpl_meta, cpl_google, cpl_organic, total_spend, budget_mtd, leads_mtd, leads_ytd, ig_followers, fb_followers, top_campaign, conversion_rate, raw_payload)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.snapshot_date, data.cpl_meta, data.cpl_google, data.cpl_organic || null,
      data.total_spend, data.budget_mtd || null, data.leads_mtd, data.leads_ytd,
      data.ig_followers, data.fb_followers, data.top_campaign,
      data.conversion_rate, JSON.stringify(data)
    );

    db.prepare("INSERT INTO sync_log (source, status, error_message) VALUES ('marketing', 'success', 'API sync completed')").run();
    console.log('[SYNC] Marketing: success');
  } catch (err) {
    console.error('[SYNC] Marketing failed:', err.message);
    db.prepare("INSERT INTO sync_log (source, status, error_message) VALUES ('marketing', 'error', ?)").run(err.message);
  }
}

module.exports = syncMarketingSnapshot;
