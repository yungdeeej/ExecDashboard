import TopBar from '../../components/layout/TopBar'
import MarketingModule from '../../components/modules/MarketingModule'

export default function Marketing() {
  return (
    <div>
      <TopBar title="Marketing Performance" />
      <div className="p-6">
        <MarketingModule />
      </div>
    </div>
  )
}
