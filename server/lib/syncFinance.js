const { db } = require('../db/database');

async function syncFinanceSnapshot() {
  const INTEGRATION_MODE = process.env.INTEGRATION_MODE || 'mock';

  try {
    if (INTEGRATION_MODE === 'mock') {
      db.prepare("INSERT INTO sync_log (source, status, error_message) VALUES ('finance', 'skipped', 'Mock mode')").run();
      console.log('[SYNC] Finance: mock mode, skipped');
      return;
    }

    const axios = require('axios');
    const url = process.env.FINANCE_APP_URL;
    const key = process.env.FINANCE_API_KEY;

    const { data } = await axios.get(`${url}/api/summary`, {
      headers: { Authorization: `Bearer ${key}` },
      timeout: 10000,
    });

    db.prepare(`
      INSERT OR REPLACE INTO finance_snapshots (snapshot_date, revenue_mtd, revenue_ytd, tuition_collected, tuition_expected, outstanding_balances, govt_funding_received, expenses_total, net_position, cost_per_student, days_cash_on_hand, raw_payload)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.snapshot_date, data.revenue_mtd, data.revenue_ytd, data.tuition_collected,
      data.tuition_expected, data.outstanding_balances, data.govt_funding_received,
      data.expenses_total, data.net_position, data.cost_per_student || null,
      data.days_cash_on_hand || null, JSON.stringify(data)
    );

    db.prepare("INSERT INTO sync_log (source, status, error_message) VALUES ('finance', 'success', 'API sync completed')").run();
    console.log('[SYNC] Finance: success');
  } catch (err) {
    console.error('[SYNC] Finance failed:', err.message);
    db.prepare("INSERT INTO sync_log (source, status, error_message) VALUES ('finance', 'error', ?)").run(err.message);
  }
}

module.exports = syncFinanceSnapshot;
