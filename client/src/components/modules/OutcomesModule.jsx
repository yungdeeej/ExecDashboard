import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import KPICard from '../shared/KPICard'
import DataTable from '../shared/DataTable'
import StatusBadge from '../shared/StatusBadge'
import SkeletonLoader from '../shared/SkeletonLoader'
import useModuleData from '../../hooks/useModuleData'
import { getOutcomesSummary, getOutcomesStudents } from '../../lib/api'
import { fmtPct, fmtNum, ragStatus } from '../../lib/formatters'

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444']

const chartTooltipStyle = {
  contentStyle: { background: '#161B22', border: '1px solid #30363D', borderRadius: '8px', fontSize: '12px', color: '#E6EDF3' },
}

export default function OutcomesModule() {
  const { data: summary, loading } = useModuleData(getOutcomesSummary)
  const { data: students } = useModuleData(() => getOutcomesStudents(50))

  if (loading) return <SkeletonLoader count={6} />
  if (!summary) return <div className="text-dark-muted text-center py-8">No outcomes data</div>

  const kpis = [
    { title: 'Active Practicums', value: fmtNum(summary.activePracticums) },
    { title: 'Graduation Rate', value: fmtPct(summary.graduationRate), rag: ragStatus(summary.graduationRate, 85) },
    { title: 'Employment Rate', value: fmtPct(summary.employmentRate), rag: ragStatus(summary.employmentRate, 80) },
    { title: 'Avg Time to Employment', value: `${summary.avgTimeToEmployment || 0} days` },
    { title: 'Practicum Completion', value: fmtPct(summary.practicumCompletionRate || 0), rag: ragStatus(summary.practicumCompletionRate || 75, 80) },
    { title: 'Employer Partners', value: fmtNum(summary.employerPartners) },
  ]

  const practicumData = [
    { name: 'Active', value: summary.practicumActive || 0 },
    { name: 'Completed', value: summary.practicumCompleted || 0 },
    { name: 'Pending', value: summary.practicumPending || 0 },
  ]

  const studentColumns = [
    { key: 'student_id', label: 'ID' },
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'program', label: 'Program' },
    { key: 'campus', label: 'Campus' },
    { key: 'practicum_status', label: 'Practicum', render: (v) => v ? <StatusBadge status={v} /> : '-' },
    { key: 'employment_status', label: 'Employment', render: (v) => v ? <StatusBadge status={v} /> : '-' },
  ]

  return (
    <div className="fade-in space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => <KPICard key={kpi.title} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {summary.byProgram && (
          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <h4 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">Employment by Program</h4>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={summary.byProgram} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#8B949E' }} />
                <YAxis dataKey="program" type="category" tick={{ fontSize: 10, fill: '#8B949E' }} width={120} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="employed" fill="#22C55E" radius={[0, 4, 4, 0]} name="Employed" />
                <Bar dataKey="in_practicum" fill="#3B82F6" radius={[0, 4, 4, 0]} name="In Practicum" />
                <Bar dataKey="seeking" fill="#F59E0B" radius={[0, 4, 4, 0]} name="Seeking" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <h4 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">Practicum Status</h4>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={practicumData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                {practicumData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2">
            {practicumData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1 text-xs text-dark-muted">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {students && students.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <h4 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">Student Records</h4>
          <DataTable columns={studentColumns} data={students} />
        </div>
      )}
    </div>
  )
}
