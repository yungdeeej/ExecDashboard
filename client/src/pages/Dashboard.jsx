import { useState } from 'react'
import TopBar from '../components/layout/TopBar'
import FinanceModule from '../components/modules/FinanceModule'
import EnrollmentModule from '../components/modules/EnrollmentModule'
import OutcomesModule from '../components/modules/OutcomesModule'
import MarketingModule from '../components/modules/MarketingModule'

export default function Dashboard() {
  const [campus, setCampus] = useState('All')

  return (
    <div>
      <TopBar title="Executive Dashboard" campus={campus} onCampusChange={setCampus} />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Finance</h3>
            <FinanceModule compact />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Enrollment</h3>
            <EnrollmentModule campus={campus} compact />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Outcomes</h3>
            <OutcomesModule compact />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Marketing</h3>
            <MarketingModule compact />
          </div>
        </div>
      </div>
    </div>
  )
}
