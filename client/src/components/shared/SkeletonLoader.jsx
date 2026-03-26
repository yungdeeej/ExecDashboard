export default function SkeletonLoader({ count = 4, height = 'h-32' }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton rounded-xl ${height}`} />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return <div className="skeleton rounded-xl h-32" />
}

export function SkeletonChart() {
  return <div className="skeleton rounded-xl h-64 mt-6" />
}
