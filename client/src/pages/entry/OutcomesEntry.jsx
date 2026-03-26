import OutcomesForm from '../../components/entry/OutcomesForm'
import CSVUpload from '../../components/entry/CSVUpload'

export default function OutcomesEntry() {
  return (
    <div className="space-y-6">
      <CSVUpload />
      <OutcomesForm />
    </div>
  )
}
