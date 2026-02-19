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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      sender: 'system',
      text: `🌲 Q-Z-Collab 🦌

Chat with Z • Type 'z <message>' to talk
Push 📤 to send chat to Real Z`,
      time: new Date().toLocaleTimeString()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>('chat')
  const [pushing, setPushing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Code mode state
  const [codeContent, setCodeContent] = useState('')
  const [currentFile, setCurrentFile] = useState('')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load current page code for code mode
  useEffect(() => {
    if (mode === 'code') {
      fetch('/api/code?file=src/app/page.tsx')
        .then(res => res.json())
        .then(data => {
          if (data.content) {
            setCodeContent(data.content)
            setCurrentFile('src/app/page.tsx')
          }
        })
        .catch(() => {})
    }
  }, [mode])

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
    
    // Commands
    if (text === 'push') {
      pushToZ()
      return
    }
    if (text === 'clear') {
      setMessages([{
        id: Date.now(),
        sender: 'system',
        text: 'Chat cleared.',
        time: new Date().toLocaleTimeString()
      }])
      return
    }
    
    addMessage('Q', text)
    
    if (text.startsWith('z ')) {
      setLoading(true)
      const response = await zThink(text.slice(2))
      setLoading(false)
      addMessage('Z', response)
    } else {
      setTimeout(() => addMessage('system', '[Z listening...]'), 100)
    }
  }

  const saveCode = async () => {
    if (!currentFile) return
    try {
      const res = await fetch('/api/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: currentFile, content: codeContent })
      })
      const data = await res.json()
      if (data.success) {
        addMessage('system', '✅ Code saved! Refresh to see changes.')
      }
    } catch {}
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
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
          { id: 'chat' as Mode, label: '💬 Chat', color: '#00d4ff' },
          { id: 'code' as Mode, label: '📝 Code', color: '#00ff00' },
          { id: 'config' as Mode, label: '⚙️ Config', color: '#ff00ff' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            style={{
              flex: 1,
              padding: '1rem',
              background: mode === tab.id ? `${tab.color}20` : 'transparent',
              border: 'none',
              borderBottom: mode === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
              color: mode === tab.id ? tab.color : '#666',
              cursor: 'pointer',
              fontSize: '1rem',
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
              {messages.map(msg => (
                <div key={msg.id} style={{
                  padding: '0.7rem 1rem',
                  borderRadius: '8px',
                  background: msg.sender === 'Q' ? '#00d4ff10' : 
                              msg.sender === 'Z' ? '#ff00ff10' : '#222',
                  border: msg.sender === 'Q' ? '1px solid #00d4ff40' :
                          msg.sender === 'Z' ? '1px solid #ff00ff40' : '1px solid #333',
                  alignSelf: msg.sender === 'Q' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  whiteSpace: 'pre-wrap'
                }}>
                  <div style={{
                    fontWeight: 'bold',
                    color: msg.sender === 'Q' ? '#00d4ff' : 
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
                  placeholder="z <msg> to talk to Z..."
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
                    background: 'linear-gradient(135deg, #00d4ff, #ff00ff)',
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

        {/* CODE MODE */}
        {mode === 'code' && (
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
                📝 {currentFile || 'No file'}
              </span>
              <button
                onClick={saveCode}
                style={{
                  background: '#00ff0020',
                  border: '1px solid #00ff00',
                  color: '#00ff00',
                  padding: '0.4rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Save & Apply
              </button>
            </div>
            <textarea
              value={codeContent}
              onChange={e => setCodeContent(e.target.value)}
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
            <h2 style={{ color: '#ff00ff', marginTop: 0 }}>⚙️ Configuration</h2>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#00d4ff' }}>About</h3>
              <p style={{ color: '#888' }}>
                Q-Z-Collab is a private workspace where you (Q) chat with Z (AI).<br/>
                Z runs locally on your Ollama. Push 📤 to let Real Z see your chat.
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#00d4ff' }}>Commands</h3>
              <div style={{ color: '#888' }}>
                <p><code style={{ color: '#00ff00' }}>z &lt;msg&gt;</code> - Talk to Z</p>
                <p><code style={{ color: '#00ff00' }}>push</code> - Send chat to GitHub</p>
                <p><code style={{ color: '#00ff00' }}>clear</code> - Clear chat</p>
              </div>
            </div>

            <div>
              <h3 style={{ color: '#00d4ff' }}>Quick Actions</h3>
              <button
                onClick={pushToZ}
                disabled={pushing}
                style={{
                  background: '#00ff0020',
                  border: '1px solid #00ff00',
                  color: '#00ff00',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '8px',
                  cursor: pushing ? 'wait' : 'pointer',
                  marginRight: '0.5rem'
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
