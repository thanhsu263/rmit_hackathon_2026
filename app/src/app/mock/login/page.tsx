'use client'
// MOCK mode sign-in: pick a demo account. In live mode sign-in goes through Tide.
import { CAST, AUTH_MODE } from '@/lib/auth/config'
import { mockSignIn } from '@/lib/auth/client'

const ROLE_NOTE: Record<string, string> = {
  diglead: 'Seals sites · steward',
  heritage: 'Steward',
  custodian: 'Steward',
  researcher: 'Sees the 50 km blur until approved',
}

export default function MockLoginPage() {
  if (AUTH_MODE !== 'mock') return <main className="container" style={{ paddingTop: 64 }}>Simulated sign-in is only available in mock mode.</main>
  return (
    <main className="container rise-in" style={{ maxWidth: 560, paddingTop: 24 }}>
      <span className="eyebrow">Simulated sign-in</span>
      <h1 style={{ margin: '10px 0 12px', fontSize: 'clamp(2.2rem, 5vw, 3rem)' }}>Who is at the desk?</h1>
      <p style={{ color: 'var(--ink-2)', marginBottom: 28 }}>Choose a demo account. Each person in the demo uses their own browser profile.</p>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>
        {CAST.map((c) => (
          <li key={c.username}>
            <button
              type="button"
              onClick={() => mockSignIn(c.username)}
              className="vault-card"
              style={{ width: '100%', padding: '16px 20px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, font: 'inherit' }}
            >
              <span>
                <span style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--ink)' }}>{c.title}</span>
                <span style={{ fontSize: '0.84rem', color: 'var(--ink-3)' }}>{ROLE_NOTE[c.username]}</span>
              </span>
              <span className="mono" style={{ color: 'var(--ink-3)', fontSize: '0.84rem' }}>({c.username}) →</span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
