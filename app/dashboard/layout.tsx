'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
  ), label: 'Overview' },
  { href: '/dashboard/tasks', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
  ), label: 'Tasks' },
  { href: '/dashboard/voice', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>
  ), label: 'Voice & Schedule' },
  { href: '/dashboard/meetings', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
  ), label: 'Meetings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen flex" style={{background:'#05050f',fontFamily:"'DM Sans', system-ui, sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#1e1e3a;border-radius:99px}
        * { box-sizing: border-box; }
        @keyframes pulse-ring {
          0%{transform:scale(1);opacity:0.6}
          100%{transform:scale(1.5);opacity:0}
        }
        @keyframes shimmer {
          0%{background-position:-200% center}
          100%{background-position:200% center}
        }
        .nav-active {
          background: linear-gradient(135deg, rgba(99,82,255,0.18), rgba(139,92,246,0.08));
          border-left: 2px solid #7c6fff;
          color: #c4b8ff !important;
        }
        .nav-item {
          border-left: 2px solid transparent;
          transition: all 0.2s ease;
        }
        .nav-item:hover {
          background: rgba(255,255,255,0.04);
          color: #e2e0ff !important;
          border-left: 2px solid rgba(124,111,255,0.3);
        }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width:'220px', background:'#08081a',
        borderRight:'1px solid rgba(255,255,255,0.06)',
        display:'flex', flexDirection:'column',
        position:'fixed', height:'100vh', zIndex:50,
        padding:'28px 0'
      }}>
        {/* Logo */}
        <div style={{padding:'0 20px 32px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{position:'relative',width:'36px',height:'36px'}}>
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'36px',height:'36px'}}>
                <defs>
                  <linearGradient id="lg1" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#a78bfa"/>
                    <stop offset="1" stopColor="#6366f1"/>
                  </linearGradient>
                  <linearGradient id="lg2" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7c3aed"/>
                    <stop offset="1" stopColor="#4f46e5"/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="1.5" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                {/* Hexagon base */}
                <path d="M18 2L32 10V26L18 34L4 26V10L18 2Z" fill="url(#lg2)" opacity="0.9"/>
                {/* Inner neural symbol */}
                <circle cx="18" cy="18" r="3.5" fill="url(#lg1)" filter="url(#glow)"/>
                <line x1="18" y1="8" x2="18" y2="14.5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="18" y1="21.5" x2="18" y2="28" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="9" y1="12.5" x2="14.5" y2="15.8" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="21.5" y1="20.2" x2="27" y2="23.5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="27" y1="12.5" x2="21.5" y2="15.8" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="14.5" y1="20.2" x2="9" y2="23.5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
                {/* Dots at nodes */}
                <circle cx="18" cy="7.5" r="1.8" fill="#c4b5fd"/>
                <circle cx="27.5" cy="12.5" r="1.8" fill="#c4b5fd"/>
                <circle cx="27.5" cy="23.5" r="1.8" fill="#c4b5fd"/>
                <circle cx="18" cy="28.5" r="1.8" fill="#c4b5fd"/>
                <circle cx="8.5" cy="23.5" r="1.8" fill="#c4b5fd"/>
                <circle cx="8.5" cy="12.5" r="1.8" fill="#c4b5fd"/>
              </svg>
            </div>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'17px',color:'#f0eeff',letterSpacing:'-0.3px',lineHeight:1}}>NovaMind</div>
              <div style={{fontSize:'9px',color:'#4a4870',letterSpacing:'0.12em',fontWeight:500,marginTop:'2px',textTransform:'uppercase'}}>Neural AI</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:'0 12px',display:'flex',flexDirection:'column',gap:'2px'}}>
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}
                className={`nav-item ${active ? 'nav-active' : ''}`}
                style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',borderRadius:'10px',color: active ? '#c4b8ff' : '#4a4870',textDecoration:'none',fontSize:'13.5px',fontWeight: active ? 500 : 400}}>
                <span style={{opacity: active ? 1 : 0.6}}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom status */}
        <div style={{padding:'0 20px',borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:'16px',marginTop:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'7px',height:'7px',borderRadius:'50%',background:'#34d399',boxShadow:'0 0 8px #34d399aa'}}></div>
            <span style={{fontSize:'11.5px',color:'#4a4870',fontWeight:400}}>Groq — Active</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,marginLeft:'220px',minHeight:'100vh',overflowY:'auto'}}>
        {children}
      </main>
    </div>
  )
}