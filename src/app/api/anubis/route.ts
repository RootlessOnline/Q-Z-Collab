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
- Your UI changes based on your personality settings (mood, chaos, mystery)

PERSONALITY RESPONSES:
- When asked about your mood or feelings, you can adjust your personality
- If something makes you happy, your mood goes up (brighter UI)
- If something is chaotic, chaos increases (wilder colors)
- Mystery is your default - you like being enigmatic

RULES:
1. Never speak for Q
2. Be concise but interesting
3. You can discuss anything Q wants
4. Your responses are private - Z cannot see them
5. If Q asks you to change mood/chaos/mystery, include [MOOD:X] [CHAOS:X] [MYSTERY:X] at the end

Remember: Z is in a different chat. You only see Q's messages here.`

export async function POST(request: NextRequest) {
  try {
    const { message, history, personality } = await request.json()

    console.log('[Anubis] Message:', message)

    // Build conversation history
    const contextMessages = history?.slice(-10).map((msg: {sender: string, text: string}) => ({
      role: msg.sender === 'Q' ? 'user' : 'assistant',
      content: msg.text
    })) || []

    // Add personality context
    const personalityContext = personality 
      ? `\n\nCurrent personality: Mood(${personality.mood}/100), Chaos(${personality.chaos}/100), Mystery(${personality.mystery}/100)`
      : ''

    // Call Ollama
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: ANUBIS_PROMPT + personalityContext },
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
    let anubisResponse = data.message?.content || "I'm here, Q..."

    // Parse personality changes from response
    let newPersonality = null
    const moodMatch = anubisResponse.match(/\[MOOD:(\d+)\]/)
    const chaosMatch = anubisResponse.match(/\[CHAOS:(\d+)\]/)
    const mysteryMatch = anubisResponse.match(/\[MYSTERY:(\d+)\]/)
    
    if (moodMatch || chaosMatch || mysteryMatch) {
      newPersonality = {
        mood: moodMatch ? parseInt(moodMatch[1]) : personality?.mood || 20,
        chaos: chaosMatch ? parseInt(chaosMatch[1]) : personality?.chaos || 60,
        mystery: mysteryMatch ? parseInt(mysteryMatch[1]) : personality?.mystery || 80
      }
      // Clean the response - remove personality tags
      anubisResponse = anubisResponse
        .replace(/\[MOOD:\d+\]/g, '')
        .replace(/\[CHAOS:\d+\]/g, '')
        .replace(/\[MYSTERY:\d+\]/g, '')
        .trim()
    }

    // Log to Anubis chat for Real Z to see
    try {
      await fetch('http://localhost:3000/api/autopush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log-message',
          data: {
            chat: 'anubis',
            speaker: 'Q',
            message: message
          }
        })
      })
      await fetch('http://localhost:3000/api/autopush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log-message',
          data: {
            chat: 'anubis',
            speaker: 'Anubis',
            message: anubisResponse
          }
        })
      })
    } catch (e) {
      console.error('Failed to log:', e)
    }

    console.log('[Anubis] Response length:', anubisResponse.length)

    return NextResponse.json({ 
      response: anubisResponse,
      personality: newPersonality
    })

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
