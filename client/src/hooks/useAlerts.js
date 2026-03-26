import { useState, useEffect } from 'react'
import { getAlerts } from '../lib/api'

export default function useAlerts() {
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await getAlerts(false)
        const active = res.data.data?.filter(a => !a.dismissed) || []
        setAlertCount(active.length)
      } catch {
        // Ignore errors
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  return alertCount
}
