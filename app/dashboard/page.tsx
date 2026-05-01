'use client'
import { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user'|'assistant'; content: string }

export default function Dashboard() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder|null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<any>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4'
        : 'audio/ogg'
      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm'
        const file = new File([blob], `audio.${ext}`, { type: mimeType })
        const form = new FormData()
        form.append('audio', file)
        const res = await fetch('/api/transcribe', { method: 'POST', body: form })
        const data = await res.json()
        if (data.text) setInput(data.text)
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } catch (e) {
      alert('Microphone access denied. Please allow microphone permission.')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    clearInterval(timerRef.current)
    setRecordingTime(0)
  }

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
    if (!res.body) { setStreaming(false); return }
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

  function formatTime(s: number) {
    return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
  }

  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',background:'#05050f'}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .msg-bubble{animation:fadeUp 0.3s ease}
        pre{background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px;overflow-x:auto;font-size:13px}
        code{font-family:'Fira Code',monospace;font-size:13px}
        p{margin:0 0 8px}p:last-child{margin:0}
        ul,ol{margin:8px 0;padding-left:20px}
        li{margin:4px 0}
        h1,h2,h3{margin:12px 0 6px;color:#e2e0ff}
        strong{color:#c4b5fd}
      `}</style>

      <div style={{padding:'20px 48px',borderBottom:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(8,8,26,0.9)',backdropFilter:'blur(20px)',position:'sticky',top:0,zIndex:10}}>
        <div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'20px',color:'#f0eeff',margin:0}}>AI Assistant</h1>
          <p style={{color:'#2a2850',fontSize:'12px',margin:'2px 0 0'}}>Groq · LLaMA 3.3 70B · Web Search</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.2)',borderRadius:'20px',padding:'6px 14px'}}>
          <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#34d399',boxShadow:'0 0 8px #34d399'}}></div>
          <span style={{fontSize:'12px',color:'#34d399',fontWeight:500}}>Groq Active</span>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'32px 48px',display:'flex',flexDirection:'column',gap:'20px'}}>
        {messages.length === 0 && (
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px',paddingTop:'80px'}}>
            <div style={{width:'64px',height:'64px',borderRadius:'18px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <div style={{textAlign:'center'}}>
              <p style={{color:'#f0eeff',fontSize:'16px',fontWeight:500,margin:'0 0 4px',fontFamily:"'Syne',sans-serif"}}>Start a conversation</p>
              <p style={{color:'#2a2850',fontSize:'13px',margin:0}}>Ask anything — weather, news, code, math, anything</p>
            </div>
            <div style={{display:'flex',gap:'10px',flexWrap:'wrap',justifyContent:'center',marginTop:'8px'}}>
              {["What's the weather in Mysuru?","Write a Python web scraper","Explain quantum computing","Latest cricket scores"].map(s => (
                <button key={s} onClick={() => setInput(s)}
                  style={{padding:'8px 14px',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.03)',color:'#4a4870',fontSize:'12px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all 0.2s'}}
                  onMouseOver={e => {(e.currentTarget as HTMLElement).style.borderColor='rgba(99,102,241,0.4)';(e.currentTarget as HTMLElement).style.color='#818cf8'}}
                  onMouseOut={e => {(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.08)';(e.currentTarget as HTMLElement).style.color='#4a4870'}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className="msg-bubble"
            style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',alignItems:'flex-end',gap:'10px'}}>
            {m.role==='assistant' && (
              <div style={{width:'28px',height:'28px',borderRadius:'8px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <span style={{color:'white',fontSize:'11px',fontWeight:700}}>N</span>
              </div>
            )}
            <div style={{
              maxWidth:'72%',padding:'14px 18px',
              borderRadius:m.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px',
              background:m.role==='user'?'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.15))':'rgba(255,255,255,0.04)',
              border:m.role==='user'?'1px solid rgba(99,102,241,0.3)':'1px solid rgba(255,255,255,0.06)',
              color:'#d4d0f0',fontSize:'14px',lineHeight:'1.75',fontFamily:"'DM Sans',sans-serif"
            }}>
              <div dangerouslySetInnerHTML={{__html: formatMessage(m.content)}}/>
              {m.role==='assistant' && m.content && !streaming && (
                <button onClick={() => speak(m.content)}
                  style={{marginTop:'10px',background:'none',border:'none',cursor:'pointer',color:'#2a2850',fontSize:'11px',padding:0,fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',gap:'4px'}}
                  onMouseOver={e => (e.currentTarget.style.color='#818cf8')}
                  onMouseOut={e => (e.currentTarget.style.color='#2a2850')}>
                  {isSpeaking ? '⏹ Stop' : '▶ Read aloud'}
                </button>
              )}
            </div>
          </div>
        ))}

        {streaming && (
          <div style={{display:'flex',alignItems:'center',gap:'6px',paddingLeft:'38px'}}>
            {[0,1,2].map(i => (
              <div key={i} style={{width:'6px',height:'6px',borderRadius:'50%',background:'#4a4870',animation:'pulse 1.2s ease infinite',animationDelay:`${i*0.2}s`}}></div>
            ))}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div style={{padding:'16px 48px 28px',background:'rgba(8,8,26,0.9)',backdropFilter:'blur(20px)',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        {isRecording && (
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px',padding:'8px 14px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',width:'fit-content'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#ef4444',animation:'pulse 1s ease infinite'}}></div>
            <span style={{color:'#f87171',fontSize:'12px',fontFamily:"'DM Sans',sans-serif"}}>Recording {formatTime(recordingTime)} — tap stop when done</span>
          </div>
        )}
        <div style={{display:'flex',gap:'10px',alignItems:'flex-end',background:'rgba(255,255,255,0.03)',borderRadius:'16px',border:'1px solid rgba(255,255,255,0.08)',padding:'10px 10px 10px 18px'}}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
            placeholder="Ask anything..."
            rows={1}
            style={{flex:1,background:'none',border:'none',outline:'none',color:'#d4d0f0',fontSize:'14px',fontFamily:"'DM Sans',sans-serif",resize:'none',lineHeight:'1.6',padding:'4px 0',maxHeight:'140px'}}
          />
          <div style={{display:'flex',gap:'6px',flexShrink:0}}>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{width:'38px',height:'38px',borderRadius:'10px',border:'none',cursor:'pointer',
                background: isRecording ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                color: isRecording ? '#f87171' : '#4a4870',
                display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'}}
              onMouseOver={e => {if(!isRecording){(e.currentTarget as HTMLElement).style.background='rgba(99,102,241,0.15)';(e.currentTarget as HTMLElement).style.color='#818cf8'}}}
              onMouseOut={e => {if(!isRecording){(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.05)';(e.currentTarget as HTMLElement).style.color='#4a4870'}}}>
              {isRecording
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>
              }
            </button>
            <button onClick={send} disabled={!input.trim()||streaming}
              style={{width:'38px',height:'38px',borderRadius:'10px',border:'none',
                cursor:input.trim()&&!streaming?'pointer':'not-allowed',
                background:input.trim()&&!streaming?'linear-gradient(135deg,#6366f1,#8b5cf6)':'rgba(255,255,255,0.04)',
                color:input.trim()&&!streaming?'#fff':'#2a2850',
                display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s',
                boxShadow:input.trim()&&!streaming?'0 4px 16px rgba(99,102,241,0.3)':'none'}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
        <p style={{textAlign:'center',color:'#1a1835',fontSize:'11px',margin:'10px 0 0'}}>NovaMind · Groq LLaMA 3.3 70B · Whisper Voice</p>
      </div>
    </div>
  )
}

function formatMessage(text: string): string {
  return text
    .replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(99,102,241,0.15);padding:2px 6px;border-radius:4px;font-size:12px">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
}