'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  sender: 'Q' | 'Z' | 'system'
  text: string
  time: string
}

type Mode = 'chat' | 'style' | 'config'

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>('chat')
  const [pushing, setPushing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Style state
  const [bgColor, setBgColor] = useState('#0a0a0a')
  const [primaryColor, setPrimaryColor] = useState('#00d4ff')
  const [styleText, setStyleText] = useState('')

  // Set initial message after mount
  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      setMessages([{
        id: 0,
        sender: 'system',
        text: `🌲 Q-Z-Collab 🦌

Just type to chat with Z!
Push 📤 to send chat to Real Z`,
        time: new Date().toLocaleTimeString()
      }])
      // Load current page code
      fetch('/api/code?file=src/app/page.tsx')
        .then(res => res.json())
        .then(data => {
          if (data.content) setStyleText(data.content)
        })
        .catch(() => {})
    }
  }, [mounted])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (sender: 'Q' | 'Z' | 'system', text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender,
      text,
      time: new Date().toLocaleTimeString()
    }])
  }

  const zThink = async (question: string): Promise<string> => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: question,
          history: messages.filter(m => m.sender !== 'system')
        })
      })
      const data = await res.json()
      return data.response
    } catch {
      return "I'm here Q. Something went wrong."
    }
  }

  const pushToZ = async () => {
    setPushing(true)
    addMessage('system', '📤 Pushing to GitHub...')
    try {
      const res = await fetch('/api/autopush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'push-now' })
      })
      const data = await res.json()
      if (data.success) {
        addMessage('system', '✅ Pushed! Real Z can see it now.')
      } else {
        addMessage('system', `❌ ${data.error}`)
      }
    } catch {
      addMessage('system', '❌ Push failed.')
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
        addMessage('system', '✅ Saved! Refresh page to see changes.')
      }
    } catch {
      addMessage('system', '❌ Save failed.')
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    const text = input.trim()
    setInput('')
    
    if (text.startsWith('!')) {
      if (text === '!push') {
        pushToZ()
        return
      }
      if (text === '!clear') {
        setMessages([{
          id: Date.now(),
          sender: 'system',
          text: 'Chat cleared.',
          time: new Date().toLocaleTimeString()
        }])
        return
      }
    }
    
    addMessage('Q', text)
    setLoading(true)
    const response = await zThink(text)
    setLoading(false)
    addMessage('Z', response)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: bgColor,
      display: 'flex',
      fontFamily: 'monospace',
      color: '#e0e0e0'
    }}>
      {/* Sidebar with buttons */}
      <div style={{
        width: '60px',
        background: '#111',
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        padding: '0.5rem',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => setMode('chat')}
          style={{
            padding: '0.8rem',
            background: mode === 'chat' ? `${primaryColor}30` : 'transparent',
            border: mode === 'chat' ? `1px solid ${primaryColor}` : '1px solid transparent',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.2rem'
          }}
          title="Chat"
        >
          💬
        </button>
        <button
          onClick={() => setMode('style')}
          style={{
            padding: '0.8rem',
            background: mode === 'style' ? '#00ff0030' : 'transparent',
            border: mode === 'style' ? '1px solid #00ff00' : '1px solid transparent',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.2rem'
          }}
          title="Style"
        >
          🎨
        </button>
        <button
          onClick={() => setMode('config')}
          style={{
            padding: '0.8rem',
            background: mode === 'config' ? '#ff00ff30' : 'transparent',
            border: mode === 'config' ? '1px solid #ff00ff' : '1px solid transparent',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.2rem'
          }}
          title="Config"
        >
          ⚙️
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={pushToZ}
          disabled={pushing}
          style={{
            padding: '0.8rem',
            background: pushing ? '#333' : '#00ff0020',
            border: '1px solid #00ff00',
            borderRadius: '8px',
            cursor: pushing ? 'wait' : 'pointer',
            fontSize: '1.2rem'
          }}
          title="Push to Z"
        >
          📤
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* CHAT MODE */}
        {mode === 'chat' && (
          <>
            {/* Messages */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {!mounted && <div style={{ color: '#666', padding: '1rem' }}>Loading...</div>}
              {messages.map(msg => (
                <div key={msg.id} style={{
                  padding: '0.7rem 1rem',
                  borderRadius: '8px',
                  background: msg.sender === 'Q' ? `${primaryColor}10` : 
                              msg.sender === 'Z' ? '#ff00ff10' : '#222',
                  border: msg.sender === 'Q' ? `1px solid ${primaryColor}40` :
                          msg.sender === 'Z' ? '1px solid #ff00ff40' : '1px solid #333',
                  alignSelf: msg.sender === 'Q' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  whiteSpace: 'pre-wrap'
                }}>
                  <div style={{
                    fontWeight: 'bold',
                    color: msg.sender === 'Q' ? primaryColor : 
                           msg.sender === 'Z' ? '#ff00ff' : '#888',
                    marginBottom: '0.3rem',
                    fontSize: '0.8rem'
                  }}>
                    {msg.sender} • {msg.time}
                  </div>
                  <div style={{ lineHeight: '1.5', fontSize: '0.9rem' }}>{msg.text}</div>
                </div>
              ))}
              {loading && (
                <div style={{
                  padding: '0.7rem 1rem',
                  background: '#ff00ff10',
                  border: '1px solid #ff00ff40',
                  borderRadius: '8px',
                  alignSelf: 'flex-start'
                }}>
                  <span style={{ color: '#ff00ff' }}>🧠 Z thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '1rem', borderTop: '1px solid #333' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Just type to chat..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: '#1a1a2e',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '0.8rem',
                    color: '#e0e0e0',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, #ff00ff)`,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.8rem 1.5rem',
                    color: '#000',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}

        {/* STYLE MODE - Code Editor */}
        {mode === 'style' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              padding: '0.5rem 1rem',
              background: '#111',
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#00ff00', fontSize: '0.9rem' }}>
                📝 src/app/page.tsx
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={saveStyle}
                  style={{
                    background: '#00ff0020',
                    border: '1px solid #00ff00',
                    color: '#00ff00',
                    padding: '0.4rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    fetch('/api/code?file=src/app/page.tsx')
                      .then(res => res.json())
                      .then(data => {
                        if (data.content) setStyleText(data.content)
                      })
                  }}
                  style={{
                    background: '#333',
                    border: '1px solid #555',
                    color: '#888',
                    padding: '0.4rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
            <textarea
              value={styleText}
              onChange={e => setStyleText(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                background: '#0a0a0a',
                border: 'none',
                padding: '1rem',
                color: '#e0e0e0',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                resize: 'none',
                outline: 'none',
                lineHeight: '1.5'
              }}
            />
          </div>
        )}

        {/* CONFIG MODE */}
        {mode === 'config' && (
          <div style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
            <h2 style={{ color: '#ff00ff', marginTop: 0 }}>⚙️ Config</h2>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: primaryColor }}>Colors</h3>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Background</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    style={{ width: '50px', height: '35px', cursor: 'pointer' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Primary</label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    style={{ width: '50px', height: '35px', cursor: 'pointer' }}
                  />
                </div>
              </div>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>
                Colors apply instantly. Go to Style tab to edit code.
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: primaryColor }}>Commands</h3>
              <p style={{ color: '#888' }}>
                <code style={{ color: '#00ff00' }}>!push</code> - Send chat to GitHub<br/>
                <code style={{ color: '#00ff00' }}>!clear</code> - Clear chat
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
