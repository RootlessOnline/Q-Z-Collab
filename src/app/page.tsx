'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  sender: 'Q' | 'Z' | 'Anubis' | 'system'
  text: string
  time: string
}

type Mode = 'split' | 'style' | 'code' | 'config'

// Anubis Personality State
interface Personality {
  mood: number
  chaos: number
  mystery: number
}

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

  // Code Helper state
  const [codeMessages, setCodeMessages] = useState<Message[]>([])
  const [codeInput, setCodeInput] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)
  const codeMessagesEndRef = useRef<HTMLDivElement>(null)
  const [codeOutput, setCodeOutput] = useState('')

  // UI state
  const [mode, setMode] = useState<Mode>('split')
  const [pushing, setPushing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [styleText, setStyleText] = useState('')

  // Anubis Personality
  const [anubisPersonality, setAnubisPersonality] = useState<Personality>({
    mood: 20, chaos: 60, mystery: 80
  })

  // Terminal thoughts
  const [zThoughts, setZThoughts] = useState<string[]>([])
  const [anubisThoughts, setAnubisThoughts] = useState<string[]>([])

  // Compute Anubis colors
  const anubisColors = {
    bg: `hsl(${280 + anubisPersonality.mood}, ${30 + anubisPersonality.chaos * 0.5}%, ${5 + anubisPersonality.mood * 0.1}%)`,
    accent: `hsl(${280 + anubisPersonality.mystery}, 80%, ${50 + anubisPersonality.mood * 0.3}%)`,
    glow: `hsl(${280 + anubisPersonality.chaos}, 100%, 50%)`
  }

  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      setZMessages([{ id: 0, sender: 'system', text: `🌲 Q-Z-Collab v3 🦌\n\nSplit: Z + Anubis\nStyle: UI changes\nCode: Advanced help`, time: new Date().toLocaleTimeString() }])
      setAnubisMessages([{ id: 0, sender: 'system', text: `🖤 Anubis 🖤\n\nI design my own space.\nMy mood shapes the UI.`, time: new Date().toLocaleTimeString() }])
      setStyleMessages([{ id: 0, sender: 'system', text: `🎨 Style Chat 🎨\n\nTell me what to change!`, time: new Date().toLocaleTimeString() }])
      setCodeMessages([{ id: 0, sender: 'system', text: `💻 Code Helper 💻\n\nAdvanced coding mode.\nNo repo needed - direct edits!`, time: new Date().toLocaleTimeString() }])
      fetch('/api/code?file=src/app/page.tsx').then(res => res.json()).then(data => { if (data.content) setStyleText(data.content) }).catch(() => {})
    }
  }, [mounted])

  const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom(zMessagesEndRef) }, [zMessages])
  useEffect(() => { scrollToBottom(anubisMessagesEndRef) }, [anubisMessages])
  useEffect(() => { scrollToBottom(styleMessagesEndRef) }, [styleMessages])
  useEffect(() => { scrollToBottom(codeMessagesEndRef) }, [codeMessages])

  const addZMessage = (sender: 'Q' | 'Z' | 'system', text: string) => {
    setZMessages(prev => [...prev, { id: Date.now(), sender, text, time: new Date().toLocaleTimeString() }])
  }
  const addAnubisMessage = (sender: 'Q' | 'Anubis' | 'system', text: string) => {
    setAnubisMessages(prev => [...prev, { id: Date.now(), sender, text, time: new Date().toLocaleTimeString() }])
  }
  const addStyleMessage = (sender: 'Q' | 'Z' | 'system', text: string) => {
    setStyleMessages(prev => [...prev, { id: Date.now(), sender, text, time: new Date().toLocaleTimeString() }])
  }
  const addCodeMessage = (sender: 'Q' | 'Z' | 'system', text: string) => {
    setCodeMessages(prev => [...prev, { id: Date.now(), sender, text, time: new Date().toLocaleTimeString() }])
  }

  const zThink = async (question: string): Promise<string> => {
    try {
      setZThoughts(['> Connecting to Ollama...', '> Processing: ' + question.substring(0, 30) + '...'])
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history: zMessages.filter(m => m.sender !== 'system') })
      })
      const data = await res.json()
      setZThoughts(prev => [...prev, '> Response generated!'])
      return data.response
    } catch { return "I'm here Q. Something went wrong." }
  }

  const anubisThink = async (question: string): Promise<string> => {
    try {
      setAnubisThoughts(['> Anubis awakening...', '> Analyzing: ' + question.substring(0, 30) + '...'])
      const res = await fetch('/api/anubis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history: anubisMessages.filter(m => m.sender !== 'system'), personality: anubisPersonality })
      })
      const data = await res.json()
      setAnubisThoughts(prev => [...prev, '> Response ready!'])
      if (data.personality) setAnubisPersonality(data.personality)
      return data.response
    } catch { return "I'm here. Something went wrong." }
  }

  const styleThink = async (question: string): Promise<string> => {
    try {
      const res = await fetch('/api/style-ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, currentCode: styleText })
      })
      const data = await res.json()
      return data.response
    } catch { return "Couldn't process that." }
  }

  const codeThink = async (question: string): Promise<string> => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `[CODE MODE] ${question}\n\nProvide code solutions, file edits, or terminal commands.`, history: codeMessages.filter(m => m.sender !== 'system') })
      })
      const data = await res.json()
      return data.response
    } catch { return "Error in code processing." }
  }

  const pushToZ = async () => {
    setPushing(true)
    addZMessage('system', '📤 Pushing to GitHub...')
    try {
      const res = await fetch('/api/autopush', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'push-now' }) })
      const data = await res.json()
      addZMessage('system', data.success ? '✅ Pushed!' : `❌ ${data.error}`)
    } catch { addZMessage('system', '❌ Push failed.') }
    setPushing(false)
  }

  const saveStyle = async () => {
    try {
      const res = await fetch('/api/code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'src/app/page.tsx', content: styleText }) })
      const data = await res.json()
      addStyleMessage('system', data.success ? '✅ Saved! Refresh to see.' : `❌ ${data.error}`)
    } catch { addStyleMessage('system', '❌ Save failed.') }
  }

  const handleZSend = async () => {
    if (!zInput.trim() || zLoading) return
    const text = zInput.trim()
    setZInput('')
    if (text === '!push') { pushToZ(); return }
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

  const handleCodeSend = async () => {
    if (!codeInput.trim() || codeLoading) return
    const text = codeInput.trim()
    setCodeInput('')
    addCodeMessage('Q', text)
    setCodeLoading(true)
    const response = await codeThink(text)
    setCodeLoading(false)
    addCodeMessage('Z', response)
    setCodeOutput(response)
  }

  // Message bubble
  const MessageBubble = ({ msg, accent }: { msg: Message; accent: string }) => {
    const isQ = msg.sender === 'Q'
    const color = msg.sender === 'Q' ? accent : msg.sender === 'Z' ? '#0f0' : msg.sender === 'Anubis' ? anubisColors.accent : '#888'
    return (
      <div style={{
        padding: '0.5rem 0.8rem', borderRadius: '4px', background: `${color}15`,
        border: `1px solid ${color}60`, alignSelf: isQ ? 'flex-end' : 'flex-start',
        maxWidth: '85%', whiteSpace: 'pre-wrap', boxShadow: `0 0 8px ${color}30`, margin: '0.15rem 0'
      }}>
        <div style={{ color, fontSize: '0.65rem', marginBottom: '0.15rem', fontWeight: 'bold' }}>{msg.sender} • {msg.time}</div>
        <div style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>{msg.text}</div>
      </div>
    )
  }

  // Terminal - Fixed at top when active
  const Terminal = ({ title, thoughts, color }: { title: string; thoughts: string[]; color: string }) => (
    <div style={{
      background: '#000', border: `1px solid ${color}`, borderRadius: '4px', padding: '0.3rem',
      fontFamily: 'monospace', fontSize: '0.6rem', flexShrink: 0
    }}>
      <div style={{ color, borderBottom: `1px solid ${color}40`, paddingBottom: '0.15rem', marginBottom: '0.15rem' }}>⬡ {title}</div>
      <div style={{ color: '#0f0', maxHeight: '40px', overflow: 'auto' }}>
        {thoughts.map((t, i) => <div key={i}>{t}</div>)}
        <span style={{ animation: 'blink 1s infinite' }}>▌</span>
      </div>
    </div>
  )

  // Personality Slider
  const PersonalitySlider = ({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) => (
    <div style={{ marginBottom: '0.3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#888' }}>
        <span>{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <input type="range" min="0" max="100" value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: color }} />
    </div>
  )

  // Chat Panel Component - with sticky header
  const ChatPanel = ({ 
    title, subtitle, headerColor, bgColor, borderColor, messages, messagesEndRef,
    input, setInput, onSend, loading, thoughts, accentColor
  }: {
    title: string; subtitle?: string; headerColor: string; bgColor: string; borderColor: string;
    messages: Message[]; messagesEndRef: React.RefObject<HTMLDivElement | null>;
    input: string; setInput: (v: string) => void; onSend: () => void; loading: boolean;
    thoughts?: string[]; accentColor: string;
  }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: bgColor, minWidth: 0 }}>
      {/* Sticky Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10, padding: '0.5rem',
        borderBottom: `1px solid ${borderColor}`, background: bgColor
      }}>
        <span style={{ color: headerColor, fontWeight: 'bold', fontSize: '0.85rem' }}>{title}</span>
        {subtitle && <span style={{ fontSize: '0.55rem', color: '#666', marginLeft: '0.4rem' }}>{subtitle}</span>}
      </div>
      
      {/* Terminal (if active) - also sticky */}
      {loading && thoughts && thoughts.length > 0 && (
        <div style={{ position: 'sticky', top: '35px', zIndex: 9 }}>
          <Terminal title={title.split(' ')[0]} thoughts={thoughts} color={headerColor} />
        </div>
      )}
      
      {/* Scrollable Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {messages.map(m => <MessageBubble key={m.id} msg={m} accent={accentColor} />)}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div style={{ padding: '0.4rem', borderTop: `1px solid ${borderColor}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSend()}
            style={{ flex: 1, background: '#000', border: `1px solid ${borderColor}`, borderRadius: '4px', padding: '0.4rem', color: headerColor, fontSize: '0.75rem', outline: 'none' }} />
          <button onClick={onSend} style={{ background: headerColor, border: 'none', borderRadius: '4px', padding: '0.4rem 0.6rem', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.7rem' }}>Send</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #000010 0%, #000030 50%, #000020 100%)', display: 'flex', fontFamily: 'monospace', color: '#e0e0e0', position: 'relative' }}>
      {/* Stars */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(1px 1px at 20px 30px, #fff, transparent), radial-gradient(1px 1px at 40px 70px, #0ff, transparent)', backgroundSize: '200px 200px', opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      {/* Fixed Sidebar */}
      <div style={{ position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)', width: '44px', background: 'linear-gradient(180deg, #101020, #000010)', borderRight: '1px solid #0ff3', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.3rem', gap: '0.3rem', zIndex: 1000 }}>
        <div style={{ color: '#0ff', fontSize: '0.9rem' }}>⬡</div>
        {[{ m: 'split', icon: '💬' }, { m: 'style', icon: '🎨' }, { m: 'code', icon: '💻' }, { m: 'config', icon: '⚙️' }].map(b => (
          <button key={b.m} onClick={() => setMode(b.m as Mode)} style={{
            padding: '0.5rem', background: mode === b.m ? '#0ff30' : 'transparent',
            border: mode === b.m ? '1px solid #0ff' : '1px solid transparent',
            borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'
          }}>{b.icon}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={pushToZ} disabled={pushing} style={{ padding: '0.5rem', background: '#0f020', border: '1px solid #0f0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>📤</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', marginLeft: '44px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        
        {/* SPLIT MODE */}
        {mode === 'split' && (
          <>
            <ChatPanel title="🌲 Z" headerColor="#0ff" bgColor="#00001080" borderColor="#0ff3"
              messages={zMessages} messagesEndRef={zMessagesEndRef} input={zInput} setInput={setZInput}
              onSend={handleZSend} loading={zLoading} thoughts={zThoughts} accentColor="#0ff" />
            
            {/* Anubis with personality controls */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: anubisColors.bg, borderLeft: `1px solid ${anubisColors.accent}50`, minWidth: 0 }}>
              {/* Sticky Header */}
              <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '0.5rem', borderBottom: `1px solid ${anubisColors.accent}50`, background: anubisColors.bg }}>
                <span style={{ color: anubisColors.accent, fontWeight: 'bold', fontSize: '0.85rem' }}>🖤 Anubis</span>
                <span style={{ fontSize: '0.55rem', color: '#666', marginLeft: '0.4rem' }}>mood:{anubisPersonality.mood} chaos:{anubisPersonality.chaos}</span>
              </div>
              
              {/* Personality Controls - Sticky */}
              <div style={{ position: 'sticky', top: '35px', zIndex: 9, padding: '0.3rem', background: '#000', borderBottom: `1px solid ${anubisColors.accent}30`, flexShrink: 0 }}>
                <PersonalitySlider label="Mood" value={anubisPersonality.mood} onChange={v => setAnubisPersonality(p => ({ ...p, mood: v }))} color={anubisColors.accent} />
                <PersonalitySlider label="Chaos" value={anubisPersonality.chaos} onChange={v => setAnubisPersonality(p => ({ ...p, chaos: v }))} color={anubisColors.glow} />
                <PersonalitySlider label="Mystery" value={anubisPersonality.mystery} onChange={v => setAnubisPersonality(p => ({ ...p, mystery: v }))} color="#f0f" />
              </div>
              
              {/* Terminal */}
              {anubisLoading && anubisThoughts.length > 0 && (
                <div style={{ position: 'sticky', top: '100px', zIndex: 8 }}>
                  <Terminal title="Anubis" thoughts={anubisThoughts} color={anubisColors.accent} />
                </div>
              )}
              
              {/* Messages */}
              <div style={{ flex: 1, overflow: 'auto', padding: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {anubisMessages.map(m => <MessageBubble key={m.id} msg={m} accent={anubisColors.accent} />)}
                <div ref={anubisMessagesEndRef} />
              </div>
              
              {/* Input */}
              <div style={{ padding: '0.4rem', borderTop: `1px solid ${anubisColors.accent}30`, flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <input value={anubisInput} onChange={e => setAnubisInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnubisSend()}
                    style={{ flex: 1, background: '#100010', border: `1px solid ${anubisColors.accent}50`, borderRadius: '4px', padding: '0.4rem', color: anubisColors.accent, fontSize: '0.75rem', outline: 'none' }} />
                  <button onClick={handleAnubisSend} style={{ background: anubisColors.accent, border: 'none', borderRadius: '4px', padding: '0.4rem 0.6rem', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.7rem' }}>Send</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STYLE MODE */}
        {mode === 'style' && (
          <>
            <ChatPanel title="🎨 Style Chat" headerColor="#0f0" bgColor="#00100080" borderColor="#0f03"
              messages={styleMessages} messagesEndRef={styleMessagesEndRef} input={styleInput} setInput={setStyleInput}
              onSend={handleStyleSend} loading={styleLoading} accentColor="#0f0" />
            
            {/* Code Editor */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000', minWidth: 0 }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '0.4rem', background: '#001000', borderBottom: '1px solid #0f03', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#0f0', fontSize: '0.7rem' }}>📝 page.tsx</span>
                <button onClick={saveStyle} style={{ background: '#0f020', border: '1px solid #0f0', color: '#0f0', padding: '0.15rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.6rem' }}>Save</button>
              </div>
              <textarea value={styleText} onChange={e => setStyleText(e.target.value)} spellCheck={false}
                style={{ flex: 1, background: '#000', border: 'none', padding: '0.4rem', color: '#0f0', fontSize: '0.6rem', fontFamily: 'monospace', resize: 'none', outline: 'none' }} />
            </div>
          </>
        )}

        {/* CODE MODE */}
        {mode === 'code' && (
          <>
            <ChatPanel title="💻 Code Helper" subtitle="Local dev" headerColor="#ff0" bgColor="#10100080" borderColor="#ff03"
              messages={codeMessages} messagesEndRef={codeMessagesEndRef} input={codeInput} setInput={setCodeInput}
              onSend={handleCodeSend} loading={codeLoading} accentColor="#ff0" />
            
            {/* Output */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a00', minWidth: 0 }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '0.4rem', background: '#101000', borderBottom: '1px solid #ff03' }}>
                <span style={{ color: '#ff0', fontSize: '0.7rem' }}>📤 Output</span>
              </div>
              <textarea value={codeOutput} readOnly style={{ flex: 1, background: '#0a0a00', border: 'none', padding: '0.4rem', color: '#ff0', fontSize: '0.6rem', fontFamily: 'monospace', resize: 'none', outline: 'none' }} />
            </div>
          </>
        )}

        {/* CONFIG MODE */}
        {mode === 'config' && (
          <div style={{ flex: 1, padding: '1rem', overflow: 'auto' }}>
            <h2 style={{ color: '#f0f', marginTop: 0 }}>⚙️ Config</h2>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ color: '#0ff' }}>Anubis Personality UI</h3>
              <p style={{ color: '#666', fontSize: '0.75rem' }}>Anubis's UI changes based on personality sliders. Higher mood = brighter colors, more chaos = wilder effects.</p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ color: '#0ff' }}>Modes</h3>
              <p style={{ color: '#888', fontSize: '0.75rem' }}>💬 Split - Z + Anubis chats<br/>🎨 Style - UI changes + code editor<br/>💻 Code - Advanced local coding help<br/>⚙️ Config - This screen</p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ color: '#0ff' }}>Commands</h3>
              <p style={{ color: '#888', fontSize: '0.75rem' }}><code style={{ color: '#0f0' }}>!push</code> - Push to GitHub<br/><code style={{ color: '#0f0' }}>!clear</code> - Clear chat</p>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }`}</style>
    </div>
  )
}
