import { useState } from 'react'
import TopBar from '../../components/layout/TopBar'
import OverviewModule from '../../components/modules/OverviewModule'

export default function Overview({ user }) {
  const [campus, setCampus] = useState('All')

  return (
    <div>
      <TopBar title="Overview" campus={campus} onCampusChange={setCampus} />
      <div className="p-6">
        <OverviewModule campus={campus} userName={user?.name} />
      </div>
    </div>
  )
}
