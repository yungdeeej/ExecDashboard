const { db } = require('../db/database');

async function generateAlerts() {
  console.log('[ALERTS] Evaluating KPI targets...');

  const targets = db.prepare(`
    SELECT * FROM kpi_targets WHERE effective_date <= date('now')
  `).all();

  if (!targets.length) {
    console.log('[ALERTS] No active KPI targets found');
    return;
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const insertAlert = db.prepare(`
    INSERT INTO alerts (alert_type, module, campus, message, metric_key, actual_value, target_value)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  let alertCount = 0;

  const evaluate = db.transaction(() => {
    for (const target of targets) {
      let actual = null;

      // --- Enrollment metrics ---
      if (target.module === 'enrollment') {
        const campusFilter = target.campus && target.campus !== 'All'
          ? 'AND campus = ?'
          : '';
        const params = [currentMonth + '%'];
        if (campusFilter) params.push(target.campus);

        const row = db.prepare(`
          SELECT SUM(${sanitizeColumn(target.metric_key)}) as total
          FROM enrollment_entries
          WHERE entry_date LIKE ? ${campusFilter}
        `).get(...params);

        actual = row ? row.total : 0;
      }

      // --- Finance metrics ---
      if (target.module === 'finance') {
        const row = db.prepare(`
          SELECT * FROM finance_snapshots ORDER BY snapshot_date DESC LIMIT 1
        `).get();

        if (row && row[target.metric_key] !== undefined) {
          actual = row[target.metric_key];
        }
      }

      // --- Outcomes metrics ---
      if (target.module === 'outcomes') {
        if (target.metric_key === 'employment_rate') {
          const row = db.prepare(`
            SELECT
              COUNT(CASE WHEN employment_status = 'employed' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as rate
            FROM student_outcomes
            WHERE actual_grad_date IS NOT NULL
          `).get();
          actual = row ? row.rate : 0;
        } else if (target.metric_key === 'practicum_placement_rate') {
          const row = db.prepare(`
            SELECT
              COUNT(CASE WHEN practicum_status IN ('completed', 'in_progress') THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as rate
            FROM student_outcomes
            WHERE expected_grad_date IS NOT NULL
          `).get();
          actual = row ? row.rate : 0;
        } else if (target.metric_key === 'graduation_rate') {
          const row = db.prepare(`
            SELECT
              COUNT(CASE WHEN actual_grad_date IS NOT NULL THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as rate
            FROM student_outcomes
          `).get();
          actual = row ? row.rate : 0;
        }
      }

      // --- Marketing metrics ---
      if (target.module === 'marketing') {
        const row = db.prepare(`
          SELECT * FROM marketing_snapshots ORDER BY snapshot_date DESC LIMIT 1
        `).get();

        if (row && row[target.metric_key] !== undefined) {
          actual = row[target.metric_key];
        }
      }

      // Skip if we could not compute an actual value
      if (actual === null || actual === undefined) continue;

      const alertType = classify(actual, target.target_value);
      if (!alertType) continue;

      const message = buildMessage(alertType, target, actual);
      insertAlert.run(
        alertType,
        target.module,
        target.campus || 'All',
        message,
        target.metric_key,
        actual,
        target.target_value
      );
      alertCount++;
    }
  });

  evaluate();
  console.log(`[ALERTS] Generated ${alertCount} alert(s)`);
}

/**
 * Classify the deviation between actual and target.
 * Returns 'CRITICAL', 'WARNING', 'INFO', or null (within acceptable range).
 */
function classify(actual, target) {
  if (target === 0) return null;

  const ratio = actual / target;

  if (ratio < 0.80) return 'CRITICAL';   // >20% below target
  if (ratio < 0.90) return 'WARNING';    // 10-20% below target
  if (ratio > 1.00) return 'INFO';       // exceeds target
  return null;                           // within 90-100%, on track
}

/**
 * Build a human-readable alert message.
 */
function buildMessage(alertType, target, actual) {
  const pct = ((actual / target.target_value) * 100).toFixed(1);
  const label = target.metric_key.replace(/_/g, ' ');
  const campus = target.campus || 'All campuses';

  if (alertType === 'CRITICAL') {
    return `CRITICAL: ${label} at ${campus} is at ${pct}% of target (actual: ${actual}, target: ${target.target_value})`;
  }
  if (alertType === 'WARNING') {
    return `WARNING: ${label} at ${campus} is at ${pct}% of target (actual: ${actual}, target: ${target.target_value})`;
  }
  return `${label} at ${campus} exceeds target at ${pct}% (actual: ${actual}, target: ${target.target_value})`;
}

/**
 * Whitelist of allowed column names for enrollment metrics to prevent SQL injection.
 */
const ALLOWED_ENROLLMENT_COLUMNS = [
  'new_enrollments', 'starts', 'stays', 'funded',
  'leads_new', 'applications_submitted', 'applications_approved',
];

function sanitizeColumn(col) {
  if (ALLOWED_ENROLLMENT_COLUMNS.includes(col)) return col;
  return 'new_enrollments'; // safe default
}

module.exports = generateAlerts;
