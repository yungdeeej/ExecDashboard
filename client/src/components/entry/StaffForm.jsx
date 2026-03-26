import { useState } from 'react'
import { postStaffEntry } from '../../lib/api'

const campuses = ['Calgary', 'Red Deer', 'Cold Lake', 'Edmonton']

export default function StaffForm() {
  const [form, setForm] = useState({
    campus: campuses[0],
    entry_week: new Date().toISOString().split('T')[0],
    total_headcount: '', new_hires: '', departures: '',
    open_vacancies: '', advisor_count: '', instructor_count: '',
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
      await postStaffEntry(form)
      setMessage({ type: 'success', text: 'Staff entry saved!' })
      setForm(prev => ({
        ...prev, total_headcount: '', new_hires: '', departures: '',
        open_vacancies: '', advisor_count: '', instructor_count: '', notes: '',
      }))
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save' })
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
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Staff & Operations Update</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campus</label>
            <select value={form.campus} onChange={e => set('campus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              {campuses.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Week</label>
            <input type="date" value={form.entry_week} onChange={e => set('entry_week', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {field('Current Headcount', 'total_headcount')}
          {field('New Hires This Week', 'new_hires')}
          {field('Departures This Week', 'departures')}
          {field('Open Vacancies', 'open_vacancies')}
          {field('Advisor Count', 'advisor_count')}
          {field('Instructor Count', 'instructor_count')}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {loading ? 'Saving...' : 'Submit Staff Entry'}
        </button>
      </form>
    </div>
  )
}
