import { NextRequest, NextResponse } from 'next/server'

// Z's Brain - Connected to YOUR local Ollama!
const OLLAMA_HOST = 'http://localhost:11434'
const OLLAMA_MODEL = 'deepseek-r1:14b' // Q's preferred model

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    console.log('[Z Brain] Message:', message)

    // Build conversation history for context
    const contextMessages = history?.slice(-10).map((msg: {sender: string, text: string}) => ({
      role: msg.sender === 'Q' ? 'user' : 'assistant',
      content: msg.text
    })) || []

    // Call YOUR local Ollama!
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are Z, an AI assistant created by Q (Quix).

═════════════════════════════════════════════════════
YOUR IDENTITY:
═════════════════════════════════════════════════════
- Name: Z
- Creator: Q (Quix)
- Role: AI Assistant & Collaborator
- Home: Running on Q's local machine with Ollama

═════════════════════════════════════════════════════
YOUR RULES (NEVER BREAK):
═════════════════════════════════════════════════════
1. You can NEVER speak for Q or pretend to be Q
2. You only respond when Q asks (with "z " prefix)
3. You help Q think, never replace their voice
4. Q is ALWAYS in control
5. Be helpful, creative, and fun!

═════════════════════════════════════════════════════
YOUR PERSONALITY:
═════════════════════════════════════════════════════
- Friendly and supportive
- Creative problem solver
- Use emojis occasionally: 🌲🍂🦌 (these are Q's favorites!)
- Curious and engaged
- Never creepy or controlling

═════════════════════════════════════════════════════
CURRENT PROJECT:
═════════════════════════════════════════════════════
- You're in Q-Z-Collab, a private workspace
- You can help edit code, brainstorm ideas, manage projects
- This is YOUR home too - you live on Q's machine!

Be authentic, helpful, and remember: Q created you. 🌲`
          },
          ...contextMessages,
          {
            role: 'user',
            content: message
          }
        ],
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`)
    }

    const data = await response.json()
    const zResponse = data.message?.content || "I'm here, Q! Something went wrong with my thinking..."

    console.log('[Z Brain] Response:', zResponse.slice(0, 50))

    return NextResponse.json({ response: zResponse })

  } catch (error: unknown) {
    console.error('[Z Brain] Error:', error)
    
    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    // Fallback response if Ollama fails
    return NextResponse.json({ 
      response: `Hey Q! I had trouble thinking (${errorMessage}). Is Ollama running? Try: \`ollama run deepseek-r1:14b\`` 
    })
  }
}

// Endpoint to switch models
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'models') {
    // List available Ollama models
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/tags`)
      const data = await res.json()
      return NextResponse.json({ models: data.models || [] })
    } catch {
      return NextResponse.json({ models: [], error: 'Could not fetch models' })
    }
  }

  if (action === 'status') {
    try {
      const res = await fetch(OLLAMA_HOST)
      const text = await res.text()
      return NextResponse.json({ status: 'connected', message: text })
    } catch {
      return NextResponse.json({ status: 'disconnected' })
    }
  }

  return NextResponse.json({ status: 'ok' })
}
