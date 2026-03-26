function getMockFinanceData() {
  const today = new Date().toISOString().split('T')[0];

  return {
    snapshot_date: today,
    revenue_mtd: 312450.00,
    revenue_ytd: 2945800.00,
    tuition_collected: 245600.00,
    tuition_expected: 320000.00,
    outstanding_balances: 52340.00,
    govt_funding_received: 178500.00,
    expenses_total: 198720.00,
    net_position: 113730.00,
    cost_per_student: 4850.00,
    days_cash_on_hand: 47,
  };
}

function getMockMarketingData() {
  const today = new Date().toISOString().split('T')[0];

  return {
    snapshot_date: today,
    cpl_meta: 22.50,
    cpl_google: 38.75,
    cpl_organic: 0.00,
    total_spend: 11250.00,
    budget_mtd: 15000.00,
    leads_mtd: 164,
    leads_ytd: 1587,
    ig_followers: 4380,
    fb_followers: 8720,
    top_campaign: 'Spring Open House 2025',
    conversion_rate: 0.1140,
  };
}

module.exports = { getMockFinanceData, getMockMarketingData };
