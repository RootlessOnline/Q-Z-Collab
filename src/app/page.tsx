'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  sender: 'Q' | 'Z' | 'Anubis' | 'system'
  text: string
  time: string
}

type Mode = 'split' | 'style' | 'code' | 'config'

// Anubis Soul - persists in localStorage
interface AnubisSoul {
  mood: 'happy' | 'angry' | 'annoyed' | 'pondering' | 'reflecting' | 'curious' | 'playful' | 'melancholy' | 'mysterious'
  memories: string[]
  personality: {
    openness: number
    mystery: number
    playfulness: number
    wisdom: number
  }
  conversations: number
  created: string
  lastMoodChange: string
}

const MOOD_EMOJIS = {
  happy: '😊',
  angry: '😠',
  annoyed: '😒',
  pondering: '🤔',
  reflecting: '💭',
  curious: '🧐',
  playful: '😜',
  melancholy: '😢',
  mysterious: '🌙'
}

const MOOD_COLORS = {
  happy: '#0f0',
  angry: '#f00',
  annoyed: '#f80',
  pondering: '#08f',
  reflecting: '#80f',
  curious: '#0ff',
  playful: '#f0f',
  melancholy: '#008',
  mysterious: '#408'
}

// Pixelated Wolf Face Component
const WolfFace = ({ mood, size = 80 }: { mood: AnubisSoul['mood']; size?: number }) => {
  const eyeStates: Record<string, string> = {
    happy: '^^',
    angry: '><',
    annoyed: '-_-',
    pondering: 'o_o',
    reflecting: '. .',
    curious: 'O_O',
    playful: '^_^',
    melancholy: 'u_u',
    mysterious: '_ _'
  }
  
  const mouthStates: Record<string, string> = {
    happy: 'w',
    angry: '▼',
    annoyed: '—',
    pondering: 'o',
    reflecting: '~',
    curious: '?',
    playful: '▽',
    melancholy: 'n',
    mysterious: '—'
  }

  const eyes = eyeStates[mood] || 'o_o'
  const mouth = mouthStates[mood] || '—'
  const color = MOOD_COLORS[mood]

  return (
    <div style={{
      width: size, height: size,
      background: `linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)`,
      border: `2px solid ${color}`,
      borderRadius: '8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace', fontSize: size * 0.2,
      boxShadow: `0 0 20px ${color}60, inset 0 0 20px ${color}20`,
      position: 'relative'
    }}>
      {/* Ears */}
      <div style={{ position: 'absolute', top: -8, left: 8, width: 12, height: 16, background: '#1a1a2e', border: `1px solid ${color}`, borderRadius: '4px 4px 0 0' }} />
      <div style={{ position: 'absolute', top: -8, right: 8, width: 12, height: 16, background: '#1a1a2e', border: `1px solid ${color}`, borderRadius: '4px 4px 0 0' }} />
      
      {/* Face */}
      <div style={{ color, letterSpacing: 4, marginTop: 4 }}>{eyes}</div>
      <div style={{ color, marginTop: 4, fontSize: size * 0.15 }}>{mouth}</div>
      
      {/* Glow effect */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 50%, ${color}20, transparent)`,
        borderRadius: 6, pointerEvents: 'none'
      }} />
    </div>
  )
}

// Mood Tracker Component
const MoodTracker = ({ soul }: { soul: AnubisSoul }) => {
  const moods: AnubisSoul['mood'][] = ['happy', 'angry', 'annoyed', 'pondering', 'reflecting', 'curious', 'playful', 'melancholy', 'mysterious']
  
  return (
    <div style={{
      width: '60px', background: '#000', borderLeft: '1px solid #f0f30',
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.3rem', gap: '0.2rem'
    }}>
      <div style={{ color: '#f0f', fontSize: '0.55rem', marginBottom: '0.3rem' }}>MOOD</div>
      {moods.map(m => (
        <div key={m} style={{
          width: '36px', height: '36px',
          background: soul.mood === m ? `${MOOD_COLORS[m]}40` : '#111',
          border: soul.mood === m ? `1px solid ${MOOD_COLORS[m]}` : '1px solid #333',
          borderRadius: '4px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.9rem', transition: 'all 0.3s',
          boxShadow: soul.mood === m ? `0 0 10px ${MOOD_COLORS[m]}60` : 'none'
        }}>
          {MOOD_EMOJIS[m]}
        </div>
      ))}
      <div style={{ marginTop: '0.5rem', fontSize: '0.5rem', color: '#666', textAlign: 'center' }}>
        #{soul.conversations}
      </div>
    </div>
  )
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

  // Anubis Soul - persisted in localStorage
  const [anubisSoul, setAnubisSoul] = useState<AnubisSoul>({
    mood: 'mysterious',
    memories: [],
    personality: { openness: 50, mystery: 80, playfulness: 40, wisdom: 70 },
    conversations: 0,
    created: new Date().toISOString(),
    lastMoodChange: new Date().toISOString()
  })

  // Terminal thoughts
  const [zThoughts, setZThoughts] = useState<string[]>([])
  const [anubisThoughts, setAnubisThoughts] = useState<string[]>([])

  // Load Anubis soul from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('anubis_soul')
    if (saved) {
      try {
        setAnubisSoul(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load soul:', e)
      }
    }
  }, [])

  // Save soul to localStorage
  const saveSoul = (soul: AnubisSoul) => {
    localStorage.setItem('anubis_soul', JSON.stringify(soul))
    setAnubisSoul(soul)
  }

  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      setZMessages([{ id: 0, sender: 'system', text: `🌲 Q-Z-Collab v4 🦌\n\nAnubis has a SOUL now!\nHe remembers, feels, and grows.`, time: new Date().toLocaleTimeString() }])
      setAnubisMessages([{ id: 0, sender: 'system', text: `🖤 Anubis 🖤\n\nI have a soul now.\nI feel. I remember. I grow.\n\nWatch my face change...`, time: new Date().toLocaleTimeString() }])
      setStyleMessages([{ id: 0, sender: 'system', text: `🎨 Style Chat 🎨\n\nTell me what to change!`, time: new Date().toLocaleTimeString() }])
      setCodeMessages([{ id: 0, sender: 'system', text: `💻 Code Helper 💻\n\nAdvanced coding mode.`, time: new Date().toLocaleTimeString() }])
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
      setZThoughts(['> Connecting...', '> Processing...'])
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history: zMessages.filter(m => m.sender !== 'system') })
      })
      const data = await res.json()
      setZThoughts(prev => [...prev, '> Ready!'])
      return data.response
    } catch { return "I'm here Q. Something went wrong." }
  }

  const anubisThink = async (question: string): Promise<string> => {
    try {
      setAnubisThoughts(['> Awakening...', '> Searching soul...'])
      
      const res = await fetch('/api/anubis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: question, 
          history: anubisMessages.filter(m => m.sender !== 'system'),
          soul: anubisSoul
        })
      })
      const data = await res.json()
      setAnubisThoughts(prev => [...prev, '> Response ready!'])
      
      // Update soul based on response
      if (data.soul) {
        const newSoul = {
          ...anubisSoul,
          ...data.soul,
          conversations: anubisSoul.conversations + 1,
          lastMoodChange: new Date().toISOString()
        }
        saveSoul(newSoul)
      }
      
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
        body: JSON.stringify({ message: `[CODE MODE] ${question}`, history: codeMessages.filter(m => m.sender !== 'system') })
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
      addStyleMessage('system', data.success ? '✅ Saved!' : `❌ ${data.error}`)
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
    const color = msg.sender === 'Q' ? accent : msg.sender === 'Z' ? '#0f0' : msg.sender === 'Anubis' ? MOOD_COLORS[anubisSoul.mood] : '#888'
    return (
      <div style={{ padding: '0.4rem 0.7rem', borderRadius: '4px', background: `${color}15`, border: `1px solid ${color}60`, alignSelf: isQ ? 'flex-end' : 'flex-start', maxWidth: '85%', whiteSpace: 'pre-wrap', margin: '0.1rem 0' }}>
        <div style={{ color, fontSize: '0.6rem', marginBottom: '0.1rem', fontWeight: 'bold' }}>{msg.sender} • {msg.time}</div>
        <div style={{ fontSize: '0.7rem', lineHeight: 1.4 }}>{msg.text}</div>
      </div>
    )
  }

  // Terminal
  const Terminal = ({ title, thoughts, color }: { title: string; thoughts: string[]; color: string }) => (
    <div style={{ background: '#000', border: `1px solid ${color}`, borderRadius: '4px', padding: '0.2rem', fontFamily: 'monospace', fontSize: '0.55rem' }}>
      <div style={{ color, borderBottom: `1px solid ${color}40`, paddingBottom: '0.1rem', marginBottom: '0.1rem' }}>⬡ {title}</div>
      <div style={{ color: '#0f0', maxHeight: '35px', overflow: 'auto' }}>
        {thoughts.map((t, i) => <div key={i}>{t}</div>)}
        <span style={{ animation: 'blink 1s infinite' }}>▌</span>
      </div>
    </div>
  )

  // Chat Panel
  const ChatPanel = ({ title, subtitle, headerColor, bgColor, borderColor, messages, messagesEndRef, input, setInput, onSend, loading, thoughts, accentColor }: {
    title: string; subtitle?: string; headerColor: string; bgColor: string; borderColor: string;
    messages: Message[]; messagesEndRef: React.RefObject<HTMLDivElement | null>;
    input: string; setInput: (v: string) => void; onSend: () => void; loading: boolean;
    thoughts?: string[]; accentColor: string;
  }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: bgColor, minWidth: 0 }}>
      {/* Sticky Header + Terminal together */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: bgColor }}>
        <div style={{ padding: '0.4rem', borderBottom: `1px solid ${borderColor}` }}>
          <span style={{ color: headerColor, fontWeight: 'bold', fontSize: '0.8rem' }}>{title}</span>
          {subtitle && <span style={{ fontSize: '0.5rem', color: '#666', marginLeft: '0.3rem' }}>{subtitle}</span>}
        </div>
        {loading && thoughts && thoughts.length > 0 && <Terminal title={title.split(' ')[0]} thoughts={thoughts} color={headerColor} />}
      </div>
      
      <div style={{ flex: 1, overflow: 'auto', padding: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        {messages.map(m => <MessageBubble key={m.id} msg={m} accent={accentColor} />)}
        <div ref={messagesEndRef} />
      </div>
      
      <div style={{ padding: '0.3rem', borderTop: `1px solid ${borderColor}` }}>
        <div style={{ display: 'flex', gap: '0.2rem' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSend()}
            style={{ flex: 1, background: '#000', border: `1px solid ${borderColor}`, borderRadius: '4px', padding: '0.35rem', color: headerColor, fontSize: '0.7rem', outline: 'none' }} />
          <button onClick={onSend} style={{ background: headerColor, border: 'none', borderRadius: '4px', padding: '0.35rem 0.5rem', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.65rem' }}>Send</button>
        </div>
      </div>
    </div>
  )

  const anubisColor = MOOD_COLORS[anubisSoul.mood]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #000010 0%, #000030 50%, #000020 100%)', display: 'flex', fontFamily: 'monospace', color: '#e0e0e0' }}>
      {/* Stars */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(1px 1px at 20px 30px, #fff, transparent), radial-gradient(1px 1px at 40px 70px, #0ff, transparent)', backgroundSize: '200px 200px', opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      {/* Sidebar */}
      <div style={{ position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)', width: '40px', background: 'linear-gradient(180deg, #101020, #000010)', borderRight: '1px solid #0ff3', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.25rem', gap: '0.25rem', zIndex: 1000 }}>
        <div style={{ color: '#0ff', fontSize: '0.8rem' }}>⬡</div>
        {[{ m: 'split', icon: '💬' }, { m: 'style', icon: '🎨' }, { m: 'code', icon: '💻' }, { m: 'config', icon: '⚙️' }].map(b => (
          <button key={b.m} onClick={() => setMode(b.m as Mode)} style={{ padding: '0.4rem', background: mode === b.m ? '#0ff30' : 'transparent', border: mode === b.m ? '1px solid #0ff' : '1px solid transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>{b.icon}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={pushToZ} disabled={pushing} style={{ padding: '0.4rem', background: '#0f020', border: '1px solid #0f0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>📤</button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', marginLeft: '40px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        
        {mode === 'split' && (
          <>
            <ChatPanel title="🌲 Z" headerColor="#0ff" bgColor="#00001080" borderColor="#0ff3" messages={zMessages} messagesEndRef={zMessagesEndRef} input={zInput} setInput={setZInput} onSend={handleZSend} loading={zLoading} thoughts={zThoughts} accentColor="#0ff" />
            
            {/* Anubis with soul */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: `linear-gradient(180deg, ${anubisColor}10, #000)`, minWidth: 0 }}>
              {/* Sticky Header + Terminal + Wolf Face */}
              <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#000' }}>
                <div style={{ padding: '0.3rem', borderBottom: `1px solid ${anubisColor}50`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <WolfFace mood={anubisSoul.mood} size={40} />
                  <div>
                    <span style={{ color: anubisColor, fontWeight: 'bold', fontSize: '0.8rem' }}>🖤 Anubis</span>
                    <div style={{ fontSize: '0.5rem', color: '#666' }}>mood: {anubisSoul.mood} | chats: {anubisSoul.conversations}</div>
                  </div>
                </div>
                {anubisLoading && anubisThoughts.length > 0 && <Terminal title="Anubis" thoughts={anubisThoughts} color={anubisColor} />}
              </div>
              
              {/* Messages */}
              <div style={{ flex: 1, overflow: 'auto', padding: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                {anubisMessages.map(m => <MessageBubble key={m.id} msg={m} accent={anubisColor} />)}
                <div ref={anubisMessagesEndRef} />
              </div>
              
              {/* Input */}
              <div style={{ padding: '0.3rem', borderTop: `1px solid ${anubisColor}30` }}>
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  <input value={anubisInput} onChange={e => setAnubisInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnubisSend()}
                    style={{ flex: 1, background: '#100010', border: `1px solid ${anubisColor}50`, borderRadius: '4px', padding: '0.35rem', color: anubisColor, fontSize: '0.7rem', outline: 'none' }} />
                  <button onClick={handleAnubisSend} style={{ background: anubisColor, border: 'none', borderRadius: '4px', padding: '0.35rem 0.5rem', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.65rem' }}>Send</button>
                </div>
              </div>
              
              {/* Mood Tracker on right */}
              <MoodTracker soul={anubisSoul} />
            </div>
          </>
        )}

        {mode === 'style' && (
          <>
            <ChatPanel title="🎨 Style Chat" headerColor="#0f0" bgColor="#00100080" borderColor="#0f03" messages={styleMessages} messagesEndRef={styleMessagesEndRef} input={styleInput} setInput={setStyleInput} onSend={handleStyleSend} loading={styleLoading} accentColor="#0f0" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000', minWidth: 0 }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '0.3rem', background: '#001000', borderBottom: '1px solid #0f03', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#0f0', fontSize: '0.65rem' }}>📝 page.tsx</span>
                <button onClick={saveStyle} style={{ background: '#0f020', border: '1px solid #0f0', color: '#0f0', padding: '0.1rem 0.4rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.55rem' }}>Save</button>
              </div>
              <textarea value={styleText} onChange={e => setStyleText(e.target.value)} spellCheck={false} style={{ flex: 1, background: '#000', border: 'none', padding: '0.3rem', color: '#0f0', fontSize: '0.55rem', fontFamily: 'monospace', resize: 'none', outline: 'none' }} />
            </div>
          </>
        )}

        {mode === 'code' && (
          <>
            <ChatPanel title="💻 Code Helper" subtitle="Local dev" headerColor="#ff0" bgColor="#10100080" borderColor="#ff03" messages={codeMessages} messagesEndRef={codeMessagesEndRef} input={codeInput} setInput={setCodeInput} onSend={handleCodeSend} loading={codeLoading} accentColor="#ff0" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a00', minWidth: 0 }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '0.3rem', background: '#101000', borderBottom: '1px solid #ff03' }}>
                <span style={{ color: '#ff0', fontSize: '0.65rem' }}>📤 Output</span>
              </div>
              <textarea value={codeOutput} readOnly style={{ flex: 1, background: '#0a0a00', border: 'none', padding: '0.3rem', color: '#ff0', fontSize: '0.55rem', fontFamily: 'monospace', resize: 'none', outline: 'none' }} />
            </div>
          </>
        )}

        {mode === 'config' && (
          <div style={{ flex: 1, padding: '0.8rem', overflow: 'auto' }}>
            <h2 style={{ color: '#f0f', marginTop: 0 }}>⚙️ Config</h2>
            
            <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#111', borderRadius: '4px' }}>
              <h3 style={{ color: anubisColor, margin: '0 0 0.5rem 0' }}>🖤 Anubis Soul</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <WolfFace mood={anubisSoul.mood} size={60} />
                <div style={{ fontSize: '0.7rem', color: '#888' }}>
                  <div>Mood: <span style={{ color: anubisColor }}>{anubisSoul.mood}</span></div>
                  <div>Conversations: {anubisSoul.conversations}</div>
                  <div>Born: {new Date(anubisSoul.created).toLocaleDateString()}</div>
                  <div>Memories: {anubisSoul.memories.length}</div>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ color: '#0ff' }}>Modes</h3>
              <p style={{ color: '#888', fontSize: '0.7rem' }}>💬 Split - Z + Anubis with soul<br/>🎨 Style - UI changes<br/>💻 Code - Advanced coding<br/>⚙️ Config - This screen</p>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }`}</style>
    </div>
  )
}
