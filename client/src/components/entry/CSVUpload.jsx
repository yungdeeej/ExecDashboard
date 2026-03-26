import { useState } from 'react'
import { Upload } from 'lucide-react'
import { uploadOutcomesCSV } from '../../lib/api'

export default function CSVUpload() {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Class List CSV</h2>
      <form onSubmit={handleUpload} className="space-y-4">
        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <input
            type="file"
            accept=".csv"
            onChange={e => setFile(e.target.files[0])}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && <p className="text-sm text-gray-600 mt-2">{file.name}</p>}
        </div>

        <p className="text-xs text-gray-400">
          Expected: student_id, first_name, last_name, program, cohort_id, campus, enrollment_date, expected_grad_date, actual_grad_date, practicum_start_date, practicum_end_date, practicum_employer, practicum_status, employment_date, employer_name, employment_status, notes
        </p>

        <button type="submit" disabled={loading || !file}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {loading ? 'Uploading...' : 'Upload CSV'}
        </button>
      </form>
    </div>
  )
}
