const express = require('express');
const { db } = require('../../db/database');
const { authenticateToken, requireRole } = require('../../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('dean', 'admin'));

// GET /summary - aggregated enrollment KPIs with optional campus filter
router.get('/summary', (req, res) => {
  try {
    const { campus } = req.query;

    let whereClause = '';
    const params = [];

    if (campus) {
      whereClause = 'WHERE campus = ?';
      params.push(campus);
    }

    // Aggregated totals
    const totals = db.prepare(`
      SELECT
        COALESCE(SUM(new_enrollments), 0) AS new_enrollments,
        COALESCE(SUM(starts), 0) AS starts,
        COALESCE(SUM(stays), 0) AS stays,
        COALESCE(SUM(funded), 0) AS funded,
        COALESCE(SUM(leads_new), 0) AS leads_new,
        COALESCE(SUM(applications_submitted), 0) AS applications_submitted,
        COALESCE(SUM(applications_approved), 0) AS applications_approved
      FROM enrollment_entries
      ${whereClause}
    `).get(...params);

    // Stay rate
    const stayRate = totals.starts > 0
      ? Math.round((totals.stays / totals.starts) * 10000) / 100
      : 0;

    // Breakdown by campus
    const byCampus = db.prepare(`
      SELECT
        campus,
        COALESCE(SUM(new_enrollments), 0) AS new_enrollments,
        COALESCE(SUM(starts), 0) AS starts,
        COALESCE(SUM(stays), 0) AS stays,
        COALESCE(SUM(funded), 0) AS funded,
        COALESCE(SUM(leads_new), 0) AS leads_new,
        COALESCE(SUM(applications_submitted), 0) AS applications_submitted,
        COALESCE(SUM(applications_approved), 0) AS applications_approved
      FROM enrollment_entries
      ${whereClause}
      GROUP BY campus
    `).all(...params);

    res.json({
      data: {
        ...totals,
        stayRate,
        byCampus
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /trend - enrollment trend over time
router.get('/trend', (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const { campus } = req.query;

    let whereClause = 'WHERE entry_date >= date(\'now\', \'-\' || ? || \' days\')';
    const params = [days];

    if (campus) {
      whereClause += ' AND campus = ?';
      params.push(campus);
    }

    const rows = db.prepare(`
      SELECT entry_date, campus,
             new_enrollments, starts, stays, funded,
             leads_new, applications_submitted, applications_approved
      FROM enrollment_entries
      ${whereClause}
      ORDER BY entry_date ASC
    `).all(...params);

    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
