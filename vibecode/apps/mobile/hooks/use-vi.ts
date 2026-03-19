import { useState, useCallback } from 'react'
import { api, ApiError } from '../services/api'
import { ViMode } from '@vibecode/shared'

export interface ViMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: string
}

interface UseViReturn {
  messages: ViMessage[]
  conversationId: string | null
  isLoading: boolean
  error: string | null
  dailyCount: number
  sendMessage: (content: string, mode: ViMode) => Promise<void>
  clearConversation: () => void
}

export function useVi(): UseViReturn {
  const [messages, setMessages] = useState<ViMessage[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dailyCount, setDailyCount] = useState(0) // TODO: Puxar do profile do backend futuramente

  const sendMessage = useCallback(async (content: string, mode: ViMode) => {
    setError(null)

    const userMessage: ViMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await api.post<{
        message: string
        role: string
        model: string
        tokensUsed: number
        conversationId: string
      }>('/vi/chat', { content, mode, conversationId })

      if (response.conversationId) {
        setConversationId(response.conversationId)
      }

      const assistantMessage: ViMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        model: response.model,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setDailyCount((prev) => prev + 1)
    } catch (err) {
      // Revert optimistic update on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
      
      let errorText = 'Ocorreu um erro ao contactar o Vi.'
      if (err instanceof ApiError) {
        if (err.code === 'LIMIT_REACHED') {
          errorText = 'LIMIT_REACHED'
        } else {
          errorText = err.message || errorText
        }
      }
      setError(errorText)
    } finally {
      setIsLoading(false)
    }
  }, [conversationId])

  const clearConversation = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setError(null)
  }, [])

  return {
    messages,
    conversationId,
    isLoading,
    error,
    dailyCount,
    sendMessage,
    clearConversation,
  }
}
