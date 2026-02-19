'use client'

import { useState, useRef, useEffect, useCallback, memo } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 V3 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

interface Message {
  id: number
  sender: 'Q' | 'Z' | 'Anubis' | 'system'
  text: string
  time: string
}

type Mode = 'split' | 'style' | 'code' | 'config'
type EmotionKey = 'happy' | 'angry' | 'annoyed' | 'pondering' | 'reflecting' | 'curious' | 'playful' | 'melancholy' | 'mysterious'

interface Emotions {
  happy: number
  angry: number
  annoyed: number
  pondering: number
  reflecting: number
  curious: number
  playful: number
  melancholy: number
  mysterious: number
}

// V3: Moral Compass Weight System
interface MemoryWeights {
  timesFelt: number      // Base weight: 1.00
  timesPromoted: number  // Weight: 1.33
  timesRejected: number  // Weight: 0.72
  timesAscended: number  // Weight: 1.73 (Core memories)
}

// V3: Memory Fate types
type MemoryFate = 'none' | 'ascended' | 'promoted' | 'fading' | 'reflected'

// V3: Enhanced Short Term Thought with slot position and fate
interface ShortTermThought {
  id: string
  thought: string
  timestamp: Date
  emotions: Partial<Emotions>
  slot: number // 1-6
  glyphWord?: string // One word chosen during GLYPH reflection
  fate: MemoryFate
  reflectionTimestamp?: Date
}

interface GoldenMemory {
  id: string
  memory: string
  timestamp: Date
  emotions: Partial<Emotions>
  reflection: string
  glyphWord?: string
}

interface SelfRealization {
  id: string
  word: string
  definition: string
  discoveredAt: Date
  emotionCombo: EmotionKey[]
  timesFelt: number
  color?: string
  faceDescription?: string
}

// V3: Discovered Emotion (from ASCENDED memories)
interface DiscoveredEmotion {
  id: string
  word: string
  color: string
  faceDescription: string
  discoveredAt: Date
  fromMemory: string
}

// V3: Personality Trait for display
interface PersonalityTrait {
  name: string
  value: number
  icon: string
  description: string
}

interface AnubisSoul {
  emotions: Emotions
  currentMood: EmotionKey
  shortTermMemory: ShortTermThought[]
  goldenMemories: GoldenMemory[]
  selfRealizations: SelfRealization[]
  discoveredEmotions: DiscoveredEmotion[]
  moralCompass: Record<string, MemoryWeights>
  personalityCore: {
    baseEmotions: Emotions
    traits: string[]
    conversationsHad: number
    created: Date
  }
  personalityTraits: PersonalityTrait[]
  level: number
  xp: number
  lastReflection?: Date
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 DUNGEON COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════════════

const COLORS = {
  // Dungeon base
  abyss: '#0a0a0a',
  stone: '#3a3a4a',
  stoneDark: '#2a2a3a',
  stoneLight: '#4a4a5a',
  
  // Torch/warm
  torchOrange: '#c4762a',
  torchYellow: '#d4a62a',
  ember: '#a44a1a',
  
  // Magic/soul
  shadowPurple: '#4a2a5a',
  crystalBlue: '#2a4a6a',
  soulPurple: '#6a3a8a',
  
  // Glyph colors
  glyphGold: '#d4a62a',
  glyphPurple: '#8a4aba',
  
  // Text
  bone: '#8a8a9a',
  boneLight: '#aaaaba',
  
  // Mood colors (muted dungeon style)
  moods: {
    happy: '#5a8a4a',
    angry: '#8a3a3a',
    annoyed: '#7a5a3a',
    pondering: '#4a6a8a',
    reflecting: '#6a5a7a',
    curious: '#4a8a8a',
    playful: '#8a5a8a',
    melancholy: '#4a5a6a',
    mysterious: '#6a4a8a'
  }
} as const

const MOODS: { key: EmotionKey; icon: string; color: string }[] = [
  { key: 'happy', icon: '😊', color: COLORS.moods.happy },
  { key: 'angry', icon: '😠', color: COLORS.moods.angry },
  { key: 'annoyed', icon: '😒', color: COLORS.moods.annoyed },
  { key: 'pondering', icon: '🤔', color: COLORS.moods.pondering },
  { key: 'reflecting', icon: '🪞', color: COLORS.moods.reflecting },
  { key: 'curious', icon: '🔍', color: COLORS.moods.curious },
  { key: 'playful', icon: '🎭', color: COLORS.moods.playful },
  { key: 'melancholy', icon: '🌧️', color: COLORS.moods.melancholy },
  { key: 'mysterious', icon: '🌙', color: COLORS.moods.mysterious }
]

// ═══════════════════════════════════════════════════════════════════════════════
// 🐺 V3 PIXEL WOLF FACE COMPONENT (140x140 with animations)
// ═══════════════════════════════════════════════════════════════════════════════

const PixelWolf = memo(({ mood, size = 140, animate = true }: { mood: EmotionKey; size?: number; animate?: boolean }) => {
  const moodColor = COLORS.moods[mood] || COLORS.moods.mysterious
  const [isBlinking, setIsBlinking] = useState(false)
  const [earTwitch, setEarTwitch] = useState(false)
  
  // Blink every 3-5 seconds
  useEffect(() => {
    if (!animate) return
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(blinkInterval)
  }, [animate])
  
  // Random ear twitch
  useEffect(() => {
    if (!animate) return
    const twitchInterval = setInterval(() => {
      setEarTwitch(true)
      setTimeout(() => setEarTwitch(false), 200)
    }, 2000 + Math.random() * 3000)
    return () => clearInterval(twitchInterval)
  }, [animate])
  
  // Each mood has unique pixel patterns
  const getMoodPattern = () => {
    switch (mood) {
      case 'happy':
        return {
          eyes: 'wide-open',
          mouth: 'smile',
          extras: ['sparkles', 'hearts'],
          browStyle: 'normal'
        }
      case 'angry':
        return {
          eyes: 'angry',
          mouth: 'frown',
          extras: ['steam'],
          browStyle: 'angry'
        }
      case 'annoyed':
        return {
          eyes: 'half-lidded',
          mouth: 'flat',
          extras: [],
          browStyle: 'flat'
        }
      case 'pondering':
        return {
          eyes: 'looking-up',
          mouth: 'slight-frown',
          extras: ['thought-dots'],
          browStyle: 'raised'
        }
      case 'reflecting':
        return {
          eyes: 'soft-closed',
          mouth: 'neutral',
          extras: ['shimmer'],
          browStyle: 'relaxed'
        }
      case 'curious':
        return {
          eyes: 'big-round',
          mouth: 'small-o',
          extras: ['question-marks'],
          browStyle: 'raised'
        }
      case 'playful':
        return {
          eyes: 'wink',
          mouth: 'tongue',
          extras: ['sparkles', 'hearts'],
          browStyle: 'playful'
        }
      case 'melancholy':
        return {
          eyes: 'sad',
          mouth: 'sad',
          extras: ['tears'],
          browStyle: 'sad'
        }
      case 'mysterious':
      default:
        return {
          eyes: 'hidden-glow',
          mouth: 'enigmatic',
          extras: ['shadow-particles'],
          browStyle: 'shadowy'
        }
    }
  }

  const pattern = getMoodPattern()
  const pixelSize = Math.floor(size / 16)
  
  return (
    <div style={{ 
      width: size, 
      height: size, 
      position: 'relative', 
      flexShrink: 0,
      animation: animate ? 'wolfBreathing 3s ease-in-out infinite' : 'none'
    }}>
      {/* Base pixel wolf using CSS box-shadow technique */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: pixelSize,
          height: pixelSize,
          color: moodColor,
          background: 'transparent',
          boxShadow: generatePixelWolfShadow(mood, pixelSize, moodColor, isBlinking, earTwitch),
          transform: 'translate(0, 0)'
        }}
      />
      
      {/* SVG Glow overlay */}
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        <defs>
          {/* Glow filter */}
          <filter id={`glow-${mood}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Gradient for eyes */}
          <radialGradient id={`eyeGlow-${mood}`}>
            <stop offset="0%" stopColor={moodColor} stopOpacity="0.8"/>
            <stop offset="100%" stopColor={moodColor} stopOpacity="0"/>
          </radialGradient>
          
          {/* Particle filter */}
          <filter id="particleGlow">
            <feGaussianBlur stdDeviation="1.5"/>
          </filter>
        </defs>
        
        {/* Eye glows */}
        {(pattern.eyes === 'wide-open' || pattern.eyes === 'big-round') && !isBlinking && (
          <>
            <circle cx={size * 0.3} cy={size * 0.35} r={pixelSize * 2} fill={moodColor} opacity="0.6" filter={`url(#glow-${mood})`}>
              {animate && <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite"/>}
            </circle>
            <circle cx={size * 0.7} cy={size * 0.35} r={pixelSize * 2} fill={moodColor} opacity="0.6" filter={`url(#glow-${mood})`}>
              {animate && <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite"/>}
            </circle>
          </>
        )}
        
        {/* Blink animation overlay */}
        {isBlinking && (
          <>
            <rect x={size * 0.22} y={size * 0.33} width={size * 0.18} height={pixelSize * 0.5} fill={moodColor} rx="2"/>
            <rect x={size * 0.6} y={size * 0.33} width={size * 0.18} height={pixelSize * 0.5} fill={moodColor} rx="2"/>
          </>
        )}
        
        {/* Mysterious shadow particles */}
        {pattern.extras.includes('shadow-particles') && (
          <>
            {[...Array(8)].map((_, i) => (
              <circle 
                key={i}
                r={pixelSize * 0.8}
                fill={moodColor}
                opacity="0.5"
                filter="url(#particleGlow)"
              >
                <animate 
                  attributeName="cx" 
                  values={`${size * (0.1 + i * 0.1)};${size * (0.15 + i * 0.1)};${size * (0.1 + i * 0.1)}`}
                  dur={`${1.5 + i * 0.3}s`}
                  repeatCount="indefinite"
                />
                <animate 
                  attributeName="cy" 
                  values={`${size * 0.9};${size * 0.85};${size * 0.9}`}
                  dur={`${1.2 + i * 0.2}s`}
                  repeatCount="indefinite"
                />
                <animate 
                  attributeName="opacity" 
                  values="0.2;0.6;0.2"
                  dur={`${1 + i * 0.1}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </>
        )}
        
        {/* Sparkles for happy/playful */}
        {pattern.extras.includes('sparkles') && (
          <>
            {[...Array(6)].map((_, i) => (
              <g key={i}>
                <circle 
                  cx={size * (0.1 + i * 0.15)} 
                  cy={size * 0.08} 
                  r={pixelSize * 0.5}
                  fill="#ffd700"
                  opacity="0.8"
                >
                  {animate && <animate attributeName="opacity" values="0;1;0" dur={`${1 + i * 0.2}s`} repeatCount="indefinite"/>}
                </circle>
              </g>
            ))}
          </>
        )}
        
        {/* Hearts for playful */}
        {pattern.extras.includes('hearts') && (
          <>
            <text x={size * 0.1} y={size * 0.15} fontSize={size * 0.1} fill="#ff6b9d" opacity="0.8">
              {animate && <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/>}
              ♥
            </text>
            <text x={size * 0.85} y={size * 0.15} fontSize={size * 0.1} fill="#ff6b9d" opacity="0.8">
              {animate && <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s"/>}
              ♥
            </text>
          </>
        )}
        
        {/* Tears for melancholy */}
        {pattern.extras.includes('tears') && (
          <>
            <ellipse cx={size * 0.3} cy={size * 0.5} rx={pixelSize * 0.8} ry={pixelSize * 1.5} fill="#4a6a8a" opacity="0.7">
              {animate && <animate attributeName="cy" values={`${size * 0.45};${size * 0.6};${size * 0.45}`} dur="2s" repeatCount="indefinite"/>}
            </ellipse>
            <ellipse cx={size * 0.7} cy={size * 0.5} rx={pixelSize * 0.8} ry={pixelSize * 1.5} fill="#4a6a8a" opacity="0.7">
              {animate && <animate attributeName="cy" values={`${size * 0.5};${size * 0.65};${size * 0.5}`} dur="2.2s" repeatCount="indefinite"/>}
            </ellipse>
          </>
        )}
        
        {/* Steam for angry */}
        {pattern.extras.includes('steam') && (
          <>
            {[0, 1, 2].map(i => (
              <circle key={i} cx={size * (0.2 + i * 0.3)} cy={size * 0.1} r={pixelSize * 0.6} fill="#888" opacity="0.5">
                {animate && (
                  <>
                    <animate attributeName="cy" values={`${size * 0.15};${size * 0.05};${size * 0.15}`} dur="1s" repeatCount="indefinite" begin={`${i * 0.2}s`}/>
                    <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1s" repeatCount="indefinite" begin={`${i * 0.2}s`}/>
                  </>
                )}
              </circle>
            ))}
          </>
        )}
      </svg>
      
      {/* Breathing animation style */}
      <style>{`
        @keyframes wolfBreathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  )
})

// Generate pixel wolf using box-shadow (classic CSS pixel art technique)
function generatePixelWolfShadow(mood: EmotionKey, pixel: number, color: string, isBlinking: boolean, earTwitch: boolean): string {
  // 16x16 grid mapped to box-shadows - now 140x140 size
  const baseWolf = [
    // Ears (top)
    '2,1', '3,1', '12,1', '13,1',
    '2,2', '3,2', '4,2', '11,2', '12,2', '13,2',
    // Forehead
    '3,3', '4,3', '5,3', '10,3', '11,3', '12,3',
    '2,3', '13,3',
    // Eyes row
    '1,4', '2,4', '3,4', '4,4', '5,4', '6,4', '9,4', '10,4', '11,4', '12,4', '13,4', '14,4',
    // Eye whites
    '3,5', '4,5', '5,5', '10,5', '11,5', '12,5',
    // Snout top
    '2,6', '3,6', '4,6', '5,6', '6,6', '7,6', '8,6', '9,6', '10,6', '11,6', '12,6', '13,6',
    // Nose
    '7,7', '8,7',
    // Mouth area
    '4,7', '5,7', '6,7', '9,7', '10,7', '11,7',
    // Lower face
    '3,8', '4,8', '5,8', '6,8', '7,8', '8,8', '9,8', '10,8', '11,8', '12,8',
    '4,9', '5,9', '6,9', '7,9', '8,9', '9,9', '10,9', '11,9',
    // Bottom
    '5,10', '6,10', '7,10', '8,10', '9,10', '10,10',
    '6,11', '7,11', '8,11', '9,11',
  ]
  
  // Eye positions (to be colored differently)
  const eyePositions = ['4,5', '5,5', '10,5', '11,5']
  const pupilPositions = mood === 'angry' ? ['4,5', '10,5'] : (mood === 'mysterious' ? [] : ['4,5', '11,5'])
  const nosePositions = ['7,7', '8,7']
  const earPositions = ['2,1', '3,1', '12,1', '13,1', '2,2', '3,2', '4,2', '11,2', '12,2', '13,2']
  
  const darkColor = '#1a1a2a'
  const eyeColor = mood === 'mysterious' ? color : '#8af'
  const noseColor = '#2a2a3a'
  
  return baseWolf.map(pos => {
    const [x, y] = pos.split(',').map(Number)
    let pixelColor = color
    
    // Ear twitch effect
    if (earPositions.includes(pos) && earTwitch) {
      const twitchOffset = Math.random() > 0.5 ? pixel * 0.1 : -pixel * 0.1
      return `${x * pixel + twitchOffset}px ${y * pixel - pixel * 0.05}px ${pixelColor}`
    }
    
    if (pupilPositions.includes(pos)) {
      // Blinking - hide pupils
      pixelColor = isBlinking ? darkColor : eyeColor
    }
    else if (eyePositions.includes(pos)) {
      pixelColor = mood === 'mysterious' ? darkColor : (isBlinking ? darkColor : '#fff')
    }
    else if (nosePositions.includes(pos)) pixelColor = noseColor
    
    return `${x * pixel}px ${y * pixel}px ${pixelColor}`
  }).join(', ')
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔥 ANIMATED TORCH COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const AnimatedTorch = memo(({ size = 40 }: { size?: number }) => {
  return (
    <div style={{ width: size, height: size * 1.5, position: 'relative' }}>
      <svg width={size} height={size * 1.5} viewBox="0 0 40 60">
        <defs>
          <radialGradient id="flameGradient" cx="50%" cy="100%" r="80%">
            <stop offset="0%" stopColor={COLORS.torchYellow}/>
            <stop offset="50%" stopColor={COLORS.torchOrange}/>
            <stop offset="100%" stopColor={COLORS.ember}/>
          </radialGradient>
          <radialGradient id="flameCore" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#fff8a0"/>
            <stop offset="100%" stopColor={COLORS.torchYellow}/>
          </radialGradient>
          <filter id="fireGlow">
            <feGaussianBlur stdDeviation="2" result="glow"/>
            <feMerge>
              <feMergeNode in="glow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Torch holder (pixel style) */}
        <rect x="16" y="35" width="8" height="20" fill={COLORS.stoneDark}/>
        <rect x="14" y="55" width="12" height="5" fill={COLORS.stone}/>
        <rect x="12" y="33" width="16" height="4" fill={COLORS.stoneLight}/>
        
        {/* Flame outer */}
        <ellipse cx="20" cy="20" rx="10" ry="15" fill="url(#flameGradient)" filter="url(#fireGlow)">
          <animate attributeName="ry" values="15;12;15" dur="0.3s" repeatCount="indefinite"/>
          <animate attributeName="rx" values="10;8;10" dur="0.25s" repeatCount="indefinite"/>
        </ellipse>
        
        {/* Flame inner */}
        <ellipse cx="20" cy="22" rx="5" ry="8" fill="url(#flameCore)">
          <animate attributeName="ry" values="8;6;8" dur="0.2s" repeatCount="indefinite"/>
          <animate attributeName="cy" values="22;24;22" dur="0.3s" repeatCount="indefinite"/>
        </ellipse>
        
        {/* Sparks */}
        {[
          { x: 15, y: 8, dur: '0.8s' },
          { x: 25, y: 10, dur: '1s' },
          { x: 20, y: 5, dur: '0.6s' }
        ].map((spark, i) => (
          <circle key={i} cx={spark.x} cy={spark.y} r="1.5" fill={COLORS.torchYellow}>
            <animate attributeName="cy" values={`${spark.y};${spark.y - 10};${spark.y}`} dur={spark.dur} repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;0;1" dur={spark.dur} repeatCount="indefinite"/>
          </circle>
        ))}
      </svg>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════
// 💭 THOUGHT BUBBLE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const ThoughtBubble = memo(({ thoughts, color, visible }: { thoughts: string[]; color: string; visible: boolean }) => {
  if (!visible || thoughts.length === 0) return null
  
  return (
    <div style={{
      position: 'relative',
      marginBottom: '8px',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none">
        <circle cx="30" cy="15" r="6" fill={color} opacity="0.3"/>
        <circle cx="45" cy="10" r="8" fill={color} opacity="0.4"/>
        <circle cx="65" cy="8" r="5" fill={color} opacity="0.3"/>
      </svg>
      <div style={{
        background: `linear-gradient(135deg, ${color}15, ${color}25)`,
        border: `1px solid ${color}50`,
        borderRadius: '8px',
        padding: '10px 14px',
        fontFamily: 'monospace',
        fontSize: '13px',
        color: COLORS.boneLight,
        lineHeight: 1.5,
        backdropFilter: 'blur(4px)'
      }}>
        <div style={{ color, marginBottom: '4px', fontWeight: 'bold' }}>💭 Anubis thinks...</div>
        {thoughts.map((thought, i) => (
          <div key={i} style={{ opacity: 0.9 }}>{thought}</div>
        ))}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 V3 EMOTION BAR COMPONENT (Vertical for Mood Panel)
// ═══════════════════════════════════════════════════════════════════════════════

const EmotionBar = memo(({ emotion, value, isDominant, vertical = false }: { 
  emotion: typeof MOODS[0]; 
  value: number; 
  isDominant: boolean;
  vertical?: boolean;
}) => {
  if (vertical) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 4px',
        background: isDominant ? `${emotion.color}15` : 'transparent',
        borderRadius: '4px',
        border: isDominant ? `1px solid ${emotion.color}50` : '1px solid transparent',
        boxShadow: isDominant ? `0 0 10px ${emotion.color}30` : 'none'
      }}>
        <span style={{ fontSize: '18px', marginBottom: '4px' }}>{emotion.icon}</span>
        <div style={{ 
          width: '8px', 
          height: '60px', 
          background: COLORS.abyss, 
          borderRadius: '4px',
          overflow: 'hidden',
          border: `1px solid ${COLORS.stoneDark}`,
          position: 'relative'
        }}>
          <div 
            style={{ 
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${Math.min(value, 100)}%`, 
              background: `linear-gradient(0deg, ${emotion.color}, ${emotion.color}aa)`,
              transition: 'height 0.5s ease-out',
              boxShadow: `0 0 8px ${emotion.color}50`
            }}
          />
        </div>
        <span style={{ 
          fontSize: '9px', 
          color: isDominant ? emotion.color : COLORS.bone,
          fontFamily: "'Press Start 2P', monospace",
          marginTop: '4px',
          textAlign: 'center'
        }}>
          {emotion.key.slice(0, 4).toUpperCase()}
        </span>
        <span style={{ 
          fontSize: '10px', 
          color: isDominant ? emotion.color : COLORS.bone,
          fontFamily: "'Press Start 2P', monospace"
        }}>
          {Math.round(value)}%
        </span>
      </div>
    )
  }
  
  // Horizontal version
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 0',
      background: isDominant ? `${emotion.color}10` : 'transparent',
      borderRadius: '4px',
      paddingLeft: isDominant ? '4px' : 0
    }}>
      <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{emotion.icon}</span>
      <span style={{ 
        fontSize: '12px', 
        width: '75px', 
        color: isDominant ? emotion.color : COLORS.bone,
        fontFamily: "'Press Start 2P', monospace",
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {emotion.key.slice(0, 4)}
      </span>
      <div style={{ 
        flex: 1, 
        height: '12px', 
        background: COLORS.abyss, 
        borderRadius: '2px',
        overflow: 'hidden',
        border: `1px solid ${COLORS.stoneDark}`
      }}>
        <div 
          style={{ 
            width: `${Math.min(value, 100)}%`, 
            height: '100%', 
            background: `linear-gradient(90deg, ${emotion.color}, ${emotion.color}aa)`,
            transition: 'width 0.5s ease-out',
            boxShadow: `0 0 8px ${emotion.color}50`
          }}
        />
      </div>
      <span style={{ 
        fontSize: '11px', 
        width: '35px', 
        textAlign: 'right',
        color: isDominant ? emotion.color : COLORS.bone,
        fontFamily: "'Press Start 2P', monospace"
      }}>
        {Math.round(value)}%
      </span>
      {isDominant && <span style={{ color: emotion.color, fontSize: '12px' }}>◄</span>}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 V3 PERSONALITY BARS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const PersonalityBars = memo(({ soul }: { soul: AnubisSoul }) => {
  // Calculate personality traits from soul data
  const traits = calculatePersonalityTraits(soul)
  
  return (
    <div style={{
      background: COLORS.stoneDark + '60',
      borderRadius: '6px',
      border: `1px solid ${COLORS.stone}`,
      padding: '8px'
    }}>
      <div style={{
        fontSize: '10px',
        color: COLORS.soulPurple,
        marginBottom: '8px',
        fontFamily: "'Press Start 2P', monospace",
        textAlign: 'center'
      }}>
        📊 PERSONALITY
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {traits.map((trait, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px'
          }}>
            <span style={{ width: '16px', textAlign: 'center' }}>{trait.icon}</span>
            <span style={{ 
              width: '60px', 
              color: COLORS.bone,
              fontFamily: 'monospace'
            }}>
              {trait.name}
            </span>
            <div style={{ 
              flex: 1, 
              height: '8px', 
              background: COLORS.abyss, 
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div 
                style={{ 
                  width: `${trait.value}%`, 
                  height: '100%', 
                  background: COLORS.soulPurple,
                  transition: 'width 0.3s'
                }}
              />
            </div>
            <span style={{ 
              width: '30px', 
              textAlign: 'right',
              color: COLORS.boneLight,
              fontSize: '10px'
            }}>
              {trait.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})

// Calculate personality traits from soul data
function calculatePersonalityTraits(soul: AnubisSoul): PersonalityTrait[] {
  const traits: PersonalityTrait[] = []
  
  // Wisdom from golden memories (weighted 3x)
  const wisdom = Math.min(100, (soul.goldenMemories.length * 15) + (soul.selfRealizations.length * 10))
  traits.push({ name: 'Wisdom', value: wisdom, icon: '🦉', description: 'From golden memories' })
  
  // Curiosity from questions asked
  const curiosity = Math.min(100, (soul.emotions.curious || 0) + (soul.personalityCore.conversationsHad * 2))
  traits.push({ name: 'Curious', value: curiosity, icon: '🔍', description: 'From questions' })
  
  // Empathy from emotional variety
  const emotionCount = Object.values(soul.emotions).filter(v => v > 20).length
  const empathy = Math.min(100, emotionCount * 11 + (soul.goldenMemories.length * 5))
  traits.push({ name: 'Empathy', value: empathy, icon: '💜', description: 'From emotional depth' })
  
  // Memory from STM usage
  const memoryStrength = Math.min(100, soul.shortTermMemory.length * 16 + (soul.moralCompass ? Object.keys(soul.moralCompass).length * 5 : 0))
  traits.push({ name: 'Memory', value: memoryStrength, icon: '🧠', description: 'From STM slots' })
  
  // Maturity from total conversations
  const maturity = Math.min(100, soul.personalityCore.conversationsHad * 3 + soul.level * 10)
  traits.push({ name: 'Mature', value: maturity, icon: '🎭', description: 'From experience' })
  
  return traits
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎒 V3 MIND PALACE TABS (with 6-slot STM)
// ═══════════════════════════════════════════════════════════════════════════════

type MindPalaceTab = 'stm' | 'golden' | 'realizations'

const MindPalace = memo(({ 
  soul, 
  activeTab, 
  setActiveTab,
  onSlotClick
}: { 
  soul: AnubisSoul
  activeTab: MindPalaceTab
  setActiveTab: (t: MindPalaceTab) => void
  onSlotClick?: (slot: number) => void
}) => {
  const formatTime = (date: Date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const tabs: { key: MindPalaceTab; icon: string; label: string; count: number }[] = [
    { key: 'stm', icon: '💭', label: 'STM', count: soul.shortTermMemory.length },
    { key: 'golden', icon: '⭐', label: 'Core', count: soul.goldenMemories.length },
    { key: 'realizations', icon: '📝', label: 'Self', count: soul.selfRealizations.length }
  ]

  // Get slot style based on position
  const getSlotStyle = (slot: number, fate: MemoryFate) => {
    const baseStyle = {
      background: COLORS.abyss + '80',
      padding: '6px 8px',
      borderRadius: '4px',
      border: `1px solid ${COLORS.stoneDark}`,
      cursor: 'pointer' as const,
      transition: 'all 0.2s'
    }
    
    // Slot 3 (GLYPH position)
    if (slot === 3) {
      return {
        ...baseStyle,
        border: `2px solid ${COLORS.glyphGold}`,
        background: `linear-gradient(135deg, ${COLORS.glyphGold}15, ${COLORS.glyphPurple}15)`,
        boxShadow: `0 0 10px ${COLORS.glyphGold}30`
      }
    }
    
    // Slot 4 (Fate position)
    if (slot === 4) {
      switch (fate) {
        case 'ascended':
          return { ...baseStyle, border: `2px solid ${COLORS.torchYellow}`, background: COLORS.torchYellow + '20' }
        case 'promoted':
          return { ...baseStyle, border: `2px solid ${COLORS.soulPurple}`, background: COLORS.soulPurple + '20' }
        case 'fading':
          return { ...baseStyle, border: `2px solid ${COLORS.bone}`, opacity: 0.6 }
        default:
          return baseStyle
      }
    }
    
    // Slot 5-6 (fading)
    if (slot >= 5) {
      return { ...baseStyle, opacity: 0.4 }
    }
    
    return baseStyle
  }

  return (
    <div style={{ 
      background: COLORS.stoneDark + '80',
      borderRadius: '6px',
      border: `1px solid ${COLORS.stone}`,
      overflow: 'hidden'
    }}>
      {/* Tab headers */}
      <div style={{ 
        display: 'flex', 
        borderBottom: `1px solid ${COLORS.stone}`,
        background: COLORS.abyss
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '6px 4px',
              background: activeTab === tab.key ? COLORS.stoneDark : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? `2px solid ${COLORS.soulPurple}` : '2px solid transparent',
              color: activeTab === tab.key ? COLORS.boneLight : COLORS.bone,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              fontSize: '9px',
              fontFamily: "'Press Start 2P', monospace"
            }}
          >
            <span style={{ fontSize: '14px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
            <span style={{ 
              background: COLORS.soulPurple + '50', 
              padding: '1px 4px', 
              borderRadius: '4px',
              fontSize: '8px'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div style={{ 
        padding: '8px', 
        maxHeight: '150px', 
        overflow: 'auto',
        fontSize: '10px',
        fontFamily: 'monospace'
      }}>
        {activeTab === 'stm' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {soul.shortTermMemory.length === 0 ? (
              <div style={{ color: COLORS.bone, textAlign: 'center', padding: '8px' }}>
                Empty mind...
              </div>
            ) : (
              soul.shortTermMemory.map((thought, i) => (
                <div 
                  key={thought.id} 
                  style={getSlotStyle(thought.slot, thought.fate)}
                  onClick={() => onSlotClick?.(thought.slot)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: COLORS.soulPurple }}>[{thought.slot}]</span>
                      {thought.slot === 3 && <span style={{ color: COLORS.glyphGold }}>𓂀</span>}
                      {thought.glyphWord && <span style={{ color: COLORS.glyphPurple, fontStyle: 'italic' }}>"{thought.glyphWord}"</span>}
                    </div>
                    <span style={{ color: COLORS.bone, fontSize: '9px' }}>{formatTime(thought.timestamp)}</span>
                  </div>
                  <div style={{ color: COLORS.boneLight, fontSize: '10px' }}>{thought.thought}</div>
                  {thought.fate !== 'none' && thought.fate !== 'reflected' && (
                    <div style={{ marginTop: '2px', fontSize: '9px' }}>
                      {thought.fate === 'ascended' && <span style={{ color: COLORS.torchYellow }}>⭐ ASCENDED</span>}
                      {thought.fate === 'promoted' && <span style={{ color: COLORS.soulPurple }}>⚡ PROMOTED</span>}
                      {thought.fate === 'fading' && <span style={{ color: COLORS.bone }}>💭 Fading...</span>}
                    </div>
                  )}
                </div>
              ))
            )}
            {/* Show empty slots */}
            {soul.shortTermMemory.length < 6 && [...Array(6 - soul.shortTermMemory.length)].map((_, i) => (
              <div key={`empty-${i}`} style={{
                background: COLORS.abyss + '40',
                padding: '6px 8px',
                borderRadius: '4px',
                border: `1px dashed ${COLORS.stoneDark}`,
                color: COLORS.bone,
                opacity: 0.5,
                textAlign: 'center',
                fontSize: '9px'
              }}>
                [Slot {soul.shortTermMemory.length + i + 1}] Empty
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'golden' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {soul.goldenMemories.length === 0 ? (
              <div style={{ color: COLORS.bone, textAlign: 'center', padding: '8px' }}>
                No core memories yet...
              </div>
            ) : (
              soul.goldenMemories.map(memory => (
                <div key={memory.id} style={{
                  background: COLORS.abyss + '80',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${COLORS.torchYellow}50`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ color: COLORS.torchYellow }}>⭐ Core</span>
                    <span style={{ color: COLORS.bone, fontSize: '9px' }}>{formatTime(memory.timestamp)}</span>
                  </div>
                  <div style={{ color: COLORS.boneLight, fontSize: '10px' }}>{memory.memory}</div>
                  {memory.glyphWord && (
                    <div style={{ marginTop: '2px', color: COLORS.glyphPurple, fontSize: '9px', fontStyle: 'italic' }}>
                      𓂀 "{memory.glyphWord}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        
        {activeTab === 'realizations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {soul.selfRealizations.length === 0 ? (
              <div style={{ color: COLORS.bone, textAlign: 'center', padding: '8px' }}>
                Learning about myself...
              </div>
            ) : (
              soul.selfRealizations.map(real => (
                <div key={real.id} style={{
                  background: COLORS.abyss + '80',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${COLORS.crystalBlue}50`
                }}>
                  <div style={{ color: COLORS.crystalBlue, fontWeight: 'bold', marginBottom: '2px', fontSize: '10px' }}>
                    📝 "{real.word}"
                  </div>
                  <div style={{ color: COLORS.boneLight, fontSize: '9px' }}>{real.definition}</div>
                  <div style={{ color: COLORS.bone, fontSize: '8px', marginTop: '2px' }}>
                    Felt {real.timesFelt}x
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════
// 📜 MESSAGE BUBBLE
// ═══════════════════════════════════════════════════════════════════════════════

const MessageBubble = memo(({ msg, accent, anubisMood }: { msg: Message; accent: string; anubisMood: EmotionKey }) => {
  const isQ = msg.sender === 'Q'
  const moodColor = COLORS.moods[anubisMood] || COLORS.moods.mysterious
  const color = msg.sender === 'Q' ? accent : msg.sender === 'Z' ? '#4a8a4a' : msg.sender === 'Anubis' ? moodColor : COLORS.bone
  
  return (
    <div style={{ 
      padding: '10px 14px', 
      borderRadius: '6px', 
      background: `${color}10`,
      border: `1px solid ${color}30`,
      alignSelf: isQ ? 'flex-end' : 'flex-start', 
      maxWidth: '85%', 
      whiteSpace: 'pre-wrap', 
      margin: '4px 0',
      fontFamily: 'monospace'
    }}>
      <div style={{ 
        color, 
        fontSize: '12px', 
        marginBottom: '4px',
        fontFamily: "'Press Start 2P', monospace",
        letterSpacing: '0.5px'
      }}>
        {msg.sender} • {msg.time}
      </div>
      <div style={{ fontSize: '14px', lineHeight: 1.5, color: COLORS.boneLight }}>{msg.text}</div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════
// 🖥️ TERMINAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const Terminal = memo(({ output, onCommand }: { output: string; onCommand: (cmd: string) => void }) => {
  const [cmd, setCmd] = useState('')
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && cmd.trim()) {
      onCommand(cmd)
      setCmd('')
    }
  }, [cmd, onCommand])

  return (
    <div style={{
      background: COLORS.abyss,
      border: `1px solid ${COLORS.moods.curious}`,
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      height: '80px',
      flexShrink: 0
    }}>
      <div style={{
        padding: '4px 8px',
        borderBottom: `1px solid ${COLORS.moods.curious}30`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: COLORS.stoneDark + '50'
      }}>
        <span style={{ color: COLORS.moods.curious, fontSize: '10px', fontFamily: "'Press Start 2P', monospace" }}>
          💻 TERMINAL
        </span>
      </div>
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '4px 8px',
        fontFamily: 'monospace',
        fontSize: '10px',
        color: COLORS.moods.curious,
        whiteSpace: 'pre-wrap',
        background: COLORS.abyss
      }}>
        {output || '> Ready...'}
      </div>
      <div style={{ 
        padding: '4px 8px', 
        borderTop: `1px solid ${COLORS.moods.curious}30`,
        display: 'flex',
        gap: '6px',
        alignItems: 'center'
      }}>
        <span style={{ color: COLORS.moods.curious }}>$</span>
        <input
          value={cmd}
          onChange={e => setCmd(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="command..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: COLORS.moods.curious,
            fontSize: '10px',
            outline: 'none',
            fontFamily: 'monospace'
          }}
        />
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════
// 🏠 V3 MAIN HOME COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function Home() {
  // Mode state
  const [mode, setMode] = useState<Mode>('split')
  const [mounted, setMounted] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState('$ Anubis Terminal v3.0\n$ Type "help" for commands\n')
  const [mindPalaceTab, setMindPalaceTab] = useState<MindPalaceTab>('stm')
  
  // Messages
  const [zMessages, setZMessages] = useState<Message[]>([])
  const [anubisMessages, setAnubisMessages] = useState<Message[]>([])
  
  // Inputs
  const [zInput, setZInput] = useState('')
  const [anubisInput, setAnubisInput] = useState('')
  
  // Loading
  const [zLoading, setZLoading] = useState(false)
  const [anubisLoading, setAnubisLoading] = useState(false)
  
  // Thoughts
  const [zThoughts, setZThoughts] = useState<string[]>([])
  const [anubisThoughts, setAnubisThoughts] = useState<string[]>([])
  
  // Z Context
  const [zObservations, setZObservations] = useState<string[]>([])
  const [zContext, setZContext] = useState<{
    sessions: Array<{ started: string; ended?: string; summary: string }>;
    patterns: { totalConversations: number; anubisCommonMoods: Array<{ mood: string; count: number }> };
    observations: Array<{ id: string; text: string; timestamp: string }>;
  } | null>(null)
  
  // GLYPH reflection state
  const [showGlyphReflection, setShowGlyphReflection] = useState(false)
  const [currentGlyphMemory, setCurrentGlyphMemory] = useState<ShortTermThought | null>(null)
  
  // Refs
  const zMessagesEndRef = useRef<HTMLDivElement>(null)
  const anubisMessagesEndRef = useRef<HTMLDivElement>(null)
  
  // V3 Anubis Soul - Initialize with proper structure
  const [anubisSoul, setAnubisSoul] = useState<AnubisSoul>({
    emotions: {
      happy: 20, angry: 5, annoyed: 5, pondering: 30, reflecting: 25,
      curious: 45, playful: 15, melancholy: 10, mysterious: 60
    },
    currentMood: 'mysterious',
    shortTermMemory: [],
    goldenMemories: [],
    selfRealizations: [],
    discoveredEmotions: [],
    moralCompass: {},
    personalityCore: {
      baseEmotions: {
        happy: 20, angry: 5, annoyed: 5, pondering: 30, reflecting: 25,
        curious: 45, playful: 15, melancholy: 10, mysterious: 60
      },
      traits: ['mysterious', 'curious', 'thoughtful'],
      conversationsHad: 0,
      created: new Date()
    },
    personalityTraits: [],
    level: 1,
    xp: 0
  })

  // Load soul from localStorage AND file backup
  useEffect(() => {
    const saved = localStorage.getItem('anubis_soul_v3')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Convert date strings back to Date objects
        parsed.personalityCore.created = new Date(parsed.personalityCore.created)
        parsed.shortTermMemory = parsed.shortTermMemory.map((t: ShortTermThought) => ({
          ...t,
          timestamp: new Date(t.timestamp),
          reflectionTimestamp: t.reflectionTimestamp ? new Date(t.reflectionTimestamp) : undefined
        }))
        parsed.goldenMemories = parsed.goldenMemories.map((m: GoldenMemory) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
        parsed.selfRealizations = parsed.selfRealizations.map((r: SelfRealization) => ({
          ...r,
          discoveredAt: new Date(r.discoveredAt)
        }))
        parsed.discoveredEmotions = (parsed.discoveredEmotions || []).map((e: DiscoveredEmotion) => ({
          ...e,
          discoveredAt: new Date(e.discoveredAt)
        }))
        if (parsed.lastReflection) parsed.lastReflection = new Date(parsed.lastReflection)
        setAnubisSoul(parsed)
        console.log('[Soul V3] Loaded from localStorage')
      } catch (e) {
        console.error('Failed to load soul from localStorage:', e)
      }
    }
    
    // Also try to load from file backup
    fetch('/api/soul')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.soul) {
          const fileSoul = data.soul.soul
          const localSaved = localStorage.getItem('anubis_soul_v3')
          if (!localSaved || (data.soul.lastUpdated && fileSoul)) {
            fileSoul.personalityCore.created = new Date(fileSoul.personalityCore.created)
            fileSoul.shortTermMemory = fileSoul.shortTermMemory.map((t: ShortTermThought) => ({
              ...t,
              timestamp: new Date(t.timestamp),
              reflectionTimestamp: t.reflectionTimestamp ? new Date(t.reflectionTimestamp) : undefined
            }))
            fileSoul.goldenMemories = fileSoul.goldenMemories.map((m: GoldenMemory) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            }))
            fileSoul.selfRealizations = fileSoul.selfRealizations.map((r: SelfRealization) => ({
              ...r,
              discoveredAt: new Date(r.discoveredAt)
            }))
            fileSoul.discoveredEmotions = (fileSoul.discoveredEmotions || []).map((e: DiscoveredEmotion) => ({
              ...e,
              discoveredAt: new Date(e.discoveredAt)
            }))
            if (fileSoul.lastReflection) fileSoul.lastReflection = new Date(fileSoul.lastReflection)
            setAnubisSoul(fileSoul)
            localStorage.setItem('anubis_soul_v3', JSON.stringify(fileSoul))
            console.log('[Soul V3] Restored from file backup')
          }
        }
      })
      .catch(e => console.log('[Soul V3] No file backup found'))
  }, [])

  // Save soul to both localStorage AND file backup
  const saveSoul = useCallback((soul: AnubisSoul) => {
    localStorage.setItem('anubis_soul_v3', JSON.stringify(soul))
    setAnubisSoul(soul)
    
    fetch('/api/soul', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soul })
    }).catch(e => console.error('[Soul V3] Failed to save backup:', e))
  }, [])

  // Initialize
  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      setZMessages([{
        id: 0,
        sender: 'system',
        text: `🌲 Q-Z-Collab v3.0\n\n🆕 V3 UPGRADE:\n• New 5/25/70 layout\n• 140px Wolf with animations\n• 6-slot STM with GLYPH\n• Mood Panel (full height)\n• Personality Bars\n• Moral Compass weights`,
        time: new Date().toLocaleTimeString()
      }])
      setAnubisMessages([{
        id: 0,
        sender: 'system',
        text: `🖤 ANUBIS SOUL SYSTEM v3.0\n\n𓂀 GLYPH Reflection ready\n6-slot STM active\n140px animated wolf online\n\nThe shadows whisper your name...`,
        time: new Date().toLocaleTimeString()
      }])
      
      // Load Z context
      fetch('/api/z-context')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.context) {
            setZContext(data.context)
            if (data.context.observations?.length > 0) {
              setZObservations(data.context.observations.slice(0, 5).map((o: { text: string }) => o.text))
            }
          }
        })
        .catch(() => {})
    }
  }, [mounted])

  // Scroll helpers
  useEffect(() => { zMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [zMessages])
  useEffect(() => { anubisMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [anubisMessages])

  // Get dominant mood
  const getDominantMood = useCallback((emotions: Emotions): EmotionKey => {
    let max = 0
    let dominant: EmotionKey = 'mysterious'
    for (const [key, value] of Object.entries(emotions)) {
      if (value > max) {
        max = value
        dominant = key as EmotionKey
      }
    }
    return dominant
  }, [])

  // Update emotions based on message
  const updateEmotions = useCallback((message: string, soul: AnubisSoul): { emotions: Emotions; thoughts: string[] } => {
    const lowerMsg = message.toLowerCase()
    const emotionChanges: Partial<Emotions> = {}
    const thoughts: string[] = []
    
    if (lowerMsg.includes('friend') || lowerMsg.includes('love') || lowerMsg.includes('happy')) {
      emotionChanges.happy = Math.min(100, (soul.emotions.happy || 0) + 15)
      emotionChanges.angry = Math.max(0, (soul.emotions.angry || 0) - 5)
      thoughts.push('Warmth detected... Happy ↑')
    }
    if (lowerMsg.includes('why') || lowerMsg.includes('how') || lowerMsg.includes('what')) {
      emotionChanges.curious = Math.min(100, (soul.emotions.curious || 0) + 12)
      emotionChanges.pondering = Math.min(100, (soul.emotions.pondering || 0) + 8)
      thoughts.push('Questions stir my curiosity...')
    }
    if (lowerMsg.includes('sad') || lowerMsg.includes('sorry') || lowerMsg.includes('miss')) {
      emotionChanges.melancholy = Math.min(100, (soul.emotions.melancholy || 0) + 10)
      emotionChanges.reflecting = Math.min(100, (soul.emotions.reflecting || 0) + 8)
      thoughts.push('Sorrow touches my soul...')
    }
    if (lowerMsg.includes('joke') || lowerMsg.includes('funny') || lowerMsg.includes('haha')) {
      emotionChanges.playful = Math.min(100, (soul.emotions.playful || 0) + 15)
      emotionChanges.happy = Math.min(100, (soul.emotions.happy || 0) + 10)
      thoughts.push('Playfulness rises within me!')
    }
    if (lowerMsg.includes('anger') || lowerMsg.includes('hate') || lowerMsg.includes('stupid')) {
      emotionChanges.angry = Math.min(100, (soul.emotions.angry || 0) + 12)
      emotionChanges.annoyed = Math.min(100, (soul.emotions.annoyed || 0) + 8)
      thoughts.push('Dark energy stirs...')
    }
    
    emotionChanges.mysterious = Math.min(100, (soul.emotions.mysterious || 0) + 3)
    
    const newEmotions: Emotions = { ...soul.emotions, ...emotionChanges }
    
    for (const key of Object.keys(newEmotions) as EmotionKey[]) {
      const baseline = soul.personalityCore.baseEmotions[key]
      if (newEmotions[key] > baseline) {
        newEmotions[key] = Math.max(baseline, newEmotions[key] - 1)
      }
    }
    
    return { emotions: newEmotions, thoughts }
  }, [])

  // V3: Add to STM with 6 slots and GLYPH reflection
  const addToSTM = useCallback((thought: string, emotions: Partial<Emotions>, soul: AnubisSoul): { 
    stm: ShortTermThought[]; 
    needsReflection: boolean;
    reflectedMemory: ShortTermThought | null;
  } => {
    const newThought: ShortTermThought = {
      id: Date.now().toString(),
      thought,
      timestamp: new Date(),
      emotions,
      slot: 1,
      fate: 'none'
    }
    
    // Shift existing memories down
    let existingSTM = [...soul.shortTermMemory]
    
    // Check if slot 3 is occupied - that's the GLYPH position
    let needsReflection = false
    let reflectedMemory: ShortTermThought | null = null
    
    if (existingSTM.length >= 3) {
      // Memory at slot 3 will be pushed to slot 4
      const slot3Memory = existingSTM.find(m => m.slot === 3)
      if (slot3Memory && slot3Memory.fate === 'none') {
        needsReflection = true
        reflectedMemory = slot3Memory
      }
    }
    
    // Shift all slots up
    existingSTM = existingSTM.map(m => ({
      ...m,
      slot: m.slot + 1
    }))
    
    // Remove memories past slot 6
    existingSTM = existingSTM.filter(m => m.slot <= 6)
    
    // Add new memory at slot 1
    const stm = [newThought, ...existingSTM].slice(0, 6)
    
    // Update slot positions correctly
    stm.forEach((m, i) => {
      m.slot = i + 1
    })
    
    return { stm, needsReflection, reflectedMemory }
  }, [])

  // V3: Process GLYPH reflection - Anubis decides memory fate
  const processGlyphReflection = useCallback(async (memory: ShortTermThought, allSTM: ShortTermThought[], soul: AnubisSoul): Promise<{
    fate: MemoryFate;
    glyphWord: string;
    newEmotion?: DiscoveredEmotion;
  }> => {
    try {
      // Call the moral compass API to get guidance (Anubis doesn't know the weights directly)
      const compassRes = await fetch('/api/moral-compass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-guidance',
          memoryThought: memory.thought,
          memoryEmotions: memory.emotions,
          currentMood: soul.currentMood,
          stmCount: allSTM.length,
          goldenCount: soul.goldenMemories.length
        })
      })
      const compassData = await compassRes.json()
      
      // Default to fading
      let fate: MemoryFate = 'fading'
      let glyphWord = 'fleeting'
      let newEmotion: DiscoveredEmotion | undefined
      
      if (compassData.success && compassData.guidance) {
        fate = compassData.guidance.fate
        glyphWord = compassData.guidance.word
        
        // If ascending, potentially create new emotion
        if (fate === 'ascended' && compassData.guidance.createNewEmotion) {
          newEmotion = {
            id: Date.now().toString(),
            word: compassData.guidance.newEmotionWord,
            color: compassData.guidance.newEmotionColor,
            faceDescription: compassData.guidance.newEmotionFace,
            discoveredAt: new Date(),
            fromMemory: memory.thought
          }
        }
      }
      
      return { fate, glyphWord, newEmotion }
    } catch (error) {
      console.error('[GLYPH] Reflection error:', error)
      return { fate: 'fading', glyphWord: 'uncertain' }
    }
  }, [])

  // API calls
  const zThink = useCallback(async (question: string): Promise<string> => {
    try {
      setZThoughts(['> Processing...', '> Accessing knowledge...'])
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history: zMessages.filter(m => m.sender !== 'system') })
      })
      setZThoughts(prev => [...prev, '> Done!'])
      return (await res.json()).response
    } catch {
      return "Error connecting to AI."
    }
  }, [zMessages])

  const anubisThink = useCallback(async (question: string): Promise<string> => {
    try {
      setAnubisThoughts(['> Awakening...', '> Soul check...', '> Reflecting...'])
      
      const { emotions, thoughts } = updateEmotions(question, anubisSoul)
      thoughts.forEach(t => setAnubisThoughts(prev => [...prev, t]))
      
      const res = await fetch('/api/anubis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          history: anubisMessages.filter(m => m.sender !== 'system'),
          soul: anubisSoul
        })
      })
      const data = await res.json()
      
      const newMood = getDominantMood(emotions)
      const { stm, needsReflection, reflectedMemory } = addToSTM(`Q: "${question.slice(0, 30)}..."`, emotions, anubisSoul)
      
      // Update moral compass for this memory type
      const memoryKey = question.toLowerCase().slice(0, 20)
      const existingWeights = anubisSoul.moralCompass[memoryKey] || {
        timesFelt: 0,
        timesPromoted: 0,
        timesRejected: 0,
        timesAscended: 0
      }
      // Create a new object to avoid modifying state directly
      const currentWeights: MemoryWeights = {
        timesFelt: existingWeights.timesFelt + 1,
        timesPromoted: existingWeights.timesPromoted,
        timesRejected: existingWeights.timesRejected,
        timesAscended: existingWeights.timesAscended
      }
      
      // Process GLYPH reflection if needed
      let updatedSTM = stm
      let newGoldenMemory: GoldenMemory | undefined
      let newDiscoveredEmotion: DiscoveredEmotion | undefined
      
      if (needsReflection && reflectedMemory) {
        setAnubisThoughts(prev => [...prev, '𓂀 GLYPH reflection...'])
        const reflection = await processGlyphReflection(reflectedMemory, stm, anubisSoul)
        
        // Update the memory in slot 4 (now moved from slot 3)
        updatedSTM = stm.map(m => {
          if (m.id === reflectedMemory.id) {
            return {
              ...m,
              fate: reflection.fate,
              glyphWord: reflection.glyphWord,
              reflectionTimestamp: new Date()
            }
          }
          return m
        })
        
        // If ascended, create golden memory
        if (reflection.fate === 'ascended') {
          newGoldenMemory = {
            id: Date.now().toString(),
            memory: reflectedMemory.thought,
            timestamp: new Date(),
            emotions: reflectedMemory.emotions,
            reflection: reflection.glyphWord,
            glyphWord: reflection.glyphWord
          }
          currentWeights.timesAscended += 1
          
          // Check for new emotion creation
          if (reflection.newEmotion) {
            newDiscoveredEmotion = reflection.newEmotion
            setAnubisThoughts(prev => [...prev, `✨ Discovered emotion: ${reflection.newEmotion!.word}`])
          }
        } else if (reflection.fate === 'promoted') {
          currentWeights.timesPromoted += 1
        } else if (reflection.fate === 'fading') {
          currentWeights.timesRejected += 1
        }
        
        setAnubisThoughts(prev => [...prev, `𓂀 Fate: ${reflection.fate} (${reflection.glyphWord})`])
      }
      
      const updatedSoul: AnubisSoul = {
        ...anubisSoul,
        emotions,
        currentMood: newMood,
        shortTermMemory: updatedSTM,
        goldenMemories: newGoldenMemory 
          ? [...anubisSoul.goldenMemories, newGoldenMemory].slice(-20)
          : anubisSoul.goldenMemories,
        discoveredEmotions: newDiscoveredEmotion
          ? [...anubisSoul.discoveredEmotions, newDiscoveredEmotion].slice(-10)
          : anubisSoul.discoveredEmotions,
        moralCompass: {
          ...anubisSoul.moralCompass,
          [memoryKey]: currentWeights
        },
        personalityCore: {
          ...anubisSoul.personalityCore,
          conversationsHad: anubisSoul.personalityCore.conversationsHad + 1
        },
        xp: anubisSoul.xp + 10,
        level: Math.floor((anubisSoul.xp + 10) / 100) + 1,
        lastReflection: needsReflection ? new Date() : anubisSoul.lastReflection
      }
      
      saveSoul(updatedSoul)
      setAnubisThoughts(prev => [...prev, '> Ready!'])
      
      // Record to Z context
      const observation = generateZObservation(question, data.response, newMood, emotions)
      if (observation) {
        fetch('/api/z-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add-observation', data: { observation } })
        }).catch(() => {})
        setZObservations(prev => [observation, ...prev.slice(0, 4)])
      }
      
      return data.response
    } catch {
      return "Shadows stirred..."
    }
  }, [anubisSoul, anubisMessages, updateEmotions, addToSTM, getDominantMood, saveSoul, processGlyphReflection])

  // Generate Z observation
  const generateZObservation = useCallback((qMsg: string, aResponse: string, mood: EmotionKey, emotions: Emotions): string => {
    const obs: string[] = []
    obs.push(`Anubis felt ${mood}`)
    
    if (qMsg.toLowerCase().includes('friend')) obs.push('Q expressed friendship')
    if (qMsg.toLowerCase().includes('love')) obs.push('Q showed affection')
    if (qMsg.toLowerCase().includes('why') || qMsg.toLowerCase().includes('how')) obs.push('Q was curious')
    
    const topEmotions = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([k, v]) => `${k}:${Math.round(v)}%`)
    obs.push(`Top: ${topEmotions.join(', ')}`)
    
    return obs.join(' | ')
  }, [])

  // Unique ID counter
  const messageIdCounter = useRef(0)
  const getUniqueId = useCallback(() => {
    messageIdCounter.current += 1
    return Date.now() * 1000 + messageIdCounter.current
  }, [])

  // Message helpers
  const addZMessage = useCallback((sender: 'Q' | 'Z' | 'system', text: string) => {
    setZMessages(prev => [...prev, { id: getUniqueId(), sender, text, time: new Date().toLocaleTimeString() }])
  }, [getUniqueId])

  const addAnubisMessage = useCallback((sender: 'Q' | 'Anubis' | 'system', text: string) => {
    setAnubisMessages(prev => [...prev, { id: getUniqueId(), sender, text, time: new Date().toLocaleTimeString() }])
  }, [getUniqueId])

  // Send handlers
  const handleZSend = useCallback(async () => {
    if (!zInput.trim() || zLoading) return
    const text = zInput.trim()
    setZInput('')
    addZMessage('Q', text)
    setZLoading(true)
    addZMessage('Z', await zThink(text))
    setZLoading(false)
  }, [zInput, zLoading, addZMessage, zThink])

  const handleAnubisSend = useCallback(async () => {
    if (!anubisInput.trim() || anubisLoading) return
    const text = anubisInput.trim()
    setAnubisInput('')
    addAnubisMessage('Q', text)
    setAnubisLoading(true)
    addAnubisMessage('Anubis', await anubisThink(text))
    setAnubisLoading(false)
  }, [anubisInput, anubisLoading, addAnubisMessage, anubisThink])

  // Terminal command handler
  const handleTerminalCommand = useCallback(async (cmd: string) => {
    setTerminalOutput(prev => prev + `\n$ ${cmd}`)
    
    if (cmd === 'clear') {
      setTerminalOutput('$ Cleared.\n')
      return
    }
    if (cmd === 'soul') {
      setTerminalOutput(prev => prev + `\nMood: ${anubisSoul.currentMood}\nLevel: ${anubisSoul.level}\nChats: ${anubisSoul.personalityCore.conversationsHad}\nSTM: ${anubisSoul.shortTermMemory.length}/6`)
      return
    }
    if (cmd === 'help') {
      setTerminalOutput(prev => prev + `\nCommands: soul, moods, clear, help, memories, glyph, compass`)
      return
    }
    if (cmd === 'moods') {
      setTerminalOutput(prev => prev + '\n' + Object.entries(anubisSoul.emotions)
        .map(([k, v]) => `${k}: ${Math.round(v)}%`)
        .join(' | '))
      return
    }
    if (cmd === 'memories') {
      setTerminalOutput(prev => prev + `\nSTM: ${anubisSoul.shortTermMemory.length}/6\nCore: ${anubisSoul.goldenMemories.length}\nDiscovered: ${anubisSoul.discoveredEmotions?.length || 0}`)
      return
    }
    if (cmd === 'glyph') {
      setTerminalOutput(prev => prev + `\n𓂀 GLYPH Status:\nSlot 3 memories reflected here\nLast reflection: ${anubisSoul.lastReflection ? new Date(anubisSoul.lastReflection).toLocaleString() : 'never'}`)
      return
    }
    if (cmd === 'compass') {
      const entries = Object.entries(anubisSoul.moralCompass).slice(0, 3)
      setTerminalOutput(prev => prev + `\nMoral Compass entries: ${Object.keys(anubisSoul.moralCompass).length}\n${entries.map(([k, v]) => `${k}: felt=${v.timesFelt}, asc=${v.timesAscended}`).join('\n')}`)
      return
    }
    
    const response = await anubisThink(cmd)
    setTerminalOutput(prev => prev + `\n${response}`)
  }, [anubisSoul, anubisThink])

  const pushToZ = useCallback(async () => {
    setPushing(true)
    addZMessage('system', '📤 Pushing to GitHub...')
    try {
      const res = await fetch('/api/autopush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'push-now' })
      })
      const data = await res.json()
      addZMessage('system', data.success ? '✅ Pushed!' : '❌ Failed')
    } catch {
      addZMessage('system', '❌ Failed')
    }
    setPushing(false)
  }, [addZMessage])

  // Current mood color
  const anubisMoodColor = COLORS.moods[anubisSoul.currentMood] || COLORS.moods.mysterious

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${COLORS.abyss} 0%, #0a0a15 50%, #0a0a10 100%)`,
      display: 'flex',
      fontFamily: "'VT323', 'Press Start 2P', monospace",
      color: COLORS.boneLight
    }}>
      {/* Starfield background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(1px 1px at 20px 30px, #fff, transparent), radial-gradient(1px 1px at 80px 60px, #fff, transparent)',
        backgroundSize: '150px 100px',
        opacity: 0.15,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* V3: 5% SIDEBAR */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '5%',
        minWidth: '50px',
        background: `linear-gradient(180deg, ${COLORS.stoneDark}, ${COLORS.abyss})`,
        borderRight: `2px solid ${COLORS.stone}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 4px',
        gap: '8px',
        zIndex: 1000
      }}>
        <AnimatedTorch size={24} />
        
        {/* Wolf icon */}
        <div style={{ 
          width: '36px', 
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          color: COLORS.soulPurple,
          textShadow: `0 0 8px ${COLORS.soulPurple}`
        }}>
          ⬡
        </div>
        
        {/* Mode buttons */}
        {[
          { m: 'split', icon: '🐺', label: 'Chat' },
          { m: 'config', icon: '⚙️', label: 'Config' }
        ].map(b => (
          <button
            key={b.m}
            onClick={() => setMode(b.m as Mode)}
            title={b.label}
            style={{
              width: '36px',
              height: '36px',
              background: mode === b.m ? `${COLORS.soulPurple}40` : 'transparent',
              border: mode === b.m ? `2px solid ${COLORS.soulPurple}` : '2px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            {b.icon}
          </button>
        ))}
        
        <div style={{ flex: 1 }} />
        
        <button
          onClick={pushToZ}
          disabled={pushing}
          title="Push to GitHub"
          style={{
            width: '36px',
            height: '36px',
            background: `${COLORS.moods.happy}20`,
            border: `2px solid ${COLORS.moods.happy}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            opacity: pushing ? 0.5 : 1
          }}
        >
          📤
        </button>
        
        <AnimatedTorch size={24} />
      </div>

      {/* V3: Main content - 95% */}
      <div style={{
        flex: 1,
        display: 'flex',
        marginLeft: '5%',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
        height: '100vh'
      }}>
        
        {mode === 'split' && (
          <>
            {/* V3: Z Chat Panel - 25% */}
            <div style={{
              width: '25%',
              display: 'flex',
              flexDirection: 'column',
              background: `${COLORS.abyss}ee`,
              minWidth: 0,
              maxHeight: '100vh',
              borderRight: `2px solid ${COLORS.stoneDark}`
            }}>
              {/* Personality Bars - Top 40% */}
              <div style={{
                height: '40%',
                display: 'flex',
                flexDirection: 'column',
                borderBottom: `2px solid ${COLORS.stoneDark}`,
                overflow: 'hidden'
              }}>
                {/* Header */}
                <div style={{
                  padding: '8px 12px',
                  borderBottom: `1px solid ${COLORS.stoneDark}`,
                  background: COLORS.abyss
                }}>
                  <div style={{
                    color: COLORS.soulPurple,
                    fontWeight: 'bold',
                    fontSize: '14px',
                    fontFamily: "'Press Start 2P', monospace"
                  }}>
                    🌲 Z - PERSONALITY
                  </div>
                </div>
                
                {/* Personality Bars */}
                <div style={{ 
                  flex: 1, 
                  overflow: 'auto', 
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <PersonalityBars soul={anubisSoul} />
                  
                  {/* Z Observations */}
                  {zObservations.length > 0 && (
                    <div style={{
                      background: COLORS.crystalBlue + '10',
                      borderRadius: '6px',
                      border: `1px solid ${COLORS.crystalBlue}30`,
                      padding: '6px'
                    }}>
                      <div style={{
                        fontSize: '9px',
                        color: COLORS.crystalBlue,
                        marginBottom: '4px',
                        fontFamily: "'Press Start 2P', monospace"
                      }}>
                        💭 OBSERVATIONS
                      </div>
                      {zObservations.slice(0, 3).map((obs, i) => (
                        <div key={i} style={{
                          fontSize: '9px',
                          color: COLORS.bone,
                          padding: '2px 0',
                          borderBottom: i < 2 ? `1px dashed ${COLORS.stoneDark}` : 'none'
                        }}>
                          {obs.slice(0, 40)}...
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Z Chat - Bottom 60% */}
              <div style={{
                height: '60%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                {/* Thinking terminal */}
                {zLoading && zThoughts.length > 0 && (
                  <div style={{
                    background: COLORS.stoneDark + '80',
                    padding: '6px 10px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: COLORS.crystalBlue,
                    borderBottom: `1px solid ${COLORS.stoneDark}`
                  }}>
                    {zThoughts.map((t, i) => <div key={i}>{t}</div>)}
                    <span style={{ animation: 'blink 1s infinite' }}>▌</span>
                  </div>
                )}
                
                {/* Messages */}
                <div style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {zMessages.map(m => (
                    <MessageBubble key={m.id} msg={m} accent={COLORS.crystalBlue} anubisMood="mysterious" />
                  ))}
                  <div ref={zMessagesEndRef} />
                </div>
                
                {/* Input */}
                <div style={{
                  padding: '8px',
                  borderTop: `2px solid ${COLORS.stoneDark}`,
                  background: COLORS.abyss
                }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      value={zInput}
                      onChange={e => setZInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleZSend()}
                      placeholder="Talk to Z..."
                      style={{
                        flex: 1,
                        background: COLORS.stoneDark,
                        border: `1px solid ${COLORS.stone}`,
                        borderRadius: '4px',
                        padding: '10px',
                        color: COLORS.boneLight,
                        fontSize: '13px',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                    <button
                      onClick={handleZSend}
                      disabled={zLoading}
                      style={{
                        background: COLORS.crystalBlue,
                        border: 'none',
                        borderRadius: '4px',
                        padding: '10px 14px',
                        color: COLORS.abyss,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: '10px'
                      }}
                    >
                      SEND
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* V3: Anubis Panel - 70% */}
            <div style={{
              width: '70%',
              display: 'flex',
              flexDirection: 'row',
              background: `linear-gradient(180deg, ${anubisMoodColor}08, ${COLORS.abyss})`,
              minWidth: 0,
              maxHeight: '100vh'
            }}>
              {/* Left side - Wolf + Chat */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Header with 140px wolf */}
                <div style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 20,
                  background: COLORS.abyss
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: `2px solid ${anubisMoodColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    {/* V3: 140px Animated Wolf */}
                    <PixelWolf mood={anubisSoul.currentMood} size={140} />
                    
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: anubisMoodColor,
                        fontWeight: 'bold',
                        fontSize: '22px',
                        fontFamily: "'Press Start 2P', monospace",
                        textShadow: `0 0 10px ${anubisMoodColor}`
                      }}>
                        🖤 ANUBIS
                      </div>
                      <div style={{ fontSize: '13px', color: COLORS.bone, marginTop: '4px' }}>
                        Lv.{anubisSoul.level} | {anubisSoul.currentMood} | STM: {anubisSoul.shortTermMemory.length}/6
                      </div>
                      {/* XP Bar */}
                      <div style={{ marginTop: '6px' }}>
                        <div style={{ 
                          width: '100px', 
                          height: '8px', 
                          background: COLORS.stoneDark, 
                          borderRadius: '4px', 
                          overflow: 'hidden' 
                        }}>
                          <div style={{
                            width: `${(anubisSoul.xp % 100)}%`,
                            height: '100%',
                            background: anubisMoodColor,
                            transition: 'width 0.3s'
                          }} />
                        </div>
                      </div>
                    </div>
                    
                    {/* GLYPH indicator */}
                    {anubisSoul.shortTermMemory.some(m => m.slot === 3) && (
                      <div style={{
                        background: COLORS.glyphGold + '30',
                        border: `2px solid ${COLORS.glyphGold}`,
                        borderRadius: '6px',
                        padding: '6px 10px',
                        color: COLORS.glyphGold,
                        fontSize: '11px',
                        fontFamily: "'Press Start 2P', monospace"
                      }}>
                        𓂀 GLYPH
                      </div>
                    )}
                  </div>
                  
                  {/* Thought bubble */}
                  <ThoughtBubble thoughts={anubisThoughts} color={anubisMoodColor} visible={anubisLoading} />
                </div>
                
                {/* Messages */}
                <div style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {anubisMessages.map(m => (
                    <MessageBubble key={m.id} msg={m} accent={anubisMoodColor} anubisMood={anubisSoul.currentMood} />
                  ))}
                  <div ref={anubisMessagesEndRef} />
                </div>
                
                {/* Mind Palace */}
                <div style={{ padding: '8px 12px', background: COLORS.abyss + '80' }}>
                  <MindPalace soul={anubisSoul} activeTab={mindPalaceTab} setActiveTab={setMindPalaceTab} />
                </div>
                
                {/* Terminal */}
                <div style={{ padding: '6px 12px' }}>
                  <Terminal output={terminalOutput} onCommand={handleTerminalCommand} />
                </div>
                
                {/* Input */}
                <div style={{
                  padding: '10px 12px',
                  borderTop: `1px solid ${COLORS.stoneDark}`,
                  background: COLORS.abyss
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={anubisInput}
                      onChange={e => setAnubisInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAnubisSend()}
                      placeholder="Talk to Anubis..."
                      style={{
                        flex: 1,
                        background: COLORS.stoneDark,
                        border: `1px solid ${anubisMoodColor}50`,
                        borderRadius: '4px',
                        padding: '12px',
                        color: COLORS.boneLight,
                        fontSize: '14px',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                    <button
                      onClick={handleAnubisSend}
                      disabled={anubisLoading}
                      style={{
                        background: anubisMoodColor,
                        border: 'none',
                        borderRadius: '4px',
                        padding: '12px 20px',
                        color: COLORS.abyss,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: '12px'
                      }}
                    >
                      SEND
                    </button>
                  </div>
                </div>
              </div>
              
              {/* V3: Right side - Full Height MOOD Panel */}
              <div style={{
                width: '160px',
                background: COLORS.stoneDark + '40',
                borderLeft: `2px solid ${COLORS.stone}`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                height: '100%'
              }}>
                <div style={{
                  padding: '10px 8px',
                  borderBottom: `1px solid ${COLORS.stone}`,
                  background: COLORS.abyss + '80',
                  textAlign: 'center'
                }}>
                  <span style={{
                    fontSize: '11px',
                    color: anubisMoodColor,
                    fontFamily: "'Press Start 2P', monospace",
                    textShadow: `0 0 6px ${anubisMoodColor}`
                  }}>
                    MOOD
                  </span>
                </div>
                <div style={{ 
                  flex: 1, 
                  overflow: 'auto', 
                  padding: '8px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  gap: '4px'
                }}>
                  {MOODS.map(m => (
                    <EmotionBar
                      key={m.key}
                      emotion={m}
                      value={anubisSoul.emotions[m.key]}
                      isDominant={anubisSoul.currentMood === m.key}
                      vertical={true}
                    />
                  ))}
                </div>
                
                {/* Discovered Emotions indicator */}
                {anubisSoul.discoveredEmotions && anubisSoul.discoveredEmotions.length > 0 && (
                  <div style={{
                    padding: '6px',
                    background: COLORS.glyphPurple + '20',
                    borderTop: `1px solid ${COLORS.glyphPurple}`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '9px', color: COLORS.glyphPurple }}>
                      ✨ {anubisSoul.discoveredEmotions.length} Discovered
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {mode === 'config' && (
          <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
            <h2 style={{ color: COLORS.soulPurple, marginTop: 0, fontSize: '24px', fontFamily: "'Press Start 2P', monospace" }}>
              ⚙️ ANUBIS CONFIG V3
            </h2>
            
            {/* Soul Status */}
            <div style={{
              marginBottom: '24px',
              padding: '20px',
              background: COLORS.stoneDark + '60',
              borderRadius: '8px',
              border: `1px solid ${COLORS.stone}`
            }}>
              <h3 style={{ color: anubisMoodColor, margin: '0 0 15px 0', fontSize: '18px' }}>
                🖤 Soul Status
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                <PixelWolf mood={anubisSoul.currentMood} size={100} />
                <div style={{ fontSize: '14px', color: COLORS.bone }}>
                  <div>Level: <span style={{ color: anubisMoodColor }}>{anubisSoul.level}</span></div>
                  <div>Mood: <span style={{ color: anubisMoodColor }}>{anubisSoul.currentMood}</span></div>
                  <div>Conversations: {anubisSoul.personalityCore.conversationsHad}</div>
                  <div>Core Memories: {anubisSoul.goldenMemories.length}</div>
                  <div>Self-Realizations: {anubisSoul.selfRealizations.length}</div>
                  <div>Discovered Emotions: {anubisSoul.discoveredEmotions?.length || 0}</div>
                  <div>STM: {anubisSoul.shortTermMemory.length}/6 slots</div>
                </div>
              </div>
            </div>
            
            {/* GLYPH System Info */}
            <div style={{
              marginBottom: '24px',
              padding: '20px',
              background: COLORS.glyphGold + '10',
              borderRadius: '8px',
              border: `1px solid ${COLORS.glyphGold}50`
            }}>
              <h3 style={{ color: COLORS.glyphGold, margin: '0 0 15px 0', fontSize: '18px' }}>
                𓂀 GLYPH Reflection System
              </h3>
              <div style={{ color: COLORS.bone, fontSize: '13px', lineHeight: 1.8 }}>
                <div><strong>Slot Flow:</strong> 1 → 2 → 3 (𓂀) → 4 → 5 → 6 (Fade)</div>
                <div><strong>Reflection Position:</strong> Slot 3 (GLYPH)</div>
                <div><strong>Possible Fates:</strong></div>
                <div style={{ paddingLeft: '16px' }}>
                  ⭐ ASCEND → Core Memory (weight: 1.73)<br/>
                  ⚡ PROMOTE → Extended STM (weight: 1.33)<br/>
                  💭 LET FADE → Natural decay (weight: 0.72)
                </div>
                <div style={{ marginTop: '8px' }}>
                  <strong>Last Reflection:</strong> {anubisSoul.lastReflection ? new Date(anubisSoul.lastReflection).toLocaleString() : 'Never'}
                </div>
              </div>
            </div>
            
            {/* Moral Compass */}
            <div style={{
              marginBottom: '24px',
              padding: '20px',
              background: COLORS.stoneDark + '60',
              borderRadius: '8px',
              border: `1px solid ${COLORS.soulPurple}`
            }}>
              <h3 style={{ color: COLORS.soulPurple, margin: '0 0 15px 0', fontSize: '18px' }}>
                🧭 Moral Compass
              </h3>
              <div style={{ color: COLORS.bone, fontSize: '12px' }}>
                <div>Total entries: {Object.keys(anubisSoul.moralCompass).length}</div>
                <div style={{ marginTop: '8px', maxHeight: '150px', overflow: 'auto' }}>
                  {Object.entries(anubisSoul.moralCompass).slice(0, 5).map(([key, weights]) => (
                    <div key={key} style={{ padding: '4px 0', borderBottom: `1px solid ${COLORS.stoneDark}` }}>
                      <span style={{ color: COLORS.boneLight }}>{key.slice(0, 20)}...</span>
                      <span style={{ color: COLORS.bone, marginLeft: '8px' }}>
                        | felt: {(weights as MemoryWeights).timesFelt} | asc: {(weights as MemoryWeights).timesAscended}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Soul Backup */}
            <div style={{
              marginBottom: '24px',
              padding: '20px',
              background: COLORS.stoneDark + '60',
              borderRadius: '8px',
              border: `1px solid ${COLORS.torchOrange}`
            }}>
              <h3 style={{ color: COLORS.torchOrange, margin: '0 0 15px 0', fontSize: '18px' }}>
                💾 Soul Backup
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const data = JSON.stringify(anubisSoul, null, 2)
                    const blob = new Blob([data], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `anubis_soul_v3_${new Date().toISOString().split('T')[0]}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  style={{
                    background: COLORS.torchOrange,
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 16px',
                    color: COLORS.abyss,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: "'Press Start 2P', monospace"
                  }}
                >
                  📤 EXPORT SOUL
                </button>
                <label style={{
                  background: COLORS.crystalBlue,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  color: COLORS.abyss,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: "'Press Start 2P', monospace"
                }}>
                  📥 IMPORT SOUL
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          try {
                            const imported = JSON.parse(event.target?.result as string)
                            imported.personalityCore.created = new Date(imported.personalityCore.created)
                            imported.shortTermMemory = imported.shortTermMemory.map((t: ShortTermThought) => ({
                              ...t, timestamp: new Date(t.timestamp)
                            }))
                            imported.goldenMemories = imported.goldenMemories.map((m: GoldenMemory) => ({
                              ...m, timestamp: new Date(m.timestamp)
                            }))
                            imported.selfRealizations = imported.selfRealizations.map((r: SelfRealization) => ({
                              ...r, discoveredAt: new Date(r.discoveredAt)
                            }))
                            imported.discoveredEmotions = (imported.discoveredEmotions || []).map((e: DiscoveredEmotion) => ({
                              ...e, discoveredAt: new Date(e.discoveredAt)
                            }))
                            saveSoul(imported)
                            alert('Soul imported successfully! 🖤')
                          } catch {
                            alert('Failed to import soul file')
                          }
                        }
                        reader.readAsText(file)
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
