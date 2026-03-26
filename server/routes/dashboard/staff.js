const express = require('express');
const { db } = require('../../db/database');
const { authenticateToken, requireRole } = require('../../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('dean', 'admin'));

// GET /summary - aggregate staff data (latest entry per campus)
router.get('/summary', (req, res) => {
  try {
    const byCampus = db.prepare(`
      SELECT s.campus, s.total_headcount, s.new_hires, s.departures,
             s.open_vacancies, s.advisor_count, s.instructor_count, s.entry_week
      FROM staff_entries s
      INNER JOIN (
        SELECT campus, MAX(entry_week) AS max_week
        FROM staff_entries
        GROUP BY campus
      ) latest ON s.campus = latest.campus AND s.entry_week = latest.max_week
    `).all();

    const totalHeadcount = byCampus.reduce((sum, r) => sum + (r.total_headcount || 0), 0);
    const vacancies = byCampus.reduce((sum, r) => sum + (r.open_vacancies || 0), 0);

    const totalAdvisors = byCampus.reduce((sum, r) => sum + (r.advisor_count || 0), 0);
    const avgAdvisorRatio = byCampus.length > 0
      ? Math.round((totalAdvisors / byCampus.length) * 100) / 100
      : 0;

    res.json({
      data: {
        totalHeadcount,
        vacancies,
        avgAdvisorRatio,
        byCampus
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /trend - weekly staff trend
router.get('/trend', (req, res) => {
  try {
    const { campus } = req.query;

    let whereClause = '';
    const params = [];

    if (campus) {
      whereClause = 'WHERE campus = ?';
      params.push(campus);
    }

    const rows = db.prepare(`
      SELECT campus, entry_week, total_headcount, new_hires,
             departures, open_vacancies, advisor_count, instructor_count
      FROM staff_entries
      ${whereClause}
      ORDER BY entry_week ASC
    `).all(...params);

    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
