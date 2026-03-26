import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import KPICard from '../shared/KPICard'
import DataTable from '../shared/DataTable'
import SyncStatusBanner from '../shared/SyncStatusBanner'
import SkeletonLoader from '../shared/SkeletonLoader'
import useModuleData from '../../hooks/useModuleData'
import { getEnrollmentSummary, getEnrollmentTrend, getEnrollmentEntries } from '../../lib/api'
import { fmtNum, fmtPct, ragStatus } from '../../lib/formatters'

const chartTooltipStyle = {
  contentStyle: { background: '#161B22', border: '1px solid #30363D', borderRadius: '8px', fontSize: '12px', color: '#E6EDF3' },
}

export default function EnrollmentModule({ campus = 'All' }) {
  const { data: summary, loading } = useModuleData(() => getEnrollmentSummary(campus), [campus])
  const { data: trend } = useModuleData(() => getEnrollmentTrend(campus, 30), [campus])
  const { data: entries } = useModuleData(() => getEnrollmentEntries(campus, 20), [campus])

  if (loading) return <SkeletonLoader count={6} />
  if (!summary) return <div className="text-dark-muted text-center py-8">No enrollment data</div>

  const { mtd, ytd, byCampus, stayRate } = summary

  const kpis = [
    { title: 'Enrollments MTD', value: fmtNum(mtd.enrollments_mtd), rag: ragStatus(mtd.enrollments_mtd, 50), sparkData: trend, sparkKey: 'enrollments', sparkColor: '#3B82F6' },
    { title: 'Starts MTD', value: fmtNum(mtd.starts_mtd), rag: 'green' },
    { title: 'Stay Rate', value: fmtPct(stayRate), rag: ragStatus(parseFloat(stayRate), 70) },
    { title: 'Funded Students MTD', value: fmtNum(mtd.funded_mtd) },
    { title: 'Enrollments YTD', value: fmtNum(ytd.enrollments_ytd) },
    { title: 'Starts YTD', value: fmtNum(ytd.starts_ytd) },
  ]

  const campusColumns = [
    { key: 'campus', label: 'Campus' },
    { key: 'enrollments', label: 'Enrollments' },
    { key: 'starts', label: 'Starts' },
    { key: 'stays', label: 'Stays' },
    { key: 'funded', label: 'Funded' },
  ]

  return (
    <div className="fade-in space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => <KPICard key={kpi.title} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trend && (
          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <h4 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">Enrollment Trend (30 days)</h4>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="entry_date" tick={{ fontSize: 10, fill: '#8B949E' }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#8B949E' }} />
                <Tooltip {...chartTooltipStyle} />
                <Line type="monotone" dataKey="enrollments" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="starts" stroke="#22C55E" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {byCampus && byCampus.length > 0 && (
          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <h4 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">By Campus (MTD)</h4>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byCampus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="campus" tick={{ fontSize: 10, fill: '#8B949E' }} />
                <YAxis tick={{ fontSize: 10, fill: '#8B949E' }} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="enrollments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="starts" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {entries && entries.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <h4 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">Recent Entries</h4>
          <DataTable columns={campusColumns.concat([
            { key: 'entry_date', label: 'Date' },
            { key: 'program', label: 'Program' },
          ])} data={entries} />
        </div>
      )}

      <SyncStatusBanner timestamp={entries?.[0]?.created_at} source="Manager Entry" />
    </div>
  )
}
