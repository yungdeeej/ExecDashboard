import KPICard from '../shared/KPICard'
import TrendSparkline from '../shared/TrendSparkline'
import LastUpdatedBanner from '../shared/LastUpdatedBanner'
import useModuleData from '../../hooks/useModuleData'
import { getFinanceLatest, getFinanceTrend } from '../../lib/api'

const fmt = (n) => {
  if (n == null) return '$0'
  return '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export default function FinanceModule({ compact = false }) {
  const { data: latest, loading } = useModuleData(getFinanceLatest)
  const { data: trend } = useModuleData(() => getFinanceTrend(30))

  if (loading) {
    return <div className="animate-pulse bg-gray-100 rounded-xl h-48" />
  }

  if (!latest) {
    return <div className="text-gray-400 text-center py-8">No finance data available</div>
  }

  const kpis = [
    { title: 'Revenue (MTD)', value: fmt(latest.revenue_mtd), color: 'green', icon: '$' },
    { title: 'Revenue (YTD)', value: fmt(latest.revenue_ytd), color: 'blue', icon: '$' },
    { title: 'Tuition Collected', value: fmt(latest.tuition_collected), subtitle: `of ${fmt(latest.tuition_expected)} expected`, color: 'purple' },
    { title: 'Outstanding Balances', value: fmt(latest.outstanding_balances), color: 'orange' },
    { title: 'Govt Funding', value: fmt(latest.govt_funding_received), color: 'indigo' },
    { title: 'Net Position', value: fmt(latest.net_position), color: latest.net_position >= 0 ? 'green' : 'red' },
  ]

  const displayKpis = compact ? kpis.slice(0, 4) : kpis

  return (
    <div>
      <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
        {displayKpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {!compact && trend && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-3">Revenue Trend (30 days)</h4>
          <TrendSparkline data={trend} dataKey="revenue_mtd" color="#22c55e" height={120} />
        </div>
      )}

      <LastUpdatedBanner timestamp={latest.fetched_at} />
    </div>
  )
}
