const { db, initializeDatabase } = require('./database');
const bcrypt = require('bcrypt');

const CAMPUSES = ['Calgary', 'Red Deer', 'Cold Lake', 'Edmonton'];
const PROGRAMS = ['Healthcare Aide', 'Business Admin', 'Medical Lab Assistant', 'Pharmacy Technician'];

// Deterministic pseudo-random using a simple LCG so seeds are reproducible
let _seed = 42;
function seededRandom() {
  _seed = (_seed * 1664525 + 1013904223) & 0x7fffffff;
  return _seed / 0x7fffffff;
}

function randInt(min, max) {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 2) {
  const val = seededRandom() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function pick(arr) {
  return arr[Math.floor(seededRandom() * arr.length)];
}

function dateStr(d) {
  return d.toISOString().split('T')[0];
}

// Generate all weekdays between two dates
function getBusinessDays(start, end) {
  const days = [];
  const d = new Date(start);
  while (d <= end) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push(dateStr(new Date(d)));
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

// Generate all Mondays between two dates (for weekly entries)
function getWeeklyMondays(start, end) {
  const mondays = [];
  const d = new Date(start);
  // Advance to first Monday
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  while (d <= end) {
    mondays.push(dateStr(new Date(d)));
    d.setDate(d.getDate() + 7);
  }
  return mondays;
}

async function seed() {
  console.log('Initializing database schema...');
  initializeDatabase();

  // Clear existing data
  const clearTables = db.transaction(() => {
    db.exec('DELETE FROM enrollment_entries');
    db.exec('DELETE FROM student_outcomes');
    db.exec('DELETE FROM finance_snapshots');
    db.exec('DELETE FROM marketing_snapshots');
    db.exec('DELETE FROM staff_entries');
    db.exec('DELETE FROM kpi_targets');
    db.exec('DELETE FROM alerts');
    db.exec('DELETE FROM manager_users');
    db.exec('DELETE FROM sync_log');
  });
  clearTables();
  console.log('Cleared existing data.');

  // ──────────────────────────────────────────────
  // 1. MANAGER USERS
  // ──────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    { name: 'Dr. Sarah Chen', email: 'dean@mcg.edu', role: 'dean', campus: 'All' },
    { name: 'Mike Johnson', email: 'enrollment.calgary@mcg.edu', role: 'enrollment_manager', campus: 'Calgary' },
    { name: 'Lisa Park', email: 'enrollment.reddeer@mcg.edu', role: 'enrollment_manager', campus: 'Red Deer' },
    { name: 'Tom Bradley', email: 'enrollment.coldlake@mcg.edu', role: 'enrollment_manager', campus: 'Cold Lake' },
    { name: 'Nina Patel', email: 'enrollment.edmonton@mcg.edu', role: 'enrollment_manager', campus: 'Edmonton' },
    { name: 'James Wilson', email: 'outcomes@mcg.edu', role: 'outcomes_manager', campus: 'All' },
    { name: 'Rachel Kim', email: 'finance@mcg.edu', role: 'finance_manager', campus: 'All' },
    { name: 'Admin User', email: 'admin@mcg.edu', role: 'admin', campus: 'All' },
  ];

  const insertUser = db.prepare(
    'INSERT INTO manager_users (name, email, role, campus, password_hash) VALUES (?, ?, ?, ?, ?)'
  );
  const seedUsers = db.transaction(() => {
    for (const u of users) {
      insertUser.run(u.name, u.email, u.role, u.campus, passwordHash);
    }
  });
  seedUsers();
  console.log(`Seeded ${users.length} manager users.`);

  // ──────────────────────────────────────────────
  // 2. ENROLLMENT ENTRIES - 12 months daily
  // ──────────────────────────────────────────────
  const startDate = new Date('2025-04-01');
  const endDate = new Date('2026-03-25');
  const businessDays = getBusinessDays(startDate, endDate);

  const insertEnrollment = db.prepare(`
    INSERT INTO enrollment_entries
      (campus, program, entry_date, new_enrollments, starts, stays, funded,
       leads_new, applications_submitted, applications_approved, submitted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const campusManagers = {
    'Calgary': 'Mike Johnson',
    'Red Deer': 'Lisa Park',
    'Cold Lake': 'Tom Bradley',
    'Edmonton': 'Nina Patel',
  };

  const seedEnrollment = db.transaction(() => {
    let count = 0;
    for (const day of businessDays) {
      for (const campus of CAMPUSES) {
        for (const program of PROGRAMS) {
          const newEnrollments = randInt(1, 6);
          const starts = randInt(0, 3);
          const stays = randInt(10, 40);
          const funded = randInt(Math.floor(stays * 0.3), stays);
          const leadsNew = randInt(2, 10);
          const appsSub = randInt(1, 5);
          const appsApproved = randInt(0, Math.min(3, appsSub));

          insertEnrollment.run(
            campus, program, day,
            newEnrollments, starts, stays, funded,
            leadsNew, appsSub, appsApproved,
            campusManagers[campus]
          );
          count++;
        }
      }
    }
    console.log(`Seeded ${count} enrollment entries.`);
  });
  seedEnrollment();

  // ──────────────────────────────────────────────
  // 3. STUDENT OUTCOMES - 80 students
  // ──────────────────────────────────────────────
  const firstNames = [
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
    'Isabella', 'Logan', 'Mia', 'Lucas', 'Charlotte', 'Aiden', 'Amelia',
    'James', 'Harper', 'Benjamin', 'Evelyn', 'Jack', 'Aria', 'Henry',
    'Ella', 'Sebastian', 'Scarlett', 'Owen', 'Grace', 'Daniel', 'Lily',
    'Matthew', 'Chloe', 'Samuel', 'Zoey', 'David', 'Penelope', 'Joseph',
    'Riley', 'Carter', 'Layla', 'Luke', 'Nora', 'Andrew', 'Hazel', 'Nathan',
    'Aubrey', 'Gabriel', 'Ellie', 'Anthony', 'Brooklyn', 'Dylan',
    'Hannah', 'Caleb', 'Stella', 'Ryan', 'Savannah', 'Isaac', 'Maya',
    'Connor', 'Leah', 'Jayden', 'Paisley', 'Aaron', 'Audrey', 'Hunter',
    'Skylar', 'Eli', 'Violet', 'Jackson', 'Claire', 'Thomas', 'Bella',
    'Cameron', 'Lucy', 'Adrian', 'Anna', 'Colton', 'Aaliyah', 'Jordan', 'Madelyn',
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
    'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
    'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
    'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
    'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
    'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz',
    'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris',
    'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan',
    'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos',
    'Kim', 'Cox', 'Ward',
  ];

  const practicumEmployers = [
    'Alberta Health Services', 'Shoppers Drug Mart', 'Rexall Pharmacy',
    'Covenant Health', 'Red Deer Regional Hospital', 'Cold Lake Healthcare Centre',
    'Calgary Lab Services', 'DynaLIFE Medical Labs', 'Leduc Community Hospital',
    'Medicentre Family Health', 'Chinook Regional Hospital', 'LifeLabs',
  ];

  const employerNames = [
    'Alberta Health Services', 'Shoppers Drug Mart', 'Rexall Pharmacy',
    'Covenant Health', 'DynaLIFE Medical Labs', 'LifeLabs',
    'Calgary Lab Services', 'Medicentre Family Health', 'Good Neighbor Pharmacy',
    'Sobeys Pharmacy', 'London Drugs', 'Save-On-Foods Pharmacy',
  ];

  const cohorts = ['2025-01', '2025-02', '2025-03'];

  const insertOutcome = db.prepare(`
    INSERT INTO student_outcomes
      (student_id, first_name, last_name, program, cohort_id, campus,
       enrollment_date, expected_grad_date, actual_grad_date,
       practicum_start_date, practicum_end_date, practicum_employer, practicum_status,
       employment_date, employer_name, employment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedOutcomes = db.transaction(() => {
    for (let i = 0; i < 80; i++) {
      const studentId = `MCG-${String(2025000 + i + 1).padStart(7, '0')}`;
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const program = PROGRAMS[i % PROGRAMS.length];
      const cohort = cohorts[i % cohorts.length];
      const campus = CAMPUSES[i % CAMPUSES.length];

      // Enrollment date based on cohort
      const cohortMonth = parseInt(cohort.split('-')[1]);
      const enrollDate = new Date(2025, cohortMonth - 1, randInt(5, 20));
      const expectedGrad = new Date(enrollDate);
      expectedGrad.setMonth(expectedGrad.getMonth() + randInt(8, 12));

      // Some students have graduated
      let actualGrad = null;
      const hasGraduated = seededRandom() < 0.4;
      if (hasGraduated) {
        actualGrad = new Date(expectedGrad);
        actualGrad.setDate(actualGrad.getDate() + randInt(-10, 15));
      }

      // Practicum info
      let pracStart = null;
      let pracEnd = null;
      let pracEmployer = null;
      let pracStatus = 'pending';

      if (hasGraduated || seededRandom() < 0.5) {
        pracStart = new Date(expectedGrad);
        pracStart.setMonth(pracStart.getMonth() - randInt(2, 4));
        pracEnd = new Date(pracStart);
        pracEnd.setMonth(pracEnd.getMonth() + 2);
        pracEmployer = pick(practicumEmployers);

        if (hasGraduated) {
          pracStatus = 'completed';
        } else {
          pracStatus = seededRandom() < 0.6 ? 'active' : 'pending';
        }
      }

      // Employment info
      let empDate = null;
      let empName = null;
      let empStatus;

      if (hasGraduated && seededRandom() < 0.75) {
        empStatus = 'employed';
        empDate = new Date(actualGrad);
        empDate.setDate(empDate.getDate() + randInt(7, 60));
        empName = pick(employerNames);
      } else if (pracStatus === 'active') {
        empStatus = 'in_practicum';
      } else {
        empStatus = 'seeking';
      }

      insertOutcome.run(
        studentId, firstName, lastName, program, cohort, campus,
        dateStr(enrollDate),
        dateStr(expectedGrad),
        actualGrad ? dateStr(actualGrad) : null,
        pracStart ? dateStr(pracStart) : null,
        pracEnd ? dateStr(pracEnd) : null,
        pracEmployer,
        pracStatus,
        empDate ? dateStr(empDate) : null,
        empName,
        empStatus
      );
    }
  });
  seedOutcomes();
  console.log('Seeded 80 student outcomes.');

  // ──────────────────────────────────────────────
  // 4. FINANCE SNAPSHOTS - 12 months daily
  // ──────────────────────────────────────────────
  const insertFinance = db.prepare(`
    INSERT INTO finance_snapshots
      (snapshot_date, revenue_mtd, revenue_ytd, tuition_collected, tuition_expected,
       outstanding_balances, govt_funding_received, expenses_total, net_position,
       cost_per_student, days_cash_on_hand)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedFinance = db.transaction(() => {
    let revenueYtd = 0;
    let currentMonth = -1;
    let monthlyRevBase = 0;
    let count = 0;

    for (const day of businessDays) {
      const d = new Date(day);
      const month = d.getMonth();

      // Reset MTD at start of each new month
      if (month !== currentMonth) {
        currentMonth = month;
        monthlyRevBase = 0;
      }

      // Daily revenue increment
      const dailyRev = randFloat(8000, 18000);
      monthlyRevBase += dailyRev;
      revenueYtd += dailyRev;

      const revenueMtd = Math.min(monthlyRevBase, randFloat(200000, 350000));
      const tuitionExpected = 320000;
      const tuitionCollected = revenueMtd * randFloat(0.7, 0.95);
      const outstanding = tuitionExpected - tuitionCollected;
      const govtFunding = randFloat(40000, 90000);
      const expensesTotal = revenueMtd * randFloat(0.65, 0.85);
      const netPosition = revenueMtd + govtFunding - expensesTotal;
      const costPerStudent = randFloat(3000, 5000);
      const daysCash = randFloat(30, 90, 0);

      insertFinance.run(
        day,
        parseFloat(revenueMtd.toFixed(2)),
        parseFloat(revenueYtd.toFixed(2)),
        parseFloat(tuitionCollected.toFixed(2)),
        tuitionExpected,
        parseFloat(outstanding.toFixed(2)),
        parseFloat(govtFunding.toFixed(2)),
        parseFloat(expensesTotal.toFixed(2)),
        parseFloat(netPosition.toFixed(2)),
        parseFloat(costPerStudent.toFixed(2)),
        Math.round(daysCash)
      );
      count++;
    }
    console.log(`Seeded ${count} finance snapshots.`);
  });
  seedFinance();

  // ──────────────────────────────────────────────
  // 5. MARKETING SNAPSHOTS - 12 months daily
  // ──────────────────────────────────────────────
  const insertMarketing = db.prepare(`
    INSERT INTO marketing_snapshots
      (snapshot_date, cpl_meta, cpl_google, cpl_organic, total_spend, budget_mtd,
       leads_mtd, leads_ytd, ig_followers, fb_followers, top_campaign, conversion_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const topCampaigns = [
    'Spring Healthcare Push', 'Back to School 2025', 'New Year New Career',
    'Summer Enrollment Drive', 'Fall Kickoff Campaign', 'Holiday Skills Promo',
    'Healthcare Heroes Month', 'Pharmacy Tech Spotlight', 'Business Admin Boost',
    'Alberta Careers Fair', 'Digital Open House', 'Referral Bonus Blitz',
  ];

  const seedMarketing = db.transaction(() => {
    let leadsYtd = 0;
    let currentMonth = -1;
    let leadsMtd = 0;
    let igFollowers = 2200;
    let fbFollowers = 4800;
    let count = 0;

    for (const day of businessDays) {
      const d = new Date(day);
      const month = d.getMonth();

      if (month !== currentMonth) {
        currentMonth = month;
        leadsMtd = 0;
      }

      const dailyLeads = randInt(2, 12);
      leadsMtd += dailyLeads;
      leadsYtd += dailyLeads;

      // Followers grow slowly with some noise
      igFollowers += randInt(0, 8);
      fbFollowers += randInt(0, 5);

      const cplMeta = randFloat(25, 55);
      const cplGoogle = randFloat(30, 65);
      const cplOrganic = randFloat(5, 15);
      const totalSpend = randFloat(300, 900);
      const budgetMtd = 15000;
      const conversionRate = randFloat(2.5, 8.5);

      insertMarketing.run(
        day,
        cplMeta, cplGoogle, cplOrganic,
        totalSpend, budgetMtd,
        leadsMtd, leadsYtd,
        igFollowers, fbFollowers,
        pick(topCampaigns),
        conversionRate
      );
      count++;
    }
    console.log(`Seeded ${count} marketing snapshots.`);
  });
  seedMarketing();

  // ──────────────────────────────────────────────
  // 6. STAFF ENTRIES - weekly per campus, 12 months
  // ──────────────────────────────────────────────
  const mondays = getWeeklyMondays(startDate, endDate);

  const insertStaff = db.prepare(`
    INSERT INTO staff_entries
      (campus, entry_week, total_headcount, new_hires, departures,
       open_vacancies, advisor_count, instructor_count, submitted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const campusBaseHeadcount = {
    'Calgary': 40,
    'Edmonton': 35,
    'Red Deer': 25,
    'Cold Lake': 15,
  };

  const seedStaff = db.transaction(() => {
    let count = 0;
    const headcounts = { ...campusBaseHeadcount };

    for (const monday of mondays) {
      for (const campus of CAMPUSES) {
        const newHires = randInt(0, 2);
        const departures = randInt(0, 1);
        headcounts[campus] = Math.max(10, headcounts[campus] + newHires - departures);
        const hc = headcounts[campus];
        const openVacancies = randInt(0, 4);
        const advisorCount = Math.max(2, Math.round(hc * randFloat(0.15, 0.25)));
        const instructorCount = Math.max(3, Math.round(hc * randFloat(0.4, 0.55)));

        insertStaff.run(
          campus, monday,
          hc, newHires, departures,
          openVacancies, advisorCount, instructorCount,
          campusManagers[campus]
        );
        count++;
      }
    }
    console.log(`Seeded ${count} staff entries.`);
  });
  seedStaff();

  // ──────────────────────────────────────────────
  // 7. KPI TARGETS
  // ──────────────────────────────────────────────
  const insertKpi = db.prepare(`
    INSERT INTO kpi_targets
      (module, metric_key, campus, target_value, period, effective_date, set_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const kpiTargets = [
    // Enrollment targets
    { module: 'enrollment', metric_key: 'new_enrollments_monthly', campus: 'All', target_value: 50, period: 'monthly', effective_date: '2025-04-01' },
    { module: 'enrollment', metric_key: 'starts_monthly', campus: 'All', target_value: 30, period: 'monthly', effective_date: '2025-04-01' },
    { module: 'enrollment', metric_key: 'leads_monthly', campus: 'All', target_value: 120, period: 'monthly', effective_date: '2025-04-01' },
    { module: 'enrollment', metric_key: 'applications_monthly', campus: 'All', target_value: 60, period: 'monthly', effective_date: '2025-04-01' },
    // Outcomes targets
    { module: 'outcomes', metric_key: 'graduation_rate', campus: 'All', target_value: 85, period: 'annual', effective_date: '2025-04-01' },
    { module: 'outcomes', metric_key: 'employment_rate', campus: 'All', target_value: 80, period: 'annual', effective_date: '2025-04-01' },
    { module: 'outcomes', metric_key: 'practicum_placement_rate', campus: 'All', target_value: 90, period: 'annual', effective_date: '2025-04-01' },
    { module: 'outcomes', metric_key: 'avg_time_to_employment_days', campus: 'All', target_value: 45, period: 'annual', effective_date: '2025-04-01' },
    // Finance targets
    { module: 'finance', metric_key: 'revenue_mtd', campus: 'All', target_value: 300000, period: 'monthly', effective_date: '2025-04-01' },
    { module: 'finance', metric_key: 'net_position', campus: 'All', target_value: 100000, period: 'monthly', effective_date: '2025-04-01' },
    { module: 'finance', metric_key: 'cost_per_student', campus: 'All', target_value: 4000, period: 'monthly', effective_date: '2025-04-01' },
    { module: 'finance', metric_key: 'days_cash_on_hand', campus: 'All', target_value: 60, period: 'monthly', effective_date: '2025-04-01' },
    { module: 'finance', metric_key: 'tuition_collection_rate', campus: 'All', target_value: 90, period: 'monthly', effective_date: '2025-04-01' },
    // Marketing targets
    { module: 'marketing', metric_key: 'cpl', campus: 'All', target_value: 35, period: 'monthly', effective_date: '2025-04-01' },
    { module: 'marketing', metric_key: 'total_spend_monthly', campus: 'All', target_value: 15000, period: 'monthly', effective_date: '2025-04-01' },
    { module: 'marketing', metric_key: 'leads_monthly', campus: 'All', target_value: 150, period: 'monthly', effective_date: '2025-04-01' },
    { module: 'marketing', metric_key: 'conversion_rate', campus: 'All', target_value: 5.0, period: 'monthly', effective_date: '2025-04-01' },
    // Staff targets per campus
    { module: 'staff', metric_key: 'total_headcount', campus: 'Calgary', target_value: 42, period: 'quarterly', effective_date: '2025-04-01' },
    { module: 'staff', metric_key: 'total_headcount', campus: 'Edmonton', target_value: 38, period: 'quarterly', effective_date: '2025-04-01' },
    { module: 'staff', metric_key: 'total_headcount', campus: 'Red Deer', target_value: 28, period: 'quarterly', effective_date: '2025-04-01' },
    { module: 'staff', metric_key: 'total_headcount', campus: 'Cold Lake', target_value: 18, period: 'quarterly', effective_date: '2025-04-01' },
    { module: 'staff', metric_key: 'open_vacancies', campus: 'All', target_value: 5, period: 'monthly', effective_date: '2025-04-01' },
  ];

  const seedKpis = db.transaction(() => {
    for (const t of kpiTargets) {
      insertKpi.run(t.module, t.metric_key, t.campus, t.target_value, t.period, t.effective_date, 'Dr. Sarah Chen');
    }
  });
  seedKpis();
  console.log(`Seeded ${kpiTargets.length} KPI targets.`);

  // ──────────────────────────────────────────────
  // 8. ALERTS
  // ──────────────────────────────────────────────
  const insertAlert = db.prepare(`
    INSERT INTO alerts
      (alert_type, module, campus, message, metric_key, actual_value, target_value, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const alerts = [
    {
      alert_type: 'critical', module: 'enrollment', campus: 'Cold Lake',
      message: 'Cold Lake new enrollments dropped 40% below monthly target for March.',
      metric_key: 'new_enrollments_monthly', actual_value: 30, target_value: 50,
      created_at: '2026-03-20 09:15:00',
    },
    {
      alert_type: 'warning', module: 'finance', campus: 'All',
      message: 'Days cash on hand approaching minimum threshold of 30 days.',
      metric_key: 'days_cash_on_hand', actual_value: 35, target_value: 60,
      created_at: '2026-03-18 14:22:00',
    },
    {
      alert_type: 'info', module: 'outcomes', campus: 'Calgary',
      message: 'Calgary Healthcare Aide cohort 2025-01 achieved 92% graduation rate.',
      metric_key: 'graduation_rate', actual_value: 92, target_value: 85,
      created_at: '2026-03-15 11:00:00',
    },
    {
      alert_type: 'action', module: 'marketing', campus: 'All',
      message: 'Google Ads CPL exceeded target by 20%. Review campaign spend allocation.',
      metric_key: 'cpl', actual_value: 42, target_value: 35,
      created_at: '2026-03-22 08:45:00',
    },
    {
      alert_type: 'warning', module: 'staff', campus: 'Edmonton',
      message: 'Edmonton campus has 4 open instructor vacancies ahead of spring cohort.',
      metric_key: 'open_vacancies', actual_value: 4, target_value: 2,
      created_at: '2026-03-24 16:30:00',
    },
    {
      alert_type: 'critical', module: 'finance', campus: 'All',
      message: 'Outstanding tuition balances exceed $150K. Collections follow-up required.',
      metric_key: 'outstanding_balances', actual_value: 158000, target_value: 100000,
      created_at: '2026-03-25 10:05:00',
    },
  ];

  const seedAlerts = db.transaction(() => {
    for (const a of alerts) {
      insertAlert.run(
        a.alert_type, a.module, a.campus, a.message,
        a.metric_key, a.actual_value, a.target_value, a.created_at
      );
    }
  });
  seedAlerts();
  console.log(`Seeded ${alerts.length} alerts.`);

  // ──────────────────────────────────────────────
  // 9. SYNC LOG
  // ──────────────────────────────────────────────
  const insertSync = db.prepare(`
    INSERT INTO sync_log (source, status, error_message, synced_at)
    VALUES (?, ?, ?, ?)
  `);

  const syncEntries = [
    { source: 'finance_api', status: 'success', error_message: null, synced_at: '2026-03-25 06:00:12' },
    { source: 'marketing_api', status: 'success', error_message: null, synced_at: '2026-03-25 06:01:45' },
    { source: 'finance_api', status: 'success', error_message: null, synced_at: '2026-03-24 06:00:08' },
    { source: 'marketing_api', status: 'success', error_message: null, synced_at: '2026-03-24 06:01:32' },
    { source: 'finance_api', status: 'success', error_message: null, synced_at: '2026-03-23 06:00:15' },
  ];

  const seedSync = db.transaction(() => {
    for (const s of syncEntries) {
      insertSync.run(s.source, s.status, s.error_message, s.synced_at);
    }
  });
  seedSync();
  console.log(`Seeded ${syncEntries.length} sync log entries.`);

  console.log('\nSeed complete.');
}

seed().catch(console.error);
