import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import DashboardShell from './components/layout/DashboardShell'
import EntryShell from './components/entry/EntryShell'
import Login from './pages/Login'
import Overview from './pages/dashboard/Overview'
import Finance from './pages/dashboard/Finance'
import Enrollment from './pages/dashboard/Enrollment'
import Outcomes from './pages/dashboard/Outcomes'
import Marketing from './pages/dashboard/Marketing'
import Staff from './pages/dashboard/Staff'
import Alerts from './pages/dashboard/Alerts'
import EnrollmentEntry from './pages/entry/EnrollmentEntry'
import OutcomesEntry from './pages/entry/OutcomesEntry'
import StaffEntry from './pages/entry/StaffEntry'
import useAlerts from './hooks/useAlerts'
import { getMe, logout as logoutApi } from './lib/api'
import api from './lib/api'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const alertCount = useAlerts()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  const handleLogout = async () => {
    await logoutApi()
    setUser(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-base">
        <div className="text-dark-muted">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  const isDean = user.role === 'dean' || user.role === 'admin'
  const isManager = user.role.includes('_manager')

  // Manager portal (light mode, separate UI)
  if (isManager && !isDean) {
    return (
      <EntryShell user={user} onLogout={handleLogout}>
        <Routes>
          {user.role === 'enrollment_manager' && (
            <Route path="/entry/enrollment" element={<EnrollmentEntry user={user} />} />
          )}
          {user.role === 'outcomes_manager' && (
            <Route path="/entry/outcomes" element={<OutcomesEntry />} />
          )}
          {user.role === 'finance_manager' && (
            <Route path="/entry/finance" element={<div className="text-gray-500 text-center py-8">Finance entry coming soon</div>} />
          )}
          <Route path="*" element={
            <Navigate to={
              user.role === 'enrollment_manager' ? '/entry/enrollment' :
              user.role === 'outcomes_manager' ? '/entry/outcomes' :
              '/entry/finance'
            } />
          } />
        </Routes>
      </EntryShell>
    )
  }

  // Dean / Admin dashboard (dark mode)
  return (
    <DashboardShell user={user} onLogout={handleLogout} alertCount={alertCount}>
      <Routes>
        <Route path="/dashboard" element={<Overview user={user} />} />
        <Route path="/dashboard/finance" element={<Finance />} />
        <Route path="/dashboard/enrollment" element={<Enrollment />} />
        <Route path="/dashboard/outcomes" element={<Outcomes />} />
        <Route path="/dashboard/marketing" element={<Marketing />} />
        <Route path="/dashboard/staff" element={<Staff />} />
        <Route path="/dashboard/alerts" element={<Alerts />} />
        {/* Admin also gets entry routes */}
        {user.role === 'admin' && (
          <>
            <Route path="/entry/enrollment" element={<EnrollmentEntry user={user} />} />
            <Route path="/entry/outcomes" element={<OutcomesEntry />} />
            <Route path="/entry/staff" element={<StaffEntry />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </DashboardShell>
  )
}
