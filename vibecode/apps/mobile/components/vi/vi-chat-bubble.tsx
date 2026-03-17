import { View, StyleSheet, Text } from 'react-native'
import { COLORS } from '@vibecode/shared'

interface ViChatBubbleProps {
  role: 'USER' | 'ASSISTANT'
  content: string
  timestamp?: Date
}

// Split message content into text and code segments
function parseContent(text: string): Array<{ type: 'text' | 'code'; content: string; language?: string }> {
  const segments: Array<{ type: 'text' | 'code'; content: string; language?: string }> = []
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const textPart = text.slice(lastIndex, match.index).trim()
      if (textPart) segments.push({ type: 'text', content: textPart })
    }
    segments.push({ type: 'code', content: match[2]?.trim() ?? '', language: match[1] || 'code' })
    lastIndex = match.index + match[0].length
  }

  const remaining = text.slice(lastIndex).trim()
  if (remaining) segments.push({ type: 'text', content: remaining })

  return segments.length > 0 ? segments : [{ type: 'text', content: text }]
}

// Format timestamp as HH:MM
function formatTime(date?: Date): string {
  if (!date) return ''
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
}

export default function ViChatBubble({ role, content, timestamp }: ViChatBubbleProps) {
  const isVi = role === 'ASSISTANT'
  const segments = parseContent(content)

  return (
    <View style={[styles.wrapper, isVi ? styles.wrapperLeft : styles.wrapperRight]}>
      {isVi && (
        <Text style={styles.viLabel}>🤖 Vi:</Text>
      )}
      <View style={[styles.bubble, isVi ? styles.bubbleVi : styles.bubbleUser]}>
        {segments.map((seg, i) => {
          if (seg.type === 'code') {
            return (
              <View key={i} style={styles.codeBlock}>
                {seg.language ? (
                  <Text style={styles.codeLang}>{seg.language}</Text>
                ) : null}
                <Text style={styles.codeText}>{seg.content}</Text>
              </View>
            )
          }
          return (
            <Text key={i} style={[styles.text, isVi ? styles.textVi : styles.textUser]}>
              {seg.content}
            </Text>
          )
        })}
        {timestamp && (
          <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
    maxWidth: '88%',
  },
  wrapperLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  wrapperRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  viLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    marginLeft: 4,
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  bubbleVi: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderTopRightRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  textVi: {
    color: COLORS.textPrimary,
  },
  textUser: {
    color: COLORS.textPrimary,
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
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
})
