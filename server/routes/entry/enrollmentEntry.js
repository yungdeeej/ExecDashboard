const express = require('express');
const { db } = require('../../db/database');
const { authenticateToken, requireRole } = require('../../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('enrollment_manager', 'admin'));

// POST / - insert enrollment entry
router.post('/', (req, res) => {
  try {
    const {
      campus, program, entry_date, new_enrollments, starts,
      stays, funded, leads_new, applications_submitted,
      applications_approved, notes
    } = req.body;

    if (!campus || !entry_date) {
      return res.status(400).json({ error: 'campus and entry_date are required' });
    }

    const submitted_by = req.user.name;

    const result = db.prepare(`
      INSERT INTO enrollment_entries
        (campus, program, entry_date, new_enrollments, starts, stays, funded,
         leads_new, applications_submitted, applications_approved, notes, submitted_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      campus, program || null, entry_date,
      new_enrollments || 0, starts || 0, stays || 0, funded || 0,
      leads_new || 0, applications_submitted || 0, applications_approved || 0,
      notes || null, submitted_by
    );

    res.status(201).json({
      data: { id: result.lastInsertRowid, submitted_by }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
