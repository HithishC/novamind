'use client'
import { useState, useEffect } from 'react'

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'DONE'>('ALL')
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(setTasks).catch(() => {})
  }, [])

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.trim()) return
    setLoading(true)
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask, source: 'MANUAL' })
    })
    const updated = await fetch('/api/tasks').then(r => r.json())
    setTasks(updated)
    setNewTask('')
    setLoading(false)
  }

  async function toggleTask(id: string, status: string) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status === 'PENDING' ? 'DONE' : 'PENDING' })
    })
    const updated = await fetch('/api/tasks').then(r => r.json())
    setTasks(updated)
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks(tasks.filter(t => t.id !== id))
  }

  const filtered = tasks.filter(t => filter === 'ALL' || t.status === filter)

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">✅ Tasks</h1>

      {/* Add task form */}
      <form onSubmit={addTask} className="flex gap-3 mb-6">
        <input
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 rounded-lg transition"
        >
          Add
        </button>
      </form>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['ALL', 'PENDING', 'DONE'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <p className="text-gray-500">No tasks found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <div
              key={task.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4"
            >
              <button
                onClick={() => toggleTask(task.id, task.status)}
                className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition ${
                  task.status === 'DONE'
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-500 hover:border-indigo-400'
                }`}
              />
              <span className={`flex-1 text-sm ${
                task.status === 'DONE' ? 'line-through text-gray-500' : 'text-gray-200'
              }`}>
                {task.title}
              </span>
              {task.source === 'VOICE' && (
                <span className="text-xs text-indigo-400 bg-indigo-900 px-2 py-1 rounded-full">🎤 Voice</span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full ${
                task.status === 'DONE'
                  ? 'bg-green-900 text-green-300'
                  : 'bg-yellow-900 text-yellow-300'
              }`}>
                {task.status}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-600 hover:text-red-400 transition text-lg"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}