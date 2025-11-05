import { useEffect, useState } from 'react';
import { contentService } from './services/content.service';
import type { Content } from './types';

function App() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 App mounted - Starting API test...');
    console.log('🔍 Current timestamp:', new Date().toISOString());

    const fetchData = async () => {
      try {
        console.log('⏳ Calling contentService.getFeaturedContent()...');
        console.log('🔗 API URL:', 'http://localhost:3001/api/content/featured');
        const data = await contentService.getFeaturedContent();
        console.log('✅ SUCCESS! Received data:', data);
        console.log('📊 Number of items:', data.length);
        setContents(data);
      } catch (err: any) {
        console.error('💥 FETCH FAILED:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          config: err.config,
        });
        setError(err.message || 'Failed to fetch content');
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure console is ready
    setTimeout(fetchData, 1000);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        color: 'white', 
        padding: '50px',
        fontSize: '24px',
        textAlign: 'center',
        minHeight: '100vh',
        background: '#000'
      }}>
        ⏳ Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        color: 'white', 
        padding: '50px',
        minHeight: '100vh',
        background: '#000'
      }}>
        <h1 style={{ color: '#e50914', fontSize: '32px' }}>❌ Error</h1>
        <p style={{ fontSize: '18px', marginTop: '20px' }}>{error}</p>
        <p style={{ fontSize: '14px', color: '#999', marginTop: '20px' }}>
          Open Browser Console (F12) for more details
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '50px', 
      color: 'white',
      minHeight: '100vh',
      background: '#000'
    }}>
      <h1 style={{ fontSize: '36px', marginBottom: '30px', color: '#e50914' }}>
        ✅ API Connection Test - SUCCESS!
      </h1>
      
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
        Featured Content ({contents.length} items):
      </h2>
      
      <div style={{ 
        display: 'grid',
        gap: '20px',
        maxWidth: '1200px'
      }}>
        {contents.map((content) => (
          <div 
            key={content.id}
            style={{
              background: '#1a1a1a',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #333'
            }}
          >
            <h3 style={{ 
              margin: '0 0 10px 0', 
              color: '#e50914',
              fontSize: '20px'
            }}>
              {content.title}
            </h3>
            <p style={{ 
              margin: '0', 
              color: '#999', 
              fontSize: '14px' 
            }}>
              {content.type} • {content.year} • {content.genre.join(', ')}
            </p>
            {content.description && (
              <p style={{ 
                marginTop: '10px', 
                color: '#ccc',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {content.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
