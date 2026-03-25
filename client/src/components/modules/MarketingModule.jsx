import KPICard from '../shared/KPICard'
import TrendSparkline from '../shared/TrendSparkline'
import LastUpdatedBanner from '../shared/LastUpdatedBanner'
import useModuleData from '../../hooks/useModuleData'
import { getMarketingLatest, getMarketingTrend } from '../../lib/api'

const fmt = (n) => {
  if (n == null) return '$0'
  return '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export default function MarketingModule({ compact = false }) {
  const { data: latest, loading } = useModuleData(getMarketingLatest)
  const { data: trend } = useModuleData(() => getMarketingTrend(30))

  if (loading) {
    return <div className="animate-pulse bg-gray-100 rounded-xl h-48" />
  }

  if (!latest) {
    return <div className="text-gray-400 text-center py-8">No marketing data available</div>
  }

  const convRate = latest.conversion_rate
    ? `${(Number(latest.conversion_rate) * 100).toFixed(1)}%`
    : 'N/A'

  const kpis = [
    { title: 'CPL - Meta', value: fmt(latest.cpl_meta), color: 'blue' },
    { title: 'CPL - Google', value: fmt(latest.cpl_google), color: 'green' },
    { title: 'Total Ad Spend (MTD)', value: fmt(latest.total_spend), color: 'orange' },
    { title: 'Leads (MTD)', value: latest.leads_mtd?.toLocaleString() || '0', color: 'purple' },
    { title: 'Leads (YTD)', value: latest.leads_ytd?.toLocaleString() || '0', color: 'indigo' },
    { title: 'Conversion Rate', value: convRate, color: 'green' },
  ]

  const socialKpis = [
    { title: 'Instagram Followers', value: latest.ig_followers?.toLocaleString() || '0', color: 'purple' },
    { title: 'Facebook Followers', value: latest.fb_followers?.toLocaleString() || '0', color: 'blue' },
    { title: 'Top Campaign', value: latest.top_campaign || 'N/A', color: 'green' },
  ]

  const displayKpis = compact ? kpis.slice(0, 4) : kpis

  return (
    <div>
      <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
        {displayKpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {!compact && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            {socialKpis.map((kpi) => (
              <KPICard key={kpi.title} {...kpi} />
            ))}
          </div>

          {trend && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Leads Trend (30 days)</h4>
              <TrendSparkline data={trend} dataKey="leads_mtd" color="#8b5cf6" height={120} />
            </div>
          )}
        </>
      )}

      <LastUpdatedBanner timestamp={latest.fetched_at} />
    </div>
  )
}
