import { useState } from 'react'
import { AlertTriangle, CheckCircle, Info, Zap, X } from 'lucide-react'
import StatusBadge from '../shared/StatusBadge'
import SkeletonLoader from '../shared/SkeletonLoader'
import useModuleData from '../../hooks/useModuleData'
import { getAlerts, dismissAlert } from '../../lib/api'

const iconMap = {
  critical: <AlertTriangle className="w-4 h-4 text-rag-red" />,
  warning: <AlertTriangle className="w-4 h-4 text-rag-amber" />,
  info: <Info className="w-4 h-4 text-accent" />,
  action: <Zap className="w-4 h-4 text-purple-400" />,
}

export default function AlertsModule() {
  const [showDismissed, setShowDismissed] = useState(false)
  const { data: alerts, loading, refetch } = useModuleData(() => getAlerts(showDismissed), [showDismissed])
  const [dismissing, setDismissing] = useState(null)

  const handleDismiss = async (id) => {
    setDismissing(id)
    try {
      await dismissAlert(id, { note: 'Acknowledged' })
      refetch()
    } catch (err) {
      console.error('Dismiss failed:', err)
    } finally {
      setDismissing(null)
    }
  }

  if (loading) return <SkeletonLoader count={4} height="h-16" />

  const activeAlerts = alerts?.filter(a => !a.dismissed) || []
  const dismissedAlerts = alerts?.filter(a => a.dismissed) || []

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowDismissed(false)}
          className={`text-sm font-medium pb-1 border-b-2 transition-colors ${!showDismissed ? 'border-accent text-accent' : 'border-transparent text-dark-muted hover:text-dark-text'}`}
        >
          Active ({activeAlerts.length})
        </button>
        <button
          onClick={() => setShowDismissed(true)}
          className={`text-sm font-medium pb-1 border-b-2 transition-colors ${showDismissed ? 'border-accent text-accent' : 'border-transparent text-dark-muted hover:text-dark-text'}`}
        >
          Dismissed
        </button>
      </div>

      {!showDismissed && activeAlerts.length === 0 && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center">
          <CheckCircle className="w-10 h-10 text-rag-green mx-auto mb-3" />
          <p className="text-dark-text font-medium">All clear</p>
          <p className="text-sm text-dark-muted mt-1">No active alerts at this time</p>
        </div>
      )}

      <div className="space-y-3">
        {(showDismissed ? dismissedAlerts : activeAlerts).map((alert) => (
          <div key={alert.id} className={`bg-dark-card border border-dark-border rounded-xl p-4 flex items-start gap-3 ${alert.dismissed ? 'opacity-60' : ''}`}>
            {iconMap[alert.alert_type] || iconMap.info}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={alert.alert_type} />
                {alert.module && <span className="text-xs text-dark-muted capitalize">{alert.module}</span>}
                {alert.campus && <span className="text-xs text-dark-muted">· {alert.campus}</span>}
              </div>
              <p className="text-sm text-dark-text">{alert.message}</p>
              {alert.actual_value != null && alert.target_value != null && (
                <p className="text-xs text-dark-muted mt-1">
                  Actual: {alert.actual_value} | Target: {alert.target_value}
                </p>
              )}
              <p className="text-xs text-dark-muted mt-1">
                {new Date(alert.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
            {!alert.dismissed && (
              <button
                onClick={() => handleDismiss(alert.id)}
                disabled={dismissing === alert.id}
                className="text-dark-muted hover:text-dark-text transition-colors p-1"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
