'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  sender: 'Q' | 'Z' | 'Anubis' | 'system'
  text: string
  time: string
}

type Mode = 'split' | 'style'

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
  const [liveCSS, setLiveCSS] = useState('')

  // Colors
  const [bgColor, setBgColor] = useState('#0a0a0a')
  const [primaryColor, setPrimaryColor] = useState('#00d4ff')

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
        text: `🎨 Style Chat 🎨\n\nTell me what you want to change!\nI understand UI requests.`,
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

  // Inject live CSS
  useEffect(() => {
    if (liveCSS) {
      let styleEl = document.getElementById('live-custom-style')
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = 'live-custom-style'
        document.head.appendChild(styleEl)
      }
      styleEl.textContent = liveCSS
    }
  }, [liveCSS])

  const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom(zMessagesEndRef)
  }, [zMessages])

  useEffect(() => {
    scrollToBottom(anubisMessagesEndRef)
  }, [anubisMessages])

  useEffect(() => {
    scrollToBottom(styleMessagesEndRef)
  }, [styleMessages])

  const addZMessage = (sender: 'Q' | 'Z' | 'system', text: string) => {
    setZMessages(prev => [...prev, {
      id: Date.now(),
      sender,
      text,
      time: new Date().toLocaleTimeString()
    }])
  }

  const addAnubisMessage = (sender: 'Q' | 'Anubis' | 'system', text: string) => {
    setAnubisMessages(prev => [...prev, {
      id: Date.now(),
      sender,
      text,
      time: new Date().toLocaleTimeString()
    }])
  }

  const addStyleMessage = (sender: 'Q' | 'Z' | 'system', text: string) => {
    setStyleMessages(prev => [...prev, {
      id: Date.now(),
      sender,
      text,
      time: new Date().toLocaleTimeString()
    }])
  }

  // Z Chat - talks to Z endpoint
  const zThink = async (question: string): Promise<string> => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: question,
          history: zMessages.filter(m => m.sender !== 'system')
        })
      })
      const data = await res.json()
      return data.response
    } catch {
      return "I'm here Q. Something went wrong."
    }
  }

  // Anubis Chat - talks to Anubis endpoint (separate AI)
  const anubisThink = async (question: string): Promise<string> => {
    try {
      const res = await fetch('/api/anubis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: question,
          history: anubisMessages.filter(m => m.sender !== 'system')
        })
      })
      const data = await res.json()
      return data.response
    } catch {
      return "I'm here. Something went wrong."
    }
  }

  // Style Chat - talks to Style endpoint (UI-focused AI)
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
      
      // If response includes CSS changes, apply them live!
      if (data.css) {
        setLiveCSS(data.css)
      }
      if (data.code) {
        setStyleText(data.code)
      }
      
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
    } catch (e) {
      addStyleMessage('system', '❌ Save failed - network error')
    }
  }

  const handleZSend = async () => {
    if (!zInput.trim() || zLoading) return
    const text = zInput.trim()
    setZInput('')
    
    if (text === '!push') {
      pushToZ()
      return
    }
    if (text === '!clear') {
      setZMessages([{
        id: Date.now(),
        sender: 'system',
        text: 'Chat cleared.',
        time: new Date().toLocaleTimeString()
      }])
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

  // Chat panel component
  const ChatPanel = ({ 
    title, 
    messages, 
    input, 
    setInput, 
    onSend, 
    loading, 
    messagesEndRef,
    accentColor,
    bgColor: panelBg
  }: {
    title: string
    messages: Message[]
    input: string
    setInput: (v: string) => void
    onSend: () => void
    loading: boolean
    messagesEndRef: React.RefObject<HTMLDivElement | null>
    accentColor: string
    bgColor: string
  }) => (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: panelBg,
      borderRight: `1px solid #333`
    }}>
      {/* Header */}
      <div style={{
        padding: '0.8rem 1rem',
        borderBottom: `1px solid ${accentColor}40`,
        background: '#111',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ color: accentColor, fontWeight: 'bold' }}>{title}</span>
      </div>
      
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
            background: msg.sender === 'Q' ? `${accentColor}10` : 
                        msg.sender === 'Z' ? '#ff00ff10' :
                        msg.sender === 'Anubis' ? '#ff6b6b10' : '#222',
            border: msg.sender === 'Q' ? `1px solid ${accentColor}40` :
                    msg.sender === 'Z' ? '1px solid #ff00ff40' :
                    msg.sender === 'Anubis' ? '1px solid #ff6b6b40' : '1px solid #333',
            alignSelf: msg.sender === 'Q' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            whiteSpace: 'pre-wrap'
          }}>
            <div style={{
              fontWeight: 'bold',
              color: msg.sender === 'Q' ? accentColor : 
                     msg.sender === 'Z' ? '#ff00ff' :
                     msg.sender === 'Anubis' ? '#ff6b6b' : '#888',
              marginBottom: '0.3rem',
              fontSize: '0.8rem'
            }}>
              {msg.sender} • {msg.time}
            </div>
            <div style={{ lineHeight: '1.5', fontSize: '0.85rem' }}>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{
            padding: '0.7rem 1rem',
            background: `${accentColor}10`,
            border: `1px solid ${accentColor}40`,
            borderRadius: '8px',
            alignSelf: 'flex-start'
          }}>
            <span style={{ color: accentColor }}>🧠 thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '0.8rem', borderTop: '1px solid #333' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSend()}
            placeholder="Type..."
            disabled={loading}
            style={{
              flex: 1,
              background: '#1a1a2e',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '0.7rem',
              color: '#e0e0e0',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <button
            onClick={onSend}
            disabled={loading}
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
              border: 'none',
              borderRadius: '8px',
              padding: '0.7rem 1.2rem',
              color: '#000',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: bgColor,
      display: 'flex',
      fontFamily: 'monospace',
      color: '#e0e0e0'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '50px',
        background: '#111',
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        padding: '0.5rem',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => setMode('split')}
          style={{
            padding: '0.7rem',
            background: mode === 'split' ? `${primaryColor}30` : 'transparent',
            border: mode === 'split' ? `1px solid ${primaryColor}` : '1px solid transparent',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.1rem'
          }}
          title="Split Chat"
        >
          💬
        </button>
        <button
          onClick={() => setMode('style')}
          style={{
            padding: '0.7rem',
            background: mode === 'style' ? '#00ff0030' : 'transparent',
            border: mode === 'style' ? '1px solid #00ff00' : '1px solid transparent',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.1rem'
          }}
          title="Style Chat"
        >
          🎨
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={pushToZ}
          disabled={pushing}
          style={{
            padding: '0.7rem',
            background: pushing ? '#333' : '#00ff0020',
            border: '1px solid #00ff00',
            borderRadius: '8px',
            cursor: pushing ? 'wait' : 'pointer',
            fontSize: '1.1rem'
          }}
          title="Push to Z"
        >
          📤
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* SPLIT MODE - Z + Anubis */}
        {mode === 'split' && (
          <>
            <ChatPanel
              title="🌲 Z"
              messages={zMessages}
              input={zInput}
              setInput={setZInput}
              onSend={handleZSend}
              loading={zLoading}
              messagesEndRef={zMessagesEndRef}
              accentColor={primaryColor}
              bgColor="#0a0a0a"
            />
            <ChatPanel
              title="🖤 Anubis"
              messages={anubisMessages}
              input={anubisInput}
              setInput={setAnubisInput}
              onSend={handleAnubisSend}
              loading={anubisLoading}
              messagesEndRef={anubisMessagesEndRef}
              accentColor="#ff6b6b"
              bgColor="#0d0808"
            />
          </>
        )}

        {/* STYLE MODE - Style Chat + Code Editor */}
        {mode === 'style' && (
          <>
            <ChatPanel
              title="🎨 Style Chat"
              messages={styleMessages}
              input={styleInput}
              setInput={setStyleInput}
              onSend={handleStyleSend}
              loading={styleLoading}
              messagesEndRef={styleMessagesEndRef}
              accentColor="#00ff00"
              bgColor="#0a0a0a"
            />
            
            {/* Code Editor Panel */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: '#050505',
              borderLeft: '1px solid #333'
            }}>
              <div style={{
                padding: '0.6rem 1rem',
                background: '#111',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#00ff00', fontSize: '0.85rem' }}>
                  📝 src/app/page.tsx
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={saveStyle}
                    style={{
                      background: '#00ff0020',
                      border: '1px solid #00ff00',
                      color: '#00ff00',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
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
                      padding: '0.3rem 0.8rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
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
                  background: '#050505',
                  border: 'none',
                  padding: '0.8rem',
                  color: '#e0e0e0',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: '1.4'
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
