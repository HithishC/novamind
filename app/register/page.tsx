'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Registration failed')
      setLoading(false)
    } else {
      router.push('/login')
    }
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
          <p style={{color:'#4a4870',fontSize:'13px',margin:0}}>Create your AI workspace</p>
        </div>

        <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'32px',display:'flex',flexDirection:'column',gap:'16px'}}>
          {error && (
            <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',padding:'10px 14px'}}>
              <p style={{color:'#f87171',fontSize:'13px',margin:0}}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="Full name"
              style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'12px 16px',color:'#e2e0ff',fontSize:'14px',transition:'border-color 0.2s'}}
              onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.5)'}
              onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}
            />
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
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p style={{textAlign:'center',color:'#2a2850',fontSize:'13px',margin:0}}>
            Already have an account?{' '}
            <a href="/login" style={{color:'#818cf8',textDecoration:'none'}}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  )
}