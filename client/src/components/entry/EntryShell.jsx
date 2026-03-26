import { LogOut } from 'lucide-react'

export default function EntryShell({ user, onLogout, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">MCG Data Entry Portal</h1>
          <p className="text-xs text-gray-500">{user?.name} · {user?.campus} Campus</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </header>
      <main className="max-w-2xl mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  )
}
