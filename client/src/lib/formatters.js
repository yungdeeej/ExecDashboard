/**
 * Format currency with abbreviation: $1.2M, $450K, $3,200
 */
export function fmtCurrency(n) {
  if (n == null || isNaN(n)) return '$0'
  const num = Number(n)
  if (Math.abs(num) >= 1_000_000) return '$' + (num / 1_000_000).toFixed(1) + 'M'
  if (Math.abs(num) >= 10_000) return '$' + Math.round(num / 1_000) + 'K'
  return '$' + num.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

/**
 * Format percentage without decimals: 82%
 */
export function fmtPct(n) {
  if (n == null || isNaN(n)) return '0%'
  return Math.round(Number(n)) + '%'
}

/**
 * Format a number with commas: 1,234
 */
export function fmtNum(n) {
  if (n == null || isNaN(n)) return '0'
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

/**
 * Determine RAG status based on actual vs target
 * Returns 'green' | 'amber' | 'red'
 */
export function ragStatus(actual, target, higherIsBetter = true) {
  if (target == null || actual == null) return 'green'
  const ratio = actual / target
  if (higherIsBetter) {
    if (ratio >= 0.9) return 'green'
    if (ratio >= 0.8) return 'amber'
    return 'red'
  } else {
    // Lower is better (e.g. CPL)
    if (ratio <= 1.1) return 'green'
    if (ratio <= 1.2) return 'amber'
    return 'red'
  }
}

/**
 * Format relative time: "2 hours ago", "just now"
 */
export function timeAgo(timestamp) {
  if (!timestamp) return 'N/A'
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}d ago`
}
