const express = require('express');
const { db } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get latest marketing snapshot
router.get('/latest', authenticateToken, (req, res) => {
  try {
    const snapshot = db.prepare(
      'SELECT * FROM marketing_snapshots ORDER BY snapshot_date DESC LIMIT 1'
    ).get();

    if (!snapshot) {
      return res.json({ data: null, message: 'No marketing data available' });
    }

    res.json({ data: snapshot });
  } catch (err) {
    console.error('Marketing latest error:', err);
    res.status(500).json({ error: 'Failed to fetch marketing data' });
  }
});

// Get marketing trend
router.get('/trend', authenticateToken, (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const snapshots = db.prepare(
      'SELECT * FROM marketing_snapshots ORDER BY snapshot_date DESC LIMIT ?'
    ).all(days);

    res.json({ data: snapshots.reverse() });
  } catch (err) {
    console.error('Marketing trend error:', err);
    res.status(500).json({ error: 'Failed to fetch marketing trends' });
  }
});

// Manual entry / override
router.post('/entry', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const {
      snapshot_date, cpl_meta, cpl_google, total_spend,
      leads_mtd, leads_ytd, ig_followers, fb_followers,
      top_campaign, conversion_rate
    } = req.body;

    const result = db.prepare(`
      INSERT INTO marketing_snapshots (snapshot_date, cpl_meta, cpl_google, total_spend, leads_mtd, leads_ytd, ig_followers, fb_followers, top_campaign, conversion_rate, raw_payload)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      snapshot_date, cpl_meta, cpl_google, total_spend,
      leads_mtd, leads_ytd, ig_followers, fb_followers,
      top_campaign, conversion_rate,
      JSON.stringify({ source: 'manual', submitted_by: req.user.name })
    );

    res.json({ message: 'Marketing entry saved', id: result.lastInsertRowid });
  } catch (err) {
    console.error('Marketing entry error:', err);
    res.status(500).json({ error: 'Failed to save marketing entry' });
  }
});

module.exports = router;
