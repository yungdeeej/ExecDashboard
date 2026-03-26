import { RefreshCw, Bell } from 'lucide-react'
import { timeAgo } from '../../lib/formatters'

const campuses = ['All', 'Calgary', 'Red Deer', 'Cold Lake', 'Edmonton']

export default function TopBar({ title, campus, onCampusChange, syncTime, alertCount = 0, onAlertsClick }) {
  return (
    <header className="bg-dark-card border-b border-dark-border px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-display font-bold text-dark-text">{title}</h2>

      <div className="flex items-center gap-4">
        {syncTime && (
          <div className="flex items-center gap-1.5 text-xs text-dark-muted">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Last sync: {timeAgo(syncTime)}</span>
          </div>
        )}

        {onCampusChange && (
          <select
            value={campus}
            onChange={(e) => onCampusChange(e.target.value)}
            className="text-sm bg-dark-hover border border-dark-border text-dark-text rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {campuses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {onAlertsClick && (
          <button onClick={onAlertsClick} className="relative text-dark-muted hover:text-dark-text transition-colors">
            <Bell className="w-5 h-5" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rag-red text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  )
}
