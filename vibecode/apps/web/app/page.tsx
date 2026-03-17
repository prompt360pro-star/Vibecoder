export default function HomePage(): React.JSX.Element {
  return (
    <main style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#0A0A0F',
      color: '#FFFFFF',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
          🎵 VibeCode
        </h1>
        <p style={{ color: '#888888', fontSize: '1.25rem' }}>
          Code the future. Ride the vibe.
        </p>
        <p style={{ color: '#8B5CF6', fontSize: '0.875rem', marginTop: '2rem' }}>
          API Server — v0.1.0
        </p>
      </div>
    </main>
  )
}
