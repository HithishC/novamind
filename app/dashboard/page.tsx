'use client'
import { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user'|'assistant'; content: string }

export default function Dashboard() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages])

  async function send() {
    if (!input.trim() || streaming) return
    const userMsg: Msg = { role:'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setStreaming(true)
    const history = messages.map(m => ({role:m.role,content:m.content}))
    const res = await fetch('/api/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({message: input, history})
    })
    if (!res.body) return
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let text = ''
    setMessages(prev => [...prev, {role:'assistant',content:''}])
    while (true) {
      const {done,value} = await reader.read()
      if (done) break
      text += decoder.decode(value)
      setMessages(prev => [...prev.slice(0,-1), {role:'assistant',content:text}])
    }
    setStreaming(false)
  }

  function speak(text: string) {
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.onstart = () => setIsSpeaking(true)
    utt.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utt)
  }

  function startVoiceInput() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.onresult = (e: any) => setInput(e.results[0][0].transcript)
    r.start()
  }

  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',background:'#05050f',padding:'0'}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .msg-user{animation:fadeUp 0.3s ease}
        .msg-ai{animation:fadeUp 0.3s ease}
      `}</style>

      {/* Top bar */}
      <div style={{padding:'20px 48px',borderBottom:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(8,8,26,0.8)',backdropFilter:'blur(20px)',position:'sticky',top:0,zIndex:10}}>
        <div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'20px',color:'#f0eeff',margin:0,letterSpacing:'-0.3px'}}>AI Assistant</h1>
          <p style={{color:'#2a2850',fontSize:'12px',margin:0,marginTop:'2px'}}>Powered by Groq · LLaMA 3 70B</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.2)',borderRadius:'20px',padding:'6px 14px'}}>
          <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#34d399',boxShadow:'0 0 8px #34d399'}}></div>
          <span style={{fontSize:'12px',color:'#34d399',fontWeight:500,fontFamily:"'DM Sans',sans-serif"}}>Groq Active</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'32px 48px',display:'flex',flexDirection:'column',gap:'20px'}}>
        {messages.length === 0 && (
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px',opacity:0.5}}>
            <div style={{width:'64px',height:'64px',borderRadius:'18px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <div style={{textAlign:'center'}}>
              <p style={{color:'#f0eeff',fontSize:'16px',fontWeight:500,margin:'0 0 4px',fontFamily:"'Syne',sans-serif"}}>Start a conversation</p>
              <p style={{color:'#2a2850',fontSize:'13px',margin:0}}>Ask NovaMind anything</p>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role==='user' ? 'msg-user' : 'msg-ai'}
            style={{display:'flex',justifyContent: m.role==='user' ? 'flex-end' : 'flex-start',alignItems:'flex-end',gap:'10px'}}>
            {m.role==='assistant' && (
              <div style={{width:'28px',height:'28px',borderRadius:'8px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginBottom:'2px'}}>
                <span style={{color:'white',fontSize:'11px',fontWeight:700}}>N</span>
              </div>
            )}
            <div style={{
              maxWidth:'68%',padding:'12px 16px',borderRadius: m.role==='user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: m.role==='user' ? 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.15))' : 'rgba(255,255,255,0.04)',
              border: m.role==='user' ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.06)',
              color: '#d4d0f0', fontSize:'14px', lineHeight:'1.7',
              fontFamily:"'DM Sans',sans-serif"
            }}>
              {m.content}
              {m.role==='assistant' && m.content && !streaming && (
                <button onClick={() => speak(m.content)}
                  style={{display:'block',marginTop:'8px',background:'none',border:'none',cursor:'pointer',color:'#4a4870',fontSize:'11px',padding:'0',fontFamily:"'DM Sans',sans-serif",transition:'color 0.2s'}}
                  onMouseOver={e => (e.currentTarget.style.color='#818cf8')}
                  onMouseOut={e => (e.currentTarget.style.color='#4a4870')}>
                  {isSpeaking ? '⏹ Stop' : '▶ Read aloud'}
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{padding:'16px 48px 28px',background:'rgba(8,8,26,0.8)',backdropFilter:'blur(20px)',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{display:'flex',gap:'10px',alignItems:'flex-end',maxWidth:'100%',background:'rgba(255,255,255,0.03)',borderRadius:'16px',border:'1px solid rgba(255,255,255,0.08)',padding:'10px 10px 10px 18px',transition:'border-color 0.2s'}}
          onFocus={e => (e.currentTarget.style.borderColor='rgba(99,102,241,0.4)')}
          onBlur={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.08)')}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
            placeholder="Message NovaMind..."
            rows={1}
            style={{flex:1,background:'none',border:'none',outline:'none',color:'#d4d0f0',fontSize:'14px',fontFamily:"'DM Sans',sans-serif",resize:'none',lineHeight:'1.6',padding:'4px 0',maxHeight:'120px'}}
          />
          <div style={{display:'flex',gap:'6px',flexShrink:0}}>
            <button onClick={startVoiceInput}
              style={{width:'36px',height:'36px',borderRadius:'10px',border:'none',cursor:'pointer',background:'rgba(255,255,255,0.05)',color:'#4a4870',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'}}
              onMouseOver={e => {(e.currentTarget as HTMLElement).style.background='rgba(99,102,241,0.15)';(e.currentTarget as HTMLElement).style.color='#818cf8'}}
              onMouseOut={e => {(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.05)';(e.currentTarget as HTMLElement).style.color='#4a4870'}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
            </button>
            <button onClick={send} disabled={!input.trim()||streaming}
              style={{width:'36px',height:'36px',borderRadius:'10px',border:'none',cursor: input.trim()&&!streaming ? 'pointer' : 'not-allowed',
                background: input.trim()&&!streaming ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.04)',
                color: input.trim()&&!streaming ? '#fff' : '#2a2850',
                display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s',
                boxShadow: input.trim()&&!streaming ? '0 4px 16px rgba(99,102,241,0.3)' : 'none'}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
        <p style={{textAlign:'center',color:'#1e1c38',fontSize:'11px',margin:'10px 0 0',fontFamily:"'DM Sans',sans-serif"}}>NovaMind can make mistakes · Groq LLaMA 3 70B</p>
      </div>
    </div>
  )
}