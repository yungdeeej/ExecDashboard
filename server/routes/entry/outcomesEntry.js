const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { db } = require('../../db/database');
const { authenticateToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);
router.use(requireRole('outcomes_manager', 'admin'));

// POST / - insert single student outcome
router.post('/', (req, res) => {
  try {
    const {
      student_id, first_name, last_name, program, cohort_id,
      campus, enrollment_date, expected_grad_date, actual_grad_date,
      practicum_start_date, practicum_end_date, practicum_employer,
      practicum_status, employment_date, employer_name,
      employment_status, notes
    } = req.body;

    if (!student_id || !first_name || !last_name) {
      return res.status(400).json({ error: 'student_id, first_name, and last_name are required' });
    }

    const result = db.prepare(`
      INSERT INTO student_outcomes
        (student_id, first_name, last_name, program, cohort_id, campus,
         enrollment_date, expected_grad_date, actual_grad_date,
         practicum_start_date, practicum_end_date, practicum_employer,
         practicum_status, employment_date, employer_name,
         employment_status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      student_id, first_name, last_name, program || null,
      cohort_id || null, campus || null, enrollment_date || null,
      expected_grad_date || null, actual_grad_date || null,
      practicum_start_date || null, practicum_end_date || null,
      practicum_employer || null, practicum_status || null,
      employment_date || null, employer_name || null,
      employment_status || null, notes || null
    );

    res.status(201).json({
      data: { id: result.lastInsertRowid }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /upload - CSV bulk upload of student outcomes
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const rows = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', () => {
        try {
          const insert = db.prepare(`
            INSERT INTO student_outcomes
              (student_id, first_name, last_name, program, cohort_id, campus,
               enrollment_date, expected_grad_date, actual_grad_date,
               practicum_start_date, practicum_end_date, practicum_employer,
               practicum_status, employment_date, employer_name,
               employment_status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          const insertMany = db.transaction((records) => {
            let inserted = 0;
            for (const r of records) {
              insert.run(
                r.student_id, r.first_name, r.last_name,
                r.program || null, r.cohort_id || null, r.campus || null,
                r.enrollment_date || null, r.expected_grad_date || null,
                r.actual_grad_date || null, r.practicum_start_date || null,
                r.practicum_end_date || null, r.practicum_employer || null,
                r.practicum_status || null, r.employment_date || null,
                r.employer_name || null, r.employment_status || null,
                r.notes || null
              );
              inserted++;
            }
            return inserted;
          });

          const inserted = insertMany(rows);
          res.status(201).json({ data: { inserted } });
        } catch (dbErr) {
          res.status(500).json({ error: dbErr.message });
        }
      })
      .on('error', (streamErr) => {
        res.status(500).json({ error: streamErr.message });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
