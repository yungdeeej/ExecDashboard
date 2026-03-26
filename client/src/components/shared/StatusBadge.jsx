const styles = {
  employed: 'bg-rag-green/15 text-rag-green',
  seeking: 'bg-rag-amber/15 text-rag-amber',
  active: 'bg-accent/15 text-accent',
  completed: 'bg-rag-green/15 text-rag-green',
  pending: 'bg-dark-muted/20 text-dark-muted',
  in_practicum: 'bg-accent/15 text-accent',
  unknown: 'bg-dark-muted/20 text-dark-muted',
  critical: 'bg-rag-red/15 text-rag-red',
  warning: 'bg-rag-amber/15 text-rag-amber',
  info: 'bg-accent/15 text-accent',
  action: 'bg-purple-500/15 text-purple-400',
}

const labels = {
  employed: 'Employed',
  seeking: 'Seeking',
  active: 'Active',
  completed: 'Completed',
  pending: 'Pending',
  in_practicum: 'In Practicum',
  unknown: 'Unknown',
  critical: 'Critical',
  warning: 'Warning',
  info: 'Info',
  action: 'Action',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.unknown}`}>
      {labels[status] || status}
    </span>
  )
}
