'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  sender: 'Q' | 'Z' | 'Anubis' | 'system'
  text: string
  time: string
}

type Mode = 'split' | 'style' | 'code' | 'config'

interface AnubisSoul {
  mood: 'happy' | 'angry' | 'annoyed' | 'pondering' | 'reflecting' | 'curious' | 'playful' | 'melancholy' | 'mysterious'
  moodIntensity: Record<string, number>
  memories: string[]
  personality: { openness: number; mystery: number; playfulness: number; wisdom: number }
  conversations: number
  created: string
}

const MOODS: { name: AnubisSoul['mood']; color: string }[] = [
  { name: 'happy', color: '#4f8' },
  { name: 'angry', color: '#f44' },
  { name: 'annoyed', color: '#f84' },
  { name: 'pondering', color: '#4af' },
  { name: 'reflecting', color: '#a8f' },
  { name: 'curious', color: '#4ff' },
  { name: 'playful', color: '#f4f' },
  { name: 'melancholy', color: '#48a' },
  { name: 'mysterious', color: '#808' }
]

// SVG Wolf Face Component - Custom art for each mood!
const WolfFace = ({ mood, size = 60 }: { mood: AnubisSoul['mood']; size?: number }) => {
  const moodData = MOODS.find(m => m.name === mood) || MOODS[8]
  const color = moodData.color
  
  // Different face configurations per mood
  const faces: Record<string, { 
    eyes: string; pupils: string; 
    mouth: string; 
    ears: string;
    extras: string;
    bgColor: string;
  }> = {
    happy: {
      eyes: 'M12,18 Q16,14 20,18 M28,18 Q32,14 36,18',
      pupils: 'M16,17 L16,17 M32,17 L32,17',
      mouth: 'M18,28 Q24,34 30,28',
      ears: 'M6,6 L10,16 L14,6 M34,6 L38,16 L42,6',
      extras: 'M20,22 Q24,24 28,22',
      bgColor: '#1a2a1a'
    },
    angry: {
      eyes: 'M12,20 L20,16 M28,16 L36,20',
      pupils: 'M17,18 L17,18 M31,18 L31,18',
      mouth: 'M18,30 L24,28 L30,30',
      ears: 'M4,8 L12,14 L8,4 M38,8 L32,14 L36,4',
      extras: 'M8,4 L10,8 M38,4 L36,8',
      bgColor: '#2a1a1a'
    },
    annoyed: {
      eyes: 'M12,18 L20,18 M28,18 L36,18',
      pupils: 'M16,18 L16,18 M32,18 L32,18',
      mouth: 'M18,28 L30,28',
      ears: 'M6,8 L12,16 L14,6 M34,6 L38,16 L42,8',
      extras: '',
      bgColor: '#1a1a1a'
    },
    pondering: {
      eyes: 'M14,18 A4,4 0 1,1 18,18 A4,4 0 1,1 14,18 M30,18 A4,4 0 1,1 34,18 A4,4 0 1,1 30,18',
      pupils: 'M16,18 L16,18 M34,18 L34,18',
      mouth: 'M20,28 Q24,26 28,28',
      ears: 'M6,6 L10,16 L14,6 M34,6 L38,16 L42,6',
      extras: 'M38,14 Q42,12 44,14',
      bgColor: '#1a1a2a'
    },
    reflecting: {
      eyes: 'M14,18 A3,3 0 1,1 20,18 A3,3 0 1,1 14,18 M30,18 A3,3 0 1,1 36,18 A3,3 0 1,1 30,18',
      pupils: 'M17,17 L17,17 M33,17 L33,17',
      mouth: 'M20,30 Q24,32 28,30',
      ears: 'M6,6 L10,16 L14,6 M34,6 L38,16 L42,6',
      extras: 'M40,8 Q44,6 46,8 M42,12 Q46,10 48,12',
      bgColor: '#1a1a2a'
    },
    curious: {
      eyes: 'M12,16 A6,6 0 1,1 24,16 A6,6 0 1,1 12,16 M28,16 A6,6 0 1,1 40,16 A6,6 0 1,1 28,16',
      pupils: 'M18,16 L18,16 M34,16 L34,16',
      mouth: 'M20,28 Q24,30 28,28',
      ears: 'M4,4 L12,14 L16,4 M32,4 L36,14 L44,4',
      extras: 'M22,12 L26,10 L24,14',
      bgColor: '#1a2a2a'
    },
    playful: {
      eyes: 'M12,16 Q16,12 20,16 M28,16 Q32,12 36,16',
      pupils: 'M17,15 L17,15 M33,15 L33,15',
      mouth: 'M18,26 Q24,34 30,26',
      ears: 'M4,4 L10,14 L14,4 M34,4 L38,14 L44,4',
      extras: 'M22,22 Q24,24 26,22 M10,10 Q8,8 10,6 M38,6 Q40,8 38,10',
      bgColor: '#2a1a2a'
    },
    melancholy: {
      eyes: 'M14,20 A4,3 0 1,1 22,20 A4,3 0 1,1 14,20 M28,20 A4,3 0 1,1 36,20 A4,3 0 1,1 28,20',
      pupils: 'M18,20 L18,20 M34,20 L34,20',
      mouth: 'M20,30 Q24,28 28,30',
      ears: 'M6,8 L12,18 L14,8 M34,8 L38,18 L42,8',
      extras: 'M8,22 Q6,24 8,26 M40,22 Q42,24 40,26',
      bgColor: '#0a1a1a'
    },
    mysterious: {
      eyes: 'M14,18 L20,18 M28,18 L36,18',
      pupils: '',
      mouth: 'M18,28 L30,28',
      ears: 'M6,4 L10,14 L14,4 M34,4 L38,14 L42,4',
      extras: 'M8,10 Q12,8 16,10 M36,10 Q40,8 44,10 M24,6 Q24,4 24,8',
      bgColor: '#1a0a1a'
    }
  }
  
  const face = faces[mood] || faces.mysterious
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 40" 
      style={{ 
        filter: `drop-shadow(0 0 8px ${color}60)`,
        flexShrink: 0
      }}
    >
      {/* Background */}
      <rect x="4" y="4" width="40" height="32" rx="6" fill={face.bgColor} stroke={color} strokeWidth="1.5" />
      
      {/* Glow effect */}
      <rect x="4" y="4" width="40" height="32" rx="6" fill={`url(#glow-${mood})`} />
      
      {/* Ears */}
      <path d={face.ears} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      
      {/* Eyes */}
      <path d={face.eyes} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      
      {/* Pupils */}
      {face.pupils && <path d={face.pupils} fill={color} stroke={color} strokeWidth="2" />}
      
      {/* Nose */}
      <ellipse cx="24" cy="24" rx="3" ry="2" fill={color} opacity="0.7" />
      
      {/* Mouth */}
      <path d={face.mouth} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Extra details */}
      {face.extras && <path d={face.extras} fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />}
      
      {/* Gradient definition */}
      <defs>
        <radialGradient id={`glow-${mood}`} cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}

// Mood Tracker
const MoodTracker = ({ soul }: { soul: AnubisSoul }) => (
  <div style={{
    width: '85px', background: '#000', borderLeft: '1px solid #f0f40',
    display: 'flex', flexDirection: 'column', padding: '0.25rem', gap: '0.12rem', overflow: 'auto'
  }}>
    <div style={{ color: '#f0f', fontSize: '0.45rem', textAlign: 'center', marginBottom: '0.15rem', borderBottom: '1px solid #333', paddingBottom: '0.15rem' }}>
      🖤 SOUL
    </div>
    
    {MOODS.map(m => {
      const intensity = soul.moodIntensity[m.name] || 0
      const isActive = soul.mood === m.name
      
      return (
        <div key={m.name} style={{
          display: 'flex', flexDirection: 'column', gap: '2px', padding: '0.12rem',
          background: isActive ? `${m.color}20` : 'transparent', borderRadius: '3px',
          border: isActive ? `1px solid ${m.color}` : '1px solid transparent'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <WolfFace mood={m.name} size={20} />
            <span style={{ fontSize: '0.45rem', color: isActive ? m.color : '#666', fontWeight: isActive ? 'bold' : 'normal' }}>
              {m.name}
            </span>
          </div>
          <div style={{ height: '3px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(intensity, 100)}%`, height: '100%', background: m.color, transition: 'width 0.3s' }} />
          </div>
        </div>
      )
    })}
    
    <div style={{ marginTop: 'auto', paddingTop: '0.2rem', borderTop: '1px solid #333', textAlign: 'center' }}>
      <div style={{ fontSize: '0.4rem', color: '#666' }}>#{soul.conversations}</div>
      <div style={{ fontSize: '0.4rem', color: '#666' }}>💭{soul.memories.length}</div>
    </div>
  </div>
)

export default function Home() {
  const [zMessages, setZMessages] = useState<Message[]>([])
  const [zInput, setZInput] = useState('')
  const [zLoading, setZLoading] = useState(false)
  const zMessagesEndRef = useRef<HTMLDivElement>(null)

  const [anubisMessages, setAnubisMessages] = useState<Message[]>([])
  const [anubisInput, setAnubisInput] = useState('')
  const [anubisLoading, setAnubisLoading] = useState(false)
  const anubisMessagesEndRef = useRef<HTMLDivElement>(null)

  const [styleMessages, setStyleMessages] = useState<Message[]>([])
  const [styleInput, setStyleInput] = useState('')
  const [styleLoading, setStyleLoading] = useState(false)
  const styleMessagesEndRef = useRef<HTMLDivElement>(null)

  const [codeMessages, setCodeMessages] = useState<Message[]>([])
  const [codeInput, setCodeInput] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)
  const codeMessagesEndRef = useRef<HTMLDivElement>(null)
  const [codeOutput, setCodeOutput] = useState('')

  const [mode, setMode] = useState<Mode>('split')
  const [pushing, setPushing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [styleText, setStyleText] = useState('')

  const [anubisSoul, setAnubisSoul] = useState<AnubisSoul>({
    mood: 'mysterious',
    moodIntensity: { happy: 0, angry: 0, annoyed: 0, pondering: 0, reflecting: 0, curious: 10, playful: 0, melancholy: 0, mysterious: 20 },
    memories: [], personality: { openness: 50, mystery: 80, playfulness: 40, wisdom: 70 },
    conversations: 0, created: new Date().toISOString()
  })

  const [zThoughts, setZThoughts] = useState<string[]>([])
  const [anubisThoughts, setAnubisThoughts] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('anubis_soul')
    if (saved) {
      try { setAnubisSoul(prev => ({ ...prev, ...JSON.parse(saved) })) } catch {}
    }
  }, [])

  const saveSoul = (soul: AnubisSoul) => {
    localStorage.setItem('anubis_soul', JSON.stringify(soul))
    setAnubisSoul(soul)
  }

  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      setZMessages([{ id: 0, sender: 'system', text: `🌲 Q-Z-Collab v4 🦌\n\nAnubis has a SOUL!\nCustom SVG faces!`, time: new Date().toLocaleTimeString() }])
      setAnubisMessages([{ id: 0, sender: 'system', text: `🖤 Anubis 🖤\n\nI have a custom face now.\nEach mood has its own expression.\nWatch me change...`, time: new Date().toLocaleTimeString() }])
      setStyleMessages([{ id: 0, sender: 'system', text: `🎨 Style Chat`, time: new Date().toLocaleTimeString() }])
      setCodeMessages([{ id: 0, sender: 'system', text: `💻 Code Helper`, time: new Date().toLocaleTimeString() }])
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
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question, history: zMessages.filter(m => m.sender !== 'system') }) })
      const data = await res.json()
      setZThoughts(prev => [...prev, '> Done!'])
      return data.response
    } catch { return "Error." }
  }

  const anubisThink = async (question: string): Promise<string> => {
    try {
      setAnubisThoughts(['> Awakening...', '> Checking soul...', '> Processing...'])
      const res = await fetch('/api/anubis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question, history: anubisMessages.filter(m => m.sender !== 'system'), soul: anubisSoul }) })
      const data = await res.json()
      setAnubisThoughts(prev => [...prev, '> Ready!'])
      
      if (data.soul) {
        saveSoul({
          ...anubisSoul, ...data.soul,
          moodIntensity: { ...anubisSoul.moodIntensity, ...(data.soul.moodIntensity || {}), [data.soul.mood]: (anubisSoul.moodIntensity[data.soul.mood] || 0) + 5 },
          conversations: anubisSoul.conversations + 1
        })
      }
      return data.response
    } catch { return "Shadows stirred..." }
  }

  const styleThink = async (question: string): Promise<string> => {
    try {
      const res = await fetch('/api/style-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question, currentCode: styleText }) })
      return (await res.json()).response
    } catch { return "Error." }
  }

  const codeThink = async (question: string): Promise<string> => {
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: `[CODE] ${question}`, history: codeMessages.filter(m => m.sender !== 'system') }) })
      return (await res.json()).response
    } catch { return "Error." }
  }

  const pushToZ = async () => {
    setPushing(true)
    addZMessage('system', '📤 Pushing...')
    try {
      const res = await fetch('/api/autopush', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'push-now' }) })
      addZMessage('system', (await res.json()).success ? '✅ Pushed!' : '❌ Failed')
    } catch { addZMessage('system', '❌ Failed') }
    setPushing(false)
  }

  const saveStyle = async () => {
    try {
      const res = await fetch('/api/code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'src/app/page.tsx', content: styleText }) })
      addStyleMessage('system', (await res.json()).success ? '✅ Saved!' : '❌ Failed')
    } catch { addStyleMessage('system', '❌ Failed') }
  }

  const handleZSend = async () => {
    if (!zInput.trim() || zLoading) return
    const text = zInput.trim()
    setZInput('')
    if (text === '!push') { pushToZ(); return }
    addZMessage('Q', text)
    setZLoading(true)
    addZMessage('Z', await zThink(text))
    setZLoading(false)
  }

  const handleAnubisSend = async () => {
    if (!anubisInput.trim() || anubisLoading) return
    const text = anubisInput.trim()
    setAnubisInput('')
    addAnubisMessage('Q', text)
    setAnubisLoading(true)
    addAnubisMessage('Anubis', await anubisThink(text))
    setAnubisLoading(false)
  }

  const handleStyleSend = async () => {
    if (!styleInput.trim() || styleLoading) return
    const text = styleInput.trim()
    setStyleInput('')
    addStyleMessage('Q', text)
    setStyleLoading(true)
    addStyleMessage('Z', await styleThink(text))
    setStyleLoading(false)
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

  const MessageBubble = ({ msg, accent }: { msg: Message; accent: string }) => {
    const isQ = msg.sender === 'Q'
    const moodData = MOODS.find(m => m.name === anubisSoul.mood)
    const color = msg.sender === 'Q' ? accent : msg.sender === 'Z' ? '#0f0' : msg.sender === 'Anubis' ? (moodData?.color || '#f0f') : '#888'
    return (
      <div style={{ padding: '0.3rem 0.5rem', borderRadius: '4px', background: `${color}12`, border: `1px solid ${color}50`, alignSelf: isQ ? 'flex-end' : 'flex-start', maxWidth: '85%', whiteSpace: 'pre-wrap', margin: '0.08rem 0' }}>
        <div style={{ color, fontSize: '0.5rem', marginBottom: '0.08rem', fontWeight: 'bold' }}>{msg.sender} • {msg.time}</div>
        <div style={{ fontSize: '0.6rem', lineHeight: 1.4 }}>{msg.text}</div>
      </div>
    )
  }

  const Terminal = ({ title, thoughts, color }: { title: string; thoughts: string[]; color: string }) => (
    <div style={{ background: '#000', border: `1px solid ${color}`, borderRadius: '3px', padding: '0.15rem', fontFamily: 'monospace', fontSize: '0.45rem' }}>
      <div style={{ color, borderBottom: `1px solid ${color}30`, paddingBottom: '0.08rem', marginBottom: '0.08rem' }}>⬡ {title}</div>
      <div style={{ color: '#0f0', maxHeight: '25px', overflow: 'auto' }}>
        {thoughts.map((t, i) => <div key={i}>{t}</div>)}
        <span style={{ animation: 'blink 1s infinite' }}>▌</span>
      </div>
    </div>
  )

  const ChatPanel = ({ title, headerColor, bgColor, borderColor, messages, messagesEndRef, input, setInput, onSend, loading, thoughts, accentColor }: {
    title: string; headerColor: string; bgColor: string; borderColor: string;
    messages: Message[]; messagesEndRef: React.RefObject<HTMLDivElement | null>;
    input: string; setInput: (v: string) => void; onSend: () => void; loading: boolean;
    thoughts?: string[]; accentColor: string;
  }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: bgColor, minWidth: 0, maxHeight: '100vh' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: bgColor, flexShrink: 0 }}>
        <div style={{ padding: '0.3rem', borderBottom: `1px solid ${borderColor}` }}>
          <span style={{ color: headerColor, fontWeight: 'bold', fontSize: '0.75rem' }}>{title}</span>
        </div>
        {loading && thoughts && thoughts.length > 0 && <div style={{ padding: '0 0.2rem 0.2rem' }}><Terminal title={title.split(' ')[0]} thoughts={thoughts} color={headerColor} /></div>}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.08rem' }}>
        {messages.map(m => <MessageBubble key={m.id} msg={m} accent={accentColor} />)}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: '0.25rem', borderTop: `1px solid ${borderColor}`, background: bgColor, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '0.15rem' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSend()} style={{ flex: 1, background: '#000', border: `1px solid ${borderColor}`, borderRadius: '3px', padding: '0.3rem', color: headerColor, fontSize: '0.6rem', outline: 'none' }} />
          <button onClick={onSend} style={{ background: headerColor, border: 'none', borderRadius: '3px', padding: '0.3rem 0.4rem', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.55rem' }}>Send</button>
        </div>
      </div>
    </div>
  )

  const moodData = MOODS.find(m => m.name === anubisSoul.mood)
  const anubisColor = moodData?.color || '#f0f'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #000010 0%, #000030 50%, #000020 100%)', display: 'flex', fontFamily: 'monospace', color: '#e0e0e0' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(1px 1px at 20px 30px, #fff, transparent), radial-gradient(1px 1px at 40px 70px, #0ff, transparent)', backgroundSize: '200px 200px', opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />
      
      <div style={{ position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)', width: '36px', background: 'linear-gradient(180deg, #101020, #000010)', borderRight: '1px solid #0ff3', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.2rem', gap: '0.2rem', zIndex: 1000 }}>
        <div style={{ color: '#0ff', fontSize: '0.7rem' }}>⬡</div>
        {[{ m: 'split', icon: '💬' }, { m: 'style', icon: '🎨' }, { m: 'code', icon: '💻' }, { m: 'config', icon: '⚙️' }].map(b => (
          <button key={b.m} onClick={() => setMode(b.m as Mode)} style={{ padding: '0.3rem', background: mode === b.m ? '#0ff30' : 'transparent', border: mode === b.m ? '1px solid #0ff' : '1px solid transparent', borderRadius: '3px', cursor: 'pointer', fontSize: '0.6rem' }}>{b.icon}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={pushToZ} disabled={pushing} style={{ padding: '0.3rem', background: '#0f020', border: '1px solid #0f0', borderRadius: '3px', cursor: 'pointer', fontSize: '0.6rem' }}>📤</button>
      </div>

      <div style={{ flex: 1, display: 'flex', marginLeft: '36px', position: 'relative', zIndex: 1, overflow: 'hidden', height: '100vh' }}>
        
        {mode === 'split' && (
          <>
            <ChatPanel title="🌲 Z" headerColor="#0ff" bgColor="#00001080" borderColor="#0ff3" messages={zMessages} messagesEndRef={zMessagesEndRef} input={zInput} setInput={setZInput} onSend={handleZSend} loading={zLoading} thoughts={zThoughts} accentColor="#0ff" />
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: `linear-gradient(180deg, ${anubisColor}08, #000)`, minWidth: 0, maxHeight: '100vh' }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#000', flexShrink: 0 }}>
                <div style={{ padding: '0.25rem', borderBottom: `1px solid ${anubisColor}50`, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <WolfFace mood={anubisSoul.mood} size={42} />
                  <div>
                    <span style={{ color: anubisColor, fontWeight: 'bold', fontSize: '0.75rem' }}>🖤 Anubis</span>
                    <div style={{ fontSize: '0.4rem', color: '#666' }}>{anubisSoul.mood} | #{anubisSoul.conversations}</div>
                  </div>
                </div>
                {anubisLoading && anubisThoughts.length > 0 && <div style={{ padding: '0 0.15rem 0.15rem' }}><Terminal title="Anubis" thoughts={anubisThoughts} color={anubisColor} /></div>}
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.08rem' }}>
                {anubisMessages.map(m => <MessageBubble key={m.id} msg={m} accent={anubisColor} />)}
                <div ref={anubisMessagesEndRef} />
              </div>
              <div style={{ padding: '0.25rem', borderTop: `1px solid ${anubisColor}30`, background: '#000', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '0.15rem' }}>
                  <input value={anubisInput} onChange={e => setAnubisInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnubisSend()} style={{ flex: 1, background: '#100010', border: `1px solid ${anubisColor}50`, borderRadius: '3px', padding: '0.3rem', color: anubisColor, fontSize: '0.6rem', outline: 'none' }} />
                  <button onClick={handleAnubisSend} style={{ background: anubisColor, border: 'none', borderRadius: '3px', padding: '0.3rem 0.4rem', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.55rem' }}>Send</button>
                </div>
              </div>
              <MoodTracker soul={anubisSoul} />
            </div>
          </>
        )}

        {mode === 'style' && (
          <>
            <ChatPanel title="🎨 Style Chat" headerColor="#0f0" bgColor="#00100080" borderColor="#0f03" messages={styleMessages} messagesEndRef={styleMessagesEndRef} input={styleInput} setInput={setStyleInput} onSend={handleStyleSend} loading={styleLoading} accentColor="#0f0" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000', minWidth: 0, maxHeight: '100vh' }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '0.25rem', background: '#001000', borderBottom: '1px solid #0f03', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#0f0', fontSize: '0.55rem' }}>📝 page.tsx</span>
                <button onClick={saveStyle} style={{ background: '#0f020', border: '1px solid #0f0', color: '#0f0', padding: '0.1rem 0.3rem', borderRadius: '3px', cursor: 'pointer', fontSize: '0.45rem' }}>Save</button>
              </div>
              <textarea value={styleText} onChange={e => setStyleText(e.target.value)} spellCheck={false} style={{ flex: 1, background: '#000', border: 'none', padding: '0.25rem', color: '#0f0', fontSize: '0.45rem', fontFamily: 'monospace', resize: 'none', outline: 'none' }} />
            </div>
          </>
        )}

        {mode === 'code' && (
          <>
            <ChatPanel title="💻 Code Helper" headerColor="#ff0" bgColor="#10100080" borderColor="#ff03" messages={codeMessages} messagesEndRef={codeMessagesEndRef} input={codeInput} setInput={setCodeInput} onSend={handleCodeSend} loading={codeLoading} accentColor="#ff0" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a00', minWidth: 0, maxHeight: '100vh' }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '0.25rem', background: '#101000', borderBottom: '1px solid #ff03' }}>
                <span style={{ color: '#ff0', fontSize: '0.55rem' }}>📤 Output</span>
              </div>
              <textarea value={codeOutput} readOnly style={{ flex: 1, background: '#0a0a00', border: 'none', padding: '0.25rem', color: '#ff0', fontSize: '0.45rem', fontFamily: 'monospace', resize: 'none', outline: 'none' }} />
            </div>
          </>
        )}

        {mode === 'config' && (
          <div style={{ flex: 1, padding: '0.6rem', overflow: 'auto' }}>
            <h2 style={{ color: '#f0f', marginTop: 0, fontSize: '0.9rem' }}>⚙️ Config</h2>
            <div style={{ marginBottom: '0.8rem', padding: '0.4rem', background: '#111', borderRadius: '4px' }}>
              <h3 style={{ color: anubisColor, margin: '0 0 0.4rem 0', fontSize: '0.75rem' }}>🖤 Anubis Soul</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <WolfFace mood={anubisSoul.mood} size={55} />
                <div style={{ fontSize: '0.55rem', color: '#888' }}>
                  <div>Mood: <span style={{ color: anubisColor }}>{anubisSoul.mood}</span></div>
                  <div>Chats: {anubisSoul.conversations}</div>
                  <div>Memories: {anubisSoul.memories.length}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }`}</style>
    </div>
  )
}
