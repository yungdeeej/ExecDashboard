const express = require('express');
const { db } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get latest finance snapshot
router.get('/latest', authenticateToken, (req, res) => {
  try {
    const snapshot = db.prepare(
      'SELECT * FROM finance_snapshots ORDER BY snapshot_date DESC LIMIT 1'
    ).get();

    if (!snapshot) {
      return res.json({ data: null, message: 'No finance data available' });
    }

    res.json({ data: snapshot });
  } catch (err) {
    console.error('Finance latest error:', err);
    res.status(500).json({ error: 'Failed to fetch finance data' });
  }
});

// Get finance trend (last N days)
router.get('/trend', authenticateToken, (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const snapshots = db.prepare(
      'SELECT * FROM finance_snapshots ORDER BY snapshot_date DESC LIMIT ?'
    ).all(days);

    res.json({ data: snapshots.reverse() });
  } catch (err) {
    console.error('Finance trend error:', err);
    res.status(500).json({ error: 'Failed to fetch finance trends' });
  }
});

// Manual entry / override
router.post('/entry', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const {
      snapshot_date, revenue_mtd, revenue_ytd, tuition_collected,
      tuition_expected, outstanding_balances, govt_funding_received,
      expenses_total, net_position
    } = req.body;

    const result = db.prepare(`
      INSERT INTO finance_snapshots (snapshot_date, revenue_mtd, revenue_ytd, tuition_collected, tuition_expected, outstanding_balances, govt_funding_received, expenses_total, net_position, raw_payload)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      snapshot_date, revenue_mtd, revenue_ytd, tuition_collected,
      tuition_expected, outstanding_balances, govt_funding_received,
      expenses_total, net_position, JSON.stringify({ source: 'manual', submitted_by: req.user.name })
    );

    res.json({ message: 'Finance entry saved', id: result.lastInsertRowid });
  } catch (err) {
    console.error('Finance entry error:', err);
    res.status(500).json({ error: 'Failed to save finance entry' });
  }
});

module.exports = router;
