'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  sender: 'Q' | 'Z' | 'Anubis' | 'system'
  text: string
  time: string
}

type Mode = 'split' | 'style' | 'code' | 'config'

// Anubis Soul
interface AnubisSoul {
  mood: 'happy' | 'angry' | 'annoyed' | 'pondering' | 'reflecting' | 'curious' | 'playful' | 'melancholy' | 'mysterious'
  moodIntensity: Record<string, number> // How much of each mood used
  memories: string[]
  personality: { openness: number; mystery: number; playfulness: number; wisdom: number }
  conversations: number
  created: string
}

const MOODS: { name: AnubisSoul['mood']; emoji: string; color: string }[] = [
  { name: 'happy', emoji: '😊', color: '#0f0' },
  { name: 'angry', emoji: '😠', color: '#f00' },
  { name: 'annoyed', emoji: '😒', color: '#f80' },
  { name: 'pondering', emoji: '🤔', color: '#08f' },
  { name: 'reflecting', emoji: '💭', color: '#80f' },
  { name: 'curious', emoji: '🧐', color: '#0ff' },
  { name: 'playful', emoji: '😜', color: '#f0f' },
  { name: 'melancholy', emoji: '😢', color: '#008' },
  { name: 'mysterious', emoji: '🌙', color: '#608' }
]

// Pixelated Wolf Face
const WolfFace = ({ mood, size = 60 }: { mood: AnubisSoul['mood']; size?: number }) => {
  const moodData = MOODS.find(m => m.name === mood) || MOODS[8]
  const color = moodData.color
  
  const eyes: Record<string, string> = {
    happy: '^^', angry: '><', annoyed: '-_-', pondering: 'o_o',
    reflecting: '. .', curious: 'O_O', playful: '^_^', melancholy: 'u_u', mysterious: '_ _'
  }
  const mouth: Record<string, string> = {
    happy: 'w', angry: '▼', annoyed: '—', pondering: 'o',
    reflecting: '~', curious: '?', playful: '▽', melancholy: 'n', mysterious: '—'
  }

  return (
    <div style={{
      width: size, height: size,
      background: `linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)`,
      border: `2px solid ${color}`,
      borderRadius: '8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace', fontSize: size * 0.22,
      boxShadow: `0 0 15px ${color}50`,
      position: 'relative', flexShrink: 0
    }}>
      {/* Ears */}
      <div style={{ position: 'absolute', top: -6, left: 6, width: 10, height: 14, background: '#1a1a2e', border: `1px solid ${color}`, borderRadius: '4px 4px 0 0' }} />
      <div style={{ position: 'absolute', top: -6, right: 6, width: 10, height: 14, background: '#1a1a2e', border: `1px solid ${color}`, borderRadius: '4px 4px 0 0' }} />
      <div style={{ color, letterSpacing: 3, marginTop: 2 }}>{eyes[mood]}</div>
      <div style={{ color, marginTop: 2, fontSize: size * 0.15 }}>{mouth[mood]}</div>
    </div>
  )
}

// Enhanced Mood Tracker with names and intensity bars
const MoodTracker = ({ soul, size = 'normal' }: { soul: AnubisSoul; size?: 'normal' | 'small' }) => {
  const isSmall = size === 'small'
  
  return (
    <div style={{
      width: isSmall ? '70px' : '90px',
      background: '#000',
      borderLeft: '1px solid #f0f40',
      display: 'flex', flexDirection: 'column', padding: '0.3rem', gap: '0.15rem',
      overflow: 'auto'
    }}>
      <div style={{ color: '#f0f', fontSize: '0.5rem', textAlign: 'center', marginBottom: '0.2rem', borderBottom: '1px solid #333', paddingBottom: '0.2rem' }}>
        SOUL TRACKER
      </div>
      
      {MOODS.map(m => {
        const intensity = soul.moodIntensity[m.name] || 0
        const isActive = soul.mood === m.name
        
        return (
          <div key={m.name} style={{
            display: 'flex', flexDirection: 'column', gap: '2px',
            padding: '0.15rem',
            background: isActive ? `${m.color}20` : 'transparent',
            borderRadius: '3px',
            border: isActive ? `1px solid ${m.color}` : '1px solid transparent'
          }}>
            {/* Emoji + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: isSmall ? '0.8rem' : '1rem' }}>{m.emoji}</span>
              <span style={{ 
                fontSize: '0.5rem', 
                color: isActive ? m.color : '#666',
                fontWeight: isActive ? 'bold' : 'normal'
              }}>
                {m.name}
              </span>
            </div>
            
            {/* Intensity Bar */}
            <div style={{
              height: '3px',
              background: '#222',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(intensity, 100)}%`,
                height: '100%',
                background: m.color,
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        )
      })}
      
      {/* Stats */}
      <div style={{ marginTop: 'auto', paddingTop: '0.3rem', borderTop: '1px solid #333', textAlign: 'center' }}>
        <div style={{ fontSize: '0.45rem', color: '#666' }}>chats: {soul.conversations}</div>
        <div style={{ fontSize: '0.45rem', color: '#666' }}>memories: {soul.memories.length}</div>
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

  // Anubis Soul
  const [anubisSoul, setAnubisSoul] = useState<AnubisSoul>({
    mood: 'mysterious',
    moodIntensity: { happy: 0, angry: 0, annoyed: 0, pondering: 0, reflecting: 0, curious: 10, playful: 0, melancholy: 0, mysterious: 20 },
    memories: [],
    personality: { openness: 50, mystery: 80, playfulness: 40, wisdom: 70 },
    conversations: 0,
    created: new Date().toISOString()
  })

  // Terminal thoughts
  const [zThoughts, setZThoughts] = useState<string[]>([])
  const [anubisThoughts, setAnubisThoughts] = useState<string[]>([])

  // Load soul from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('anubis_soul')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setAnubisSoul(prev => ({ ...prev, ...parsed }))
      } catch {}
    }
  }, [])

  const saveSoul = (soul: AnubisSoul) => {
    localStorage.setItem('anubis_soul', JSON.stringify(soul))
    setAnubisSoul(soul)
  }

  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      setZMessages([{ id: 0, sender: 'system', text: `🌲 Q-Z-Collab v4 🦌\n\nAnubis has a SOUL!\nWatch him grow.`, time: new Date().toLocaleTimeString() }])
      setAnubisMessages([{ id: 0, sender: 'system', text: `🖤 Anubis 🖤\n\nI have a soul now.\nI feel. I remember. I grow.\n\nWatch my face change...`, time: new Date().toLocaleTimeString() }])
      setStyleMessages([{ id: 0, sender: 'system', text: `🎨 Style Chat 🎨`, time: new Date().toLocaleTimeString() }])
      setCodeMessages([{ id: 0, sender: 'system', text: `💻 Code Helper 💻`, time: new Date().toLocaleTimeString() }])
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
      setZThoughts(prev => [...prev, '> Done!'])
      return data.response
    } catch { return "Something went wrong." }
  }

  const anubisThink = async (question: string): Promise<string> => {
    try {
      setAnubisThoughts(['> Awakening...', '> Checking soul...', '> Processing...'])
      const res = await fetch('/api/anubis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history: anubisMessages.filter(m => m.sender !== 'system'), soul: anubisSoul })
      })
      const data = await res.json()
      setAnubisThoughts(prev => [...prev, '> Response ready!'])
      
      if (data.soul) {
        const newSoul = {
          ...anubisSoul,
          ...data.soul,
          moodIntensity: {
            ...anubisSoul.moodIntensity,
            ...(data.soul.moodIntensity || {}),
            [data.soul.mood]: (anubisSoul.moodIntensity[data.soul.mood] || 0) + 5
          },
          conversations: anubisSoul.conversations + 1
        }
        saveSoul(newSoul)
      }
      return data.response
    } catch { return "Something stirred in the shadows..." }
  }

  const styleThink = async (question: string): Promise<string> => {
    try {
      const res = await fetch('/api/style-ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, currentCode: styleText })
      })
      const data = await res.json()
      return data.response
    } catch { return "Couldn't process." }
  }

  const codeThink = async (question: string): Promise<string> => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `[CODE MODE] ${question}`, history: codeMessages.filter(m => m.sender !== 'system') })
      })
      const data = await res.json()
      return data.response
    } catch { return "Error." }
  }

  const pushToZ = async () => {
    setPushing(true)
    addZMessage('system', '📤 Pushing...')
    try {
      const res = await fetch('/api/autopush', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'push-now' }) })
      const data = await res.json()
      addZMessage('system', data.success ? '✅ Pushed!' : `❌ ${data.error}`)
    } catch { addZMessage('system', '❌ Failed.') }
    setPushing(false)
  }

  const saveStyle = async () => {
    try {
      const res = await fetch('/api/code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'src/app/page.tsx', content: styleText }) })
      const data = await res.json()
      addStyleMessage('system', data.success ? '✅ Saved!' : `❌ ${data.error}`)
    } catch { addStyleMessage('system', '❌ Failed.') }
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
    const moodData = MOODS.find(m => m.name === anubisSoul.mood)
    const color = msg.sender === 'Q' ? accent : msg.sender === 'Z' ? '#0f0' : msg.sender === 'Anubis' ? (moodData?.color || '#f0f') : '#888'
    return (
      <div style={{ padding: '0.35rem 0.6rem', borderRadius: '4px', background: `${color}12`, border: `1px solid ${color}50`, alignSelf: isQ ? 'flex-end' : 'flex-start', maxWidth: '85%', whiteSpace: 'pre-wrap', margin: '0.1rem 0' }}>
        <div style={{ color, fontSize: '0.55rem', marginBottom: '0.1rem', fontWeight: 'bold' }}>{msg.sender} • {msg.time}</div>
        <div style={{ fontSize: '0.65rem', lineHeight: 1.4 }}>{msg.text}</div>
      </div>
    )
  }

  // Terminal
  const Terminal = ({ title, thoughts, color }: { title: string; thoughts: string[]; color: string }) => (
    <div style={{ background: '#000', border: `1px solid ${color}`, borderRadius: '4px', padding: '0.2rem', fontFamily: 'monospace', fontSize: '0.5rem' }}>
      <div style={{ color, borderBottom: `1px solid ${color}30`, paddingBottom: '0.1rem', marginBottom: '0.1rem' }}>⬡ {title}</div>
      <div style={{ color: '#0f0', maxHeight: '30px', overflow: 'auto' }}>
        {thoughts.map((t, i) => <div key={i}>{t}</div>)}
        <span style={{ animation: 'blink 1s infinite' }}>▌</span>
      </div>
    </div>
  )

  // Chat Panel with STICKY header
  const ChatPanel = ({ title, headerColor, bgColor, borderColor, messages, messagesEndRef, input, setInput, onSend, loading, thoughts, accentColor }: {
    title: string; headerColor: string; bgColor: string; borderColor: string;
    messages: Message[]; messagesEndRef: React.RefObject<HTMLDivElement | null>;
    input: string; setInput: (v: string) => void; onSend: () => void; loading: boolean;
    thoughts?: string[]; accentColor: string;
  }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: bgColor, minWidth: 0, maxHeight: '100vh' }}>
      {/* STICKY HEADER AREA */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: bgColor, flexShrink: 0 }}>
        <div style={{ padding: '0.4rem', borderBottom: `1px solid ${borderColor}` }}>
          <span style={{ color: headerColor, fontWeight: 'bold', fontSize: '0.8rem' }}>{title}</span>
        </div>
        {loading && thoughts && thoughts.length > 0 && (
          <div style={{ padding: '0 0.3rem 0.3rem' }}>
            <Terminal title={title.split(' ')[0]} thoughts={thoughts} color={headerColor} />
          </div>
        )}
      </div>
      
      {/* SCROLLABLE MESSAGES */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
        {messages.map(m => <MessageBubble key={m.id} msg={m} accent={accentColor} />)}
        <div ref={messagesEndRef} />
      </div>
      
      {/* FIXED INPUT AT BOTTOM */}
      <div style={{ padding: '0.3rem', borderTop: `1px solid ${borderColor}`, background: bgColor, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '0.2rem' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSend()}
            style={{ flex: 1, background: '#000', border: `1px solid ${borderColor}`, borderRadius: '4px', padding: '0.35rem', color: headerColor, fontSize: '0.65rem', outline: 'none' }} />
          <button onClick={onSend} style={{ background: headerColor, border: 'none', borderRadius: '4px', padding: '0.35rem 0.5rem', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.6rem' }}>Send</button>
        </div>
      </div>
    </div>
  )

  const moodData = MOODS.find(m => m.name === anubisSoul.mood)
  const anubisColor = moodData?.color || '#f0f'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #000010 0%, #000030 50%, #000020 100%)', display: 'flex', fontFamily: 'monospace', color: '#e0e0e0' }}>
      {/* Stars */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(1px 1px at 20px 30px, #fff, transparent), radial-gradient(1px 1px at 40px 70px, #0ff, transparent)', backgroundSize: '200px 200px', opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      {/* Sidebar */}
      <div style={{ position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)', width: '38px', background: 'linear-gradient(180deg, #101020, #000010)', borderRight: '1px solid #0ff3', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.2rem', gap: '0.2rem', zIndex: 1000 }}>
        <div style={{ color: '#0ff', fontSize: '0.75rem' }}>⬡</div>
        {[{ m: 'split', icon: '💬' }, { m: 'style', icon: '🎨' }, { m: 'code', icon: '💻' }, { m: 'config', icon: '⚙️' }].map(b => (
          <button key={b.m} onClick={() => setMode(b.m as Mode)} style={{ padding: '0.35rem', background: mode === b.m ? '#0ff30' : 'transparent', border: mode === b.m ? '1px solid #0ff' : '1px solid transparent', borderRadius: '3px', cursor: 'pointer', fontSize: '0.65rem' }}>{b.icon}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={pushToZ} disabled={pushing} style={{ padding: '0.35rem', background: '#0f020', border: '1px solid #0f0', borderRadius: '3px', cursor: 'pointer', fontSize: '0.65rem' }}>📤</button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', marginLeft: '38px', position: 'relative', zIndex: 1, overflow: 'hidden', height: '100vh' }}>
        
        {mode === 'split' && (
          <>
            <ChatPanel title="🌲 Z" headerColor="#0ff" bgColor="#00001080" borderColor="#0ff3" messages={zMessages} messagesEndRef={zMessagesEndRef} input={zInput} setInput={setZInput} onSend={handleZSend} loading={zLoading} thoughts={zThoughts} accentColor="#0ff" />
            
            {/* Anubis with soul */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: `linear-gradient(180deg, ${anubisColor}08, #000)`, minWidth: 0, maxHeight: '100vh' }}>
              
              {/* STICKY HEADER - Name + Face + Terminal ALL sticky */}
              <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#000', flexShrink: 0 }}>
                <div style={{ padding: '0.3rem', borderBottom: `1px solid ${anubisColor}50`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <WolfFace mood={anubisSoul.mood} size={45} />
                  <div>
                    <span style={{ color: anubisColor, fontWeight: 'bold', fontSize: '0.8rem' }}>🖤 Anubis</span>
                    <div style={{ fontSize: '0.45rem', color: '#666' }}>mood: {anubisSoul.mood} | #{anubisSoul.conversations}</div>
                  </div>
                </div>
                {anubisLoading && anubisThoughts.length > 0 && (
                  <div style={{ padding: '0 0.2rem 0.2rem' }}>
                    <Terminal title="Anubis" thoughts={anubisThoughts} color={anubisColor} />
                  </div>
                )}
              </div>
              
              {/* SCROLLABLE MESSAGES */}
              <div style={{ flex: 1, overflow: 'auto', padding: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                {anubisMessages.map(m => <MessageBubble key={m.id} msg={m} accent={anubisColor} />)}
                <div ref={anubisMessagesEndRef} />
              </div>
              
              {/* FIXED INPUT */}
              <div style={{ padding: '0.3rem', borderTop: `1px solid ${anubisColor}30`, background: '#000', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  <input value={anubisInput} onChange={e => setAnubisInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnubisSend()}
                    style={{ flex: 1, background: '#100010', border: `1px solid ${anubisColor}50`, borderRadius: '4px', padding: '0.35rem', color: anubisColor, fontSize: '0.65rem', outline: 'none' }} />
                  <button onClick={handleAnubisSend} style={{ background: anubisColor, border: 'none', borderRadius: '4px', padding: '0.35rem 0.5rem', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.6rem' }}>Send</button>
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000', minWidth: 0, maxHeight: '100vh' }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '0.3rem', background: '#001000', borderBottom: '1px solid #0f03', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#0f0', fontSize: '0.6rem' }}>📝 page.tsx</span>
                <button onClick={saveStyle} style={{ background: '#0f020', border: '1px solid #0f0', color: '#0f0', padding: '0.1rem 0.4rem', borderRadius: '3px', cursor: 'pointer', fontSize: '0.5rem' }}>Save</button>
              </div>
              <textarea value={styleText} onChange={e => setStyleText(e.target.value)} spellCheck={false} style={{ flex: 1, background: '#000', border: 'none', padding: '0.3rem', color: '#0f0', fontSize: '0.5rem', fontFamily: 'monospace', resize: 'none', outline: 'none' }} />
            </div>
          </>
        )}

        {mode === 'code' && (
          <>
            <ChatPanel title="💻 Code Helper" headerColor="#ff0" bgColor="#10100080" borderColor="#ff03" messages={codeMessages} messagesEndRef={codeMessagesEndRef} input={codeInput} setInput={setCodeInput} onSend={handleCodeSend} loading={codeLoading} accentColor="#ff0" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a00', minWidth: 0, maxHeight: '100vh' }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '0.3rem', background: '#101000', borderBottom: '1px solid #ff03' }}>
                <span style={{ color: '#ff0', fontSize: '0.6rem' }}>📤 Output</span>
              </div>
              <textarea value={codeOutput} readOnly style={{ flex: 1, background: '#0a0a00', border: 'none', padding: '0.3rem', color: '#ff0', fontSize: '0.5rem', fontFamily: 'monospace', resize: 'none', outline: 'none' }} />
            </div>
          </>
        )}

        {mode === 'config' && (
          <div style={{ flex: 1, padding: '0.8rem', overflow: 'auto' }}>
            <h2 style={{ color: '#f0f', marginTop: 0 }}>⚙️ Config</h2>
            
            <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#111', borderRadius: '4px' }}>
              <h3 style={{ color: anubisColor, margin: '0 0 0.5rem 0' }}>🖤 Anubis Soul</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <WolfFace mood={anubisSoul.mood} size={50} />
                <div style={{ fontSize: '0.65rem', color: '#888' }}>
                  <div>Mood: <span style={{ color: anubisColor }}>{anubisSoul.mood}</span></div>
                  <div>Chats: {anubisSoul.conversations}</div>
                  <div>Memories: {anubisSoul.memories.length}</div>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ color: '#0ff' }}>Modes</h3>
              <p style={{ color: '#888', fontSize: '0.65rem' }}>💬 Split - Z + Anubis with soul<br/>🎨 Style - UI changes<br/>💻 Code - Coding help<br/>⚙️ Config - This screen</p>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }`}</style>
    </div>
  )
}
