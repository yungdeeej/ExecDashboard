import TopBar from '../components/layout/TopBar'
import OutcomesModule from '../components/modules/OutcomesModule'

export default function Outcomes() {
  return (
    <div>
      <TopBar title="Student Outcomes" />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <OutcomesModule />
        </div>
      </div>
    </div>
  )
}
