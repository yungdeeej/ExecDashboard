import { NavLink } from 'react-router-dom'
import { LayoutDashboard, DollarSign, Users, Award, TrendingUp, UserCog, AlertTriangle, Settings, LogOut } from 'lucide-react'

const dashboardNav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/finance', label: 'Finance', icon: DollarSign },
  { to: '/dashboard/enrollment', label: 'Enrollment', icon: Users },
  { to: '/dashboard/outcomes', label: 'Outcomes', icon: Award },
  { to: '/dashboard/marketing', label: 'Marketing', icon: TrendingUp },
  { to: '/dashboard/staff', label: 'Staff & Ops', icon: UserCog },
  { to: '/dashboard/alerts', label: 'Alerts', icon: AlertTriangle },
]

export default function Sidebar({ user, onLogout, alertCount = 0 }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-dark-card border-r border-dark-border flex flex-col z-30">
      <div className="p-5 border-b border-dark-border">
        <h1 className="text-lg font-display font-bold text-dark-text">MCG Dashboard</h1>
        {user && <p className="text-xs text-dark-muted mt-1">{user.name}</p>}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 mb-2 text-[10px] font-semibold text-dark-muted uppercase tracking-widest">Modules</div>
        {dashboardNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors relative ${
                isActive
                  ? 'bg-accent/10 text-accent border-r-2 border-accent'
                  : 'text-dark-muted hover:bg-dark-hover hover:text-dark-text'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
            {item.label === 'Alerts' && alertCount > 0 && (
              <span className="absolute right-4 bg-rag-red text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-border space-y-2">
        <div className="text-xs text-dark-muted">{user?.role}</div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-xs text-dark-muted hover:text-dark-text transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
