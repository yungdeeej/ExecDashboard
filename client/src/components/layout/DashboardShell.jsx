import Sidebar from './Sidebar'

export default function DashboardShell({ user, onLogout, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="ml-64">
        {children}
      </main>
    </div>
  )
}
