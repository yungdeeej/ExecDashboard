const express = require('express');
const { db } = require('../../db/database');
const { authenticateToken, requireRole } = require('../../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('dean', 'admin'));

// GET /latest - most recent marketing snapshot
router.get('/latest', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT cpl_meta, cpl_google, cpl_organic, total_spend,
             budget_mtd, leads_mtd, leads_ytd, ig_followers,
             fb_followers, top_campaign, conversion_rate, fetched_at
      FROM marketing_snapshots
      ORDER BY fetched_at DESC
      LIMIT 1
    `).get();

    if (!row) {
      return res.status(404).json({ error: 'No marketing data available' });
    }

    res.json({ data: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /trend - marketing trend over time
router.get('/trend', (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;

    const rows = db.prepare(`
      SELECT cpl_meta, cpl_google, cpl_organic, total_spend,
             budget_mtd, leads_mtd, leads_ytd, ig_followers,
             fb_followers, top_campaign, conversion_rate, fetched_at
      FROM marketing_snapshots
      WHERE fetched_at >= datetime('now', '-' || ? || ' days')
      ORDER BY fetched_at ASC
    `).all(days);

    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
