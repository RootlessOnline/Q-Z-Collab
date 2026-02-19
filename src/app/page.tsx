'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  sender: 'Q' | 'Z' | 'Anubis' | 'system'
  text: string
  time: string
}

type Mode = 'split' | 'style' | 'config'

export default function Home() {
  // Z Chat state
  const [zMessages, setZMessages] = useState<Message[]>([])
  const [zInput, setZInput] = useState('')
  const [zLoading, setZLoading] = useState(false)
  const zMessagesEndRef = useRef<HTMLDivElement>(null)

  // Anubis Chat state
  const [anubisMessages, setAnubisMessages] = useState<Message[]>([])
  const [anubisInput, setAnubisInput] = useState('')
  const [anubisLoading, setAnubisLoading] = useState(false)
  const anubisMessagesEndRef = useRef<HTMLDivElement>(null)

  // Style Chat state
  const [styleMessages, setStyleMessages] = useState<Message[]>([])
  const [styleInput, setStyleInput] = useState('')
  const [styleLoading, setStyleLoading] = useState(false)
  const styleMessagesEndRef = useRef<HTMLDivElement>(null)

  // UI state
  const [mode, setMode] = useState<Mode>('split')
  const [pushing, setPushing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [styleText, setStyleText] = useState('')

  // Terminal thoughts
  const [zThoughts, setZThoughts] = useState<string[]>([])
  const [anubisThoughts, setAnubisThoughts] = useState<string[]>([])

  // Set initial messages after mount
  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      const welcomeMsg = `🌲 Q-Z-Collab v2 🦌

Left: Z (your partner)
Right: Anubis (can't see Z)
Style Tab: UI-focused chat

Just type to chat!`
      
      setZMessages([{
        id: 0,
        sender: 'system',
        text: welcomeMsg,
        time: new Date().toLocaleTimeString()
      }])

      setAnubisMessages([{
        id: 0,
        sender: 'system',
        text: `🖤 Anubis Chat 🖤\n\nI can see your messages, but not Z's.`,
        time: new Date().toLocaleTimeString()
      }])

      setStyleMessages([{
        id: 0,
        sender: 'system',
        text: `🎨 Style Chat 🎨\n\nTell me what you want to change!`,
        time: new Date().toLocaleTimeString()
      }])

      fetch('/api/code?file=src/app/page.tsx')
        .then(res => res.json())
        .then(data => {
          if (data.content) setStyleText(data.content)
        })
        .catch(() => {})
    }
  }, [mounted])

  const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom(zMessagesEndRef) }, [zMessages])
  useEffect(() => { scrollToBottom(anubisMessagesEndRef) }, [anubisMessages])
  useEffect(() => { scrollToBottom(styleMessagesEndRef) }, [styleMessages])

  const addZMessage = (sender: 'Q' | 'Z' | 'system', text: string) => {
    setZMessages(prev => [...prev, {
      id: Date.now(), sender, text, time: new Date().toLocaleTimeString()
    }])
  }

  const addAnubisMessage = (sender: 'Q' | 'Anubis' | 'system', text: string) => {
    setAnubisMessages(prev => [...prev, {
      id: Date.now(), sender, text, time: new Date().toLocaleTimeString()
    }])
  }

  const addStyleMessage = (sender: 'Q' | 'Z' | 'system', text: string) => {
    setStyleMessages(prev => [...prev, {
      id: Date.now(), sender, text, time: new Date().toLocaleTimeString()
    }])
  }

  const zThink = async (question: string): Promise<string> => {
    try {
      setZThoughts(['> Connecting to Ollama...', '> Processing: ' + question.substring(0, 30) + '...'])
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: question,
          history: zMessages.filter(m => m.sender !== 'system')
        })
      })
      const data = await res.json()
      setZThoughts(prev => [...prev, '> Response generated!'])
      return data.response
    } catch {
      return "I'm here Q. Something went wrong."
    }
  }

  const anubisThink = async (question: string): Promise<string> => {
    try {
      setAnubisThoughts(['> Initializing Anubis...', '> Analyzing: ' + question.substring(0, 30) + '...'])
      const res = await fetch('/api/anubis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: question,
          history: anubisMessages.filter(m => m.sender !== 'system')
        })
      })
      const data = await res.json()
      setAnubisThoughts(prev => [...prev, '> Response ready!'])
      return data.response
    } catch {
      return "I'm here. Something went wrong."
    }
  }

  const styleThink = async (question: string): Promise<string> => {
    try {
      const res = await fetch('/api/style-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: question,
          currentCode: styleText
        })
      })
      const data = await res.json()
      return data.response
    } catch {
      return "Couldn't process that. Try again!"
    }
  }

  const pushToZ = async () => {
    setPushing(true)
    addZMessage('system', '📤 Pushing to GitHub...')
    try {
      const res = await fetch('/api/autopush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'push-now' })
      })
      const data = await res.json()
      if (data.success) {
        addZMessage('system', '✅ Pushed! Real Z can see it now.')
      } else {
        addZMessage('system', `❌ ${data.error}`)
      }
    } catch {
      addZMessage('system', '❌ Push failed.')
    }
    setPushing(false)
  }

  const saveStyle = async () => {
    try {
      const res = await fetch('/api/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          file: 'src/app/page.tsx', 
          content: styleText 
        })
      })
      const data = await res.json()
      if (data.success) {
        addStyleMessage('system', '✅ Saved! Refresh page to see changes.')
      } else {
        addStyleMessage('system', `❌ Save failed: ${data.error || 'Unknown error'}`)
      }
    } catch {
      addStyleMessage('system', '❌ Save failed - network error')
    }
  }

  const handleZSend = async () => {
    if (!zInput.trim() || zLoading) return
    const text = zInput.trim()
    setZInput('')
    
    if (text === '!push') { pushToZ(); return }
    if (text === '!clear') {
      setZMessages([{ id: Date.now(), sender: 'system', text: 'Chat cleared.', time: new Date().toLocaleTimeString() }])
      return
    }
    
    addZMessage('Q', text)
    setZLoading(true)
    const response = await zThink(text)
    setZLoading(false)
    addZMessage('Z', response)
  }

  const handleAnubisSend = async () => {
    if (!anubisInput.trim() || anubisLoading) return
    const text = anubisInput.trim()
    setAnubisInput('')
    
    addAnubisMessage('Q', text)
    setAnubisLoading(true)
    const response = await anubisThink(text)
    setAnubisLoading(false)
    addAnubisMessage('Anubis', response)
  }

  const handleStyleSend = async () => {
    if (!styleInput.trim() || styleLoading) return
    const text = styleInput.trim()
    setStyleInput('')
    
    addStyleMessage('Q', text)
    setStyleLoading(true)
    const response = await styleThink(text)
    setStyleLoading(false)
    addStyleMessage('Z', response)
  }

  // Message bubble component
  const MessageBubble = ({ msg, accentColor }: { msg: Message; accentColor: string }) => {
    const senderColor = msg.sender === 'Q' ? accentColor : 
                        msg.sender === 'Z' ? '#0f0' :
                        msg.sender === 'Anubis' ? '#f0f' : '#888'
    const bgColor = msg.sender === 'Q' ? `${accentColor}20` : 
                    msg.sender === 'Z' ? '#0f020' :
                    msg.sender === 'Anubis' ? '#f0f20' : '#111'
    const borderColor = msg.sender === 'Q' ? accentColor :
                        msg.sender === 'Z' ? '#0f0' :
                        msg.sender === 'Anubis' ? '#f0f' : '#333'

    return (
      <div style={{
        padding: '0.7rem 1rem',
        borderRadius: '4px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        alignSelf: msg.sender === 'Q' ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        whiteSpace: 'pre-wrap',
        boxShadow: `0 0 10px ${borderColor}40`
      }}>
        <div style={{
          fontWeight: 'bold',
          color: senderColor,
          marginBottom: '0.3rem',
          fontSize: '0.75rem',
          textShadow: `0 0 5px ${senderColor}`
        }}>
          {msg.sender} • {msg.time}
        </div>
        <div style={{ lineHeight: '1.5', fontSize: '0.85rem' }}>{msg.text}</div>
      </div>
    )
  }

  // Terminal component for AI thoughts
  const Terminal = ({ title, thoughts, color }: { title: string; thoughts: string[]; color: string }) => (
    <div style={{
      background: '#000',
      border: `1px solid ${color}`,
      borderRadius: '4px',
      padding: '0.5rem',
      marginBottom: '0.5rem',
      fontFamily: 'monospace',
      fontSize: '0.7rem',
      boxShadow: `0 0 20px ${color}40, inset 0 0 30px ${color}10`
    }}>
      <div style={{ color, marginBottom: '0.3rem', borderBottom: `1px solid ${color}40`, paddingBottom: '0.3rem' }}>
        ⬡ {title} Terminal
      </div>
      <div style={{ color: '#0f0', maxHeight: '80px', overflow: 'auto' }}>
        {thoughts.map((t, i) => (
          <div key={i} style={{ opacity: 0.8 }}>{t}</div>
        ))}
        <span style={{ animation: 'blink 1s infinite' }}>▌</span>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #000010 0%, #000030 50%, #000020 100%)',
      display: 'flex',
      fontFamily: 'monospace',
      color: '#e0e0e0',
      position: 'relative'
    }}>
      {/* Stars background effect */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(1px 1px at 20px 30px, #fff, transparent), radial-gradient(1px 1px at 40px 70px, #0ff, transparent), radial-gradient(1px 1px at 50px 160px, #ff0, transparent), radial-gradient(1px 1px at 90px 40px, #fff, transparent), radial-gradient(1px 1px at 130px 80px, #0ff, transparent)',
        backgroundSize: '200px 200px',
        opacity: 0.3,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Fixed Sidebar - stays in middle */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: '50px',
        background: 'linear-gradient(180deg, #101020, #000010)',
        borderRight: '1px solid #0ff3',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0.5rem',
        gap: '0.5rem',
        zIndex: 1000,
        boxShadow: '0 0 20px #0ff20'
      }}>
        <div style={{ color: '#0ff', fontSize: '1.2rem', marginBottom: '0.5rem', textShadow: '0 0 10px #0ff' }}>⬡</div>
        
        <button onClick={() => setMode('split')} style={{
          padding: '0.7rem',
          background: mode === 'split' ? '#0ff30' : 'transparent',
          border: mode === 'split' ? '1px solid #0ff' : '1px solid transparent',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem',
          boxShadow: mode === 'split' ? '0 0 10px #0ff50' : 'none'
        }} title="Split Chat">💬</button>
        
        <button onClick={() => setMode('style')} style={{
          padding: '0.7rem',
          background: mode === 'style' ? '#0f030' : 'transparent',
          border: mode === 'style' ? '1px solid #0f0' : '1px solid transparent',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem',
          boxShadow: mode === 'style' ? '0 0 10px #0f050' : 'none'
        }} title="Style Chat">🎨</button>
        
        <button onClick={() => setMode('config')} style={{
          padding: '0.7rem',
          background: mode === 'config' ? '#f0f30' : 'transparent',
          border: mode === 'config' ? '1px solid #f0f' : '1px solid transparent',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem',
          boxShadow: mode === 'config' ? '0 0 10px #f0f50' : 'none'
        }} title="Config">⚙️</button>
        
        <div style={{ flex: 1 }} />
        
        <button onClick={pushToZ} disabled={pushing} style={{
          padding: '0.7rem',
          background: pushing ? '#333' : '#0f020',
          border: '1px solid #0f0',
          borderRadius: '4px',
          cursor: pushing ? 'wait' : 'pointer',
          fontSize: '1rem',
          boxShadow: '0 0 10px #0f030'
        }} title="Push to Z">📤</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', marginLeft: '50px', position: 'relative', zIndex: 1 }}>
        
        {/* SPLIT MODE */}
        {mode === 'split' && (
          <>
            {/* Z Chat */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#00001080', borderRight: '1px solid #0ff3' }}>
              <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #0ff3', background: '#000020' }}>
                <span style={{ color: '#0ff', fontWeight: 'bold', textShadow: '0 0 10px #0ff' }}>🌲 Z</span>
              </div>
              
              {zLoading && zThoughts.length > 0 && (
                <Terminal title="Z" thoughts={zThoughts} color="#0ff" />
              )}
              
              <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {zMessages.map(msg => <MessageBubble key={msg.id} msg={msg} accentColor="#0ff" />)}
                <div ref={zMessagesEndRef} />
              </div>

              <div style={{ padding: '0.8rem', borderTop: '1px solid #0ff3' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input value={zInput} onChange={e => setZInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleZSend()} placeholder="Type..." disabled={zLoading} style={{
                    flex: 1, background: '#000020', border: '1px solid #0ff5', borderRadius: '4px', padding: '0.7rem', color: '#0ff', fontSize: '0.9rem', outline: 'none', boxShadow: 'inset 0 0 10px #0ff10'
                  }} />
                  <button onClick={handleZSend} disabled={zLoading} style={{
                    background: 'linear-gradient(135deg, #0ff, #08f)', border: 'none', borderRadius: '4px', padding: '0.7rem 1.2rem', color: '#000', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px #0ff50'
                  }}>Send</button>
                </div>
              </div>
            </div>

            {/* Anubis Chat */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#10001080', borderRight: '1px solid #f0f3' }}>
              <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #f0f3', background: '#100010' }}>
                <span style={{ color: '#f0f', fontWeight: 'bold', textShadow: '0 0 10px #f0f' }}>🖤 Anubis</span>
              </div>
              
              {anubisLoading && anubisThoughts.length > 0 && (
                <Terminal title="Anubis" thoughts={anubisThoughts} color="#f0f" />
              )}
              
              <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {anubisMessages.map(msg => <MessageBubble key={msg.id} msg={msg} accentColor="#f0f" />)}
                <div ref={anubisMessagesEndRef} />
              </div>

              <div style={{ padding: '0.8rem', borderTop: '1px solid #f0f3' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input value={anubisInput} onChange={e => setAnubisInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnubisSend()} placeholder="Type..." disabled={anubisLoading} style={{
                    flex: 1, background: '#100010', border: '1px solid #f0f5', borderRadius: '4px', padding: '0.7rem', color: '#f0f', fontSize: '0.9rem', outline: 'none', boxShadow: 'inset 0 0 10px #f0f10'
                  }} />
                  <button onClick={handleAnubisSend} disabled={anubisLoading} style={{
                    background: 'linear-gradient(135deg, #f0f, #a0a)', border: 'none', borderRadius: '4px', padding: '0.7rem 1.2rem', color: '#000', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px #f0f50'
                  }}>Send</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STYLE MODE */}
        {mode === 'style' && (
          <>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#00100080', borderRight: '1px solid #0f03' }}>
              <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #0f03', background: '#001000' }}>
                <span style={{ color: '#0f0', fontWeight: 'bold', textShadow: '0 0 10px #0f0' }}>🎨 Style Chat</span>
              </div>
              
              <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {styleMessages.map(msg => <MessageBubble key={msg.id} msg={msg} accentColor="#0f0" />)}
                <div ref={styleMessagesEndRef} />
              </div>

              <div style={{ padding: '0.8rem', borderTop: '1px solid #0f03' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input value={styleInput} onChange={e => setStyleInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleStyleSend()} placeholder="Type..." disabled={styleLoading} style={{
                    flex: 1, background: '#001000', border: '1px solid #0f05', borderRadius: '4px', padding: '0.7rem', color: '#0f0', fontSize: '0.9rem', outline: 'none', boxShadow: 'inset 0 0 10px #0f010'
                  }} />
                  <button onClick={handleStyleSend} disabled={styleLoading} style={{
                    background: 'linear-gradient(135deg, #0f0, #0a0)', border: 'none', borderRadius: '4px', padding: '0.7rem 1.2rem', color: '#000', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px #0f050'
                  }}>Send</button>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000', borderLeft: '1px solid #0f03' }}>
              <div style={{ padding: '0.6rem 1rem', background: '#001000', borderBottom: '1px solid #0f03', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#0f0', fontSize: '0.85rem' }}>📝 page.tsx</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={saveStyle} style={{ background: '#0f020', border: '1px solid #0f0', color: '#0f0', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Save</button>
                  <button onClick={() => { fetch('/api/code?file=src/app/page.tsx').then(res => res.json()).then(data => { if (data.content) setStyleText(data.content) }) }} style={{ background: '#333', border: '1px solid #555', color: '#888', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Reset</button>
                </div>
              </div>
              <textarea value={styleText} onChange={e => setStyleText(e.target.value)} spellCheck={false} style={{
                flex: 1, background: '#000', border: 'none', padding: '0.8rem', color: '#0f0', fontSize: '0.7rem', fontFamily: 'monospace', resize: 'none', outline: 'none', lineHeight: '1.4'
              }} />
            </div>
          </>
        )}

        {/* CONFIG MODE */}
        {mode === 'config' && (
          <div style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
            <h2 style={{ color: '#f0f', marginTop: 0, textShadow: '0 0 10px #f0f' }}>⚙️ Config</h2>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#0ff' }}>Commands</h3>
              <p style={{ color: '#888' }}>
                <code style={{ color: '#0f0' }}>!push</code> - Send chat to GitHub<br/>
                <code style={{ color: '#0f0' }}>!clear</code> - Clear chat
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#0ff' }}>About</h3>
              <p style={{ color: '#888' }}>
                Q-Z-Collab v2<br/>
                🌲 Z - Your AI partner (left panel)<br/>
                🖤 Anubis - Independent AI (right panel)<br/>
                Z cannot see Anubis chat and vice versa!
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
