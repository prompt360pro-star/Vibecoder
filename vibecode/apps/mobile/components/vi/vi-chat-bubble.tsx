import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { COLORS } from '@vibecode/shared'
import { MOTION } from '../../lib/animations'
import ViAvatar from './vi-avatar'

interface ViChatBubbleProps {
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }
  isLatest: boolean
}

interface ParsedSegment {
  type: 'text' | 'code'
  content: string
  language?: string
}

function parseContent(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = []
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const textPart = text.slice(lastIndex, match.index).trim()
      if (textPart) {
        segments.push({ type: 'text', content: textPart })
      }
    }

    segments.push({
      type: 'code',
      content: match[2]?.trim() ?? '',
      language: match[1] || 'code',
    })

    lastIndex = match.index + match[0].length
  }

  const remaining = text.slice(lastIndex).trim()
  if (remaining) {
    segments.push({ type: 'text', content: remaining })
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: text }]
}

function formatTime(date: Date): string {
  if (!date) return ''
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
}

export default function ViChatBubble({ message, isLatest }: ViChatBubbleProps) {
  const { role, content, timestamp } = message
  const isVi = role === 'assistant'
  const segments = parseContent(content)
  const translateX = useSharedValue(isLatest ? (isVi ? -40 : 40) : 0)
  const opacity = useSharedValue(isLatest ? 0 : 1)
  const scale = useSharedValue(isLatest ? 0.92 : 1)

  useEffect(() => {
    if (!isLatest) return

    translateX.value = withSpring(0, MOTION.spring.gentle)
    scale.value = withSpring(1, MOTION.spring.gentle)
    opacity.value = withTiming(1, { duration: 220 })
  }, [isLatest, opacity, scale, translateX])

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }))

  if (isVi) {
    return (
      <Animated.View style={[styles.wrapperVi, bubbleStyle]}>
        <ViAvatar size={32} isSpeaking={isLatest} />
        <View style={styles.bubbleVi}>
          {segments.map((segment, index) => {
            if (segment.type === 'code') {
              return (
                <View key={`${message.id}-code-${index}`} style={styles.codeBlock}>
                  {segment.language ? <Text style={styles.codeLang}>{segment.language}</Text> : null}
                  <Text style={styles.codeText}>{segment.content}</Text>
                </View>
              )
            }

            return (
              <Text key={`${message.id}-text-${index}`} style={styles.textVi}>
                {segment.content}
              </Text>
            )
          })}

          <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
        </View>
      </Animated.View>
    )
  }

  return (
    <Animated.View style={[styles.wrapperUser, bubbleStyle]}>
      <View style={styles.bubbleUser}>
        {segments.map((segment, index) => {
          if (segment.type === 'code') {
            return (
              <View key={`${message.id}-code-${index}`} style={styles.codeBlock}>
                {segment.language ? <Text style={styles.codeLang}>{segment.language}</Text> : null}
                <Text style={styles.codeText}>{segment.content}</Text>
              </View>
            )
          }

          return (
            <Text key={`${message.id}-text-${index}`} style={styles.textUser}>
              {segment.content}
            </Text>
          )
        })}

        <Text style={styles.timestampUser}>{formatTime(timestamp)}</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapperVi: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-start',
    marginVertical: 6,
    maxWidth: '85%',
    gap: 8,
  },
  wrapperUser: {
    alignSelf: 'flex-end',
    marginVertical: 6,
    maxWidth: '85%',
  },
  bubbleVi: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 12,
    gap: 8,
    flex: 1,
  },
  bubbleUser: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 12,
    gap: 8,
  },
  textVi: {
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 23,
  },
  textUser: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  codeBlock: {
    backgroundColor: COLORS.bgCode,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    marginVertical: 4,
  },
  codeLang: {
    color: COLORS.accentPurple,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  timestamp: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  timestampUser: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
})
