'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  sender: 'Q' | 'Z' | 'system'
  text: string
  time: string
}

type Mode = 'chat' | 'code' | 'config'

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>('chat')
  const [pushing, setPushing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Code mode state - track the actual background color
  const [bgColor, setBgColor] = useState('#0a0a0a')
  const [primaryColor, setPrimaryColor] = useState('#00d4ff')

  // Set initial message after mount to avoid hydration error
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

  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    const text = input.trim()
    setInput('')
    
    // Commands only with !
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
    
    // Z ALWAYS responds now (no "z " prefix needed)
    setLoading(true)
    const response = await zThink(text)
    setLoading(false)
    addMessage('Z', response)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: bgColor,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'monospace',
      color: '#e0e0e0'
    }}>
      {/* Mode Tabs */}
      <div style={{
        display: 'flex',
        background: '#111',
        borderBottom: '1px solid #333'
      }}>
        {[
          { id: 'chat' as Mode, label: '💬 Chat', color: primaryColor },
          { id: 'code' as Mode, label: '🎨 Style', color: '#00ff00' },
          { id: 'config' as Mode, label: '⚙️ Config', color: '#ff00ff' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            style={{
              flex: 1,
              padding: '0.8rem',
              background: mode === tab.id ? `${tab.color}20` : 'transparent',
              border: 'none',
              borderBottom: mode === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
              color: mode === tab.id ? tab.color : '#666',
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
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
              {!mounted && (
                <div style={{ color: '#666', padding: '1rem' }}>Loading...</div>
              )}
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
                  onKeyDown={handleKeyDown}
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
                <button
                  onClick={pushToZ}
                  disabled={pushing}
                  style={{
                    background: pushing ? '#333' : '#00ff0020',
                    border: '1px solid #00ff00',
                    borderRadius: '8px',
                    padding: '0.8rem',
                    color: '#00ff00',
                    cursor: pushing ? 'wait' : 'pointer'
                  }}
                >
                  📤
                </button>
              </div>
            </div>
          </>
        )}

        {/* STYLE MODE (was Code) */}
        {mode === 'code' && (
          <div style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
            <h2 style={{ color: '#00ff00', marginTop: 0 }}>🎨 Quick Styles</h2>
            <p style={{ color: '#888', marginBottom: '2rem' }}>
              Changes apply instantly! No save needed.
            </p>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e0e0e0' }}>
                Background Color
              </label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                />
                <code style={{ color: '#888' }}>{bgColor}</code>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e0e0e0' }}>
                Primary Color (Q's messages)
              </label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                />
                <code style={{ color: '#888' }}>{primaryColor}</code>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e0e0e0' }}>
                Quick Presets
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { name: 'Green', bg: '#0d1f0d', primary: '#00ff00' },
                  { name: 'Purple', bg: '#1a0a2e', primary: '#a855f7' },
                  { name: 'Blue', bg: '#0a1628', primary: '#3b82f6' },
                  { name: 'Orange', bg: '#1a1000', primary: '#f97316' },
                  { name: 'Red', bg: '#1a0a0a', primary: '#ef4444' },
                  { name: 'Original', bg: '#0a0a0a', primary: '#00d4ff' },
                ].map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => { setBgColor(preset.bg); setPrimaryColor(preset.primary); }}
                    style={{
                      background: preset.bg,
                      border: `2px solid ${preset.primary}`,
                      color: preset.primary,
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONFIG MODE */}
        {mode === 'config' && (
          <div style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
            <h2 style={{ color: '#ff00ff', marginTop: 0 }}>⚙️ Config</h2>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: primaryColor }}>About</h3>
              <p style={{ color: '#888' }}>
                Q-Z-Collab - Chat with Z (runs on your Ollama)<br/>
                Push 📤 to send chat to Real Z for review.
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: primaryColor }}>Commands</h3>
              <div style={{ color: '#888' }}>
                <p><code style={{ color: '#00ff00' }}>!push</code> - Send chat to GitHub</p>
                <p><code style={{ color: '#00ff00' }}>!clear</code> - Clear chat</p>
              </div>
            </div>

            <div>
              <button
                onClick={pushToZ}
                disabled={pushing}
                style={{
                  background: '#00ff0020',
                  border: '1px solid #00ff00',
                  color: '#00ff00',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '8px',
                  cursor: pushing ? 'wait' : 'pointer'
                }}
              >
                📤 Push Chat to Real Z
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
