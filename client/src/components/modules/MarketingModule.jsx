import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import KPICard from '../shared/KPICard'
import SyncStatusBanner from '../shared/SyncStatusBanner'
import SkeletonLoader from '../shared/SkeletonLoader'
import useModuleData from '../../hooks/useModuleData'
import { getMarketingLatest, getMarketingTrend } from '../../lib/api'
import { fmtCurrency, fmtPct, fmtNum, ragStatus } from '../../lib/formatters'

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6']

const chartTooltipStyle = {
  contentStyle: { background: '#161B22', border: '1px solid #30363D', borderRadius: '8px', fontSize: '12px', color: '#E6EDF3' },
}

export default function MarketingModule() {
  const { data: latest, loading } = useModuleData(getMarketingLatest)
  const { data: trend } = useModuleData(() => getMarketingTrend(30))

  if (loading) return <SkeletonLoader count={6} />
  if (!latest) return <div className="text-dark-muted text-center py-8">No marketing data</div>

  const convRate = latest.conversion_rate ? (Number(latest.conversion_rate) * 100) : 0

  const kpis = [
    { title: 'CPL - Meta', value: fmtCurrency(latest.cpl_meta), rag: ragStatus(latest.cpl_meta, 35, false), sparkData: trend, sparkKey: 'cpl_meta', sparkColor: '#3B82F6' },
    { title: 'CPL - Google', value: fmtCurrency(latest.cpl_google), rag: ragStatus(latest.cpl_google, 40, false) },
    { title: 'CPL - Organic', value: fmtCurrency(latest.cpl_organic) },
    { title: 'Ad Spend MTD', value: fmtCurrency(latest.total_spend), subtitle: latest.budget_mtd ? `Budget: ${fmtCurrency(latest.budget_mtd)}` : undefined, rag: latest.budget_mtd ? ragStatus(latest.total_spend, latest.budget_mtd, false) : undefined },
    { title: 'Leads MTD', value: fmtNum(latest.leads_mtd), sparkData: trend, sparkKey: 'leads_mtd', sparkColor: '#22C55E' },
    { title: 'Leads YTD', value: fmtNum(latest.leads_ytd) },
    { title: 'Conversion Rate', value: fmtPct(convRate), rag: ragStatus(convRate, 10) },
  ]

  const socialKpis = [
    { title: 'Instagram Followers', value: fmtNum(latest.ig_followers) },
    { title: 'Facebook Followers', value: fmtNum(latest.fb_followers) },
    { title: 'Top Campaign', value: latest.top_campaign || 'N/A' },
  ]

  const leadSourceData = [
    { name: 'Meta', value: latest.cpl_meta ? Math.round(latest.leads_mtd * 0.4) : 0 },
    { name: 'Google', value: latest.cpl_google ? Math.round(latest.leads_mtd * 0.3) : 0 },
    { name: 'Organic', value: Math.round(latest.leads_mtd * 0.2) },
    { name: 'Referral', value: Math.round(latest.leads_mtd * 0.1) },
  ]

  return (
    <div className="fade-in space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => <KPICard key={kpi.title} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {socialKpis.map((kpi) => <KPICard key={kpi.title} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trend && (
          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <h4 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">CPL Trend (30 days)</h4>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="snapshot_date" tick={{ fontSize: 10, fill: '#8B949E' }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#8B949E' }} tickFormatter={v => `$${v}`} />
                <Tooltip {...chartTooltipStyle} />
                <Line type="monotone" dataKey="cpl_meta" stroke="#3B82F6" strokeWidth={2} dot={false} name="Meta" />
                <Line type="monotone" dataKey="cpl_google" stroke="#22C55E" strokeWidth={2} dot={false} name="Google" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <h4 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">Lead Sources (MTD)</h4>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={leadSourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                {leadSourceData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-3 justify-center mt-2 flex-wrap">
            {leadSourceData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1 text-xs text-dark-muted">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      <SyncStatusBanner timestamp={latest.fetched_at} source="Marketing API" />
    </div>
  )
}
