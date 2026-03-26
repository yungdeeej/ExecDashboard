import { useNavigate } from 'react-router-dom'
import KPICard from '../shared/KPICard'
import StatusBadge from '../shared/StatusBadge'
import SkeletonLoader from '../shared/SkeletonLoader'
import useModuleData from '../../hooks/useModuleData'
import { getFinanceLatest, getEnrollmentSummary, getOutcomesSummary, getMarketingLatest, getAlerts } from '../../lib/api'
import { fmtCurrency, fmtPct, fmtNum, ragStatus } from '../../lib/formatters'

export default function OverviewModule({ campus = 'All', userName }) {
  const { data: finance, loading: fl } = useModuleData(getFinanceLatest)
  const { data: enrollment, loading: el } = useModuleData(() => getEnrollmentSummary(campus), [campus])
  const { data: outcomes, loading: ol } = useModuleData(getOutcomesSummary)
  const { data: marketing, loading: ml } = useModuleData(getMarketingLatest)
  const { data: alerts } = useModuleData(() => getAlerts(false))
  const navigate = useNavigate()

  const loading = fl || el || ol || ml
  if (loading) return <SkeletonLoader count={5} />

  const activeAlerts = alerts?.filter(a => !a.dismissed) || []

  return (
    <div className="fade-in space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-display font-bold text-dark-text">
          Good morning{userName ? `, ${userName.split(' ')[0]}` : ''}
        </h2>
        <p className="text-sm text-dark-muted mt-1">
          Today's Snapshot — {campus === 'All' ? 'All Campuses' : campus}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Revenue MTD"
          value={fmtCurrency(finance?.revenue_mtd)}
          rag={ragStatus(finance?.revenue_mtd, 300000)}
        />
        <KPICard
          title="Enrollments MTD"
          value={fmtNum(enrollment?.mtd?.enrollments_mtd)}
          rag={ragStatus(enrollment?.mtd?.enrollments_mtd, 50)}
        />
        <KPICard
          title="Graduation Rate"
          value={fmtPct(outcomes?.graduationRate)}
          rag={ragStatus(outcomes?.graduationRate, 85)}
        />
        <KPICard
          title="Employment Rate"
          value={fmtPct(outcomes?.employmentRate)}
          rag={ragStatus(outcomes?.employmentRate, 80)}
        />
        <KPICard
          title="CPL (Meta)"
          value={fmtCurrency(marketing?.cpl_meta)}
          rag={ragStatus(marketing?.cpl_meta, 35, false)}
        />
      </div>

      {activeAlerts.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-dark-text uppercase tracking-wider">
              Alerts ({activeAlerts.length})
            </h3>
            <button onClick={() => navigate('/dashboard/alerts')} className="text-xs text-accent hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-2">
            {activeAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 text-sm">
                <StatusBadge status={alert.alert_type} />
                <span className="text-dark-muted">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
