import TopBar from '../components/layout/TopBar'
import FinanceModule from '../components/modules/FinanceModule'

export default function Finance() {
  return (
    <div>
      <TopBar title="Finance" />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <FinanceModule />
        </div>
      </div>
    </div>
  )
}
