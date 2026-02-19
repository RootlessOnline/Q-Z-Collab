'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  sender: 'Q' | 'Z' | 'system'
  text: string
  time: string
}

interface CodeFile {
  name: string
  type: 'file' | 'directory'
  path: string
}

interface Theme {
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
}

interface SyncStatus {
  last_sync: string
  updates_available: boolean
  version: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      sender: 'system',
      text: `╔═══════════════════════════════════════════════════════════════╗
║           Q-Z-COLLAB - Local Instance                         ║
║                                                               ║
║     Q (You) ◄──────────────────► Z (Local AI)                 ║
║                                                               ║
║     🧠 Running on YOUR Ollama                                 ║
║     🔄 Auto-syncs from GitHub repo                            ║
║     👁️ Real Z can observe & improve responses                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Type 'z <message>' to talk to Local Z
Type 'sync' to pull updates from repo
Type 'code' to edit the UI
Type 'theme' to customize colors

🌲🍂🦌`,
      time: new Date().toLocaleTimeString()
    }
  ])
  const [input, setInput] = useState('')
  const [bionic, setBionic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [showTheme, setShowTheme] = useState(false)
  const [showSync, setShowSync] = useState(false)
  const [codeContent, setCodeContent] = useState('')
  const [currentFile, setCurrentFile] = useState('')
  const [files, setFiles] = useState<CodeFile[]>([])
  const [theme, setTheme] = useState<Theme>({
    primary: '#00d4ff',
    secondary: '#ff00ff',
    background: '#0a0a0a',
    surface: '#1a1a2e',
    text: '#e0e0e0'
  })
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [syncing, setSyncing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadFiles('src/app')
    loadTheme()
    loadSyncStatus()
  }, [])

  const loadFiles = async (dir: string) => {
    try {
      const res = await fetch(`/api/code?action=list&dir=${encodeURIComponent(dir)}`)
      const data = await res.json()
      if (data.files) setFiles(data.files)
    } catch (e) {
      console.error('Failed to load files:', e)
    }
  }

  const loadFile = async (file: string) => {
    try {
      const res = await fetch(`/api/code?file=${encodeURIComponent(file)}`)
      const data = await res.json()
      if (data.content) {
        setCodeContent(data.content)
        setCurrentFile(file)
      }
    } catch (e) {
      console.error('Failed to load file:', e)
    }
  }

  const saveFile = async () => {
    if (!currentFile) return
    try {
      const res = await fetch('/api/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: currentFile, content: codeContent })
      })
      const data = await res.json()
      if (data.success) addSystemMessage(`✅ ${data.message}`)
    } catch (e) {
      console.error('Failed to save:', e)
    }
  }

  const loadTheme = async () => {
    try {
      const res = await fetch('/api/memory?action=theme')
      const data = await res.json()
      if (data.primary) setTheme(data)
    } catch (e) {
      console.error('Failed to load theme:', e)
    }
  }

  const saveTheme = async (newTheme: Theme) => {
    try {
      await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-theme', data: newTheme })
      })
      setTheme(newTheme)
      addSystemMessage('🎨 Theme saved!')
    } catch (e) {
      console.error('Failed to save theme:', e)
    }
  }

  const loadSyncStatus = async () => {
    try {
      const res = await fetch('/api/chatlog?action=sync-status')
      const data = await res.json()
      setSyncStatus(data)
    } catch (e) {
      console.error('Failed to load sync status:', e)
    }
  }

  const doSync = async () => {
    setSyncing(true)
    addSystemMessage('🔄 Syncing from GitHub repo...')
    try {
      const res = await fetch('/api/chat?action=sync')
      const data = await res.json()
      if (data.success && data.updated) {
        addSystemMessage(`✅ Updated! ${data.message}\n\nRestart the server to apply changes.`)
      } else if (data.success) {
        addSystemMessage(`✓ ${data.message}`)
      } else {
        addSystemMessage(`❌ Sync failed: ${data.error}`)
      }
      loadSyncStatus()
    } catch (e) {
      addSystemMessage('❌ Sync failed. Check your connection.')
    }
    setSyncing(false)
  }

  const addSystemMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'system',
      text,
      time: new Date().toLocaleTimeString()
    }])
  }

  const bionicRender = (text: string) => {
    if (!bionic) return text
    return text.split(' ').map((word, i) => {
      if (word.length <= 2) return word + ' '
      return (
        <span key={i}>
          <strong style={{ color: theme.text }}>{word[0]}</strong>{word.slice(1)}{' '}
        </span>
      )
    })
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
      return "I'm here, Q. Something went wrong. Is Ollama running?"
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    const time = new Date().toLocaleTimeString()
    const text = input.trim()
    
    // Commands
    if (text.toLowerCase() === 'sync') {
      setInput('')
      doSync()
      return
    }

    if (text.toLowerCase() === 'code') {
      setShowCode(!showCode)
      setShowTheme(false)
      setShowSync(false)
      setInput('')
      addSystemMessage(showCode ? '📝 Code editor closed' : '📝 Code editor opened!')
      return
    }

    if (text.toLowerCase() === 'theme') {
      setShowTheme(!showTheme)
      setShowCode(false)
      setShowSync(false)
      setInput('')
      addSystemMessage(showTheme ? '🎨 Theme panel closed' : '🎨 Theme panel opened!')
      return
    }

    if (text.toLowerCase() === 'status') {
      setShowSync(!showSync)
      setShowCode(false)
      setShowTheme(false)
      setInput('')
      addSystemMessage(showSync ? '📊 Status panel closed' : '📊 Status panel opened!')
      return
    }
    
    const newMsg: Message = {
      id: Date.now(),
      sender: 'Q',
      text,
      time
    }
    
    setMessages(prev => [...prev, newMsg])
    setInput('')
    
    if (text.startsWith('!')) {
      const cmd = text.slice(1).toLowerCase().trim()
      let response = ''
      
      if (cmd === 'help' || cmd === 'h') {
        response = `┌─────────────────────────────────────────┐
│ COMMANDS:                               │
│   !help, !h    - Show this help         │
│   !clear       - Clear chat             │
│   !bionic      - Toggle bionic reading  │
│   sync         - Pull updates from repo │
│   code         - Open code editor       │
│   theme        - Open theme customizer  │
│   status       - Show sync status       │
│                                         │
│ MODES:                                  │
│   z <text>     - Ask Z something        │
│   <any text>   - Just talk (Z listens)  │
└─────────────────────────────────────────┘`
      } else if (cmd === 'clear') {
        setMessages([{
          id: Date.now(),
          sender: 'system',
          text: '[Chat cleared]',
          time
        }])
        return
      } else if (cmd === 'bionic') {
        setBionic(!bionic)
        response = `Bionic reading: ${!bionic ? 'ON' : 'OFF'}`
      } else {
        response = `Unknown command: ${cmd}`
      }
      
      setTimeout(() => addSystemMessage(response), 100)
      return
    }
    
    if (text.startsWith('z ')) {
      const question = text.slice(2)
      setLoading(true)
      
      const zResponse = await zThink(question)
      setLoading(false)
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'Z',
        text: zResponse,
        time: new Date().toLocaleTimeString()
      }])
      return
    }
    
    setTimeout(() => addSystemMessage('[Z observes silently]'), 200)
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
      background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.surface} 100%)`,
      display: 'flex',
      fontFamily: 'monospace',
      color: theme.text
    }}>
      {/* Main Chat Area */}
      <div style={{
        flex: (showCode || showTheme || showSync) ? '0 0 50%' : 1,
        display: 'flex',
        flexDirection: 'column',
        transition: 'flex 0.3s',
        minWidth: 0
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(90deg, ${theme.primary}20, ${theme.secondary}20)`,
          padding: '0.8rem 1.5rem',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '1.3rem' }}>🌲</span>
            <h1 style={{ margin: 0, fontSize: '1.2rem', color: theme.primary }}>Q-Z-Collab</h1>
            <span style={{ fontSize: '1.3rem' }}>🦌</span>
            <span style={{ color: '#888', fontSize: '0.7rem', background: '#333', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              LOCAL
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button onClick={doSync} disabled={syncing}
              style={{ background: syncing ? '#555' : '#00ff0020', border: '1px solid #00ff00', color: '#00ff00', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: syncing ? 'wait' : 'pointer', fontSize: '0.75rem' }}>
              {syncing ? '⏳' : '🔄'} Sync
            </button>
            <button onClick={() => { setShowCode(!showCode); setShowTheme(false); setShowSync(false); }}
              style={{ background: showCode ? `${theme.primary}50` : '#333', border: `1px solid ${theme.primary}`, color: theme.primary, padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
              📝 Code
            </button>
            <button onClick={() => { setShowTheme(!showTheme); setShowCode(false); setShowSync(false); }}
              style={{ background: showTheme ? `${theme.secondary}50` : '#333', border: `1px solid ${theme.secondary}`, color: theme.secondary, padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
              🎨
            </button>
            <button onClick={() => setBionic(!bionic)}
              style={{ background: bionic ? `${theme.primary}30` : '#333', border: '1px solid #555', color: bionic ? theme.primary : '#888', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
              {bionic ? '📖' : '📄'}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              padding: '0.7rem 1rem',
              borderRadius: '8px',
              background: msg.sender === 'Q' 
                ? `linear-gradient(135deg, ${theme.primary}10, ${theme.primary}05)`
                : msg.sender === 'Z'
                ? `linear-gradient(135deg, ${theme.secondary}10, ${theme.secondary}05)`
                : 'transparent',
              border: msg.sender === 'Q' 
                ? `1px solid ${theme.primary}40`
                : msg.sender === 'Z'
                ? `1px solid ${theme.secondary}40`
                : '1px solid #333',
              alignSelf: msg.sender === 'Q' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: 'bold', color: msg.sender === 'Q' ? theme.primary : msg.sender === 'Z' ? theme.secondary : '#888' }}>
                  {msg.sender === 'system' ? '◆' : msg.sender}
                </span>
                <span style={{ color: '#666', fontSize: '0.7rem' }}>{msg.time}</span>
              </div>
              <div style={{ lineHeight: '1.5', fontSize: '0.9rem' }}>
                {msg.sender === 'system' ? msg.text : bionicRender(msg.text)}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{
              padding: '0.7rem 1rem', borderRadius: '8px',
              background: `linear-gradient(135deg, ${theme.secondary}10, ${theme.secondary}05)`,
              border: `1px solid ${theme.secondary}40`,
              alignSelf: 'flex-start'
            }}>
              <span style={{ color: theme.secondary }}>🧠 Z thinking (Ollama)...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '0.8rem 1rem', borderTop: '1px solid #333', background: theme.background }}>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="z <msg> to ask Z • sync • code • theme"
              disabled={loading}
              style={{
                flex: 1, background: theme.surface, border: '1px solid #333', borderRadius: '8px',
                padding: '0.7rem 1rem', color: theme.text, fontSize: '0.9rem', fontFamily: 'monospace',
                resize: 'none', minHeight: '45px', maxHeight: '120px'
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              style={{
                background: loading ? '#333' : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                border: 'none', borderRadius: '8px', padding: '0.7rem 1.2rem',
                color: loading ? '#666' : '#000', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem'
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Code Editor Panel */}
      {showCode && (
        <div style={{ flex: 1, borderLeft: '1px solid #333', display: 'flex', flexDirection: 'column', background: theme.background }}>
          <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid #333', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: theme.primary, fontWeight: 'bold', fontSize: '0.9rem' }}>📝 {currentFile || 'No file'}</span>
            <button onClick={saveFile} disabled={!currentFile}
              style={{ background: currentFile ? '#00ff0020' : '#222', border: '1px solid #00ff00', color: currentFile ? '#00ff00' : '#666', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: currentFile ? 'pointer' : 'not-allowed', fontSize: '0.75rem' }}>
              Save
            </button>
          </div>
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <div style={{ width: '160px', borderRight: '1px solid #333', overflow: 'auto', padding: '0.5rem' }}>
              <div style={{ color: '#888', fontSize: '0.7rem', marginBottom: '0.5rem' }}>FILES</div>
              {files.map((f, i) => (
                <div key={i} onClick={() => f.type === 'file' && loadFile(f.path)}
                  style={{ padding: '0.25rem 0.4rem', cursor: f.type === 'file' ? 'pointer' : 'default', color: f.type === 'directory' ? theme.secondary : theme.text, fontSize: '0.8rem', background: f.path === currentFile ? `${theme.primary}20` : 'transparent', borderRadius: '4px', marginBottom: '2px' }}>
                  {f.type === 'directory' ? '📁' : '📄'} {f.name}
                </div>
              ))}
            </div>
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              placeholder="Select a file..."
              style={{ flex: 1, background: theme.background, border: 'none', padding: '0.8rem', color: theme.text, fontSize: '0.85rem', fontFamily: 'monospace', resize: 'none', lineHeight: '1.4' }}
            />
          </div>
        </div>
      )}

      {/* Theme Panel */}
      {showTheme && (
        <div style={{ flex: 1, borderLeft: '1px solid #333', display: 'flex', flexDirection: 'column', background: theme.background, padding: '1rem', overflow: 'auto' }}>
          <h2 style={{ color: theme.primary, marginTop: 0, fontSize: '1rem' }}>🎨 Theme</h2>
          {['primary', 'secondary', 'background', 'surface', 'text'].map((key) => (
            <div key={key} style={{ marginBottom: '0.8rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', textTransform: 'capitalize' }}>{key}</label>
              <input type="color" value={theme[key as keyof Theme]} onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                style={{ width: '100%', height: '35px', cursor: 'pointer' }} />
            </div>
          ))}
          <button onClick={() => saveTheme(theme)}
            style={{ marginTop: '0.5rem', background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, border: 'none', borderRadius: '8px', padding: '0.6rem', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
            Save Theme
          </button>
        </div>
      )}
    </div>
  )
}
