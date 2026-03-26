import RAGBadge from './RAGBadge'
import SparklineChart from './SparklineChart'

export default function KPICard({ title, value, subtitle, target, gap, rag, sparkData, sparkKey, sparkColor }) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5 fade-in hover:border-accent/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-dark-muted uppercase tracking-wider">{title}</span>
        {rag && <RAGBadge status={rag} />}
      </div>
      <div className="text-2xl font-bold font-display text-dark-text">{value}</div>
      {subtitle && <div className="text-xs text-dark-muted mt-1">{subtitle}</div>}
      {target != null && (
        <div className="text-xs text-dark-muted mt-1">
          Target: {target}{gap != null && <span className="text-rag-amber"> | Gap: {gap}</span>}
        </div>
      )}
      {sparkData && sparkKey && (
        <div className="mt-3">
          <SparklineChart data={sparkData} dataKey={sparkKey} color={sparkColor || '#3B82F6'} />
        </div>
      )}
    </div>
  )
}
