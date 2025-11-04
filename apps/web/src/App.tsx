import { useState, useEffect } from 'react'
import { contentService } from './services/content.service'
import type { Content } from './types'

function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<Content[]>([])

  useEffect(() => {
    const fetchFeaturedContent = async () => {
      try {
        console.log('[App] Fetching featured content...')
        setLoading(true)
        setError(null)
        const featuredContent = await contentService.getFeaturedContent()
        console.log('[App] Fetch success. Items:', featuredContent.length)
        setContent(featuredContent)
      } catch (err) {
        console.error('[App] Fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch content')
      } finally {
        console.log('[App] Fetch completed')
        setLoading(false)
      }
    }

    fetchFeaturedContent()
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f1115',
        color: '#ffffff',
        padding: '24px',
        fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
      }}
    >
      <h1 style={{ marginBottom: 12 }}>API Connection Test</h1>
      {loading && <p style={{ opacity: 0.85 }}>Loading...</p>}
      {error && (
        <p style={{ color: '#ff6b6b' }}>Error: {error}</p>
      )}
      {!loading && !error && (
        <div>
          <h2 style={{ marginTop: 16, marginBottom: 8 }}>Featured Content:</h2>
          {content.length === 0 ? (
            <p style={{ opacity: 0.85 }}>No featured content found</p>
          ) : (
            <ul style={{ lineHeight: 1.8 }}>
              {content.map((item) => (
                <li key={item.id}>{item.title}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default App
