import { useState } from 'react'
import { postEnrollmentEntry } from '../../lib/api'

const programs = ['Healthcare Aide', 'Business Admin', 'Medical Lab Assistant', 'Pharmacy Technician']

export default function EnrollmentForm({ user }) {
  const [form, setForm] = useState({
    campus: user?.campus || 'Calgary',
    program: programs[0],
    entry_date: new Date().toISOString().split('T')[0],
    new_enrollments: '', starts: '', stays: '', funded: '',
    leads_new: '', applications_submitted: '', applications_approved: '',
    notes: '',
  })
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      await postEnrollmentEntry(form)
      setMessage({ type: 'success', text: 'Enrollment entry saved successfully!' })
      setForm(prev => ({
        ...prev, new_enrollments: '', starts: '', stays: '', funded: '',
        leads_new: '', applications_submitted: '', applications_approved: '', notes: '',
      }))
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save entry' })
    } finally {
      setLoading(false)
    }
  }

  const field = (label, key) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="number" min="0" value={form[key]} onChange={e => set(key, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Enrollment Update</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campus</label>
            <input type="text" value={form.campus} disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
            <select value={form.program} onChange={e => set('program', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              {programs.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" value={form.entry_date} onChange={e => set('entry_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {field('New Enrollments', 'new_enrollments')}
          {field('Starts', 'starts')}
          {field('Stays (past drop date)', 'stays')}
          {field('Funded (StudentAid AB)', 'funded')}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-3">Pipeline</p>
          <div className="grid grid-cols-3 gap-4">
            {field('New Leads This Week', 'leads_new')}
            {field('Applications Submitted', 'applications_submitted')}
            {field('Applications Approved', 'applications_approved')}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {loading ? 'Saving...' : 'Submit Enrollment Entry'}
        </button>
      </form>
    </div>
  )
}
