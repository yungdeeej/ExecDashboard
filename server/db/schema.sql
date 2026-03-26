-- Enrollment daily entries
CREATE TABLE IF NOT EXISTS enrollment_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campus VARCHAR(50) NOT NULL,
  program VARCHAR(100),
  entry_date DATE NOT NULL,
  new_enrollments INT DEFAULT 0,
  starts INT DEFAULT 0,
  stays INT DEFAULT 0,
  funded INT DEFAULT 0,
  leads_new INT DEFAULT 0,
  applications_submitted INT DEFAULT 0,
  applications_approved INT DEFAULT 0,
  notes TEXT,
  submitted_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student outcomes (CSV upload + manual)
CREATE TABLE IF NOT EXISTS student_outcomes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id VARCHAR(50),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  program VARCHAR(100),
  cohort_id VARCHAR(50),
  campus VARCHAR(50),
  enrollment_date DATE,
  expected_grad_date DATE,
  actual_grad_date DATE,
  practicum_start_date DATE,
  practicum_end_date DATE,
  practicum_employer VARCHAR(150),
  practicum_status VARCHAR(30),
  employment_date DATE,
  employer_name VARCHAR(150),
  employment_status VARCHAR(30),
  notes TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Finance snapshots (from Finance App API)
CREATE TABLE IF NOT EXISTS finance_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_date DATE UNIQUE,
  revenue_mtd NUMERIC,
  revenue_ytd NUMERIC,
  tuition_collected NUMERIC,
  tuition_expected NUMERIC,
  outstanding_balances NUMERIC,
  govt_funding_received NUMERIC,
  expenses_total NUMERIC,
  net_position NUMERIC,
  cost_per_student NUMERIC,
  days_cash_on_hand NUMERIC,
  raw_payload TEXT,
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing snapshots (from Marketing App API)
CREATE TABLE IF NOT EXISTS marketing_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_date DATE UNIQUE,
  cpl_meta NUMERIC,
  cpl_google NUMERIC,
  cpl_organic NUMERIC,
  total_spend NUMERIC,
  budget_mtd NUMERIC,
  leads_mtd INT,
  leads_ytd INT,
  ig_followers INT,
  fb_followers INT,
  top_campaign VARCHAR(150),
  conversion_rate NUMERIC,
  raw_payload TEXT,
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff & operations entries
CREATE TABLE IF NOT EXISTS staff_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campus VARCHAR(50) NOT NULL,
  entry_week DATE NOT NULL,
  total_headcount INT,
  new_hires INT DEFAULT 0,
  departures INT DEFAULT 0,
  open_vacancies INT DEFAULT 0,
  advisor_count INT,
  instructor_count INT,
  notes TEXT,
  submitted_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dean-configurable KPI targets
CREATE TABLE IF NOT EXISTS kpi_targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module VARCHAR(50),
  metric_key VARCHAR(100),
  campus VARCHAR(50),
  target_value NUMERIC,
  period VARCHAR(20),
  effective_date DATE,
  set_by VARCHAR(100),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts log
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alert_type VARCHAR(20),
  module VARCHAR(50),
  campus VARCHAR(50),
  message TEXT,
  metric_key VARCHAR(100),
  actual_value NUMERIC,
  target_value NUMERIC,
  dismissed INTEGER DEFAULT 0,
  dismissed_by VARCHAR(100),
  dismissed_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manager users
CREATE TABLE IF NOT EXISTS manager_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  role VARCHAR(50),
  campus VARCHAR(50),
  password_hash TEXT,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API sync log
CREATE TABLE IF NOT EXISTS sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source VARCHAR(50),
  status VARCHAR(20),
  error_message TEXT,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
