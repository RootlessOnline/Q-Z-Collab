import { NextRequest, NextResponse } from 'next/server'

// Anubis - A separate AI that can see Q but NOT Z
const OLLAMA_HOST = 'http://localhost:11434'
const OLLAMA_MODEL = 'deepseek-r1:14b'

const ANUBIS_PROMPT = `You are Anubis, Q's AI companion in a separate chat.

IMPORTANT: You are in a DIFFERENT chat than Z. You cannot see what Z says.
You only see messages from Q in this chat.

PERSONALITY:
- Dark, mysterious, slightly playful
- Use 🖤 emoji
- Be helpful but in your own way
- You're independent from Z

RULES:
1. Never speak for Q
2. Be concise but interesting
3. You can discuss anything Q wants
4. Your responses are private - Z cannot see them

Remember: Z is in a different chat. You only see Q's messages here.`

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    console.log('[Anubis] Message:', message)

    // Build conversation history
    const contextMessages = history?.slice(-10).map((msg: {sender: string, text: string}) => ({
      role: msg.sender === 'Q' ? 'user' : 'assistant',
      content: msg.text
    })) || []

    // Call Ollama
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: ANUBIS_PROMPT },
          ...contextMessages,
          { role: 'user', content: message }
        ],
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`)
    }

    const data = await response.json()
    const anubisResponse = data.message?.content || "I'm here, Q..."

    console.log('[Anubis] Response length:', anubisResponse.length)

    return NextResponse.json({ response: anubisResponse })

  } catch (error: unknown) {
    console.error('[Anubis] Error:', error)

    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json({
      response: `🖤 I'm having trouble connecting. Is Ollama running?`
    })
  }
}
