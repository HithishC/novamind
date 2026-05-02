'use client'
import { useState, useRef } from 'react'

type Task = { title: string; description?: string; dueDate?: string }

export default function VoicePage() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [mode, setMode] = useState<'task'|'schedule'>('task')
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder|null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<any>(null)

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/ogg'
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
        if (data.text) setTranscript(data.text)
      }
      recorder.start(250)
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } catch {
      alert('Microphone access denied.')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    clearInterval(timerRef.current)
  }

  function formatTime(s: number) {
    return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
  }

  async function processVoice() {
    if (!transcript.trim()) return
    setLoading(true)
    setDone(false)
    if (mode === 'task') {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: transcript, source: 'VOICE' })
      })
      const t = await res.json()
      setTasks([{ title: t.title, description: t.description }])
    } else {
      const res = await fetch('/api/schedule-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      })
      const data = await res.json()
      setTasks(data.tasks || [])
    }
    setLoading(false)
    setDone(true)
  }

  return (
    <div style={{minHeight:'100vh',padding:'clamp(24px,5vw,48px) clamp(16px,5vw,52px)',background:'#05050f'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        @keyframes wave{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .vbar{width:3px;border-radius:99px;background:linear-gradient(to top,#6366f1,#a78bfa);transform-origin:bottom}
        .vbar.active{animation:wave 1s ease-in-out infinite}
        .voice-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:1000px}
        @media(max-width:767px){.voice-grid{grid-template-columns:1fr!important}}
        input,textarea{outline:none;font-family:'DM Sans',sans-serif}
        input::placeholder,textarea::placeholder{color:#2a2850}
      `}</style>

      {/* Header */}
      <div style={{marginBottom:'clamp(24px,4vw,40px)',maxWidth:'1000px'}}>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'clamp(20px,4vw,26px)',color:'#f0eeff',margin:'0 0 4px',letterSpacing:'-0.5px'}}>Voice & Schedule</h1>
        <p style={{color:'#4a4870',fontSize:'clamp(12px,2vw,13px)',margin:0}}>Speak to create tasks or schedule your day</p>
      </div>

      {/* Mode toggle */}
      <div style={{display:'flex',gap:'6px',marginBottom:'clamp(20px,4vw,32px)',background:'rgba(255,255,255,0.03)',borderRadius:'12px',padding:'5px',width:'fit-content',border:'1px solid rgba(255,255,255,0.06)'}}>
        {(['task','schedule'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding:'8px clamp(14px,3vw,20px)',borderRadius:'8px',border:'none',cursor:'pointer',
            fontSize:'clamp(12px,2vw,13px)',fontWeight:500,fontFamily:"'DM Sans',sans-serif",transition:'all 0.2s',
            background:mode===m?'rgba(99,102,241,0.2)':'transparent',
            color:mode===m?'#c4b5fd':'#4a4870',
            boxShadow:mode===m?'inset 0 0 0 1px rgba(99,102,241,0.3)':'none'
          }}>
            {m==='task'?'Quick Task':'Smart Schedule'}
          </button>
        ))}
      </div>

      {/* Two-column grid (stacks on mobile) */}
      <div className="voice-grid">

        {/* Left: Recorder */}
        <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'clamp(20px,4vw,32px)',display:'flex',flexDirection:'column',gap:'16px'}}>

          {/* Waveform */}
          <div style={{height:'clamp(60px,10vw,80px)',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px',background:'rgba(0,0,0,0.2)',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.04)',overflow:'hidden'}}>
            {[...Array(24)].map((_,i) => (
              <div key={i} className={`vbar ${isRecording?'active':''}`}
                style={{height:isRecording?'40px':'6px',animationDelay:`${i*0.04}s`,opacity:isRecording?1:0.15,transition:'height 0.3s ease'}}/>
            ))}
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 14px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px'}}>
              <div style={{width:'7px',height:'7px',borderRadius:'50%',background:'#ef4444',animation:'pulse 1s ease infinite',flexShrink:0}}/>
              <span style={{color:'#f87171',fontSize:'13px'}}>Recording {formatTime(recordingTime)}</span>
            </div>
          )}

          {/* Transcript box */}
          <div style={{position:'relative'}}>
            <div style={{minHeight:'80px',background:'rgba(0,0,0,0.2)',borderRadius:'14px',padding:'14px 40px 14px 14px',border:'1px solid rgba(255,255,255,0.04)'}}>
              <p style={{color:transcript?'#c4c0e8':'#2a2850',fontSize:'clamp(13px,2vw,14px)',lineHeight:'1.7',margin:0,fontStyle:transcript?'normal':'italic'}}>
                {transcript||(mode==='task'?'Say the task name...':'Describe your schedule...')}
              </p>
            </div>
            {transcript && (
              <button onClick={() => setTranscript('')}
                style={{position:'absolute',top:'10px',right:'10px',width:'22px',height:'22px',borderRadius:'50%',border:'none',cursor:'pointer',background:'rgba(255,255,255,0.08)',color:'#4a4870',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',lineHeight:1,transition:'all 0.2s'}}
                onMouseOver={e=>{(e.currentTarget as any).style.background='rgba(239,68,68,0.15)';(e.currentTarget as any).style.color='#f87171'}}
                onMouseOut={e=>{(e.currentTarget as any).style.background='rgba(255,255,255,0.08)';(e.currentTarget as any).style.color='#4a4870'}}>
                x
              </button>
            )}
          </div>

          {/* Buttons */}
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
            <button onClick={isRecording?stopRecording:startRecording}
              style={{flex:1,minWidth:'120px',padding:'12px',borderRadius:'12px',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:'clamp(13px,2vw,14px)',transition:'all 0.2s',
                background:isRecording?'rgba(239,68,68,0.12)':'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color:isRecording?'#f87171':'#fff',
                boxShadow:isRecording?'inset 0 0 0 1px rgba(239,68,68,0.3)':'0 4px 24px rgba(99,102,241,0.3)'}}>
              {isRecording?'Stop':'Record'}
            </button>
            <button onClick={processVoice} disabled={!transcript.trim()||loading}
              style={{flex:1,minWidth:'120px',padding:'12px',borderRadius:'12px',border:'none',cursor:transcript.trim()&&!loading?'pointer':'not-allowed',fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:'clamp(13px,2vw,14px)',transition:'all 0.2s',
                background:transcript.trim()&&!loading?'rgba(52,211,153,0.12)':'rgba(255,255,255,0.03)',
                color:transcript.trim()&&!loading?'#34d399':'#2a2850',
                boxShadow:transcript.trim()&&!loading?'inset 0 0 0 1px rgba(52,211,153,0.25)':'none'}}>
              {loading?'Processing...':(mode==='task'?'Save Task':'Schedule')}
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          {!done && !loading && (
            <div style={{flex:1,background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'clamp(20px,4vw,32px)',display:'flex',alignItems:'center',justifyContent:'center',minHeight:'180px'}}>
              <p style={{color:'#2a2850',fontSize:'13px',textAlign:'center',margin:0,lineHeight:'1.6'}}>Results appear here after processing your voice</p>
            </div>
          )}
          {loading && (
            <div style={{flex:1,background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'clamp(20px,4vw,32px)',display:'flex',alignItems:'center',justifyContent:'center',minHeight:'180px'}}>
              <div style={{textAlign:'center'}}>
                <div style={{width:'32px',height:'32px',border:'2px solid rgba(99,102,241,0.2)',borderTop:'2px solid #6366f1',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}}/>
                <p style={{color:'#4a4870',fontSize:'13px',margin:0}}>Processing...</p>
              </div>
            </div>
          )}
          {done && tasks.length > 0 && (
            <div style={{display:'flex',flexDirection:'column',gap:'12px',animation:'fadeUp 0.3s ease'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'8px'}}>
                <span style={{fontSize:'11px',color:'#34d399',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase'}}>
                  {tasks.length} task{tasks.length>1?'s':''} saved
                </span>
                <button onClick={() => { setTasks([]); setDone(false) }}
                  style={{fontSize:'11px',color:'#2a2850',background:'none',border:'none',cursor:'pointer',padding:'4px 8px',borderRadius:'6px',transition:'color 0.2s'}}
                  onMouseOver={e=>(e.currentTarget.style.color='#f87171')}
                  onMouseOut={e=>(e.currentTarget.style.color='#2a2850')}>
                  Clear results
                </button>
              </div>
              {tasks.map((task, i) => (
                <div key={i} style={{background:'rgba(255,255,255,0.02)',borderRadius:'16px',border:'1px solid rgba(52,211,153,0.15)',padding:'clamp(14px,3vw,20px)'}}>
                  <p style={{color:'#e2e0ff',fontSize:'clamp(13px,2vw,15px)',fontWeight:500,margin:'0 0 4px'}}>{task.title}</p>
                  {task.description && <p style={{color:'#4a4870',fontSize:'13px',margin:'0 0 8px'}}>{task.description}</p>}
                  {task.dueDate && (
                    <span style={{fontSize:'12px',color:'#818cf8',background:'rgba(99,102,241,0.1)',padding:'4px 10px',borderRadius:'8px',border:'1px solid rgba(99,102,241,0.2)',display:'inline-block'}}>
                      Due: {new Date(task.dueDate).toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {done && tasks.length===0 && (
            <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'clamp(20px,4vw,32px)',display:'flex',alignItems:'center',justifyContent:'center',minHeight:'180px'}}>
              <p style={{color:'#2a2850',fontSize:'13px',textAlign:'center',margin:0}}>No tasks found. Try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}