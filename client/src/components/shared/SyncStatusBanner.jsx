import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { timeAgo } from '../../lib/formatters'

export default function SyncStatusBanner({ timestamp, source, status = 'success' }) {
  if (!timestamp) return null

  const isError = status === 'error'

  return (
    <div className={`flex items-center gap-2 text-xs mt-4 pt-3 border-t border-dark-border ${isError ? 'text-rag-amber' : 'text-dark-muted'}`}>
      {isError ? (
        <AlertCircle className="w-3.5 h-3.5" />
      ) : (
        <CheckCircle className="w-3.5 h-3.5" />
      )}
      <span>
        {source && `${source} · `}
        {isError ? 'Sync failed — showing cached data from ' : 'Last synced '}
        {timeAgo(timestamp)}
      </span>
    </div>
  )
}
