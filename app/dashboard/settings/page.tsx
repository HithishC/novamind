'use client'
import { useState } from 'react'

export default function SettingsPage() {
  const [language, setLanguage] = useState('en-IN')
  const [ttsProvider, setTtsProvider] = useState('BROWSER')
  const [voiceId, setVoiceId] = useState('')
  const [saved, setSaved] = useState(false)

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/user/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, ttsProvider, preferredVoice: voiceId })
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function testTTS() {
    const u = new SpeechSynthesisUtterance('Hello! Your voice assistant is working correctly.')
    u.lang = language
    window.speechSynthesis.speak(u)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">⚙️ Settings</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-xl">
        {saved && (
          <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-6">
            ✓ Settings saved successfully
          </div>
        )}

        <form onSubmit={saveSettings} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="en-IN">English (India)</option>
              <option value="en-US">English (US)</option>
              <option value="hi-IN">Hindi</option>
              <option value="ta-IN">Tamil</option>
              <option value="te-IN">Telugu</option>
              <option value="kn-IN">Kannada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              TTS Provider
            </label>
            <select
              value={ttsProvider}
              onChange={e => setTtsProvider(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="BROWSER">Browser (Free)</option>
              <option value="ELEVENLABS">ElevenLabs (Premium)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ElevenLabs Voice ID (optional)
            </label>
            <input
              value={voiceId}
              onChange={e => setVoiceId(e.target.value)}
              placeholder="21m00Tcm4TlvDq8ikWAM"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-gray-500 text-xs mt-1">Leave blank to use default Rachel voice</p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition"
            >
              Save Settings
            </button>
            <button
              type="button"
              onClick={testTTS}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
            >
              🔊 Test Voice
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}