import TopBar from '../../components/layout/TopBar'
import AlertsModule from '../../components/modules/AlertsModule'

export default function Alerts() {
  return (
    <div>
      <TopBar title="Alerts & Flags" />
      <div className="p-6">
        <AlertsModule />
      </div>
    </div>
  )
}
