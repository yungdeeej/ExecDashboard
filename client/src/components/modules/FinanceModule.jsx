import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import KPICard from '../shared/KPICard'
import SyncStatusBanner from '../shared/SyncStatusBanner'
import SkeletonLoader, { SkeletonChart } from '../shared/SkeletonLoader'
import useModuleData from '../../hooks/useModuleData'
import { getFinanceLatest, getFinanceTrend } from '../../lib/api'
import { fmtCurrency, ragStatus } from '../../lib/formatters'

const CHART_COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6']

const chartTooltipStyle = {
  contentStyle: { background: '#161B22', border: '1px solid #30363D', borderRadius: '8px', fontSize: '12px', color: '#E6EDF3' },
  itemStyle: { color: '#E6EDF3' },
}

export default function FinanceModule() {
  const { data: latest, loading } = useModuleData(getFinanceLatest)
  const { data: trend } = useModuleData(() => getFinanceTrend(30))

  if (loading) return <SkeletonLoader count={6} />

  if (!latest) return <div className="text-dark-muted text-center py-8">No finance data available</div>

  const kpis = [
    { title: 'Revenue MTD', value: fmtCurrency(latest.revenue_mtd), rag: ragStatus(latest.revenue_mtd, 300000), sparkData: trend, sparkKey: 'revenue_mtd', sparkColor: '#22C55E' },
    { title: 'Revenue YTD', value: fmtCurrency(latest.revenue_ytd), rag: 'green' },
    { title: 'Tuition Collected', value: fmtCurrency(latest.tuition_collected), subtitle: `of ${fmtCurrency(latest.tuition_expected)} expected`, rag: ragStatus(latest.tuition_collected, latest.tuition_expected) },
    { title: 'Outstanding Balances', value: fmtCurrency(latest.outstanding_balances), rag: latest.outstanding_balances > 60000 ? 'amber' : 'green' },
    { title: 'Govt Funding', value: fmtCurrency(latest.govt_funding_received) },
    { title: 'Net Position', value: fmtCurrency(latest.net_position), rag: latest.net_position >= 0 ? 'green' : 'red' },
    { title: 'Cost Per Student', value: fmtCurrency(latest.cost_per_student) },
    { title: 'Days Cash on Hand', value: latest.days_cash_on_hand ? `${Math.round(latest.days_cash_on_hand)}` : 'N/A', rag: latest.days_cash_on_hand >= 60 ? 'green' : latest.days_cash_on_hand >= 30 ? 'amber' : 'red' },
  ]

  const expenseData = [
    { name: 'Salaries', value: (latest.expenses_total || 0) * 0.55 },
    { name: 'Rent', value: (latest.expenses_total || 0) * 0.15 },
    { name: 'Marketing', value: (latest.expenses_total || 0) * 0.12 },
    { name: 'Operations', value: (latest.expenses_total || 0) * 0.10 },
    { name: 'Other', value: (latest.expenses_total || 0) * 0.08 },
  ]

  return (
    <div className="fade-in space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => <KPICard key={kpi.title} {...kpi} />)}
      </div>

      {trend && trend.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <h4 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">Revenue Trend (30 days)</h4>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="snapshot_date" tick={{ fontSize: 10, fill: '#8B949E' }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#8B949E' }} tickFormatter={v => `$${(v/1000)}K`} />
                <Tooltip {...chartTooltipStyle} formatter={v => [fmtCurrency(v), 'Revenue']} />
                <Line type="monotone" dataKey="revenue_mtd" stroke="#22C55E" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <h4 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">Expense Breakdown</h4>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                  {expenseData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle} formatter={v => fmtCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {expenseData.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1 text-xs text-dark-muted">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                  {d.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <SyncStatusBanner timestamp={latest.fetched_at} source="Finance API" />
    </div>
  )
}
