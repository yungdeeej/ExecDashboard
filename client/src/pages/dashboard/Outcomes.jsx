import TopBar from '../../components/layout/TopBar'
import OutcomesModule from '../../components/modules/OutcomesModule'

export default function Outcomes() {
  return (
    <div>
      <TopBar title="Student Outcomes" />
      <div className="p-6">
        <OutcomesModule />
      </div>
    </div>
  )
}
