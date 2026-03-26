require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const { initializeDatabase } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Initialize database
initializeDatabase();

// Auth routes (public)
app.use('/api/v1/auth', require('./routes/auth'));

// Dashboard routes (dean/admin only - enforced by route-level middleware)
app.use('/api/v1/dashboard/finance', require('./routes/dashboard/finance'));
app.use('/api/v1/dashboard/enrollment', require('./routes/dashboard/enrollment'));
app.use('/api/v1/dashboard/outcomes', require('./routes/dashboard/outcomes'));
app.use('/api/v1/dashboard/marketing', require('./routes/dashboard/marketing'));
app.use('/api/v1/dashboard/staff', require('./routes/dashboard/staff'));
app.use('/api/v1/dashboard/alerts', require('./routes/dashboard/alerts'));

// Entry routes (managers/admin)
app.use('/api/v1/entry/enrollment', require('./routes/entry/enrollmentEntry'));
app.use('/api/v1/entry/outcomes', require('./routes/entry/outcomesEntry'));
app.use('/api/v1/entry/staff', require('./routes/entry/staffEntry'));

// Webhooks (external app push)
app.use('/api/v1/webhooks', require('./routes/webhooks'));

// Cron jobs - every 60 minutes
const syncFinance = require('./lib/syncFinance');
const syncMarketing = require('./lib/syncMarketing');
const generateAlerts = require('./lib/generateAlerts');

cron.schedule('0 * * * *', async () => {
  await syncFinance();
  await syncMarketing();
});

// Nightly alert evaluation at midnight
cron.schedule('0 0 * * *', async () => {
  await generateAlerts();
});

// Serve static files in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MCG Dashboard server running on port ${PORT}`);
});
