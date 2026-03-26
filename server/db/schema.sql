-- Enrollment daily snapshots
CREATE TABLE IF NOT EXISTS enrollment_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campus VARCHAR(50),
  program VARCHAR(100),
  entry_date DATE,
  new_enrollments INT,
  starts INT,
  stays INT,
  funded INT,
  notes TEXT,
  submitted_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student outcomes (from class list CSV)
CREATE TABLE IF NOT EXISTS student_outcomes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id VARCHAR(50),
  name VARCHAR(100),
  program VARCHAR(100),
  cohort VARCHAR(50),
  grad_date DATE,
  practicum_start DATE,
  practicum_employer VARCHAR(150),
  employed_date DATE,
  employment_status VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Finance snapshots (from Finance App API)
CREATE TABLE IF NOT EXISTS finance_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_date DATE,
  revenue_mtd NUMERIC,
  revenue_ytd NUMERIC,
  tuition_collected NUMERIC,
  tuition_expected NUMERIC,
  outstanding_balances NUMERIC,
  govt_funding_received NUMERIC,
  expenses_total NUMERIC,
  net_position NUMERIC,
  raw_payload TEXT,
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing snapshots (from Marketing App API)
CREATE TABLE IF NOT EXISTS marketing_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_date DATE,
  cpl_meta NUMERIC,
  cpl_google NUMERIC,
  total_spend NUMERIC,
  leads_mtd INT,
  leads_ytd INT,
  ig_followers INT,
  fb_followers INT,
  top_campaign VARCHAR(150),
  conversion_rate NUMERIC,
  raw_payload TEXT,
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manager users (for Admin Entry Portal auth)
CREATE TABLE IF NOT EXISTS manager_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  role VARCHAR(50),
  campus VARCHAR(50),
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sync log for API integrations
CREATE TABLE IF NOT EXISTS sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source VARCHAR(50),
  status VARCHAR(20),
  message TEXT,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
