'use client'
import { useState } from 'react'

export default function SchedulePage() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function startRecording() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Use Chrome'); return }
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
    ;(window as any)._recognition = r
  }

  function stopRecording() {
    ;(window as any)._recognition?.stop()
    setIsRecording(false)
  }

  async function scheduleTasks() {
    if (!transcript.trim()) return
    setLoading(true)
    setDone(false)
    const res = await fetch('/api/schedule-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript })
    })
    const data = await res.json()
    setTasks(data.tasks || [])
    setLoading(false)
    setDone(true)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Voice Task Scheduler</h1>
        <p className="text-[#4a4a6a] text-sm mt-1">Describe your tasks by voice — AI will extract and schedule them</p>
      </div>

      <div className="bg-[#0d0d1a] rounded-2xl p-6 border border-[#1a1a2e] mb-6">
        <div className="min-h-28 bg-[#0a0a0f] rounded-xl p-4 mb-4 border border-[#1a1a2e]">
          {isRecording && (
            <div className="flex gap-1 mb-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1 bg-violet-500 rounded-full animate-pulse" style={{height:'20px', animationDelay:`${i*0.1}s`}}></div>
              ))}
            </div>
          )}
          <p className="text-[#8888aa] text-sm leading-relaxed">
            {transcript || 'Press record and say something like: "Schedule a team meeting tomorrow at 10am, and remind me to submit the report by Friday 5pm"'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${isRecording ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
          >
            {isRecording ? '⏹ Stop' : '⬤ Record'}
          </button>
          <button
            onClick={scheduleTasks}
            disabled={!transcript.trim() || loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white py-3 rounded-xl text-sm font-semibold transition"
          >
            {loading ? 'Scheduling...' : '✦ Schedule Tasks'}
          </button>
          <button
            onClick={() => { setTranscript(''); setTasks([]); setDone(false) }}
            className="px-4 bg-[#1a1a2e] hover:bg-[#252540] text-[#8888aa] py-3 rounded-xl text-sm transition"
          >
            Clear
          </button>
        </div>
      </div>

      {done && tasks.length > 0 && (
        <div className="bg-[#0d0d1a] rounded-2xl p-6 border border-[#1a1a2e]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <h2 className="text-white font-semibold text-sm uppercase tracking-wide">{tasks.length} Task{tasks.length > 1 ? 's' : ''} Scheduled</h2>
          </div>
          <div className="space-y-3">
            {tasks.map((task, i) => (
              <div key={i} className="bg-[#0a0a0f] rounded-xl p-4 border border-[#1a1a2e]">
                <p className="text-white font-medium text-sm">{task.title}</p>
                {task.description && <p className="text-[#8888aa] text-xs mt-1">{task.description}</p>}
                {task.dueDate && (
                  <p className="text-violet-400 text-xs mt-2">
                    📅 {new Date(task.dueDate).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {done && tasks.length === 0 && (
        <div className="bg-[#0d0d1a] rounded-2xl p-6 border border-[#1a1a2e] text-center">
          <p className="text-[#4a4a6a]">No tasks found. Try describing more clearly.</p>
        </div>
      )}
    </div>
  )
}