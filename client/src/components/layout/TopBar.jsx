export default function TopBar({ title, campus, onCampusChange }) {
  const campuses = ['All', 'Calgary', 'Red Deer', 'Cold Lake', 'Edmonton', 'Vancouver']

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

      {onCampusChange && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Campus:</label>
          <select
            value={campus}
            onChange={(e) => onCampusChange(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {campuses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}
    </header>
  )
}
