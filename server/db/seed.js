const { db, initializeDatabase } = require('./database');
const bcrypt = require('bcrypt');

async function seed() {
  initializeDatabase();

  // Seed manager users
  const passwordHash = await bcrypt.hash('password123', 10);

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO manager_users (name, email, role, campus, password_hash)
    VALUES (?, ?, ?, ?, ?)
  `);

  const users = [
    ['Dr. Sarah Chen', 'dean@mcg.edu', 'dean', 'All', passwordHash],
    ['Mike Johnson', 'enrollment.calgary@mcg.edu', 'enrollment_manager', 'Calgary', passwordHash],
    ['Lisa Park', 'enrollment.reddeer@mcg.edu', 'enrollment_manager', 'Red Deer', passwordHash],
    ['James Wilson', 'outcomes@mcg.edu', 'outcomes_manager', 'All', passwordHash],
    ['Admin User', 'admin@mcg.edu', 'admin', 'All', passwordHash],
  ];

  const insertUsers = db.transaction(() => {
    for (const u of users) {
      insertUser.run(...u);
    }
  });
  insertUsers();
  console.log('Seeded manager_users');

  // Seed enrollment entries
  const insertEnrollment = db.prepare(`
    INSERT INTO enrollment_entries (campus, program, entry_date, new_enrollments, starts, stays, funded, notes, submitted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const campuses = ['Calgary', 'Red Deer', 'Cold Lake', 'Edmonton'];
  const programs = ['Healthcare Aide', 'Business Admin', 'Medical Lab Assistant', 'Pharmacy Technician'];
  const today = new Date();

  const insertEnrollments = db.transaction(() => {
    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      const dateStr = date.toISOString().split('T')[0];

      for (const campus of campuses) {
        for (const program of programs) {
          const newEnroll = Math.floor(Math.random() * 5) + 1;
          const starts = Math.floor(Math.random() * 3);
          const stays = Math.floor(Math.random() * newEnroll) + 1;
          const funded = Math.floor(Math.random() * stays);
          insertEnrollment.run(campus, program, dateStr, newEnroll, starts, stays, funded, '', 'seed');
        }
      }
    }
  });
  insertEnrollments();
  console.log('Seeded enrollment_entries');

  // Seed student outcomes
  const insertOutcome = db.prepare(`
    INSERT INTO student_outcomes (student_id, name, program, cohort, grad_date, practicum_start, practicum_employer, employed_date, employment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const employers = ['Calgary Health Services', 'Shoppers Drug Mart', 'LifeLabs', 'Rexall Pharmacy', 'Alberta Health'];
  const statuses = ['employed', 'employed', 'employed', 'seeking', 'in_practicum'];
  const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'James', 'Sophia', 'William', 'Isabella', 'Oliver'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

  const insertOutcomes = db.transaction(() => {
    for (let i = 1; i <= 60; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const program = programs[Math.floor(Math.random() * programs.length)];
      const cohort = `2025-${String(Math.floor(Math.random() * 3) + 1).padStart(2, '0')}`;
      const gradDate = new Date(2025, Math.floor(Math.random() * 6) + 3, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
      const practicumStart = new Date(2025, Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
      const employer = employers[Math.floor(Math.random() * employers.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const employedDate = status === 'employed' ? new Date(2025, Math.floor(Math.random() * 6) + 4, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0] : null;

      insertOutcome.run(`STU-${String(i).padStart(4, '0')}`, `${firstName} ${lastName}`, program, cohort, gradDate, practicumStart, employer, employedDate, status);
    }
  });
  insertOutcomes();
  console.log('Seeded student_outcomes');

  // Seed finance snapshots
  const insertFinance = db.prepare(`
    INSERT INTO finance_snapshots (snapshot_date, revenue_mtd, revenue_ytd, tuition_collected, tuition_expected, outstanding_balances, govt_funding_received, expenses_total, net_position, raw_payload)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertFinances = db.transaction(() => {
    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      const dateStr = date.toISOString().split('T')[0];

      const revenueMtd = 250000 + Math.floor(Math.random() * 100000);
      const revenueYtd = 2800000 + Math.floor(Math.random() * 500000);
      const tuitionCollected = 200000 + Math.floor(Math.random() * 80000);
      const tuitionExpected = 320000;
      const outstandingBalances = 45000 + Math.floor(Math.random() * 20000);
      const govtFunding = 150000 + Math.floor(Math.random() * 50000);
      const expenses = 180000 + Math.floor(Math.random() * 60000);
      const netPosition = revenueMtd - expenses;

      insertFinance.run(dateStr, revenueMtd, revenueYtd, tuitionCollected, tuitionExpected, outstandingBalances, govtFunding, expenses, netPosition, JSON.stringify({ source: 'seed' }));
    }
  });
  insertFinances();
  console.log('Seeded finance_snapshots');

  // Seed marketing snapshots
  const insertMarketing = db.prepare(`
    INSERT INTO marketing_snapshots (snapshot_date, cpl_meta, cpl_google, total_spend, leads_mtd, leads_ytd, ig_followers, fb_followers, top_campaign, conversion_rate, raw_payload)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const campaigns = ['Spring Open House 2025', 'Healthcare Careers Campaign', 'Back to School Blitz', 'Career Change Webinar Series'];

  const insertMarketings = db.transaction(() => {
    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      const dateStr = date.toISOString().split('T')[0];

      const cplMeta = 15 + Math.floor(Math.random() * 20);
      const cplGoogle = 25 + Math.floor(Math.random() * 30);
      const totalSpend = 8000 + Math.floor(Math.random() * 5000);
      const leadsMtd = 120 + Math.floor(Math.random() * 80);
      const leadsYtd = 1400 + Math.floor(Math.random() * 400);
      const igFollowers = 4200 + Math.floor(daysAgo * 5);
      const fbFollowers = 8500 + Math.floor(daysAgo * 3);
      const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
      const conversionRate = 0.08 + Math.random() * 0.07;

      insertMarketing.run(dateStr, cplMeta, cplGoogle, totalSpend, leadsMtd, leadsYtd, igFollowers, fbFollowers, campaign, conversionRate.toFixed(4), JSON.stringify({ source: 'seed' }));
    }
  });
  insertMarketings();
  console.log('Seeded marketing_snapshots');

  console.log('Database seeding complete!');
}

seed().catch(console.error);
