const API_BASE = import.meta.env.VITE_API_URL || '/api'
const TIMEOUT = 4000

async function request(path, { method = 'GET', body } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

export async function checkApi() {
  try {
    const data = await request('/health')
    return data?.status === 'ok'
  } catch {
    return false
  }
}

/**
 * Call the Flask REST API when it is reachable, otherwise fall back to the
 * local calculation module so the app keeps working offline.
 */
export async function callWithFallback(path, payload, localFallback) {
  try {
    return { source: 'api', data: await request(path, { method: 'POST', body: payload }) }
  } catch {
    return { source: 'local', data: await localFallback() }
  }
}

export const api = {
  health: () => request('/health'),
  pushState: (state) => request('/state', { method: 'POST', body: { state } }),
  pullState: () => request('/state'),
  assistant: (question, state) => request('/assistant/ask', { method: 'POST', body: { question, state } }),
  confidence: (state) => request('/insights/confidence', { method: 'POST', body: { state } }),
}
