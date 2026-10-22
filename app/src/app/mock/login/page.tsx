'use client'
// MOCK mode sign-in: pick a demo account. In live mode sign-in goes through Tide.
import { CAST, AUTH_MODE } from '@/lib/auth/config'
import { mockSignIn } from '@/lib/auth/client'

export default function MockLoginPage() {
  if (AUTH_MODE !== 'mock') return <main style={{ padding: 24 }}>Simulated sign-in is only available in mock mode.</main>
  return (
    <main style={{ maxWidth: 480, margin: '48px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24 }}>Simulated sign-in</h1>
      <p style={{ color: '#444' }}>Choose a demo account. Each person in the demo should use their own browser profile.</p>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
        {CAST.map((c) => (
          <li key={c.username}>
            <button type="button" onClick={() => mockSignIn(c.username)}
              style={{ width: '100%', padding: '12px 16px', fontSize: 16, textAlign: 'left', cursor: 'pointer' }}>
              {c.title} <span style={{ color: '#666' }}>({c.username})</span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
