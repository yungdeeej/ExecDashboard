const express = require('express');
const { db } = require('../../db/database');
const { authenticateToken, requireRole } = require('../../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('dean', 'admin'));

// GET / - list alerts (default: not dismissed)
router.get('/', (req, res) => {
  try {
    const dismissed = req.query.dismissed === 'true' ? 1 : 0;

    const rows = db.prepare(`
      SELECT *
      FROM alerts
      WHERE dismissed = ?
      ORDER BY created_at DESC
    `).all(dismissed);

    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/dismiss - dismiss an alert
router.post('/:id/dismiss', (req, res) => {
  try {
    const { id } = req.params;
    const { dismissed_note } = req.body;
    const dismissed_by = req.user.name;

    const result = db.prepare(`
      UPDATE alerts
      SET dismissed = 1, dismissed_by = ?, dismissed_note = ?
      WHERE id = ?
    `).run(dismissed_by, dismissed_note || null, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ data: { success: true, id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
