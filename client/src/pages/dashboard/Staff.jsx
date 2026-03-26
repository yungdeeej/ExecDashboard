import { useState } from 'react'
import TopBar from '../../components/layout/TopBar'
import StaffModule from '../../components/modules/StaffModule'

export default function Staff() {
  const [campus, setCampus] = useState('All')

  return (
    <div>
      <TopBar title="Staff & Operations" campus={campus} onCampusChange={setCampus} />
      <div className="p-6">
        <StaffModule campus={campus} />
      </div>
    </div>
  )
}
