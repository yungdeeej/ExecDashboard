require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const { initializeDatabase } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Initialize database
initializeDatabase();

// API Routes (prefixed with /api/v1/)
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/finance', require('./routes/finance'));
app.use('/api/v1/enrollment', require('./routes/enrollment'));
app.use('/api/v1/outcomes', require('./routes/outcomes'));
app.use('/api/v1/marketing', require('./routes/marketing'));

// Sync functions (mock mode by default)
const INTEGRATION_MODE = process.env.INTEGRATION_MODE || 'mock';

async function syncFinanceSnapshot() {
  const { db } = require('./db/database');
  try {
    if (INTEGRATION_MODE === 'live') {
      const fetch = (await import('node-fetch')).default;
      const url = process.env.FINANCE_APP_URL;
      const key = process.env.FINANCE_API_KEY;
      const response = await fetch(`${url}/api/summary`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      const data = await response.json();

      db.prepare(`
        INSERT INTO finance_snapshots (snapshot_date, revenue_mtd, revenue_ytd, tuition_collected, tuition_expected, outstanding_balances, govt_funding_received, expenses_total, net_position, raw_payload)
        VALUES (date('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.revenue_mtd, data.revenue_ytd, data.tuition_collected,
        data.tuition_expected, data.outstanding_balances, data.govt_funding_received,
        data.expenses_total, data.net_position, JSON.stringify(data)
      );

      db.prepare("INSERT INTO sync_log (source, status, message) VALUES ('finance', 'success', 'API sync completed')").run();
    } else {
      db.prepare("INSERT INTO sync_log (source, status, message) VALUES ('finance', 'skipped', 'Mock mode - no sync')").run();
    }
    console.log(`[CRON] Finance sync completed (mode: ${INTEGRATION_MODE})`);
  } catch (err) {
    console.error('[CRON] Finance sync failed:', err.message);
    db.prepare("INSERT INTO sync_log (source, status, message) VALUES ('finance', 'error', ?)").run(err.message);
  }
}

async function syncMarketingSnapshot() {
  const { db } = require('./db/database');
  try {
    if (INTEGRATION_MODE === 'live') {
      const fetch = (await import('node-fetch')).default;
      const url = process.env.MARKETING_APP_URL;
      const key = process.env.MARKETING_API_KEY;
      const response = await fetch(`${url}/api/performance-summary`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      const data = await response.json();

      db.prepare(`
        INSERT INTO marketing_snapshots (snapshot_date, cpl_meta, cpl_google, total_spend, leads_mtd, leads_ytd, ig_followers, fb_followers, top_campaign, conversion_rate, raw_payload)
        VALUES (date('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.cpl_meta, data.cpl_google, data.total_spend,
        data.leads_mtd, data.leads_ytd, data.ig_followers,
        data.fb_followers, data.top_campaign, data.conversion_rate,
        JSON.stringify(data)
      );

      db.prepare("INSERT INTO sync_log (source, status, message) VALUES ('marketing', 'success', 'API sync completed')").run();
    } else {
      db.prepare("INSERT INTO sync_log (source, status, message) VALUES ('marketing', 'skipped', 'Mock mode - no sync')").run();
    }
    console.log(`[CRON] Marketing sync completed (mode: ${INTEGRATION_MODE})`);
  } catch (err) {
    console.error('[CRON] Marketing sync failed:', err.message);
    db.prepare("INSERT INTO sync_log (source, status, message) VALUES ('marketing', 'error', ?)").run(err.message);
  }
}

// Schedule cron jobs - every 60 minutes
cron.schedule('0 * * * *', async () => {
  await syncFinanceSnapshot();
  await syncMarketingSnapshot();
});

// Serve static files in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MCG Dashboard server running on port ${PORT}`);
});
