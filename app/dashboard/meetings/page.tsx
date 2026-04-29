'use client'
import { useState } from 'react'

export default function MeetingsPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState<{speaker: string, text: string}[]>([])
  const [summary, setSummary] = useState('')
  const [actionItems, setActionItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [meetingTitle, setMeetingTitle] = useState('')
  const [saved, setSaved] = useState(false)
  const [speakerCount, setSpeakerCount] = useState(0)

  function startRecording() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Use Chrome'); return }
    const r = new SR()
    r.continuous = true
    r.interimResults = false
    r.lang = 'en-IN'
    let lastSpeaker = ''
    let silenceTimer: any = null

    r.onresult = (e: any) => {
      clearTimeout(silenceTimer)
      const text = e.results[e.results.length - 1][0].transcript.trim()
      const newSpeaker = lastSpeaker === 'Speaker A' ? 'Speaker B' : 'Speaker A'
      silenceTimer = setTimeout(() => { lastSpeaker = newSpeaker }, 1500)
      const speaker = lastSpeaker || 'Speaker A'
      lastSpeaker = speaker
      setTranscript(prev => {
        const last = prev[prev.length - 1]
        if (last && last.speaker === speaker) {
          return [...prev.slice(0, -1), { speaker, text: last.text + ' ' + text }]
        }
        setSpeakerCount(prev2 => {
          const speakers = new Set([...prev.map(t => t.speaker), speaker])
          return speakers.size
        })
        return [...prev, { speaker, text }]
      })
    }
    r.start()
    setIsRecording(true)
    setSaved(false)
    setSummary('')
    setActionItems([])
    ;(window as any)._meetingRecognition = r
  }

  function stopRecording() {
    ;(window as any)._meetingRecognition?.stop()
    setIsRecording(false)
  }

  async function summarize() {
    if (transcript.length === 0) return
    setLoading(true)
    const fullText = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n')
    const res = await fetch('/api/summarize-meeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: fullText, title: meetingTitle })
    })
    const data = await res.json()
    setSummary(data.summary || '')
    setActionItems(data.actionItems || [])
    setLoading(false)
  }

  async function saveMeeting() {
    const fullText = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n')
    await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: meetingTitle || 'Untitled Meeting',
        transcript: fullText,
        summary,
        actionItems,
        participants: [...new Set(transcript.map(t => t.speaker))],
        date: new Date().toISOString()
      })
    })
    setSaved(true)
  }

  const speakerColors: Record<string, string> = {
    'Speaker A': 'text-violet-400',
    'Speaker B': 'text-emerald-400',
    'Speaker C': 'text-blue-400',
    'Speaker D': 'text-orange-400',
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Meeting Recorder</h1>
        <p className="text-[#4a4a6a] text-sm mt-1">Record multi-speaker meetings — AI transcribes and summarizes</p>
      </div>

      <div className="bg-[#0d0d1a] rounded-2xl p-6 border border-[#1a1a2e] mb-6">
        <input
          value={meetingTitle}
          onChange={e => setMeetingTitle(e.target.value)}
          placeholder="Meeting title (optional)"
          className="w-full bg-[#0a0a0f] border border-[#1a1a2e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4a4a6a] focus:outline-none focus:border-violet-500/50 mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${isRecording ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
          >
            {isRecording ? '⏹ Stop Recording' : '⬤ Start Recording'}
          </button>
          <button
            onClick={summarize}
            disabled={transcript.length === 0 || loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white py-3 rounded-xl text-sm font-semibold transition"
          >
            {loading ? 'Summarizing...' : '✦ Summarize'}
          </button>
        </div>
        {isRecording && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 bg-red-500 rounded-full animate-pulse" style={{height:'16px', animationDelay:`${i*0.1}s`}}></div>
              ))}
            </div>
            <span className="text-red-400 text-xs">Recording... {speakerCount > 1 ? `${speakerCount} speakers detected` : 'listening'}</span>
          </div>
        )}
      </div>

      {transcript.length > 0 && (
        <div className="bg-[#0d0d1a] rounded-2xl p-6 border border-[#1a1a2e] mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-violet-500"></div>
            <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Transcript</h2>
            <span className="ml-auto text-[#4a4a6a] text-xs">{transcript.length} segments</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-auto">
            {transcript.map((t, i) => (
              <div key={i} className="flex gap-3">
                <span className={`text-xs font-bold w-20 flex-shrink-0 pt-0.5 ${speakerColors[t.speaker] || 'text-gray-400'}`}>{t.speaker}</span>
                <p className="text-[#ccccdd] text-sm">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary && (
        <div className="bg-[#0d0d1a] rounded-2xl p-6 border border-[#1a1a2e] mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <h2 className="text-white font-semibold text-sm uppercase tracking-wide">AI Summary</h2>
          </div>
          <p className="text-[#ccccdd] text-sm leading-relaxed mb-4">{summary}</p>
          {actionItems.length > 0 && (
            <div>
              <p className="text-[#4a4a6a] text-xs uppercase tracking-wide mb-2">Action Items</p>
              <div className="space-y-2">
                {actionItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">✦</span>
                    <p className="text-[#ccccdd] text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={saveMeeting}
            disabled={saved}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition"
          >
            {saved ? '✓ Saved' : 'Save Meeting'}
          </button>
        </div>
      )}
    </div>
  )
}