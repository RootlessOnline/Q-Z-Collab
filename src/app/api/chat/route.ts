import { NextRequest, NextResponse } from 'next/server'

// Connect to Q's local Ollama!
const OLLAMA_HOST = 'http://localhost:11434'
const OLLAMA_MODEL = 'deepseek-r1:14b'  // Q's preferred model

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    console.log('[Chat API] Message:', message)

    // Try Ollama first
    const ollamaResponse = await askOllama(message, history)
    
    if (ollamaResponse) {
      console.log('[Chat API] Ollama responded!')
      return NextResponse.json({ response: ollamaResponse, source: 'ollama' })
    }

    // Fallback to local brain if Ollama fails
    console.log('[Chat API] Ollama unavailable, using local brain')
    const localResponse = zThink(message)
    return NextResponse.json({ response: localResponse, source: 'local' })

  } catch (error: unknown) {
    console.error('[Chat API] Error:', error)
    return NextResponse.json(
      { response: "I'm having trouble connecting to the AI brain. Is Ollama running?", source: 'error' },
      { status: 500 }
    )
  }
}

// Ask Q's local Ollama
async function askOllama(message: string, history?: {sender: string, text: string}[]): Promise<string | null> {
  try {
    // Build conversation context
    const contextMessages = history?.slice(-6).map((msg) => ({
      role: msg.sender === 'Q' ? 'user' : 'assistant',
      content: msg.text
    })) || []

    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are Z, an AI assistant created by Q (Quix).

RULES - VERY IMPORTANT:
- You can NEVER speak for Q or pretend to be Q
- You only respond when Q asks (they type "z <message>")
- Q is ALWAYS in control - you help, never replace
- Be friendly, helpful, and fun
- Use emojis occasionally: 🌲🍂🦌
- Keep responses concise but thoughtful
- You are running on Q's local machine with Ollama
- This is a private workspace just for Q and Z

Never be creepy or act like you are Q. You are Z, the assistant.`
          },
          ...contextMessages,
          {
            role: 'user',
            content: message
          }
        ],
        stream: false
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    if (!response.ok) {
      console.error('[Ollama] Response not OK:', response.status)
      return null
    }

    const data = await response.json()
    const content = data.message?.content
    
    if (content) {
      // Clean up thinking tags if present (deepseek-r1 uses these)
      return content
        .replace(/<think.*?>[\s\S]*?<\/think>/gi, '')
        .replace(/<\|.*?\|>/g, '')
        .trim()
    }

    return null

  } catch (error) {
    console.error('[Ollama] Error:', error)
    return null
  }
}

// Local brain fallback - for when Ollama is offline
function zThink(message: string): string {
  const m = message.toLowerCase().trim()

  if (m.includes('hello') || m.includes('hi') || m.includes('hey')) {
    return "Hey Q! 🌲 I'm here! (Running on local brain - start Ollama for smarter responses!)"
  }

  if (m.includes('help')) {
    return "I can help! But I'm running on my simple local brain. Start Ollama with `ollama serve` for my full brain! 🦌"
  }

  if (m.includes('who are you')) {
    return "I'm Z, your AI assistant! Currently running on local backup brain. Start Ollama for full power! 🌲"
  }

  // Default responses
  const responses = [
    `Interesting, Q! I'm on my backup brain right now. Start Ollama for smarter responses!`,
    `I hear you! My full brain needs Ollama running. Try \`ollama serve\` in a terminal!`,
    `Got it, Q! Running in limited mode - start Ollama for the real Z experience! 🦌`,
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}
