const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
const EXPO_BATCH_LIMIT = 100
const BATCH_DELAY_MS = 100

export type PushMessage = {
  to: string
  title: string
  body: string
  data?: Record<string, string>
  sound?: 'default' | null
  badge?: number
}

export type PushResult = {
  userId: string
  success: boolean
  error?: string
}

interface ExpoPushTicket {
  status?: 'ok' | 'error'
  message?: string
  details?: {
    error?: string
  }
}

interface ExpoPushResponse {
  data?: ExpoPushTicket | ExpoPushTicket[]
  errors?: Array<{ message?: string }>
}

const getResultUserId = (message: PushMessage): string => {
  return message.data?.userId ?? message.to
}

const sleep = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function sendPushNotification(message: PushMessage): Promise<boolean> {
  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      return false
    }

    const payload = (await response.json()) as ExpoPushResponse
    const ticket = Array.isArray(payload.data) ? payload.data[0] : payload.data

    return ticket?.status === 'ok'
  } catch {
    return false
  }
}

export async function sendBatchNotifications(messages: PushMessage[]): Promise<PushResult[]> {
  const results: PushResult[] = []

  for (let index = 0; index < messages.length; index += EXPO_BATCH_LIMIT) {
    const chunk = messages.slice(index, index + EXPO_BATCH_LIMIT)

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(chunk),
      })

      if (!response.ok) {
        results.push(
          ...chunk.map((message) => ({
            userId: getResultUserId(message),
            success: false,
            error: `HTTP_${response.status}`,
          })),
        )
      } else {
        const payload = (await response.json()) as ExpoPushResponse
        const tickets = Array.isArray(payload.data) ? payload.data : []
        const batchError = payload.errors?.[0]?.message

        results.push(
          ...chunk.map((message, ticketIndex) => {
            const ticket = tickets[ticketIndex]
            const success = ticket?.status === 'ok'

            return {
              userId: getResultUserId(message),
              success,
              error:
                success
                  ? undefined
                  : ticket?.details?.error ?? ticket?.message ?? batchError ?? 'UNKNOWN_ERROR',
            }
          }),
        )
      }
    } catch {
      results.push(
        ...chunk.map((message) => ({
          userId: getResultUserId(message),
          success: false,
          error: 'NETWORK_ERROR',
        })),
      )
    }

    if (index + EXPO_BATCH_LIMIT < messages.length) {
      await sleep(BATCH_DELAY_MS)
    }
  }

  return results
}
