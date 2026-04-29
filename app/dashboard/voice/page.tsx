'use client'
import { useState } from 'react'

type Task = { title: string; description?: string; dueDate?: string }

export default function VoicePage() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [mode, setMode] = useState<'task'|'schedule'>('task')
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [waveActive, setWaveActive] = useState(false)

  function startRecording() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Please use Chrome'); return }
    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.lang = 'en-IN'
    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join('')
      setTranscript(t)
    }
    r.start()
    setIsRecording(true)
    setWaveActive(true)
    setDone(false)
    setTasks([])
    ;(window as any)._voiceRec = r
  }

  function stopRecording() {
    ;(window as any)._voiceRec?.stop()
    setIsRecording(false)
    setWaveActive(false)
  }

  async function processVoice() {
    if (!transcript.trim()) return
    setLoading(true)
    setDone(false)
    if (mode === 'task') {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: transcript, source: 'VOICE', userId: 'test-user' })
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
    <div style={{minHeight:'100vh',padding:'48px 52px',background:'#05050f'}}>
      <style>{`
        @keyframes wave {
          0%,100%{transform:scaleY(0.4)}
          50%{transform:scaleY(1)}
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(16px)}
          to{opacity:1;transform:translateY(0)}
        }
        .bar { width:3px; border-radius:99px; background:linear-gradient(to top,#6366f1,#a78bfa); transform-origin:bottom; }
        .bar.active { animation: wave 1s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div style={{marginBottom:'48px',animation:'fadeUp 0.5s ease'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'}}>
          <div style={{width:'38px',height:'38px',borderRadius:'10px',background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>
          </div>
          <div>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'26px',color:'#f0eeff',margin:0,letterSpacing:'-0.5px'}}>Voice & Schedule</h1>
            <p style={{color:'#4a4870',fontSize:'13px',margin:0,marginTop:'2px'}}>Speak to create tasks or intelligently schedule your day</p>
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{display:'flex',gap:'8px',marginBottom:'32px',background:'rgba(255,255,255,0.03)',borderRadius:'12px',padding:'5px',width:'fit-content',border:'1px solid rgba(255,255,255,0.06)'}}>
        {(['task','schedule'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding:'8px 20px', borderRadius:'8px', border:'none', cursor:'pointer',
            fontSize:'13px', fontWeight:500, fontFamily:"'DM Sans',sans-serif",
            transition:'all 0.2s',
            background: mode===m ? 'rgba(99,102,241,0.2)' : 'transparent',
            color: mode===m ? '#c4b5fd' : '#4a4870',
            boxShadow: mode===m ? 'inset 0 0 0 1px rgba(99,102,241,0.3)' : 'none'
          }}>
            {m === 'task' ? '⚡ Quick Task' : '🗓 Smart Schedule'}
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',maxWidth:'1000px'}}>
        {/* Left: Recorder */}
        <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'32px',display:'flex',flexDirection:'column',gap:'24px'}}>
          {/* Wave visualizer */}
          <div style={{height:'80px',display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',background:'rgba(0,0,0,0.2)',borderRadius:'14px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.04)'}}>
            {[...Array(20)].map((_,i) => (
              <div key={i} className={`bar ${waveActive ? 'active' : ''}`}
                style={{height: waveActive ? '40px' : '8px', animationDelay:`${i*0.05}s`, opacity: waveActive ? 1 : 0.2, transition:'height 0.3s ease'}}></div>
            ))}
          </div>

          {/* Transcript */}
          <div style={{minHeight:'100px',background:'rgba(0,0,0,0.2)',borderRadius:'14px',padding:'16px',border:'1px solid rgba(255,255,255,0.04)'}}>
            <p style={{color: transcript ? '#c4c0e8' : '#2a2850', fontSize:'14px', lineHeight:'1.7', margin:0, fontStyle: transcript ? 'normal' : 'italic'}}>
              {transcript || (mode==='task' ? 'Say the task name... e.g. "Review the Q3 report"' : 'Describe your schedule... e.g. "Team standup at 9am, client call at 2pm, submit report by Friday"')}
            </p>
          </div>

          {/* Controls */}
          <div style={{display:'flex',gap:'10px'}}>
            <button onClick={isRecording ? stopRecording : startRecording}
              style={{flex:1,padding:'12px',borderRadius:'12px',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:'14px',transition:'all 0.2s',
                background: isRecording ? 'rgba(239,68,68,0.12)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: isRecording ? '#f87171' : '#fff',
                boxShadow: isRecording ? 'inset 0 0 0 1px rgba(239,68,68,0.3)' : '0 4px 24px rgba(99,102,241,0.3)'
              }}>
              {isRecording ? '⏹ Stop' : '⬤ Record'}
            </button>
            <button onClick={processVoice} disabled={!transcript.trim() || loading}
              style={{flex:1,padding:'12px',borderRadius:'12px',border:'none',cursor: transcript.trim() && !loading ? 'pointer' : 'not-allowed',fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:'14px',transition:'all 0.2s',
                background: transcript.trim() && !loading ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.03)',
                color: transcript.trim() && !loading ? '#34d399' : '#2a2850',
                boxShadow: transcript.trim() && !loading ? 'inset 0 0 0 1px rgba(52,211,153,0.25)' : 'none'
              }}>
              {loading ? 'Processing...' : mode==='task' ? '✦ Save Task' : '✦ Schedule'}
            </button>
          </div>

          <button onClick={() => {setTranscript('');setTasks([]);setDone(false)}}
            style={{padding:'8px',borderRadius:'8px',border:'none',cursor:'pointer',background:'transparent',color:'#2a2850',fontSize:'12px',fontFamily:"'DM Sans',sans-serif",transition:'color 0.2s'}}>
            Clear transcript
          </button>
        </div>

        {/* Right: Results */}
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          {!done && !loading && (
            <div style={{flex:1,background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'32px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'12px'}}>
              <div style={{width:'56px',height:'56px',borderRadius:'16px',background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a4870" strokeWidth="1.5"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
              </div>
              <p style={{color:'#2a2850',fontSize:'13px',textAlign:'center',margin:0,lineHeight:'1.6'}}>Results will appear here<br/>after processing your voice</p>
            </div>
          )}

          {loading && (
            <div style={{flex:1,background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'32px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{textAlign:'center'}}>
                <div style={{width:'36px',height:'36px',border:'2px solid rgba(99,102,241,0.2)',borderTop:'2px solid #6366f1',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}}></div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <p style={{color:'#4a4870',fontSize:'13px',margin:0}}>AI is processing...</p>
              </div>
            </div>
          )}

          {done && tasks.map((task, i) => (
            <div key={i} style={{background:'rgba(255,255,255,0.02)',borderRadius:'16px',border:'1px solid rgba(52,211,153,0.15)',padding:'20px',animation:'fadeUp 0.4s ease'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#34d399',boxShadow:'0 0 8px #34d399'}}></div>
                <span style={{fontSize:'11px',color:'#34d399',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase'}}>Saved</span>
              </div>
              <p style={{color:'#e2e0ff',fontSize:'15px',fontWeight:500,margin:'0 0 4px'}}>{task.title}</p>
              {task.description && <p style={{color:'#4a4870',fontSize:'13px',margin:'0 0 8px'}}>{task.description}</p>}
              {task.dueDate && (
                <div style={{display:'inline-flex',alignItems:'center',gap:'6px',background:'rgba(99,102,241,0.1)',borderRadius:'8px',padding:'4px 10px',border:'1px solid rgba(99,102,241,0.2)'}}>
                  <span style={{fontSize:'12px',color:'#818cf8'}}>📅 {new Date(task.dueDate).toLocaleString()}</span>
                </div>
              )}
            </div>
          ))}

          {done && tasks.length === 0 && (
            <div style={{flex:1,background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'32px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <p style={{color:'#2a2850',fontSize:'13px',textAlign:'center'}}>No tasks extracted.<br/>Try describing more clearly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}