'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard', label: 'AI Chat', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
  { href: '/dashboard/tasks', label: 'Tasks', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
  { href: '/dashboard/voice', label: 'Voice & Schedule', icon: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8' },
  { href: '/dashboard/meetings', label: 'Meetings', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#05050f',fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#1e1e3a;border-radius:99px}
        .nav-link{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;color:#4a4870;text-decoration:none;font-size:13.5px;font-weight:400;border-left:2px solid transparent;transition:all 0.2s}
        .nav-link:hover{background:rgba(255,255,255,0.04);color:#e2e0ff;border-left-color:rgba(124,111,255,0.3)}
        .nav-active{background:linear-gradient(135deg,rgba(99,82,255,0.18),rgba(139,92,246,0.08));color:#c4b8ff !important;border-left-color:#7c6fff !important;font-weight:500 !important}
      `}</style>

      <aside style={{width:'220px',background:'#08081a',borderRight:'1px solid rgba(255,255,255,0.06)',display:'flex',flexDirection:'column',position:'fixed',height:'100vh',padding:'28px 12px',zIndex:50}}>
        <div style={{padding:'0 8px 32px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'34px',height:'34px',flexShrink:0}}>
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop stopColor="#a78bfa"/><stop offset="1" stopColor="#6366f1"/></linearGradient>
                <linearGradient id="lg2" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop stopColor="#7c3aed"/><stop offset="1" stopColor="#4f46e5"/></linearGradient>
              </defs>
              <path d="M18 2L32 10V26L18 34L4 26V10L18 2Z" fill="url(#lg2)" opacity="0.9"/>
              <circle cx="18" cy="18" r="3.5" fill="url(#lg1)"/>
              <line x1="18" y1="8" x2="18" y2="14.5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="18" y1="21.5" x2="18" y2="28" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="9" y1="12.5" x2="14.5" y2="15.8" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="21.5" y1="20.2" x2="27" y2="23.5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="27" y1="12.5" x2="21.5" y2="15.8" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="14.5" y1="20.2" x2="9" y2="23.5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="18" cy="7.5" r="1.8" fill="#c4b5fd"/>
              <circle cx="27.5" cy="12.5" r="1.8" fill="#c4b5fd"/>
              <circle cx="27.5" cy="23.5" r="1.8" fill="#c4b5fd"/>
              <circle cx="18" cy="28.5" r="1.8" fill="#c4b5fd"/>
              <circle cx="8.5" cy="23.5" r="1.8" fill="#c4b5fd"/>
              <circle cx="8.5" cy="12.5" r="1.8" fill="#c4b5fd"/>
            </svg>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'16px',color:'#f0eeff',letterSpacing:'-0.3px',lineHeight:1}}>NovaMind</div>
              <div style={{fontSize:'9px',color:'#3a3860',letterSpacing:'0.12em',fontWeight:500,marginTop:'3px',textTransform:'uppercase'}}>Neural AI</div>
            </div>
          </div>
        </div>

        <nav style={{flex:1,display:'flex',flexDirection:'column',gap:'2px'}}>
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} className={`nav-link ${active ? 'nav-active' : ''}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{flexShrink:0,opacity:active?1:0.5}}>
                  <path d={item.icon}/>
                </svg>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:'16px',marginTop:'16px',padding:'16px 8px 0'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 4px'}}>
            <div style={{width:'7px',height:'7px',borderRadius:'50%',background:'#34d399',boxShadow:'0 0 8px #34d399aa',flexShrink:0}}></div>
            <span style={{fontSize:'11.5px',color:'#4a4870'}}>Groq Active</span>
          </div>
        </div>
      </aside>

      <main style={{flex:1,marginLeft:'220px',minHeight:'100vh',overflowY:'auto'}}>
        {children}
      </main>
    </div>
  )
}