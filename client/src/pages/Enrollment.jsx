import { useState } from 'react'
import TopBar from '../components/layout/TopBar'
import EnrollmentModule from '../components/modules/EnrollmentModule'

export default function Enrollment() {
  const [campus, setCampus] = useState('All')

  return (
    <div>
      <TopBar title="Enrollment" campus={campus} onCampusChange={setCampus} />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <EnrollmentModule campus={campus} />
        </div>
      </div>
    </div>
  )
}
