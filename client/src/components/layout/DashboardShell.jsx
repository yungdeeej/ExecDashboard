import Sidebar from './Sidebar'

export default function DashboardShell({ user, onLogout, alertCount, children }) {
  return (
    <div className="min-h-screen bg-dark-base">
      <Sidebar user={user} onLogout={onLogout} alertCount={alertCount} />
      <main className="ml-60">
        {children}
      </main>
    </div>
  )
}
