'use client'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [transcript, setTranscript] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [tasks, setTasks] = useState<any[]>([])
  const [messages, setMessages] = useState<{role:string,content:string}[]>([])
  const [input, setInput] = useState('')
  const [model, setModel] = useState('gpt4o')
  const [aiResponse, setAiResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchTasks = () => {
    fetch('/api/tasks').then(r => r.json()).then(data => setTasks(Array.isArray(data) ? data : [])).catch(() => setTasks([]))
  }

  useEffect(() => { fetchTasks() }, [])

  function startRecording() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Use Chrome for speech recognition'); return }
    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-IN'
    recognition.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join('')
      setTranscript(t)
    }
    recognition.start()
    setIsRecording(true)
    ;(window as any)._recognition = recognition
  }

  function stopRecording() {
    ;(window as any)._recognition?.stop()
    setIsRecording(false)
  }

  async function saveAsTask() {
    if (!transcript.trim()) return
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: transcript, source: 'VOICE' })
    })
    fetchTasks()
    setTranscript('')
  }

  async function toggleTask(id: string, status: string) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status === 'PENDING' ? 'DONE' : 'PENDING' })
    })
    fetchTasks()
  }

  async function sendMessage() {
    if (!input.trim()) return
    setLoading(true)
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setAiResponse('')
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, model, history: messages })
    })
    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    let full = ''
    while (reader) {
      const { done, value } = await reader.read()
      if (done) break
      full += decoder.decode(value)
      setAiResponse(full)
    }
    setMessages([...newMessages, { role: 'assistant', content: full }])
    setAiResponse('')
    setLoading(false)
  }

  function speak(text: string) {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-IN'
    window.speechSynthesis.speak(u)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Good day ✦</h1>
        <p className="text-[#4a4a6a] text-sm mt-1">Your AI voice workspace is ready</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="bg-[#0d0d1a] rounded-2xl p-6 border border-[#1a1a2e]">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-violet-500"></div>
            <h2 className="text-white font-semibold text-sm tracking-wide uppercase">Voice Input</h2>
          </div>
          <div className="min-h-28 bg-[#0a0a0f] rounded-xl p-4 mb-4 border border-[#1a1a2e]">
            {isRecording && (
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1 bg-violet-500 rounded-full animate-pulse" style={{height: `${12 + Math.random() * 20}px`, animationDelay: `${i * 0.1}s`}}></div>
                ))}
              </div>
            )}
            <p className="text-[#8888aa] text-sm leading-relaxed">
              {transcript || 'Press record and speak...'}
            </p>
          </div>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition mb-3 ${isRecording ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
          >
            {isRecording ? '⏹ Stop Recording' : '⬤ Start Recording'}
          </button>
          <div className="flex gap-2">
            <button onClick={saveAsTask} disabled={!transcript.trim()} className="flex-1 bg-[#1a1a2e] hover:bg-[#252540] disabled:opacity-30 text-[#8888aa] hover:text-white py-2 rounded-xl text-sm transition border border-[#252540]">
              Save as Task
            </button>
            <button onClick={() => setTranscript('')} className="px-4 bg-[#1a1a2e] hover:bg-[#252540] text-[#8888aa] py-2 rounded-xl text-sm transition border border-[#252540]">
              Clear
            </button>
          </div>
        </div>

        <div className="bg-[#0d0d1a] rounded-2xl p-6 border border-[#1a1a2e]">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <h2 className="text-white font-semibold text-sm tracking-wide uppercase">Tasks</h2>
            <span className="ml-auto bg-[#1a1a2e] text-[#8888aa] text-xs px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === 'PENDING').length} pending</span>
          </div>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-[#4a4a6a] text-sm">No tasks yet</p>
              <p className="text-[#2a2a3a] text-xs mt-1">Record something to create one</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-auto">
              {tasks.map((task: any) => (
                <div key={task.id} className="flex items-center gap-3 bg-[#0a0a0f] rounded-xl p-3 border border-[#1a1a2e] group">
                  <button onClick={() => toggleTask(task.id, task.status)} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition ${task.status === 'DONE' ? 'bg-emerald-500 border-emerald-500' : 'border-[#3a3a5a] hover:border-violet-400'}`} />
                  <span className={`text-sm flex-1 ${task.status === 'DONE' ? 'line-through text-[#4a4a6a]' : 'text-[#ccccdd]'}`}>{task.title}</span>
                  {task.source === 'VOICE' && <span className="text-[10px] text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded-full">voice</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#0d0d1a] rounded-2xl p-6 border border-[#1a1a2e] flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <h2 className="text-white font-semibold text-sm tracking-wide uppercase">AI Chat</h2>
            <select value={model} onChange={e => setModel(e.target.value)} className="ml-auto bg-[#1a1a2e] border border-[#252540] text-[#8888aa] text-xs rounded-lg px-2 py-1">
              <option value="gpt4o">GPT-4o</option>
              <option value="groq">Groq</option>
            </select>
          </div>
          <div className="flex-1 min-h-48 max-h-64 bg-[#0a0a0f] rounded-xl p-4 mb-4 overflow-auto space-y-3 border border-[#1a1a2e]">
            {messages.length === 0 && <p className="text-[#4a4a6a] text-sm">Ask me anything...</p>}
            {messages.map((m, i) => (
              <div key={i} className={`text-sm ${m.role === 'user' ? 'text-violet-300' : 'text-[#ccccdd]'}`}>
                <span className="font-semibold text-xs uppercase tracking-wide opacity-60">{m.role === 'user' ? 'you  ' : 'nova  '}</span>
                {m.content}
                {m.role === 'assistant' && (
                  <button onClick={() => speak(m.content)} className="ml-2 text-[10px] text-[#4a4a6a] hover:text-[#8888aa]">speak</button>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
              </div>
            )}
            {aiResponse && <div className="text-sm text-[#ccccdd]"><span className="font-semibold text-xs uppercase tracking-wide opacity-60">nova  </span>{aiResponse}</div>}
          </div>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Message NovaMind..." className="flex-1 bg-[#0a0a0f] border border-[#1a1a2e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4a4a6a] focus:outline-none focus:border-violet-500/50" />
            <button onClick={sendMessage} disabled={loading} className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-4 rounded-xl transition text-sm font-medium">Send</button>
          </div>
        </div>

      </div>
    </div>
  )
}
