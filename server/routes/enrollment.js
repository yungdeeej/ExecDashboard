const express = require('express');
const { db } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get enrollment summary (aggregated KPIs)
router.get('/summary', authenticateToken, (req, res) => {
  try {
    const campus = req.query.campus;
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const yearStart = `${now.getFullYear()}-01-01`;

    let campusFilter = '';
    const params = [];

    if (campus && campus !== 'All') {
      campusFilter = ' AND campus = ?';
      params.push(campus);
    }

    // MTD totals
    const mtd = db.prepare(`
      SELECT
        COALESCE(SUM(new_enrollments), 0) as enrollments_mtd,
        COALESCE(SUM(starts), 0) as starts_mtd,
        COALESCE(SUM(stays), 0) as stays_mtd,
        COALESCE(SUM(funded), 0) as funded_mtd
      FROM enrollment_entries
      WHERE entry_date >= ?${campusFilter}
    `).get(monthStart, ...params);

    // YTD totals
    const ytd = db.prepare(`
      SELECT
        COALESCE(SUM(new_enrollments), 0) as enrollments_ytd,
        COALESCE(SUM(starts), 0) as starts_ytd,
        COALESCE(SUM(stays), 0) as stays_ytd,
        COALESCE(SUM(funded), 0) as funded_ytd
      FROM enrollment_entries
      WHERE entry_date >= ?${campusFilter}
    `).get(yearStart, ...params);

    // Per-campus breakdown
    const byCampus = db.prepare(`
      SELECT
        campus,
        COALESCE(SUM(new_enrollments), 0) as enrollments,
        COALESCE(SUM(starts), 0) as starts,
        COALESCE(SUM(stays), 0) as stays,
        COALESCE(SUM(funded), 0) as funded
      FROM enrollment_entries
      WHERE entry_date >= ?${campusFilter}
      GROUP BY campus
    `).all(monthStart, ...params);

    // Stay rate
    const stayRate = mtd.enrollments_mtd > 0
      ? ((mtd.stays_mtd / mtd.enrollments_mtd) * 100).toFixed(1)
      : 0;

    res.json({
      data: { mtd, ytd, byCampus, stayRate },
    });
  } catch (err) {
    console.error('Enrollment summary error:', err);
    res.status(500).json({ error: 'Failed to fetch enrollment summary' });
  }
});

// Get enrollment trend
router.get('/trend', authenticateToken, (req, res) => {
  try {
    const campus = req.query.campus;
    const days = parseInt(req.query.days) || 30;

    let campusFilter = '';
    const params = [];

    if (campus && campus !== 'All') {
      campusFilter = ' WHERE campus = ?';
      params.push(campus);
    }

    const trend = db.prepare(`
      SELECT entry_date, SUM(new_enrollments) as enrollments, SUM(starts) as starts, SUM(stays) as stays
      FROM enrollment_entries
      ${campusFilter}
      GROUP BY entry_date
      ORDER BY entry_date DESC
      LIMIT ?
    `).all(...params, days);

    res.json({ data: trend.reverse() });
  } catch (err) {
    console.error('Enrollment trend error:', err);
    res.status(500).json({ error: 'Failed to fetch enrollment trends' });
  }
});

// Get recent entries
router.get('/entries', authenticateToken, (req, res) => {
  try {
    const campus = req.query.campus;
    const limit = parseInt(req.query.limit) || 50;

    let campusFilter = '';
    const params = [];

    if (campus && campus !== 'All') {
      campusFilter = ' WHERE campus = ?';
      params.push(campus);
    }

    const entries = db.prepare(`
      SELECT * FROM enrollment_entries
      ${campusFilter}
      ORDER BY entry_date DESC, created_at DESC
      LIMIT ?
    `).all(...params, limit);

    res.json({ data: entries });
  } catch (err) {
    console.error('Enrollment entries error:', err);
    res.status(500).json({ error: 'Failed to fetch enrollment entries' });
  }
});

// Submit enrollment entry
router.post('/entry', authenticateToken, requireRole('enrollment_manager', 'admin'), (req, res) => {
  try {
    const { campus, program, entry_date, new_enrollments, starts, stays, funded, notes } = req.body;

    if (!campus || !program || !entry_date) {
      return res.status(400).json({ error: 'Campus, program, and date are required' });
    }

    const result = db.prepare(`
      INSERT INTO enrollment_entries (campus, program, entry_date, new_enrollments, starts, stays, funded, notes, submitted_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(campus, program, entry_date, new_enrollments || 0, starts || 0, stays || 0, funded || 0, notes || '', req.user.name);

    res.json({ message: 'Enrollment entry saved', id: result.lastInsertRowid });
  } catch (err) {
    console.error('Enrollment entry error:', err);
    res.status(500).json({ error: 'Failed to save enrollment entry' });
  }
});

module.exports = router;
