import KPICard from '../shared/KPICard'
import DataTable from '../shared/DataTable'
import StatusBadge from '../shared/StatusBadge'
import LastUpdatedBanner from '../shared/LastUpdatedBanner'
import useModuleData from '../../hooks/useModuleData'
import { getOutcomesSummary, getOutcomesStudents } from '../../lib/api'

export default function OutcomesModule({ compact = false }) {
  const { data: summary, loading } = useModuleData(getOutcomesSummary)
  const { data: students } = useModuleData(() => getOutcomesStudents(compact ? 10 : 50))

  if (loading) {
    return <div className="animate-pulse bg-gray-100 rounded-xl h-48" />
  }

  if (!summary) {
    return <div className="text-gray-400 text-center py-8">No outcomes data available</div>
  }

  const kpis = [
    { title: 'Active Practicums', value: summary.activePracticums, color: 'blue' },
    { title: 'Graduation Rate', value: `${summary.graduationRate}%`, color: summary.graduationRate >= 80 ? 'green' : 'orange' },
    { title: 'Employment Rate', value: `${summary.employmentRate}%`, color: summary.employmentRate >= 70 ? 'green' : 'orange' },
    { title: 'Avg Time to Employment', value: `${summary.avgTimeToEmployment} days`, color: 'purple' },
    { title: 'Employer Partners', value: summary.employerPartners, color: 'indigo' },
  ]

  const displayKpis = compact ? kpis.slice(0, 4) : kpis

  const programColumns = [
    { key: 'program', label: 'Program' },
    { key: 'total', label: 'Total' },
    { key: 'employed', label: 'Employed' },
    { key: 'in_practicum', label: 'In Practicum' },
    { key: 'seeking', label: 'Seeking' },
  ]

  const studentColumns = [
    { key: 'student_id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'program', label: 'Program' },
    { key: 'cohort', label: 'Cohort' },
    { key: 'employment_status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'practicum_employer', label: 'Employer' },
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
          {summary.byProgram && summary.byProgram.length > 0 && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3">By Program</h4>
              <DataTable columns={programColumns} data={summary.byProgram} />
            </div>
          )}

          {students && students.length > 0 && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Student Records</h4>
              <DataTable columns={studentColumns} data={students} />
            </div>
          )}
        </>
      )}

      <LastUpdatedBanner timestamp={students?.[0]?.updated_at} />
    </div>
  )
}
