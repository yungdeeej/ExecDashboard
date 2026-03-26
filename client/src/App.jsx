import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardShell from './components/layout/DashboardShell'
import ManagerLogin from './components/admin/ManagerLogin'
import Dashboard from './pages/Dashboard'
import Finance from './pages/Finance'
import Enrollment from './pages/Enrollment'
import Outcomes from './pages/Outcomes'
import Marketing from './pages/Marketing'
import AdminEntry from './pages/AdminEntry'
import { getMe, logout as logoutApi } from './lib/api'
import api from './lib/api'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token or cookie session
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <ManagerLogin onLogin={handleLogin} />
  }

  const canViewDashboard = ['dean', 'admin'].includes(user.role)
  const canAccessAdmin = ['enrollment_manager', 'outcomes_manager', 'admin'].includes(user.role)

  return (
    <DashboardShell user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={canViewDashboard ? <Dashboard /> : <Navigate to="/admin/entry" />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/enrollment" element={<Enrollment />} />
        <Route path="/outcomes" element={<Outcomes />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/admin/entry" element={canAccessAdmin ? <AdminEntry user={user} /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </DashboardShell>
  )
}
