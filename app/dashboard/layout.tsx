'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/dashboard', label: 'AI Chat', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
  { href: '/dashboard/tasks', label: 'Tasks', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
  { href: '/dashboard/voice', label: 'Voice & Schedule', icon: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8' },
  { href: '/dashboard/meetings', label: 'Meetings', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setCollapsed(false)
      if (window.innerWidth < 1024 && window.innerWidth >= 768) setCollapsed(true)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const sidebarWidth = isMobile ? '280px' : collapsed ? '64px' : '220px'

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#05050f',fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#1e1e3a;border-radius:99px}
        .nav-link{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;color:#4a4870;text-decoration:none;font-size:14px;font-weight:400;border-left:2px solid transparent;transition:all 0.2s;white-space:nowrap}
        .nav-link:hover{background:rgba(255,255,255,0.04);color:#e2e0ff;border-left-color:rgba(124,111,255,0.3)}
        .nav-active{background:linear-gradient(135deg,rgba(99,82,255,0.18),rgba(139,92,246,0.08));color:#c4b8ff !important;border-left-color:#7c6fff !important;font-weight:500 !important}
        .sidebar{transition:width 0.3s ease,transform 0.3s ease}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:40;backdrop-filter:blur(2px)}
        .hamburger{display:none}
        @media(max-width:767px){
          .hamburger{display:flex;position:fixed;top:16px;left:16px;z-index:60;width:40px;height:40px;border-radius:10px;background:#08081a;border:1px solid rgba(255,255,255,0.08);align-items:center;justify-content:center;cursor:pointer}
          .main-content{padding-top:64px !important}
        }
        @media(min-width:768px) and (max-width:1023px){
          .nav-label{display:none}
        }
        @media(min-width:1280px){
          .sidebar{width:240px !important}
          .main-margin{margin-left:240px !important}
        }
      `}</style>

      {/* Mobile hamburger */}
      <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2">
          {mobileOpen
            ? <path d="M18 6L6 18M6 6l12 12"/>
            : <path d="M3 12h18M3 6h18M3 18h18"/>
          }
        </svg>
      </button>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div className="overlay" onClick={() => setMobileOpen(false)}/>
      )}

      {/* Sidebar */}
      <aside className="sidebar" style={{
        width: sidebarWidth,
        background:'#08081a',
        borderRight:'1px solid rgba(255,255,255,0.06)',
        display:'flex',
        flexDirection:'column',
        position:'fixed',
        height:'100vh',
        padding: collapsed && !isMobile ? '28px 8px' : '28px 14px',
        zIndex:50,
        overflow:'visible',
        transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
      }}>

        {/* Desktop toggle button */}
        {!isMobile && (
          <button onClick={() => setCollapsed(!collapsed)}
            style={{position:'absolute',top:'50%',right:'-12px',transform:'translateY(-50%)',width:'24px',height:'24px',borderRadius:'50%',background:'#1a1a2e',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',zIndex:100,transition:'all 0.2s'}}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4a4870" strokeWidth="2.5">
              {collapsed ? <path d="M9 18l6-6-6-6"/> : <path d="M15 18l-6-6 6-6"/>}
            </svg>
          </button>
        )}

        {/* Logo */}
        <div style={{padding:'0 4px 28px',overflow:'hidden'}}>
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
            {(!collapsed || isMobile) && (
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'16px',color:'#f0eeff',letterSpacing:'-0.3px',lineHeight:1}}>NovaMind</div>
                <div style={{fontSize:'9px',color:'#3a3860',letterSpacing:'0.12em',fontWeight:500,marginTop:'3px',textTransform:'uppercase'}}>Neural AI</div>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={{flex:1,display:'flex',flexDirection:'column',gap:'2px'}}>
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}
                className={`nav-link ${active ? 'nav-active' : ''}`}
                title={collapsed && !isMobile ? item.label : ''}
                style={{justifyContent: collapsed && !isMobile ? 'center' : 'flex-start', padding: collapsed && !isMobile ? '10px' : '10px 12px'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{flexShrink:0,opacity:active?1:0.5}}>
                  <path d={item.icon}/>
                </svg>
                {(!collapsed || isMobile) && <span className="nav-label">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Status */}
        <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:'16px',marginTop:'16px',display:'flex',alignItems:'center',gap:'8px',justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',padding:'16px 4px 0'}}>
          <div style={{width:'7px',height:'7px',borderRadius:'50%',background:'#34d399',boxShadow:'0 0 8px #34d399aa',flexShrink:0}}></div>
          {(!collapsed || isMobile) && <span style={{fontSize:'11.5px',color:'#4a4870'}}>Groq Active</span>}
        </div>
      </aside>

      {/* Main */}
      <main className="main-content main-margin" style={{
        flex:1,
        marginLeft: isMobile ? '0' : collapsed ? '64px' : '220px',
        minHeight:'100vh',
        overflowY:'auto',
        transition:'margin-left 0.3s ease',
        padding: isMobile ? '64px 0 0' : '0'
      }}>
        {children}
      </main>
    </div>
  )
}