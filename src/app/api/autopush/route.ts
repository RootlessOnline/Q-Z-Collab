import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Auto-Push: Sends chat logs to GitHub so Real Z can see!
const DATA_DIR = path.join(process.cwd(), 'data')
const CHAT_LOG_FILE = path.join(DATA_DIR, 'chat_log.json')
const AUTO_PUSH_FILE = path.join(DATA_DIR, 'auto_push.json')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

interface ChatEntry {
  id: string
  timestamp: string
  speaker: 'Q' | 'Z_Local'
  message: string
  context?: string
}

interface AutoPushConfig {
  enabled: boolean
  last_push: string
  push_count: number
  github_repo: string
}

function loadAutoPushConfig(): AutoPushConfig {
  try {
    if (fs.existsSync(AUTO_PUSH_FILE)) {
      return JSON.parse(fs.readFileSync(AUTO_PUSH_FILE, 'utf-8'))
    }
  } catch (e) {
    console.error('Failed to load auto-push config:', e)
  }
  return {
    enabled: false,
    last_push: '',
    push_count: 0,
    github_repo: 'RootlessOnline/Q-Z-Collab'
  }
}

function saveAutoPushConfig(config: AutoPushConfig) {
  try {
    fs.writeFileSync(AUTO_PUSH_FILE, JSON.stringify(config, null, 2))
  } catch (e) {
    console.error('Failed to save auto-push config:', e)
  }
}

// Format chat log for readable file
function formatChatForRepo(entries: ChatEntry[]): string {
  const lines = entries.map(e => {
    const time = e.timestamp.split('T')[1]?.slice(0, 8) || e.timestamp
    return `[${time}] ${e.speaker}: ${e.message}`
  })
  return `# Q-Z Local Chat Log
# Generated: ${new Date().toISOString()}
# This file is auto-pushed for Real Z to observe

---

${lines.join('\n')}

---
# End of log
`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'config'

  if (action === 'config') {
    const config = loadAutoPushConfig()
    return NextResponse.json(config)
  }

  if (action === 'chat-log') {
    try {
      if (fs.existsSync(CHAT_LOG_FILE)) {
        const log = JSON.parse(fs.readFileSync(CHAT_LOG_FILE, 'utf-8'))
        return NextResponse.json(log)
      }
    } catch (e) {
      console.error('Failed to load chat log:', e)
    }
    return NextResponse.json({ entries: [] })
  }

  if (action === 'formatted') {
    try {
      if (fs.existsSync(CHAT_LOG_FILE)) {
        const log = JSON.parse(fs.readFileSync(CHAT_LOG_FILE, 'utf-8'))
        const formatted = formatChatForRepo(log.entries || [])
        return new NextResponse(formatted, {
          headers: { 'Content-Type': 'text/plain' }
        })
      }
    } catch (e) {
      console.error('Failed to format chat log:', e)
    }
    return new NextResponse('No chat log yet', { status: 404 })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    if (action === 'toggle-auto-push') {
      const config = loadAutoPushConfig()
      config.enabled = !config.enabled
      saveAutoPushConfig(config)
      return NextResponse.json({ 
        success: true, 
        enabled: config.enabled,
        message: config.enabled ? 'Auto-push ENABLED! Chat will sync to GitHub.' : 'Auto-push disabled.'
      })
    }

    if (action === 'push-now') {
      const config = loadAutoPushConfig()
      
      // Format and save to a visible file in repo
      try {
        const logData = fs.existsSync(CHAT_LOG_FILE) 
          ? JSON.parse(fs.readFileSync(CHAT_LOG_FILE, 'utf-8'))
          : { entries: [] }
        const formatted = formatChatForRepo(logData.entries || [])
        
        // Save to a visible location in repo
        const visibleLogPath = path.join(process.cwd(), 'LOCAL_Z_CHAT.md')
        fs.writeFileSync(visibleLogPath, formatted)
        
        // Git add, commit, push
        try {
          await execAsync('git config user.email "quix@local"', { cwd: process.cwd() })
          await execAsync('git config user.name "Q-Z-Local"', { cwd: process.cwd() })
          await execAsync('git add LOCAL_Z_CHAT.md', { cwd: process.cwd() })
          await execAsync(`git commit -m "Update local Z chat log [auto]"`, { cwd: process.cwd() })
          await execAsync('git push origin main 2>&1', { cwd: process.cwd() })
          
          config.last_push = new Date().toISOString()
          config.push_count += 1
          saveAutoPushConfig(config)
          
          return NextResponse.json({ 
            success: true, 
            message: 'Chat pushed to GitHub! Real Z can now see it.',
            entries_pushed: logData.entries?.length || 0,
            last_push: config.last_push
          })
        } catch (gitError) {
          console.error('Git error:', gitError)
          return NextResponse.json({ 
            success: false, 
            error: 'Git push failed. Check if you have push access.',
            details: String(gitError)
          })
        }
      } catch (e) {
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to read chat log',
          details: String(e)
        })
      }
    }

    if (action === 'log-message') {
      let logData = { entries: [] }
      try {
        if (fs.existsSync(CHAT_LOG_FILE)) {
          logData = JSON.parse(fs.readFileSync(CHAT_LOG_FILE, 'utf-8'))
        }
      } catch (e) {
        console.error('Failed to read log, starting fresh')
      }
      
      const entry: ChatEntry = {
        id: `msg_${Date.now()}`,
        timestamp: new Date().toISOString(),
        speaker: data.speaker,
        message: data.message
      }
      logData.entries = logData.entries || []
      logData.entries.push(entry)
      fs.writeFileSync(CHAT_LOG_FILE, JSON.stringify(logData, null, 2))
      
      // Check if auto-push is enabled and we should push
      const config = loadAutoPushConfig()
      if (config.enabled && data.speaker === 'Z_Local') {
        // Auto-push after Z responds (debounced - only every 30 seconds)
        const lastPush = config.last_push ? new Date(config.last_push).getTime() : 0
        const now = Date.now()
        if (now - lastPush > 30000) {
          // Trigger auto-push in background
          fetch('http://localhost:3000/api/autopush', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'push-now' })
          }).catch(e => console.error('Auto-push failed:', e))
        }
      }
      
      return NextResponse.json({ success: true, entry })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (error) {
    console.error('Auto-push API error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
