const express = require('express');
const { db } = require('../../db/database');
const { authenticateToken, requireRole } = require('../../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('dean', 'admin'));

// GET /summary - aggregated outcomes KPIs
router.get('/summary', (req, res) => {
  try {
    const totalStudents = db.prepare(
      'SELECT COUNT(*) AS count FROM student_outcomes'
    ).get().count;

    const activePracticums = db.prepare(
      "SELECT COUNT(*) AS count FROM student_outcomes WHERE practicum_status = 'active'"
    ).get().count;

    const graduated = db.prepare(
      'SELECT COUNT(*) AS count FROM student_outcomes WHERE actual_grad_date IS NOT NULL'
    ).get().count;

    const graduationRate = totalStudents > 0
      ? Math.round((graduated / totalStudents) * 10000) / 100
      : 0;

    const employed = db.prepare(
      "SELECT COUNT(*) AS count FROM student_outcomes WHERE employment_status = 'employed'"
    ).get().count;

    const employmentRate = totalStudents > 0
      ? Math.round((employed / totalStudents) * 10000) / 100
      : 0;

    const avgTimeToEmployment = db.prepare(`
      SELECT AVG(julianday(employment_date) - julianday(actual_grad_date)) AS avg_days
      FROM student_outcomes
      WHERE employment_date IS NOT NULL AND actual_grad_date IS NOT NULL
    `).get().avg_days || 0;

    const practicumCompleted = db.prepare(
      "SELECT COUNT(*) AS count FROM student_outcomes WHERE practicum_status = 'completed'"
    ).get().count;

    const practicumTotal = db.prepare(
      "SELECT COUNT(*) AS count FROM student_outcomes WHERE practicum_status IS NOT NULL AND practicum_status != ''"
    ).get().count;

    const practicumCompletionRate = practicumTotal > 0
      ? Math.round((practicumCompleted / practicumTotal) * 10000) / 100
      : 0;

    const employerPartners = db.prepare(
      'SELECT COUNT(DISTINCT employer_name) AS count FROM student_outcomes WHERE employer_name IS NOT NULL'
    ).get().count;

    const byProgram = db.prepare(`
      SELECT
        program,
        COUNT(*) AS total,
        SUM(CASE WHEN actual_grad_date IS NOT NULL THEN 1 ELSE 0 END) AS graduated,
        SUM(CASE WHEN employment_status = 'employed' THEN 1 ELSE 0 END) AS employed,
        SUM(CASE WHEN practicum_status = 'active' THEN 1 ELSE 0 END) AS activePracticums
      FROM student_outcomes
      GROUP BY program
    `).all();

    res.json({
      data: {
        activePracticums,
        graduationRate,
        employmentRate,
        avgTimeToEmployment: Math.round(avgTimeToEmployment * 100) / 100,
        practicumCompletionRate,
        employerPartners,
        byProgram
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /students - list student outcomes
router.get('/students', (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;

    const rows = db.prepare(`
      SELECT student_id, first_name, last_name, program, cohort_id,
             campus, practicum_status, employment_status, employer_name
      FROM student_outcomes
      ORDER BY student_id DESC
      LIMIT ?
    `).all(limit);

    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
