export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <aside className="w-56 bg-[#0d0d1a] border-r border-[#1a1a2e] flex flex-col p-5 fixed h-full">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">N</div>
            <span className="text-white font-bold text-lg tracking-tight">NovaMind</span>
          </div>
          <p className="text-[#4a4a6a] text-xs ml-11">AI Voice Assistant</p>
        </div>
        <nav className="space-y-1 flex-1">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8888aa] hover:bg-[#1a1a2e] hover:text-white transition">
            <span className="text-base">🏠</span>
            <span className="text-sm font-medium">Dashboard</span>
          </a>
          <a href="/dashboard/tasks" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8888aa] hover:bg-[#1a1a2e] hover:text-white transition">
            <span className="text-base">✅</span>
            <span className="text-sm font-medium">Tasks</span>
          </a>
          <a href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8888aa] hover:bg-[#1a1a2e] hover:text-white transition">
            <span className="text-base">⚙️</span>
            <span className="text-sm font-medium">Settings</span>
          </a>
        </nav>
        <div className="border-t border-[#1a1a2e] pt-4">
          <a href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#ff4466] hover:bg-[#1a1a2e] transition text-sm font-medium">
            <span>🚪</span> Sign out
          </a>
        </div>
      </aside>
      <main className="flex-1 ml-56 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
