'use client'
import { useState, useEffect } from 'react'

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [filter, setFilter] = useState<'ALL'|'PENDING'|'DONE'>('ALL')
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(d => { setTasks(Array.isArray(d)?d:[]); setFetching(false) }).catch(()=>setFetching(false))
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
    setTasks(Array.isArray(updated)?updated:[])
    setNewTask('')
    setLoading(false)
  }

  async function toggleTask(id: string, status: string) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status==='PENDING'?'DONE':'PENDING' })
    })
    const updated = await fetch('/api/tasks').then(r => r.json())
    setTasks(Array.isArray(updated)?updated:[])
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks(tasks.filter(t => t.id !== id))
  }

  const filtered = tasks.filter(t => filter==='ALL' || t.status===filter)
  const pending = tasks.filter(t => t.status==='PENDING').length
  const done = tasks.filter(t => t.status==='DONE').length

  return (
    <div style={{minHeight:'100vh',padding:'clamp(24px,5vw,48px) clamp(16px,5vw,52px)',background:'#05050f'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        input{outline:none;font-family:'DM Sans',sans-serif}
        input::placeholder{color:#2a2850}
        .task-row{display:flex;align-items:center;gap:clamp(8px,2vw,14px);padding:clamp(12px,2vw,16px) clamp(14px,3vw,20px);background:rgba(255,255,255,0.02);border-radius:14px;border:1px solid rgba(255,255,255,0.06);transition:border-color 0.2s;animation:fadeUp 0.25s ease}
        .task-row:hover{border-color:rgba(255,255,255,0.1)}
        .del-btn{background:none;border:none;cursor:pointer;color:#2a2850;display:flex;align-items:center;justify-content:center;padding:4px;border-radius:6px;transition:all 0.2s;flex-shrink:0}
        .del-btn:hover{color:#f87171;background:rgba(239,68,68,0.1)}
        .filter-btn{padding:7px clamp(12px,2vw,18px);border-radius:8px;border:none;cursor:pointer;font-size:clamp(11px,2vw,13px);font-weight:500;font-family:'DM Sans',sans-serif;transition:all 0.2s;white-space:nowrap}
      `}</style>

      {/* Header */}
      <div style={{marginBottom:'clamp(24px,4vw,36px)'}}>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'clamp(20px,4vw,26px)',color:'#f0eeff',margin:'0 0 4px',letterSpacing:'-0.5px'}}>Tasks</h1>
        <p style={{color:'#4a4870',fontSize:'clamp(12px,2vw,13px)',margin:0}}>Manage your voice and manual tasks</p>
      </div>

      {/* Stats row */}
      {tasks.length > 0 && (
        <div style={{display:'flex',gap:'clamp(8px,2vw,12px)',marginBottom:'clamp(20px,4vw,28px)',flexWrap:'wrap'}}>
          {[
            {label:'Total',val:tasks.length,color:'#6366f1',bg:'rgba(99,102,241,0.1)',border:'rgba(99,102,241,0.2)'},
            {label:'Pending',val:pending,color:'#f59e0b',bg:'rgba(245,158,11,0.1)',border:'rgba(245,158,11,0.2)'},
            {label:'Done',val:done,color:'#34d399',bg:'rgba(52,211,153,0.1)',border:'rgba(52,211,153,0.2)'},
          ].map(s => (
            <div key={s.label} style={{padding:'10px 18px',borderRadius:'12px',background:s.bg,border:`1px solid ${s.border}`,display:'flex',alignItems:'center',gap:'8px'}}>
              <span style={{fontSize:'clamp(16px,3vw,20px)',fontWeight:700,color:s.color,fontFamily:"'Syne',sans-serif"}}>{s.val}</span>
              <span style={{fontSize:'12px',color:s.color,fontWeight:500}}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add task */}
      <form onSubmit={addTask} style={{display:'flex',gap:'10px',marginBottom:'clamp(20px,4vw,28px)',flexWrap:'wrap'}}>
        <input
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          style={{flex:1,minWidth:'200px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'12px 16px',color:'#e2e0ff',fontSize:'clamp(13px,2vw,14px)',transition:'border-color 0.2s'}}
          onFocus={e=>e.target.style.borderColor='rgba(99,102,241,0.5)'}
          onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.08)'}
        />
        <button type="submit" disabled={loading||!newTask.trim()}
          style={{padding:'12px clamp(16px,3vw,24px)',borderRadius:'12px',border:'none',cursor:loading||!newTask.trim()?'not-allowed':'pointer',
            background:loading||!newTask.trim()?'rgba(99,102,241,0.2)':'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color:loading||!newTask.trim()?'#4a4870':'#fff',fontSize:'clamp(13px,2vw,14px)',fontWeight:600,
            boxShadow:loading||!newTask.trim()?'none':'0 4px 16px rgba(99,102,241,0.35)',
            transition:'all 0.2s',whiteSpace:'nowrap',fontFamily:"'DM Sans',sans-serif"}}>
          {loading ? (
            <span style={{display:'flex',alignItems:'center',gap:'6px'}}>
              <span style={{width:'14px',height:'14px',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block'}}/>
              Adding...
            </span>
          ) : 'Add Task'}
        </button>
      </form>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:'6px',marginBottom:'clamp(16px,3vw,24px)',background:'rgba(255,255,255,0.02)',borderRadius:'10px',padding:'4px',width:'fit-content',border:'1px solid rgba(255,255,255,0.06)',flexWrap:'nowrap',overflowX:'auto'}}>
        {(['ALL','PENDING','DONE'] as const).map(f => (
          <button key={f} className="filter-btn" onClick={() => setFilter(f)}
            style={{background:filter===f?'rgba(99,102,241,0.2)':'transparent',color:filter===f?'#c4b5fd':'#4a4870',boxShadow:filter===f?'inset 0 0 0 1px rgba(99,102,241,0.3)':'none'}}>
            {f}{f!=='ALL'&&` (${f==='PENDING'?pending:done})`}
          </button>
        ))}
      </div>

      {/* Task list */}
      {fetching ? (
        <div style={{display:'flex',justifyContent:'center',padding:'60px 0'}}>
          <div style={{width:'32px',height:'32px',border:'2px solid rgba(99,102,241,0.2)',borderTop:'2px solid #6366f1',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{background:'rgba(255,255,255,0.02)',borderRadius:'20px',border:'1px solid rgba(255,255,255,0.06)',padding:'clamp(40px,8vw,60px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'10px'}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2a2850" strokeWidth="1.5"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          <p style={{color:'#2a2850',fontSize:'14px',margin:0}}>{filter==='ALL'?'No tasks yet. Add one above!':filter==='PENDING'?'No pending tasks.':'No completed tasks yet.'}</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {filtered.map(task => (
            <div key={task.id} className="task-row">
              {/* Checkbox */}
              <button onClick={() => toggleTask(task.id, task.status)}
                style={{width:'clamp(18px,3vw,22px)',height:'clamp(18px,3vw,22px)',borderRadius:'50%',border:`2px solid ${task.status==='DONE'?'#34d399':'rgba(255,255,255,0.15)'}`,background:task.status==='DONE'?'#34d399':'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.2s'}}>
                {task.status==='DONE' && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                )}
              </button>

              {/* Title */}
              <span style={{flex:1,fontSize:'clamp(13px,2vw,14px)',color:task.status==='DONE'?'#2a2850':'#c4c0e8',textDecoration:task.status==='DONE'?'line-through':'none',lineHeight:'1.5',wordBreak:'break-word',transition:'color 0.2s'}}>
                {task.title}
              </span>

              {/* Badges */}
              <div style={{display:'flex',alignItems:'center',gap:'6px',flexShrink:0,flexWrap:'wrap',justifyContent:'flex-end'}}>
                {task.source==='VOICE' && (
                  <span style={{fontSize:'11px',color:'#818cf8',background:'rgba(99,102,241,0.1)',padding:'3px 8px',borderRadius:'6px',border:'1px solid rgba(99,102,241,0.2)',whiteSpace:'nowrap'}}>
                    Voice
                  </span>
                )}
                <span style={{fontSize:'11px',padding:'3px 8px',borderRadius:'6px',whiteSpace:'nowrap',
                  background:task.status==='DONE'?'rgba(52,211,153,0.1)':'rgba(245,158,11,0.1)',
                  color:task.status==='DONE'?'#34d399':'#f59e0b',
                  border:`1px solid ${task.status==='DONE'?'rgba(52,211,153,0.2)':'rgba(245,158,11,0.2)'}`}}>
                  {task.status}
                </span>
              </div>

              {/* Delete */}
              <button className="del-btn" onClick={() => deleteTask(task.id)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}