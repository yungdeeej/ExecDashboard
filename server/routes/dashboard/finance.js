const express = require('express');
const { db } = require('../../db/database');
const { authenticateToken, requireRole } = require('../../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('dean', 'admin'));

// GET /latest - most recent finance snapshot
router.get('/latest', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT snapshot_date, revenue_mtd, revenue_ytd, tuition_collected,
             tuition_expected, outstanding_balances, govt_funding_received,
             expenses_total, net_position, cost_per_student,
             days_cash_on_hand, fetched_at
      FROM finance_snapshots
      ORDER BY snapshot_date DESC
      LIMIT 1
    `).get();

    if (!row) {
      return res.status(404).json({ error: 'No finance data available' });
    }

    res.json({ data: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /trend - finance trend over time
router.get('/trend', (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;

    const rows = db.prepare(`
      SELECT snapshot_date, revenue_mtd, revenue_ytd, tuition_collected,
             tuition_expected, outstanding_balances, govt_funding_received,
             expenses_total, net_position, cost_per_student,
             days_cash_on_hand, fetched_at
      FROM finance_snapshots
      WHERE snapshot_date >= date('now', '-' || ? || ' days')
      ORDER BY snapshot_date ASC
    `).all(days);

    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
