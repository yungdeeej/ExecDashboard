export default function LastUpdatedBanner({ timestamp, updatedBy }) {
  if (!timestamp) return null

  const date = new Date(timestamp)
  const formatted = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <div className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
      Last updated {updatedBy ? `by ${updatedBy} ` : ''}at {formatted}
    </div>
  )
}
