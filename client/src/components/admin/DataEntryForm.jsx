import { useState } from 'react'
import { postEnrollmentEntry, uploadOutcomesCSV, postOutcomeEntry } from '../../lib/api'

const campuses = ['Calgary', 'Red Deer', 'Cold Lake', 'Edmonton', 'Vancouver']
const programs = ['Healthcare Aide', 'Business Admin', 'Medical Lab Assistant', 'Pharmacy Technician']

function EnrollmentForm() {
  const [form, setForm] = useState({
    campus: 'Calgary',
    program: 'Healthcare Aide',
    entry_date: new Date().toISOString().split('T')[0],
    new_enrollments: '',
    starts: '',
    stays: '',
    funded: '',
    notes: '',
  })
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      await postEnrollmentEntry(form)
      setMessage({ type: 'success', text: 'Enrollment entry saved successfully!' })
      setForm(prev => ({ ...prev, new_enrollments: '', starts: '', stays: '', funded: '', notes: '' }))
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save entry' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Campus</label>
          <select value={form.campus} onChange={e => setForm({ ...form, campus: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {campuses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
          <select value={form.program} onChange={e => setForm({ ...form, program: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {programs.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input type="date" value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Enrollments</label>
          <input type="number" min="0" value={form.new_enrollments} onChange={e => setForm({ ...form, new_enrollments: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Starts</label>
          <input type="number" min="0" value={form.starts} onChange={e => setForm({ ...form, starts: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stays</label>
          <input type="number" min="0" value={form.stays} onChange={e => setForm({ ...form, stays: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Funded</label>
          <input type="number" min="0" value={form.funded} onChange={e => setForm({ ...form, funded: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
        {loading ? 'Saving...' : 'Submit Enrollment Entry'}
      </button>
    </form>
  )
}

function OutcomesForm() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await uploadOutcomesCSV(file)
      setMessage({ type: 'success', text: res.data.message })
      setFile(null)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Upload failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleUpload} className="space-y-4">
        <h4 className="font-medium text-gray-700">CSV Upload</h4>
        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class List CSV</label>
          <input
            type="file"
            accept=".csv"
            onChange={e => setFile(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-400 mt-1">
            Expected columns: student_id, name, program, cohort, grad_date, practicum_start, practicum_employer, employed_date, employment_status
          </p>
        </div>
        <button type="submit" disabled={loading || !file} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {loading ? 'Uploading...' : 'Upload CSV'}
        </button>
      </form>
    </div>
  )
}

export default function DataEntryForm({ userRole }) {
  const [activeTab, setActiveTab] = useState('enrollment')

  const tabs = []
  if (['enrollment_manager', 'admin'].includes(userRole)) {
    tabs.push({ id: 'enrollment', label: 'Enrollment' })
  }
  if (['outcomes_manager', 'admin'].includes(userRole)) {
    tabs.push({ id: 'outcomes', label: 'Outcomes' })
  }

  if (tabs.length === 0) {
    return <div className="text-gray-500 text-center py-8">No forms available for your role.</div>
  }

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'enrollment' && <EnrollmentForm />}
      {activeTab === 'outcomes' && <OutcomesForm />}
    </div>
  )
}
