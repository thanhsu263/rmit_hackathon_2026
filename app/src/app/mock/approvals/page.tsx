'use client'
// MOCK mode stand-in for tide-console -> QEA Approvals: stewards file and authorize role changes (2 of 3).
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/client'
import { AUTH_MODE, CAST, ROLE_ADMIN, ROLE_DECRYPT, ROLE_ENCRYPT } from '@/lib/auth/config'

type CR = {
  id: string; kind: 'GRANT_ROLE' | 'REMOVE_ROLE'; role: string; target: string; proposedBy: string
  approvals: string[]; denials: string[]; status: string; createdAt: string; closedAt: string | null
}
type State = { roles: Record<string, string[]>; requests: CR[]; admins: string[]; quorum: number }

export default function MockApprovalsPage() {
  const { ready, authenticated, username, token, login } = useAuth()
  const [state, setState] = useState<State | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [kind, setKind] = useState<CR['kind']>('GRANT_ROLE')
  const [role, setRole] = useState(ROLE_DECRYPT)
  const [target, setTarget] = useState('researcher')

  const call = useCallback(async (body?: unknown) => {
    const res = await fetch('/api/mock/governance', {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
    return data
  }, [token])

  const load = useCallback(async () => {
    try { setState(await call()); setError('') } catch (e) { setError((e as Error).message) }
  }, [call])

  useEffect(() => { if (token) load() }, [token, load])

  const act = async (body: unknown) => {
    setBusy(true); setError('')
    try { await call(body); await load() } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  if (AUTH_MODE !== 'mock') return <main style={page}>In live mode, approvals happen in tide-console → QEA Approvals.</main>
  if (!ready) return <main style={page}>Loading…</main>
  if (!authenticated) return <main style={page}><button type="button" onClick={login}>Sign in</button></main>

  const isSteward = state?.roles[username]?.includes(ROLE_ADMIN) ?? false
  const pending = state?.requests.filter((r) => r.status === 'PENDING') ?? []
  const closed = state?.requests.filter((r) => r.status !== 'PENDING') ?? []

  return (
    <main style={page}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Simulated approvals</h1>
      <p style={{ color: '#444', marginTop: 0 }}>
        Stand-in for TideCloak&apos;s QEA Approvals. Any role change needs {state?.quorum ?? 2} of {state?.admins.length ?? 3} stewards.
        Signed in as <strong>{username}</strong>{isSteward ? ' (steward)' : ''}.
      </p>
      {error && <p role="alert" style={{ color: '#b00020' }}>{error}</p>}

      {isSteward && (
        <section style={box}>
          <h2 style={h2}>File a change</h2>
          <label>Action{' '}
            <select value={kind} onChange={(e) => setKind(e.target.value as CR['kind'])}>
              <option value="GRANT_ROLE">Grant role</option>
              <option value="REMOVE_ROLE">Remove role</option>
            </select>
          </label>{' '}
          <label>Role{' '}
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value={ROLE_DECRYPT}>{ROLE_DECRYPT}</option>
              <option value={ROLE_ENCRYPT}>{ROLE_ENCRYPT}</option>
            </select>
          </label>{' '}
          <label>User{' '}
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              {CAST.map((c) => <option key={c.username} value={c.username}>{c.username}</option>)}
            </select>
          </label>{' '}
          <button type="button" disabled={busy} onClick={() => act({ action: 'propose', kind, role, target })}>
            {busy ? 'Working…' : 'File change request'}
          </button>
        </section>
      )}

      <section style={box}>
        <h2 style={h2}>Pending ({pending.length})</h2>
        {pending.length === 0 && <p style={{ color: '#666' }}>No pending change requests.</p>}
        {pending.map((r) => (
          <div key={r.id} style={row}>
            <div><strong>{r.kind === 'GRANT_ROLE' ? 'Grant' : 'Remove'}</strong> {r.role} → {r.target}</div>
            <div style={{ color: '#555', fontSize: 14 }}>
              Filed by {r.proposedBy} · approvals {r.approvals.length}/{state?.quorum}: {r.approvals.join(', ')}
              {r.denials.length > 0 && ` · denied by ${r.denials.join(', ')}`}
            </div>
            {isSteward && !r.approvals.includes(username) && !r.denials.includes(username) && (
              <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                <button type="button" disabled={busy} onClick={() => act({ action: 'decide', id: r.id, approve: true })}>Authorize</button>
                <button type="button" disabled={busy} onClick={() => act({ action: 'decide', id: r.id, approve: false })}>Deny</button>
              </div>
            )}
          </div>
        ))}
      </section>

      <section style={box}>
        <h2 style={h2}>Current roles</h2>
        <ul>{state && Object.entries(state.roles).map(([u, rs]) => <li key={u}><strong>{u}</strong>: {rs.join(', ') || '—'}</li>)}</ul>
      </section>

      <section style={box}>
        <h2 style={h2}>History</h2>
        {closed.length === 0 && <p style={{ color: '#666' }}>Nothing committed or denied yet.</p>}
        {closed.map((r) => (
          <div key={r.id} style={row}>
            {r.status} · {r.kind === 'GRANT_ROLE' ? 'Grant' : 'Remove'} {r.role} → {r.target} · approved by {r.approvals.join(', ')}
            {r.closedAt && ` · ${new Date(r.closedAt).toLocaleTimeString()}`}
          </div>
        ))}
      </section>
    </main>
  )
}

const page: React.CSSProperties = { maxWidth: 820, margin: '32px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }
const box: React.CSSProperties = { border: '1px solid #ddd', borderRadius: 8, padding: 16, marginTop: 16 }
const h2: React.CSSProperties = { fontSize: 18, margin: '0 0 8px' }
const row: React.CSSProperties = { borderTop: '1px solid #eee', padding: '8px 0' }
