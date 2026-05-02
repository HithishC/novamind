'use client'
import { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function Dashboard() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<any>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/ogg'
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
        if (data.text) {
          setInput(data.text)
          inputRef.current?.focus()
        }
      }
      recorder.start(250)
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } catch { alert('Microphone access denied.') }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    clearInterval(timerRef.current)
    setIsRecording(false)
  }

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return
    const userMsg: Msg = { role: 'user', content: text.trim() }
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs)
    setInput('')
    setStreaming(true)
    const assistantMsg: Msg = { role: 'assistant', content: '' }
    setMessages(m => [...m, assistantMsg])
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history: messages.map(m => ({ role: m.role, content: m.content })) })
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Chat failed') }
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages(m => { const c = [...m]; c[c.length - 1] = { role: 'assistant', content: full }; return c })
      }
    } catch (e: any) {
      setMessages(m => { const c = [...m]; c[c.length - 1] = { role: 'assistant', content: `Error: ${e.message}` }; return c })
    }
    setStreaming(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  async function speak(text: string) {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return }
    setIsSpeaking(true)
    const utt = new SpeechSynthesisUtterance(text)
    utt.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utt)
  }

  function formatTime(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#05050f' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .msg-user{background:linear-gradient(135deg,rgba(99,82,255,0.22),rgba(139,92,246,0.12));border:1px solid rgba(99,102,241,0.25);border-radius:18px 18px 4px 18px;align-self:flex-end;max-width:78%}
        .msg-ai{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:18px 18px 18px 4px;align-self:flex-start;max-width:85%}
        .chat-input{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.09);border-radius:14px;padding:14px 16px;color:#e2e0ff;font-size:15px;resize:none;width:100%;font-family:'DM Sans',sans-serif;outline:none;line-height:1.5;transition:border-color 0.2s;min-height:52px;max-height:140px}
        .chat-input:focus{border-color:rgba(99,102,241,0.5)}
        .chat-input::placeholder{color:#2a2850}
        pre{background:rgba(0,0,0,0.4);border-radius:10px;padding:14px;overflow-x:auto;font-size:13px;line-height:1.6;border:1px solid rgba(255,255,255,0.07);margin:8px 0;color:#a5b4fc}
        code{font-family:'Fira Code',monospace;font-size:13px}
        p{margin:4px 0;line-height:1.7}
        strong{color:#e2e0ff}
        @media(max-width:479px){
          .msg-user,.msg-ai{max-width:95%!important}
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#08081a', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(16px,3vw,20px)', color: '#f0eeff', margin: 0, letterSpacing: '-0.4px' }}>AI Chat</h1>
          <p style={{ color: '#4a4870', fontSize: '12px', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Groq - LLaMA 3.3 70B - Web Search</p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#4a4870', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Clear</button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px,3vw,32px)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.5, padding: '40px 0' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <p style={{ color: '#4a4870', fontSize: '14px', textAlign: 'center' }}>Ask anything — code, analysis, creative writing...</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'msg-user' : 'msg-ai'} style={{ padding: 'clamp(10px,2vw,16px) clamp(12px,2.5vw,20px)', animation: 'fadeUp 0.25s ease', wordBreak: 'break-word' }}>
            {msg.role === 'assistant' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>
                </div>
                <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600, letterSpacing: '0.05em' }}>NOVAMIND</span>
                {streaming && i === messages.length - 1 && !msg.content && (
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(99,102,241,0.3)', borderTop: '2px solid #6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
                )}
              </div>
            )}
            <div style={{ color: msg.role === 'user' ? '#c4b8ff' : '#c4c0e8', fontSize: 'clamp(13px,2vw,15px)', lineHeight: '1.75', whiteSpace: 'pre-wrap' }}>
              {msg.content}
              {streaming && i === messages.length - 1 && msg.role === 'assistant' && msg.content && (
                <span style={{ display: 'inline-block', width: '2px', height: '14px', background: '#6366f1', animation: 'blink 1s step-end infinite', marginLeft: '2px', verticalAlign: 'middle' }}/>
              )}
            </div>
            {msg.role === 'assistant' && msg.content && !streaming && (
              <button onClick={() => speak(msg.content)} style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#4a4870', cursor: 'pointer', fontSize: '12px', padding: '4px 0' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>{isSpeaking ? <path d="M23 9l-6 6M17 9l6 6"/> : <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>}</svg>
                {isSpeaking ? 'Stop' : 'Read aloud'}
              </button>
            )}
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Input area */}
      <div style={{ padding: 'clamp(12px,2vw,20px) clamp(16px,3vw,28px)', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#08081a', flexShrink: 0 }}>
        {isRecording && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', padding: '8px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }}/>
            <span style={{ color: '#f87171', fontSize: '13px' }}>Recording {formatTime(recordingTime)}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message NovaMind... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="chat-input"
          />
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button onClick={isRecording ? stopRecording : startRecording}
              style={{ width: '44px', height: '44px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: isRecording ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', color: isRecording ? '#f87171' : '#4a4870', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>
            </button>
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || streaming}
              style={{ width: '44px', height: '44px', borderRadius: '12px', border: 'none', cursor: !input.trim() || streaming ? 'not-allowed' : 'pointer', background: !input.trim() || streaming ? 'rgba(99,102,241,0.2)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: !input.trim() || streaming ? '#4a4870' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', boxShadow: !input.trim() || streaming ? 'none' : '0 4px 16px rgba(99,102,241,0.4)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}