const express = require('express');
const { db } = require('../../db/database');
const { authenticateToken, requireRole } = require('../../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('admin'));

// POST / - insert staff entry
router.post('/', (req, res) => {
  try {
    const {
      campus, entry_week, total_headcount, new_hires,
      departures, open_vacancies, advisor_count,
      instructor_count, notes
    } = req.body;

    if (!campus || !entry_week) {
      return res.status(400).json({ error: 'campus and entry_week are required' });
    }

    const submitted_by = req.user.name;

    const result = db.prepare(`
      INSERT INTO staff_entries
        (campus, entry_week, total_headcount, new_hires, departures,
         open_vacancies, advisor_count, instructor_count, notes, submitted_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      campus, entry_week,
      total_headcount || 0, new_hires || 0, departures || 0,
      open_vacancies || 0, advisor_count || 0, instructor_count || 0,
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
