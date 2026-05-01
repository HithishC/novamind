'use client'
import { useState, useRef } from 'react'

type TranscriptLine = { speaker: string; text: string }

export default function MeetingsPage() {
  const [step, setStep] = useState<'setup'|'recording'|'summary'>('setup')
  const [meetingTitle, setMeetingTitle] = useState('')
  const [attendees, setAttendees] = useState('')
  const [agenda, setAgenda] = useState('')
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcript, setTranscript] = useState<TranscriptLine[]>([])
  const [rawTranscript, setRawTranscript] = useState('')
  const [summary, setSummary] = useState('')
  const [actionItems, setActionItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder|null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<any>(null)
  const srRef = useRef<any>(null)

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
        const file = new File([blob], `meeting.${ext}`, { type: mimeType })
        const form = new FormData()
        form.append('audio', file)
        setLoading(true)
        const res = await fetch('/api/transcribe', { method: 'POST', body: form })
        const data = await res.json()
        if (data.text) {
          setRawTranscript(data.text)
          await summarize(data.text)
        }
        setLoading(false)
      }
      recorder.start(250)
      mediaRecorderRef.current = recorder

      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SR) {
        const sr = new SR()
        sr.continuous = true
        sr.interimResults = true
        sr.lang = 'en-IN'
        let speaker = 'Speaker A'
        let silenceTimer: any = null
        sr.onresult = (e: any) => {
          clearTimeout(silenceTimer)
          const text = e.results[e.results.length - 1][0].transcript.trim()
          silenceTimer = setTimeout(() => {
            speaker = speaker === 'Speaker A' ? 'Speaker B' : 'Speaker A'
          }, 2000)
          setTranscript(prev => {
            const last = prev[prev.length - 1]
            if (last && last.speaker === speaker) {
              return [...prev.slice(0, -1), { speaker, text: last.text + ' ' + text }]
            }
            return [...prev, { speaker, text }]
          })
        }
        sr.start()
        srRef.current = sr
      }

      setStep('recording')
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } catch {
      alert('Microphone access denied.')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    srRef.current?.stop()
    clearInterval(timerRef.current)
    setStep('summary')
  }

  async function summarize(text: string) {
    const res = await fetch('/api/summarize-meeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: text,
        title: meetingTitle,
        attendees,
        agenda
      })
    })
    const data = await res.json()
    setSummary(data.summary || '')
    setActionItems(data.actionItems || [])
  }

  async function saveMeeting() {
    await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: meetingTitle || 'Untitled Meeting',
        transcript: rawTranscript,
        summary,
        actionItems,
        participants: attendees.split(',').map(a => a.trim()).filter(Boolean),
        date: new Date().toISOString()
      })
    })
    setSaved(true)
  }

  function reset() {
    setStep('setup')
    setMeetingTitle('')
    setAttendees('')
    setAgenda('')
    setRecordingTime(0)
    setTranscript([])
    setRawTranscript('')
    setSummary('')
    setActionItems([])
    setSaved(false)
    setLoading(false)
  }

  function formatTime(s: number) {
    return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
  }

  const speakerColors: Record<string, string> = {
    'Speaker A': '#a78bfa',
    'Speaker B': '#34d399',
    'Speaker C': '#60a5fa',
    'Speaker D': '#f97316',
  }

  return (
    <div style={{minHeight:'100vh',padding:'48px 52px',background:'#05050f',maxWidth:'860px'}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes wave{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}
        .bar{width:3px;border-radius:99px;background:linear-gradient(to top,#6366f1,#a78bfa);transform-origin:bottom}
        .bar.active{animation:wave 0.9s ease-in-out infinite}
        input,textarea{outline:none;font-family:'DM Sans',sans-serif}
        input::placeholder,textarea::placeholder{color:#2a2850}
      `}</style>

      <div style={{marginBottom:'40px'}}>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'26px',color:'#f0eeff',margin:'0 0 4px',letterSpacing:'-0.5px'}}>Meeting Recorder</h1>
        <p style={{color:'#4a4870',fontSize:'13px',margin:0}}>Fill in details, record your meeting, get an AI summary instantly</p>
      </div>

      {/* Step indicators */}
      <div style={{display:'flex',alignItems:'center',gap:'0',marginBottom:'40px'}}>
        {['Setup','Recording','Summary'].map((s, i) => {
          const stepKeys = ['setup','recording','summary']
          const active = stepKeys[i] === step
          const done = stepKeys.indexOf(step) > i
          return (
            <div key={s} style={{display:'flex',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{width:'28px',height:'28px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:600,fontFamily:"'DM Sans',sans-serif",transition:'all 0.3s',
                  background: done ? '#6366f1' : active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                  color: done ? '#fff' : active ? '#818cf8' : '#2a2850',
                  border: active ? '1px solid rgba(99,102,241,0.4)' : done ? 'none' : '1px solid rgba(255,255,255,0.06)'}}>
                  {done ? '✓' : i+1}
                </div>
                <span style={{fontSize:'13px',fontWeight: active ? 500 : 400,color: active ? '#c4b5fd' : done ? '#6366f1' : '#2a2850',fontFamily:"'DM Sans',sans-serif"}}>{s}</span>
              </div>
              {i < 2 && <div style={{width:'40px',height:'1px',background:'rgba(255,255,255,0.06)',margin:'0 12px'}}/>}
            </div>
          )
        })}
      </div>

      {/* STEP 1: Setup */}
      {step === 'setup' && (
        <div style={{animation:'fadeUp 0.4s ease'}}>
          <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'32px',display:'flex',flexDirection:'column',gap:'20px'}}>
            <div>
              <label style={{display:'block',fontSize:'12px',color:'#4a4870',fontWeight:500,marginBottom:'8px',fontFamily:"'DM Sans',sans-serif",letterSpacing:'0.05em',textTransform:'uppercase'}}>Meeting Title</label>
              <input value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)}
                placeholder="e.g. Q2 Product Review"
                style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'12px 16px',color:'#e2e0ff',fontSize:'14px',boxSizing:'border-box',transition:'border-color 0.2s'}}
                onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.4)'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}
              />
            </div>
            <div>
              <label style={{display:'block',fontSize:'12px',color:'#4a4870',fontWeight:500,marginBottom:'8px',fontFamily:"'DM Sans',sans-serif",letterSpacing:'0.05em',textTransform:'uppercase'}}>Attendees</label>
              <input value={attendees} onChange={e => setAttendees(e.target.value)}
                placeholder="e.g. Hithish, Priya, Rajan"
                style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'12px 16px',color:'#e2e0ff',fontSize:'14px',boxSizing:'border-box',transition:'border-color 0.2s'}}
                onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.4)'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}
              />
            </div>
            <div>
              <label style={{display:'block',fontSize:'12px',color:'#4a4870',fontWeight:500,marginBottom:'8px',fontFamily:"'DM Sans',sans-serif",letterSpacing:'0.05em',textTransform:'uppercase'}}>Agenda</label>
              <textarea value={agenda} onChange={e => setAgenda(e.target.value)}
                placeholder="What will be discussed in this meeting?"
                rows={3}
                style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'12px 16px',color:'#e2e0ff',fontSize:'14px',boxSizing:'border-box',resize:'none',lineHeight:'1.6',transition:'border-color 0.2s'}}
                onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.4)'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}
              />
            </div>
            <button onClick={startRecording}
              style={{padding:'14px',borderRadius:'12px',border:'none',cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontSize:'14px',fontWeight:600,fontFamily:"'DM Sans',sans-serif",boxShadow:'0 4px 24px rgba(99,102,241,0.35)',transition:'all 0.2s'}}>
              Start Recording
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Recording */}
      {step === 'recording' && (
        <div style={{animation:'fadeUp 0.4s ease'}}>
          <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(239,68,68,0.15)',padding:'32px',display:'flex',flexDirection:'column',gap:'24px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'50%',background:'#ef4444',boxShadow:'0 0 12px #ef4444',animation:'pulse 1s ease infinite'}}/>
                <span style={{color:'#f87171',fontSize:'15px',fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Recording</span>
              </div>
              <span style={{color:'#f87171',fontSize:'20px',fontWeight:700,fontFamily:"'Syne',sans-serif",letterSpacing:'0.05em'}}>{formatTime(recordingTime)}</span>
            </div>

            <div style={{height:'70px',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px',background:'rgba(0,0,0,0.3)',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.04)',overflow:'hidden'}}>
              {[...Array(28)].map((_,i) => (
                <div key={i} className="bar active"
                  style={{height:'36px',animationDelay:`${i*0.04}s`}}/>
              ))}
            </div>

            {transcript.length > 0 && (
              <div style={{maxHeight:'200px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'10px'}}>
                <p style={{fontSize:'11px',color:'#2a2850',margin:0,fontFamily:"'DM Sans',sans-serif",textTransform:'uppercase',letterSpacing:'0.08em'}}>Live Transcript</p>
                {transcript.map((t,i) => (
                  <div key={i} style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
                    <span style={{fontSize:'11px',fontWeight:700,color:speakerColors[t.speaker]||'#818cf8',width:'72px',flexShrink:0,paddingTop:'2px',fontFamily:"'DM Sans',sans-serif"}}>{t.speaker}</span>
                    <p style={{color:'#8888aa',fontSize:'13px',margin:0,lineHeight:'1.6',fontFamily:"'DM Sans',sans-serif"}}>{t.text}</p>
                  </div>
                ))}
              </div>
            )}

            <button onClick={stopRecording}
              style={{padding:'14px',borderRadius:'12px',border:'none',cursor:'pointer',background:'rgba(239,68,68,0.12)',color:'#f87171',fontSize:'14px',fontWeight:600,fontFamily:"'DM Sans',sans-serif",boxShadow:'inset 0 0 0 1px rgba(239,68,68,0.3)',transition:'all 0.2s'}}>
              Stop & Generate Summary
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Summary */}
      {step === 'summary' && (
        <div style={{animation:'fadeUp 0.4s ease',display:'flex',flexDirection:'column',gap:'20px'}}>
          {loading && (
            <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'48px',display:'flex',flexDirection:'column',alignItems:'center',gap:'16px'}}>
              <div style={{width:'36px',height:'36px',border:'2px solid rgba(99,102,241,0.2)',borderTop:'2px solid #6366f1',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
              <p style={{color:'#4a4870',fontSize:'14px',margin:0,fontFamily:"'DM Sans',sans-serif"}}>Transcribing and generating summary...</p>
            </div>
          )}

          {!loading && summary && (
            <>
              <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'28px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px'}}>
                  <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#6366f1'}}/>
                  <span style={{fontSize:'11px',color:'#6366f1',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif"}}>Meeting Details</span>
                </div>
                <p style={{color:'#e2e0ff',fontSize:'16px',fontWeight:600,margin:'0 0 8px',fontFamily:"'Syne',sans-serif"}}>{meetingTitle || 'Untitled Meeting'}</p>
                {attendees && <p style={{color:'#4a4870',fontSize:'13px',margin:'0 0 4px',fontFamily:"'DM Sans',sans-serif"}}>Attendees: {attendees}</p>}
                {agenda && <p style={{color:'#4a4870',fontSize:'13px',margin:0,fontFamily:"'DM Sans',sans-serif"}}>Agenda: {agenda}</p>}
              </div>

              <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'28px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px'}}>
                  <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#34d399'}}/>
                  <span style={{fontSize:'11px',color:'#34d399',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif"}}>AI Summary</span>
                </div>
                <p style={{color:'#c4c0e8',fontSize:'14px',lineHeight:'1.8',margin:0,fontFamily:"'DM Sans',sans-serif"}}>{summary}</p>
              </div>

              {actionItems.length > 0 && (
                <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'28px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px'}}>
                    <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#f59e0b'}}/>
                    <span style={{fontSize:'11px',color:'#f59e0b',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif"}}>Action Items</span>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                    {actionItems.map((item,i) => (
                      <div key={i} style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
                        <div style={{width:'20px',height:'20px',borderRadius:'6px',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'1px'}}>
                          <span style={{fontSize:'10px',color:'#f59e0b',fontWeight:700}}>{i+1}</span>
                        </div>
                        <p style={{color:'#c4c0e8',fontSize:'14px',margin:0,lineHeight:'1.6',fontFamily:"'DM Sans',sans-serif"}}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rawTranscript && (
                <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'28px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px'}}>
                    <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#818cf8'}}/>
                    <span style={{fontSize:'11px',color:'#818cf8',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif"}}>Full Transcript</span>
                  </div>
                  <p style={{color:'#4a4870',fontSize:'13px',lineHeight:'1.8',margin:0,fontFamily:"'DM Sans',sans-serif"}}>{rawTranscript}</p>
                </div>
              )}

              <div style={{display:'flex',gap:'12px'}}>
                <button onClick={saveMeeting} disabled={saved}
                  style={{flex:1,padding:'14px',borderRadius:'12px',border:'none',cursor:saved?'not-allowed':'pointer',
                    background:saved?'rgba(52,211,153,0.08)':'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color:saved?'#34d399':'#fff',fontSize:'14px',fontWeight:600,fontFamily:"'DM Sans',sans-serif",
                    boxShadow:saved?'inset 0 0 0 1px rgba(52,211,153,0.2)':'0 4px 24px rgba(99,102,241,0.3)',transition:'all 0.2s'}}>
                  {saved ? 'Saved' : 'Save Meeting'}
                </button>
                <button onClick={reset}
                  style={{flex:1,padding:'14px',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.08)',cursor:'pointer',background:'transparent',color:'#4a4870',fontSize:'14px',fontWeight:600,fontFamily:"'DM Sans',sans-serif",transition:'all 0.2s'}}>
                  New Meeting
                </button>
              </div>
            </>
          )}

          {!loading && !summary && (
            <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'48px',textAlign:'center'}}>
              <p style={{color:'#2a2850',fontSize:'14px',margin:'0 0 16px',fontFamily:"'DM Sans',sans-serif"}}>Could not generate summary. Try again.</p>
              <button onClick={reset} style={{padding:'10px 24px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'transparent',color:'#4a4870',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:'13px'}}>
                Start Over
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}