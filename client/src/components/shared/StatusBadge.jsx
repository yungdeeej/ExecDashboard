export default function StatusBadge({ status }) {
  const styles = {
    employed: 'bg-green-100 text-green-800',
    seeking: 'bg-yellow-100 text-yellow-800',
    in_practicum: 'bg-blue-100 text-blue-800',
    unknown: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    skipped: 'bg-gray-100 text-gray-800',
  }

  const labels = {
    employed: 'Employed',
    seeking: 'Seeking',
    in_practicum: 'In Practicum',
    unknown: 'Unknown',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.unknown}`}>
      {labels[status] || status}
    </span>
  )
}
