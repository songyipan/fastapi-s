const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL || `ws://${window.location.hostname}:8080`

type WSMessage = {
  type: 'chunk' | 'done' | 'error'
  content?: string
  message?: string
}

type MessageHandler = (data: WSMessage) => void

export function createChatWebSocket(): {
  connect: (token: string, productId: number) => void
  sendInitialize: () => void
  sendMessage: (content: string) => void
  close: () => void
  onMessage: (handler: MessageHandler) => void
} {
  let ws: WebSocket | null = null
  let messageHandler: MessageHandler | null = null
  let pendingInitialize = false

  function connect(token: string, productId: number) {
    if (ws) {
      ws.close()
    }
    ws = new WebSocket(`${WS_BASE_URL}/${productId}?token=${encodeURIComponent(token)}`)

    ws.onopen = () => {
      if (pendingInitialize) {
        send({ action: 'initialize' })
        pendingInitialize = false
      }
    }

    ws.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data)
        messageHandler?.(data)
      } catch {
        console.error('WebSocket message parse error:', event.data)
      }
    }

    ws.onerror = (err) => {
      console.error('WebSocket error:', err)
    }

    ws.onclose = () => {
      ws = null
    }
  }

  function send(data: unknown) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
    }
  }

  function sendInitialize() {
    if (ws?.readyState === WebSocket.OPEN) {
      send({ action: 'initialize' })
    } else {
      pendingInitialize = true
    }
  }

  function sendMessage(content: string) {
    send({ action: 'send_message', content })
  }

  function close() {
    ws?.close()
    ws = null
    pendingInitialize = false
  }

  function onMessage(handler: MessageHandler) {
    messageHandler = handler
  }

  return { connect, sendInitialize, sendMessage, close, onMessage }
}
