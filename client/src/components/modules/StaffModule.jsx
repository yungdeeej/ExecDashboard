import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import KPICard from '../shared/KPICard'
import DataTable from '../shared/DataTable'
import SkeletonLoader from '../shared/SkeletonLoader'
import SyncStatusBanner from '../shared/SyncStatusBanner'
import useModuleData from '../../hooks/useModuleData'
import { getStaffSummary, getStaffTrend } from '../../lib/api'
import { fmtNum, fmtPct } from '../../lib/formatters'

const chartTooltipStyle = {
  contentStyle: { background: '#161B22', border: '1px solid #30363D', borderRadius: '8px', fontSize: '12px', color: '#E6EDF3' },
}

export default function StaffModule({ campus = 'All' }) {
  const { data: summary, loading } = useModuleData(() => getStaffSummary(campus), [campus])
  const { data: trend } = useModuleData(() => getStaffTrend(campus), [campus])

  if (loading) return <SkeletonLoader count={6} />
  if (!summary) return <div className="text-dark-muted text-center py-8">No staff data</div>

  const kpis = [
    { title: 'Total Headcount', value: fmtNum(summary.totalHeadcount) },
    { title: 'Open Vacancies', value: fmtNum(summary.totalVacancies), rag: summary.totalVacancies > 5 ? 'amber' : 'green' },
    { title: 'Advisor:Student Ratio', value: summary.advisorRatio || 'N/A' },
    { title: 'New Hires (MTD)', value: fmtNum(summary.totalNewHires) },
    { title: 'Departures (MTD)', value: fmtNum(summary.totalDepartures), rag: summary.totalDepartures > 3 ? 'amber' : 'green' },
    { title: 'Instructor Count', value: fmtNum(summary.totalInstructors) },
  ]

  const campusColumns = [
    { key: 'campus', label: 'Campus' },
    { key: 'total_headcount', label: 'Headcount' },
    { key: 'open_vacancies', label: 'Vacancies' },
    { key: 'advisor_count', label: 'Advisors' },
    { key: 'instructor_count', label: 'Instructors' },
  ]

  return (
    <div className="fade-in space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => <KPICard key={kpi.title} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {summary.byCampus && (
          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <h4 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">Headcount by Campus</h4>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={summary.byCampus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="campus" tick={{ fontSize: 10, fill: '#8B949E' }} />
                <YAxis tick={{ fontSize: 10, fill: '#8B949E' }} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="total_headcount" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Headcount" />
                <Bar dataKey="open_vacancies" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Vacancies" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {trend && trend.length > 0 && (
          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <h4 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">Headcount Trend</h4>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="entry_week" tick={{ fontSize: 10, fill: '#8B949E' }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#8B949E' }} />
                <Tooltip {...chartTooltipStyle} />
                <Line type="monotone" dataKey="headcount" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {summary.byCampus && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <h4 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">Campus Breakdown</h4>
          <DataTable columns={campusColumns} data={summary.byCampus} />
        </div>
      )}

      <SyncStatusBanner timestamp={summary.byCampus?.[0]?.created_at} source="Manager Entry" />
    </div>
  )
}
