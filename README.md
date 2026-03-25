# MCG Executive Dashboard

> Unified operational intelligence for MCG Career College & affiliated institutions.
> A dean-facing dashboard aggregating Finance, Enrollment, Student Outcomes, and Marketing Performance into a single live view — updated daily by department managers.

---

## 🏗 Architecture Overview

```
mcg-executive-dashboard/
├── client/                     # React + Vite frontend (Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── TopBar.jsx
│   │   │   │   └── DashboardShell.jsx
│   │   │   ├── modules/
│   │   │   │   ├── FinanceModule.jsx
│   │   │   │   ├── EnrollmentModule.jsx
│   │   │   │   ├── OutcomesModule.jsx
│   │   │   │   └── MarketingModule.jsx
│   │   │   ├── shared/
│   │   │   │   ├── KPICard.jsx
│   │   │   │   ├── StatusBadge.jsx
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── TrendSparkline.jsx
│   │   │   │   └── LastUpdatedBanner.jsx
│   │   │   └── admin/
│   │   │       ├── DataEntryForm.jsx
│   │   │       └── ManagerLogin.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main dean view (read-only)
│   │   │   ├── Finance.jsx
│   │   │   ├── Enrollment.jsx
│   │   │   ├── Outcomes.jsx
│   │   │   ├── Marketing.jsx
│   │   │   └── AdminEntry.jsx      # Manager data entry portal
│   │   ├── hooks/
│   │   │   └── useModuleData.js
│   │   ├── lib/
│   │   │   └── api.js              # Centralized API client
│   │   └── App.jsx
├── server/                     # Express.js API
│   ├── routes/
│   │   ├── finance.js
│   │   ├── enrollment.js
│   │   ├── outcomes.js
│   │   ├── marketing.js
│   │   └── auth.js
│   ├── middleware/
│   │   ├── auth.js             # Role-based access (dean vs. manager)
│   │   └── rateLimiter.js
│   ├── db/
│   │   ├── schema.sql
│   │   └── seed.js
│   └── index.js
├── .env.example
├── package.json
└── README.md
```

---

## 🔌 Integration Architecture

This dashboard connects to two pre-existing Replit apps:

### Finance App Integration
- **Method:** REST API polling (every 60 min) or webhook push
- **Endpoint expected:** `GET /api/summary` → returns snapshot of revenue, tuition collected, outstanding balances, etc.
- **Dashboard stores:** cached snapshot in `finance_snapshots` table with `fetched_at` timestamp
- **Fallback:** Manual override via Admin Entry form if API is unreachable

### Marketing Performance App Integration
- **Method:** REST API polling (every 60 min) or webhook push
- **Endpoint expected:** `GET /api/performance-summary` → returns CPL, spend, impressions, follower counts per platform
- **Dashboard stores:** cached snapshot in `marketing_snapshots` table with `fetched_at` timestamp
- **Fallback:** Manual override via Admin Entry form

> **Implementation note for Claude Code:** Both external apps should expose a `/api/summary` endpoint protected by a shared `API_KEY` environment variable. The dashboard calls these on a cron schedule using `node-cron` and stores results in the Replit DB / PostgreSQL instance.

---

## 📊 Module Specifications

### 1. Finance Module
**Data source:** Finance App API + manual override
**Displayed KPIs:**
- Total Revenue (MTD / YTD)
- Tuition Collected vs. Expected
- Outstanding Balances
- Government Funding Received
- Expense Summary (by category)
- Net Position

**Update method:** API sync (automated) + Admin Entry fallback

---

### 2. Enrollment Module
**Data source:** Manager daily entry (Admin Entry Portal)
**Displayed KPIs per campus (Calgary, Red Deer, Cold Lake, Edmonton):**
- New Enrollments (MTD / YTD)
- Starts (students who began their program)
- Stay Rate (students retained past drop date)
- Funded Students (StudentAid AB approved)
- Pipeline: Leads → Applied → Enrolled → Started
- Target vs. Actual enrollment tracking

**Update method:** Manager submits morning update via `/admin/entry` form
**Fields submitted:**
```
campus | program | date | new_enrollments | starts | stays | funded | notes
```

---

### 3. Outcomes Module
**Data source:** Class list upload (CSV) + Manager entry
**Displayed KPIs:**
- Active Practicums (students in placement)
- Graduation Rate (cohort-level %)
- Employment Rate (post-grad, 3-month window)
- Time-to-Employment (average days)
- Employer Partners (count)

**Update method:**
- CSV upload → parsed server-side → populates `student_outcomes` table
- Manager can also manually enter aggregate stats per cohort

**CSV schema expected:**
```
student_id, name, program, cohort, grad_date, practicum_start, practicum_employer, employed_date, employment_status
```

---

### 4. Marketing Module
**Data source:** Marketing Performance App API + manual override
**Displayed KPIs:**
- CPL by channel (Meta, Google, Organic)
- Total Ad Spend (MTD)
- Leads Generated (MTD / YTD)
- Instagram / Facebook Followers (delta WoW)
- Top Performing Campaigns
- Conversion Rate (Lead → Enrolled)

**Update method:** API sync (automated) + Admin Entry fallback

---

## 🗄 Database Schema (PostgreSQL / Replit DB)

```sql
-- Enrollment daily snapshots
CREATE TABLE enrollment_entries (
  id SERIAL PRIMARY KEY,
  campus VARCHAR(50),
  program VARCHAR(100),
  entry_date DATE,
  new_enrollments INT,
  starts INT,
  stays INT,
  funded INT,
  notes TEXT,
  submitted_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Student outcomes (from class list CSV)
CREATE TABLE student_outcomes (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50),
  name VARCHAR(100),
  program VARCHAR(100),
  cohort VARCHAR(50),
  grad_date DATE,
  practicum_start DATE,
  practicum_employer VARCHAR(150),
  employed_date DATE,
  employment_status VARCHAR(50),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Finance snapshots (from Finance App API)
CREATE TABLE finance_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_date DATE,
  revenue_mtd NUMERIC,
  revenue_ytd NUMERIC,
  tuition_collected NUMERIC,
  tuition_expected NUMERIC,
  outstanding_balances NUMERIC,
  govt_funding_received NUMERIC,
  expenses_total NUMERIC,
  net_position NUMERIC,
  raw_payload JSONB,
  fetched_at TIMESTAMP DEFAULT NOW()
);

-- Marketing snapshots (from Marketing App API)
CREATE TABLE marketing_snapshots (
  id SERIAL PRIMARY KEY,
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
  raw_payload JSONB,
  fetched_at TIMESTAMP DEFAULT NOW()
);

-- Manager users (for Admin Entry Portal auth)
CREATE TABLE manager_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  role VARCHAR(50),   -- 'enrollment_manager', 'outcomes_manager', 'dean'
  campus VARCHAR(50),
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Auth & Access Control

| Role | Access |
|---|---|
| `dean` | Read-only view of all 4 modules, full dashboard |
| `enrollment_manager` | Admin Entry for Enrollment module only |
| `outcomes_manager` | Admin Entry for Outcomes module + CSV upload |
| `admin` | Full access including user management |

- Auth method: JWT (stored in `httpOnly` cookie)
- Passwords hashed with `bcrypt`
- Environment variable: `JWT_SECRET`

---

## 🔄 Data Sync & Cron Jobs

```js
// Runs every 60 minutes
cron.schedule('0 * * * *', async () => {
  await syncFinanceSnapshot();
  await syncMarketingSnapshot();
});
```

Both sync functions:
1. Call the external app's `/api/summary` endpoint with `Authorization: Bearer ${API_KEY}`
2. Store the result in the corresponding `_snapshots` table
3. Log success/failure to a `sync_log` table with timestamp

---

## 🌐 Environment Variables

```env
# Server
PORT=3000
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_replit_postgres_url

# External App Integration
FINANCE_APP_URL=https://your-finance-app.replit.app
FINANCE_API_KEY=shared_secret_key

MARKETING_APP_URL=https://your-marketing-app.replit.app
MARKETING_API_KEY=shared_secret_key
```

---

## 🚀 Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Fast, component-driven, easy to iterate |
| Backend | Node.js + Express | Matches existing Replit stack |
| Database | PostgreSQL (Replit-hosted) | Relational, handles CSV + JSON payloads |
| Auth | JWT + bcrypt | Lightweight, no external dependency |
| Charts | Recharts | React-native, clean rendering |
| Cron | node-cron | In-process scheduler, no external queue needed |
| Hosting | Replit (full-stack deployment) | Matches existing infra |

---

## 📋 Build Order for Claude Code

Execute in this sequence to avoid dependency issues:

1. **Scaffold project** — `client/` + `server/` structure, install dependencies
2. **Database** — Run `schema.sql`, seed with mock data
3. **Auth system** — `manager_users` table, JWT middleware, login page
4. **Admin Entry Portal** — Forms for Enrollment + Outcomes managers
5. **Finance Module** — API sync + display
6. **Marketing Module** — API sync + display
7. **Enrollment Module** — Form entry + display
8. **Outcomes Module** — CSV upload parser + display
9. **Dean Dashboard view** — Unified summary page pulling all 4 modules
10. **Polish** — Last-updated banners, error states, mobile responsiveness

---

## 📌 Notes for Claude Code

- Use `react-router-dom` for client-side routing
- All API routes should be prefixed with `/api/v1/`
- The Admin Entry Portal lives at `/admin` — gated by manager/admin role
- The Dean Dashboard is the default route `/` — gated by dean/admin role
- Mock data should be pre-seeded for all 4 modules so the UI is populated on first run
- The Finance and Marketing apps don't exist yet as integrated endpoints — stub them with mock responses during build, using an `INTEGRATION_MODE=mock|live` env variable to toggle
- CSV upload for Outcomes should use `multer` for file handling, `papaparse` (or equivalent server-side) for parsing
- All tables should show a "Last updated by [name] at [time]" footer
- The dashboard should have a campus filter (All / Calgary / Red Deer / Cold Lake / Edmonton / Vancouver) that scopes Enrollment and Outcomes data

---

## 📅 Maintenance Workflow (Daily)

1. **8:00 AM** — Enrollment Manager logs into `/admin`, submits yesterday's enrollment update
2. **8:00 AM** — Outcomes Manager uploads updated class list CSV or submits manual aggregate
3. **Automated** — Finance and Marketing data pulled from connected apps every 60 min
4. **Dean** — Reviews dashboard at any time, always sees data current as of this morning

---

*Built for MCG Career College | InFocus Film School | CGA Medical Imaging*
*Managed by the Office of the Dean of Operations*
