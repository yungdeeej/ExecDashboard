const express = require('express');
const { db } = require('../db/database');

const router = express.Router();

function verifyWebhookSecret(req, res, next) {
  const secret = req.headers['x-webhook-secret'];
  const expected = process.env.DASHBOARD_WEBHOOK_SECRET;

  if (!expected || secret !== expected) {
    return res.status(401).json({ error: 'Invalid webhook secret' });
  }
  next();
}

router.use(verifyWebhookSecret);

// POST /finance - receive finance data via webhook
router.post('/finance', (req, res) => {
  try {
    const {
      snapshot_date, revenue_mtd, revenue_ytd, tuition_collected,
      tuition_expected, outstanding_balances, govt_funding_received,
      expenses_total, net_position, cost_per_student, days_cash_on_hand
    } = req.body;

    if (!snapshot_date) {
      return res.status(400).json({ error: 'snapshot_date is required' });
    }

    const result = db.prepare(`
      INSERT INTO finance_snapshots
        (snapshot_date, revenue_mtd, revenue_ytd, tuition_collected,
         tuition_expected, outstanding_balances, govt_funding_received,
         expenses_total, net_position, cost_per_student, days_cash_on_hand,
         fetched_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      snapshot_date,
      revenue_mtd || 0, revenue_ytd || 0,
      tuition_collected || 0, tuition_expected || 0,
      outstanding_balances || 0, govt_funding_received || 0,
      expenses_total || 0, net_position || 0,
      cost_per_student || 0, days_cash_on_hand || 0
    );

    res.status(201).json({ data: { id: result.lastInsertRowid } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /marketing - receive marketing data via webhook
router.post('/marketing', (req, res) => {
  try {
    const {
      cpl_meta, cpl_google, cpl_organic, total_spend,
      budget_mtd, leads_mtd, leads_ytd, ig_followers,
      fb_followers, top_campaign, conversion_rate
    } = req.body;

    const result = db.prepare(`
      INSERT INTO marketing_snapshots
        (cpl_meta, cpl_google, cpl_organic, total_spend,
         budget_mtd, leads_mtd, leads_ytd, ig_followers,
         fb_followers, top_campaign, conversion_rate, fetched_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      cpl_meta || 0, cpl_google || 0, cpl_organic || 0,
      total_spend || 0, budget_mtd || 0,
      leads_mtd || 0, leads_ytd || 0,
      ig_followers || 0, fb_followers || 0,
      top_campaign || null, conversion_rate || 0
    );

    res.status(201).json({ data: { id: result.lastInsertRowid } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
