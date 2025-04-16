const baseUrl = import.meta.env.VITE_API_BASE_URL

export async function fetchHealthStatus() {
  try {
    const start = performance.now()
    const res = await fetch(`${baseUrl}/api/health`)
    const data = await res.json()
    const duration = performance.now() - start

    return {
      status: data.status || 'unknown',
      serverTime: data.serverTime,
      responseTime: duration
    }
  } catch (err) {
    return {
      status: 'error',
      serverTime: null,
      responseTime: null
    }
  }
}
