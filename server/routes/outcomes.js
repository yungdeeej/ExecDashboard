const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { db } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Get outcomes summary
router.get('/summary', authenticateToken, (req, res) => {
  try {
    const campus = req.query.campus;

    // Active practicums
    const practicums = db.prepare(
      "SELECT COUNT(*) as count FROM student_outcomes WHERE employment_status = 'in_practicum'"
    ).get();

    // Graduation rate (graduated / total in completed cohorts)
    const totalStudents = db.prepare(
      'SELECT COUNT(*) as count FROM student_outcomes WHERE grad_date IS NOT NULL'
    ).get();
    const graduated = db.prepare(
      "SELECT COUNT(*) as count FROM student_outcomes WHERE grad_date IS NOT NULL AND grad_date <= date('now')"
    ).get();
    const gradRate = totalStudents.count > 0
      ? ((graduated.count / totalStudents.count) * 100).toFixed(1)
      : 0;

    // Employment rate
    const postGrad = db.prepare(
      "SELECT COUNT(*) as count FROM student_outcomes WHERE grad_date IS NOT NULL AND grad_date <= date('now')"
    ).get();
    const employed = db.prepare(
      "SELECT COUNT(*) as count FROM student_outcomes WHERE employment_status = 'employed'"
    ).get();
    const employmentRate = postGrad.count > 0
      ? ((employed.count / postGrad.count) * 100).toFixed(1)
      : 0;

    // Average time to employment (days)
    const avgTime = db.prepare(`
      SELECT AVG(JULIANDAY(employed_date) - JULIANDAY(grad_date)) as avg_days
      FROM student_outcomes
      WHERE employed_date IS NOT NULL AND grad_date IS NOT NULL
    `).get();

    // Unique employer partners
    const employers = db.prepare(
      'SELECT COUNT(DISTINCT practicum_employer) as count FROM student_outcomes WHERE practicum_employer IS NOT NULL'
    ).get();

    // By program breakdown
    const byProgram = db.prepare(`
      SELECT
        program,
        COUNT(*) as total,
        SUM(CASE WHEN employment_status = 'employed' THEN 1 ELSE 0 END) as employed,
        SUM(CASE WHEN employment_status = 'in_practicum' THEN 1 ELSE 0 END) as in_practicum,
        SUM(CASE WHEN employment_status = 'seeking' THEN 1 ELSE 0 END) as seeking
      FROM student_outcomes
      GROUP BY program
    `).all();

    res.json({
      data: {
        activePracticums: practicums.count,
        graduationRate: parseFloat(gradRate),
        employmentRate: parseFloat(employmentRate),
        avgTimeToEmployment: avgTime.avg_days ? Math.round(avgTime.avg_days) : 0,
        employerPartners: employers.count,
        byProgram,
      },
    });
  } catch (err) {
    console.error('Outcomes summary error:', err);
    res.status(500).json({ error: 'Failed to fetch outcomes summary' });
  }
});

// Get all outcomes data
router.get('/students', authenticateToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const students = db.prepare(
      'SELECT * FROM student_outcomes ORDER BY updated_at DESC LIMIT ?'
    ).all(limit);

    res.json({ data: students });
  } catch (err) {
    console.error('Outcomes students error:', err);
    res.status(500).json({ error: 'Failed to fetch student outcomes' });
  }
});

// CSV upload
router.post('/upload', authenticateToken, requireRole('outcomes_manager', 'admin'), upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', () => {
        const insert = db.prepare(`
          INSERT OR REPLACE INTO student_outcomes (student_id, name, program, cohort, grad_date, practicum_start, practicum_employer, employed_date, employment_status, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        const insertAll = db.transaction(() => {
          for (const row of results) {
            insert.run(
              row.student_id, row.name, row.program, row.cohort,
              row.grad_date || null, row.practicum_start || null,
              row.practicum_employer || null, row.employed_date || null,
              row.employment_status || 'unknown'
            );
          }
        });

        insertAll();

        res.json({ message: `Uploaded ${results.length} student records`, count: results.length });
      })
      .on('error', (err) => {
        console.error('CSV parse error:', err);
        res.status(400).json({ error: 'Failed to parse CSV file' });
      });
  } catch (err) {
    console.error('Outcomes upload error:', err);
    res.status(500).json({ error: 'Failed to upload outcomes data' });
  }
});

// Manual aggregate entry
router.post('/entry', authenticateToken, requireRole('outcomes_manager', 'admin'), (req, res) => {
  try {
    const { student_id, name, program, cohort, grad_date, practicum_start, practicum_employer, employed_date, employment_status } = req.body;

    const result = db.prepare(`
      INSERT INTO student_outcomes (student_id, name, program, cohort, grad_date, practicum_start, practicum_employer, employed_date, employment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(student_id, name, program, cohort, grad_date || null, practicum_start || null, practicum_employer || null, employed_date || null, employment_status || 'unknown');

    res.json({ message: 'Outcome entry saved', id: result.lastInsertRowid });
  } catch (err) {
    console.error('Outcomes entry error:', err);
    res.status(500).json({ error: 'Failed to save outcome entry' });
  }
});

module.exports = router;
