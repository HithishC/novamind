'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleGoogle() {
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div style={{minHeight:'100vh',background:'#05050f',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box}
        input{outline:none;font-family:'DM Sans',sans-serif}
        input::placeholder{color:#2a2850}
      `}</style>
      <div style={{width:'100%',maxWidth:'400px'}}>
        <div style={{textAlign:'center',marginBottom:'40px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginBottom:'8px'}}>
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'36px',height:'36px'}}>
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
            <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'22px',color:'#f0eeff'}}>NovaMind</span>
          </div>
          <p style={{color:'#4a4870',fontSize:'13px',margin:0}}>Sign in to your AI workspace</p>
        </div>

        <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'32px',display:'flex',flexDirection:'column',gap:'16px'}}>
          {error && (
            <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',padding:'10px 14px'}}>
              <p style={{color:'#f87171',fontSize:'13px',margin:0}}>{error}</p>
            </div>
          )}

          <button onClick={handleGoogle}
            style={{width:'100%',padding:'12px',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',background:'rgba(255,255,255,0.04)',color:'#e2e0ff',fontSize:'14px',fontWeight:500,display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',transition:'all 0.2s'}}
            onMouseOver={e => (e.currentTarget.style.background='rgba(255,255,255,0.08)')}
            onMouseOut={e => (e.currentTarget.style.background='rgba(255,255,255,0.04)')}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.06)'}}/>
            <span style={{color:'#2a2850',fontSize:'12px'}}>or</span>
            <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.06)'}}/>
          </div>

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="Email address"
              style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'12px 16px',color:'#e2e0ff',fontSize:'14px',transition:'border-color 0.2s'}}
              onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.5)'}
              onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}
            />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="Password"
              style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'12px 16px',color:'#e2e0ff',fontSize:'14px',transition:'border-color 0.2s'}}
              onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.5)'}
              onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}
            />
            <button type="submit" disabled={loading}
              style={{width:'100%',padding:'12px',borderRadius:'12px',border:'none',cursor:loading?'not-allowed':'pointer',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontSize:'14px',fontWeight:600,boxShadow:'0 4px 24px rgba(99,102,241,0.3)',transition:'all 0.2s',opacity:loading?0.7:1}}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={{textAlign:'center',color:'#2a2850',fontSize:'13px',margin:0}}>
            No account?{' '}
            <a href="/register" style={{color:'#818cf8',textDecoration:'none'}}>Create one</a>
          </p>
        </div>
      </div>
    </div>
  )
}