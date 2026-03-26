const styles = {
  green: 'bg-rag-green/15 text-rag-green border-rag-green/30',
  amber: 'bg-rag-amber/15 text-rag-amber border-rag-amber/30',
  red: 'bg-rag-red/15 text-rag-red border-rag-red/30',
}

const labels = {
  green: 'On Track',
  amber: 'Watch',
  red: 'Behind',
}

export default function RAGBadge({ status, label }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.green}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'green' ? 'bg-rag-green' : status === 'amber' ? 'bg-rag-amber' : 'bg-rag-red'}`} />
      {label || labels[status] || 'On Track'}
    </span>
  )
}
