import TopBar from '../components/layout/TopBar'
import DataEntryForm from '../components/admin/DataEntryForm'

export default function AdminEntry({ user }) {
  return (
    <div>
      <TopBar title="Data Entry Portal" />
      <div className="p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Submit Data Update</h3>
          <DataEntryForm userRole={user?.role} />
        </div>
      </div>
    </div>
  )
}
