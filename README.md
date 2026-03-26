# MCG Executive Dashboard

> Unified operational intelligence for MCG Career College (Calgary · Red Deer · Cold Lake · Edmonton).
> A role-gated, dean-facing command center aggregating Finance, Enrollment, Student Outcomes, Marketing Performance, Staff, and Compliance into a single live view.

---

## 📐 UI/UX Design Specification

### Design Philosophy

This is a **strategic executive dashboard** — not an analyst tool. The dean should be able to answer *"Are we on track?"* within 10 seconds of opening it. Every design decision flows from that.

Research-backed principles applied:
- **Inverted pyramid layout:** Status/targets at top → trends in middle → detail/drill-downs at bottom
- **Z-pattern scanning:** Critical KPIs placed top-left → top-right → down
- **Cognitive load limit:** Max 7–8 data elements visible per module at once; drill-down for detail
- **Bento grid layout:** Modular card-based system — each KPI lives in its own block, scannable at a glance
- **Dark mode first:** Better contrast for colored charts, modern aesthetic, reduced eye strain
- **No decimal noise:** Revenue shown as `$1.2M`, rates as `82%` — not `$1,247,382.14` or `82.3847%`
- **Red/Amber/Green (RAG) status system:** Every KPI has a target; color signals whether it's on track

### Visual Design Direction

```
Theme:         Dark mode — deep navy base (#0D1117), elevated cards (#161B22)
Accent:        Electric blue (#3B82F6) for primary actions
Status colors: Green (#22C55E) · Amber (#F59E0B) · Red (#EF4444)
Typography:    Display — "Syne" (bold, geometric, authoritative)
               Body — "DM Sans" (clean, readable at small sizes)
Charts:        Recharts — consistent styling across all modules
Borders:       Subtle 1px borders (#30363D) — cards breathe without heavy dividers
Sparklines:    Inline trend indicators on every KPI card (7-day or 30-day)
Icons:         Lucide React — consistent weight and size
Animations:    Subtle fade-in on load, skeleton loaders while data fetches
```

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR (fixed, 240px)     │  MAIN CONTENT AREA                │
│  ─────────────────────────  │  ─────────────────────────────    │
│  MCG Logo + Dean name       │  TOP BAR                          │
│                             │  [Campus Filter] [Date Range]     │
│  Navigation:                │  [Last Sync: 8:04 AM] [Alerts 🔔] │
│  ● Overview                 │                                   │
│  ● Finance                  │  MODULE CONTENT (scrollable)      │
│  ● Enrollment               │  Row 1: KPI Summary Cards (5 max) │
│  ● Outcomes                 │  Row 2: Primary Chart             │
│  ● Marketing                │  Row 3: Secondary Charts (2-col)  │
│  ● Staff & Ops              │  Row 4: Data Table (collapsible)  │
│  ● Alerts                   │                                   │
│                             │                                   │
│  ─────────────────────────  │                                   │
│  Settings                   │                                   │
│  Logout                     │                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Overview Page (Dean's Home Screen)

The Overview is the first thing the dean sees — a **one-page health snapshot** of the entire institution.

```
┌──────────────────────────────────────────────────────────────────┐
│ GOOD MORNING, [DEAN NAME]   Thu, June 5   MCG Career College     │
│ Today's Snapshot — All Campuses                                  │
├──────────┬──────────┬──────────┬──────────┬──────────────────────┤
│ REVENUE  │ ENROLL   │ GRAD     │ EMPLOY   │ CPL                  │
│ $1.2M    │ 142      │ 84%      │ 91%      │ $38                  │
│ MTD +5%  │ MTD +12% │ On Track │ Watch    │ vs last mo           │
│ GREEN    │ GREEN    │ GREEN    │ AMBER    │ GREEN                │
├──────────┴──────────┴──────────┴──────────┴──────────────────────┤
│ [Finance Sparkline] [Enrollment by Campus Bar] [Funnel Chart]   │
├──────────────────────────────────────────────────────────────────┤
│ ALERTS (2)                                                       │
│ · Cold Lake: Enrollment 18% below monthly target                 │
│ · Red Deer: 3 practicums ending this week — placements needed    │
└──────────────────────────────────────────────────────────────────┘
```

### KPI Card Component Spec

Every KPI card renders consistently:
```
┌────────────────────────────┐
│ METRIC NAME        [GREEN] │
│ 142                        │
│ +12% vs last month         │
│ Target: 160 | Gap: 18      │
│ [sparkline ~~~~~~~~~~~~]   │
└────────────────────────────┘
```

---

## 🔐 Role-Based Access Control (RBAC)

This is the core separation: **managers upload data, the dean sees everything.** Managers never access the executive dashboard view.

### Roles & Permissions Matrix

| Role | Executive Dashboard | Admin Entry Portal | Modules Accessible | Can See Other Campuses |
|---|---|---|---|---|
| `dean` | Full read access | No | All | Yes |
| `enrollment_manager` | No | Yes | Enrollment entry only | No — own campus only |
| `outcomes_manager` | No | Yes | Outcomes entry + CSV upload | No — own campus only |
| `finance_manager` | No | Yes | Finance override entry only | Yes — all campuses |
| `admin` | Yes | Yes | All | Yes |

### Route Architecture by Role

```
/                    → Redirect based on role on login
/dashboard           → Dean/Admin only (executive view)
/dashboard/finance   → Dean/Admin only
/dashboard/enrollment → Dean/Admin only
/dashboard/outcomes  → Dean/Admin only
/dashboard/marketing → Dean/Admin only
/dashboard/staff     → Dean/Admin only
/dashboard/alerts    → Dean/Admin only

/entry               → Managers only (data entry portal — completely separate UI)
/entry/enrollment    → enrollment_manager only
/entry/outcomes      → outcomes_manager only
/entry/finance       → finance_manager only

/login               → Public
```

### Manager Entry Portal — Separate UI

The `/entry` portal is a **clean, minimal form-focused interface** — not the dashboard UI at all. Managers log in and only see their form. Think: simple card on a neutral background, submit button, confirmation toast.

```
Design:     Light mode, minimal — nothing executive about it
Components: Form fields, date picker, campus selector, submit button
No nav:     No links or routes to /dashboard — middleware blocks those routes for manager roles
Session:    JWT scope includes role — server middleware returns 403 on any /dashboard/* route
```

### Auth Implementation

```js
// middleware/auth.js
const requireRole = (...allowedRoles) => (req, res, next) => {
  const { role } = req.user; // decoded from JWT
  if (!allowedRoles.includes(role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Applied on routes:
router.get('/dashboard', requireRole('dean', 'admin'), dashboardController);
router.post('/entry/enrollment', requireRole('enrollment_manager', 'admin'), entryController);
```

On the frontend, `App.jsx` reads the JWT role and redirects:
```js
// App.jsx route guard
if (user.role === 'dean' || user.role === 'admin') navigate('/dashboard');
if (user.role.includes('_manager')) navigate('/entry');
```

---

## 📊 Module Specifications (Full)

### Module 1 — Finance

**Data source:** Finance App API (automated sync) + Manual override
**Sync:** Every 60 min via cron + webhook push option

**KPI Cards:**
- Total Revenue MTD / YTD (vs target, RAG)
- Tuition Collected vs Expected (gap amount highlighted)
- Outstanding Balances (total + aging: 30/60/90 days)
- Government Funding Received (StudentAid AB)
- Net Operating Position (surplus/deficit)
- Cost Per Enrolled Student (operational efficiency)
- Days Cash on Hand (financial resilience metric)

**Charts:**
- Revenue trend line (12-month rolling)
- Revenue by campus (stacked bar)
- Tuition collected vs expected (dual bar, monthly)
- Expense breakdown (donut chart by category)

**Drill-down:** Click any campus bar → shows that campus's detailed financials

---

### Module 2 — Enrollment

**Data source:** Manager daily entry via `/entry/enrollment`
**Update cadence:** Each enrollment manager submits every morning

**KPI Cards:**
- New Enrollments MTD / YTD (vs target, RAG)
- Starts (students who began program) — MTD / YTD
- Stay Rate % (retained past drop/refund date)
- Funded Students (StudentAid AB approved)
- Enrollment Funnel Conversion (Lead → Applied → Enrolled → Started)
- Target vs Actual by campus

**Charts:**
- Enrollment by campus (grouped bar, MTD)
- Enrollment trend (line, 12-month rolling)
- Funnel visualization (step-down bar chart)
- Program breakdown (which programs are filling fastest)

**Drill-down:** Click campus → campus-level breakdown by program

**Manager Entry Form Fields:**
```
Date (auto-filled: today)
Campus (dropdown — locked to manager's campus)
Program (dropdown)
New Enrollments: [number]
Starts: [number]
Stays (past drop date): [number]
Funded (StudentAid AB approved): [number]
Pipeline:
  - New Leads This Week: [number]
  - Applications Submitted: [number]
  - Applications Approved: [number]
Notes: [text area]
```

---

### Module 3 — Student Outcomes

**Data source:** CSV upload from class list + Manual aggregate entry
**Update cadence:** Weekly CSV upload (or as data changes), daily manual updates

**KPI Cards:**
- Active Practicums (students currently in placement)
- Graduation Rate % (cohort-level, current year)
- Employment Rate % (within 3 months of graduation)
- Average Time to Employment (days)
- Practicum Completion Rate %
- Employer Partners (total active)

**Charts:**
- Graduation rate trend (year-over-year bar)
- Employment rate by program (horizontal bar)
- Cohort pipeline (enrolled → graduated → employed funnel)
- Practicum placement status (pie: placed / pending / completed)

**CSV Upload Schema:**
```
student_id, first_name, last_name, program, cohort_id, campus,
enrollment_date, expected_grad_date, actual_grad_date,
practicum_start_date, practicum_end_date, practicum_employer,
practicum_status (active/completed/pending),
employment_date, employer_name, employment_status (employed/seeking/unknown),
notes
```

**Manager Entry Form (aggregate — no CSV required):**
```
Cohort / Program
Reporting Period
Total Active Practicums: [number]
Practicum Placements Secured This Week: [number]
Graduates This Period: [number]
Confirmed Employed (within 3mo): [number]
Notes
```

---

### Module 4 — Marketing Performance

**Data source:** Marketing Performance App API (automated sync)
**Sync:** Every 60 min + manual override

**KPI Cards:**
- CPL by channel (Meta / Google / Organic)
- Total Ad Spend MTD (vs budget, RAG)
- Leads Generated MTD / YTD
- Lead-to-Enrollment Conversion Rate %
- Instagram Followers (delta WoW)
- Facebook Followers (delta WoW)
- Top Performing Campaign (name + CPL)

**Charts:**
- CPL trend by channel (line chart, 90-day)
- Spend vs Leads (dual-axis, monthly)
- Lead source breakdown (donut: Meta / Google / Organic / Referral)
- Follower growth trend (line, 6-month)

---

### Module 5 — Staff & Operations *(Added)*

**Data source:** Manager entry + HR data
**Why include it:** Staff health is a leading indicator for student outcomes and enrollment performance. Advisor-to-student ratio directly impacts stay rates.

**KPI Cards:**
- Total Headcount (by campus)
- Staff Vacancies (open roles)
- Advisor-to-Student Ratio (per campus)
- Instructor Utilization (% of capacity)
- Staff Retention Rate (rolling 12-month)
- Upcoming Contract Renewals (30/60/90-day window)

**Charts:**
- Headcount by campus (bar)
- Retention trend (line, 12-month)
- Vacancy aging (how long roles have been open)

**Manager Entry Form:**
```
Campus
Reporting Week
Current Headcount: [number]
New Hires This Week: [number]
Departures This Week: [number]
Open Vacancies: [number]
Advisor Count: [number]
Instructor Count: [number]
Notes
```

---

### Module 6 — Alerts & Flags *(Added)*

**Automatically generated — no data entry required.**
The system evaluates all KPIs against targets nightly and surfaces exceptions.

**Alert Types:**
```
CRITICAL  — KPI > 20% below target (e.g. enrollment 25% behind)
WARNING   — KPI 10–20% below target, or a threshold crossed
INFO      — Positive flag (e.g. Cold Lake exceeded target this week)
ACTION    — Time-sensitive item requiring dean response
```

**Example Alerts Generated Automatically:**
- "Cold Lake enrollment is 18% below monthly target (42 vs 51)"
- "Red Deer stay rate dropped 6% week-over-week"
- "Meta CPL increased 22% over the past 7 days — review campaigns"
- "3 practicum students in Edmonton have placements ending in 5 days"
- "Finance sync failed at 2:00 AM — showing cached data from yesterday"

**Alert Configuration:**
- Dean can set custom thresholds per KPI per campus
- Email/SMS notification option (via SendGrid / Twilio)
- Alerts are dismissible with a note (full audit log retained)

---

## 🔗 API Integration Layer

### Integration Architecture Overview

```
┌──────────────────┐     GET /api/summary      ┌──────────────────────┐
│  Finance App     │ ◄────────────────────────► │                      │
│  (Replit)        │   Bearer: FINANCE_API_KEY  │  MCG Executive       │
└──────────────────┘                            │  Dashboard           │
                                                │  (This App)          │
┌──────────────────┐     GET /api/summary       │                      │
│  Marketing App   │ ◄────────────────────────► │  Cron: every 60 min  │
│  (Replit)        │   Bearer: MARKETING_API_KEY│  Stores in postgres  │
└──────────────────┘                            └──────────────────────┘
```

### Step 1 — Add to Finance App (Express)

Add this route to your existing Finance App:

```js
// routes/summary.js — add to Finance App
router.get('/api/summary', (req, res) => {
  const key = req.headers['authorization']?.replace('Bearer ', '');
  if (key !== process.env.DASHBOARD_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({
    snapshot_date: new Date().toISOString().split('T')[0],
    revenue_mtd: yourRevenueFunction(),
    revenue_ytd: yourYTDFunction(),
    tuition_collected: ...,
    tuition_expected: ...,
    outstanding_balances: ...,
    govt_funding_received: ...,
    expenses_total: ...,
    net_position: ...,
  });
});
```

Add to Finance App `.env`:
```
DASHBOARD_API_KEY=mcg_dashboard_shared_secret_2026
```

### Step 2 — Add to Marketing App (Express)

```js
router.get('/api/summary', (req, res) => {
  const key = req.headers['authorization']?.replace('Bearer ', '');
  if (key !== process.env.DASHBOARD_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({
    snapshot_date: new Date().toISOString().split('T')[0],
    cpl_meta: ...,
    cpl_google: ...,
    total_spend: ...,
    leads_mtd: ...,
    leads_ytd: ...,
    ig_followers: ...,
    fb_followers: ...,
    top_campaign: ...,
    conversion_rate: ...,
  });
});
```

### Step 3 — Dashboard Sync Functions

```js
// server/lib/syncFinance.js
async function syncFinanceSnapshot() {
  try {
    const { data } = await axios.get(`${process.env.FINANCE_APP_URL}/api/summary`, {
      headers: { Authorization: `Bearer ${process.env.FINANCE_API_KEY}` },
      timeout: 10000,
    });

    await db.query(`
      INSERT INTO finance_snapshots (...) VALUES (...)
      ON CONFLICT (snapshot_date) DO UPDATE SET ...
    `, [...]);

    await logSync('finance', 'success');
  } catch (err) {
    await logSync('finance', 'error', err.message);
    // Falls back to last successful snapshot — no crash, no blank data
  }
}

// server/index.js — cron schedule
cron.schedule('0 * * * *', async () => {
  await syncFinanceSnapshot();
  await syncMarketingSnapshot();
});
```

### Step 4 — Webhook Push Option (Optional Upgrade)

Instead of polling, your existing apps push to the dashboard on any data write:

```js
// In Finance App — call after any data save
async function pushToDashboard(payload) {
  await axios.post(`${process.env.DASHBOARD_URL}/api/webhooks/finance`, payload, {
    headers: { 'x-webhook-secret': process.env.DASHBOARD_WEBHOOK_SECRET }
  });
}
```

### INTEGRATION_MODE Toggle

```env
INTEGRATION_MODE=mock   # Development — uses seeded mock data
INTEGRATION_MODE=live   # Production — calls real APIs
```

```js
// server/lib/syncFinance.js
if (process.env.INTEGRATION_MODE === 'mock') {
  return getMockFinanceData(); // Realistic seeded data, all 4 campuses
}
// else: call real API
```

Dashboard always shows: `Last synced: 8:04 AM` or `Finance sync failed — showing data from 7:02 AM`

---

## 🗄 Full Database Schema

```sql
-- Enrollment daily entries
CREATE TABLE enrollment_entries (
  id SERIAL PRIMARY KEY,
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
  created_at TIMESTAMP DEFAULT NOW()
);

-- Student outcomes (CSV upload + manual)
CREATE TABLE student_outcomes (
  id SERIAL PRIMARY KEY,
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
  practicum_status VARCHAR(30),   -- active | completed | pending
  employment_date DATE,
  employer_name VARCHAR(150),
  employment_status VARCHAR(30),  -- employed | seeking | unknown
  notes TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Finance snapshots (from Finance App API)
CREATE TABLE finance_snapshots (
  id SERIAL PRIMARY KEY,
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
  raw_payload JSONB,
  fetched_at TIMESTAMP DEFAULT NOW()
);

-- Marketing snapshots (from Marketing App API)
CREATE TABLE marketing_snapshots (
  id SERIAL PRIMARY KEY,
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
  raw_payload JSONB,
  fetched_at TIMESTAMP DEFAULT NOW()
);

-- Staff & operations entries
CREATE TABLE staff_entries (
  id SERIAL PRIMARY KEY,
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
  created_at TIMESTAMP DEFAULT NOW()
);

-- Dean-configurable KPI targets
CREATE TABLE kpi_targets (
  id SERIAL PRIMARY KEY,
  module VARCHAR(50),        -- 'enrollment' | 'outcomes' | 'finance' | 'marketing' | 'staff'
  metric_key VARCHAR(100),   -- 'enrollments_mtd' | 'graduation_rate' etc.
  campus VARCHAR(50),        -- 'all' or specific campus
  target_value NUMERIC,
  period VARCHAR(20),        -- 'monthly' | 'annual'
  effective_date DATE,
  set_by VARCHAR(100),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Alerts log
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  alert_type VARCHAR(20),    -- 'critical' | 'warning' | 'info' | 'action'
  module VARCHAR(50),
  campus VARCHAR(50),
  message TEXT,
  metric_key VARCHAR(100),
  actual_value NUMERIC,
  target_value NUMERIC,
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_by VARCHAR(100),
  dismissed_note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Manager users
CREATE TABLE manager_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  role VARCHAR(50),   -- 'enrollment_manager' | 'outcomes_manager' | 'finance_manager' | 'dean' | 'admin'
  campus VARCHAR(50), -- 'Calgary' | 'Red Deer' | 'Cold Lake' | 'Edmonton' | 'all'
  password_hash TEXT,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- API sync log
CREATE TABLE sync_log (
  id SERIAL PRIMARY KEY,
  source VARCHAR(50),   -- 'finance' | 'marketing'
  status VARCHAR(20),   -- 'success' | 'error'
  error_message TEXT,
  synced_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🏗 Project Structure

```
mcg-executive-dashboard/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── TopBar.jsx           # Campus filter, date range, sync status, alerts bell
│   │   │   │   └── DashboardShell.jsx
│   │   │   ├── modules/
│   │   │   │   ├── OverviewModule.jsx   # Dean home screen
│   │   │   │   ├── FinanceModule.jsx
│   │   │   │   ├── EnrollmentModule.jsx
│   │   │   │   ├── OutcomesModule.jsx
│   │   │   │   ├── MarketingModule.jsx
│   │   │   │   ├── StaffModule.jsx
│   │   │   │   └── AlertsModule.jsx
│   │   │   ├── shared/
│   │   │   │   ├── KPICard.jsx          # Metric + sparkline + RAG badge
│   │   │   │   ├── RAGBadge.jsx         # Green/Amber/Red status indicator
│   │   │   │   ├── SparklineChart.jsx   # Mini trend line inside KPI card
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── SkeletonLoader.jsx
│   │   │   │   └── SyncStatusBanner.jsx
│   │   │   └── entry/
│   │   │       ├── EntryShell.jsx       # Clean minimal wrapper for manager portal
│   │   │       ├── EnrollmentForm.jsx
│   │   │       ├── OutcomesForm.jsx
│   │   │       ├── CSVUpload.jsx
│   │   │       └── StaffForm.jsx
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   │   ├── Overview.jsx
│   │   │   │   ├── Finance.jsx
│   │   │   │   ├── Enrollment.jsx
│   │   │   │   ├── Outcomes.jsx
│   │   │   │   ├── Marketing.jsx
│   │   │   │   ├── Staff.jsx
│   │   │   │   └── Alerts.jsx
│   │   │   ├── entry/
│   │   │   │   ├── EnrollmentEntry.jsx
│   │   │   │   ├── OutcomesEntry.jsx
│   │   │   │   └── StaffEntry.jsx
│   │   │   └── Login.jsx
│   │   ├── hooks/
│   │   │   ├── useModuleData.js
│   │   │   └── useAlerts.js
│   │   ├── lib/
│   │   │   ├── api.js
│   │   │   └── formatters.js            # $1.2M, 82%, rounded helpers
│   │   └── App.jsx                      # Route guard: redirects by role on auth
├── server/
│   ├── routes/
│   │   ├── dashboard/
│   │   │   ├── finance.js
│   │   │   ├── enrollment.js
│   │   │   ├── outcomes.js
│   │   │   ├── marketing.js
│   │   │   ├── staff.js
│   │   │   └── alerts.js
│   │   ├── entry/
│   │   │   ├── enrollmentEntry.js
│   │   │   ├── outcomesEntry.js
│   │   │   └── staffEntry.js
│   │   ├── webhooks.js
│   │   └── auth.js
│   ├── middleware/
│   │   ├── auth.js                      # JWT decode + requireRole()
│   │   └── rateLimiter.js
│   ├── lib/
│   │   ├── syncFinance.js
│   │   ├── syncMarketing.js
│   │   ├── generateAlerts.js            # Nightly alert evaluation job
│   │   └── mockData.js                  # INTEGRATION_MODE=mock data
│   ├── db/
│   │   ├── schema.sql
│   │   └── seed.js                      # 12 months of realistic MCG mock data
│   └── index.js
├── .env.example
├── package.json
└── README.md
```

---

## 🌐 Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=your_replit_postgres_connection_string

# Integration mode
INTEGRATION_MODE=mock    # Switch to 'live' when Finance + Marketing APIs are ready

# External App APIs
FINANCE_APP_URL=https://your-finance-app.replit.app
FINANCE_API_KEY=mcg_dashboard_shared_secret_2026

MARKETING_APP_URL=https://your-marketing-app.replit.app
MARKETING_API_KEY=mcg_dashboard_shared_secret_2026

# Alert notifications (implement after core build)
SENDGRID_API_KEY=
ALERT_EMAIL_RECIPIENT=dean@mcgcareercollege.ca

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
ALERT_SMS_RECIPIENT=+1XXXXXXXXXX

# Webhook security
DASHBOARD_WEBHOOK_SECRET=your_webhook_secret
```

---

## 🚀 Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Matches existing Replit stack |
| Charts | Recharts | React-native, consistent styling |
| Backend | Node.js + Express | Matches existing apps |
| Database | PostgreSQL (Replit-hosted) | Relational + JSONB for raw API payloads |
| Auth | JWT + bcrypt | Lightweight, no external dep |
| File upload | Multer | CSV handling for Outcomes module |
| CSV parsing | PapaParse (server-side) | Battle-tested CSV library |
| Scheduling | node-cron | In-process, no queue needed at this scale |
| HTTP client | Axios | Consistent with existing stack |
| Fonts | Google Fonts: Syne + DM Sans | Via CSS import — no install required |
| Icons | Lucide React | Consistent weight and size |

---

## 📋 Build Order for Claude Code

Execute in this exact sequence:

1. **Scaffold** — project structure, install all dependencies, `.env.example`
2. **Database** — `schema.sql` + `seed.js` with realistic MCG mock data (all 4 campuses, 12 months of history)
3. **Auth system** — JWT middleware, `requireRole()`, login page, role-based redirect on login
4. **Manager Entry Portal** (`/entry`) — Enrollment, Outcomes, and Staff forms with validation; light-mode, minimal UI; completely separate from dashboard routes
5. **API sync layer** — `syncFinance.js` + `syncMarketing.js` with `INTEGRATION_MODE` toggle; sync log table; fallback to last cached snapshot on error
6. **Dashboard shell** — Sidebar, TopBar (campus filter, date range, sync status badge), React Router setup
7. **Overview page** — 5 top KPI cards with sparklines + alerts summary panel
8. **Finance module** — KPI cards + 4 charts pulling from `finance_snapshots`
9. **Enrollment module** — KPI cards + charts + campus drill-down from `enrollment_entries`
10. **Outcomes module** — KPI cards + charts + CSV upload parser from `student_outcomes`
11. **Marketing module** — KPI cards + charts from `marketing_snapshots`
12. **Staff module** — KPI cards + charts from `staff_entries`
13. **Alerts module** — Nightly alert evaluation job (`generateAlerts.js`) + dismissal UI + notification hooks
14. **KPI targets** — Dean-configurable targets per metric per campus (Settings page)
15. **Polish** — Skeleton loaders, error states, empty states, responsive layout, Syne + DM Sans font import

---

## 📅 Daily Workflow (Post-Launch)

| Time | Actor | Action |
|---|---|---|
| 8:00 AM | Enrollment Managers (×4) | Log into `/entry/enrollment`, submit morning update for their campus |
| 8:00 AM | Outcomes Manager | Upload updated class list CSV or submit manual cohort aggregate |
| 8:30 AM | Dean | Reviews Overview page — answers "are we on track?" in under 60 seconds |
| Continuous | System | Finance + Marketing APIs polled every 60 min; dashboard always shows freshest data |
| Nightly | System | Alert evaluation runs — flags KPI misses for next morning's review |

---

## 🔮 Future Enhancements (Post-MVP)

- **Predictive enrollment** — Linear regression on enrollment trend to forecast month-end vs target
- **Cohort comparison** — Side-by-side view of this year's cohort vs last year's at the same point in the calendar
- **PDF export** — Dean exports any module as a one-page PDF for weekly board summaries
- **HubSpot integration** — Pull lead pipeline directly from HubSpot instead of manual advisor entry
- **Email digest** — Automated 8 AM daily summary email to dean with overnight changes highlighted
- **Mobile view** — Responsive layout for iPad/iPhone access during campus site visits

---

*Built for MCG Career College — Calgary · Red Deer · Cold Lake · Edmonton*
*Managed by the Office of the Dean of Operations*
