import { useState } from 'react'
import { postOutcomeEntry } from '../../lib/api'

const programs = ['Healthcare Aide', 'Business Admin', 'Medical Lab Assistant', 'Pharmacy Technician']

export default function OutcomesForm() {
  const [form, setForm] = useState({
    cohort_id: '', program: programs[0], reporting_period: '',
    active_practicums: '', placements_secured: '', graduates: '', confirmed_employed: '',
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
      await postOutcomeEntry(form)
      setMessage({ type: 'success', text: 'Outcomes entry saved!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save' })
    } finally {
      setLoading(false)
    }
  }

  const field = (label, key, type = 'number') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} min={type === 'number' ? '0' : undefined} value={form[key]}
        onChange={e => set(key, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Outcomes Aggregate Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {field('Cohort / Program', 'cohort_id', 'text')}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
            <select value={form.program} onChange={e => set('program', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              {programs.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {field('Reporting Period', 'reporting_period', 'text')}

        <div className="grid grid-cols-2 gap-4">
          {field('Total Active Practicums', 'active_practicums')}
          {field('Placements Secured This Week', 'placements_secured')}
          {field('Graduates This Period', 'graduates')}
          {field('Confirmed Employed (within 3mo)', 'confirmed_employed')}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {loading ? 'Saving...' : 'Submit Outcomes Entry'}
        </button>
      </form>
    </div>
  )
}
