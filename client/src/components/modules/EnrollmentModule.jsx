import KPICard from '../shared/KPICard'
import TrendSparkline from '../shared/TrendSparkline'
import DataTable from '../shared/DataTable'
import LastUpdatedBanner from '../shared/LastUpdatedBanner'
import useModuleData from '../../hooks/useModuleData'
import { getEnrollmentSummary, getEnrollmentTrend, getEnrollmentEntries } from '../../lib/api'

export default function EnrollmentModule({ campus = 'All', compact = false }) {
  const { data: summary, loading } = useModuleData(() => getEnrollmentSummary(campus), [campus])
  const { data: trend } = useModuleData(() => getEnrollmentTrend(campus, 30), [campus])
  const { data: entries } = useModuleData(() => getEnrollmentEntries(campus, 20), [campus])

  if (loading) {
    return <div className="animate-pulse bg-gray-100 rounded-xl h-48" />
  }

  if (!summary) {
    return <div className="text-gray-400 text-center py-8">No enrollment data available</div>
  }

  const { mtd, ytd, byCampus, stayRate } = summary

  const kpis = [
    { title: 'New Enrollments (MTD)', value: mtd.enrollments_mtd.toLocaleString(), color: 'blue' },
    { title: 'Starts (MTD)', value: mtd.starts_mtd.toLocaleString(), color: 'green' },
    { title: 'Stay Rate', value: `${stayRate}%`, color: parseFloat(stayRate) >= 70 ? 'green' : 'orange' },
    { title: 'Funded Students (MTD)', value: mtd.funded_mtd.toLocaleString(), color: 'purple' },
    { title: 'Enrollments (YTD)', value: ytd.enrollments_ytd.toLocaleString(), color: 'indigo' },
    { title: 'Starts (YTD)', value: ytd.starts_ytd.toLocaleString(), color: 'blue' },
  ]

  const displayKpis = compact ? kpis.slice(0, 4) : kpis

  const campusColumns = [
    { key: 'campus', label: 'Campus' },
    { key: 'enrollments', label: 'Enrollments' },
    { key: 'starts', label: 'Starts' },
    { key: 'stays', label: 'Stays' },
    { key: 'funded', label: 'Funded' },
  ]

  const entryColumns = [
    { key: 'entry_date', label: 'Date' },
    { key: 'campus', label: 'Campus' },
    { key: 'program', label: 'Program' },
    { key: 'new_enrollments', label: 'New' },
    { key: 'starts', label: 'Starts' },
    { key: 'stays', label: 'Stays' },
    { key: 'funded', label: 'Funded' },
  ]

  return (
    <div>
      <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
        {displayKpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {!compact && (
        <>
          {trend && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Enrollment Trend (30 days)</h4>
              <TrendSparkline data={trend} dataKey="enrollments" color="#3b82f6" height={120} />
            </div>
          )}

          {byCampus && byCampus.length > 0 && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3">By Campus (MTD)</h4>
              <DataTable columns={campusColumns} data={byCampus} />
            </div>
          )}

          {entries && entries.length > 0 && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Recent Entries</h4>
              <DataTable columns={entryColumns} data={entries} />
            </div>
          )}
        </>
      )}

      <LastUpdatedBanner timestamp={entries?.[0]?.created_at} updatedBy={entries?.[0]?.submitted_by} />
    </div>
  )
}
