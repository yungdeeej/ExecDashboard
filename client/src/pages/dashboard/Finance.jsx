import TopBar from '../../components/layout/TopBar'
import FinanceModule from '../../components/modules/FinanceModule'

export default function Finance() {
  return (
    <div>
      <TopBar title="Finance" />
      <div className="p-6">
        <FinanceModule />
      </div>
    </div>
  )
}
